import { prisma } from "@/lib/db";
import { TOP_SERVICE_CONTENT } from "@/content/top-services";
import { classifyServiceIssue } from "./classifyServiceIssue";
import type {
  ServiceDashboardData,
  SurfaceSnapshot,
  IncidentSummary,
} from "./types";

export async function getServiceDashboard(
  slug: string
): Promise<ServiceDashboardData | null> {
  // 1. Load service basic info
  const service = await prisma.service.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      websiteUrl: true,
      iconUrl: true,
    },
  });
  if (!service) return null;

  // 2. Latest observation per surface (LATERAL JOIN — 1 row per surface)
  const surfacesRaw = await prisma.$queryRaw<
    Array<{
      surfaceId: string;
      surfaceSlug: string;
      displayName: string;
      status: string | null;
      latencyMs: number | null;
      httpStatus: number | null;
      confidence: string | null;
      observedAt: Date | null;
    }>
  >`
    SELECT
      ss.id            AS "surfaceId",
      ss.slug          AS "surfaceSlug",
      ss."displayName",
      latest.status,
      latest."latencyMs",
      latest."httpStatus",
      latest.confidence,
      latest."observedAt"
    FROM "ServiceSurface" ss
    LEFT JOIN LATERAL (
      SELECT o.status, o."latencyMs", o."httpStatus", o.confidence, o."observedAt"
      FROM "Observation" o
      WHERE o."serviceSurfaceId" = ss.id
      ORDER BY o."observedAt" DESC
      LIMIT 1
    ) latest ON true
    WHERE ss."serviceId" = ${service.id}
      AND ss."isEnabled" = true
    ORDER BY ss.slug
  `;

  // 3. p50 / p95 latency per surface over 24h (single query, no window function)
  const latencyStats = await prisma.$queryRaw<
    Array<{
      surfaceId: string;
      p50: number | null;
      p95: number | null;
    }>
  >`
    SELECT
      ss.id AS "surfaceId",
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY o."latencyMs") AS p50,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY o."latencyMs") AS p95
    FROM "ServiceSurface" ss
    LEFT JOIN "Observation" o
      ON o."serviceSurfaceId" = ss.id
      AND o."observedAt" >= NOW() - INTERVAL '24 hours'
      AND o."latencyMs" IS NOT NULL
    WHERE ss."serviceId" = ${service.id}
      AND ss."isEnabled" = true
    GROUP BY ss.id
  `;

  const latencyMap = new Map(latencyStats.map((l) => [l.surfaceId, l]));

  // Build typed surface snapshots
  const surfaces: SurfaceSnapshot[] = surfacesRaw.map((s) => {
    const stats = latencyMap.get(s.surfaceId);
    return {
      surfaceId: s.surfaceId,
      surfaceSlug: s.surfaceSlug,
      displayName: s.displayName,
      status: (s.status as SurfaceSnapshot["status"]) ?? "UNKNOWN",
      latestHttpStatus: s.httpStatus ?? null,
      latestLatencyMs: s.latencyMs ?? null,
      confidence: s.confidence ?? null,
      lastObservedAt: s.observedAt ?? null,
      p50Latency24h: stats?.p50 != null ? Math.round(Number(stats.p50)) : null,
      p95Latency24h: stats?.p95 != null ? Math.round(Number(stats.p95)) : null,
    };
  });

  // 4. 24h uptime % (OPERATIONAL obs / total obs across all surfaces)
  // Uses index: @@index([serviceSurfaceId, observedAt(sort: Desc)])
  const uptimeRaw = await prisma.$queryRaw<
    [{ total: bigint; operational: bigint }]
  >`
    SELECT
      COUNT(*)                                             AS total,
      COUNT(*) FILTER (WHERE o.status = 'OPERATIONAL')    AS operational
    FROM "Observation" o
    INNER JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
    WHERE ss."serviceId" = ${service.id}
      AND o."observedAt" >= NOW() - INTERVAL '24 hours'
  `;

  const { total, operational } = uptimeRaw[0];
  const uptime24h =
    total > 0n
      ? Number((operational * 10000n) / total) / 100
      : null;

  // 5. Incidents last 30 days — low cardinality table, findMany is fine
  const incidentsRaw = await prisma.incident.findMany({
    where: {
      serviceId: service.id,
      startedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { startedAt: "desc" },
    take: 10,
  });

  const incidents30d: IncidentSummary[] = incidentsRaw.map((inc) => ({
    id: inc.id,
    title: inc.title,
    status: inc.status,
    severity: inc.severity,
    startedAt: inc.startedAt,
    resolvedAt: inc.resolvedAt ?? null,
    duration: inc.resolvedAt
      ? Math.round(
          (inc.resolvedAt.getTime() - inc.startedAt.getTime()) / 60_000
        )
      : null,
    summary: inc.summary ?? null,
  }));

  // 6. Community reports — count queries hit the composite index
  //    @@index([serviceId, createdAt(sort: Desc)]) — safe
  const [reports24hCount, reports2hCount] = await Promise.all([
    prisma.communityReport.count({
      where: {
        serviceId: service.id,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.communityReport.count({
      where: {
        serviceId: service.id,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      },
    }),
  ]);

  // Reports by type (24h) — groupBy on indexed column, low cardinality
  const reportsByType = await prisma.communityReport.groupBy({
    by: ["reportType"],
    where: {
      serviceId: service.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    _count: true,
  });

  // 5 most recent comments (visible, non-spam, non-null comment)
  const recentComments = await prisma.communityReport.findMany({
    where: {
      serviceId: service.id,
      comment: { not: null },
      isVisible: true,
      isSpam: false,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      reportType: true,
      comment: true,
      createdAt: true,
    },
  });

  // 7. Classify scope
  const hasOpenIncident = incidentsRaw.some((i) => i.status !== "RESOLVED");
  const diagnosis = classifyServiceIssue({
    surfaces,
    reports24h: reports24hCount,
    reports2h: reports2hCount,
    hasOpenIncident,
  });

  // 8. Overall status = worst of surface statuses
  const STATUS_PRIORITY: Record<SurfaceSnapshot["status"], number> = {
    OUTAGE: 3,
    DEGRADED: 2,
    UNKNOWN: 1,
    OPERATIONAL: 0,
  };
  const overallStatus = surfaces.reduce<SurfaceSnapshot["status"]>(
    (worst, s) =>
      STATUS_PRIORITY[s.status] > STATUS_PRIORITY[worst] ? s.status : worst,
    "OPERATIONAL"
  );

  // 9. Top 50 editorial content (static, no DB query)
  const topContent = TOP_SERVICE_CONTENT[slug] ?? null;

  return {
    service: {
      ...service,
      category: service.category as string,
    },
    overallStatus,
    diagnosis,
    surfaces,
    uptime24h,
    incidents30d,
    reportSummary: {
      total24h: reports24hCount,
      byType: Object.fromEntries(
        reportsByType.map((r) => [r.reportType, r._count])
      ),
      bySurface: {},
      recentComments: recentComments.map((c) => ({
        pseudo: "Anonymous",
        content: c.comment!,
        reportType: c.reportType,
        createdAt: c.createdAt,
      })),
    },
    topContent,
  };
}
