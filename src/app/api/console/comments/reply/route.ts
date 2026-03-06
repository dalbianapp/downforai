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
    const { commentId, reply } = await request.json();

    if (!commentId || !reply) {
      return NextResponse.json({ error: "Missing commentId or reply" }, { status: 400 });
    }

    const updated = await prisma.communityReport.update({
      where: { id: commentId },
      data: {
        adminReply: reply,
        adminReplyAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
