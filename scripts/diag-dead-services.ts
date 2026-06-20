/**
 * Audit services "morts" — vérification neutre (LECTURE SEULE)
 * 1. Trouve candidats "morts" depuis DB (null httpStatus / DNS_FAIL haut)
 * 2. Pour chacun : DNS lookup via 8.8.8.8 + fetch local (pas Vercel)
 * 3. Verdict : VIVANT / MORT / DOUTEUX
 * Usage: npx tsx scripts/diag-dead-services.ts
 */
import { PrismaClient } from "@prisma/client";
import dns, { promises as dnsP } from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const prisma = new PrismaClient();
const FETCH_TIMEOUT_MS = 10_000;
const BOT_UA = "DownForAIStatusBot/1.0 (+https://downforai.com/methodology)";

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

async function dnsCheck(domain: string): Promise<{ resolves: boolean; ips?: string[]; error?: string }> {
  // Strip www. to test apex domain first
  const apex = domain.replace(/^www\./, "");
  for (const d of [domain, apex].filter((x, i, a) => a.indexOf(x) === i)) {
    try {
      const addrs = await dnsP.resolve4(d);
      return { resolves: true, ips: addrs };
    } catch (e1) {
      try {
        const addrs = await dnsP.resolve6(d);
        return { resolves: true, ips: addrs };
      } catch {
        // try CNAME/ANY
        try {
          const records = await dnsP.resolveCname(d);
          return { resolves: true, ips: records };
        } catch (e3) {
          const err3 = e3 as NodeJS.ErrnoException;
          if (err3.code === "ENOTFOUND" || err3.code === "ENODATA" || err3.code === "ESERVFAIL") {
            continue; // try next domain form
          }
        }
      }
    }
  }
  return { resolves: false, error: "NXDOMAIN / no records on 8.8.8.8+1.1.1.1" };
}

async function fetchCheckHttps(url: string): Promise<{ status: number | null; latency: number | null; error?: string }> {
  const https = await import("https");
  const http  = await import("http");
  return new Promise((resolve) => {
    const start = Date.now();
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent": BOT_UA,
          "Accept": "text/html,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        },
        timeout: FETCH_TIMEOUT_MS,
        // Don't reject self-signed certs during diagnosis
        rejectUnauthorized: false,
      } as Parameters<typeof https.get>[1],
      (res) => {
        req.destroy(); // don't wait for body
        resolve({ status: res.statusCode ?? null, latency: Date.now() - start });
      }
    );
    req.on("timeout", () => { req.destroy(); resolve({ status: null, latency: null, error: "TIMEOUT" }); });
    req.on("error", (e) => resolve({ status: null, latency: null, error: e.message.slice(0, 100) }));
  });
}

async function fetchCheck(url: string): Promise<{ status: number | null; latency: number | null; error?: string }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": BOT_UA,
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
    });
    clearTimeout(t);
    return { status: res.status, latency: Date.now() - start };
  } catch (e) {
    clearTimeout(t);
    const err = e as Error & { cause?: unknown };
    const cause = err.cause instanceof Error ? err.cause.message : String(err.cause ?? "");
    if (err.name === "AbortError") return { status: null, latency: null, error: "TIMEOUT" };
    // Fallback to native https module (avoids some Node.js fetch quirks on Windows)
    const fallback = await fetchCheckHttps(url);
    if (fallback.status !== null) return fallback;
    return { status: null, latency: null, error: `${err.message} | cause: ${cause}`.slice(0, 120) };
  }
}

// ── DB query : candidats "morts" ──────────────────────────────────────────────

type CandidateRow = {
  serviceId: string;
  slug: string;
  name: string;
  checkUrl: string | null;
  websiteUrl: string | null;
  checkType: string;
  signalConfidence: string;
  totalObs: string;
  nullHttpObs: string;
  dnsFail: string;
  connFail: string;
  unknownFail: string;
  lastObservedAt: Date | null;
  robinIncidents: string;
};

