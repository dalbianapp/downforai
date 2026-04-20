export type IncidentStatus = "OPEN" | "MONITORING" | "RESOLVED";
export type IncidentSeverity = "MINOR" | "MAJOR" | "CRITICAL";

export type PublishableIncident = {
  id: string;
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
  serviceCategory: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startedAt: Date;
  resolvedAt: Date | null;
  durationMinutes: number | null;
  summary: string | null;
  sourceBadge: string;

  // Computed fields for enriched display
  enrichedDescription: string;
  monthKey: string; // "2026-04"
  dayKey: string;   // "2026-04-20"
};

export type IncidentMonthSummary = {
  monthKey: string;      // "2026-04"
  displayMonth: string;  // "April 2026"
  incidentCount: number;
  resolvedCount: number;
  openCount: number;
  criticalCount: number;
  majorCount: number;
  topServices: Array<{ slug: string; name: string; count: number }>;
};

export type IncidentServiceSummary = {
  serviceSlug: string;
  serviceName: string;
  serviceCategory: string;
  totalIncidents: number;
  resolvedIncidents: number;
  openIncidents: number;
  avgDurationMinutes: number | null;
  lastIncidentAt: Date | null;
  firstIncidentAt: Date | null;
};

export type IncidentArchiveStats = {
  totalIncidents: number;
  totalResolved: number;
  totalOpen: number;
  monthsCovered: number;
  servicesAffected: number;
  avgDurationMinutes: number | null;
};
