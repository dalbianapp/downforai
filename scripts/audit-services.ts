import { prisma } from "../src/lib/db";

const CHECK_TIMEOUT_MS = 8000;
const CONCURRENCY = 15;

const SERVICES: Array<{ slug: string; url: string; currentStatus: string }> = [
  // OUTAGE (15)
  { slug: "play-ht",        url: "https://play.ht",              currentStatus: "OUTAGE" },
  { slug: "dora",           url: "https://www.dora.run/ai",       currentStatus: "OUTAGE" },
  { slug: "visual-electric",url: "https://visualelectric.com",    currentStatus: "OUTAGE" },
  { slug: "safurai",        url: "https://www.safurai.com",       currentStatus: "OUTAGE" },
  { slug: "trae-ide",       url: "https://www.trae.sh",           currentStatus: "OUTAGE" },
  { slug: "babbel-ai",      url: "https://www.babbel.com",        currentStatus: "OUTAGE" },
  { slug: "querium",        url: "https://www.querium.com",       currentStatus: "OUTAGE" },
  { slug: "sizzle",         url: "https://sizzleai.com",          currentStatus: "OUTAGE" },
  { slug: "invoke-ai",      url: "https://invoke.com",            currentStatus: "OUTAGE" },
  { slug: "predibase",      url: "https://predibase.com",         currentStatus: "OUTAGE" },
  { slug: "robin-ai",       url: "https://www.robinai.com",       currentStatus: "OUTAGE" },
  { slug: "agility-writer", url: "https://agilitywriter.com",     currentStatus: "OUTAGE" },
  { slug: "figgs-ai",       url: "https://www.figgs.ai",          currentStatus: "OUTAGE" },
  { slug: "moemate",        url: "https://www.moemate.io",        currentStatus: "OUTAGE" },
  { slug: "sillytavern",    url: "https://sillytavernapp.com",    currentStatus: "OUTAGE" },

  // UNKNOWN — HIGH PRIORITY
  { slug: "midjourney",     url: "https://midjourney.com",        currentStatus: "UNKNOWN" },
  { slug: "perplexity",     url: "https://perplexity.ai",         currentStatus: "UNKNOWN" },
  { slug: "character-ai",   url: "https://character.ai",          currentStatus: "UNKNOWN" },
  { slug: "xai-grok",       url: "https://x.ai",                  currentStatus: "UNKNOWN" },
  { slug: "sora",           url: "https://sora.com",              currentStatus: "UNKNOWN" },
  { slug: "viggle",         url: "https://viggle.ai",             currentStatus: "UNKNOWN" },
  { slug: "magnific",       url: "https://magnific.ai",           currentStatus: "UNKNOWN" },
  { slug: "crushon-ai",     url: "https://crushon.ai",            currentStatus: "UNKNOWN" },
  { slug: "poe",            url: "https://poe.com",               currentStatus: "UNKNOWN" },
  { slug: "le-chat-mistral",url: "https://chat.mistral.ai",       currentStatus: "UNKNOWN" },
  { slug: "genspark",       url: "https://www.genspark.ai",       currentStatus: "UNKNOWN" },
  { slug: "ideogram",       url: "https://ideogram.ai",           currentStatus: "UNKNOWN" },
  { slug: "grok-imagine",   url: "https://x.ai",                  currentStatus: "UNKNOWN" },
  { slug: "janitorai",      url: "https://janitorai.com",         currentStatus: "UNKNOWN" },

  // UNKNOWN — OTHERS
  { slug: "make-ai",        url: "https://www.make.com",          currentStatus: "UNKNOWN" },
  { slug: "vocal-remover",  url: "https://vocalremover.org",      currentStatus: "UNKNOWN" },
  { slug: "gamma",          url: "https://gamma.app",             currentStatus: "UNKNOWN" },
  { slug: "kittel-ai",      url: "https://www.kittl.com",         currentStatus: "UNKNOWN" },
  { slug: "looka",          url: "https://looka.com",             currentStatus: "UNKNOWN" },
  { slug: "piktochart-ai",  url: "https://piktochart.com/ai",     currentStatus: "UNKNOWN" },
  { slug: "brainly-ai",     url: "https://brainly.com",           currentStatus: "UNKNOWN" },
  { slug: "gauth",          url: "https://www.gauthmath.com",     currentStatus: "UNKNOWN" },
  { slug: "quizgecko",      url: "https://quizgecko.com",         currentStatus: "UNKNOWN" },
  { slug: "quizlet-qchat",  url: "https://quizlet.com",           currentStatus: "UNKNOWN" },
  { slug: "studyfetch",     url: "https://www.studyfetch.com",    currentStatus: "UNKNOWN" },
  { slug: "canva-ai",       url: "https://canva.com",             currentStatus: "UNKNOWN" },
  { slug: "comfyui",        url: "https://www.comfy.org",         currentStatus: "UNKNOWN" },
  { slug: "craiyon",        url: "https://www.craiyon.com",       currentStatus: "UNKNOWN" },
  { slug: "freepik-ai",     url: "https://www.freepik.com/ai",    currentStatus: "UNKNOWN" },
  { slug: "nightcafe",      url: "https://creator.nightcafe.studio", currentStatus: "UNKNOWN" },
  { slug: "promeai",        url: "https://www.promeai.pro",       currentStatus: "UNKNOWN" },
  { slug: "tensor-art",     url: "https://tensor.art",            currentStatus: "UNKNOWN" },
  { slug: "inflection-pi",  url: "https://pi.ai",                 currentStatus: "UNKNOWN" },
  { slug: "line-ai",        url: "https://line.me/en/ai",         currentStatus: "UNKNOWN" },
  { slug: "contentatscale", url: "https://contentatscale.ai",     currentStatus: "UNKNOWN" },
  { slug: "outranking",     url: "https://www.outranking.io",     currentStatus: "UNKNOWN" },
  { slug: "zimmwriter",     url: "https://zimmwriter.com",        currentStatus: "UNKNOWN" },
  { slug: "consensus",      url: "https://consensus.app",         currentStatus: "UNKNOWN" },
  { slug: "scispace",       url: "https://typeset.io",            currentStatus: "UNKNOWN" },
  { slug: "speechify",      url: "https://speechify.com",         currentStatus: "UNKNOWN" },
  { slug: "supernormal",    url: "https://supernormal.com",       currentStatus: "UNKNOWN" },
  { slug: "chatfai",        url: "https://chatfai.com",           currentStatus: "UNKNOWN" },
  { slug: "hiwaifu",        url: "https://hiwaifu.com",           currentStatus: "UNKNOWN" },
  { slug: "muah-ai",        url: "https://muah.ai",               currentStatus: "UNKNOWN" },
  { slug: "elicit",         url: "https://elicit.com",            currentStatus: "UNKNOWN" },
  { slug: "phind",          url: "https://phind.com",             currentStatus: "UNKNOWN" },
  { slug: "ada-support",    url: "https://www.ada.cx",            currentStatus: "UNKNOWN" },
  { slug: "sybill",         url: "https://www.sybill.ai",         currentStatus: "UNKNOWN" },
  { slug: "wonder-dynamics",url: "https://www.wonderdynamics.com",currentStatus: "UNKNOWN" },
  { slug: "couchbase-capella", url: "https://www.couchbase.com/products/capella", currentStatus: "UNKNOWN" },

  // DEGRADED (7)
  { slug: "adobe-express",     url: "https://www.adobe.com/express/",                currentStatus: "DEGRADED" },
  { slug: "adobe-photoshop-ai",url: "https://www.adobe.com/products/photoshop.html", currentStatus: "DEGRADED" },
  { slug: "jais-ai",           url: "https://www.inceptioniai.org",                  currentStatus: "DEGRADED" },
  { slug: "smithery-ai",       url: "https://smithery.ai",                           currentStatus: "DEGRADED" },
  { slug: "3dfy-ai",           url: "https://3dfy.ai",                               currentStatus: "DEGRADED" },
  { slug: "hour-one",          url: "https://hourone.ai",                            currentStatus: "DEGRADED" },
  { slug: "tavus-ai",          url: "https://www.tavus.ai",                          currentStatus: "DEGRADED" },

  // NO DATA (2)
  { slug: "octoai",   url: "https://octoai.cloud",    currentStatus: "NO_DATA" },
  { slug: "csm-ai",   url: "https://www.csm.ai",      currentStatus: "NO_DATA" },
];

