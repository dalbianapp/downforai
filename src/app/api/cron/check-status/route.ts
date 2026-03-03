import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CRON_SECRET = process.env.CRON_SECRET;
const CHECK_TIMEOUT_MS = 8000; // 8s timeout per check
const BATCH_SIZE = 40; // Check 40 surfaces per cron run

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

// Perform HTTP fetch with specified method
async function doFetch(url: string, method: "HEAD" | "GET"): Promise<CheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    const response = await fetch(url, {
      method,
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DownForAI-Monitor/1.0; +https://downforai.com)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
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

export async function POST(request: NextRequest) {
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

  const isProduction = process.env.NODE_ENV === "production";
  const mode = isProduction ? "production" : "simulation";

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

      await prisma.observation.createMany({
        data: observations,
      });

      return NextResponse.json({
        mode,
        checked: surfaces.length,
        observations_created: observations.length,
      });
    }

    // ==========================================
    // PRODUCTION MODE (real HTTP monitoring)
    // ==========================================

    // Get surfaces that need checking (oldest first = round-robin)
    const surfacesWithData = await prisma.serviceSurface.findMany({
      where: { isEnabled: true },
      include: {
        service: { select: { websiteUrl: true, slug: true } },
        observations: {
          orderBy: { observedAt: "desc" },
          take: 1,
          select: { observedAt: true, status: true, confidence: true, httpStatus: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Sort by oldest observation (surfaces not checked recently first)
    const sorted = surfacesWithData.sort((a, b) => {
      const aTime = a.observations[0]?.observedAt?.getTime() || 0;
      const bTime = b.observations[0]?.observedAt?.getTime() || 0;
      return aTime - bTime;
    });

    // Take BATCH_SIZE surfaces to check this run
    const batch = sorted.slice(0, BATCH_SIZE);

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

    // Parallelize checks in chunks to avoid timeout (10 concurrent max)
    const urlEntries = Array.from(urlToSurfaces.entries());
    const CONCURRENT_LIMIT = 10;

    for (let i = 0; i < urlEntries.length; i += CONCURRENT_LIMIT) {
      const chunk = urlEntries.slice(i, i + CONCURRENT_LIMIT);

      const results = await Promise.allSettled(
        chunk.map(async ([url, surfacesForUrl]) => {
          const result = await checkUrl(url);
          return { url, surfacesForUrl, result };
        })
      );

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
          }
        } else {
          // Check completely failed (shouldn't happen often due to checkUrl's try/catch)
          console.error("HTTP check failed:", settled.reason);
        }
      }
    }

    // Bulk insert observations
    if (observations.length > 0) {
      await prisma.observation.createMany({ data: observations });
    }

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
        // Check if there's already an open incident for this service
        const existingIncident = await prisma.incident.findFirst({
          where: {
            serviceId: surface.serviceId,
            resolvedAt: null,
          },
        });

        if (!existingIncident) {
          await prisma.incident.create({
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
        }
      }

      // Auto-resolve incidents when back to OPERATIONAL
      if (newObs?.status === "OPERATIONAL" && prevObs?.status === "OUTAGE") {
        const openIncident = await prisma.incident.findFirst({
          where: {
            serviceId: surface.serviceId,
            resolvedAt: null,
          },
        });

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
          }
        }
      }
    }

    return NextResponse.json({
      mode,
      checked: observations.length,
      batch_size: BATCH_SIZE,
      total_surfaces: surfacesWithData.length,
      unique_urls_checked: urlToSurfaces.size,
      results: {
        OPERATIONAL: observations.filter(o => o.status === "OPERATIONAL").length,
        DEGRADED: observations.filter(o => o.status === "DEGRADED").length,
        OUTAGE: observations.filter(o => o.status === "OUTAGE").length,
        UNKNOWN: observations.filter(o => o.status === "UNKNOWN").length,
      },
      confidence: {
        HIGH: observations.filter(o => o.confidence === "HIGH").length,
        LOW: observations.filter(o => o.confidence === "LOW").length,
      },
    });

  } catch (error) {
    console.error("Cron check-status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
