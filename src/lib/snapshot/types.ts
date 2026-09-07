import type { ServiceDashboardData, SurfaceSnapshot, IncidentSummary, ReportSummary } from "@/lib/service-page/types";
import type { PerformanceLevel } from "@/lib/performance";

// JSON-safe mirror of ServiceDashboardData (Date -> ISO string) written by the
// hourly snapshot cron (src/app/api/cron/snapshot) and read by
// src/lib/snapshot/read.ts, which revives the dates back before handing the
// data to the page/panels. Field-for-field the same shape the old
// Prisma-backed getServiceDashboard() used to return.
export type ServiceSnapshotJson = {
  service: ServiceDashboardData["service"];
  overallStatus: ServiceDashboardData["overallStatus"];
  community: ServiceDashboardData["community"];
  headline: ServiceDashboardData["headline"];
  statusExplanation: ServiceDashboardData["statusExplanation"];
  surfaces: Array<Omit<SurfaceSnapshot, "lastObservedAt"> & { lastObservedAt: string | null }>;
  uptime24h: number | null;
  incidents30d: Array<Omit<IncidentSummary, "startedAt" | "resolvedAt"> & {
    startedAt: string;
    resolvedAt: string | null;
  }>;
  reportSummary: Omit<ReportSummary, "recentComments"> & {
    recentComments: Array<Omit<ReportSummary["recentComments"][number], "createdAt"> & { createdAt: string }>;
  };
  lastResolvedIncidentAt: string | null;
  generatedAt: string;
};

export type IndexServiceRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";
  badgeType: "LIVE_MONITORING" | "STATUS_PAGE_SYNC" | "COMMUNITY_REPORTS";
  latencyMs: number | null;
  sparklineData: number[];
  performanceLevel: PerformanceLevel;
  performanceBaseline: number;
  performanceScore: number;
};

export type IndexRecentIncident = {
  id: string;
  title: string;
  status: string;
  severity: string;
  startedAt: string;
  resolvedAt: string | null;
  summary: string | null;
  service: { name: string };
};

export type IndexSnapshotJson = {
  generatedAt: string;
  services: IndexServiceRow[];
  recentIncidents: IndexRecentIncident[];
};
