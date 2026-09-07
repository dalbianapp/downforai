import { prisma } from "@/lib/db";
import { isNonMeasurableCapability, isValidForPublicLatency, AVAILABILITY_NON_MEASURABLE } from "@/lib/monitoring/probeValidity";
import { communitySignalOf } from "@/lib/status/resolveServiceStatus";
import { resolveDisplayStatus } from "@/lib/status/deriveTechnicalStatus";
import { monitoringConfidence } from "@/components/service/_statusConfig";
import { badgeFromCapability } from "@/lib/badges";
import { computeSurfacePerformance, aggregateServicePerformance, computePerformanceScore } from "@/lib/performance";
import type { ServiceSnapshotJson, IndexServiceRow, IndexRecentIncident, IndexSnapshotJson } from "./types";
import type { StatusExplanation } from "@/lib/service-page/types";

// Builds every service's status snapshot + the lightweight home/category index
// in a fixed, small number of GROUPED queries (not one query per service) —
// this is what runs once an hour from src/app/api/cron/snapshot instead of
// each page regeneration querying Prisma on its own. See the Sept 2026 Neon
// snapshot mission in memory for why this file exists.

type SurfaceRow = {
  serviceId: string;
  surfaceId: string;
  surfaceSlug: string;
  displayName: string;
  observedAt: Date | null;
  status: string | null;
  latencyMs: number | null;
  httpStatus: number | null;
  confidence: string | null;
  probeResult: string | null;
  officialStatus: string | null;
};

type IncidentRow = {
  id: string;
  serviceId: string;
  title: string;
  status: string;
  severity: string;
  startedAt: Date;
  resolvedAt: Date | null;
  summary: string | null;
};

type CommentRow = {
  serviceId: string;
  reportType: string;
  comment: string;
  createdAt: Date;
};

type SurfaceSnapshotStatus = "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";

const SIGNAL_SOURCE_LABEL: Record<string, string> = {
  OFFICIAL_STATUS_API: "official status API",
  OFFICIAL_STATUS_PAGE: "official status page",
  BASIC_PUBLIC_SURFACE: "public surface check",
  BLOCKED_FROM_PROBES: "blocked from probes",
  UNVERIFIABLE: "unverifiable",
};

function percentile(sortedAsc: number[], p: number): number | null {
  if (sortedAsc.length === 0) return null;
  const idx = Math.min(sortedAsc.length - 1, Math.floor(p * sortedAsc.length));
  return Math.round(sortedAsc[idx]);
}

