/**
 * PR8 ÉTAPE B+D — Backfill monitoringCapability (817 services) + masquage robin-ai (30 incidents)
 *
 * Usage:
 *   npx tsx scripts/apply-pr8-backfill.ts           → dry-run, affiche le plan
 *   npx tsx scripts/apply-pr8-backfill.ts --apply   → applique en base
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const APPLY = process.argv.includes("--apply");

const KNOWN_BLOCKED = new Set(["robin-ai", "babbel-ai"]);
const KNOWN_UNVERIFIABLE = new Set(["headlime", "bloop-ai"]);

type ServiceRow = {
  serviceId: string;
  slug: string;
  name: string;
  checkTypes: string;
  totalObs: string;
  pctReach: string;
  pctBlock: string;
  pctServerErr: string;
  pctNull: string;
  pctProbeBlock: string;
  pctProbeDns: string;
  pctProbeConn: string;
  pctProbeUnknown: string;
};

type MonCap =
  | "OFFICIAL_STATUS_API"
  | "OFFICIAL_STATUS_PAGE"
  | "BASIC_PUBLIC_SURFACE"
  | "BLOCKED_FROM_PROBES"
  | "UNVERIFIABLE";

type LifecycleS = "ACTIVE" | "POSSIBLY_INACTIVE";

const n = (v: unknown) => parseFloat(String(v ?? "0"));

function classify(row: ServiceRow): { monCap: MonCap; lifecycle: LifecycleS; reason: string } {
  const types = row.checkTypes.split(",").map(t => t.trim());

  if (types.includes("ATLASSIAN_JSON")) {
    return { monCap: "OFFICIAL_STATUS_API", lifecycle: "ACTIVE", reason: "ATLASSIAN_JSON" };
  }
  if (types.some(t => ["STATUS_HTML", "GCP_JSON", "AWS_HEALTH", "AZURE_STATUS"].includes(t))) {
    return {
      monCap: "OFFICIAL_STATUS_PAGE", lifecycle: "ACTIVE",
      reason: types.filter(t => ["STATUS_HTML","GCP_JSON","AWS_HEALTH","AZURE_STATUS"].includes(t)).join("/"),
    };
  }
  if (KNOWN_BLOCKED.has(row.slug)) {
    return { monCap: "BLOCKED_FROM_PROBES", lifecycle: "ACTIVE", reason: "confirmé vivant, bloqué depuis IPs Vercel" };
  }
  if (KNOWN_UNVERIFIABLE.has(row.slug)) {
    return { monCap: "UNVERIFIABLE", lifecycle: "POSSIBLY_INACTIVE", reason: "DNS OK mais HTTP timeout depuis France" };
  }

  const total   = n(row.totalObs);
  const pctR    = n(row.pctReach);
  const pctB    = n(row.pctBlock);
  const pctNull = n(row.pctNull);
  const pctPB   = n(row.pctProbeBlock);
  const pctDns  = n(row.pctProbeDns);
  const pctConn = n(row.pctProbeConn);
  const pctUnk  = n(row.pctProbeUnknown);
  const pct5xx  = n(row.pctServerErr);

  if (total < 5) return { monCap: "BASIC_PUBLIC_SURFACE", lifecycle: "ACTIVE", reason: "<5 obs" };
  if (pctR > 20) return { monCap: "BASIC_PUBLIC_SURFACE", lifecycle: "ACTIVE", reason: `${pctR.toFixed(0)}% REACHABLE` };
  if (pctB > 40 || pctPB > 40) return { monCap: "BLOCKED_FROM_PROBES", lifecycle: "ACTIVE", reason: `${Math.max(pctB, pctPB).toFixed(0)}% block` };
  if (pct5xx > 20) return { monCap: "BASIC_PUBLIC_SURFACE", lifecycle: "ACTIVE", reason: `${pct5xx.toFixed(0)}% 5xx` };
  if (pctDns > 60) return { monCap: "BLOCKED_FROM_PROBES", lifecycle: "ACTIVE", reason: `${pctDns.toFixed(0)}% DNS_FAIL` };
  if (pctConn > 60) return { monCap: "BLOCKED_FROM_PROBES", lifecycle: "ACTIVE", reason: `${pctConn.toFixed(0)}% CONNECTION_FAIL` };
  if (pctNull > 75 || pctUnk > 75) return { monCap: "UNVERIFIABLE", lifecycle: "POSSIBLY_INACTIVE", reason: `${Math.max(pctNull, pctUnk).toFixed(0)}% null/UNKNOWN` };
  return { monCap: "BASIC_PUBLIC_SURFACE", lifecycle: "ACTIVE", reason: "signaux mixtes" };
}

async function main() {
  const mode = APPLY ? "APPLY" : "DRY-RUN";
  console.log(`\n${"═".repeat(70)}`);
  console.log(`  PR8 BACKFILL — monitoringCapability + ÉTAPE D  [${mode}]`);
  console.log(`${"═".repeat(70)}\n`);

  // ── Query service stats (same as diag-pr8-classification.ts) ─────────────
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

  // ── Distribution summary ──────────────────────────────────────────────────
  const dist = new Map<MonCap, number>();
  for (const r of classified) dist.set(r.monCap, (dist.get(r.monCap) ?? 0) + 1);

  console.log("Distribution cible :");
  for (const [cap, count] of dist) {
    console.log(`  ${cap.padEnd(25)}: ${count}`);
  }
  console.log(`  ${"TOTAL".padEnd(25)}: ${classified.length}\n`);

  // ── Show non-BASIC services (the ones that will actually change) ──────────
  const nonBasic = classified.filter(r => r.monCap !== "BASIC_PUBLIC_SURFACE");
  console.log(`Services avec monitoringCapability ≠ BASIC_PUBLIC_SURFACE (${nonBasic.length}) :`);
  for (const r of nonBasic) {
    const lc = r.lifecycle !== "ACTIVE" ? ` [lifecycleStatus=${r.lifecycle}]` : "";
    console.log(`  ${r.slug.padEnd(32)} → ${r.monCap}${lc}`);
  }

  // ── robin-ai incidents (ÉTAPE D) ──────────────────────────────────────────
  const robinIncidents = await prisma.incident.findMany({
    where: { service: { slug: "robin-ai" }, isFalsePositive: false },
    select: { id: true, startedAt: true, severity: true },
  });
  console.log(`\nÉTAPE D — robin-ai incidents à masquer : ${robinIncidents.length}`);
  for (const i of robinIncidents) {
    console.log(`  ${i.id}  ${i.startedAt.toISOString().slice(0,10)}  ${i.severity}`);
  }

  if (!APPLY) {
    console.log(`\n⚠️  DRY-RUN — aucune écriture. Relance avec --apply pour appliquer.\n`);
    await prisma.$disconnect();
    return;
  }

  // ── APPLY ─────────────────────────────────────────────────────────────────
  console.log("\n🚀  Application en cours...\n");
  const now = new Date();
  let updated = 0;

  // Batch updates by capability (more efficient than one-by-one)
  const byMonCap = new Map<MonCap, string[]>();
  for (const r of classified) {
    if (!byMonCap.has(r.monCap)) byMonCap.set(r.monCap, []);
    byMonCap.get(r.monCap)!.push(r.serviceId);
  }

  for (const [cap, ids] of byMonCap) {
    const result = await prisma.service.updateMany({
      where: { id: { in: ids } },
      data: { monitoringCapability: cap },
    });
    console.log(`  monitoringCapability=${cap} → ${result.count} services mis à jour`);
    updated += result.count;
  }

  // Set lifecycleStatus=POSSIBLY_INACTIVE for UNVERIFIABLE services
  const unverifiableIds = classified
    .filter(r => r.monCap === "UNVERIFIABLE" && r.lifecycle === "POSSIBLY_INACTIVE")
    .map(r => r.serviceId);
  if (unverifiableIds.length > 0) {
    const result = await prisma.service.updateMany({
      where: { id: { in: unverifiableIds } },
      data: { lifecycleStatus: "POSSIBLY_INACTIVE" },
    });
    console.log(`  lifecycleStatus=POSSIBLY_INACTIVE → ${result.count} services`);
  }

  // ÉTAPE D: Mask robin-ai incidents + set monitoringCapability
  const robinMask = await prisma.incident.updateMany({
    where: { service: { slug: "robin-ai" }, isFalsePositive: false },
    data: {
      isFalsePositive: true,
      hiddenReason: "PROBE_BLOCKED_FALSE_POSITIVE",
      reviewedAt: now,
    },
  });
  console.log(`\n  robin-ai incidents masqués : ${robinMask.count}`);

  // robin-ai service: monitoringCapability is already set by the batch above (BLOCKED_FROM_PROBES)
  // but let's also ensure lifecycleStatus=ACTIVE explicitly
  await prisma.service.update({
    where: { slug: "robin-ai" },
    data: { lifecycleStatus: "ACTIVE" },
  });
  console.log(`  robin-ai lifecycleStatus=ACTIVE confirmé`);

  // ── Post-apply verification ───────────────────────────────────────────────
  console.log("\n── Vérification post-apply ────────────────────────────────────────────");

  const distInDb = await prisma.$queryRaw<Array<{ cap: string; count: bigint }>>`
    SELECT "monitoringCapability"::text AS cap, COUNT(*)::bigint AS count
    FROM "Service"
    GROUP BY "monitoringCapability"
    ORDER BY count DESC
  `;
  console.log("\n  Distribution monitoringCapability en base :");
  let totalServices = 0n;
  for (const r of distInDb) {
    console.log(`  ${r.cap.padEnd(25)}: ${r.count}`);
    totalServices += r.count;
  }
  console.log(`  ${"TOTAL".padEnd(25)}: ${totalServices}`);

  const publicIncidents = await prisma.incident.count({
    where: { isFalsePositive: false },
  });
  console.log(`\n  Incidents publics (isFalsePositive=false) : ${publicIncidents}`);

  const atlassianCount = await prisma.service.count({
    where: { monitoringCapability: "OFFICIAL_STATUS_API" },
  });
  console.log(`  Services OFFICIAL_STATUS_API (Atlassian) : ${atlassianCount}`);

  console.log(`\n✅  Backfill terminé — ${updated} services monitoringCapability mis à jour\n`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
