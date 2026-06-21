import type { IncidentSeverity, IncidentStatus } from "./types";

const SEVERITY_DESCRIPTORS: Record<IncidentSeverity, string> = {
  CRITICAL: "a critical service disruption",
  MAJOR: "a significant service issue",
  MINOR: "a minor anomaly",
};

const STATUS_DESCRIPTORS: Record<IncidentStatus, string> = {
  OPEN: "is currently being investigated",
  MONITORING: "is being monitored after initial recovery",
  RESOLVED: "has been resolved",
};

/**
 * Generate an enriched, unique description for an incident.
 * Avoids publishing 251 identical "{service} experiencing issues" summaries.
 */
export function generateEnrichedDescription(input: {
  serviceName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: Date;
  resolvedAt: Date | null;
  durationMinutes: number | null;
  sourceBadge: string;
}): string {
  const { serviceName, severity, status, startedAt, resolvedAt, durationMinutes, sourceBadge } = input;

  const severityDesc = SEVERITY_DESCRIPTORS[severity];
  const statusDesc = STATUS_DESCRIPTORS[status];

  const startDate = startedAt.toISOString().split("T")[0];
  const startTime = startedAt.toISOString().split("T")[1].slice(0, 5) + " UTC";

  let description = `On ${startDate} at ${startTime}, DownForAI monitoring detected ${severityDesc} affecting ${serviceName}. `;

  if (resolvedAt && durationMinutes !== null) {
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
    description += `The incident ${statusDesc} after approximately ${durationStr}. `;
  } else {
    description += `The incident ${statusDesc}. `;
  }

  const sourceContext: Record<string, string> = {
    LIVE_MONITORING: "This incident was detected by our automated probe infrastructure, which checks each monitored surface on a rotating schedule.",
    STATUS_PAGE_SYNC: "This incident was surfaced through synchronization with the provider's official status page.",
    COMMUNITY_REPORTS: "This incident was identified based on a significant volume of user reports.",
  };

  description += sourceContext[sourceBadge] ?? "";

  return description;
}

/**
 * Generate a human-readable title for an incident.
 * Replaces generic "{service} experiencing issues" with something richer.
 */
export function generateEnrichedTitle(input: {
  serviceName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: Date;
  durationMinutes: number | null;
}): string {
  const { serviceName, severity, status, startedAt } = input;

  const severityLabel: Record<IncidentSeverity, string> = {
    CRITICAL: "critical disruption",
    MAJOR: "major issue",
    MINOR: "minor anomaly",
  };

  const month = startedAt.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const day = startedAt.getUTCDate();

  if (status === "OPEN") {
    return `${serviceName} — ongoing ${severityLabel[severity]} (since ${month} ${day})`;
  }

  return `${serviceName} — ${severityLabel[severity]} on ${month} ${day}`;
}
