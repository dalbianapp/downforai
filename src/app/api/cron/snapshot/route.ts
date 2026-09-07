import { NextRequest, NextResponse } from "next/server";
import { buildSnapshots } from "@/lib/snapshot/build";
import { putJson } from "@/lib/snapshot/blob";
import { servicePath, indexPath } from "@/lib/snapshot/paths";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const CRON_SECRET = process.env.CRON_SECRET;
const WRITE_CONCURRENCY = 25;

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${CRON_SECRET}`;
}

// Runs every hour (vercel.json), a few minutes after check-status /
// check-status-pages so it snapshots fresh observations. Builds every
// service's status snapshot from a handful of GROUPED queries (build.ts),
// then writes one small JSON blob per service plus one index blob — this is
// the ONLY thing that queries Neon for service pages / home / category /
// opengraph-image; those read the blobs instead (src/lib/snapshot/read.ts).
async function runBatched<T>(items: T[], concurrency: number, task: (item: T) => Promise<void>): Promise<number> {
  let cursor = 0;
  let failures = 0;
  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor++];
      try {
        await task(item);
      } catch (err) {
        failures += 1;
        console.error("Snapshot write failed:", err);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return failures;
}

export async function GET(request: NextRequest) {
  return handleSnapshot(request);
}

export async function POST(request: NextRequest) {
  return handleSnapshot(request);
}

async function handleSnapshot(request: NextRequest) {
  if (!CRON_SECRET) {
    console.error("CRON_SECRET is not configured");
    return NextResponse.json({ error: "Server configuration error: CRON_SECRET not set" }, { status: 500 });
  }
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  try {
    const { services, index } = await buildSnapshots();

    const entries = Array.from(services.entries());
    const failures = await runBatched(entries, WRITE_CONCURRENCY, async ([slug, snapshot]) => {
      await putJson(servicePath(slug), snapshot);
    });
    await putJson(indexPath(), index);

    return NextResponse.json({
      services_written: entries.length - failures,
      write_failures: failures,
      duration_ms: Date.now() - startedAt,
      generated_at: index.generatedAt,
    });
  } catch (error) {
    console.error("Cron snapshot error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
