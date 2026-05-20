/**
 * Sets checkUrl on ServiceSurface for 36 services previously blocked by Cloudflare.
 * 13 services get Atlassian status page URLs (high quality signal).
 * 23 services get robots.txt fallback (detects site-down, not app-level failures).
 *
 * Usage:
 *   npx tsx scripts/update-cloudflare-services.ts          (dry-run)
 *   npx tsx scripts/update-cloudflare-services.ts --apply  (real run)
 */

import { prisma } from "../src/lib/db";

const DRY_RUN = !process.argv.includes("--apply");

if (DRY_RUN) {
  console.log("🔍 DRY-RUN mode — pass --apply to execute.\n");
} else {
  console.log("🚀 APPLY mode — making real DB changes.\n");
}

const UPDATES: Array<{ slug: string; checkUrl: string; type: string }> = [
  // ─── STATUS PAGES (high quality signal) ──────────────────────────────────
  { slug: "character-ai",      checkUrl: "https://status.character.ai/api/v2/status.json", type: "atlassian_json" },
  { slug: "poe",               checkUrl: "https://status.poe.com/api/v2/status.json",      type: "atlassian_json" },
  { slug: "ideogram",          checkUrl: "https://status.ideogram.ai/api/v2/status.json",  type: "atlassian_json" },
  { slug: "canva-ai",          checkUrl: "https://status.canva.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "inflection-pi",     checkUrl: "https://status.inflection.ai/api/v2/status.json", type: "atlassian_json" },
  { slug: "brainly-ai",        checkUrl: "https://status.brainly.com/api/v2/status.json",  type: "atlassian_json" },
  { slug: "studyfetch",        checkUrl: "https://status.studyfetch.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "couchbase-capella", checkUrl: "https://status.couchbase.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "adobe-express",     checkUrl: "https://status.adobe.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "adobe-photoshop-ai",checkUrl: "https://status.adobe.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "midjourney",        checkUrl: "https://status.midjourney.com/",                 type: "status_page" },
  { slug: "janitorai",         checkUrl: "https://status.janitorai.com/",                  type: "status_page" },
  { slug: "gamma",             checkUrl: "https://status.gamma.app/",                      type: "status_page" },

  // ─── FALLBACK robots.txt ──────────────────────────────────────────────────
  { slug: "xai-grok",       checkUrl: "https://x.ai/robots.txt",                        type: "robots" },
  { slug: "grok-imagine",   checkUrl: "https://x.ai/robots.txt",                        type: "robots" },
  { slug: "viggle",         checkUrl: "https://viggle.ai/robots.txt",                   type: "robots" },
  { slug: "crushon-ai",     checkUrl: "https://crushon.ai/robots.txt",                  type: "robots" },
  { slug: "genspark",       checkUrl: "https://www.genspark.ai/robots.txt",             type: "robots" },
  { slug: "line-ai",        checkUrl: "https://line.me/robots.txt",                     type: "robots" },
  { slug: "craiyon",        checkUrl: "https://www.craiyon.com/robots.txt",             type: "robots" },
  { slug: "hiwaifu",        checkUrl: "https://www.hiwaifu.com/robots.txt",             type: "robots" },
  { slug: "contentatscale", checkUrl: "https://contentatscale.ai/robots.txt",           type: "robots" },
  { slug: "outranking",     checkUrl: "https://www.outranking.io/robots.txt",           type: "robots" },
  { slug: "nightcafe",      checkUrl: "https://creator.nightcafe.studio/robots.txt",    type: "robots" },
  { slug: "comfyui",        checkUrl: "https://www.comfy.org/robots.txt",               type: "robots" },
  { slug: "vocal-remover",  checkUrl: "https://vocalremover.org/robots.txt",            type: "robots" },
  { slug: "kittel-ai",      checkUrl: "https://www.kittl.com/robots.txt",               type: "robots" },
  { slug: "looka",          checkUrl: "https://looka.com/robots.txt",                   type: "robots" },
  { slug: "promeai",        checkUrl: "https://www.promeai.pro/robots.txt",             type: "robots" },
  { slug: "consensus",      checkUrl: "https://consensus.app/robots.txt",               type: "robots" },
  { slug: "speechify",      checkUrl: "https://speechify.com/robots.txt",               type: "robots" },
  { slug: "supernormal",    checkUrl: "https://supernormal.com/robots.txt",             type: "robots" },
  { slug: "chatfai",        checkUrl: "https://chatfai.com/robots.txt",                 type: "robots" },
  { slug: "sybill",         checkUrl: "https://www.sybill.ai/robots.txt",               type: "robots" },
  { slug: "smithery-ai",    checkUrl: "https://smithery.ai/robots.txt",                 type: "robots" },
  { slug: "sizzle",         checkUrl: "https://sizzleai.com/robots.txt",                type: "robots" },
];

async function verifyEndpoint(url: string): Promise<{ ok: boolean; status: number | null }> {
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StatusBot/1.0)" },
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: null };
  }
}

async function main() {
  let updated = 0;
  let skipped = 0;

  console.log(`Processing ${UPDATES.length} services...\n`);

  for (const { slug, checkUrl, type } of UPDATES) {
    process.stdout.write(`  [${type.padEnd(14)}] ${slug.padEnd(20)} → ${checkUrl}\n`);

    // Verify endpoint is reachable
    const { ok, status } = await verifyEndpoint(checkUrl);
    if (!ok) {
      console.log(`    ⚠ SKIP — endpoint returned ${status ?? "error"}, not updating\n`);
      skipped++;
      continue;
    }

    const service = await prisma.service.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!service) {
      console.log(`    ⚠ SKIP — service not found in DB\n`);
      skipped++;
      continue;
    }

    if (!DRY_RUN) {
      await prisma.serviceSurface.updateMany({
        where: { serviceId: service.id },
        data: { checkUrl },
      });
      console.log(`    ✓ updated (HTTP ${status})\n`);
    } else {
      console.log(`    (dry-run — HTTP ${status} ✓)\n`);
    }
    updated++;
  }

  console.log(`\n═══ Summary ══════════════════════`);
  console.log(`  Would update: ${updated}`);
  console.log(`  Skipped:      ${skipped}`);
  if (DRY_RUN) console.log(`\n  Run with --apply to execute.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
