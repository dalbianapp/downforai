import { NextRequest, NextResponse } from "next/server";
import { runCommunityDetect } from "@/lib/community/runCommunityDetect";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

function verifyAuth(request: NextRequest): boolean {
  return request.headers.get("Authorization") === `Bearer ${CRON_SECRET}`;
}

async function handle(request: NextRequest) {
  if (!CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ?dryRun=1 → compute + report, zero writes.
  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
  try {
    const result = await runCommunityDetect({ dryRun });
    return NextResponse.json(result);
  } catch (error) {
    console.error("community-detect cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}
export async function POST(request: NextRequest) {
  return handle(request);
}