export async function buildSnapshots(): Promise<{
  services: Map<string, ServiceSnapshotJson>; // keyed by slug
  index: IndexSnapshotJson;
}> {
  const generatedAt = new Date().toISOString();

  // 1) Every service's base row (one query, ~800 rows).
  const services = await prisma.service.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      websiteUrl: true,
      iconUrl: true,
      monitoringCapability: true,
      lifecycleStatus: true,
      communityStatus: true,
      communityConfidence: true,
      communityReportsWindow: true,
      communitySignalAt: true,
    },
  });

  // 2) Every enabled surface's last 24 observations, ALL services in one
  // query (LATERAL per surface — same shape the home page already used).
  // Observations are written hourly by check-status, so "last 24 rows" is
  // effectively "last 24h" without needing a separate time-windowed query.
  const surfaceRows = await prisma.$queryRaw<SurfaceRow[]>`
    SELECT
      ss."serviceId"   AS "serviceId",
      ss.id            AS "surfaceId",
      ss.slug          AS "surfaceSlug",
      ss."displayName",
      o."observedAt",
      o.status,
      o."latencyMs",
      o."httpStatus",
      o.confidence,
      o."probeResult"::text     AS "probeResult",
      o."officialStatus"::text  AS "officialStatus"
    FROM "ServiceSurface" ss
    LEFT JOIN LATERAL (
      SELECT "observedAt", status, "latencyMs", "httpStatus", confidence, "probeResult", "officialStatus"
      FROM "Observation"
      WHERE "serviceSurfaceId" = ss.id
      ORDER BY "observedAt" DESC
      LIMIT 24
    ) o ON true
    WHERE ss."isEnabled" = true
    ORDER BY ss."serviceId", ss.slug, o."observedAt" DESC NULLS LAST
  `;

  // 3) Incidents from the last 30 days, capped at 15 most recent PER service
  // via a window function (covers both the 10-item timeline and "last
  // resolved incident" lookups without a second per-service query).
  const incidentRows = await prisma.$queryRaw<IncidentRow[]>`
    SELECT id, "serviceId", title, status::text AS status, severity::text AS severity, "startedAt", "resolvedAt", summary
    FROM (
      SELECT i.id, i."serviceId", i.title, i.status, i.severity, i."startedAt", i."resolvedAt", i.summary,
             ROW_NUMBER() OVER (PARTITION BY i."serviceId" ORDER BY i."startedAt" DESC) AS rn
      FROM "Incident" i
      WHERE i."isFalsePositive" = false AND i."startedAt" >= NOW() - INTERVAL '30 days'
    ) x
    WHERE rn <= 15
  `;

  // 4) The 5 site-wide most recent incidents (any service) for the home page.
  const recentIncidentsRaw = await prisma.incident.findMany({
    where: { isFalsePositive: false },
    include: { service: { select: { name: true } } },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  // 5) Community reports in the last 24h — total per service.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const reportCounts = await prisma.communityReport.groupBy({
    by: ["serviceId"],
    where: { createdAt: { gte: dayAgo } },
    _count: { serviceId: true },
  });

  // 6) Community reports in the last 24h — grouped by type, per service.
  const reportsByTypeRaw = await prisma.communityReport.groupBy({
    by: ["serviceId", "reportType"],
    where: { createdAt: { gte: dayAgo } },
    _count: true,
  });

  // 7) 5 most recent visible, non-spam, commented reports PER service
  // (all-time, no window — matches the old per-page query exactly).
  const commentRows = await prisma.$queryRaw<CommentRow[]>`
    SELECT "serviceId", "reportType", comment, "createdAt"
    FROM (
      SELECT cr."serviceId", cr."reportType"::text AS "reportType", cr.comment, cr."createdAt",
             ROW_NUMBER() OVER (PARTITION BY cr."serviceId" ORDER BY cr."createdAt" DESC) AS rn
      FROM "CommunityReport" cr
      WHERE cr.comment IS NOT NULL AND cr."isVisible" = true AND cr."isSpam" = false
    ) x
    WHERE rn <= 5
  `;

  // ---- Group everything by serviceId in JS ----
  const surfacesByService = new Map<string, Map<string, SurfaceRow[]>>();
  for (const row of surfaceRows) {
    let bySurface = surfacesByService.get(row.serviceId);
    if (!bySurface) surfacesByService.set(row.serviceId, (bySurface = new Map()));
    let arr = bySurface.get(row.surfaceId);
    if (!arr) bySurface.set(row.surfaceId, (arr = []));
    if (row.observedAt) arr.push(row);
  }

  const incidentsByService = new Map<string, IncidentRow[]>();
  for (const inc of incidentRows) {
    let arr = incidentsByService.get(inc.serviceId);
    if (!arr) incidentsByService.set(inc.serviceId, (arr = []));
    arr.push(inc);
  }

  const reportCountByService = new Map(reportCounts.map((r) => [r.serviceId, r._count.serviceId]));

  const reportsByTypeByService = new Map<string, Record<string, number>>();
  for (const r of reportsByTypeRaw) {
    let byType = reportsByTypeByService.get(r.serviceId);
    if (!byType) reportsByTypeByService.set(r.serviceId, (byType = {}));
    byType[r.reportType] = r._count;
  }

  const commentsByService = new Map<string, CommentRow[]>();
  for (const c of commentRows) {
    let arr = commentsByService.get(c.serviceId);
    if (!arr) commentsByService.set(c.serviceId, (arr = []));
    arr.push(c);
  }

  const snapshots = new Map<string, ServiceSnapshotJson>();
  const indexRows: IndexServiceRow[] = [];

  for (const svc of services) {
    const monCap = svc.monitoringCapability as string;
    const isNonMeasurable = isNonMeasurableCapability(monCap);
    const bySurface = surfacesByService.get(svc.id) ?? new Map<string, SurfaceRow[]>();

    const surfaces = Array.from(bySurface.values()).map((rows) => {
      const sorted = [...rows].sort((a, b) => (b.observedAt as Date).getTime() - (a.observedAt as Date).getTime());
      const latest = sorted[0];
      const validLatencies = sorted
        .filter((r) => isValidForPublicLatency(r.probeResult, r.latencyMs))
        .map((r) => r.latencyMs as number)
        .sort((a, b) => a - b);
      return {
        surfaceId: latest.surfaceId,
        surfaceSlug: latest.surfaceSlug,
        displayName: latest.displayName,
        status: isNonMeasurable ? "UNKNOWN" : ((latest.status as SurfaceSnapshotStatus) ?? "UNKNOWN"),
        latestHttpStatus: latest.httpStatus ?? null,
        latestLatencyMs: isNonMeasurable ? null : (latest.latencyMs ?? null),
        confidence: latest.confidence ?? null,
        lastObservedAt: latest.observedAt,
        p50Latency24h: isNonMeasurable ? null : percentile(validLatencies, 0.5),
        p95Latency24h: isNonMeasurable ? null : percentile(validLatencies, 0.95),
        officialStatus: latest.officialStatus ?? null,
        rawRows: sorted, // used below for uptime/sparkline, stripped before writing
      };
    });

    // uptime24h — same denominator rule as before: measurable observations
    // only, "up" = OPERATIONAL or DEGRADED (a hard OUTAGE is the only downtime).
    let uptime24h: number | null = null;
    if (monCap !== "BLOCKED_FROM_PROBES" && monCap !== "UNVERIFIABLE") {
      let total = 0;
      let up = 0;
      for (const s of surfaces) {
        for (const r of s.rawRows) {
          if (r.status == null) continue;
          if (!["OPERATIONAL", "DEGRADED", "OUTAGE"].includes(r.status)) continue;
          if (r.probeResult != null && AVAILABILITY_NON_MEASURABLE.has(r.probeResult)) continue;
          total += 1;
          if (r.status === "OPERATIONAL" || r.status === "DEGRADED") up += 1;
        }
      }
      uptime24h = total > 0 ? Math.round((up / total) * 10000) / 100 : null;
    }

    const resolved = resolveDisplayStatus(
      monCap,
      surfaces.map((s) => ({ status: s.status, officialStatus: s.officialStatus, observedAt: s.lastObservedAt })),
      communitySignalOf(svc as Parameters<typeof communitySignalOf>[0]),
    );
    const headline = resolved.headline;
    const statusOrigin = resolved.origin;
    let overallStatus: ServiceSnapshotJson["overallStatus"];
    if (resolved.status === "DEGRADED" && (resolved.source === "COMMUNITY" || resolved.source === "BOTH")) {
      overallStatus = "REPORTED_ISSUES";
    } else {
      overallStatus = resolved.status;
    }
    const communityDisplay = {
      source: resolved.source,
      confidence: resolved.confidence,
      label: resolved.label,
      reportsInWindow: resolved.reportsInWindow,
    };
    const community_ = resolved.source === "COMMUNITY" || resolved.source === "BOTH";
    const primarySource: StatusExplanation["primarySource"] =
      overallStatus === "REPORTED_ISSUES" || resolved.source === "COMMUNITY"
        ? "COMMUNITY"
        : statusOrigin === "CAPABILITY"
          ? "CAPABILITY"
          : statusOrigin === "OFFICIAL"
            ? "OFFICIAL"
            : "TECHNICAL";
    const statusExplanation: StatusExplanation = {
      status: overallStatus,
      primarySource,
      signalSourceLabel: SIGNAL_SOURCE_LABEL[monCap] ?? "public surface check",
      monitoringConfidence: monitoringConfidence(monCap),
      communityConfidence: community_ ? resolved.confidence : null,
      reportsInWindow: resolved.reportsInWindow,
      monitoringCapability: monCap,
      officialComponentDetail: null,
    };

    const incidentsRaw30 = (incidentsByService.get(svc.id) ?? []).sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
    );
    const incidents30d = incidentsRaw30.slice(0, 10).map((inc) => ({
      id: inc.id,
      title: inc.title,
      status: inc.status,
      severity: inc.severity,
      startedAt: inc.startedAt.toISOString(),
      resolvedAt: inc.resolvedAt ? inc.resolvedAt.toISOString() : null,
      duration: inc.resolvedAt ? Math.round((inc.resolvedAt.getTime() - inc.startedAt.getTime()) / 60_000) : null,
      summary: inc.summary,
    }));
    const lastResolved = incidentsRaw30.find((i) => i.resolvedAt != null) ?? null;

    const recentComments = (commentsByService.get(svc.id) ?? [])
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((c) => ({
        pseudo: "Anonymous",
        content: c.comment,
        reportType: c.reportType,
        createdAt: c.createdAt.toISOString(),
      }));

    const snapshot: ServiceSnapshotJson = {
      service: {
        id: svc.id,
        slug: svc.slug,
        name: svc.name,
        category: svc.category as string,
        description: svc.description,
        websiteUrl: svc.websiteUrl,
        iconUrl: svc.iconUrl,
        monitoringCapability: monCap,
        lifecycleStatus: svc.lifecycleStatus as string,
      },
      overallStatus,
      community: communityDisplay,
      headline,
      statusExplanation,
      surfaces: surfaces.map(({ rawRows: _rawRows, lastObservedAt, ...rest }) => ({
        ...rest,
        lastObservedAt: lastObservedAt ? lastObservedAt.toISOString() : null,
      })),
      uptime24h,
      incidents30d,
      reportSummary: {
        total24h: reportCountByService.get(svc.id) ?? 0,
        byType: reportsByTypeByService.get(svc.id) ?? {},
        bySurface: {},
        recentComments,
      },
      lastResolvedIncidentAt: lastResolved ? lastResolved.startedAt.toISOString() : null,
      generatedAt,
    };
    snapshots.set(svc.slug, snapshot);

    // ---- Index row (home + category) ----
    const allRaw = surfaces.flatMap((s) => s.rawRows);
    const sparklineData = allRaw
      .slice()
      .sort((a, b) => (a.observedAt as Date).getTime() - (b.observedAt as Date).getTime())
      .filter((r) => isValidForPublicLatency(r.probeResult, r.latencyMs))
      .map((r) => r.latencyMs as number)
      .slice(-24);

    const surfacePerformances = surfaces.map((s) => {
      const latencies = s.rawRows
        .filter((r) => isValidForPublicLatency(r.probeResult, r.latencyMs))
        .map((r) => r.latencyMs as number);
      return computeSurfacePerformance({
        last72hLatencies: latencies,
        last5Latencies: latencies.slice(0, 5),
        lastObservedAt: s.lastObservedAt,
      });
    });
    const performanceLevel = aggregateServicePerformance(surfacePerformances.map((p) => p.level));
    const performanceBaseline =
      surfacePerformances.length > 0
        ? Math.round(surfacePerformances.reduce((sum, p) => sum + p.baseline, 0) / surfacePerformances.length)
        : 0;
    const latestLatency =
      allRaw.slice().sort((a, b) => (b.observedAt as Date).getTime() - (a.observedAt as Date).getTime())[0]
        ?.latencyMs ?? null;
    const publicLatestLatency = latestLatency != null && latestLatency < 5000 ? latestLatency : null;

    indexRows.push({
      id: svc.id,
      slug: svc.slug,
      name: svc.name,
      description: svc.description,
      category: svc.category as string,
      status: overallStatus === "REPORTED_ISSUES" ? "DEGRADED" : overallStatus,
      badgeType: badgeFromCapability(monCap),
      latencyMs: publicLatestLatency,
      sparklineData,
      performanceLevel,
      performanceBaseline,
      performanceScore: computePerformanceScore(publicLatestLatency, performanceBaseline, performanceLevel),
    });
  }

  const recentIncidents: IndexRecentIncident[] = recentIncidentsRaw.map((inc) => ({
    id: inc.id,
    title: inc.title,
    status: inc.status,
    severity: inc.severity,
    startedAt: inc.startedAt.toISOString(),
    resolvedAt: inc.resolvedAt ? inc.resolvedAt.toISOString() : null,
    summary: inc.summary,
    service: { name: inc.service.name },
  }));

  return {
    services: snapshots,
    index: { generatedAt, services: indexRows, recentIncidents },
  };
}
