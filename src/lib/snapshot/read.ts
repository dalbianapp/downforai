import { cache } from "react";
import { getJson } from "./blob";
import { servicePath, indexPath } from "./paths";
import { TOP_SERVICE_CONTENT } from "@/content/top-services";
import type { ServiceSnapshotJson, IndexSnapshotJson } from "./types";
import type { ServiceDashboardData } from "@/lib/service-page/types";

// Runtime readers for the hourly status snapshot — deliberately the ONLY way
// the service page, opengraph-image, home and category pages get status data.
// No Prisma import anywhere in this file: that is the whole point of the
// snapshot (see the Sept 2026 Neon-wake diagnostic in memory). Wrapped in
// React's per-request cache() so generateMetadata + the page body share one
// Blob read instead of two.

/**
 * Full per-service dashboard, revived from JSON (ISO strings -> Date) back
 * into exactly the shape the old Prisma-backed getServiceDashboard() used to
 * return (topContent included). Returns null if the slug doesn't exist OR the
 * cron hasn't snapshotted it yet (brand-new service, first ~hour after being
 * added to the DB).
 */
export const getServiceSnapshot = cache(
  async (slug: string): Promise<ServiceDashboardData | null> => {
    const json = await getJson<ServiceSnapshotJson>(servicePath(slug));
    if (!json) return null;

    return {
      service: json.service,
      overallStatus: json.overallStatus,
      community: json.community,
      headline: json.headline,
      statusExplanation: json.statusExplanation,
      surfaces: json.surfaces.map((s) => ({
        ...s,
        lastObservedAt: s.lastObservedAt ? new Date(s.lastObservedAt) : null,
      })),
      uptime24h: json.uptime24h,
      incidents30d: json.incidents30d.map((i) => ({
        ...i,
        startedAt: new Date(i.startedAt),
        resolvedAt: i.resolvedAt ? new Date(i.resolvedAt) : null,
      })),
      reportSummary: {
        ...json.reportSummary,
        recentComments: json.reportSummary.recentComments.map((c) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        })),
      },
      topContent: TOP_SERVICE_CONTENT[json.service.slug] ?? null,
      lastResolvedIncidentAt: json.lastResolvedIncidentAt ? new Date(json.lastResolvedIncidentAt) : null,
    };
  }
);

/** Lightweight per-service rows + the 5 most recent site-wide incidents. */
export const getIndexSnapshot = cache(async (): Promise<IndexSnapshotJson | null> => {
  return getJson<IndexSnapshotJson>(indexPath());
});
