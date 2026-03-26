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
    const incidents = await prisma.incident.findMany({
      where: { status: { in: ["OPEN", "MONITORING"] } },
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        startedAt: true,
        service: { select: { name: true, slug: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("Admin incidents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/incidents — resolve an incident
export async function PATCH(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await prisma.incident.update({
      where: { id },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin resolve incident error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
