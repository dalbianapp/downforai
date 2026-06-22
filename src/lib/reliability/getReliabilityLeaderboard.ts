import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getServiceTiers, type ReliabilityTier } from "@/lib/reliability/getServiceTiers";
import { isNonMeasurableCapability } from "@/lib/monitoring/probeValidity";

export type LeaderboardRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  capability: string;
  tier: ReliabilityTier;
  // 90-day reliability signals
  availability90d: number | null;  // non-OUTAGE rate over measurable observations (0..100)
  measurable90d: number;           // observations with a measurable status + valid probe
  degradedObs90d: number;          // DEGRADED observations (counted separately, NOT downtime)
  outageObs90d: number;            // OUTAGE observations
  incidents90d: number;            // confirmed incidents (isFalsePositive = false)
  outageMinutes90d: number;        // summed confirmed-incident duration in minutes
  lastIncidentDaysAgo: number | null;
  reports90d: number;              // community reports (raw, not normalized by usage)
  communityIncidents90d: number;   // community-detected outages — SEPARATE, never in availability/confirmed
};

export type LeaderboardSummary = {
  totalTracked: number;
  officialSources: number;
  incidents90d: number;
  reports90d: number;
  noConfirmedOutage: number; // services with 0 outage observations AND 0 confirmed incidents (90d)
  capabilityCounts: Record<string, number>; // monitoring confidence distribution (all tracked services)
};

// Availability non-measurable set (mirrors AVAILABILITY_NON_MEASURABLE). DNS_FAIL
// and CONNECTION_FAIL are deliberately EXCLUDED from this list — they are genuine
// OUTAGE observations and must count as downtime, consistent with the service page.
const AVAIL_NON_MEASURABLE_SQL = Prisma.sql`('BLOCKED','RATE_LIMITED','TIMEOUT','UNKNOWN_FAILURE','PARSE_ERROR','TLS_ERROR')`;

/**
 * Cross-category reliability leaderboard. Reuses getServiceTiers() for the
 * monitoring tier + capability, and adds 90-day reliability signals.
 *
 * Availability convention (the "verité" fix): availability = NON-OUTAGE rate.
 * "Down" means a hard OUTAGE only. DEGRADED is NOT downtime — it is counted as a
 * separate signal. Denominator = observations with a measurable status
 * (OPERATIONAL/DEGRADED/OUTAGE) and a valid probe; blocked/timeout probes are
 * excluded so a block never counts against availability.
 */
