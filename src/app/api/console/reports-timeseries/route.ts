// ============================================
// API: /api/console/reports-timeseries
// Daily report counts (aggregated) for the Dalbian Console.
// Powers the month / 6-month charts without the 1000 most-recent cap.
// Protected by Authorization: Bearer {CONSOLE_SECRET}
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Site timezone — days are bucketed here (not UTC)
const SITE_TZ = "UTC";

const CONSOLE_SECRET = process.env.CONSOLE_SECRET;

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${CONSOLE_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!CONSOLE_SECRET) {
    return NextResponse.json(
      { error: "CONSOLE_SECRET not configured" },
      { status: 500 }
    );
  }
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const daysParam = parseInt(request.nextUrl.searchParams.get("days") || "", 10);
    const days = Math.min(Math.max(Number.isFinite(daysParam) ? daysParam : 180, 1), 400);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await prisma.communityReport.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: SITE_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const counts = new Map<string, number>();
    for (const r of rows) {
      const key = fmt.format(r.createdAt);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const daily = Array.from(counts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ daily, days, timezone: SITE_TZ });
  } catch (error) {
    console.error("Console reports-timeseries error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
