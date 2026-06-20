/**
 * PR8 ÉTAPE B — Rapport de classification monitoringCapability (LECTURE SEULE)
 * Derive la capacité de monitoring pour chaque service depuis ses données existantes.
 * Usage: npx tsx scripts/diag-pr8-classification.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Services confirmés VIVANTS mais bloqués depuis Vercel (résultat de diag-dead-services.ts)
const KNOWN_BLOCKED = new Set(["robin-ai", "babbel-ai"]);
// Services douteux (DNS OK mais HTTP timeout depuis France)
const KNOWN_UNVERIFIABLE = new Set(["headlime", "bloop-ai"]);

type ServiceRow = {
  serviceId: string;
  slug: string;
  name: string;
  checkTypes: string;        // comma-sep list of distinct checkTypes
  totalObs: string;
  pctReach: string;          // % httpStatus 200-299
  pctBlock: string;          // % httpStatus 401/403/405/429 or 520-527
  pctServerErr: string;      // % httpStatus 500-519 (excl CF 52x)
  pctNull: string;           // % httpStatus IS NULL
  pctProbeBlock: string;     // % probeResult IN BLOCKED, RATE_LIMITED (new probeResult col)
  pctProbeDns: string;       // % probeResult = DNS_FAIL
  pctProbeConn: string;      // % probeResult = CONNECTION_FAIL
  pctProbeUnknown: string;   // % probeResult = UNKNOWN_FAILURE
};

const n = (v: unknown) => parseFloat(String(v ?? "0"));

type MonCap =
  | "OFFICIAL_STATUS_API"
  | "OFFICIAL_STATUS_PAGE"
  | "BASIC_PUBLIC_SURFACE"
  | "BLOCKED_FROM_PROBES"
  | "UNVERIFIABLE";

type LifecycleS = "ACTIVE" | "POSSIBLY_INACTIVE";

function classify(row: ServiceRow): { monCap: MonCap; lifecycle: LifecycleS; reason: string } {
  const types = row.checkTypes.split(",").map(t => t.trim());

  // Official signal overrides everything
  if (types.includes("ATLASSIAN_JSON")) {
    return { monCap: "OFFICIAL_STATUS_API", lifecycle: "ACTIVE", reason: "Atlassian JSON surface présente" };
  }
  if (types.some(t => ["STATUS_HTML", "GCP_JSON", "AWS_HEALTH", "AZURE_STATUS"].includes(t))) {
    return { monCap: "OFFICIAL_STATUS_PAGE", lifecycle: "ACTIVE", reason: `checkType=${types.filter(t => ["STATUS_HTML","GCP_JSON","AWS_HEALTH","AZURE_STATUS"].includes(t)).join("/")}` };
  }

  // Known-alive but blocked from Vercel probes (confirmed by diag-dead-services.ts)
  if (KNOWN_BLOCKED.has(row.slug)) {
    return { monCap: "BLOCKED_FROM_PROBES", lifecycle: "ACTIVE", reason: "Confirmé vivant (200/307 depuis France) mais bloqué depuis IPs Vercel" };
  }

  // Known-unverifiable (DNS OK but no HTTP response from France either)
  if (KNOWN_UNVERIFIABLE.has(row.slug)) {
    return { monCap: "UNVERIFIABLE", lifecycle: "POSSIBLY_INACTIVE", reason: "DNS résout mais aucune réponse HTTP depuis France (timeout) — statut incertain" };
  }

  const total    = n(row.totalObs);
  const pctR     = n(row.pctReach);
  const pctB     = n(row.pctBlock);
  const pctNull  = n(row.pctNull);
  const pctPB    = n(row.pctProbeBlock);
  const pctDns   = n(row.pctProbeDns);
  const pctConn  = n(row.pctProbeConn);
  const pctUnk   = n(row.pctProbeUnknown);
  const pct5xx   = n(row.pctServerErr);

  if (total < 5) {
    return { monCap: "BASIC_PUBLIC_SURFACE", lifecycle: "ACTIVE", reason: "Trop peu d'observations (<5) — conserver classement par défaut" };
  }

  // Service responds > 20% of the time with 2xx → measurable
  if (pctR > 20) {
    return { monCap: "BASIC_PUBLIC_SURFACE", lifecycle: "ACTIVE", reason: `${pctR.toFixed(0)}% REACHABLE (2xx)` };
  }

  // Service returns 4xx/block codes > 40% → server is alive but blocking probe IPs
  if (pctB > 40 || pctPB > 40) {
    return { monCap: "BLOCKED_FROM_PROBES", lifecycle: "ACTIVE", reason: `${Math.max(pctB, pctPB).toFixed(0)}% block (403/429/52x)` };
  }

  // Service returns some 5xx → server is alive but in error
  if (pct5xx > 20) {
    return { monCap: "BASIC_PUBLIC_SURFACE", lifecycle: "ACTIVE", reason: `${pct5xx.toFixed(0)}% 5xx — serveur présent mais en erreur` };
  }

  // Near-total DNS failure → DNS might be blocking Vercel IPs or service really dead
  if (pctDns > 60) {
    return { monCap: "BLOCKED_FROM_PROBES", lifecycle: "ACTIVE", reason: `${pctDns.toFixed(0)}% DNS_FAIL (DNS Vercel bloqué probable — voir aussi IPs Vercel)` };
  }

  // Near-total connection failure → TCP-level block
  if (pctConn > 60) {
    return { monCap: "BLOCKED_FROM_PROBES", lifecycle: "ACTIVE", reason: `${pctConn.toFixed(0)}% CONNECTION_FAIL (blocage TCP depuis IPs Vercel probable)` };
  }

  // Quasi-total null/unknown failure → can't determine
  if (pctNull > 75 || pctUnk > 75) {
    return { monCap: "UNVERIFIABLE", lifecycle: "POSSIBLY_INACTIVE", reason: `${Math.max(pctNull, pctUnk).toFixed(0)}% null/UNKNOWN_FAILURE — aucune réponse d'aucune sorte` };
  }

  // Mixed signals but mostly failing → BASIC (some probes reach something)
  return { monCap: "BASIC_PUBLIC_SURFACE", lifecycle: "ACTIVE", reason: "Signaux mixtes — conserver BASIC par défaut" };
}

async function main() {
  console.log("\n🔍  Rapport classification monitoringCapability (LECTURE SEULE)\n");

  const rows = await prisma.$queryRaw<ServiceRow[]>`
    SELECT
      s.id                                                                      AS "serviceId",
      s.slug,
      s.name,
      STRING_AGG(DISTINCT ss."checkType"::text, ',')                           AS "checkTypes",
      COUNT(DISTINCT o.id)::text                                               AS "totalObs",
      (100.0 * COUNT(DISTINCT CASE WHEN o."httpStatus" BETWEEN 200 AND 299 THEN o.id END)
               / NULLIF(COUNT(DISTINCT o.id), 0))::text                        AS "pctReach",
      (100.0 * COUNT(DISTINCT CASE WHEN o."httpStatus" IN (401,403,405,429)
                                    OR (o."httpStatus" BETWEEN 520 AND 527)
                                   THEN o.id END)
               / NULLIF(COUNT(DISTINCT o.id), 0))::text                        AS "pctBlock",
      (100.0 * COUNT(DISTINCT CASE WHEN o."httpStatus" BETWEEN 500 AND 519 THEN o.id END)
               / NULLIF(COUNT(DISTINCT o.id), 0))::text                        AS "pctServerErr",
      (100.0 * COUNT(DISTINCT CASE WHEN o."httpStatus" IS NULL THEN o.id END)
               / NULLIF(COUNT(DISTINCT o.id), 0))::text                        AS "pctNull",
      (100.0 * COUNT(DISTINCT CASE WHEN o."probeResult"::text IN ('BLOCKED','RATE_LIMITED')
                                   THEN o.id END)
               / NULLIF(COUNT(DISTINCT o.id), 0))::text                        AS "pctProbeBlock",
      (100.0 * COUNT(DISTINCT CASE WHEN o."probeResult"::text = 'DNS_FAIL' THEN o.id END)
               / NULLIF(COUNT(DISTINCT o.id), 0))::text                        AS "pctProbeDns",
      (100.0 * COUNT(DISTINCT CASE WHEN o."probeResult"::text = 'CONNECTION_FAIL' THEN o.id END)
               / NULLIF(COUNT(DISTINCT o.id), 0))::text                        AS "pctProbeConn",
      (100.0 * COUNT(DISTINCT CASE WHEN o."probeResult"::text = 'UNKNOWN_FAILURE' THEN o.id END)
               / NULLIF(COUNT(DISTINCT o.id), 0))::text                        AS "pctProbeUnknown"
    FROM "Service" s
    JOIN "ServiceSurface" ss ON ss."serviceId" = s.id AND ss."isEnabled" = true
    LEFT JOIN "Observation" o
          ON o."serviceSurfaceId" = ss.id
         AND o."observedAt" >= NOW() - INTERVAL '30 days'
    GROUP BY s.id, s.slug, s.name
    ORDER BY s.slug
  `;

  const classified = rows.map(r => ({ ...r, ...classify(r) }));

  // Group by monCap
  const groups = new Map<MonCap, typeof classified>();
  for (const cap of ["OFFICIAL_STATUS_API", "OFFICIAL_STATUS_PAGE", "BASIC_PUBLIC_SURFACE", "BLOCKED_FROM_PROBES", "UNVERIFIABLE"] as MonCap[]) {
    groups.set(cap, classified.filter(r => r.monCap === cap));
  }

  const HR  = "═".repeat(70);
  const sep = "─".repeat(70);

  console.log(`${HR}`);
  console.log("  PR8 — CLASSIFICATION monitoringCapability (LECTURE SEULE)");
  console.log(`${HR}\n`);

  for (const [cap, items] of groups) {
    console.log(`${sep}`);
    console.log(`  ${cap}  (${items.length} services)`);
    console.log(`${sep}`);
    if (cap === "OFFICIAL_STATUS_API" || cap === "OFFICIAL_STATUS_PAGE") {
      // These are fine, just show summary
      for (const r of items.slice(0, 8)) {
        console.log(`  ${r.slug.padEnd(30)} [${r.checkTypes}]`);
      }
      if (items.length > 8) console.log(`  ... et ${items.length - 8} autres`);
    } else {
      // Show details for BASIC, BLOCKED, UNVERIFIABLE
      for (const r of items) {
        const obs    = n(r.totalObs).toFixed(0).padStart(4);
        const reach  = n(r.pctReach).toFixed(0).padStart(3);
        const block  = n(r.pctBlock).toFixed(0).padStart(3);
        const nil    = n(r.pctNull).toFixed(0).padStart(3);
        const lc     = r.lifecycle === "POSSIBLY_INACTIVE" ? " ← POSSIBLY_INACTIVE" : "";
        console.log(`  ${r.slug.padEnd(30)} obs=${obs}  reach=${reach}%  block=${block}%  null=${nil}%${lc}`);
        if (cap === "BLOCKED_FROM_PROBES" || cap === "UNVERIFIABLE") {
          console.log(`    Raison: ${r.reason}`);
        }
      }
    }
  }

  console.log(`\n${HR}`);
  console.log("  RÉSUMÉ");
  console.log(`${HR}`);
  for (const [cap, items] of groups) {
    const pi = items.filter(r => r.lifecycle === "POSSIBLY_INACTIVE").length;
    const piStr = pi > 0 ? ` (dont ${pi} POSSIBLY_INACTIVE)` : "";
    console.log(`  ${cap.padEnd(25)} : ${String(items.length).padStart(3)}${piStr}`);
  }
  console.log(`  ${"TOTAL".padEnd(25)} : ${classified.length}`);

  // Incidents for BLOCKED_FROM_PROBES services
  const blockedSlugs = (groups.get("BLOCKED_FROM_PROBES") ?? []).map(r => r.slug);
  const unverifiableSlugs = (groups.get("UNVERIFIABLE") ?? []).map(r => r.slug);

  if (blockedSlugs.length > 0) {
    const incidentCount = await prisma.incident.count({
      where: {
        isFalsePositive: false,
        service: { slug: { in: blockedSlugs } },
      },
    });
    console.log(`\n  Incidents visibles des BLOCKED_FROM_PROBES : ${incidentCount} (candidats masquage)`);
    const bySlug = await prisma.$queryRaw<Array<{ slug: string; count: bigint }>>`
      SELECT s.slug, COUNT(i.id) AS count
      FROM "Incident" i
      JOIN "Service" s ON s.id = i."serviceId"
      WHERE i."isFalsePositive" = false
        AND s.slug = ANY(${blockedSlugs})
      GROUP BY s.slug ORDER BY count DESC
    `;
    for (const r of bySlug) console.log(`    ${r.slug.padEnd(28)}: ${r.count} incidents`);
  }

  if (unverifiableSlugs.length > 0) {
    const incidentCount = await prisma.incident.count({
      where: {
        isFalsePositive: false,
        service: { slug: { in: unverifiableSlugs } },
      },
    });
    console.log(`\n  Incidents visibles des UNVERIFIABLE : ${incidentCount}`);
  }

  console.log(`\n  ⚠️  AUCUNE ÉCRITURE — ce script est lecture seule\n`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
