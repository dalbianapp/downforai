import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { ServiceCategory } from "@prisma/client";
import { GLOBAL_ERRORS } from "@/lib/ai-symptoms";
import { getIncidentMonthSummaries, getIncidentServiceSummaries } from "@/lib/incidents/queries";

// Date de déploiement stable pour les pages statiques
const DEPLOY_DATE = new Date("2026-03-01T00:00:00Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://downforai.com";

  // Get all services and incident summaries in parallel
  const [services, months, serviceSummaries] = await Promise.all([
    prisma.service.findMany({ select: { slug: true, category: true, updatedAt: true } }),
    getIncidentMonthSummaries(),
    getIncidentServiceSummaries(100),
  ]);

  const categories = Object.values(ServiceCategory).map((c) => c.toLowerCase().replace(/_/g, "-"));

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(), // Homepage changes with new observations/incidents
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/incidents`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified: new Date("2026-04-20T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/developers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/badges`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/report`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/errors`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Service status pages (all 201 services)
  const serviceRoutes = services.map((service) => ({
    url: `${baseUrl}/${service.slug}`,
    lastModified: service.updatedAt,
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  // Category pages (all 11 categories)
  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: DEPLOY_DATE,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  // Error guide pages (10 error types)
  const errorRoutes = GLOBAL_ERRORS.map((errorSlug) => ({
    url: `${baseUrl}/errors/${errorSlug}`,
    lastModified: DEPLOY_DATE,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // NOTE: /[slug]/down, /[slug]/error/* and /[slug]/[symptom] are permanently
  // removed (HTTP 410 via middleware) — they are no longer built here.

  // Monthly incident archive routes
  const monthlyIncidentRoutes: MetadataRoute.Sitemap = months.map((m) => ({
    url: `${baseUrl}/incidents/${m.monthKey}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Per-service incident routes (only services with >= 1 publishable incident)
  const serviceIncidentRoutes: MetadataRoute.Sitemap = serviceSummaries.map((s) => ({
    url: `${baseUrl}/incidents/service/${s.serviceSlug}`,
    lastModified: s.lastIncidentAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Editorial pages (guides, reliability hubs, data, reports, top-outages)
  // Previously only in the orphan sitemap-premium — now in the main sitemap so Google discovers them
  const RELIABILITY_CATEGORY_SLUGS = [
    "llm", "image", "video", "audio", "dev", "infra", "search", "productivity",
    "agents", "three-d", "design", "mlops", "vector-db", "roleplay", "marketing",
    "support", "education", "hr-ai", "legal-ai", "sports-betting",
  ];

  const GUIDE_SLUGS = [
    "ai-api-uptime-comparison-2026",
    "chatgpt-down-alternatives",
    "how-to-monitor-ai-api-status",
    "ai-outage-patterns",
    "cost-of-ai-downtime",
    "openai-vs-anthropic-vs-google-reliability",
    "free-ai-monitoring-tools",
  ];

  const editorialRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...GUIDE_SLUGS.map((slug) => ({
      url: `${baseUrl}/guides/${slug}`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${baseUrl}/reliability`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    ...RELIABILITY_CATEGORY_SLUGS.map((slug) => ({
      url: `${baseUrl}/reliability/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    { url: `${baseUrl}/reliability-index`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/data`, lastModified: DEPLOY_DATE, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/top-outages`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/reports`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/reports/2026-05`, lastModified: DEPLOY_DATE, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...categoryRoutes,
    ...errorRoutes,
    ...editorialRoutes,
    ...monthlyIncidentRoutes,
    ...serviceIncidentRoutes,
  ];
}
