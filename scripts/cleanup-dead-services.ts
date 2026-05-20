/**
 * Phase 1: Delete 13 confirmed dead services from DB
 * Phase 2: Update 10 changed URLs
 * Phase 3: Configure 4 status page checkUrls
 *
 * Usage:
 *   npx tsx scripts/cleanup-dead-services.ts          (dry-run)
 *   npx tsx scripts/cleanup-dead-services.ts --apply  (real run)
 */

import { prisma } from "../src/lib/db";

const DRY_RUN = !process.argv.includes("--apply");

if (DRY_RUN) {
  console.log("🔍 DRY-RUN mode — no DB changes will be made. Pass --apply to execute.\n");
} else {
  console.log("🚀 APPLY mode — making real DB changes.\n");
}

// ─── PHASE 1 — Dead services to delete ───────────────────────────────────────

const DEAD_SLUGS = [
  "octoai",          // acquired by NVIDIA oct 2024, service closed
  "invoke-ai",       // invoke.com domain for sale
  "phind",           // acquired by SambaNova 2025, site 404
  "3dfy-ai",         // site 404 / timeout
  "hour-one",        // site 404 / timeout
  "csm-ai",          // DNS failure, surface already disabled
  "play-ht",         // site dead
  "dora",            // site dead
  "visual-electric", // site dead
  "safurai",         // SSL expired
  "querium",         // SSL invalid
  "predibase",       // SSL expired
  "moemate",         // service closed, only docs remain
];

// ─── PHASE 2 — URL updates ───────────────────────────────────────────────────

const URL_UPDATES: Array<{ slug: string; websiteUrl: string; checkUrl: string }> = [
  { slug: "scispace",        websiteUrl: "https://scispace.com",          checkUrl: "https://scispace.com" },
  { slug: "wonder-dynamics", websiteUrl: "https://www.autodesk.com/products/flow-studio/overview", checkUrl: "https://www.autodesk.com/products/flow-studio/overview" },
  { slug: "magnific",        websiteUrl: "https://www.magnific.com",      checkUrl: "https://www.magnific.com" },
  { slug: "freepik-ai",      websiteUrl: "https://www.freepik.com",       checkUrl: "https://www.freepik.com" },
  { slug: "tavus-ai",        websiteUrl: "https://www.tavus.io",          checkUrl: "https://www.tavus.io" },
  { slug: "trae-ide",        websiteUrl: "https://www.trae.ai",           checkUrl: "https://www.trae.ai" },
  { slug: "agility-writer",  websiteUrl: "https://agilitywriter.ai",      checkUrl: "https://agilitywriter.ai" },
  { slug: "figgs-ai",        websiteUrl: "https://figgs.life",            checkUrl: "https://figgs.life" },
  { slug: "sillytavern",     websiteUrl: "https://sillytavern.app",       checkUrl: "https://sillytavern.app" },
  { slug: "jais-ai",         websiteUrl: "https://inceptionai.ai",        checkUrl: "https://inceptionai.ai" },
];

// ─── PHASE 3 — Status page checkUrls ─────────────────────────────────────────

const STATUS_PAGE_UPDATES: Array<{ slug: string; checkUrl: string }> = [
  { slug: "perplexity",      checkUrl: "https://status.perplexity.com/" },
  { slug: "sora",            checkUrl: "https://status.openai.com/api/v2/status.json" },
  { slug: "le-chat-mistral", checkUrl: "https://status.mistral.ai/" },
  { slug: "make-ai",         checkUrl: "https://status.make.com/api/v2/status.json" },
];

async function verifyStatusPage(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  // ─── PHASE 1 — Delete dead services ────────────────────────────────────────
  console.log("═══ PHASE 1 — Deleting dead services ════════════════\n");

  for (const slug of DEAD_SLUGS) {
    const service = await prisma.service.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!service) {
      console.log(`  [SKIP]    ${slug} — not found in DB`);
      continue;
    }

    const surfaces = await prisma.serviceSurface.findMany({
      where: { serviceId: service.id },
      select: { id: true },
    });

    const obsCounts = await Promise.all(
      surfaces.map((s) =>
        prisma.observation.count({ where: { serviceSurfaceId: s.id } })
      )
    );
    const totalObs = obsCounts.reduce((a, b) => a + b, 0);
    const incidentCount = await prisma.incident.count({ where: { serviceId: service.id } });
    const reportCount = await prisma.communityReport.count({ where: { serviceId: service.id } });

    console.log(`  [DELETE]  ${slug} (${service.name})`);
    console.log(`            surfaces=${surfaces.length} obs=${totalObs} incidents=${incidentCount} reports=${reportCount}`);

    if (!DRY_RUN) {
      for (const surface of surfaces) {
        await prisma.observation.deleteMany({ where: { serviceSurfaceId: surface.id } });
      }
      await prisma.serviceSurface.deleteMany({ where: { serviceId: service.id } });
      await prisma.incident.deleteMany({ where: { serviceId: service.id } });
      await prisma.communityReport.deleteMany({ where: { serviceId: service.id } });
      await prisma.service.delete({ where: { id: service.id } });
      console.log(`            ✓ deleted\n`);
    } else {
      console.log(`            (dry-run — skipped)\n`);
    }
  }

  // ─── PHASE 2 — URL updates ─────────────────────────────────────────────────
  console.log("═══ PHASE 2 — Updating changed URLs ════════════════\n");

  for (const { slug, websiteUrl, checkUrl } of URL_UPDATES) {
    const service = await prisma.service.findUnique({
      where: { slug },
      select: { id: true, name: true, websiteUrl: true },
    });

    if (!service) {
      console.log(`  [SKIP]    ${slug} — not found in DB`);
      continue;
    }

    console.log(`  [UPDATE]  ${slug}`);
    console.log(`            websiteUrl: ${service.websiteUrl} → ${websiteUrl}`);
    console.log(`            checkUrl:   → ${checkUrl}`);

    if (!DRY_RUN) {
      await prisma.service.update({
        where: { slug },
        data: { websiteUrl },
      });
      // Update all surfaces for this service
      await prisma.serviceSurface.updateMany({
        where: { serviceId: service.id },
        data: { checkUrl },
      });
      console.log(`            ✓ updated\n`);
    } else {
      console.log(`            (dry-run — skipped)\n`);
    }
  }

  // ─── PHASE 3 — Status page checkUrls ────────────────────────────────────────
  console.log("═══ PHASE 3 — Status page endpoints ════════════════\n");

  for (const { slug, checkUrl } of STATUS_PAGE_UPDATES) {
    console.log(`  [STATUS]  ${slug} → ${checkUrl}`);

    // Verify reachability
    const ok = await verifyStatusPage(checkUrl);
    if (!ok) {
      console.log(`  [SKIP]    ${slug} — status page not reachable: ${checkUrl}\n`);
      continue;
    }
    console.log(`            status page: reachable ✓`);

    const service = await prisma.service.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!service) {
      console.log(`  [SKIP]    ${slug} — not found in DB\n`);
      continue;
    }

    if (!DRY_RUN) {
      await prisma.serviceSurface.updateMany({
        where: { serviceId: service.id },
        data: { checkUrl },
      });
      console.log(`            ✓ updated\n`);
    } else {
      console.log(`            (dry-run — skipped)\n`);
    }
  }

  console.log("═══ Done ════════════════════════════════════════════\n");
}

main().catch(console.error).finally(() => prisma.$disconnect());