type CheckResult = {
  httpStatus: number | null;
  finalUrl: string | null;
  error: string | null;
  latencyMs: number;
  method: "HEAD" | "GET";
};

async function checkUrl(url: string): Promise<CheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });
    clearTimeout(timeout);
    // If HEAD blocked, try GET
    if (response.status === 405 || response.status === 403) {
      const start2 = Date.now();
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), CHECK_TIMEOUT_MS);
      const r2 = await fetch(url, {
        method: "GET",
        signal: controller2.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      clearTimeout(timeout2);
      return {
        httpStatus: r2.status,
        finalUrl: r2.url || url,
        error: null,
        latencyMs: Date.now() - start2,
        method: "GET",
      };
    }
    return {
      httpStatus: response.status,
      finalUrl: response.url || url,
      error: null,
      latencyMs: Date.now() - start,
      method: "HEAD",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      httpStatus: null,
      finalUrl: null,
      error: msg.includes("abort") ? "TIMEOUT" : msg.slice(0, 80),
      latencyMs: Date.now() - start,
      method: "HEAD",
    };
  }
}

function classify(result: CheckResult, slug: string): { classification: string; reason: string; action: string } {
  const { httpStatus, error, finalUrl } = result;

  // Known dead service
  if (slug === "octoai") {
    return { classification: "DEAD", reason: "Acquired by NVIDIA Oct 2024, service shut down", action: "DELETE service" };
  }

  if (error === "TIMEOUT") {
    return { classification: "OUTAGE_OR_DEAD", reason: "Connection timeout (8s)", action: "Manual investigation needed" };
  }

  if (error && (error.includes("ENOTFOUND") || error.includes("getaddrinfo") || error.includes("EAI_AGAIN"))) {
    return { classification: "DEAD", reason: `DNS failure: ${error}`, action: "DELETE service" };
  }

  if (error && (error.includes("ECONNREFUSED") || error.includes("ECONNRESET"))) {
    return { classification: "OUTAGE_OR_DEAD", reason: `Connection refused/reset: ${error}`, action: "Verify manually" };
  }

  if (error) {
    return { classification: "UNKNOWN_ERROR", reason: error, action: "Manual investigation" };
  }

  if (httpStatus === null) {
    return { classification: "UNKNOWN_ERROR", reason: "No HTTP status returned", action: "Manual investigation" };
  }

  // Redirect to different domain (check if finalUrl differs significantly)
  if (finalUrl && finalUrl !== "undefined") {
    try {
      const origDomain = new URL(slug === "grok-imagine" ? "https://x.ai" : finalUrl).hostname;
      const finalDomain = new URL(finalUrl).hostname;
      if (origDomain !== finalDomain && !finalDomain.includes(origDomain.replace("www.", "").split(".")[0])) {
        // Domain changed significantly
      }
    } catch { /* ignore */ }
  }

  if (httpStatus >= 200 && httpStatus < 300) {
    return { classification: "ALIVE", reason: `HTTP ${httpStatus} — site accessible`, action: "Fix/add monitoring endpoint" };
  }

  if (httpStatus === 403) {
    return { classification: "CLOUDFLARE", reason: `HTTP 403 — bot protection blocking check`, action: "Check if site loads in browser; use status page URL if available" };
  }

  if (httpStatus === 429) {
    return { classification: "RATE_LIMITED", reason: "HTTP 429 — rate limited", action: "Reduce check frequency or use different endpoint" };
  }

  if (httpStatus === 404) {
    return { classification: "CHANGED", reason: `HTTP 404 — URL not found`, action: "Find correct URL" };
  }

  if (httpStatus === 410) {
    return { classification: "DEAD", reason: "HTTP 410 Gone", action: "DELETE service" };
  }

  if (httpStatus >= 500) {
    return { classification: "ALIVE", reason: `HTTP ${httpStatus} — site exists but server error`, action: "Check if real outage or misconfigured endpoint" };
  }

  if (httpStatus >= 300 && httpStatus < 400) {
    return { classification: "ALIVE", reason: `HTTP ${httpStatus} — redirect (followed)`, action: "Fix monitoring endpoint to point to final URL" };
  }

  return { classification: "UNKNOWN", reason: `HTTP ${httpStatus}`, action: "Manual investigation" };
}


