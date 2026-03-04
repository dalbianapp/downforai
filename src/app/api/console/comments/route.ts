import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
