import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 600;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  if (!serviceId) {
    return NextResponse.json({ error: "Missing serviceId" }, { status: 400 });
  }

  // 20 most recent real observations — no empty slots, no gray bars
  const rows = await prisma.$queryRaw<
    Array<{
      observed_at: Date;
      p50: number | null;
      status: string | null;
    }>
  >`
    WITH surface_ids AS (
      SELECT id FROM "ServiceSurface"
      WHERE "serviceId" = ${serviceId} AND "isEnabled" = true
    )
    SELECT
      o."observedAt" AS observed_at,
      o."latencyMs"  AS p50,
      o.status
    FROM "Observation" o
    WHERE o."serviceSurfaceId" IN (SELECT id FROM surface_ids)
      AND o."latencyMs" IS NOT NULL
    ORDER BY o."observedAt" DESC
    LIMIT 20
  `;

  // Reverse to chronological order (oldest → newest)
  const buckets = rows.reverse().map((r) => ({
    bucketStart: r.observed_at.toISOString(),
    p50: r.p50 != null ? Math.round(Number(r.p50)) : null,
    p95: null,
    modeStatus: r.status ?? null,
  }));

  return NextResponse.json({ buckets }, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600",
    },
  });
}
