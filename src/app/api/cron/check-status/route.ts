import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegramAlert } from "@/lib/notifications/telegram";
import { isTier1 } from "@/lib/notifications/tier1";
import { deriveFinalStatus, type CheckTypeVal, type StatusResult as DeriveStatusResult, type StatusSourceVal } from "@/lib/monitoring/deriveStatus";
import { classifyProbeHTTP, classifyProbeError, probeConfidence, type ProbeResultVal } from "@/lib/monitoring/classifyProbe";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;
const CHECK_TIMEOUT_MS = 5000; // 5s timeout per check — confirmed present, unchanged
const BATCH_SIZE = 200; // Check 200 surfaces per cron run (fully parallel)
const BOT_UA = "DownForAIStatusBot/1.0 (+https://downforai.com/methodology)";

// ── Canary feature flags (PR 3: off by default — status displayed is still httpDerivedStatus) ──
// USE_DERIVED_STATUS=true  → use deriveFinalStatus() for the `status` field (canary PR)
// DERIVED_STATUS_ALLOWLIST → comma-separated slugs; if non-empty, only those slugs use derived status
const USE_DERIVED_STATUS = process.env.USE_DERIVED_STATUS === "true";
const DERIVED_STATUS_ALLOWLIST = (process.env.DERIVED_STATUS_ALLOWLIST ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${CRON_SECRET}`;
}

type StatusResult = "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";
type ConfidenceLevel = "HIGH" | "LOW";

type AtlassianShadow = {
  shadowStatus: StatusResult;
  indicator: string | null;
  parseOk: boolean;
  parseError?: string;
};

type CheckResult = {
  status: StatusResult;
  latencyMs: number | null;
  httpStatus: number | null;
  confidence: ConfidenceLevel;
  bodyText?: string;
  probeResult: ProbeResultVal;
};

type BatchRow = {
  id: string;
  displayName: string;
  checkUrl: string | null;
  checkType: string;
  signalConfidence: string;
  serviceId: string;
  websiteUrl: string | null;
  slug: string;
  lastObservedAt: Date | null;
  lastStatus: string | null;
  lastConfidence: string | null;
  lastHttpStatus: number | null;
  lastProbeResult: string | null;
  prevProbeResult: string | null;
};

// Perform HTTP fetch with specified method.
// Uses classifyProbe* to map the raw result to (probeResult, httpDerivedStatus).
// PR 6: 403/429/timeout → UNKNOWN (never OUTAGE); 5xx/DNS/conn-fail → OUTAGE.
async function doFetch(url: string, method: "HEAD" | "GET", captureBody = false): Promise<CheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    const response = await fetch(url, {
      method,
      cache: "no-store",
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
    const classified = classifyProbeHTTP(httpStatus);
    const bodyText = captureBody && method === "GET" && response.ok ? await response.text() : undefined;

    return {
      status: classified.httpDerivedStatus as StatusResult,
      latencyMs,
      httpStatus,
      confidence: probeConfidence(classified.probeResult),
      probeResult: classified.probeResult,
      ...(bodyText !== undefined && { bodyText }),
    };

  } catch (error: unknown) {
    const classified = classifyProbeError(error);
    return {
      status: classified.httpDerivedStatus as StatusResult,
      latencyMs: error instanceof Error && error.name === "AbortError" ? CHECK_TIMEOUT_MS : null,
      httpStatus: null,
      confidence: probeConfidence(classified.probeResult),
      probeResult: classified.probeResult,
    };
  }
}

// Check URL with fallback from HEAD to GET if blocked.
// For Atlassian JSON endpoints, go straight to GET to capture body for shadow parsing.
async function checkUrl(url: string, isAtlassian = false): Promise<CheckResult> {
  if (isAtlassian) {
    return doFetch(url, "GET", true);
  }
  // Try HEAD first (lightweight)
  let result = await doFetch(url, "HEAD");

  // If blocked (403/405), retry with GET
  if (result.httpStatus === 403 || result.httpStatus === 405) {
    result = await doFetch(url, "GET");
  }

  return result;
}

function parseAtlassianIndicator(indicator: string): StatusResult {
  if (indicator === "none") return "OPERATIONAL";
  if (indicator === "minor") return "DEGRADED";
  if (indicator === "major" || indicator === "critical") return "OUTAGE";
  if (indicator === "maintenance") return "DEGRADED";
  return "OPERATIONAL"; // unknown value → fail-safe: never produce a false alarm
}

function parseAtlassianBody(bodyText: string): AtlassianShadow {
  try {
    const json = JSON.parse(bodyText) as { status?: { indicator?: string } };
    const indicator = json?.status?.indicator;
    if (typeof indicator !== "string" || !indicator) {
      return { shadowStatus: "OPERATIONAL", indicator: null, parseOk: false, parseError: "indicator_missing" };
    }
    return { shadowStatus: parseAtlassianIndicator(indicator), indicator, parseOk: true };
  } catch {
    return { shadowStatus: "OPERATIONAL", indicator: null, parseOk: false, parseError: "json_parse_error" };
  }
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
          ss."displayName",
          ss."checkUrl",
          ss."checkType",
          ss."signalConfidence",
          ss."serviceId",
          s."websiteUrl",
          s.slug,
          o."lastObservedAt",
          o."lastStatus",
          o."lastConfidence",
          o."lastHttpStatus",
          o."lastProbeResult",
          o."prevProbeResult"
        FROM "ServiceSurface" ss
        INNER JOIN "Service" s ON s.id = ss."serviceId"
        LEFT JOIN LATERAL (
          SELECT
            MAX(r."observedAt")                                                AS "lastObservedAt",
            (ARRAY_AGG(r.status::text        ORDER BY r."observedAt" DESC))[1] AS "lastStatus",
            (ARRAY_AGG(r.confidence          ORDER BY r."observedAt" DESC))[1] AS "lastConfidence",
            (ARRAY_AGG(r."httpStatus"        ORDER BY r."observedAt" DESC))[1] AS "lastHttpStatus",
            (ARRAY_AGG(r."probeResult"::text ORDER BY r."observedAt" DESC))[1] AS "lastProbeResult",
            (ARRAY_AGG(r."probeResult"::text ORDER BY r."observedAt" DESC))[2] AS "prevProbeResult"
          FROM (
            SELECT "observedAt", status, confidence, "httpStatus", "probeResult"
            FROM "Observation"
            WHERE "serviceSurfaceId" = ss.id
            ORDER BY "observedAt" DESC
            LIMIT 2
          ) r
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
          ss."displayName",
          ss."checkUrl",
          ss."checkType",
          ss."signalConfidence",
          ss."serviceId",
          s."websiteUrl",
          s.slug,
          o."lastObservedAt",
          o."lastStatus",
          o."lastConfidence",
          o."lastHttpStatus",
          o."lastProbeResult",
          o."prevProbeResult"
        FROM "ServiceSurface" ss
        INNER JOIN "Service" s ON s.id = ss."serviceId"
        LEFT JOIN LATERAL (
          SELECT
            MAX(r."observedAt")                                                AS "lastObservedAt",
            (ARRAY_AGG(r.status::text        ORDER BY r."observedAt" DESC))[1] AS "lastStatus",
            (ARRAY_AGG(r.confidence          ORDER BY r."observedAt" DESC))[1] AS "lastConfidence",
            (ARRAY_AGG(r."httpStatus"        ORDER BY r."observedAt" DESC))[1] AS "lastHttpStatus",
            (ARRAY_AGG(r."probeResult"::text ORDER BY r."observedAt" DESC))[1] AS "lastProbeResult",
            (ARRAY_AGG(r."probeResult"::text ORDER BY r."observedAt" DESC))[2] AS "prevProbeResult"
          FROM (
            SELECT "observedAt", status, confidence, "httpStatus", "probeResult"
            FROM "Observation"
            WHERE "serviceSurfaceId" = ss.id
            ORDER BY "observedAt" DESC
            LIMIT 2
          ) r
        ) o ON true
        WHERE ss."isEnabled" = true
        ORDER BY o."lastObservedAt" ASC NULLS FIRST
        LIMIT ${batchLimit}
      `;
    }

    const batch = batchRaw.map((row) => ({
      id: row.id,
      displayName: row.displayName,
      checkUrl: row.checkUrl,
      checkType: row.checkType as CheckTypeVal,
      signalConfidence: (row.signalConfidence as "HIGH" | "MEDIUM" | "LOW") ?? "LOW",
      serviceId: row.serviceId,
      service: { websiteUrl: row.websiteUrl, slug: row.slug },
      observations: row.lastObservedAt ? [{
        observedAt: row.lastObservedAt,
        status: row.lastStatus,
        confidence: row.lastConfidence,
        httpStatus: row.lastHttpStatus,
        probeResult: row.lastProbeResult ?? null,
        prevProbeResult: row.prevProbeResult ?? null,
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

    // URLs using Atlassian JSON format — detected by endpoint pattern, used for shadow parsing
    const atlassianUrls = new Set<string>(
      Array.from(urlToSurfaces.keys()).filter(u => u.endsWith("/api/v2/status.json"))
    );

    // Per-surface detail for dry-run response
    const surfaceDetails: Array<{
      surfaceId: string;
      serviceSlug: string;
      surfaceName: string;
      checkUrl: string;
      httpStatus: number | null;
      latencyMs: number | null;
      probeResult: ProbeResultVal;
      statusComputed: StatusResult;
      statusWritten: StatusResult;
      confidence: ConfidenceLevel;
      shadowStatus?: StatusResult;
      indicator?: string | null;
      parseOk?: boolean;
      officialStatus: StatusResult | null;
      httpDerivedStatus: StatusResult;
      finalStatus: StatusResult;
      statusSource: string;
    }> = [];

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
      officialStatus: StatusResult | null;
      httpDerivedStatus: StatusResult | null;
      statusSource: StatusSourceVal | null;
      parseOk: boolean | null;
      parseError: string | null;
      probeResult: ProbeResultVal | null;
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
          const result = await checkUrl(url, atlassianUrls.has(url));
          return { url, surfacesForUrl, result };
        })
      );
      results.push(...chunkResults);
    }

    // ── Phase 1: compute all signals, collect staged entries ─────────────────
    const staged: Array<{
      surface: (typeof batch)[number];
      url: string;
      result: CheckResult;
      shadow: AtlassianShadow | null;
      isAtlassian: boolean;
      httpDerivedStatus: StatusResult;
      officialStatus: DeriveStatusResult | null;
      deriveResult: ReturnType<typeof deriveFinalStatus>;
      obsParseOk: boolean | null;
      obsParseError: string | null;
      useDerived: boolean;
    }> = [];

    for (const settled of results) {
      if (settled.status === "fulfilled") {
        const { url, surfacesForUrl, result } = settled.value;

        let shadow: AtlassianShadow | null = null;
        const isAtlassian = atlassianUrls.has(url);
        if (isAtlassian && result.bodyText) {
          const parsed = parseAtlassianBody(result.bodyText);
          shadow = parsed.parseOk ? parsed : { ...parsed, shadowStatus: result.status };
        }

        const httpDerivedStatus = result.status;
        const officialStatus: DeriveStatusResult | null =
          (isAtlassian && shadow?.parseOk === true) ? shadow.shadowStatus : null;
        const deriveParseOk = isAtlassian ? (shadow?.parseOk ?? false) : true;
        const urlCheckType = surfacesForUrl[0]?.checkType ?? "HOMEPAGE";
        const deriveResult = deriveFinalStatus({
          officialStatus, httpDerivedStatus, checkType: urlCheckType, parseOk: deriveParseOk,
        });
        const obsParseOk: boolean | null   = isAtlassian ? (shadow?.parseOk ?? false) : null;
        const obsParseError: string | null = isAtlassian ? (shadow?.parseError ?? null) : null;

        for (const surface of surfacesForUrl) {
          const useDerived =
            USE_DERIVED_STATUS &&
            (DERIVED_STATUS_ALLOWLIST.length === 0 ||
              DERIVED_STATUS_ALLOWLIST.includes(surface.service.slug));

          if (shadow) {
            console.log(JSON.stringify({
              event: "shadow_compare",
              serviceSlug: surface.service.slug,
              checkType: "ATLASSIAN_JSON",
              httpDerivedStatus,
              officialStatus,
              finalStatus: deriveResult.finalStatus,
              statusSource: deriveResult.statusSource,
              indicator: shadow.indicator,
              parseOk: shadow.parseOk,
              ...(shadow.parseError && { parseError: shadow.parseError }),
              divergence: deriveResult.finalStatus !== httpDerivedStatus,
            }));
          }

          staged.push({ surface, url, result, shadow, isAtlassian, httpDerivedStatus, officialStatus, deriveResult, obsParseOk, obsParseError, useDerived });
        }
      } else {
        console.error("HTTP check failed:", settled.reason);
      }
    }

    // ── Explosion guard: >3 allowlist services simultaneously OUTAGE via derivation → likely a bug ──
    // Parse failure guard is already handled: deriveFinalStatus() with parseOk=false returns
    // httpDerivedStatus (FALLBACK path), so writtenStatus === httpDerivedStatus for failed parses.
    const EXPLOSION_THRESHOLD = 10;
    const allowlistDerivedOutageCount = staged.filter(
      s => s.useDerived && s.deriveResult.finalStatus === "OUTAGE"
    ).length;
    const explosionGuardActive = USE_DERIVED_STATUS && allowlistDerivedOutageCount > EXPLOSION_THRESHOLD;

    if (explosionGuardActive) {
      console.log(JSON.stringify({
        event: "derived_status_alert",
        reason: "explosion_guard_triggered",
        allowlistDerivedOutageCount,
        threshold: EXPLOSION_THRESHOLD,
        affectedSlugs: staged
          .filter(s => s.useDerived && s.deriveResult.finalStatus === "OUTAGE")
          .map(s => s.surface.service.slug),
        action: "reverting_derived_OUTAGE_to_httpDerivedStatus_this_run",
      }));
    }

    // ── Phase 2: finalize writtenStatus and build observation arrays ──────────
    for (const s of staged) {
      const { surface, url, result, shadow, isAtlassian, httpDerivedStatus, officialStatus, deriveResult, obsParseOk, obsParseError, useDerived } = s;

      // Explosion guard: revert only derived OUTAGEs, keep derived DEGRADED as-is
      const candidateStatus: StatusResult = useDerived ? deriveResult.finalStatus : httpDerivedStatus;
      const writtenStatus: StatusResult =
        (explosionGuardActive && useDerived && candidateStatus === "OUTAGE")
          ? httpDerivedStatus
          : candidateStatus;

      // If Atlassian HTTP was fine but JSON parse failed, override probeResult to PARSE_ERROR
      const obsProbeResult: ProbeResultVal =
        isAtlassian && result.probeResult === "REACHABLE" && obsParseOk === false
          ? "PARSE_ERROR"
          : result.probeResult;

      observations.push({
        serviceSurfaceId: surface.id,
        regionId: region.id,
        status: writtenStatus,
        latencyMs: result.latencyMs,
        httpStatus: result.httpStatus,
        confidence: result.confidence,
        errorRate: null,
        observedAt: now,
        officialStatus,
        httpDerivedStatus,
        statusSource: deriveResult.statusSource,
        parseOk: obsParseOk,
        parseError: obsParseError,
        probeResult: obsProbeResult,
      });

      surfaceDetails.push({
        surfaceId: surface.id,
        serviceSlug: surface.service.slug,
        surfaceName: surface.displayName,
        checkUrl: url,
        httpStatus: result.httpStatus,
        latencyMs: result.latencyMs,
        probeResult: obsProbeResult,
        statusComputed: deriveResult.finalStatus,
        statusWritten: writtenStatus,
        confidence: result.confidence,
        ...(shadow && {
          shadowStatus: shadow.shadowStatus,
          indicator: shadow.indicator,
          parseOk: shadow.parseOk,
        }),
        officialStatus,
        httpDerivedStatus,
        finalStatus: deriveResult.finalStatus,
        statusSource: deriveResult.statusSource,
      });

      console.log(JSON.stringify({
        event: "surface_check",
        dryRun,
        surfaceId: surface.id,
        serviceSlug: surface.service.slug,
        checkUrl: url,
        httpStatus: result.httpStatus,
        latencyMs: result.latencyMs,
        statusComputed: result.status,
        confidence: result.confidence,
      }));
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

    // Auto-create/resolve incidents — thresholds by signalConfidence (PR 6)
    //
    // ANCIEN comportement (identique pour les 3 niveaux) :
    //   newObs.status=OUTAGE && confidence=HIGH && prevObs.status=OUTAGE && confidence=HIGH → incident
    //
    // NOUVEAU comportement par signalConfidence :
    //   HIGH  (ATLASSIAN_JSON) : 2 consécutifs OUTAGE/HIGH confidence — inchangé (signal officiel fiable)
    //   MEDIUM (STATUS_HTML)   : 2 consécutifs SERVER_ERROR — jamais sur BLOCKED/TIMEOUT/UNKNOWN
    //   LOW   (HOMEPAGE/ROBOTS): 3 consécutifs SERVER_ERROR|DNS_FAIL|CONNECTION_FAIL uniquement
    //                            → 403/429/timeout ne déclenchent JAMAIS d'incident
    for (const surface of batch) {
      const prevObs = surface.observations[0];
      const newObs = observations.find(o => o.serviceSurfaceId === surface.id);

      const newProbeResult  = newObs?.probeResult  ?? null;
      const prevProbeResult = prevObs?.probeResult  ?? null;
      const prevPrevProbeResult = prevObs?.prevProbeResult ?? null;
      const sigConf = surface.signalConfidence;

      let shouldCreateIncident = false;

      if (sigConf === "HIGH") {
        // Atlassian JSON: signal officiel → 2 consécutifs OUTAGE avec HIGH confidence
        shouldCreateIncident = !!(
          newObs?.status === "OUTAGE" &&
          newObs?.confidence === "HIGH" &&
          prevObs?.status === "OUTAGE" &&
          prevObs?.confidence === "HIGH"
        );
      } else if (sigConf === "MEDIUM") {
        // Status HTML: 2 consécutifs SERVER_ERROR seulement
        shouldCreateIncident = !!(
          newProbeResult === "SERVER_ERROR" &&
          prevProbeResult === "SERVER_ERROR"
        );
      } else {
        // LOW (homepage / robots.txt): 3 consécutifs vrais échecs serveur seulement
        // BLOCKED / RATE_LIMITED / TIMEOUT / UNKNOWN_FAILURE ne déclenchent JAMAIS d'incident
        const LOW_FATAL = ["SERVER_ERROR", "DNS_FAIL", "CONNECTION_FAIL"];
        shouldCreateIncident = !!(
          newProbeResult && LOW_FATAL.includes(newProbeResult) &&
          prevProbeResult && LOW_FATAL.includes(prevProbeResult) &&
          prevPrevProbeResult && LOW_FATAL.includes(prevPrevProbeResult)
        );
      }

      if (shouldCreateIncident) {
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

      // Auto-resolve: premier probe OPERATIONAL résout l'incident (après 10 min d'ouverture)
      if (newObs?.status === "OPERATIONAL") {
        const openIncident = openIncidentMap.get(surface.serviceId);

        if (openIncident) {
          const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
          if (openIncident.startedAt < tenMinAgo) {
            await prisma.incident.update({
              where: { id: openIncident.id },
              data: { resolvedAt: now, status: "RESOLVED" },
            });

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
      ...(dryRun && { surfaces: surfaceDetails }),
    });

  } catch (error) {
    console.error("Cron check-status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
