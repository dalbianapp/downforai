/**
 * READ-ONLY backtest of the community outage detector over the last 90 days of
 * real CommunityReport history. Simulates the sliding-window algorithm — writes
 * NOTHING to the DB, never touches service status / leaderboard / incidents.
 *
 * Crowdsource-only mode: technicalState = STALE (reports decide alone), which is
 * what we calibrate in PR1. Technical-signal confirmation is exercised live (PR2).
 *
 * Sweeps minReportsAbsolute ∈ {3,5,8} × window ∈ {15,30} min and prints, per
 * combo, how many episodes emerge + which services — so we pick the threshold
 * that surfaces real outages (e.g. Civitai) without background noise.
 *
 * Run: npx tsx scripts/backtest-community.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  detectCommunityStatus,
  calculateThreshold,
  type DetectorConfig,
  type CommunityStatus,
} from "../src/lib/community/communityDetector";

const prisma = new PrismaClient();

type Episode = {
  serviceId: string;
  slug: string;
  name: string;
  startMs: number;
  endMs: number | null; // null = still open at end of window
  peakReports: number;
  worst: CommunityStatus; // DEGRADED or OUTAGE
};

const MIN = 60_000;

function baseConfig(minReportsAbsolute: number, windowMin: number): DetectorConfig {
  return {
    currentWindowMin: windowMin,
    previousWindowMin: windowMin,
    minReportsAbsolute,
    baselineReportsPerMin: 0.05,
    baselineMultiplierK: 3,
    minStabilityMin: 5,
  };
}

/** Count reports (sorted asc by t) within [lo, hi). Binary-search bounds. */
function countInWindow(times: number[], lo: number, hi: number): number {
  // lowerBound(lo) .. lowerBound(hi)
  const lb = (x: number) => {
    let a = 0, b = times.length;
    while (a < b) { const m = (a + b) >> 1; if (times[m] < x) a = m + 1; else b = m; }
    return a;
  };
  return lb(hi) - lb(lo);
}

/** Replay the detector for one service over its report timeline. */
function backtestService(
  reportsTimes: number[],
  cfg: DetectorConfig,
  meta: { serviceId: string; slug: string; name: string },
): Episode[] {
  if (reportsTimes.length === 0) return [];
  const winMs = cfg.currentWindowMin * MIN;

  // Evaluation points: each report time (onset) + (t + window) when the current
  // window starts emptying + (t + 2×window) when the PREVIOUS window also clears
  // → resolution can fire ~2 windows after the last contributing report instead
  // of waiting for the next (possibly days-later) report. Dedup + sort.
  const evalSet = new Set<number>();
  for (const t of reportsTimes) {
    evalSet.add(t);
    evalSet.add(t + winMs);
    evalSet.add(t + 2 * winMs);
  }
  const evalTimes = [...evalSet].sort((a, b) => a - b);

  const episodes: Episode[] = [];
  let status: CommunityStatus = "OPERATIONAL";
  let lastChangeMs: number | null = null;
  let openEpisode: Episode | null = null;

  for (const now of evalTimes) {
    const currentReports = countInWindow(reportsTimes, now - winMs, now + 1); // inclusive of now
    const previousReports = countInWindow(reportsTimes, now - 2 * winMs, now - winMs);

    const out = detectCommunityStatus(
      { currentReports, previousReports, technicalState: "STALE", currentStatus: status, lastStatusChangeMs: lastChangeMs, nowMs: now },
      cfg,
    );

    if (out.changed) {
      status = out.status;
      lastChangeMs = now;
      if (status === "DEGRADED" || status === "OUTAGE") {
        if (!openEpisode) {
          openEpisode = { ...meta, startMs: now, endMs: null, peakReports: currentReports, worst: status };
          episodes.push(openEpisode);
        } else {
          if (status === "OUTAGE") openEpisode.worst = "OUTAGE";
          openEpisode.peakReports = Math.max(openEpisode.peakReports, currentReports);
        }
      } else if (status === "OPERATIONAL" && openEpisode) {
        openEpisode.endMs = now;
        openEpisode = null;
      }
    } else if (openEpisode) {
      openEpisode.peakReports = Math.max(openEpisode.peakReports, currentReports);
    }
  }
  return episodes;
}

