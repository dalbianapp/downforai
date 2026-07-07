import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function verifyConsoleAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  const secret = process.env.CONSOLE_SECRET;
  if (!secret) return false; // fail-closed
  return authHeader === `Bearer ${secret}`;
}

// Coherent with the FR/ES/IT console replies and the public callout (~499 chars).
const REPLY_MAX = 499;

// POST /api/console/comments/reply — publish a reply from the Dalbian console.
// 🔴 Writes into the standalone Comment.aiReply — the field shown publicly under the
// comment as "✦ DownForAI Assistant" (see CommentSection). Also ensures the comment is
// visible. A human in the console reviews before publishing; the AI never publishes alone.
// Body: { commentId: string, reply: string }
export async function POST(request: NextRequest) {
  if (!verifyConsoleAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commentId, reply } = await request.json();

    if (!commentId || typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json({ error: "Missing commentId or reply" }, { status: 400 });
    }

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { aiReply: reply.trim().slice(0, REPLY_MAX), isVisible: true },
      select: { id: true },
    });

    return NextResponse.json({ success: true, comment: { id: updated.id } });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
