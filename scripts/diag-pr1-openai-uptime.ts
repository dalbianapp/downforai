/**
 * PR1 DIAGNOSTIC — OpenAI uptime réel (LECTURE SEULE)
 * Vérifie sur les données réelles ce que la nouvelle logique A3 produirait.
 * Usage: npx tsx scripts/diag-pr1-openai-uptime.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("\n══════════════════════════════════════════════════════════════════════");
  console.log("  PR1 DIAGNOSTIC — OpenAI uptime 24h (données réelles, lecture seule)");
  console.log("══════════════════════════════════════════════════════════════════════\n");

  // 1. Trouver OpenAI
  const service = await prisma.service.findUnique({
    where: { slug: "openai" },
    select: { id: true, slug: true, name: true, monitoringCapability: true },
  });
  if (!service) { console.error("Service openai introuvable"); process.exit(1); }

  console.log(`Service : ${service.name} (${service.slug})`);
  console.log(`monitoringCapability : ${service.monitoringCapability}\n`);

  // 2. Surfaces actives d'OpenAI
  const surfaces = await prisma.serviceSurface.findMany({
    where: { serviceId: service.id, isEnabled: true },
    select: { id: true, slug: true, displayName: true, checkType: true },
    orderBy: { slug: "asc" },
  });
  console.log(`── Surfaces actives (${surfaces.length}) ────────────────────────────────────`);
  for (const s of surfaces) {
    console.log(`  ${s.slug.padEnd(40)} checkType=${s.checkType}`);
  }

  // 3. Observations des 24 dernières heures — par status × probeResult
  const obsBreakdown = await prisma.$queryRaw<
    Array<{
      surfaceSlug: string;
      checkType: string;
      status: string;
      probeResult: string | null;
      cnt: bigint;
    }>
  >`
    SELECT
      ss.slug                       AS "surfaceSlug",
      ss."checkType"::text          AS "checkType",
      o.status::text                AS status,
      o."probeResult"::text         AS "probeResult",
      COUNT(*)                      AS cnt
    FROM "Observation" o
    INNER JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
    WHERE ss."serviceId" = ${service.id}
      AND o."observedAt" >= NOW() - INTERVAL '24 hours'
    GROUP BY ss.slug, ss."checkType", o.status, o."probeResult"
    ORDER BY ss.slug, cnt DESC
  `;

  console.log(`\n── Observations 24h par (surface, status, probeResult) ───────────────`);
  let totalAll = 0n;
  for (const r of obsBreakdown) {
    console.log(
      `  ${r.surfaceSlug.padEnd(38)} status=${r.status.padEnd(12)} probeResult=${(r.probeResult ?? "null").padEnd(18)} cnt=${r.cnt}`
    );
    totalAll += r.cnt;
  }
  console.log(`  ${"TOTAL".padEnd(38+12+18+16)} cnt=${totalAll}`);

  // 4. Surface Atlassian : dernières observations — status vs officialStatus
  const atlassianSurface = surfaces.find(s => s.checkType === "ATLASSIAN_JSON");
  if (atlassianSurface) {
    const lastAtlassianObs = await prisma.$queryRaw<
      Array<{
        observedAt: Date;
        status: string;
        officialStatus: string | null;
        httpStatus: number | null;
        probeResult: string | null;
      }>
    >`
      SELECT
        o."observedAt",
        o.status::text             AS status,
        o."officialStatus"::text   AS "officialStatus",
        o."httpStatus",
        o."probeResult"::text      AS "probeResult"
      FROM "Observation" o
      WHERE o."serviceSurfaceId" = ${atlassianSurface.id}
      ORDER BY o."observedAt" DESC
      LIMIT 10
    `;

    console.log(`\n── Surface Atlassian (${atlassianSurface.slug}) — 10 dernières obs ────────`);
    for (const o of lastAtlassianObs) {
      const age = Math.round((Date.now() - o.observedAt.getTime()) / 60000);
      console.log(
        `  ${o.observedAt.toISOString()} (${age}min)` +
        `  status=${o.status.padEnd(12)}` +
        `  officialStatus=${(o.officialStatus ?? "null").padEnd(12)}` +
        `  http=${o.httpStatus ?? "null"}` +
        `  probe=${o.probeResult ?? "null"}`
      );
    }
  } else {
    console.log("\n⚠️  Pas de surface ATLASSIAN_JSON trouvée pour OpenAI");
  }

  // 5. Simulation logique ANCIENNE (dénominateur actuel)
  const oldUptime = await prisma.$queryRaw<[{ total: bigint; operational: bigint }]>`
    SELECT
      COUNT(*)                                             AS total,
      COUNT(*) FILTER (WHERE o.status = 'OPERATIONAL')    AS operational
    FROM "Observation" o
    INNER JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
    WHERE ss."serviceId" = ${service.id}
      AND o."observedAt" >= NOW() - INTERVAL '24 hours'
  `;

  // 6. Simulation logique NOUVELLE (dénominateur filtré A3)
  const newUptime = await prisma.$queryRaw<[{ total: bigint; operational: bigint }]>`
    SELECT
      COUNT(*) FILTER (
        WHERE o.status IN ('OPERATIONAL','DEGRADED','OUTAGE')
          AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN
               ('BLOCKED','RATE_LIMITED','TIMEOUT','UNKNOWN_FAILURE','PARSE_ERROR'))
      ) AS total,
      COUNT(*) FILTER (
        WHERE o.status = 'OPERATIONAL'
          AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN
               ('BLOCKED','RATE_LIMITED','TIMEOUT','UNKNOWN_FAILURE','PARSE_ERROR'))
      ) AS operational
    FROM "Observation" o
    INNER JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
    WHERE ss."serviceId" = ${service.id}
      AND o."observedAt" >= NOW() - INTERVAL '24 hours'
  `;

  console.log(`\n── Comparaison dénominateurs ────────────────────────────────────────`);
  const oldTotal = oldUptime[0].total;
  const oldOp = oldUptime[0].operational;
  const oldPct = oldTotal > 0n ? Number((oldOp * 10000n) / oldTotal) / 100 : null;
  console.log(`  ANCIENNE logique : total=${oldTotal}  operational=${oldOp}  uptime=${oldPct?.toFixed(1) ?? "N/A"}%`);

  const newTotal = newUptime[0].total;
  const newOp = newUptime[0].operational;
  const newPct = newTotal > 0n ? Number((newOp * 10000n) / newTotal) / 100 : null;
  console.log(`  NOUVELLE logique : total=${newTotal}  operational=${newOp}  uptime=${newPct?.toFixed(1) ?? "N/A"}%`);

  if (newTotal === 0n) {
    console.log(`\n  ⚠️  DÉNOMINATEUR = 0 → uptime affiché : N/A (tout exclu)`);
    console.log(`     Raison probable : seule la surface Atlassian a des obs, et elle n'a`);
    console.log(`     pas status='OPERATIONAL' mais uniquement officialStatus='OPERATIONAL'.`);
  } else {
    console.log(`\n  ✅ Dénominateur non nul → uptime calculable`);
  }

  // 7. Détail des observations Atlassian dans le nouveau dénominateur
  if (atlassianSurface) {
    const atlasInDenom = await prisma.$queryRaw<[{ total: bigint; operational: bigint }]>`
      SELECT
        COUNT(*) FILTER (
          WHERE o.status IN ('OPERATIONAL','DEGRADED','OUTAGE')
            AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN
                 ('BLOCKED','RATE_LIMITED','TIMEOUT','UNKNOWN_FAILURE','PARSE_ERROR'))
        ) AS total,
        COUNT(*) FILTER (
          WHERE o.status = 'OPERATIONAL'
            AND (o."probeResult" IS NULL OR o."probeResult"::text NOT IN
                 ('BLOCKED','RATE_LIMITED','TIMEOUT','UNKNOWN_FAILURE','PARSE_ERROR'))
        ) AS operational
      FROM "Observation" o
      WHERE o."serviceSurfaceId" = ${atlassianSurface.id}
        AND o."observedAt" >= NOW() - INTERVAL '24 hours'
    `;
    console.log(`\n  Surface Atlassian seule dans nouveau dénominateur :`);
    console.log(`    total=${atlasInDenom[0].total}  operational=${atlasInDenom[0].operational}`);
  }

  console.log(`\n══════════════════════════════════════════════════════════════════════\n`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
