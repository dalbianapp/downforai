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
};

export type DiagnosisResult = {
  label: string;
  scope: "global" | "partial" | "local" | "unknown";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
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
  };
  overallStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | "REPORTED_ISSUES";
  diagnosis: DiagnosisResult;
  surfaces: SurfaceSnapshot[];
  uptime24h: number | null;       // percentage
  incidents30d: IncidentSummary[];
  reportSummary: ReportSummary;
  topContent: import("@/content/top-services/types").TopServiceContent | null;
};
