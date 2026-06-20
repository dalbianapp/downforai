export type ProbeResultVal =
  | "REACHABLE"
  | "BLOCKED"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "DNS_FAIL"
  | "CONNECTION_FAIL"
  | "TLS_ERROR"
  | "PARSE_ERROR"
  | "UNKNOWN_FAILURE";

type ProbeHttpStatus = "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";

export type ClassifyResult = {
  probeResult: ProbeResultVal;
  httpDerivedStatus: ProbeHttpStatus;
};

// Map an HTTP status code to a probe result + derived status.
// Principle: 4xx (except 5xx-class) proves the server is ALIVE — never OUTAGE.
export function classifyProbeHTTP(httpStatus: number): ClassifyResult {
  if (httpStatus >= 200 && httpStatus < 300) {
    return { probeResult: "REACHABLE", httpDerivedStatus: "OPERATIONAL" };
  }
  if (httpStatus === 401 || httpStatus === 403 || httpStatus === 405) {
    // Server is alive but blocking us (WAF / bot protection / geo-block)
    return { probeResult: "BLOCKED", httpDerivedStatus: "UNKNOWN" };
  }
  if (httpStatus === 429) {
    // Server is alive but rate-limiting the probe IP
    return { probeResult: "RATE_LIMITED", httpDerivedStatus: "UNKNOWN" };
  }
  if (httpStatus === 408) {
    return { probeResult: "TIMEOUT", httpDerivedStatus: "UNKNOWN" };
  }
  // Cloudflare-specific 52x codes (520–527): CDN/proxy layer issue, not an origin outage.
  // These appear when Cloudflare cannot reach or negotiate with the origin from Vercel IPs
  // but the service answers fine from browsers. Treat identically to a WAF block.
  if (httpStatus >= 520 && httpStatus <= 527) {
    return { probeResult: "BLOCKED", httpDerivedStatus: "UNKNOWN" };
  }
  if (httpStatus >= 500) {
    // Standard server error (500/502/503/504/5xx) — genuine origin problem
    return { probeResult: "SERVER_ERROR", httpDerivedStatus: "OUTAGE" };
  }
  // 404 and remaining 4xx: resource not found or bad request — server is alive
  return { probeResult: "UNKNOWN_FAILURE", httpDerivedStatus: "UNKNOWN" };
}

// Map a fetch() exception to a probe result + derived status.
export function classifyProbeError(error: unknown): ClassifyResult {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      // AbortController fired — probe timed out, not necessarily down
      return { probeResult: "TIMEOUT", httpDerivedStatus: "UNKNOWN" };
    }
    // Build a string that covers message, code, and cause for pattern matching
    const hint =
      String(error.message ?? "") +
      String((error as NodeJS.ErrnoException).code ?? "") +
      String((error as Error & { cause?: unknown }).cause ?? "");
    if (/ENOTFOUND|NXDOMAIN|EAI_AGAIN|EAI_NONAME|getaddrinfo/i.test(hint)) {
      return { probeResult: "DNS_FAIL", httpDerivedStatus: "OUTAGE" };
    }
    if (/ECONNREFUSED|ECONNRESET|EPIPE/i.test(hint)) {
      return { probeResult: "CONNECTION_FAIL", httpDerivedStatus: "OUTAGE" };
    }
    if (/CERT_|SSL_|ERR_TLS|UNABLE_TO_VERIFY|self.signed|certificate/i.test(hint)) {
      return { probeResult: "TLS_ERROR", httpDerivedStatus: "DEGRADED" };
    }
  }
  // Unknown network-level failure — cannot confirm the service is down; prefer UNKNOWN over OUTAGE
  // to avoid false positives (unclassified errors are often CDN/proxy artifacts, not origin outages)
  return { probeResult: "UNKNOWN_FAILURE", httpDerivedStatus: "UNKNOWN" };
}

// Confidence level based on probe result.
// HIGH = we're confident in the verdict; LOW = signal is ambiguous (might just be blocking).
export function probeConfidence(probeResult: ProbeResultVal): "HIGH" | "LOW" {
  switch (probeResult) {
    case "REACHABLE":
    case "SERVER_ERROR":
    case "DNS_FAIL":
    case "CONNECTION_FAIL":
    case "TLS_ERROR":
      return "HIGH";
    default:
      return "LOW";
  }
}
