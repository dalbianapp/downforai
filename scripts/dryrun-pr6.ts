/**
 * PR6 dry-run : teste classifyProbe sur les vraies URLs de la DB
 * Usage: npx tsx scripts/dryrun-pr6.ts
 */
import { PrismaClient } from "@prisma/client";
import { classifyProbeHTTP, classifyProbeError, probeConfidence, type ProbeResultVal } from "../src/lib/monitoring/classifyProbe";

const prisma = new PrismaClient();
const CHECK_TIMEOUT_MS = 5000;
const BOT_UA = "DownForAIStatusBot/1.0 (+https://downforai.com/methodology)";
const LIMIT = 80;

type Row = {
  id: string;
  slug: string;
  displayName: string;
  checkUrl: string | null;
  checkType: string;
  signalConfidence: string;
  websiteUrl: string | null;
};

async function doFetch(url: string, method: "HEAD" | "GET") {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    const response = await fetch(url, {
      method, cache: "no-store", signal: controller.signal, redirect: "follow",
      headers: {
        "User-Agent": BOT_UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });
    clearTimeout(t);
    const latencyMs = Date.now() - start;
    const classified = classifyProbeHTTP(response.status);
    return { httpStatus: response.status, latencyMs, probeResult: classified.probeResult, httpDerivedStatus: classified.httpDerivedStatus, confidence: probeConfidence(classified.probeResult) };
  } catch (err) {
    const classified = classifyProbeError(err);
    return { httpStatus: null, latencyMs: null, probeResult: classified.probeResult, httpDerivedStatus: classified.httpDerivedStatus, confidence: probeConfidence(classified.probeResult) };
  }
}

