import { prisma } from "@/lib/db";
import type { ServiceCategory } from "@prisma/client";

export type SpeedIndexRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  latestStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";
  p507d: number | null;
  p957d: number | null;
  p5024h: number | null;
  p9524h: number | null;
  trend24h: number | null; // p5024h − p50_prev_24h; negative = faster (good)
  uptime7d: number | null;
  uptime24h: number | null;
  obs7d: number;
  obs24h: number;
  reports24h: number;
  incidents7d: number;
};

// Minimum observations in the 7-day window required to appear in the ranking.
const MIN_OBS_7D = 10;

/**
 * Single aggregating query: one SQL execution computes p50/p95/uptime for both
 * 7-day and 24-hour windows plus the 24h trend (previous 24h comparison).
 * Uses PERCENTILE_CONT in SQL — never loads raw observation rows into JS.
 */
export async function getSpeedIndex(category: ServiceCategory = "LLM"): Promise<{
  data: SpeedIndexRow[];
  generatedAt: string;
}> {
  // Cast category to string for the safe text comparison below
  const categoryStr: string = category as string;

  const rawResults = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      slug: string;
      category: string;
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
    }>
  >`
    WITH all_obs AS (
      SELECT
        ss."serviceId",
        o."latencyMs",
        o.status,
        o."observedAt"
      FROM "Observation" o
      JOIN "ServiceSurface" ss
        ON ss.id = o."serviceSurfaceId" AND ss."isEnabled" = true
      JOIN "Service" svc
        ON svc.id = ss."serviceId" AND svc.category::text = ${categoryStr}
      WHERE o."observedAt" >= NOW() - INTERVAL '7 days'
    ),
    service_agg AS (
      SELECT
        ao."serviceId",
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ao."latencyMs")
          FILTER (WHERE ao."latencyMs" IS NOT NULL AND ao."latencyMs" > 0)
          AS p50_7d,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ao."latencyMs")
          FILTER (WHERE ao."latencyMs" IS NOT NULL AND ao."latencyMs" > 0)
          AS p95_7d,
        COUNT(ao.status)
          AS obs_7d,
        COUNT(ao.status) FILTER (WHERE ao.status = 'OPERATIONAL')
          AS obs_7d_op,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ao."latencyMs")
          FILTER (WHERE ao."latencyMs" IS NOT NULL AND ao."latencyMs" > 0
                  AND ao."observedAt" >= NOW() - INTERVAL '24 hours')
          AS p50_24h,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ao."latencyMs")
          FILTER (WHERE ao."latencyMs" IS NOT NULL AND ao."latencyMs" > 0
                  AND ao."observedAt" >= NOW() - INTERVAL '24 hours')
          AS p95_24h,
        COUNT(ao.status) FILTER (WHERE ao."observedAt" >= NOW() - INTERVAL '24 hours')
          AS obs_24h,
        COUNT(ao.status) FILTER (
          WHERE ao.status = 'OPERATIONAL'
            AND ao."observedAt" >= NOW() - INTERVAL '24 hours')
          AS obs_24h_op,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ao."latencyMs")
          FILTER (WHERE ao."latencyMs" IS NOT NULL AND ao."latencyMs" > 0
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
      FROM all_obs
      ORDER BY "serviceId", "observedAt" DESC
    )
    SELECT
      s.id,
      s.name,
      s.slug,
      s.category::text                  AS category,
      lo.status                         AS "latestStatus",
      sa.p50_7d                         AS "p507d",
      sa.p95_7d                         AS "p957d",
      sa.p50_24h                        AS "p5024h",
      sa.p95_24h                        AS "p9524h",
      sa.p50_prev_24h                   AS "p50Prev24h",
      sa.obs_7d                         AS "obs7d",
      sa.obs_7d_op                      AS "obs7dOp",
      sa.obs_24h                        AS "obs24h",
      sa.obs_24h_op                     AS "obs24hOp"
    FROM "Service" s
    JOIN service_agg sa ON sa."serviceId" = s.id
    LEFT JOIN latest_obs lo ON lo."serviceId" = s.id
    WHERE s.category::text = ${categoryStr}
      AND sa.obs_7d >= ${MIN_OBS_7D}
    ORDER BY sa.p50_7d ASC NULLS LAST
  `;

  if (rawResults.length === 0) {
    return { data: [], generatedAt: new Date().toISOString() };
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

  const data: SpeedIndexRow[] = rawResults.map((r) => {
    const obs7d = Number(r.obs7d);
    const obs7dOp = Number(r.obs7dOp);
    const obs24h = Number(r.obs24h);
    const obs24hOp = Number(r.obs24hOp);

    const p507d = r.p507d != null ? Math.round(Number(r.p507d)) : null;
    const p957d = r.p957d != null ? Math.round(Number(r.p957d)) : null;
    // Require at least 3 observations in 24h window for 24h metrics to be meaningful
    const p5024h = obs24h >= 3 && r.p5024h != null ? Math.round(Number(r.p5024h)) : null;
    const p9524h = obs24h >= 3 && r.p9524h != null ? Math.round(Number(r.p9524h)) : null;
    const p50Prev24h = r.p50Prev24h != null ? Math.round(Number(r.p50Prev24h)) : null;
    // trend = current p50 minus previous p50; negative means got faster (improvement)
    const trend24h = p5024h != null && p50Prev24h != null ? p5024h - p50Prev24h : null;

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
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
      reports24h: reportMap.get(r.id) ?? 0,
      incidents7d: incidentMap.get(r.id) ?? 0,
    };
  });

  return { data, generatedAt: new Date().toISOString() };
}
