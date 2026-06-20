import { prisma } from "@/lib/db";
import { TOP_SERVICE_CONTENT } from "@/content/top-services";
import { classifyServiceIssue } from "./classifyServiceIssue";
import { getServiceBySlug, getReports24hCount } from "@/lib/service-queries";
import { isNonMeasurableCapability } from "@/lib/monitoring/probeValidity";
import type {
  ServiceDashboardData,
  SurfaceSnapshot,
  IncidentSummary,
} from "./types";

// ── Public status derivation — respects monitoringCapability ─────────────────

type PublicStatus = {
  overallStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";
  headline: "MONITORING_LIMITED" | "STATUS_UNCERTAIN" | null;
};

const STATUS_PRIORITY_VALID: Record<string, number> = {
  OUTAGE: 3, DEGRADED: 2, OPERATIONAL: 0,
};

function derivePublicStatus(
  monitoringCapability: string,
  surfaces: SurfaceSnapshot[],
  freshOfficialStatus: string | null,
): PublicStatus {
  // 1. Non-measurable capabilities → never Degraded/Outage from our probes
  if (monitoringCapability === "BLOCKED_FROM_PROBES") {
    return { overallStatus: "UNKNOWN", headline: "MONITORING_LIMITED" };
  }
  if (monitoringCapability === "UNVERIFIABLE") {
    return { overallStatus: "UNKNOWN", headline: "STATUS_UNCERTAIN" };
  }

  // 2. Fresh Atlassian signal (≤ 30h) primes over HTTP probe failures
  if (monitoringCapability === "OFFICIAL_STATUS_API" && freshOfficialStatus !== null) {
    return {
      overallStatus: freshOfficialStatus as "OPERATIONAL" | "DEGRADED" | "OUTAGE",
      headline: null,
    };
  }

  // 3. Worst-of valid observations only (UNKNOWN excluded from aggregate)
  const validSurfaces = surfaces.filter(
    (s) => s.status === "OPERATIONAL" || s.status === "DEGRADED" || s.status === "OUTAGE"
  );
  if (validSurfaces.length === 0) {
    return { overallStatus: "UNKNOWN", headline: "STATUS_UNCERTAIN" };
  }
  const worstStatus = validSurfaces.reduce<string>(
    (worst, s) =>
      STATUS_PRIORITY_VALID[s.status] > STATUS_PRIORITY_VALID[worst] ? s.status : worst,
    "OPERATIONAL"
  );
  return {
    overallStatus: worstStatus as "OPERATIONAL" | "DEGRADED" | "OUTAGE",
    headline: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function getServiceDashboard(
  slug: string
): Promise<ServiceDashboardData | null> {
  // 1. Load service basic info (cached — shared with generateMetadata in the same request)
  const service = await getServiceBySlug(slug);
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
      officialStatus: string | null;
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
      latest."observedAt",
      latest."officialStatus"::text
    FROM "ServiceSurface" ss
    LEFT JOIN LATERAL (
      SELECT o.status, o."latencyMs", o."httpStatus", o.confidence, o."observedAt",
             o."officialStatus"
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
      AND o."latencyMs" < 5000
      AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN
           ('BLOCKED','RATE_LIMITED','TIMEOUT','DNS_FAIL','CONNECTION_FAIL','TLS_ERROR','UNKNOWN_FAILURE','PARSE_ERROR'))
    WHERE ss."serviceId" = ${service.id}
      AND ss."isEnabled" = true
    GROUP BY ss.id
  `;

  const latencyMap = new Map(latencyStats.map((l) => [l.surfaceId, l]));

  // Declare monCap early — used for surface overrides and uptime guard below
  const monCap = service.monitoringCapability as string;

  // Build typed surface snapshots — override status/latency for non-measurable services
  const isNonMeasurable = isNonMeasurableCapability(monCap);
  const surfaces: SurfaceSnapshot[] = surfacesRaw.map((s) => {
    const stats = latencyMap.get(s.surfaceId);
    return {
      surfaceId: s.surfaceId,
      surfaceSlug: s.surfaceSlug,
      displayName: s.displayName,
      status: isNonMeasurable ? "UNKNOWN" : ((s.status as SurfaceSnapshot["status"]) ?? "UNKNOWN"),
      latestHttpStatus: s.httpStatus ?? null,
      latestLatencyMs: isNonMeasurable ? null : (s.latencyMs ?? null),
      confidence: s.confidence ?? null,
      lastObservedAt: s.observedAt ?? null,
      p50Latency24h: isNonMeasurable ? null : (stats?.p50 != null ? Math.round(Number(stats.p50)) : null),
      p95Latency24h: isNonMeasurable ? null : (stats?.p95 != null ? Math.round(Number(stats.p95)) : null),
      officialStatus: s.officialStatus ?? null,
    };
  });

  // 4. 24h uptime % — null for non-measurable services; filtered denominator for others.
  // Excludes from denominator any observation from a probe that was blocked/timed out/unknown
  // (probeResult IS NULL = pre-PR6 observation, no probeResult stored → kept in denominator).
  let uptime24h: number | null = null;
  if (monCap !== "BLOCKED_FROM_PROBES" && monCap !== "UNVERIFIABLE") {
    const uptimeRaw = await prisma.$queryRaw<[{ total: bigint; operational: bigint }]>`
      SELECT
        COUNT(*) FILTER (
          WHERE o.status IN ('OPERATIONAL','DEGRADED','OUTAGE')
            AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN
                 ('BLOCKED','RATE_LIMITED','TIMEOUT','UNKNOWN_FAILURE','PARSE_ERROR'))
        ) AS total,
        COUNT(*) FILTER (
          WHERE o.status = 'OPERATIONAL'
            AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN
                 ('BLOCKED','RATE_LIMITED','TIMEOUT','UNKNOWN_FAILURE','PARSE_ERROR'))
        ) AS operational
      FROM "Observation" o
      INNER JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
      WHERE ss."serviceId" = ${service.id}
        AND o."observedAt" >= NOW() - INTERVAL '24 hours'
    `;
    const { total, operational } = uptimeRaw[0];
    uptime24h = total > 0n ? Number((operational * 10000n) / total) / 100 : null;
  }

  // 5. Incidents last 30 days — low cardinality table, findMany is fine
  const incidentsRaw = await prisma.incident.findMany({
    where: {
      serviceId: service.id,
      isFalsePositive: false,
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
    getReports24hCount(service.id), // cached — shared with generateMetadata in the same request
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

  // 7. Classify scope (must run before overallStatus)
  const hasOpenIncident = incidentsRaw.some((i) => i.status !== "RESOLVED");
  const diagnosis = classifyServiceIssue({
    surfaces,
    reports24h: reports24hCount,
    reports2h: reports2hCount,
    hasOpenIncident,
    monitoringCapability: monCap,
  });

  // 8. Overall status — respects monitoringCapability + fresh Atlassian signal
  const THIRTY_HOURS_MS = 30 * 60 * 60 * 1000;
  const freshOfficialStatus =
    surfaces.find(
      (s) =>
        s.officialStatus !== null &&
        s.lastObservedAt !== null &&
        Date.now() - s.lastObservedAt.getTime() < THIRTY_HOURS_MS
    )?.officialStatus ?? null;

  const { overallStatus: probeStatus, headline } = derivePublicStatus(
    monCap,
    surfaces,
    freshOfficialStatus,
  );

  let overallStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | "REPORTED_ISSUES" = probeStatus;
  if (
    probeStatus === "OPERATIONAL" &&
    (diagnosis.scope === "global" || diagnosis.scope === "partial") &&
    (diagnosis.confidence === "HIGH" ||
      (diagnosis.confidence === "MEDIUM" && reports2hCount >= 5))
  ) {
    overallStatus = "REPORTED_ISSUES";
  }

  // 9. Top 50 editorial content (static, no DB query)
  const topContent = TOP_SERVICE_CONTENT[slug] ?? null;

  return {
    service: {
      ...service,
      category: service.category as string,
      monitoringCapability: monCap,
      lifecycleStatus: service.lifecycleStatus as string,
    },
    overallStatus,
    headline,
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
