/**
 * Pure function: derive the "best" final status from two independent signals.
 *
 * Rule: "the worst of both"
 *   - If the official source (Atlassian JSON) says OUTAGE/DEGRADED  → believe it
 *   - If the official source says OPERATIONAL but HTTP is failing    → DEGRADED (MIXED)
 *     This catches outages *before* the status page is updated.
 *   - If we have no official signal (non-Atlassian or parse failed)  → fall back to HTTP
 *
 * Intentionally NOT exported as a default — keeps callers explicit.
 */

export type StatusResult = "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";

export type CheckTypeVal =
  | "HOMEPAGE"
  | "STATUS_HTML"
  | "ATLASSIAN_JSON"
  | "GCP_JSON"
  | "AWS_HEALTH"
  | "AZURE_STATUS"
  | "ROBOTS_TXT"
  | "UNKNOWN";

export type StatusSourceVal =
  | "OFFICIAL_STATUS_PAGE"
  | "HTTP_CHECK"
  | "MIXED"
  | "FALLBACK";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export type DeriveInput = {
  /** Parsed from the official status page JSON (null if non-Atlassian or parse failed). */
  officialStatus: StatusResult | null;
  /** Status computed from the HTTP response alone (the legacy behavior). */
  httpDerivedStatus: StatusResult;
  /** Surface check type, used to set confidence for HTTP-only paths. */
  checkType: CheckTypeVal;
  /** Whether the official source was successfully parsed. */
  parseOk: boolean;
};

export type DeriveResult = {
  finalStatus: StatusResult;
  statusSource: StatusSourceVal;
  confidence: ConfidenceLevel;
};

export function deriveFinalStatus(input: DeriveInput): DeriveResult {
  const { officialStatus, httpDerivedStatus, checkType, parseOk } = input;

  // ── Path 1: Official signal available (Atlassian, parseOk=true) ──────────
  if (officialStatus !== null && parseOk) {
    if (officialStatus === "OUTAGE") {
      return { finalStatus: "OUTAGE", statusSource: "OFFICIAL_STATUS_PAGE", confidence: "HIGH" };
    }
    if (officialStatus === "DEGRADED") {
      return { finalStatus: "DEGRADED", statusSource: "OFFICIAL_STATUS_PAGE", confidence: "HIGH" };
    }
    // officialStatus === OPERATIONAL — trust it over any Vercel probe failure.
    // A timeout / block / UNKNOWN from our probe IPs does not override an official "no incident".
    return { finalStatus: "OPERATIONAL", statusSource: "OFFICIAL_STATUS_PAGE", confidence: "HIGH" };
  }

  // ── Path 2: No official signal (non-Atlassian, or parse failed) ──────────
  // Never produce OUTAGE from a parse failure alone — fall back to HTTP.
  const statusSource: StatusSourceVal = !parseOk ? "FALLBACK" : "HTTP_CHECK";
  const confidence: ConfidenceLevel =
    checkType === "HOMEPAGE" || checkType === "ROBOTS_TXT" ? "LOW" : "MEDIUM";

  return { finalStatus: httpDerivedStatus, statusSource, confidence };
}
