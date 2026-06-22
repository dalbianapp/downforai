// ============================================================================
// Community-detect runner — the WRITE side of the 3rd signal. Runs the calibrated
// communityDetector (PR1, 5 reports / 30 min) over services with recent reports,
// and persists a cached community signal on Service (4 fields) + creates/resolves
// COMMUNITY_REPORTS incidents.
//
// Safety model (canary):
//   • Evaluates every ACTIVE service (recent reports OR an existing elevated
//     signal) — a tiny set, never all ~800.
//   • Persists an ELEVATED status (DEGRADED/OUTAGE) ONLY for canary slugs while
//     COMMUNITY_SIGNAL_ENABLED. Non-canary services are written as OPERATIONAL,
//     so even once surfaces read the signal (step 3) only canary can flip.
//   • Explosion guard: if more services than GUARD_MAX_OUTAGE would go community-
//     OUTAGE in one cycle, suppress the OUTAGE elevations and log (bug/brigading).
//   • dryRun = compute + report, ZERO writes.
//
// No surface reads these fields yet (consolidation = step 3) — the cron writes
// hidden, invisible-to-visitors data on purpose, so we can verify it's sane first.
// ============================================================================

import { prisma } from "@/lib/db";
import { Prisma, type ServiceStatus } from "@prisma/client";
import {
  detectCommunityStatus,
  calculateThreshold,
  DEFAULT_CONFIG,
  type TechnicalState,
} from "@/lib/community/communityDetector";
import { sendTelegramAlert } from "@/lib/notifications/telegram";

const MIN = 60_000;
// Technical observation older than this is not a reliable "fresh" read. downforai
// re-checks each surface ~every 75 min, so freshness must exceed that cadence.
const TECH_FRESHNESS_MS = 90 * MIN;
// More than this many simultaneous community-OUTAGE detections in one cycle is
// almost certainly a bug or brigading → suppress the outage elevations.
// ── Explosion guards (anti bug / brigading / seed artifacts) ────────────────
// Mass-elevation circuit-breaker: if more than this many services would elevate
// (DEGRADED or OUTAGE) in a single cycle, FREEZE the whole cycle — write nothing,
// log + alert. Rationale: the 90-day backtest produced ~10 episodes TOTAL (≈1 per
// 9 days), so a normal 5-min cycle elevates 0–2 services; even a correlated real
// event sharing infra plausibly tops out ~6. The seed/brigading mass spike lit up
// 27 unrelated services at once. N=8 sits comfortably above the organic ceiling
// (~6) and far below a mass event (27) → >8 simultaneous elevations is not a normal
// AI-reliability pattern. Freezing (vs forcing OPERATIONAL) avoids prematurely
// resolving a legitimately-open incident during a suspected anomaly.
const GUARD_MAX_ELEVATIONS = 8;
// Stricter sub-guard on community-OUTAGE specifically (the loud, red-adjacent
// signal): more than this many simultaneous community-OUTAGEs → downgrade them to
// DEGRADED. Community OUTAGE needs sustained reports across two windows, so even a
// few at once is suspicious.
const GUARD_MAX_OUTAGE = 3;

export interface RunOptions {
  dryRun: boolean;
  enabledOverride?: boolean;       // bypass env for testing/dry-run demos
  canaryOverride?: string[];       // bypass env for testing/dry-run demos
  nowMs?: number;
}

export interface ServiceEval {
  slug: string;
  name: string;
  currentReports: number;
  previousReports: number;
  technicalState: TechnicalState;
  rawStatus: ServiceStatus;        // detector output (uncapped, pre-guard)
  rawConfidence: "CONFIRMED" | "PROBABLE";
  isCanary: boolean;
  persistStatus: ServiceStatus;    // what we'd write to communityStatus
  persistConfidence: "CONFIRMED" | "PROBABLE" | null;
  incidentAction: "create" | "resolve" | "none";
}

export interface RunResult {
  dryRun: boolean;
  enabled: boolean;
  canarySlugs: string[];
  threshold: number;
  criticalThreshold: number;
  evaluated: number;
  outageGuardActive: boolean;      // too many community-OUTAGEs → downgraded to DEGRADED
  massGuardActive: boolean;        // too many elevations → whole cycle frozen (no writes)
  rawOutageCount: number;
  rawElevationCount: number;       // services the detector would elevate (DEGRADED+OUTAGE)
  elevatedCanary: ServiceEval[];   // canary services that would/did elevate
  observationOnly: ServiceEval[];  // non-canary that the detector flagged (logged, not elevated)
  writes: number;
  incidentsCreated: number;
  incidentsResolved: number;
}

function techStateFrom(status: ServiceStatus | null, observedAt: Date | null, nowMs: number): TechnicalState {
  if (!observedAt || status == null) return "NEVER";
  if (nowMs - observedAt.getTime() > TECH_FRESHNESS_MS) return "STALE";
  if (status === "OUTAGE") return "FRESH_KO";
  if (status === "OPERATIONAL" || status === "DEGRADED") return "FRESH_OK";
  return "BLOCKED"; // UNKNOWN
}

