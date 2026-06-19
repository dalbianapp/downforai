/**
 * PR 2b — ÉTAPE C/D: Fix misclassified ATLASSIAN_JSON surfaces
 *
 * ÉTAPE C (5 URL fixes — parser inchangé, checkType reste ATLASSIAN_JSON):
 *   canva-ai      → https://www.canvastatus.com/api/v2/status.json
 *   linear-ai     → https://linearstatus.com/api/v2/status.json
 *   notion-ai     → https://www.notion-status.com/api/v2/status.json
 *   intercom-fin  → https://www.finstatus.com/api/v2/status.json
 *   inflection-pi → https://statuspage.incident.io/inflection-ai/api/v2/status.json
 *
 * ÉTAPE D (7 déclassements — pas de JSON public, reclassify + fix checkUrl):
 *   adobe-express → STATUS_HTML/MEDIUM, https://status.adobe.com
 *   algolia-ai    → STATUS_HTML/MEDIUM, https://status.algolia.com
 *   corcel-io     → STATUS_HTML/MEDIUM, https://status.corcel.io
 *   hugging-face  → STATUS_HTML/MEDIUM, https://status.huggingface.co
 *   mistral       → STATUS_HTML/MEDIUM, https://status.mistral.ai
 *   character-ai  → STATUS_HTML/MEDIUM, https://status.character.ai
 *   quillbot      → HOMEPAGE/LOW, null (fallback to websiteUrl)
 *
 * SHADOW MODE INTACT — aucune écriture de statut/observation.
 * Only checkUrl + checkType + signalConfidence are touched.
 *
 * Default: dry-run (report only). Pass --commit to write.
 */

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");

// ÉTAPE C: fix URL only, keep ATLASSIAN_JSON + HIGH confidence
const URL_FIXES: Array<{ serviceSlug: string; oldUrl: string; newUrl: string }> = [
  {
    serviceSlug: "canva-ai",
    oldUrl: "https://status.canva.com/api/v2/status.json",
    newUrl: "https://www.canvastatus.com/api/v2/status.json",
  },
  {
    serviceSlug: "linear-ai",
    oldUrl: "https://status.linear.app/api/v2/status.json",
    newUrl: "https://linearstatus.com/api/v2/status.json",
  },
  {
    serviceSlug: "notion-ai",
    oldUrl: "https://status.notion.so/api/v2/status.json",
    newUrl: "https://www.notion-status.com/api/v2/status.json",
  },
  {
    serviceSlug: "intercom-fin",
    oldUrl: "https://www.intercomstatus.com/api/v2/status.json",
    newUrl: "https://www.finstatus.com/api/v2/status.json",
  },
  {
    serviceSlug: "inflection-pi",
    oldUrl: "https://status.inflection.ai/api/v2/status.json",
    newUrl: "https://statuspage.incident.io/inflection-ai/api/v2/status.json",
  },
];

// ÉTAPE D: reclassify (bad checkUrl → proper STATUS_HTML or HOMEPAGE)
const DOWNGRADES: Array<{
  serviceSlug: string;
  oldUrl: string;
  newUrl: string | null;
  checkType: "STATUS_HTML" | "HOMEPAGE";
  signalConfidence: "MEDIUM" | "LOW";
}> = [
  {
    serviceSlug: "adobe-express",
    oldUrl: "https://status.adobe.com/api/v2/status.json",
    newUrl: "https://status.adobe.com",
    checkType: "STATUS_HTML",
    signalConfidence: "MEDIUM",
  },
  {
    serviceSlug: "algolia-ai",
    oldUrl: "https://status.algolia.com/api/v2/status.json",
    newUrl: "https://status.algolia.com",
    checkType: "STATUS_HTML",
    signalConfidence: "MEDIUM",
  },
  {
    serviceSlug: "corcel-io",
    oldUrl: "https://status.corcel.io/api/v2/status.json",
    newUrl: "https://status.corcel.io",
    checkType: "STATUS_HTML",
    signalConfidence: "MEDIUM",
  },
  {
    serviceSlug: "hugging-face",
    oldUrl: "https://status.huggingface.co/api/v2/status.json",
    newUrl: "https://status.huggingface.co",
    checkType: "STATUS_HTML",
    signalConfidence: "MEDIUM",
  },
  {
    serviceSlug: "mistral",
    oldUrl: "https://status.mistral.ai/api/v2/status.json",
    newUrl: "https://status.mistral.ai",
    checkType: "STATUS_HTML",
    signalConfidence: "MEDIUM",
  },
  {
    serviceSlug: "character-ai",
    oldUrl: "https://status.character.ai/api/v2/status.json",
    newUrl: "https://status.character.ai",
    checkType: "STATUS_HTML",
    signalConfidence: "MEDIUM",
  },
  {
    serviceSlug: "quillbot",
    oldUrl: "https://status.quillbot.com/api/v2/status.json",
    newUrl: null,
    checkType: "HOMEPAGE",
    signalConfidence: "LOW",
  },
];

