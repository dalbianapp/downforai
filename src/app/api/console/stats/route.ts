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
    // Minuit heure de Paris (Europe/Paris)
    // Get today's date in Paris timezone
    const dateInParis = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }); // "2026-03-04"

    // Calculate UTC offset for Paris timezone
    // Create a test date at midday UTC to determine the offset
    const testUTC = new Date(dateInParis + 'T12:00:00.000Z');
    const hourInParis = parseInt(
      new Intl.DateTimeFormat('en', {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        hour12: false
      }).format(testUTC)
    );

    // Calculate offset (Paris = UTC + offset)
    const utcOffset = hourInParis - 12;

    // Midnight in Paris = midnight on dateInParis, shifted by -offset hours in UTC
    const midnightUTC = new Date(dateInParis + 'T00:00:00.000Z');
    const midnightParisUTC = new Date(midnightUTC.getTime() - utcOffset * 3600000);

    const [services, reportsToday, reportsWithComments, totalComments, pendingComments, activeIncidents] = await Promise.all([
      prisma.service.count(),
      prisma.communityReport.count({
        where: {
          createdAt: { gte: midnightParisUTC },
        },
      }),
      prisma.communityReport.count({
        where: {
          comment: { not: null },
        },
      }),
      prisma.communityReport.count({
        where: {
          comment: { not: null },
        },
      }),
      prisma.communityReport.count({
        where: {
          comment: { not: null },
          adminReply: null,
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
      reportsToday,
      reportsWithComments,
      totalComments,
      pendingComments,
      activeIncidents,
    });
  } catch (error) {
    console.error("Console stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
