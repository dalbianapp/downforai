import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function verifyAuth(request: NextRequest): boolean {
  const token = request.cookies.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!(adminPassword && token === adminPassword);
}

// POST /api/admin/comments/reply
// Body: { id, source: "report"|"standalone", content, serviceName, manualReply? }
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, source, content, serviceName, manualReply } = await request.json();

  if (!id || !source || !content || !serviceName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    let reply: string;

    if (manualReply) {
      reply = manualReply;
    } else {
      // Generate AI reply via Claude Haiku
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system:
          "You are a helpful AI status assistant for downforai.com. Respond briefly (2-3 sentences) in English to user comments about AI service issues. Be empathetic and suggest practical solutions.",
        messages: [
          {
            role: "user",
            content: `User comment about ${serviceName}: "${content}"`,
          },
        ],
      });

      reply = message.content[0].type === "text" ? message.content[0].text.trim() : "";
      if (!reply) {
        return NextResponse.json({ error: "AI reply generation failed" }, { status: 500 });
      }
    }

    // Save reply to appropriate model
    if (source === "standalone") {
      await prisma.comment.update({ where: { id }, data: { aiReply: reply } });
    } else {
      await prisma.communityReport.update({
        where: { id },
        data: { adminReply: reply, adminReplyAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("Admin reply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
