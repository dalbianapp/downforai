import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegramAlert } from "@/lib/notifications/telegram";
import { isTier1 } from "@/lib/notifications/tier1";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;
const CHECK_TIMEOUT_MS = 5000; // 5s timeout per check — confirmed present, unchanged
const BATCH_SIZE = 200; // Check 200 surfaces per cron run (fully parallel)
const BOT_UA = "DownForAIStatusBot/1.0 (+https://downforai.com/methodology)";

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${CRON_SECRET}`;
}

type StatusResult = "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";
type ConfidenceLevel = "HIGH" | "LOW";

type CheckResult = {
  status: StatusResult;
  latencyMs: number | null;
  httpStatus: number | null;
  confidence: ConfidenceLevel;
};

type BatchRow = {
  id: string;
  checkUrl: string | null;
  serviceId: string;
  websiteUrl: string | null;
  slug: string;
  lastObservedAt: Date | null;
  lastStatus: string | null;
  lastConfidence: string | null;
  lastHttpStatus: number | null;
};

// Perform HTTP fetch with specified method
async function doFetch(url: string, method: "HEAD" | "GET"): Promise<CheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    const response = await fetch(url, {
      method,
      cache: "no-store", // prevent Vercel/Next.js edge cache from masking real status
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": BOT_UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - start;
    const httpStatus = response.status;

    // 200-299 = clearly operational
    if (response.ok) {
      return {
        status: latencyMs > 5000 ? "DEGRADED" : "OPERATIONAL",
        latencyMs,
        httpStatus,
        confidence: "HIGH",
      };
    }

    // 403/405 = probably blocking us, not actually down
    if (httpStatus === 403 || httpStatus === 405) {
      return {
        status: "UNKNOWN",
        latencyMs,
        httpStatus,
        confidence: "LOW"
      };
    }

    // 429 = alive but overloaded
    if (httpStatus === 429) {
      return {
        status: "DEGRADED",
        latencyMs,
        httpStatus,
        confidence: "HIGH"
      };
    }

    // 5xx = real server error
    if (httpStatus >= 500) {
      return {
        status: "OUTAGE",
        latencyMs,
        httpStatus,
        confidence: "HIGH"
      };
    }

    // Other 4xx (404, etc) = probably operational (URL might be wrong)
    return {
      status: "OPERATIONAL",
      latencyMs,
      httpStatus,
      confidence: "LOW"
    };

  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: "DEGRADED",
        latencyMs: CHECK_TIMEOUT_MS,
        httpStatus: null,
        confidence: "HIGH"
      };
    }

    // DNS failure, connection refused = real outage
    return {
      status: "OUTAGE",
      latencyMs: null,
      httpStatus: null,
      confidence: "HIGH"
    };
  }
}

// Check URL with fallback from HEAD to GET if blocked
async function checkUrl(url: string): Promise<CheckResult> {
  // Try HEAD first (lightweight)
  let result = await doFetch(url, "HEAD");

  // If blocked (403/405), retry with GET
  if (result.httpStatus === 403 || result.httpStatus === 405) {
    result = await doFetch(url, "GET");
  }

  return result;
}

// Generate realistic status for simulation mode (dev)
function generateRealisticStatus(): StatusResult {
  const rand = Math.random();
  if (rand < 0.95) return "OPERATIONAL";
  if (rand < 0.98) return "DEGRADED";
  return "OUTAGE";
}

function generateLatency(status: StatusResult): number | null {
  if (status === "OPERATIONAL") {
    return Math.floor(Math.random() * 300) + 200; // 200-500ms
  }
  if (status === "DEGRADED") {
    return Math.floor(Math.random() * 2000) + 1000; // 1000-3000ms
  }
  return null; // OUTAGE
}

// Support both GET (Vercel Cron) and POST (manual trigger)
export async function GET(request: NextRequest) {
  return handleCheckStatus(request);
}

export async function POST(request: NextRequest) {
  return handleCheckStatus(request);
}

async function handleCheckStatus(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET is not configured");
    return NextResponse.json(
      { error: "Server configuration error: CRON_SECRET not set" },
      { status: 500 }
    );
  }

  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Dry-run params (zero DB writes) ────────────────────────────────────────
  // ?dryRun=1               → fetch all surfaces in batch, log but do not write
  // ?dryRun=1&surfaceId=xxx → fetch a single named surface
  // ?dryRun=1&limit=20      → fetch a small subset
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "1";
  const filterSurfaceId = dryRun ? (searchParams.get("surfaceId") ?? null) : null;
  const limitParam = dryRun ? searchParams.get("limit") : null;
  const batchLimit = limitParam
    ? Math.min(parseInt(limitParam, 10), BATCH_SIZE)
    : BATCH_SIZE;

  const runStart = Date.now();
  const isProduction = process.env.NODE_ENV === "production";
  const mode = isProduction ? (dryRun ? "dry-run" : "production") : "simulation";

  console.log(JSON.stringify({
    event: "cron_start",
    mode,
    dryRun,
    ...(filterSurfaceId && { filterSurfaceId }),
    batchLimit,
    ts: new Date().toISOString(),
  }));

  try {
    const region = await prisma.region.findUnique({ where: { code: "EU" } });
    if (!region) {
      return NextResponse.json({ error: "Region not found" }, { status: 500 });
    }

    if (!isProduction) {
      // ==========================================
      // SIMULATION MODE (development)
      // ==========================================
      const surfaces = await prisma.serviceSurface.findMany({
        where: { isEnabled: true },
      });

      const observations = [];
      const now = new Date();

      for (const surface of surfaces) {
        const status = generateRealisticStatus();
        const latencyMs = generateLatency(status);

        observations.push({
          serviceSurfaceId: surface.id,
          regionId: region.id,
          status,
          latencyMs,
          httpStatus: null,
          confidence: null,
          errorRate: null,
          observedAt: now,
        });
      }

      if (!dryRun) {
        await prisma.observation.createMany({ data: observations });
      }

      return NextResponse.json({
        mode,
        dryRun,
        checked: surfaces.length,
        observations_created: dryRun ? 0 : observations.length,
        ...(dryRun && { note: "DRY-RUN: no observations written to database" }),
      });
    }

    // ==========================================
    // PRODUCTION MODE (real HTTP monitoring)
    // ==========================================

    // Get surfaces that need checking.
    // In dry-run + surfaceId: bypass round-robin, fetch that surface directly.
    // Otherwise: round-robin (oldest first). In production batchLimit === BATCH_SIZE.
    let batchRaw: BatchRow[];

    if (dryRun && filterSurfaceId) {
      batchRaw = await prisma.$queryRaw<BatchRow[]>`
        SELECT
          ss.id,
          ss."checkUrl",
          ss."serviceId",
          s."websiteUrl",
          s.slug,
          o."observedAt" AS "lastObservedAt",
          o.status AS "lastStatus",
          o.confidence AS "lastConfidence",
          o."httpStatus" AS "lastHttpStatus"
        FROM "ServiceSurface" ss
        INNER JOIN "Service" s ON s.id = ss."serviceId"
        LEFT JOIN LATERAL (
          SELECT "observedAt", status, confidence, "httpStatus"
          FROM "Observation"
          WHERE "serviceSurfaceId" = ss.id
          ORDER BY "observedAt" DESC
          LIMIT 1
        ) o ON true
        WHERE ss."isEnabled" = true AND ss.id = ${filterSurfaceId}
        LIMIT 1
      `;
    } else {
      // Raw SQL: sort + limit in DB instead of loading all ~2400 surfaces in memory.
      // batchLimit === BATCH_SIZE (200) in normal production runs — query unchanged.
      batchRaw = await prisma.$queryRaw<BatchRow[]>`
        SELECT
          ss.id,
          ss."checkUrl",
          ss."serviceId",
          s."websiteUrl",
          s.slug,
          o."observedAt" AS "lastObservedAt",
          o.status AS "lastStatus",
          o.confidence AS "lastConfidence",
          o."httpStatus" AS "lastHttpStatus"
        FROM "ServiceSurface" ss
        INNER JOIN "Service" s ON s.id = ss."serviceId"
        LEFT JOIN LATERAL (
          SELECT "observedAt", status, confidence, "httpStatus"
          FROM "Observation"
          WHERE "serviceSurfaceId" = ss.id
          ORDER BY "observedAt" DESC
          LIMIT 1
        ) o ON true
        WHERE ss."isEnabled" = true
        ORDER BY o."observedAt" ASC NULLS FIRST
        LIMIT ${batchLimit}
      `;
    }

    const batch = batchRaw.map((row) => ({
      id: row.id,
      checkUrl: row.checkUrl,
      serviceId: row.serviceId,
      service: { websiteUrl: row.websiteUrl, slug: row.slug },
      observations: row.lastObservedAt ? [{
        observedAt: row.lastObservedAt,
        status: row.lastStatus,
        confidence: row.lastConfidence,
        httpStatus: row.lastHttpStatus,
      }] : [],
    }));

    // Group by service URL to avoid hitting same domain multiple times
    const urlToSurfaces = new Map<string, typeof batch>();
    for (const surface of batch) {
      const url = surface.checkUrl || surface.service.websiteUrl;
      if (!url) continue;
      if (!urlToSurfaces.has(url)) urlToSurfaces.set(url, []);
      urlToSurfaces.get(url)!.push(surface);
    }

    // Check each unique URL
    const observations: Array<{
      serviceSurfaceId: string;
      regionId: string;
      status: StatusResult;
      latencyMs: number | null;
      httpStatus: number | null;
      confidence: ConfidenceLevel;
      errorRate: number | null;
      observedAt: Date;
    }> = [];

    const now = new Date();
    const checkStart = Date.now();

    // Throttled parallel checks — max 20 concurrent to get accurate latency measurements
    const CONCURRENCY = 20;
    const urlEntries = Array.from(urlToSurfaces.entries());
    const results: PromiseSettledResult<{ url: string; surfacesForUrl: typeof batch; result: CheckResult }>[] = [];

    for (let i = 0; i < urlEntries.length; i += CONCURRENCY) {
      const chunk = urlEntries.slice(i, i + CONCURRENCY);
      const chunkResults = await Promise.allSettled(
        chunk.map(async ([url, surfacesForUrl]) => {
          const result = await checkUrl(url);
          return { url, surfacesForUrl, result };
        })
      );
      results.push(...chunkResults);
    }

    for (const settled of results) {
      if (settled.status === "fulfilled") {
        const { surfacesForUrl, result } = settled.value;
        for (const surface of surfacesForUrl) {
          observations.push({
            serviceSurfaceId: surface.id,
            regionId: region.id,
            status: result.status,
            latencyMs: result.latencyMs,
            httpStatus: result.httpStatus,
            confidence: result.confidence,
            errorRate: null,
            observedAt: now,
          });

          console.log(JSON.stringify({
            event: "surface_check",
            dryRun,
            surfaceId: surface.id,
            serviceSlug: surface.service.slug,
            checkUrl: settled.value.url,
            httpStatus: result.httpStatus,
            latencyMs: result.latencyMs,
            statusComputed: result.status,
            confidence: result.confidence,
          }));
        }
      } else {
        console.error("HTTP check failed:", settled.reason);
      }
    }

    const checkElapsedMs = Date.now() - checkStart;

    const statusCounts = {
      OPERATIONAL: observations.filter(o => o.status === "OPERATIONAL").length,
      DEGRADED: observations.filter(o => o.status === "DEGRADED").length,
      OUTAGE: observations.filter(o => o.status === "OUTAGE").length,
      UNKNOWN: observations.filter(o => o.status === "UNKNOWN").length,
    };

    // End-of-run summary log
    console.log(JSON.stringify({
      event: "cron_summary",
      mode,
      dryRun,
      checked: observations.length,
      uniqueUrlsChecked: urlToSurfaces.size,
      results: statusCounts,
      confidence: {
        HIGH: observations.filter(o => o.confidence === "HIGH").length,
        LOW: observations.filter(o => o.confidence === "LOW").length,
      },
      fetchElapsedMs: checkElapsedMs,
      totalElapsedMs: Date.now() - runStart,
    }));

    // Write observations — skipped entirely in dry-run
    if (!dryRun && observations.length > 0) {
      await prisma.observation.createMany({ data: observations });
    }

    // Incident auto-create/resolve — skipped in dry-run (no observations were written)
    if (!dryRun) {
    // Pre-fetch all open incidents for services in this batch — replaces N+1 findFirst
    const batchServiceIds = [...new Set(batch.map(s => s.serviceId))];
    const openIncidentRows = await prisma.incident.findMany({
      where: {
        serviceId: { in: batchServiceIds },
        resolvedAt: null,
      },
      select: { id: true, serviceId: true, startedAt: true, status: true },
    });
    const openIncidentMap = new Map(openIncidentRows.map(i => [i.serviceId, i]));

    // Auto-create incidents on OUTAGE transitions (with anti-flapping)
    // Only create incident if BOTH current AND previous observation are OUTAGE with HIGH confidence
    for (const surface of batch) {
      const prevObs = surface.observations[0];
      const newObs = observations.find(o => o.serviceSurfaceId === surface.id);

      // Anti-flapping: require 2 consecutive OUTAGE checks with HIGH confidence
      if (
        newObs?.status === "OUTAGE" &&
        newObs?.confidence === "HIGH" &&
        prevObs?.status === "OUTAGE" &&
        prevObs?.confidence === "HIGH"
      ) {
        const existingIncident = openIncidentMap.get(surface.serviceId);

        if (!existingIncident) {
          const newIncident = await prisma.incident.create({
            data: {
              serviceId: surface.serviceId,
              title: `${surface.service.slug} experiencing issues`,
              summary: `Our monitoring detected that ${surface.service.slug} may be experiencing an outage.`,
              status: "OPEN",
              severity: "MAJOR",
              sourceBadge: "LIVE_MONITORING",
              startedAt: now,
            },
          });

          // Update map so other surfaces of the same service don't create duplicates
          openIncidentMap.set(surface.serviceId, { id: newIncident.id, serviceId: surface.serviceId, startedAt: now, status: "OPEN" });

          if (isTier1(surface.service.slug)) {
            await sendTelegramAlert(
              `🔴 <b>INCIDENT — ${surface.service.slug}</b>\n\n` +
              `Status: ${newIncident.severity}\n` +
              `Started: ${now.toISOString().slice(0, 16)} UTC\n\n` +
              `→ https://downforai.com/${surface.service.slug}`
            );
          }
        }
      }

      // Auto-resolve incidents when back to OPERATIONAL
      // Fix: no longer requires prevObs === "OUTAGE" — resolves whenever service returns OPERATIONAL
      if (newObs?.status === "OPERATIONAL") {
        const openIncident = openIncidentMap.get(surface.serviceId);

        if (openIncident) {
          // Only resolve if incident has been open for at least 10 minutes
          const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
          if (openIncident.startedAt < tenMinAgo) {
            await prisma.incident.update({
              where: { id: openIncident.id },
              data: {
                resolvedAt: now,
                status: "RESOLVED"
              },
            });

            // Remove from map so other surfaces of the same service don't re-resolve
            openIncidentMap.delete(surface.serviceId);

            if (isTier1(surface.service.slug)) {
              const durationMinutes = Math.round(
                (now.getTime() - openIncident.startedAt.getTime()) / 60000
              );
              const durationStr =
                durationMinutes < 60
                  ? `${durationMinutes}m`
                  : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;
              await sendTelegramAlert(
                `🟢 <b>RESOLVED — ${surface.service.slug}</b>\n\n` +
                `Duration: ${durationStr}\n\n` +
                `→ https://downforai.com/${surface.service.slug}`
              );
            }
          }
        }
      }
    }
    } // end if (!dryRun) — incident logic

    return NextResponse.json({
      mode,
      dryRun,
      checked: observations.length,
      batch_size: batchLimit,
      total_surfaces: batch.length,
      unique_urls_checked: urlToSurfaces.size,
      elapsed_ms: checkElapsedMs,
      results: statusCounts,
      confidence: {
        HIGH: observations.filter(o => o.confidence === "HIGH").length,
        LOW: observations.filter(o => o.confidence === "LOW").length,
      },
      ...(dryRun && { note: "DRY-RUN: no observations written to database" }),
    });

  } catch (error) {
    console.error("Cron check-status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
