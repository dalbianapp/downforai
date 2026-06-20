/**
 * PR7 ÉTAPE B — Rapport faux incidents historiques (LECTURE SEULE, aucun masquage)
 * Usage: npx tsx scripts/diag-pr7-report.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type IncidentRow = {
  id: string;
  serviceId: string;
  slug: string;
  serviceName: string;
  startedAt: Date;
  resolvedAt: Date | null;
  incidentStatus: string;
  severity: string;
  hasLow: boolean;
  hasMedium: boolean;
  hasHigh: boolean;
  hasAtlassian: boolean;
  obsCount: string;
  nullHttpObs: string;
  blockedObs: string;
  cfObs: string;
  real5xxObs: string;
  okObs: string;
  communityReports: string;
};

async function main() {
  console.log("\nChargement des incidents en base…");

  const rows = await prisma.$queryRaw<IncidentRow[]>`
    SELECT
      i.id,
      i."serviceId",
      s.slug,
      s.name                                                                AS "serviceName",
      i."startedAt",
      i."resolvedAt",
      i.status::text                                                        AS "incidentStatus",
      i.severity::text,
      bool_or(ss."signalConfidence"::text = 'LOW')                         AS "hasLow",
      bool_or(ss."signalConfidence"::text = 'MEDIUM')                      AS "hasMedium",
      bool_or(ss."signalConfidence"::text = 'HIGH')                        AS "hasHigh",
      bool_or(ss."checkType"::text = 'ATLASSIAN_JSON')                     AS "hasAtlassian",
      COUNT(DISTINCT o.id)::text                                            AS "obsCount",
      COUNT(DISTINCT CASE WHEN o."httpStatus" IS NULL THEN o.id END)::text                                   AS "nullHttpObs",
      COUNT(DISTINCT CASE WHEN o."httpStatus" IN (401,403,405,408,429) THEN o.id END)::text                  AS "blockedObs",
      COUNT(DISTINCT CASE WHEN o."httpStatus" >= 520 AND o."httpStatus" <= 527 THEN o.id END)::text          AS "cfObs",
      COUNT(DISTINCT CASE WHEN o."httpStatus" IN (500,502,503,504) THEN o.id END)::text                      AS "real5xxObs",
      COUNT(DISTINCT CASE WHEN o."httpStatus" >= 200 AND o."httpStatus" < 300 THEN o.id END)::text           AS "okObs",
      COUNT(DISTINCT cr.id)::text                                           AS "communityReports"
    FROM "Incident" i
    JOIN "Service" s ON s.id = i."serviceId"
    JOIN "ServiceSurface" ss ON ss."serviceId" = i."serviceId"
    LEFT JOIN "Observation" o
          ON o."serviceSurfaceId" = ss.id
         AND o."observedAt" >= i."startedAt" - INTERVAL '1 hour'
         AND o."observedAt" <= COALESCE(i."resolvedAt", NOW())
    LEFT JOIN "CommunityReport" cr
          ON cr."serviceId" = i."serviceId"
         AND cr."createdAt" >= i."startedAt"
         AND cr."createdAt" <= COALESCE(i."resolvedAt", NOW())
    GROUP BY i.id, i."serviceId", s.slug, s.name,
             i."startedAt", i."resolvedAt", i.status, i.severity
    ORDER BY i."startedAt" DESC
  `;

  const total = rows.length;

  const n = (v: unknown) => parseInt(String(v ?? "0"), 10);

  function durH(row: IncidentRow): number {
    const end = row.resolvedAt ?? new Date();
    return (end.getTime() - row.startedAt.getTime()) / 3_600_000;
  }

  // Classify
  const candidates: IncidentRow[] = [];
  const borderline: IncidentRow[] = [];
  const real: IncidentRow[] = [];

  for (const r of rows) {
    const obsCount   = n(r.obsCount);
    const nullHttp   = n(r.nullHttpObs);
    const blocked    = n(r.blockedObs);
    const cf         = n(r.cfObs);
    const real5xx    = n(r.real5xxObs);
    const ok         = n(r.okObs);
    const community  = n(r.communityReports);

    // Can never mask
    if (community > 0 || r.hasAtlassian || r.hasHigh) {
      real.push(r); continue;
    }

    if (r.hasLow && !r.hasHigh && !r.hasAtlassian && community === 0) {
      const safeObs = nullHttp + blocked + cf + ok;
      if (real5xx === 0 && (safeObs >= obsCount || obsCount === 0)) {
        candidates.push(r);
      } else if (real5xx > 0) {
        borderline.push(r);
      } else {
        real.push(r);
      }
    } else {
      real.push(r);
    }
  }

  const candidateHours  = candidates.reduce((s, r) => s + durH(r), 0);
  const borderlineHours = borderline.reduce((s, r) => s + durH(r), 0);

  function groupBy(list: IncidentRow[]) {
    const m = new Map<string, IncidentRow[]>();
    for (const r of list) {
      if (!m.has(r.slug)) m.set(r.slug, []);
      m.get(r.slug)!.push(r);
    }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }

  // ── PRINT REPORT ──────────────────────────────────────────────────────────
  const hr = "══════════════════════════════════════════════════════════════";
  const sep = "──────────────────────────────────────────────────────────────";

  console.log(`\n${hr}`);
  console.log("  PR7 — RAPPORT FAUX INCIDENTS HISTORIQUES (LECTURE SEULE)");
  console.log(`${hr}\n`);

  console.log(`  Total incidents en base       : ${total}`);
  console.log(`  Candidats masquage strict     : ${candidates.length}  (${candidateHours.toFixed(0)}h de bruit cumulé)`);
  console.log(`  Cas limites (revue manuelle)  : ${borderline.length}  (${borderlineHours.toFixed(0)}h)`);
  console.log(`  Vrais incidents à conserver   : ${real.length}\n`);

  console.log(`${sep}`);
  console.log("  1. CANDIDATS AU MASQUAGE — critère strict");
  console.log("     (LOW conf, 0 report, 0 vrai 5xx, uniquement null/403/429/52x)");
  console.log(`${sep}`);
  for (const [slug, inc] of groupBy(candidates)) {
    const h = inc.reduce((s, r) => s + durH(r), 0);
    const nullTotal = inc.reduce((s, r) => s + n(r.nullHttpObs), 0);
    const blkTotal  = inc.reduce((s, r) => s + n(r.blockedObs) + n(r.cfObs), 0);
    const allNull   = nullTotal > 0 && blkTotal === 0;
    const note      = allNull ? "  ← toutes obs null (poss. mort?)" : "";
    console.log(`  ${slug.padEnd(30)} ${String(inc.length).padStart(3)} incidents   ${h.toFixed(0).padStart(5)}h${note}`);
  }
  // httpStatus breakdown
  const sumNull    = candidates.reduce((s, r) => s + n(r.nullHttpObs), 0);
  const sumBlocked = candidates.reduce((s, r) => s + n(r.blockedObs), 0);
  const sumCF      = candidates.reduce((s, r) => s + n(r.cfObs), 0);
  const sumOk      = candidates.reduce((s, r) => s + n(r.okObs), 0);
  console.log(`\n  httpStatus dans la fenêtre :`);
  console.log(`    null (réseau)     : ${sumNull} obs`);
  console.log(`    401/403/429       : ${sumBlocked} obs`);
  console.log(`    52x Cloudflare    : ${sumCF} obs`);
  console.log(`    2xx (incohérent!) : ${sumOk} obs`);

  console.log(`\n${sep}`);
  console.log("  2. CAS LIMITES — à décider manuellement");
  console.log("     (LOW conf, 0 report, mais contient de vrais 5xx 500/502/503/504)");
  console.log(`${sep}`);
  if (borderline.length === 0) {
    console.log("  (aucun cas limite)");
  } else {
    for (const [slug, inc] of groupBy(borderline)) {
      const h = inc.reduce((s, r) => s + durH(r), 0);
      const t5 = inc.reduce((s, r) => s + n(r.real5xxObs), 0);
      console.log(`  ${slug.padEnd(30)} ${String(inc.length).padStart(3)} incidents   ${h.toFixed(0).padStart(5)}h   (${t5} obs 5xx)`);
    }
    console.log("\n  Détail :");
    for (const r of borderline.slice(0, 12)) {
      const h = durH(r).toFixed(1);
      console.log(`    ${r.slug.padEnd(26)} ${r.startedAt.toISOString().slice(0,10)}  dur=${h}h  null=${r.nullHttpObs} 5xx=${r.real5xxObs} cf=${r.cfObs} ok=${r.okObs}`);
    }
  }

  console.log(`\n${sep}`);
  console.log("  3. VRAIS INCIDENTS CONSERVÉS");
  console.log(`${sep}`);
  for (const [slug, count] of groupBy(real).slice(0, 25)) {
    console.log(`  ${slug.padEnd(30)} ${count}`);
  }
  if (real.length > 25) console.log(`  … et ${real.length - 25} autres`);

  console.log(`\n${hr}`);
  console.log("  RÉSUMÉ");
  console.log(`${hr}`);
  console.log(`  Total                     : ${total}`);
  console.log(`  Candidats masquage        : ${candidates.length} (${(candidates.length/total*100).toFixed(1)}%) — ${candidateHours.toFixed(0)}h bruit`);
  console.log(`  Cas limites               : ${borderline.length} (${(borderline.length/total*100).toFixed(1)}%) — ${borderlineHours.toFixed(0)}h`);
  console.log(`  Vrais incidents           : ${real.length} (${(real.length/total*100).toFixed(1)}%)`);
  console.log(`\n  ⚠️  AUCUN MASQUAGE APPLIQUÉ — ce rapport est lecture seule\n`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
