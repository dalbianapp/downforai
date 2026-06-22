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
