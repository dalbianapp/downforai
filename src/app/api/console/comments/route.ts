import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CONSOLE_SECRET = process.env.CONSOLE_SECRET;

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${CONSOLE_SECRET}`;
}

// GET /api/console/comments?source=standalone|reports (default: reports)
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

  const source = request.nextUrl.searchParams.get("source");

  try {
    if (source === "standalone") {
      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          select: {
            id: true,
            pseudo: true,
            content: true,
            aiReply: true,
            isVisible: true,
            createdAt: true,
            service: {
              select: { name: true, slug: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1000,
        }),
        prisma.comment.count(),
      ]);
      return NextResponse.json({ comments, total });
    }

    // Default: CommunityReport comments
    const [comments, total] = await Promise.all([
      prisma.communityReport.findMany({
        where: {
          comment: { not: null },
        },
        select: {
          id: true,
          comment: true,
          reportType: true,
          countryCode: true,
          createdAt: true,
          adminReply: true,
          adminReplyAt: true,
          isVisible: true,
          isSpam: true,
          service: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
      prisma.communityReport.count({
        where: {
          comment: { not: null },
        },
      }),
    ]);

    return NextResponse.json({ comments, total });
  } catch (error) {
    console.error("Console comments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/console/comments?id=xxx&source=standalone|reports
export async function DELETE(request: NextRequest) {
  if (!CONSOLE_SECRET) {
    return NextResponse.json(
      { error: "CONSOLE_SECRET not configured" },
      { status: 500 }
    );
  }

  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  const source = request.nextUrl.searchParams.get("source");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    if (source === "standalone") {
      await prisma.comment.update({
        where: { id },
        data: { isVisible: false },
      });
    } else {
      await prisma.communityReport.update({
        where: { id },
        data: { isVisible: false, isSpam: true },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Console delete comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