export async function runCommunityDetect(opts: RunOptions): Promise<RunResult> {
  const now = opts.nowMs ?? Date.now();
  const cfg = DEFAULT_CONFIG;
  const winMs = cfg.currentWindowMin * MIN;
  const threshold = calculateThreshold(cfg);
  const criticalThreshold = threshold * 2;

  const enabled = opts.enabledOverride ?? process.env.COMMUNITY_SIGNAL_ENABLED === "true";
  const canarySet = new Set(
    (opts.canaryOverride ?? (process.env.COMMUNITY_CANARY_SLUGS ?? "").split(","))
      .map((s) => s.trim())
      .filter(Boolean),
  );
  // Global mode: an explicit "*" in the allowlist elevates ALL services. Empty/absent
  // list still means NOBODY (safe default — no accidental global from a misconfig).
  const globalMode = canarySet.has("*");

  // ── Evaluation set: services with reports in the last 2 windows, plus any
  //    service that currently carries an elevated community signal (to resolve). ──
  const recent = await prisma.communityReport.findMany({
    where: { isSpam: false, isVisible: true, createdAt: { gte: new Date(now - 2 * winMs) } },
    select: { serviceId: true, createdAt: true },
  });
  const elevated = await prisma.service.findMany({
    where: { communityStatus: { in: ["DEGRADED", "OUTAGE"] } },
    select: { id: true },
  });
  const evalIds = [...new Set([...recent.map((r) => r.serviceId), ...elevated.map((s) => s.id)])];
  if (evalIds.length === 0) {
    return { dryRun: opts.dryRun, enabled, canarySlugs: [...canarySet], threshold, criticalThreshold, evaluated: 0, outageGuardActive: false, massGuardActive: false, rawOutageCount: 0, rawElevationCount: 0, elevatedCanary: [], observationOnly: [], writes: 0, incidentsCreated: 0, incidentsResolved: 0 };
  }

  // Per-service report counts over the two windows (bucketed in JS from one fetch).
  const currentCount = new Map<string, number>();
  const previousCount = new Map<string, number>();
  for (const r of recent) {
    const age = now - r.createdAt.getTime();
    if (age <= winMs) currentCount.set(r.serviceId, (currentCount.get(r.serviceId) ?? 0) + 1);
    else previousCount.set(r.serviceId, (previousCount.get(r.serviceId) ?? 0) + 1);
  }

  const services = await prisma.service.findMany({
    where: { id: { in: evalIds } },
    select: { id: true, slug: true, name: true, communityStatus: true },
  });

  // Latest technical observation per evaluated service (status + freshness).
  const latestObs = await prisma.$queryRaw<Array<{ serviceId: string; status: ServiceStatus; observedAt: Date }>>(Prisma.sql`
    SELECT DISTINCT ON (ss."serviceId") ss."serviceId" AS "serviceId", o.status AS status, o."observedAt" AS "observedAt"
    FROM "Observation" o
    JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId" AND ss."isEnabled" = true
    WHERE ss."serviceId" IN (${Prisma.join(evalIds)})
    ORDER BY ss."serviceId", o."observedAt" DESC
  `);
  const obsMap = new Map(latestObs.map((o) => [o.serviceId, o]));

  const activeIncidents = await prisma.incident.findMany({
    where: { serviceId: { in: evalIds }, sourceBadge: "COMMUNITY_REPORTS", status: { not: "RESOLVED" } },
    select: { id: true, serviceId: true, summary: true },
  });
  const incidentMap = new Map(activeIncidents.map((i) => [i.serviceId, i]));

  // ── First pass: compute raw detector output for everyone (for the guard). ──
  type Computed = { svc: typeof services[number]; current: number; previous: number; tech: TechnicalState; status: ServiceStatus; confidence: "CONFIRMED" | "PROBABLE" };
  const computed: Computed[] = services.map((svc) => {
    const current = currentCount.get(svc.id) ?? 0;
    const previous = previousCount.get(svc.id) ?? 0;
    const obs = obsMap.get(svc.id);
    const tech = techStateFrom(obs?.status ?? null, obs?.observedAt ?? null, now);
    // Detector tracks community status only (OPERATIONAL/DEGRADED/OUTAGE); map any
    // UNKNOWN/null cached value to OPERATIONAL as the carry-over baseline.
    const carry = svc.communityStatus === "DEGRADED" || svc.communityStatus === "OUTAGE" ? svc.communityStatus : "OPERATIONAL";
    const out = detectCommunityStatus(
      { currentReports: current, previousReports: previous, technicalState: tech, currentStatus: carry },
      cfg,
    );
    return { svc, current, previous, tech, status: out.rawStatus, confidence: out.confidence };
  });

  const rawOutageCount = computed.filter((c) => c.status === "OUTAGE").length;
  const rawElevationCount = computed.filter((c) => c.status === "DEGRADED" || c.status === "OUTAGE").length;
  const outageGuardActive = rawOutageCount > GUARD_MAX_OUTAGE;
  // Mass-elevation circuit-breaker: too many services flipping at once → FREEZE the
  // whole cycle (write nothing, create/resolve nothing) and alert. Applies EVEN in
  // canary (defensive) and is the key safeguard for the future global rollout.
  const massGuardActive = rawElevationCount > GUARD_MAX_ELEVATIONS;

  if (massGuardActive) {
    const flagged = computed
      .filter((c) => c.status === "DEGRADED" || c.status === "OUTAGE")
      .map((c) => c.svc.slug);
    console.log(JSON.stringify({
      event: "community_explosion_guard",
      reason: "mass_elevation_freeze",
      rawElevationCount,
      threshold: GUARD_MAX_ELEVATIONS,
      action: "cycle_frozen_no_writes",
      flagged,
    }));
    if (!opts.dryRun) {
      try {
        await sendTelegramAlert(
          `🛑 <b>Community explosion guard</b>\n${rawElevationCount} services would elevate this cycle (> ${GUARD_MAX_ELEVATIONS}). Cycle frozen, no status changes written.\nLikely bug/brigading/seed spike. Flagged: ${flagged.slice(0, 15).join(", ")}`,
        );
      } catch (err) {
        console.error("[community-detect] explosion-guard alert failed:", err);
      }
    }
  }

  // ── Second pass: apply guards + canary, decide writes/incidents. ──
  const elevatedCanary: ServiceEval[] = [];
  const observationOnly: ServiceEval[] = [];
  let writes = 0, incidentsCreated = 0, incidentsResolved = 0;

  for (const c of computed) {
    const isRawElevated = c.status === "DEGRADED" || c.status === "OUTAGE";
    // Post-guard status: mass freeze → nobody elevates; else outage sub-guard caps
    // OUTAGE→DEGRADED; else the detector's status stands.
    const guarded: ServiceStatus = massGuardActive
      ? "OPERATIONAL"
      : outageGuardActive && c.status === "OUTAGE"
        ? "DEGRADED"
        : c.status;
    const isCanary = enabled && (globalMode || canarySet.has(c.svc.slug));
    const isElevated = guarded === "DEGRADED" || guarded === "OUTAGE";

    const persistStatus: ServiceStatus = isCanary ? guarded : "OPERATIONAL";
    const persistConfidence = isCanary && isElevated ? c.confidence : null;

    const hadIncident = incidentMap.has(c.svc.id);
    let incidentAction: ServiceEval["incidentAction"] = "none";
    if (isCanary && !massGuardActive) {
      if (isElevated && !hadIncident) incidentAction = "create";
      else if (!isElevated && hadIncident) incidentAction = "resolve";
    }

    const row: ServiceEval = {
      slug: c.svc.slug, name: c.svc.name, currentReports: c.current, previousReports: c.previous,
      technicalState: c.tech, rawStatus: c.status, rawConfidence: c.confidence, isCanary,
      persistStatus, persistConfidence, incidentAction,
    };
    // Lists reflect what the detector FLAGGED (raw elevation) for visibility, even
    // when frozen — so the dry-run shows the mass event + that it was suppressed.
    if (isCanary && isRawElevated) elevatedCanary.push(row);
    else if (isRawElevated) observationOnly.push(row);

    // Freeze: a mass-guard cycle writes nothing at all (avoids prematurely resolving
    // a legitimately-open incident during a suspected anomaly).
    if (opts.dryRun || massGuardActive) continue;

    // ── Writes (always update the cached fields for evaluated services) ──
    await prisma.service.update({
      where: { id: c.svc.id },
      data: {
        communityStatus: persistStatus,
        communityConfidence: persistConfidence,
        communityReportsWindow: c.current,
        communitySignalAt: new Date(now),
      },
    });
    writes++;

    if (incidentAction === "create") {
      await prisma.incident.create({
        data: {
          serviceId: c.svc.id,
          title: `Community-reported ${guarded === "OUTAGE" ? "outage" : "issues"}: ${c.svc.name}`,
          status: "OPEN",
          severity: guarded === "OUTAGE" ? "MAJOR" : "MINOR",
          sourceBadge: "COMMUNITY_REPORTS",
          confidence: c.confidence,
          summary: `Community signal: ${c.current} reports in the last ${cfg.currentWindowMin} min (threshold ${threshold}). Peak ${c.current}.`,
        },
      });
      incidentsCreated++;
    } else if (incidentAction === "resolve") {
      await prisma.incident.update({
        where: { id: incidentMap.get(c.svc.id)!.id },
        data: { status: "RESOLVED", resolvedAt: new Date(now) },
      });
      incidentsResolved++;
    }
  }

  return {
    dryRun: opts.dryRun, enabled, canarySlugs: [...canarySet], threshold, criticalThreshold,
    evaluated: computed.length, outageGuardActive, massGuardActive, rawOutageCount, rawElevationCount,
    elevatedCanary, observationOnly, writes, incidentsCreated, incidentsResolved,
  };
}
