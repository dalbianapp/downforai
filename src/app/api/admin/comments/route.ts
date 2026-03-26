import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function verifyAuth(request: NextRequest): boolean {
  const token = request.cookies.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!(adminPassword && token === adminPassword);
}

// GET /api/admin/comments?page=1&serviceSlug=xxx&source=all|report|standalone
export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const serviceSlug = request.nextUrl.searchParams.get("serviceSlug") || "";
  const source = request.nextUrl.searchParams.get("source") || "all";
  const PAGE_SIZE = 20;
  const skip = (page - 1) * PAGE_SIZE;

  try {
    // Build service filter
    let serviceId: string | undefined;
    if (serviceSlug) {
      const svc = await prisma.service.findUnique({ where: { slug: serviceSlug }, select: { id: true } });
      serviceId = svc?.id;
    }

    const reportWhere = {
      comment: { not: null as null },
      ...(serviceId ? { serviceId } : {}),
    };

    const standaloneWhere = {
      ...(serviceId ? { serviceId } : {}),
    };

    // Fetch both sources in parallel
    const [reportComments, standaloneComments, reportTotal, standaloneTotal] = await Promise.all([
      source !== "standalone"
        ? prisma.communityReport.findMany({
            where: reportWhere,
            select: {
              id: true,
              comment: true,
              adminReply: true,
              adminReplyAt: true,
              isVisible: true,
              isSpam: true,
              createdAt: true,
              reportType: true,
              countryCode: true,
              service: { select: { name: true, slug: true } },
            },
            orderBy: { createdAt: "desc" },
            take: source === "all" ? 500 : PAGE_SIZE + skip,
            skip: source === "all" ? 0 : skip,
          })
        : Promise.resolve([]),
      source !== "report"
        ? prisma.comment.findMany({
            where: standaloneWhere,
            select: {
              id: true,
              pseudo: true,
              content: true,
              aiReply: true,
              isVisible: true,
              createdAt: true,
              service: { select: { name: true, slug: true } },
            },
            orderBy: { createdAt: "desc" },
            take: source === "all" ? 500 : PAGE_SIZE + skip,
            skip: source === "all" ? 0 : skip,
          })
        : Promise.resolve([]),
      source !== "standalone" ? prisma.communityReport.count({ where: reportWhere }) : Promise.resolve(0),
      source !== "report" ? prisma.comment.count({ where: standaloneWhere }) : Promise.resolve(0),
    ]);

    // Normalize into a unified list
    const unified = [
      ...reportComments.map((r) => ({
        id: r.id,
        source: "report" as const,
        pseudo: r.countryCode || "Anonymous",
        content: r.comment!,
        reply: r.adminReply,
        repliedAt: r.adminReplyAt,
        isVisible: r.isVisible,
        isSpam: r.isSpam,
        createdAt: r.createdAt,
        service: r.service,
        reportType: r.reportType,
      })),
      ...standaloneComments.map((c) => ({
        id: c.id,
        source: "standalone" as const,
        pseudo: c.pseudo,
        content: c.content,
        reply: c.aiReply,
        repliedAt: null,
        isVisible: c.isVisible,
        isSpam: false,
        createdAt: c.createdAt,
        service: c.service,
        reportType: null,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate the unified list
    const paginated = unified.slice(skip, skip + PAGE_SIZE);
    const total = reportTotal + standaloneTotal;

    return NextResponse.json({
      comments: paginated,
      total,
      page,
      pages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error("Admin comments GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/comments?id=xxx&source=report|standalone
export async function DELETE(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  const source = request.nextUrl.searchParams.get("source");

  if (!id || !source) {
    return NextResponse.json({ error: "id and source required" }, { status: 400 });
  }

  try {
    if (source === "standalone") {
      await prisma.comment.update({ where: { id }, data: { isVisible: false } });
    } else {
      await prisma.communityReport.update({ where: { id }, data: { isVisible: false, isSpam: true } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin comments DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