async function getCandidates(): Promise<CandidateRow[]> {
  return prisma.$queryRaw<CandidateRow[]>`
    SELECT
      s.id                                                          AS "serviceId",
      s.slug,
      s.name,
      ss."checkUrl",
      s."websiteUrl",
      ss."checkType"::text,
      ss."signalConfidence"::text,
      COUNT(o.id)::text                                             AS "totalObs",
      COUNT(CASE WHEN o."httpStatus" IS NULL THEN 1 END)::text      AS "nullHttpObs",
      COUNT(CASE WHEN o."probeResult"::text = 'DNS_FAIL' THEN 1 END)::text       AS "dnsFail",
      COUNT(CASE WHEN o."probeResult"::text = 'CONNECTION_FAIL' THEN 1 END)::text AS "connFail",
      COUNT(CASE WHEN o."probeResult"::text = 'UNKNOWN_FAILURE' THEN 1 END)::text AS "unknownFail",
      MAX(o."observedAt")                                           AS "lastObservedAt",
      (SELECT COUNT(*)::text FROM "Incident" i WHERE i."serviceId" = s.id)        AS "robinIncidents"
    FROM "Service" s
    JOIN "ServiceSurface" ss ON ss."serviceId" = s.id AND ss."isEnabled" = true
    LEFT JOIN "Observation" o
          ON o."serviceSurfaceId" = ss.id
         AND o."observedAt" >= NOW() - INTERVAL '30 days'
    GROUP BY s.id, s.slug, s.name, ss."checkUrl", s."websiteUrl", ss."checkType", ss."signalConfidence"
    HAVING
      COUNT(o.id) >= 8
      AND COUNT(CASE WHEN o."httpStatus" IS NULL THEN 1 END)::float / NULLIF(COUNT(o.id), 0) >= 0.80
    ORDER BY
      COUNT(CASE WHEN o."httpStatus" IS NULL THEN 1 END)::float / NULLIF(COUNT(o.id), 0) DESC,
      COUNT(o.id) DESC
  `;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n📡  Audit services morts — point neutre (DNS 8.8.8.8 + fetch local)\n");

  const candidates = await getCandidates();
  const n = (v: unknown) => parseInt(String(v ?? "0"), 10);

  console.log(`🔍  ${candidates.length} candidats trouvés (≥80% null httpStatus sur 30j)\n`);

  type ResultRow = {
    slug: string;
    name: string;
    checkUrl: string | null;
    websiteUrl: string | null;
    failPct: number;
    domainTested: string;
    dnsResolves: boolean;
    dnsIps: string;
    fetchStatus: number | null;
    fetchError: string | null;
    fetchLatency: number | null;
    verdict: "VIVANT" | "MORT" | "DOUTEUX";
    action: string;
    totalIncidents: number;
  };

  const results: ResultRow[] = [];

  for (const row of candidates) {
    const total   = n(row.totalObs);
    const nullHttp = n(row.nullHttpObs);
    const failPct = total > 0 ? (nullHttp / total) * 100 : 0;

    // Domain to test: prefer checkUrl, fallback to websiteUrl
    const rawUrl   = row.checkUrl || row.websiteUrl || "";
    const domain   = rawUrl ? extractDomain(rawUrl) : "";
    const wsDomain = row.websiteUrl ? extractDomain(row.websiteUrl) : "";

    process.stdout.write(`  [${results.length + 1}/${candidates.length}] ${row.slug.padEnd(30)}`);

    let dnsResult = { resolves: false, ips: [] as string[], error: "no domain" };
    let fetchResult: { status: number | null; latency: number | null; error?: string } = { status: null, latency: null, error: "no url" };

    if (domain) {
      dnsResult = await dnsCheck(domain) as typeof dnsResult;
      // Also try website domain if different
      if (wsDomain && wsDomain !== domain && !dnsResult.resolves) {
        const ws2 = await dnsCheck(wsDomain) as typeof dnsResult;
        if (ws2.resolves) dnsResult = ws2;
      }
    }

    // Fetch: try websiteUrl first (more likely to be the "real" homepage)
    const fetchUrl = row.websiteUrl || (row.checkUrl?.replace(/\/api\/v2\/status\.json$/, "") ?? "");
    if (fetchUrl) {
      fetchResult = await fetchCheck(fetchUrl.startsWith("http") ? fetchUrl : `https://${fetchUrl}`);
      // Retry with www. prefix if failed and no www.
      if (fetchResult.status === null && !fetchUrl.includes("www.") && domain && !domain.startsWith("www.")) {
        const www = fetchUrl.replace(/^https?:\/\//, "https://www.");
        const retry = await fetchCheck(www.startsWith("http") ? www : `https://www.${fetchUrl}`);
        if (retry.status !== null) fetchResult = retry;
      }
    }

    // Verdict
    const httpAlive = fetchResult.status !== null && (fetchResult.status < 500 || fetchResult.status === 503);
    let verdict: "VIVANT" | "MORT" | "DOUTEUX";
    let action: string;

    if (dnsResult.resolves && httpAlive) {
      verdict = "VIVANT";
      action  = "Réparer checkUrl ou marquer MONITORING_LIMITED — NE PAS discontinuer";
    } else if (!dnsResult.resolves && fetchResult.status === null) {
      verdict = "MORT";
      action  = "Candidat DISCONTINUED — à confirmer visuellement";
    } else if (dnsResult.resolves && fetchResult.status === null) {
      verdict = "DOUTEUX";
      action  = "DNS OK mais pas de réponse HTTP — vérifier manuellement dans navigateur";
    } else if (!dnsResult.resolves && httpAlive) {
      verdict = "DOUTEUX";
      action  = "DNS fail mais réponse HTTP (CDN/proxy?) — vérifier manuellement";
    } else if (fetchResult.status !== null && fetchResult.status >= 500) {
      verdict = "DOUTEUX";
      action  = `5xx depuis France (${fetchResult.status}) — serveur présent mais en erreur`;
    } else {
      verdict = "DOUTEUX";
      action  = "Signaux contradictoires — vérifier manuellement";
    }

    process.stdout.write(` → ${verdict}\n`);

    results.push({
      slug:         row.slug,
      name:         row.name,
      checkUrl:     row.checkUrl,
      websiteUrl:   row.websiteUrl,
      failPct,
      domainTested: domain || wsDomain,
      dnsResolves:  dnsResult.resolves,
      dnsIps:       (dnsResult.ips ?? []).slice(0, 2).join(", "),
      fetchStatus:  fetchResult.status,
      fetchError:   fetchResult.error ?? null,
      fetchLatency: fetchResult.latency,
      verdict,
      action,
      totalIncidents: n(row.robinIncidents),
    });
  }

  // ── RAPPORT ─────────────────────────────────────────────────────────────────
  const vivants  = results.filter(r => r.verdict === "VIVANT");
  const morts    = results.filter(r => r.verdict === "MORT");
  const douteux  = results.filter(r => r.verdict === "DOUTEUX");

  const totalIncidentsFauxMorts = vivants.reduce((s, r) => s + r.totalIncidents, 0);

  const HR  = "═".repeat(70);
  const sep = "─".repeat(70);

  console.log(`\n${HR}`);
  console.log("  AUDIT SERVICES MORTS — RAPPORT FINAL (lecture seule)");
  console.log(`${HR}\n`);

  console.log(`  Candidats analysés  : ${results.length}`);
  console.log(`  ✅ VIVANTS (faux morts) : ${vivants.length}  (incidents à masquer : ${totalIncidentsFauxMorts})`);
  console.log(`  ❌ VRAIMENT MORTS       : ${morts.length}`);
  console.log(`  ⚠️  DOUTEUX              : ${douteux.length}\n`);

  // Table header
  const col = (s: string, w: number) => String(s ?? "").slice(0, w).padEnd(w);

  console.log(`${sep}`);
  console.log(`  ✅ VIVANTS — NE PAS discontinuer`);
  console.log(`${sep}`);
  if (vivants.length === 0) {
    console.log("  (aucun)");
  } else {
    console.log(`  ${"slug".padEnd(24)} ${"domain".padEnd(28)} ${"DNS".padEnd(6)} ${"HTTP".padEnd(6)} ${"ms".padEnd(5)} ${"Incidents"}`);
    for (const r of vivants) {
      const dns  = r.dnsResolves ? `✓ ${r.dnsIps.slice(0, 15)}` : "✗";
      const http = r.fetchStatus != null ? String(r.fetchStatus) : r.fetchError?.slice(0, 8) ?? "ERR";
      const ms   = r.fetchLatency != null ? `${r.fetchLatency}` : "—";
      console.log(`  ${col(r.slug, 24)} ${col(r.domainTested, 28)} ${col(dns, 20)} ${col(http, 6)} ${col(ms, 6)} ${r.totalIncidents}`);
      console.log(`    checkUrl : ${r.checkUrl ?? "(null)"}`);
      console.log(`    websiteUrl : ${r.websiteUrl ?? "(null)"}`);
      console.log(`    Action : ${r.action}`);
    }
  }

  console.log(`\n${sep}`);
  console.log(`  ❌ VRAIMENT MORTS — candidats DISCONTINUED`);
  console.log(`${sep}`);
  if (morts.length === 0) {
    console.log("  (aucun)");
  } else {
    for (const r of morts) {
      console.log(`  ${r.slug.padEnd(28)} fail=${r.failPct.toFixed(0)}%  incidents=${r.totalIncidents}`);
      console.log(`    checkUrl : ${r.checkUrl ?? "(null)"}`);
      console.log(`    websiteUrl : ${r.websiteUrl ?? "(null)"}`);
      console.log(`    DNS : ${r.dnsIps || r.dnsResolves ? "resolves" : "NXDOMAIN/no-record"}  HTTP : ${r.fetchStatus ?? r.fetchError}`);
    }
  }

  console.log(`\n${sep}`);
  console.log(`  ⚠️  DOUTEUX — vérifier manuellement dans navigateur`);
  console.log(`${sep}`);
  if (douteux.length === 0) {
    console.log("  (aucun)");
  } else {
    for (const r of douteux) {
      console.log(`  ${r.slug.padEnd(28)} DNS=${r.dnsResolves ? "OK" : "FAIL"}  HTTP=${r.fetchStatus ?? r.fetchError?.slice(0,20) ?? "null"}`);
      console.log(`    checkUrl : ${r.checkUrl ?? "(null)"}`);
      console.log(`    websiteUrl : ${r.websiteUrl ?? "(null)"}`);
      console.log(`    ${r.action}`);
    }
  }

  console.log(`\n${HR}`);
  console.log("  RÉSUMÉ");
  console.log(`${HR}`);
  console.log(`  Candidats            : ${results.length}`);
  console.log(`  Faux morts (VIVANTS) : ${vivants.length}  — PAS de DISCONTINUED, réparer checkUrl`);
  console.log(`  Vrais morts          : ${morts.length}  — candidats DISCONTINUED`);
  console.log(`  Douteux              : ${douteux.length}  — vérification navigateur requise`);
  console.log(`  Incidents faux-positifs supplémentaires à masquer (vivants) : ${totalIncidentsFauxMorts}`);
  console.log(`  (les 306 déjà masqués PR7 ne sont pas recomptés ici)\n`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
