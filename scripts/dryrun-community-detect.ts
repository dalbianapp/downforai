import { runCommunityDetect } from "../src/lib/community/runCommunityDetect";

const CANARY = ["civitai", "spicychat-ai", "abacus-ai", "openai", "anthropic"];

function tbl(rows: any[]) {
  if (rows.length === 0) { console.log("    (none)"); return; }
  for (const r of rows) {
    console.log(`    ${r.slug.padEnd(14)} cur=${String(r.currentReports).padStart(2)} prev=${String(r.previousReports).padStart(2)} tech=${r.technicalState.padEnd(8)} raw=${r.rawStatus.padEnd(10)} conf=${String(r.rawConfidence).padEnd(9)} canary=${r.isCanary} -> persist=${r.persistStatus.padEnd(10)} incident=${r.incidentAction}`);
  }
}

async function at(label: string, nowMs: number) {
  const r = await runCommunityDetect({ dryRun: true, enabledOverride: true, canaryOverride: CANARY, nowMs });
  console.log(`\n### ${label}`);
  console.log(`  threshold=${r.threshold} crit=${r.criticalThreshold} evaluated=${r.evaluated} rawElevations=${r.rawElevationCount} rawOutages=${r.rawOutageCount}`);
  console.log(`  GUARDS → massGuardActive=${r.massGuardActive} (>${8} elevations → FREEZE) · outageGuardActive=${r.outageGuardActive} (>${3} outages → downgrade) · writes(dry)=${r.writes}`);
  if (r.massGuardActive) console.log(`  ⛔ CYCLE FROZEN: ${r.rawElevationCount} services flagged → ALL suppressed (persist=OPERATIONAL), 0 writes, 0 incidents, alert sent (live).`);
  console.log(`  CANARY flagged (raw) — persist shows post-guard decision:`);
  tbl(r.elevatedCanary);
  console.log(`  OBSERVATION-ONLY (non-canary, never elevated):`);
  tbl(r.observationOnly);
}

async function main() {
  await at("LIVE now (current 60-min windows)", Date.now());
  await at("REPLAY OpenAI cascade MID-RISE @ 2026-04-20 14:50 UTC", Date.UTC(2026, 3, 20, 14, 50));
  await at("REPLAY Civitai @ 2026-06-19 13:00 UTC", Date.UTC(2026, 5, 19, 13, 0));
  await at("REPLAY SpicyChat @ 2026-06-03 06:50 UTC", Date.UTC(2026, 5, 3, 6, 50));
  console.log("\n(DRY-RUN — zero writes performed.)");
}
main().catch((e) => { console.error(e); process.exit(1); });
