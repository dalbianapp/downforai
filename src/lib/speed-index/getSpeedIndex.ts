import { prisma } from "@/lib/db";
import { Prisma, type ServiceCategory } from "@prisma/client";
import { isNonMeasurableCapability } from "@/lib/monitoring/probeValidity";

export type SpeedIndexTier = "RANKED" | "LIMITED" | "EXCLUDED";

export type SpeedIndexRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  capability: string;
  latestStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";
  p507d: number | null;
  p957d: number | null;
  p5024h: number | null;
  p9524h: number | null;
  trend24h: number | null; // p5024h − p50_prev_24h; negative = faster (good)
  uptime7d: number | null;
  uptime24h: number | null;
  obs7d: number; // probe-valid observations (uptime denominator — unchanged from legacy)
  obs24h: number;
  totalObs7d: number; // ALL observations 7d (no probe filter) — success-rate denominator
  validObs7d: number; // valid-latency observations 7d — success-rate numerator + tier gate
  successRate7d: number | null; // validObs7d / totalObs7d, fraction 0..1 (null if no obs)
  tier: SpeedIndexTier;
  reports24h: number;
  incidents7d: number;
};

// ── Tier thresholds (tunable; successRate is a fraction 0..1) ─────────────────
// Calibrated on the real 7d distribution (bimodal: ~750 services ≥80%, a thin
// 70–80% band, a handful <30%). See diagnostic in audit notes.
export const MIN_OBS = 10;              // min valid-latency obs to be ranked/limited at all
export const RANKED_MIN_OBS = 20;       // min valid-latency obs required for RANKED
export const LIMITED_MIN_SUCCESS = 0.70; // below this → EXCLUDED
export const RANKED_MIN_SUCCESS = 0.85;  // at/above this (+ enough obs) → RANKED

// Legacy gate for the single-category getSpeedIndex() — preserves the exact set
// and order the current /speed-index page renders today (probe-valid obs >= 10).
const MIN_OBS_7D = 10;

// Probe results that make a latency sample non-measurable — mirrors
// INVALID_PROBE_RESULTS in lib/monitoring/probeValidity.ts (kept in sync manually
// because that lives in TS and this must run inside SQL).
const INVALID_PROBE_SQL = Prisma.sql`('BLOCKED','RATE_LIMITED','TIMEOUT','DNS_FAIL','CONNECTION_FAIL','TLS_ERROR','UNKNOWN_FAILURE','PARSE_ERROR')`;

/**
 * Tier classification from success rate + valid-observation volume.
 * - EXCLUDED: non-measurable capability, too few valid samples, or success < 70%.
 * - RANKED:   success ≥ 80% AND ≥ 20 valid samples (enough to trust the percentile).
 * - LIMITED:  everything in between (70–80%, or ≥80% but only 10–19 valid samples).
 */
function computeTier(
  capability: string,
  validObs7d: number,
  successRate7d: number | null,
): SpeedIndexTier {
  if (
    isNonMeasurableCapability(capability) ||
    validObs7d < MIN_OBS ||
    successRate7d == null ||
    successRate7d < LIMITED_MIN_SUCCESS
  ) {
    return "EXCLUDED";
  }
  if (validObs7d >= RANKED_MIN_OBS && successRate7d >= RANKED_MIN_SUCCESS) {
    return "RANKED";
  }
  return "LIMITED";
}

type RawRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  capability: string;
  latestStatus: string | null;
  p507d: number | null;
  p957d: number | null;
  p5024h: number | null;
  p9524h: number | null;
  p50Prev24h: number | null;
  obs7d: bigint;
  obs7dOp: bigint;
  obs24h: bigint;
  obs24hOp: bigint;
  totalObs7d: bigint;
  validObs7d: bigint;
};

/**
 * Core query + enrichment. One aggregating SQL execution computes total/valid
 * counts, p50/p95 (valid-latency only), uptime, and the 24h trend; never loads
 * raw observation rows into JS. Used by both the single-category and
 * all-category public functions.
 *
 * @param category  when provided, restrict to that category; otherwise all.
 * @param gate      SQL boolean over the service_agg row deciding visibility.
 */