async function main() {
  console.log(`\n=== PR 2b — fix-atlassian-urls [${COMMIT ? "COMMIT" : "DRY-RUN"}] ===\n`);

  // ── ÉTAPE C: URL fixes ──────────────────────────────────────────────
  console.log("--- ÉTAPE C: URL fixes (ATLASSIAN_JSON, parser inchangé) ---");
  for (const fix of URL_FIXES) {
    const surfaces = await prisma.serviceSurface.findMany({
      where: {
        service: { slug: fix.serviceSlug },
        checkUrl: fix.oldUrl,
      },
      select: { id: true, displayName: true },
    });

    if (surfaces.length === 0) {
      // Maybe already updated in a previous run — check new URL
      const already = await prisma.serviceSurface.findMany({
        where: { service: { slug: fix.serviceSlug }, checkUrl: fix.newUrl },
        select: { id: true },
      });
      if (already.length > 0) {
        console.log(`  [SKIP] ${fix.serviceSlug} — already updated (${already.length} surface(s) already have new URL)`);
      } else {
        console.log(`  [WARN] ${fix.serviceSlug} — old URL not found, new URL not found either`);
      }
      continue;
    }

    if (COMMIT) {
      await prisma.serviceSurface.updateMany({
        where: { service: { slug: fix.serviceSlug }, checkUrl: fix.oldUrl },
        data: {
          checkUrl: fix.newUrl,
          checkType: "ATLASSIAN_JSON",
          signalConfidence: "HIGH",
        },
      });
      console.log(`  [DONE] ${fix.serviceSlug}: ${fix.oldUrl} → ${fix.newUrl} (${surfaces.length} surface(s))`);
    } else {
      console.log(`  [DRY]  ${fix.serviceSlug}: ${fix.oldUrl}`);
      console.log(`         → ${fix.newUrl}`);
      console.log(`         (${surfaces.length} surface(s): ${surfaces.map(s => s.displayName).join(", ")})`);
    }
  }

  // ── ÉTAPE D: Downgrades ─────────────────────────────────────────────
  console.log("\n--- ÉTAPE D: Downgrades (STATUS_HTML/HOMEPAGE) ---");
  for (const dg of DOWNGRADES) {
    const surfaces = await prisma.serviceSurface.findMany({
      where: {
        service: { slug: dg.serviceSlug },
        checkUrl: dg.oldUrl,
      },
      select: { id: true, displayName: true },
    });

    if (surfaces.length === 0) {
      // Maybe already updated
      const already = await prisma.serviceSurface.findMany({
        where: {
          service: { slug: dg.serviceSlug },
          checkType: dg.checkType,
          ...(dg.newUrl ? { checkUrl: dg.newUrl } : { checkUrl: null }),
        },
        select: { id: true },
      });
      if (already.length > 0) {
        console.log(`  [SKIP] ${dg.serviceSlug} — already updated`);
      } else {
        console.log(`  [WARN] ${dg.serviceSlug} — old URL not found`);
      }
      continue;
    }

    if (COMMIT) {
      await prisma.serviceSurface.updateMany({
        where: { service: { slug: dg.serviceSlug }, checkUrl: dg.oldUrl },
        data: {
          checkUrl: dg.newUrl,
          checkType: dg.checkType,
          signalConfidence: dg.signalConfidence,
        },
      });
      console.log(`  [DONE] ${dg.serviceSlug}: ${dg.oldUrl}`);
      console.log(`         → ${dg.newUrl ?? "null"} | ${dg.checkType}/${dg.signalConfidence} (${surfaces.length} surface(s))`);
    } else {
      console.log(`  [DRY]  ${dg.serviceSlug}: ${dg.oldUrl}`);
      console.log(`         → ${dg.newUrl ?? "null"} | ${dg.checkType}/${dg.signalConfidence}`);
      console.log(`         (${surfaces.length} surface(s): ${surfaces.map(s => s.displayName).join(", ")})`);
    }
  }

  // ── Summary count (after or before commit) ──────────────────────────
  const atlassianCount = await prisma.serviceSurface.count({
    where: { checkUrl: { endsWith: "/api/v2/status.json" } },
  });
  console.log(`\n--- Summary ---`);
  console.log(`ATLASSIAN_JSON surfaces in DB (by URL pattern): ${atlassianCount}`);
  if (!COMMIT) {
    console.log("\n[DRY-RUN] Nothing written. Pass --commit to apply.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