async function main() {
  console.log(`\n=== SERVICE AUDIT — ${SERVICES.length} services ===\n`);

  // 1. Query DB for surface info
  console.log("Querying DB for ServiceSurface data...");
  let surfaceMap = new Map<string, { id: string; checkUrl: string | null; isEnabled: boolean; lastStatus: string | null; lastObservedAt: Date | null }[]>();

  try {
    const slugs = SERVICES.map(s => s.slug);
    const surfaces = await prisma.$queryRaw<Array<{
      serviceSlug: string;
      surfaceId: string;
      checkUrl: string | null;
      isEnabled: boolean;
      lastStatus: string | null;
      lastObservedAt: Date | null;
    }>>`
      SELECT
        s.slug AS "serviceSlug",
        ss.id AS "surfaceId",
        ss."checkUrl",
        ss."isEnabled",
        o.status AS "lastStatus",
        o."observedAt" AS "lastObservedAt"
      FROM "Service" s
      INNER JOIN "ServiceSurface" ss ON ss."serviceId" = s.id
      LEFT JOIN LATERAL (
        SELECT status, "observedAt"
        FROM "Observation"
        WHERE "serviceSurfaceId" = ss.id
        ORDER BY "observedAt" DESC
        LIMIT 1
      ) o ON true
      WHERE s.slug = ANY(${slugs})
      ORDER BY s.slug, ss."isEnabled" DESC
    `;

    for (const row of surfaces) {
      if (!surfaceMap.has(row.serviceSlug)) surfaceMap.set(row.serviceSlug, []);
      surfaceMap.get(row.serviceSlug)!.push({
        id: row.surfaceId,
        checkUrl: row.checkUrl,
        isEnabled: row.isEnabled,
        lastStatus: row.lastStatus,
        lastObservedAt: row.lastObservedAt,
      });
    }
    console.log(`  DB OK — found surface data for ${surfaceMap.size} services\n`);
  } catch (err) {
    console.error(`  DB ERROR: ${err}\n  Proceeding without surface data.\n`);
  }

  // 2. HTTP checks
  console.log("Running HTTP checks (concurrency=15)...");
  type AuditResult = {
    slug: string;
    currentStatus: string;
    url: string;
    checkResult: CheckResult;
    classification: ReturnType<typeof classify>;
    surfaces: ReturnType<typeof surfaceMap.get>;
  };

  let done = 0;
  const resultPromises: Promise<AuditResult>[] = SERVICES.map(async (svc) => {
    const checkResult = await checkUrl(svc.url);
    done++;
    process.stdout.write(`\r  ${done}/${SERVICES.length} checked...`);
    return {
      slug: svc.slug,
      currentStatus: svc.currentStatus,
      url: svc.url,
      checkResult,
      classification: classify(checkResult, svc.slug),
      surfaces: surfaceMap.get(svc.slug),
    };
  });

  // Process in chunks to respect concurrency
  const results: AuditResult[] = [];
  for (let i = 0; i < resultPromises.length; i += CONCURRENCY) {
    const chunk = await Promise.all(resultPromises.slice(i, i + CONCURRENCY));
    results.push(...chunk);
  }

  console.log("\n\nHTTP checks complete.\n");

  // 3. Print results
  const classificationCounts: Record<string, number> = {};

  for (const r of results) {
    const c = r.classification.classification;
    classificationCounts[c] = (classificationCounts[c] || 0) + 1;
  }

  console.log("=== RESULTS BY CLASSIFICATION ===");
  for (const [cls, count] of Object.entries(classificationCounts).sort(([, a], [, b]) => b - a)) {
    console.log(`  ${cls}: ${count}`);
  }

  console.log("\n=== FULL RESULTS (JSON) ===");
  console.log(JSON.stringify(results.map(r => ({
    slug: r.slug,
    current: r.currentStatus,
    url: r.url,
    httpStatus: r.checkResult.httpStatus,
    finalUrl: r.checkResult.finalUrl !== r.url ? r.checkResult.finalUrl : null,
    error: r.checkResult.error,
    latencyMs: r.checkResult.latencyMs,
    method: r.checkResult.method,
    classification: r.classification.classification,
    reason: r.classification.reason,
    action: r.classification.action,
    db_surfaces: r.surfaces?.length ?? 0,
    db_enabled: r.surfaces?.filter(s => s.isEnabled).length ?? 0,
    db_checkUrl: r.surfaces?.[0]?.checkUrl ?? null,
    db_lastStatus: r.surfaces?.[0]?.lastStatus ?? null,
    db_lastObservedAt: r.surfaces?.[0]?.lastObservedAt?.toISOString().slice(0, 19) ?? null,
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
