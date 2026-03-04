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
    const incidents = await prisma.incident.findMany({
      where: {
        status: { in: ["OPEN", "MONITORING"] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        startedAt: true,
        service: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("Console incidents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
