// ============================================================================
// Community outage detector — 3rd monitoring signal (ported from
// statut-services.fr lib/detector.ts, recalibrated for downforai).
//
// PURE detection logic: given report counts over two sliding windows + the
// known TECHNICAL signal state (downforai's official+HTTP status, which plays
// the role of statut-services' "ping"), it returns the community-derived status
// + confidence + source. No DB, no Date.now() — thresholds are injectable so the
// backtest harness can sweep configs and replay history deterministically.
//
// This signal is SEPARATE from the technical leaderboard availability. It can
// flag a real-time "Community-reported issue/outage" but must never be folded
// into technical uptime (popularity bias: big services get more reports).
// ============================================================================

export type CommunityStatus = "OPERATIONAL" | "DEGRADED" | "OUTAGE";
export type CommunityConfidence = "CONFIRMED" | "PROBABLE";

// Technical signal freshness/result — analogue of statut-services' ping state.
// FRESH_KO = downforai's technical status is a fresh OUTAGE/down signal.
// FRESH_OK = fresh operational. STALE/BLOCKED/NEVER = no reliable technical read
// → "crowdsource-only" path (reports decide alone).
export type TechnicalState = "FRESH_OK" | "FRESH_KO" | "STALE" | "BLOCKED" | "NEVER";

export interface DetectorConfig {
  currentWindowMin: number;
  previousWindowMin: number;
  minReportsAbsolute: number;
  baselineReportsPerMin: number;
  baselineMultiplierK: number;
  minStabilityMin: number; // anti-flapping: min minutes before changing status again
}

// Recalibrated defaults for downforai (small tech audience, ~0 reports at rest →
// minReportsAbsolute drives the threshold via max()). Validated on a 90-day
// backtest: the 30-min window catches the real Apr-20 OpenAI cascade as an OUTAGE
// (dispersed AI-audience reports span >15 min) with no single-report noise at
// threshold 5; ~10 coherent episodes / 90d. (statut-services prod uses min=10,
// baseline=5, K=4, window=15 for a mass FR audience — far too sensitive here.)
export const DEFAULT_CONFIG: DetectorConfig = {
  currentWindowMin: 30,
  previousWindowMin: 30,
  minReportsAbsolute: 5,
  baselineReportsPerMin: 0.05,
  baselineMultiplierK: 3,
  minStabilityMin: 5,
};

/** threshold = max(minReportsAbsolute, ceil(baseline × window × K)). */
export function calculateThreshold(cfg: DetectorConfig): number {
  const calculated = cfg.baselineReportsPerMin * cfg.currentWindowMin * cfg.baselineMultiplierK;
  return Math.max(cfg.minReportsAbsolute, Math.ceil(calculated));
}

export interface DetectionInput {
  currentReports: number;   // reports in [now - currentWindow, now]
  previousReports: number;  // reports in [now - currentWindow - previousWindow, now - currentWindow]
  technicalState: TechnicalState;
  currentStatus: CommunityStatus; // previous community status (for resolution/hysteresis)
  // Optional anti-flapping context. Omit both to skip the stability gate (pure eval).
  lastStatusChangeMs?: number | null;
  nowMs?: number;
}

export interface DetectionOutput {
  status: CommunityStatus;          // status after the anti-flapping gate
  rawStatus: CommunityStatus;       // status the rules wanted, before the gate
  confidence: CommunityConfidence;
  reason: string;
  threshold: number;
  criticalThreshold: number;
  changed: boolean;                 // status differs from input.currentStatus and the gate allowed it
}

/**
 * Core community-status decision. Mapping from the ported matrix:
 *   OUTAGE   = (tech FRESH_KO + current ≥ critical)  OR  (current ≥ critical AND previous ≥ threshold)
 *   DEGRADED = (tech FRESH_KO + current ≥ threshold) OR  (current AND previous ≥ threshold)  [confirmed]
 *   DEGRADED = current ≥ threshold                                                            [first signal]
 *   resolve  = current < 0.5×threshold AND previous < 0.8×threshold → OPERATIONAL
 * confidence = CONFIRMED when the technical signal is also down (FRESH_KO), else PROBABLE.
 */
export function detectCommunityStatus(input: DetectionInput, cfg: DetectorConfig): DetectionOutput {
  const threshold = calculateThreshold(cfg);
  const criticalThreshold = threshold * 2;

  const { currentReports, previousReports, technicalState, currentStatus } = input;

  const techFreshKO = technicalState === "FRESH_KO";
  const techFreshOK = technicalState === "FRESH_OK";
  const techReliable = techFreshKO || techFreshOK;
  const crowdsourceOnly = !techReliable; // STALE / BLOCKED / NEVER

  const currentAbove = currentReports >= threshold;
  const previousAbove = previousReports >= threshold;
  const bothAbove = currentAbove && previousAbove;
  const currentCritical = currentReports >= criticalThreshold;

  const resolutionMet = currentReports < threshold * 0.5 && previousReports < threshold * 0.8;

  let rawStatus: CommunityStatus = currentStatus;
  let reason = "No change";
  let confidence: CommunityConfidence = "PROBABLE";

  if (techFreshKO && currentCritical) {
    rawStatus = "OUTAGE";
    confidence = "CONFIRMED";
    reason = `Confirmed outage: technical signal down + ${currentReports} community reports (critical threshold ${criticalThreshold})`;
  } else if (currentCritical && previousAbove) {
    rawStatus = "OUTAGE";
    confidence = "PROBABLE";
    reason = `Community-reported outage: ${currentReports} reports + sustained over the previous window`;
  } else if (techFreshKO && currentAbove) {
    rawStatus = "DEGRADED";
    confidence = "CONFIRMED";
    reason = `Confirmed degradation: technical signal down + ${currentReports} community reports (threshold ${threshold})`;
  } else if (bothAbove && !currentCritical) {
    rawStatus = "DEGRADED";
    confidence = "PROBABLE";
    reason = `Community-reported issue: ${currentReports} reports + sustained over the previous window`;
  } else if (currentAbove) {
    rawStatus = "DEGRADED";
    confidence = "PROBABLE";
    reason = `Possible community-reported issue: ${currentReports} reports (threshold ${threshold})`;
  } else if (resolutionMet && currentStatus !== "OPERATIONAL") {
    rawStatus = "OPERATIONAL";
    confidence = techReliable && techFreshOK ? "CONFIRMED" : "PROBABLE";
    reason = crowdsourceOnly
      ? `Likely resolved: community reports subsided (${currentReports}/${previousReports})`
      : `Resolved: technical signal OK + reports subsided (${currentReports}/${previousReports})`;
  }

  // Anti-flapping gate (only if timing context is provided).
  let status = rawStatus;
  let changed = rawStatus !== currentStatus;
  if (changed && input.lastStatusChangeMs != null && input.nowMs != null) {
    const minsSince = (input.nowMs - input.lastStatusChangeMs) / 60000;
    if (minsSince < cfg.minStabilityMin) {
      status = currentStatus;
      changed = false;
      reason = `Stabilizing (waiting ${cfg.minStabilityMin} min before re-changing status)`;
    }
  }

  return { status, rawStatus, confidence, reason, threshold, criticalThreshold, changed };
}
