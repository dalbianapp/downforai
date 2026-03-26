import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createHash } from "crypto";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function hashIp(ip: string): string {
  return createHash("sha256").update(ip + (process.env.IP_SALT || "downforai")).digest("hex");
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// GET /api/comments?serviceSlug=xxx
export async function GET(request: NextRequest) {
  const serviceSlug = request.nextUrl.searchParams.get("serviceSlug");
  if (!serviceSlug) {
    return NextResponse.json({ error: "serviceSlug required" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
    select: { id: true },
  });
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { serviceId: service.id, isVisible: true },
    select: {
      id: true,
      pseudo: true,
      content: true,
      aiReply: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ comments });
}

// POST /api/comments
export async function POST(request: NextRequest) {
  let body: { serviceSlug?: string; pseudo?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { serviceSlug, pseudo, content } = body;
  if (!serviceSlug || !content?.trim()) {
    return NextResponse.json({ error: "serviceSlug and content are required" }, { status: 400 });
  }
  if (content.trim().length > 1000) {
    return NextResponse.json({ error: "Comment too long (max 1000 chars)" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
    select: { id: true, name: true },
  });
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Rate limiting: max 3 comments per hour per IP
  const ip = getIp(request);
  const ipHash = hashIp(ip);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentCount = await prisma.comment.count({
    where: {
      ipHash,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentCount >= 3) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before posting again." },
      { status: 429 }
    );
  }

  const cleanPseudo = pseudo?.trim().slice(0, 50) || "Anonymous";
  const cleanContent = content.trim();

  // Create comment first
  const comment = await prisma.comment.create({
    data: {
      serviceId: service.id,
      pseudo: cleanPseudo,
      content: cleanContent,
      ipHash,
    },
    select: { id: true, pseudo: true, content: true, aiReply: true, createdAt: true },
  });

  // Generate AI reply asynchronously (don't await — return comment immediately)
  generateAiReply(comment.id, service.name, cleanContent).catch(console.error);

  return NextResponse.json({ comment }, { status: 201 });
}

async function generateAiReply(commentId: string, serviceName: string, content: string) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `You are a helpful assistant for DownForAI, a service status monitoring site for AI services. A user left a comment about ${serviceName}. Reply helpfully and concisely in the same language as the comment. Keep your reply under 3 sentences. Do not repeat the service name unnecessarily.\n\nUser comment: "${content}"`,
        },
      ],
    });

    const aiReply =
      message.content[0].type === "text" ? message.content[0].text.trim() : null;

    if (aiReply) {
      await prisma.comment.update({
        where: { id: commentId },
        data: { aiReply },
      });
    }
  } catch (err) {
    console.error("AI reply generation failed:", err);
  }
}
