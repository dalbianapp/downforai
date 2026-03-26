import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function verifyAuth(request: NextRequest): boolean {
  const token = request.cookies.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!(adminPassword && token === adminPassword);
}

export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      services,
      reportsToday,
      pendingReportComments,
      pendingStandaloneComments,
      activeIncidents,
      totalStandaloneComments,
      recentReports,
      recentComments,
      topReportedGroups,
      topCommentedGroups,
    ] = await Promise.all([
      prisma.service.count(),
      prisma.communityReport.count({ where: { createdAt: { gte: todayUTC } } }),
      prisma.communityReport.count({ where: { comment: { not: null }, adminReply: null } }),
      prisma.comment.count({ where: { isVisible: true, aiReply: null } }),
      prisma.incident.count({ where: { status: { in: ["OPEN", "MONITORING"] } } }),
      prisma.comment.count({ where: { isVisible: true } }),
      prisma.communityReport.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.comment.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.communityReport.groupBy({
        by: ["serviceId"],
        _count: { id: true },
        where: { createdAt: { gte: todayUTC } },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.comment.groupBy({
        by: ["serviceId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

    // Build 7-day buckets (UTC dates)
    function buildDayBuckets(records: { createdAt: Date }[]) {
      const buckets: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      for (const r of records) {
        const day = r.createdAt.toISOString().slice(0, 10);
        if (buckets[day] !== undefined) buckets[day]++;
      }
      return Object.entries(buckets).map(([date, count]) => ({
        date: date.slice(5), // MM-DD
        count,
      }));
    }

    // Resolve top reported service names
    const reportedIds = topReportedGroups.map((r) => r.serviceId);
    const commentedIds = topCommentedGroups.map((c) => c.serviceId);
    const allIds = [...new Set([...reportedIds, ...commentedIds])];
    const svcList = await prisma.service.findMany({
      where: { id: { in: allIds } },
      select: { id: true, name: true, slug: true },
    });
    const svcMap = Object.fromEntries(svcList.map((s) => [s.id, s]));

    const topReportedToday = topReportedGroups.map((r) => ({
      name: svcMap[r.serviceId]?.name || r.serviceId,
      slug: svcMap[r.serviceId]?.slug || "",
      count: r._count.id,
    }));
    const topCommented = topCommentedGroups.map((c) => ({
      name: svcMap[c.serviceId]?.name || c.serviceId,
      slug: svcMap[c.serviceId]?.slug || "",
      count: c._count.id,
    }));

    return NextResponse.json({
      services,
      reportsToday,
      pendingComments: pendingReportComments + pendingStandaloneComments,
      activeIncidents,
      totalStandaloneComments,
      reportsLast7Days: buildDayBuckets(recentReports),
      commentsLast7Days: buildDayBuckets(recentComments),
      topReportedToday,
      topCommented,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
