import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * Cached service lookup by slug — memoized per HTTP request via React.cache().
 * Used by both generateMetadata and getServiceDashboard to avoid duplicate queries.
 * Returns the same select shape that getServiceDashboard requires.
 */
export const getServiceBySlug = cache(async (slug: string) => {
  return prisma.service.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      websiteUrl: true,
      iconUrl: true,
      monitoringCapability: true,
      lifecycleStatus: true,
      // Community signal (cron-written, canary-gated) — read by resolveServiceStatus.
      communityStatus: true,
      communityConfidence: true,
      communityReportsWindow: true,
      communitySignalAt: true,
    },
  });
});

/**
 * Cached community reports count for the last 24h — memoized per HTTP request.
 * Used by both generateMetadata and getServiceDashboard.
 */
export const getReports24hCount = cache(async (serviceId: string) => {
  return prisma.communityReport.count({
    where: {
      serviceId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
});

/**
 * Cached last resolved incident in the last 30 days — memoized per HTTP request.
 * Used by ServicePage (snippet magnet). Field is startedAt per schema.
 */
export const getLastResolvedIncident = cache(async (serviceId: string) => {
  return prisma.incident.findFirst({
    where: {
      serviceId,
      isFalsePositive: false,
      resolvedAt: { not: null },
      startedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { startedAt: "desc" },
    select: { startedAt: true },
  });
});
