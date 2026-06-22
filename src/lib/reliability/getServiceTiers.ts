import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { isNonMeasurableCapability } from "@/lib/monitoring/probeValidity";

export type ReliabilityTier = "RANKED" | "LIMITED" | "EXCLUDED";

export type ServiceTierRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  capability: string;
  tier: ReliabilityTier;
  totalObs7d: number;
  validObs7d: number;
  successRate7d: number | null; // validObs7d / totalObs7d, fraction 0..1
};

// ── Tier thresholds (tunable; successRate is a fraction 0..1) ─────────────────
// Calibrated on the real 7d probe-success distribution (bimodal): a service is
// RANKED only when we can measure it reliably enough to trust its signals.
export const MIN_OBS = 10;               // min valid probe samples to be ranked/limited at all
export const RANKED_MIN_OBS = 20;        // min valid probe samples required for RANKED
export const LIMITED_MIN_SUCCESS = 0.70; // below this → EXCLUDED
export const RANKED_MIN_SUCCESS = 0.85;  // at/above this (+ enough samples) → RANKED

// Probe results that make a sample non-measurable — mirrors INVALID_PROBE_RESULTS
// in lib/monitoring/probeValidity.ts (duplicated here because this runs in SQL).
const INVALID_PROBE_SQL = Prisma.sql`('BLOCKED','RATE_LIMITED','TIMEOUT','DNS_FAIL','CONNECTION_FAIL','TLS_ERROR','UNKNOWN_FAILURE','PARSE_ERROR')`;

/**
 * Tier from probe-success rate + valid-sample volume over the last 7 days.
 * Tells us how confidently we can monitor a service right now — NOT how reliable
 * the service is (that's the 90-day leaderboard's job).
 * - EXCLUDED: non-measurable capability, too few valid samples, or success < 70%.
 * - RANKED:   success ≥ 85% AND ≥ 20 valid samples.
 * - LIMITED:  in between (70–85%, or ≥85% but only 10–19 valid samples).
 */
function computeTier(capability: string, validObs7d: number, successRate7d: number | null): ReliabilityTier {
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

/**
 * Per-service monitoring tier + capability across all categories. One light
 * aggregating query (7-day probe counts only — no percentiles, no latency).
 * Reused by the reliability leaderboard to decide which services we can rank
 * versus group under "limited monitoring".
 */
export async function getServiceTiers(): Promise<ServiceTierRow[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      slug: string;
      category: string;
      capability: string;
      totalObs7d: bigint;
      validObs7d: bigint;
    }>
  >(Prisma.sql`
    SELECT
      s.id,
      s.name,
      s.slug,
      s.category::text               AS category,
      s."monitoringCapability"::text AS capability,
      COUNT(o.id)                    AS "totalObs7d",
      COUNT(o.id) FILTER (
        WHERE o."latencyMs" IS NOT NULL AND o."latencyMs" >= 1 AND o."latencyMs" < 5000
          AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN ${INVALID_PROBE_SQL})
      )                              AS "validObs7d"
    FROM "Service" s
    JOIN "ServiceSurface" ss ON ss."serviceId" = s.id AND ss."isEnabled" = true
    LEFT JOIN "Observation" o
      ON o."serviceSurfaceId" = ss.id
      AND o."observedAt" >= NOW() - INTERVAL '7 days'
    GROUP BY s.id, s.name, s.slug, s.category, s."monitoringCapability"
    HAVING COUNT(o.id) >= ${MIN_OBS}
  `);

  return rows.map((r) => {
    const totalObs7d = Number(r.totalObs7d);
    const validObs7d = Number(r.validObs7d);
    const successRate7d = totalObs7d > 0 ? validObs7d / totalObs7d : null;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      capability: r.capability,
      tier: computeTier(r.capability, validObs7d, successRate7d),
      totalObs7d,
      validObs7d,
      successRate7d,
    };
  });
}
