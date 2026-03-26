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

  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const dateRange = request.nextUrl.searchParams.get("dateRange") || "all";
  const serviceSlug = request.nextUrl.searchParams.get("serviceSlug") || "";
  const PAGE_SIZE = 50;
  const skip = (page - 1) * PAGE_SIZE;

  // Date filter
  let dateFrom: Date | undefined;
  if (dateRange === "today") {
    dateFrom = new Date();
    dateFrom.setUTCHours(0, 0, 0, 0);
  } else if (dateRange === "7d") {
    dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (dateRange === "30d") {
    dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  try {
    // Service filter
    let serviceId: string | undefined;
    if (serviceSlug) {
      const svc = await prisma.service.findUnique({ where: { slug: serviceSlug }, select: { id: true } });
      serviceId = svc?.id;
    }

    const where = {
      ...(dateFrom ? { createdAt: { gte: dateFrom } } : {}),
      ...(serviceId ? { serviceId } : {}),
    };

    const [reports, total, typeSummary] = await Promise.all([
      prisma.communityReport.findMany({
        where,
        select: {
          id: true,
          createdAt: true,
          countryCode: true,
          reportType: true,
          comment: true,
          isVisible: true,
          isSpam: true,
          service: { select: { name: true, slug: true } },
          surface: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip,
      }),
      prisma.communityReport.count({ where }),
      prisma.communityReport.groupBy({
        by: ["reportType"],
        _count: { id: true },
        where,
      }),
    ]);

    const typeCounts = Object.fromEntries(typeSummary.map((t) => [t.reportType, t._count.id]));

    return NextResponse.json({
      reports,
      total,
      page,
      pages: Math.ceil(total / PAGE_SIZE),
      typeCounts,
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
