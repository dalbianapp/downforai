import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CONSOLE_SECRET = process.env.CONSOLE_SECRET;

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${CONSOLE_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!CONSOLE_SECRET) {
    return NextResponse.json({ error: "CONSOLE_SECRET not configured" }, { status: 500 });
  }
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStartParis = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    todayStartParis.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, today, week, month, topServices, recentClicks] = await Promise.all([
      prisma.affiliateClick.count(),
      prisma.affiliateClick.count({ where: { createdAt: { gte: todayStartParis } } }),
      prisma.affiliateClick.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.affiliateClick.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.affiliateClick.groupBy({
        by: ['serviceName'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.affiliateClick.findMany({
        orderBy: { createdAt: 'desc' },
        ...(request.nextUrl.searchParams.get('all') === 'true' ? {} : { take: 20 }),
      }),
    ]);

    return NextResponse.json({
      total,
      today,
      week,
      month,
      topServices: topServices.map(s => ({ name: s.serviceName, clicks: s._count.id })),
      recentClicks: recentClicks.map(c => ({
        date: c.createdAt.toISOString(),
        service: c.serviceName,
        page: c.page,
      })),
    });
  } catch (error) {
    console.error("Console affiliate error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
