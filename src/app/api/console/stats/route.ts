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
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [services, reports24h, reportsWithComments, activeIncidents] = await Promise.all([
      prisma.service.count(),
      prisma.communityReport.count({
        where: {
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      prisma.communityReport.count({
        where: {
          comment: { not: null },
        },
      }),
      prisma.incident.count({
        where: {
          status: { in: ["OPEN", "MONITORING"] },
        },
      }),
    ]);

    return NextResponse.json({
      services,
      reports24h,
      reportsWithComments,
      activeIncidents,
    });
  } catch (error) {
    console.error("Console stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
