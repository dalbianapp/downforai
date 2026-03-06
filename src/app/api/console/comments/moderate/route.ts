import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function verifyConsoleAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  const secret = process.env.CONSOLE_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!verifyConsoleAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commentId, action } = await request.json();
    // action: "hide" | "show" | "spam" | "delete"

    if (!commentId || !action) {
      return NextResponse.json({ error: "Missing commentId or action" }, { status: 400 });
    }

    if (action === "delete") {
      await prisma.communityReport.delete({ where: { id: commentId } });
      return NextResponse.json({ success: true, deleted: true });
    }

    const data: any = {};
    if (action === "hide") data.isVisible = false;
    if (action === "show") data.isVisible = true;
    if (action === "spam") {
      data.isSpam = true;
      data.isVisible = false;
    }

    const updated = await prisma.communityReport.update({
      where: { id: commentId },
      data,
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    console.error("Moderate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
