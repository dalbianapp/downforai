import type { IncidentSeverity } from "./types";

/**
 * Filter criteria for PUBLIC incident archive.
 * Goal: avoid thin content, avoid flapping, avoid duplicate titles.
 */

export const PUBLISHABLE_SEVERITIES: IncidentSeverity[] = ["MAJOR", "CRITICAL"];

/**
 * Minimum duration (in minutes) for an incident to appear in public archive.
 * Shorter incidents are considered flapping/noise.
 */
export const MIN_DURATION_MINUTES_FOR_PUBLIC = 10;

/**
 * Maximum incidents per service per day in public archive.
 * Prevents "jais-ai" type services from flooding the archive.
 */
export const MAX_INCIDENTS_PER_SERVICE_PER_DAY = 2;

/**
 * Services excluded from the public archive entirely.
 * jais-ai excluded: 85/251 incidents (34%) = clear flapping pattern.
 */
export const EXCLUDED_SERVICE_SLUGS: string[] = [
  "jais-ai",
];

/**
 * Maximum age in hours for an OPEN incident to appear in public archive.
 * Incidents older than this with no resolution are considered "service likely discontinued" and excluded.
 */
export const MAX_OPEN_INCIDENT_HOURS = 7 * 24; // 7 days

/**
 * Check if an incident is publishable.
 */
export function isPublishableIncident(incident: {
  severity: string;
  startedAt: Date;
  resolvedAt: Date | null;
  serviceSlug: string;
  status?: string;
}): boolean {
  if (EXCLUDED_SERVICE_SLUGS.includes(incident.serviceSlug)) {
    return false;
  }

  if (!PUBLISHABLE_SEVERITIES.includes(incident.severity as IncidentSeverity)) {
    return false;
  }

  if (incident.resolvedAt) {
    const durationMin = (incident.resolvedAt.getTime() - incident.startedAt.getTime()) / 60000;
    if (durationMin < MIN_DURATION_MINUTES_FOR_PUBLIC) {
      return false;
    }
  }

  // Exclude OPEN incidents older than MAX_OPEN_INCIDENT_HOURS (service likely discontinued)
  if (!incident.resolvedAt && incident.status !== "RESOLVED") {
    const hoursSinceStart = (Date.now() - incident.startedAt.getTime()) / 3600000;
    if (hoursSinceStart > MAX_OPEN_INCIDENT_HOURS) {
      return false;
    }
  }

  return true;
}
