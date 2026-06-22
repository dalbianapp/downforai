export const INVALID_PROBE_RESULTS = new Set([
  "BLOCKED",
  "RATE_LIMITED",
  "TIMEOUT",
  "DNS_FAIL",
  "CONNECTION_FAIL",
  "TLS_ERROR",
  "UNKNOWN_FAILURE",
  "PARSE_ERROR",
]);

// Probe results that make an observation NON-MEASURABLE for availability — we
// can't tell whether the service was up or down (a block/rate-limit/timeout is
// our probe being refused, not a service outage). DNS_FAIL and CONNECTION_FAIL
// are intentionally NOT here: those mean the endpoint was genuinely unreachable
// (the cron writes them as OUTAGE) and must count as downtime.
// Use this for uptime/availability denominators everywhere (service pages,
// leaderboard, badges API) so a single definition holds site-wide.
export const AVAILABILITY_NON_MEASURABLE = new Set([
  "BLOCKED",
  "RATE_LIMITED",
  "TIMEOUT",
  "UNKNOWN_FAILURE",
  "PARSE_ERROR",
  "TLS_ERROR",
]);

export function isNonMeasurableCapability(capability?: string | null): boolean {
  return (
    capability === "BLOCKED_FROM_PROBES" || capability === "UNVERIFIABLE"
  );
}

export function isValidForPublicLatency(
  probeResult: string | null | undefined,
  latencyMs: number | null | undefined,
): boolean {
  if (latencyMs == null || latencyMs <= 0 || latencyMs >= 5000) return false;
  if (probeResult != null && INVALID_PROBE_RESULTS.has(probeResult)) return false;
  return true;
}
