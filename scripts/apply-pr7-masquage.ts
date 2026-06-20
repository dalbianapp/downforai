/**
 * PR7 ÉTAPE C — Masquage effectif des faux incidents (isFalsePositive=true)
 * Règles validées :
 *   - 307 candidats stricts (LOW, 0 report, 0 vrai 5xx) SAUF robin-ai + outranking
 *   - + dreamina et bitbucket-ai (cas limites validés comme artefacts)
 * Usage: npx tsx scripts/apply-pr7-masquage.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type IncidentRow = {
  id: string;
  slug: string;
  startedAt: Date;
  resolvedAt: Date | null;
  hasLow: boolean;
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

const n = (v: unknown) => parseInt(String(v ?? "0"), 10);

// Services à exclure MÊME s'ils passent le critère strict
const NEVER_MASK = new Set(["robin-ai", "outranking"]);

// Services borderline validés explicitement par l'utilisateur
const FORCE_MASK = new Set(["dreamina", "bitbucket-ai"]);

async function main() {
  console.log("\nChargement des incidents…");

  const rows = await prisma.$queryRaw<IncidentRow[]>`
    SELECT
      i.id,
      s.slug,
      i."startedAt",
      i."resolvedAt",
      bool_or(ss."signalConfidence"::text = 'LOW')                               AS "hasLow",
      bool_or(ss."signalConfidence"::text = 'HIGH')                              AS "hasHigh",
      bool_or(ss."checkType"::text = 'ATLASSIAN_JSON')                           AS "hasAtlassian",
      COUNT(DISTINCT o.id)::text                                                  AS "obsCount",
      COUNT(DISTINCT CASE WHEN o."httpStatus" IS NULL THEN o.id END)::text       AS "nullHttpObs",
      COUNT(DISTINCT CASE WHEN o."httpStatus" IN (401,403,405,408,429) THEN o.id END)::text AS "blockedObs",
      COUNT(DISTINCT CASE WHEN o."httpStatus" >= 520 AND o."httpStatus" <= 527 THEN o.id END)::text AS "cfObs",
      COUNT(DISTINCT CASE WHEN o."httpStatus" IN (500,502,503,504) THEN o.id END)::text AS "real5xxObs",
      COUNT(DISTINCT CASE WHEN o."httpStatus" >= 200 AND o."httpStatus" < 300 THEN o.id END)::text AS "okObs",
      COUNT(DISTINCT cr.id)::text                                                 AS "communityReports"
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
    WHERE i."isFalsePositive" = false
    GROUP BY i.id, s.slug, i."startedAt", i."resolvedAt"
    ORDER BY i."startedAt" DESC
  `;

  console.log(`${rows.length} incidents non-masqués en base`);

  const toMask: IncidentRow[] = [];
  const forced: IncidentRow[] = [];
  let skippedNeverMask = 0;

  for (const r of rows) {
    const community = n(r.communityReports);
    const real5xx   = n(r.real5xxObs);
    const obsCount  = n(r.obsCount);
    const safeObs   = n(r.nullHttpObs) + n(r.blockedObs) + n(r.cfObs) + n(r.okObs);

    // FORCE_MASK overrides NEVER_MASK (dreamina/bitbucket-ai already no NEVER_MASK anyway)
    if (FORCE_MASK.has(r.slug)) {
      forced.push(r);
      continue;
    }

    if (NEVER_MASK.has(r.slug)) {
      skippedNeverMask++;
      continue;
    }

    // Strict candidate criteria
    if (
      community > 0 ||
      r.hasAtlassian ||
      r.hasHigh
    ) continue;

    if (
      r.hasLow &&
      !r.hasHigh &&
      !r.hasAtlassian &&
      community === 0 &&
      real5xx === 0 &&
      (safeObs >= obsCount || obsCount === 0)
    ) {
      toMask.push(r);
    }
  }

  const allToMask = [...toMask, ...forced];
  const ids = allToMask.map(r => r.id);

  console.log(`\n──────────────────────────────────────────────`);
  console.log(`  Candidats stricts             : ${toMask.length}`);
  console.log(`  Cas limites validés (forced)  : ${forced.length} (${[...forced.map(r=>r.slug)].join(", ")})`);
  console.log(`  Exclus NEVER_MASK             : ${skippedNeverMask} (robin-ai + outranking)`);
  console.log(`  TOTAL À MASQUER               : ${allToMask.length}`);
  console.log(`──────────────────────────────────────────────\n`);

  if (ids.length === 0) {
    console.log("Rien à masquer.");
    await prisma.$disconnect();
    return;
  }

  // Safety: print first 5 and last 5
  console.log("Échantillon incidents à masquer (5 premiers) :");
  for (const r of allToMask.slice(0, 5)) {
    console.log(`  ${r.slug.padEnd(28)} ${r.id.slice(0,12)}  started=${r.startedAt.toISOString().slice(0,10)}`);
  }
  console.log("Échantillon incidents à masquer (5 derniers) :");
  for (const r of allToMask.slice(-5)) {
    console.log(`  ${r.slug.padEnd(28)} ${r.id.slice(0,12)}  started=${r.startedAt.toISOString().slice(0,10)}`);
  }

  console.log(`\nApplication isFalsePositive=true sur ${ids.length} incidents…`);

  const result = await prisma.incident.updateMany({
    where: { id: { in: ids } },
    data: {
      isFalsePositive: true,
      hiddenReason: "PROBE_BLOCKED_FALSE_POSITIVE",
      reviewedAt: new Date(),
    },
  });

  console.log(`✅ ${result.count} incidents masqués\n`);

  // Verification: remaining visible incidents
  const remaining = await prisma.incident.count({ where: { isFalsePositive: false } });
  const masked    = await prisma.incident.count({ where: { isFalsePositive: true } });
  const total     = await prisma.incident.count();

  console.log("État final :");
  console.log(`  Total en base    : ${total}`);
  console.log(`  Masqués (hidden) : ${masked}`);
  console.log(`  Visibles publics : ${remaining}`);

  // Show the remaining incidents for verification
  const kept = await prisma.$queryRaw<Array<{ slug: string; count: bigint }>>`
    SELECT s.slug, COUNT(i.id) AS count
    FROM "Incident" i
    JOIN "Service" s ON s.id = i."serviceId"
    WHERE i."isFalsePositive" = false
    GROUP BY s.slug
    ORDER BY count DESC
  `;

  console.log("\nIncidents CONSERVÉS publiquement (par service) :");
  for (const r of kept) {
    console.log(`  ${r.slug.padEnd(30)} : ${r.count}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
