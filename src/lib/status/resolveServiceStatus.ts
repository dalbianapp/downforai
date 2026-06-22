// ============================================================================
// resolveServiceStatus — the SINGLE source of truth for a service's displayed
// real-time status. Combines the TECHNICAL signal (official + HTTP, already
// derived upstream) with the COMMUNITY signal (cron-written cached fields from
// the community detector). Consumed by every surface (home, category, service
// page, badges, leaderboard status) so no two pages ever disagree.
//
// Honesty rules (validated):
//   • A community-only signal (technical not a hard OUTAGE) CAPS at DEGRADED and
//     is always labelled "Community-reported …" with the report count. The full
//     red OUTAGE is reserved for cases where the TECHNICAL signal also confirms
//     (source BOTH, confidence CONFIRMED) — we never cry "total outage" on
//     reports alone (anti-brigading).
//   • A stale community signal (older than the freshness window) is ignored —
//     fail-safe to the technical status.
//   • Community status NEVER changes technical availability (leaderboard uptime);
//     it only affects the DISPLAYED status. That separation lives in the callers.
// ============================================================================

import type { ServiceStatus } from "@prisma/client";

export type StatusSource = "TECHNICAL" | "COMMUNITY" | "BOTH";
export type StatusConfidence = "CONFIRMED" | "PROBABLE" | null;

export interface ResolvedStatus {
  status: ServiceStatus; // OPERATIONAL | DEGRADED | OUTAGE | UNKNOWN
  source: StatusSource;
  confidence: StatusConfidence; // null for purely technical / operational
  label: string;
  reportsInWindow: number; // reports backing a community signal (0 if technical-only)
}

export interface CommunitySignal {
  status: ServiceStatus | null;
  confidence: StatusConfidence;
  reportsWindow: number | null;
  signalAt: Date | null;
}

export interface ResolveStatusInput {
  technicalStatus: ServiceStatus; // from derivePublicStatus (official + HTTP)
  monitoringCapability: string;
  community: CommunitySignal | null;
  nowMs?: number; // defaults Date.now()
}

// A community signal older than this is treated as absent (fail-safe to technical).
// 2× the 30-min detection window — if the cron hasn't refreshed in an hour,
// don't trust a possibly-stale "reported issue".
export const COMMUNITY_SIGNAL_FRESH_MS = 60 * 60 * 1000;

const TECHNICAL_LABEL: Record<ServiceStatus, string> = {
  OPERATIONAL: "Operational",
  DEGRADED: "Degraded",
  OUTAGE: "Outage",
  UNKNOWN: "Status unknown",
};

/** Is the community signal present, fresh, and actually elevated (DEGRADED/OUTAGE)? */
function communityElevated(c: CommunitySignal | null, nowMs: number): boolean {
  if (!c || c.status == null || c.signalAt == null) return false;
  if (nowMs - c.signalAt.getTime() > COMMUNITY_SIGNAL_FRESH_MS) return false;
  return c.status === "DEGRADED" || c.status === "OUTAGE";
}

/** Map the 4 cached Service community fields to a CommunitySignal. */
export function communitySignalOf(s: {
  communityStatus: ServiceStatus | null;
  communityConfidence: "CONFIRMED" | "PROBABLE" | null;
  communityReportsWindow: number | null;
  communitySignalAt: Date | null;
}): CommunitySignal {
  return {
    status: s.communityStatus,
    confidence: s.communityConfidence,
    reportsWindow: s.communityReportsWindow,
    signalAt: s.communitySignalAt,
  };
}

export function resolveServiceStatus(input: ResolveStatusInput): ResolvedStatus {
  const nowMs = input.nowMs ?? Date.now();
  const tech = input.technicalStatus;
  const c = input.community;
  const elevated = communityElevated(c, nowMs);
  const reports = elevated ? c!.reportsWindow ?? 0 : 0;

  // 1) Technical hard OUTAGE always wins. If community is also elevated, it's a
  //    confirmed outage (BOTH/CONFIRMED); otherwise a technical outage.
  if (tech === "OUTAGE") {
    if (elevated) {
      return { status: "OUTAGE", source: "BOTH", confidence: "CONFIRMED", label: "Confirmed outage", reportsInWindow: reports };
    }
    return { status: "OUTAGE", source: "TECHNICAL", confidence: null, label: "Outage", reportsInWindow: 0 };
  }

  // 2) Technical not a hard outage, but the community signal is elevated.
  //    CAP at DEGRADED — community-only never shows a full red OUTAGE.
  if (elevated) {
    return {
      status: "DEGRADED",
      source: tech === "DEGRADED" ? "BOTH" : "COMMUNITY",
      confidence: "PROBABLE",
      label: "Community-reported issues",
      reportsInWindow: reports,
    };
  }

  // 3) No usable community signal → pure technical status.
  return { status: tech, source: "TECHNICAL", confidence: null, label: TECHNICAL_LABEL[tech], reportsInWindow: 0 };
}
