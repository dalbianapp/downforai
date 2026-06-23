// ============================================================================
// deriveTechnicalStatus — the SINGLE technical-status derivation for the whole
// site. Extracted verbatim from getServiceDashboard.derivePublicStatus so every
// surface (home, category, badges, /api/status, /api/services, OG image,
// top-outages, reliability) derives the DISPLAYED status identically.
//
// RULE (radical honesty): the displayed status = CURRENT state = latest
// observation PER SURFACE + "official feed primes" for OFFICIAL_STATUS_API.
// NOT a worst-of over a time window. A blip that recovered 3 hours ago is
// history (it lives in the uptime graph / timeline), never in the live badge.
//
// resolveDisplayStatus() chains this technical derivation with the community
// fold (resolveServiceStatus) in one call — feed it latest-per-surface rows and
// it returns exactly what the badge should show.
// ============================================================================

import type { ServiceStatus } from "@prisma/client";
import {
  resolveServiceStatus,
  type CommunitySignal,
  type ResolvedStatus,
} from "./resolveServiceStatus";

export type StatusOrigin = "OFFICIAL" | "PROBE" | "CAPABILITY";
export type StatusHeadline = "MONITORING_LIMITED" | "STATUS_UNCERTAIN" | null;

/** The latest observation for ONE enabled surface (current state, not a window). */
export interface SurfaceLatest {
  status: ServiceStatus | string | null;
  officialStatus?: ServiceStatus | string | null;
  observedAt?: Date | null;
}

export interface TechnicalStatus {
  status: ServiceStatus;
  origin: StatusOrigin;
  headline: StatusHeadline;
}

export interface DisplayStatus extends ResolvedStatus {
  origin: StatusOrigin;
  headline: StatusHeadline;
}

// A fresh Atlassian signal (≤ 30h) primes over HTTP-probe noise. Matches the
// window getServiceDashboard has always used.
export const OFFICIAL_STATUS_FRESH_MS = 30 * 60 * 60 * 1000;

const STATUS_PRIORITY_VALID: Record<string, number> = { OUTAGE: 3, DEGRADED: 2, OPERATIONAL: 0 };

/**
 * Technical status from the latest-per-surface snapshots. Pure — no DB.
 *  1. Non-measurable capability → UNKNOWN (never Degraded/Outage from our probes).
 *  2. OFFICIAL_STATUS_API with a fresh official signal → trust the official feed.
 *  3. Otherwise worst-of the VALID latest-per-surface statuses (UNKNOWN excluded).
 */
export function deriveTechnicalStatus(
  monitoringCapability: string,
  surfaces: SurfaceLatest[],
  nowMs: number = Date.now(),
): TechnicalStatus {
  // 1. Non-measurable capabilities
  if (monitoringCapability === "BLOCKED_FROM_PROBES") {
    return { status: "UNKNOWN", origin: "CAPABILITY", headline: "MONITORING_LIMITED" };
  }
  if (monitoringCapability === "UNVERIFIABLE") {
    return { status: "UNKNOWN", origin: "CAPABILITY", headline: "STATUS_UNCERTAIN" };
  }

  // 2. Fresh official signal primes (OFFICIAL_STATUS_API only)
  if (monitoringCapability === "OFFICIAL_STATUS_API") {
    const freshOfficial =
      surfaces.find(
        (s) =>
          s.officialStatus != null &&
          s.observedAt != null &&
          nowMs - s.observedAt.getTime() < OFFICIAL_STATUS_FRESH_MS,
      )?.officialStatus ?? null;
    if (freshOfficial !== null) {
      return { status: freshOfficial as ServiceStatus, origin: "OFFICIAL", headline: null };
    }
  }

  // 3. Worst-of valid LATEST-per-surface observations (UNKNOWN excluded)
  const valid = surfaces
    .map((s) => s.status)
    .filter((s): s is string => s === "OPERATIONAL" || s === "DEGRADED" || s === "OUTAGE");
  if (valid.length === 0) {
    return { status: "UNKNOWN", origin: "PROBE", headline: "STATUS_UNCERTAIN" };
  }
  const worst = valid.reduce<string>(
    (w, s) => (STATUS_PRIORITY_VALID[s] > STATUS_PRIORITY_VALID[w] ? s : w),
    "OPERATIONAL",
  );
  return { status: worst as ServiceStatus, origin: "PROBE", headline: null };
}

/**
 * The full single source of truth: technical derivation (current state) folded
 * with the community signal. One call, used by every surface.
 */
export function resolveDisplayStatus(
  monitoringCapability: string,
  surfaces: SurfaceLatest[],
  community: CommunitySignal | null,
  nowMs: number = Date.now(),
): DisplayStatus {
  const tech = deriveTechnicalStatus(monitoringCapability, surfaces, nowMs);
  const resolved = resolveServiceStatus({
    technicalStatus: tech.status,
    monitoringCapability,
    community,
    nowMs,
  });
  return { ...resolved, origin: tech.origin, headline: tech.headline };
}
