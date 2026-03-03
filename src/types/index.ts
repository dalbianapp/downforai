import { ServiceCategory, ServiceStatus, IncidentSeverity } from "@prisma/client";

export interface ServiceWithSurfaces {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  tier: number;
  defaultBadge: string;
  limitPhraseKey: string;
  websiteUrl: string | null;
  iconUrl: string | null;
  description: string | null;
  surfaces: ServiceSurface[];
}

export interface ServiceSurface {
  id: string;
  serviceId: string;
  slug: string;
  displayName: string;
  badgeOverride: string | null;
  limitPhraseOverrideKey: string | null;
  isEnabled: boolean;
}

export interface Observation {
  id: string;
  serviceSurfaceId: string;
  regionId: string;
  status: ServiceStatus;
  latencyMs: number | null;
  errorRate: number | null;
  observedAt: Date;
}

export interface Incident {
  id: string;
  serviceId: string;
  title: string;
  status: string;
  severity: IncidentSeverity;
  startedAt: Date;
  resolvedAt: Date | null;
  summary: string | null;
  sourceBadge: string;
  createdAt: Date;
}

export interface ServiceDetailWithObservations extends ServiceWithSurfaces {
  observations: Array<{
    serviceSurfaceId: string;
    displayName: string;
    status: ServiceStatus;
    latencyMs: number | null;
    observedAt: Date;
  }>;
  reportsCount24h: number;
  incidents: Incident[];
}
