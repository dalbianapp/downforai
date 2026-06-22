export type SurfaceSnapshot = {
  surfaceId: string;
  surfaceSlug: string;
  displayName: string;
  status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";
  latestHttpStatus: number | null;
  latestLatencyMs: number | null;
  confidence: string | null;
  lastObservedAt: Date | null;
  p50Latency24h: number | null;
  p95Latency24h: number | null;
  officialStatus: string | null;
};

// Everything the status panel needs — DERIVED ENTIRELY from resolveServiceStatus +
// the real status origin. No independent re-classification (the old DiagnosisResult
// invented causes and contradicted the resolved status).
export type StatusExplanation = {
  status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | "REPORTED_ISSUES";
  // What actually drove the status: official status feed, our HTTP probe, the
  // community signal, or the monitoring capability itself (blocked/unverifiable).
  primarySource: "OFFICIAL" | "TECHNICAL" | "COMMUNITY" | "CAPABILITY";
  signalSourceLabel: string;        // "official status API" | "official status page" | "public surface check"
  monitoringConfidence: "High" | "Medium" | "Low"; // capability-based — SAME value the hero shows
  communityConfidence: "CONFIRMED" | "PROBABLE" | null; // only when community-driven
  reportsInWindow: number;
  monitoringCapability: string;
  officialComponentDetail: string | null; // null → the official feed gave no component-level detail
};

export type IncidentSummary = {
  id: string;
  title: string;
  status: string;
  severity: string;
  startedAt: Date;
  resolvedAt: Date | null;
  duration: number | null; // minutes
  summary: string | null;
};

export type ReportSummary = {
  total24h: number;
  byType: Record<string, number>;
  bySurface: Record<string, number>;
  recentComments: Array<{
    pseudo: string;
    content: string;
    reportType: string;
    createdAt: Date;
  }>;
};

export type ServiceDashboardData = {
  service: {
    id: string;
    slug: string;
    name: string;
    category: string;
    description: string | null;
    websiteUrl: string | null;
    iconUrl: string | null;
    monitoringCapability: string;
    lifecycleStatus: string;
  };
  overallStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | "REPORTED_ISSUES";
  // Sourcing for the resolved status (from resolveServiceStatus) — drives honest
  // "Community-reported …" labelling + report count + confidence on the page.
  community: {
    source: "TECHNICAL" | "COMMUNITY" | "BOTH";
    confidence: "CONFIRMED" | "PROBABLE" | null;
    label: string;
    reportsInWindow: number;
  };
  headline: "MONITORING_LIMITED" | "STATUS_UNCERTAIN" | null;
  statusExplanation: StatusExplanation;
  surfaces: SurfaceSnapshot[];
  uptime24h: number | null;       // percentage
  incidents30d: IncidentSummary[];
  reportSummary: ReportSummary;
  topContent: import("@/content/top-services/types").TopServiceContent | null;
};
