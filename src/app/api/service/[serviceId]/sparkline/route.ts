import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 600; // 10 min ISR cache

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  if (!serviceId) {
    return NextResponse.json({ error: "Missing serviceId" }, { status: 400 });
  }

  // 24 buckets of 60 min over 24h — Groups all surfaces for the service together (aggregate view)
  const rows = await prisma.$queryRaw<
    Array<{
      bucket_start: Date;
      p50: number | null;
      p95: number | null;
      mode_status: string | null;
    }>
  >`
    WITH buckets AS (
      SELECT generate_series(
        date_trunc('hour', NOW() - INTERVAL '24 hours'),
        NOW(),
        INTERVAL '60 minutes'
      ) AS bucket_start
    )
    SELECT
      b.bucket_start,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY o."latencyMs") AS p50,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY o."latencyMs") AS p95,
      MODE() WITHIN GROUP (ORDER BY o.status)                     AS mode_status
    FROM buckets b
    LEFT JOIN "Observation" o
      ON o."serviceSurfaceId" IN (
           SELECT id FROM "ServiceSurface"
           WHERE "serviceId" = ${serviceId} AND "isEnabled" = true
         )
      AND o."observedAt" >= b.bucket_start
      AND o."observedAt" <  b.bucket_start + INTERVAL '60 minutes'
    GROUP BY b.bucket_start
    ORDER BY b.bucket_start
  `;

  const buckets = rows.map((r) => ({
    bucketStart: r.bucket_start.toISOString(),
    p50: r.p50 != null ? Math.round(Number(r.p50)) : null,
    p95: r.p95 != null ? Math.round(Number(r.p95)) : null,
    modeStatus: r.mode_status ?? null,
  }));

  return NextResponse.json({ buckets }, { status: 200 });
}