async function querySpeedIndexRows(
  category: ServiceCategory | undefined,
  gate: Prisma.Sql,
): Promise<SpeedIndexRow[]> {
  const catAllObs = category
    ? Prisma.sql`AND svc.category::text = ${category as string}`
    : Prisma.empty;
  const catFinal = category
    ? Prisma.sql`AND s.category::text = ${category as string}`
    : Prisma.empty;

  // A latency sample usable for percentiles: bounded latency AND a valid probe.
  const validLatency = Prisma.sql`
    ao."latencyMs" IS NOT NULL AND ao."latencyMs" > 0 AND ao."latencyMs" < 5000
    AND (ao."probeResult" IS NULL OR ao."probeResult"::text NOT IN ${INVALID_PROBE_SQL})`;
  // A probe-valid observation (any latency) — uptime denominator, legacy semantics.
  const probeValid = Prisma.sql`
    (ao."probeResult" IS NULL OR ao."probeResult"::text NOT IN ${INVALID_PROBE_SQL})`;

  const rawResults = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
    WITH all_obs AS (
      SELECT
        ss."serviceId",
        o."latencyMs",
        o.status,
        o."observedAt",
        o."probeResult"
      FROM "Observation" o
      JOIN "ServiceSurface" ss
        ON ss.id = o."serviceSurfaceId" AND ss."isEnabled" = true
      JOIN "Service" svc
        ON svc.id = ss."serviceId" ${catAllObs}
      WHERE o."observedAt" >= NOW() - INTERVAL '7 days'
    ),
    service_agg AS (
      SELECT
        ao."serviceId",
        -- success-rate counts
        COUNT(*)                                          AS total_obs_7d,
        COUNT(*) FILTER (WHERE ${validLatency})           AS valid_obs_7d,
        -- uptime / gate counts (probe-valid only — unchanged from legacy)
        COUNT(*) FILTER (WHERE ${probeValid})             AS probe_obs_7d,
        COUNT(*) FILTER (WHERE ${probeValid} AND ao.status = 'OPERATIONAL')
                                                          AS probe_obs_7d_op,
        -- latency percentiles (valid-latency samples only)
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ao."latencyMs")
          FILTER (WHERE ${validLatency})                  AS p50_7d,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ao."latencyMs")
          FILTER (WHERE ${validLatency})                  AS p95_7d,
        COUNT(*) FILTER (WHERE ${probeValid} AND ao."observedAt" >= NOW() - INTERVAL '24 hours')
                                                          AS obs_24h,
        COUNT(*) FILTER (
          WHERE ${probeValid} AND ao.status = 'OPERATIONAL'
            AND ao."observedAt" >= NOW() - INTERVAL '24 hours')
                                                          AS obs_24h_op,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ao."latencyMs")
          FILTER (WHERE ${validLatency} AND ao."observedAt" >= NOW() - INTERVAL '24 hours')
                                                          AS p50_24h,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ao."latencyMs")
          FILTER (WHERE ${validLatency} AND ao."observedAt" >= NOW() - INTERVAL '24 hours')
                                                          AS p95_24h,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ao."latencyMs")
          FILTER (WHERE ${validLatency}
                  AND ao."observedAt" >= NOW() - INTERVAL '48 hours'
                  AND ao."observedAt" <  NOW() - INTERVAL '24 hours')
                                                          AS p50_prev_24h
      FROM all_obs ao
      GROUP BY ao."serviceId"
    ),
    latest_obs AS (
      SELECT DISTINCT ON ("serviceId")
        "serviceId",
        status,
        "observedAt"
      FROM all_obs ao
      WHERE (ao."probeResult" IS NULL OR ao."probeResult"::text NOT IN ${INVALID_PROBE_SQL})
      ORDER BY "serviceId", "observedAt" DESC
    )
    SELECT
      s.id,
      s.name,
      s.slug,
      s.category::text                  AS category,
      s."monitoringCapability"::text    AS capability,
      lo.status                         AS "latestStatus",
      sa.p50_7d                         AS "p507d",
      sa.p95_7d                         AS "p957d",
      sa.p50_24h                        AS "p5024h",
      sa.p95_24h                        AS "p9524h",
      sa.p50_prev_24h                   AS "p50Prev24h",
      sa.probe_obs_7d                   AS "obs7d",
      sa.probe_obs_7d_op                AS "obs7dOp",
      sa.obs_24h                        AS "obs24h",
      sa.obs_24h_op                     AS "obs24hOp",
      sa.total_obs_7d                   AS "totalObs7d",
      sa.valid_obs_7d                   AS "validObs7d"
    FROM "Service" s
    JOIN service_agg sa ON sa."serviceId" = s.id
    LEFT JOIN latest_obs lo ON lo."serviceId" = s.id
    WHERE ${gate} ${catFinal}
    ORDER BY s.category::text ASC, sa.p50_7d ASC NULLS LAST
  `);

  if (rawResults.length === 0) {
    return [];
  }

  const serviceIds = rawResults.map((r) => r.id);
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Two lightweight groupBy queries — no large row fetch
  const [reportCounts, incidentCounts] = await Promise.all([
    prisma.communityReport.groupBy({
      by: ["serviceId"],
      where: { serviceId: { in: serviceIds }, createdAt: { gte: since24h } },
      _count: { serviceId: true },
    }),
    prisma.incident.groupBy({
      by: ["serviceId"],
      where: { serviceId: { in: serviceIds }, startedAt: { gte: since7d }, isFalsePositive: false },
      _count: { serviceId: true },
    }),
  ]);

  const reportMap = new Map(reportCounts.map((r) => [r.serviceId, r._count.serviceId]));
  const incidentMap = new Map(incidentCounts.map((i) => [i.serviceId, i._count.serviceId]));

  return rawResults.map((r) => {
    const obs7d = Number(r.obs7d);
    const obs7dOp = Number(r.obs7dOp);
    const obs24h = Number(r.obs24h);
    const obs24hOp = Number(r.obs24hOp);
    const totalObs7d = Number(r.totalObs7d);
    const validObs7d = Number(r.validObs7d);

    const p507d = r.p507d != null ? Math.round(Number(r.p507d)) : null;
    const p957d = r.p957d != null ? Math.round(Number(r.p957d)) : null;
    // Require at least 3 observations in 24h window for 24h metrics to be meaningful
    const p5024h = obs24h >= 3 && r.p5024h != null ? Math.round(Number(r.p5024h)) : null;
    const p9524h = obs24h >= 3 && r.p9524h != null ? Math.round(Number(r.p9524h)) : null;
    const p50Prev24h = r.p50Prev24h != null ? Math.round(Number(r.p50Prev24h)) : null;
    // trend = current p50 minus previous p50; negative means got faster (improvement)
    const trend24h = p5024h != null && p50Prev24h != null ? p5024h - p50Prev24h : null;

    const successRate7d = totalObs7d > 0 ? validObs7d / totalObs7d : null;
    const tier = computeTier(r.capability, validObs7d, successRate7d);

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      capability: r.capability,
      latestStatus: (r.latestStatus as SpeedIndexRow["latestStatus"]) ?? "UNKNOWN",
      p507d,
      p957d,
      p5024h,
      p9524h,
      trend24h,
      uptime7d: obs7d > 0 ? (obs7dOp / obs7d) * 100 : null,
      uptime24h: obs24h > 0 ? (obs24hOp / obs24h) * 100 : null,
      obs7d,
      obs24h,
      totalObs7d,
      validObs7d,
      successRate7d,
      tier,
      reports24h: reportMap.get(r.id) ?? 0,
      incidents7d: incidentMap.get(r.id) ?? 0,
    };
  });
}

/**
 * Single-category speed index — used by the current /speed-index page.
 * Behaviour preserved: same returned set (probe-valid obs ≥ 10) and same order
 * (fastest p50 first). New fields (tier, successRate7d, total/validObs7d) are
 * additive and ignored by the existing UI.
 */
export async function getSpeedIndex(category: ServiceCategory = "LLM"): Promise<{
  data: SpeedIndexRow[];
  generatedAt: string;
}> {
  const data = await querySpeedIndexRows(
    category,
    Prisma.sql`sa.probe_obs_7d >= ${MIN_OBS_7D}`,
  );
  return { data, generatedAt: new Date().toISOString() };
}

/**
 * All-category speed index — used by the upcoming hub UI (B2) and diagnostics.
 * Relaxed gate (total obs ≥ 10) so EXCLUDED/LIMITED services surface too; the
 * tier field does the sorting. Returned grouped by category.
 */
export async function getSpeedIndexAllCategories(): Promise<{
  byCategory: Record<string, SpeedIndexRow[]>;
  generatedAt: string;
}> {
  const rows = await querySpeedIndexRows(
    undefined,
    Prisma.sql`sa.total_obs_7d >= ${MIN_OBS}`,
  );
  const byCategory: Record<string, SpeedIndexRow[]> = {};
  for (const row of rows) {
    (byCategory[row.category] ??= []).push(row);
  }
  return { byCategory, generatedAt: new Date().toISOString() };
}