async function main() {
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT ss.id, s.slug, ss."displayName", ss."checkUrl", ss."checkType"::text, ss."signalConfidence"::text, s."websiteUrl"
    FROM "ServiceSurface" ss
    INNER JOIN "Service" s ON s.id = ss."serviceId"
    WHERE ss."isEnabled" = true
    ORDER BY RANDOM()
    LIMIT ${LIMIT}
  `;

  // Force include known false-positive services
  const forceSlugs = ["babbel-ai", "sizzle", "figgs-ai", "openai", "elastic-ai", "anthropic"];
  const forceRows = await prisma.$queryRaw<Row[]>`
    SELECT ss.id, s.slug, ss."displayName", ss."checkUrl", ss."checkType"::text, ss."signalConfidence"::text, s."websiteUrl"
    FROM "ServiceSurface" ss
    INNER JOIN "Service" s ON s.id = ss."serviceId"
    WHERE s.slug = ANY(${forceSlugs})
    AND ss."isEnabled" = true
  `;

  const allRows = [...forceRows, ...rows.filter(r => !forceSlugs.includes(r.slug))];
  const seen = new Set<string>();
  const batch = allRows.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });

  console.log(`\n=== PR6 DRY-RUN — ${batch.length} surfaces ===\n`);

  const results: Array<{
    slug: string; displayName: string; checkType: string; sigConf: string;
    url: string; httpStatus: number | null; probeResult: ProbeResultVal;
    httpDerivedStatus: string; confidence: string; note?: string;
  }> = [];

  // Deduplicate by URL
  const urlMap = new Map<string, Row[]>();
  for (const row of batch) {
    const url = row.checkUrl || row.websiteUrl;
    if (!url) continue;
    if (!urlMap.has(url)) urlMap.set(url, []);
    urlMap.get(url)!.push(row);
  }

  for (const [url, surfaces] of urlMap) {
    const isAtlassian = url.endsWith("/api/v2/status.json");
    let res = await doFetch(url, isAtlassian ? "GET" : "HEAD");

    // HEAD blocked → retry with GET
    if (!isAtlassian && (res.httpStatus === 403 || res.httpStatus === 405)) {
      res = await doFetch(url, "GET");
    }

    for (const s of surfaces) {
      results.push({
        slug: s.slug,
        displayName: s.displayName,
        checkType: s.checkType,
        sigConf: s.signalConfidence,
        url,
        httpStatus: res.httpStatus,
        probeResult: res.probeResult,
        httpDerivedStatus: res.httpDerivedStatus,
        confidence: res.confidence,
      });
    }
  }

  // Sort: forced services first
  results.sort((a, b) => {
    const ai = forceSlugs.indexOf(a.slug);
    const bi = forceSlugs.indexOf(b.slug);
    if (ai !== -1 && bi === -1) return -1;
    if (bi !== -1 && ai === -1) return 1;
    return a.slug.localeCompare(b.slug);
  });

  // Display
  const probeGroups: Record<string, typeof results> = {};
  for (const r of results) {
    const k = r.probeResult;
    if (!probeGroups[k]) probeGroups[k] = [];
    probeGroups[k].push(r);
  }

  console.log("=== SERVICES SOUS SURVEILLANCE (forcés) ===");
  for (const s of forceSlugs) {
    const r = results.find(x => x.slug === s);
    if (r) {
      const icon = r.probeResult === "REACHABLE" ? "✅" : r.httpDerivedStatus === "OUTAGE" ? "🔴" : r.httpDerivedStatus === "UNKNOWN" ? "⚠️" : "🟡";
      console.log(`  ${icon} ${r.slug.padEnd(20)} probeResult=${r.probeResult.padEnd(18)} httpStatus=${String(r.httpStatus ?? "null").padEnd(4)} httpDerived=${r.httpDerivedStatus.padEnd(12)} conf=${r.confidence} [${r.checkType}/${r.sigConf}]`);
    }
  }

  console.log("\n=== DISTRIBUTION probeResult ===");
  for (const [k, v] of Object.entries(probeGroups).sort()) {
    console.log(`  ${k.padEnd(20)} → ${v.length} surfaces`);
  }

  const falsePositiveFixes = results.filter(r => ["BLOCKED","RATE_LIMITED","TIMEOUT"].includes(r.probeResult));
  console.log(`\n=== FAUX POSITIFS ÉLIMINÉS (BLOCKED/RATE_LIMITED/TIMEOUT → UNKNOWN) : ${falsePositiveFixes.length} ===`);
  for (const r of falsePositiveFixes.slice(0, 20)) {
    console.log(`  ⚠️  ${r.slug.padEnd(22)} ${r.probeResult.padEnd(14)} http=${r.httpStatus ?? "null"} → httpDerived=${r.httpDerivedStatus} (était OUTAGE/DEGRADED avant PR6)`);
  }
  if (falsePositiveFixes.length > 20) console.log(`  ... et ${falsePositiveFixes.length - 20} autres`);

  const serverErrors = results.filter(r => r.probeResult === "SERVER_ERROR");
  console.log(`\n=== SERVER_ERROR (5xx — vrais candidats incident) : ${serverErrors.length} ===`);
  for (const r of serverErrors.slice(0, 10)) {
    console.log(`  🔴 ${r.slug.padEnd(22)} http=${r.httpStatus} → OUTAGE conf=${r.confidence} [${r.sigConf}]`);
  }

  const dnsFails = results.filter(r => ["DNS_FAIL","CONNECTION_FAIL"].includes(r.probeResult));
  console.log(`\n=== DNS_FAIL / CONNECTION_FAIL : ${dnsFails.length} ===`);
  for (const r of dnsFails.slice(0, 10)) {
    console.log(`  🔴 ${r.slug.padEnd(22)} ${r.probeResult} → OUTAGE [${r.sigConf}]`);
  }

  console.log("\n=== NOUVELLE LOGIQUE INCIDENT (résumé) ===");
  console.log("  HIGH  (ATLASSIAN_JSON) : 2× OUTAGE consécutifs   [inchangé — signal officiel]");
  console.log("  MEDIUM (STATUS_HTML)   : 2× SERVER_ERROR consécutifs");
  console.log("  LOW   (HOMEPAGE/ROBOTS): 3× SERVER_ERROR|DNS_FAIL|CONNECTION_FAIL consécutifs");
  console.log("                           BLOCKED / RATE_LIMITED / TIMEOUT → JAMAIS d'incident");

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