export async function getReliabilityLeaderboard(): Promise<{
  rows: LeaderboardRow[];
  summary: LeaderboardSummary;
  generatedAt: string;
}> {
  const tiers = await getServiceTiers();

  // Display universe: ranked + limited + non-measurable capabilities. Low-success
  // EXCLUDED (measurable but <70% probe success) are dropped — not trustworthy.
  const relevant = tiers.filter(
    (r) => r.tier === "RANKED" || r.tier === "LIMITED" || isNonMeasurableCapability(r.capability),
  );
  const ids = relevant.map((r) => r.id);

  const since90d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [capabilityGroups, statusRows, incidentRows, lastIncidentRows, reportRows, communityIncidentRows] =
    await Promise.all([
      prisma.service.groupBy({ by: ["monitoringCapability"], _count: { _all: true } }),
      ids.length === 0
        ? Promise.resolve([] as Array<{ serviceId: string; measurable: bigint; up: bigint; degraded: bigint; outage: bigint }>)
        : prisma.$queryRaw<Array<{ serviceId: string; measurable: bigint; up: bigint; degraded: bigint; outage: bigint }>>(Prisma.sql`
            SELECT ss."serviceId" AS "serviceId",
              COUNT(*) FILTER (WHERE o.status IN ('OPERATIONAL','DEGRADED','OUTAGE')
                AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN ${AVAIL_NON_MEASURABLE_SQL})) AS measurable,
              COUNT(*) FILTER (WHERE o.status IN ('OPERATIONAL','DEGRADED')
                AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN ${AVAIL_NON_MEASURABLE_SQL})) AS up,
              COUNT(*) FILTER (WHERE o.status = 'DEGRADED'
                AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN ${AVAIL_NON_MEASURABLE_SQL})) AS degraded,
              COUNT(*) FILTER (WHERE o.status = 'OUTAGE'
                AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN ${AVAIL_NON_MEASURABLE_SQL})) AS outage
            FROM "Observation" o
            JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId" AND ss."isEnabled" = true
            WHERE o."observedAt" >= NOW() - INTERVAL '90 days'
              AND ss."serviceId" IN (${Prisma.join(ids)})
            GROUP BY ss."serviceId"
          `),
      ids.length === 0
        ? Promise.resolve([] as Array<{ serviceId: string; cnt: bigint; minutes: number | null }>)
        : prisma.$queryRaw<Array<{ serviceId: string; cnt: bigint; minutes: number | null }>>(Prisma.sql`
            SELECT "serviceId",
              COUNT(*) AS cnt,
              COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE("resolvedAt", NOW()) - "startedAt")) / 60), 0) AS minutes
            FROM "Incident"
            WHERE "isFalsePositive" = false
              AND "sourceBadge" != 'COMMUNITY_REPORTS'
              AND "startedAt" >= NOW() - INTERVAL '90 days'
              AND "serviceId" IN (${Prisma.join(ids)})
            GROUP BY "serviceId"
          `),
      ids.length === 0
        ? Promise.resolve([] as Array<{ serviceId: string; last: Date | null }>)
        : prisma.$queryRaw<Array<{ serviceId: string; last: Date | null }>>(Prisma.sql`
            SELECT "serviceId", MAX("startedAt") AS last
            FROM "Incident"
            WHERE "isFalsePositive" = false AND "sourceBadge" != 'COMMUNITY_REPORTS' AND "serviceId" IN (${Prisma.join(ids)})
            GROUP BY "serviceId"
          `),
      ids.length === 0
        ? Promise.resolve([] as Array<{ serviceId: string }> & { _count?: unknown }[])
        : prisma.communityReport.groupBy({
            by: ["serviceId"],
            where: { serviceId: { in: ids }, createdAt: { gte: since90d }, isSpam: false, isVisible: true },
            _count: { serviceId: true },
          }),
      // Community-detected incidents (90d) — SEPARATE signal, never mixed into the
      // technical "confirmed incidents" / availability above.
      ids.length === 0
        ? Promise.resolve([] as Array<{ serviceId: string; _count: { serviceId: number } }>)
        : prisma.incident.groupBy({
            by: ["serviceId"],
            where: { serviceId: { in: ids }, startedAt: { gte: since90d }, isFalsePositive: false, sourceBadge: "COMMUNITY_REPORTS" },
            _count: { serviceId: true },
          }),
    ]);

  const statusMap = new Map(statusRows.map((r) => [r.serviceId, r]));
  const incMap = new Map(incidentRows.map((r) => [r.serviceId, r]));
  const lastIncMap = new Map(lastIncidentRows.map((r) => [r.serviceId, r.last]));
  const reportMap = new Map(
    (reportRows as Array<{ serviceId: string; _count: { serviceId: number } }>).map((r) => [r.serviceId, r._count.serviceId]),
  );
  const communityIncMap = new Map(
    (communityIncidentRows as Array<{ serviceId: string; _count: { serviceId: number } }>).map((r) => [r.serviceId, r._count.serviceId]),
  );

  const now = Date.now();
  const rows: LeaderboardRow[] = relevant.map((r) => {
    const s = statusMap.get(r.id);
    const measurable = s ? Number(s.measurable) : 0;
    const up = s ? Number(s.up) : 0;
    const inc = incMap.get(r.id);
    const last = lastIncMap.get(r.id) ?? null;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      capability: r.capability,
      tier: r.tier,
      availability90d: measurable > 0 ? (up / measurable) * 100 : null,
      measurable90d: measurable,
      degradedObs90d: s ? Number(s.degraded) : 0,
      outageObs90d: s ? Number(s.outage) : 0,
      incidents90d: inc ? Number(inc.cnt) : 0,
      outageMinutes90d: inc ? Math.round(Number(inc.minutes)) : 0,
      lastIncidentDaysAgo: last ? Math.floor((now - new Date(last).getTime()) / 86_400_000) : null,
      reports90d: reportMap.get(r.id) ?? 0,
      communityIncidents90d: communityIncMap.get(r.id) ?? 0,
    };
  });

  const capabilityCounts: Record<string, number> = {};
  for (const g of capabilityGroups) capabilityCounts[g.monitoringCapability] = g._count._all;
  const totalTracked = Object.values(capabilityCounts).reduce((a, b) => a + b, 0);
  const officialSources = (capabilityCounts.OFFICIAL_STATUS_API ?? 0) + (capabilityCounts.OFFICIAL_STATUS_PAGE ?? 0);

  const summary: LeaderboardSummary = {
    totalTracked,
    officialSources,
    incidents90d: rows.reduce((sum, r) => sum + r.incidents90d, 0),
    reports90d: rows.reduce((sum, r) => sum + r.reports90d, 0),
    noConfirmedOutage: rows.filter((r) => r.outageObs90d === 0 && r.incidents90d === 0).length,
    capabilityCounts,
  };

  return { rows, summary, generatedAt: new Date().toISOString() };
}