async function main() {
  const since = Date.now() - 90 * 24 * 60 * MIN;
  const reports = await prisma.communityReport.findMany({
    where: { isSpam: false, isVisible: true, createdAt: { gte: new Date(since) } },
    select: { serviceId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const svcMeta = await prisma.service.findMany({ select: { id: true, slug: true, name: true } });
  const metaById = new Map(svcMeta.map((s) => [s.id, s]));

  const byService = new Map<string, number[]>();
  for (const r of reports) {
    const arr = byService.get(r.serviceId) ?? byService.set(r.serviceId, []).get(r.serviceId)!;
    arr.push(r.createdAt.getTime());
  }
  console.log(`\n=== COMMUNITY DETECTOR BACKTEST (read-only, 90d) ===`);
  console.log(`Reports (non-spam, visible): ${reports.length} across ${byService.size} services\n`);

  const sweep: Array<{ min: number; win: number }> = [];
  for (const min of [3, 5, 8]) for (const win of [15, 30]) sweep.push({ min, win });

  // ── Sweep summary table ──
  console.log("=== MULTI-THRESHOLD SWEEP ===");
  console.log(`${"minReports".padStart(10)} ${"window".padStart(7)} ${"thresh".padStart(7)} ${"crit".padStart(5)} ${"episodes".padStart(9)} ${"services".padStart(9)} ${"OUTAGE".padStart(7)} ${"DEGRADED".padStart(9)}`);
  console.log("-".repeat(74));
  const detailFor = { min: 5, win: 30 }; // representative combo to list in detail
  let detailEpisodes: Episode[] = [];
  const perComboServices = new Map<string, Set<string>>();

  for (const { min, win } of sweep) {
    const cfg = baseConfig(min, win);
    const thr = calculateThreshold(cfg);
    let all: Episode[] = [];
    for (const [sid, times] of byService) {
      const m = metaById.get(sid);
      if (!m) continue;
      all = all.concat(backtestService(times, cfg, { serviceId: sid, slug: m.slug, name: m.name }));
    }
    const services = new Set(all.map((e) => e.slug));
    perComboServices.set(`${min}/${win}`, services);
    const outages = all.filter((e) => e.worst === "OUTAGE").length;
    const degraded = all.filter((e) => e.worst === "DEGRADED").length;
    console.log(`${String(min).padStart(10)} ${(win + "m").padStart(7)} ${String(thr).padStart(7)} ${String(thr * 2).padStart(5)} ${String(all.length).padStart(9)} ${String(services.size).padStart(9)} ${String(outages).padStart(7)} ${String(degraded).padStart(9)}`);
    if (min === detailFor.min && win === detailFor.win) detailEpisodes = all;
  }

  // ── Detailed episode list for the representative combo ──
  console.log(`\n=== EPISODE LIST — combo min=${detailFor.min}, window=${detailFor.win}m (threshold ${calculateThreshold(baseConfig(detailFor.min, detailFor.win))}) ===`);
  if (detailEpisodes.length === 0) {
    console.log("  (no episodes at this combo)");
  } else {
    detailEpisodes
      .sort((a, b) => b.peakReports - a.peakReports || a.startMs - b.startMs)
      .forEach((e) => {
        const dur = e.endMs ? Math.round((e.endMs - e.startMs) / MIN) : null;
        const start = new Date(e.startMs).toISOString().slice(0, 16).replace("T", " ");
        console.log(`  ${e.worst.padEnd(8)} ${e.slug.padEnd(18)} start ${start}  peak=${e.peakReports}  dur=${dur != null ? dur + "min" : "open"}`);
      });
  }

  // ── Top services by episode count (representative combo) ──
  const byCount = new Map<string, number>();
  for (const e of detailEpisodes) byCount.set(e.slug, (byCount.get(e.slug) ?? 0) + 1);
  console.log(`\n=== TOP SERVICES BY EPISODES (min=${detailFor.min}/${detailFor.win}m) ===`);
  [...byCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([slug, n]) => console.log(`  ${String(n).padStart(2)}  ${slug}`));

  // ── Sanity anchor: Civitai (93 reports/90d) ──
  const civitai = svcMeta.find((s) => s.slug === "civitai");
  if (civitai) {
    const times = byService.get(civitai.id) ?? [];
    console.log(`\n=== ANCHOR: civitai — ${times.length} reports/90d ===`);
    for (const { min, win } of sweep) {
      const eps = backtestService(times, baseConfig(min, win), { serviceId: civitai.id, slug: "civitai", name: "Civitai" });
      console.log(`  min=${min}/${win}m → ${eps.length} episodes (peaks: ${eps.map((e) => e.peakReports).join(",") || "none"})`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
