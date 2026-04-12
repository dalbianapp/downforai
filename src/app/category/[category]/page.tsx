import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StatusDashboard } from "@/components/status/StatusDashboard";
import { calculateWorstStatus, formatCategoryLabel } from "@/lib/utils";
import { ServiceCategory } from "@prisma/client";
import { computeSurfacePerformance, aggregateServicePerformance, computePerformanceScore } from "@/lib/performance";
import { generateBreadcrumbJsonLd, truncateTitle, truncateDescription } from "@/lib/seo";

export const revalidate = 120;

export async function generateStaticParams() {
  return Object.values(ServiceCategory).map((category) => ({
    category: category.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryLabel = formatCategoryLabel(category.toUpperCase());

  const count = await prisma.service.count({
    where: { category: category.toUpperCase() as ServiceCategory },
  });

  const fullTitle = `${count} ${categoryLabel} AI Tools Monitored Live | DownForAI`;
  const title = truncateTitle(fullTitle, `${count} ${categoryLabel} AI Tools Monitored Live`);
  const description = truncateDescription(
    `Track ${count} ${categoryLabel} AI services in real-time. Live uptime monitoring, latency tracking, and community outage reports for every major ${categoryLabel} tool.`
  );

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/category/${category}`,
    },
  };
}

async function getCategoryServices(category: string) {
  const categoryUpper = category.toUpperCase() as ServiceCategory;

  type RawRow = {
    slug: string;
    name: string;
    description: string | null;
    category: string;
    defaultBadge: "LIVE_MONITORING" | "STATUS_PAGE_SYNC" | "COMMUNITY_REPORTS";
    surface_id: string;
    observedAt: Date | null;
    status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | null;
    latencyMs: number | null;
  };

  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      s.slug,
      s.name,
      s.description,
      s.category,
      s."defaultBadge",
      ss.id           AS surface_id,
      o."observedAt",
      o.status,
      o."latencyMs"
    FROM "Service" s
    INNER JOIN "ServiceSurface" ss ON ss."serviceId" = s.id AND ss."isEnabled" = true
    LEFT JOIN LATERAL (
      SELECT "observedAt", status, "latencyMs"
      FROM "Observation"
      WHERE "serviceSurfaceId" = ss.id
      ORDER BY "observedAt" DESC
      LIMIT 24
    ) o ON true
    WHERE s.category = ${categoryUpper}::"ServiceCategory"
  `;

  // Regroupe : service (par slug) → surfaces → observations
  type SurfaceAccum = {
    id: string;
    observations: { observedAt: Date; status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN"; latencyMs: number | null }[];
  };
  type ServiceAccum = {
    slug: string;
    name: string;
    description: string | null;
    category: string;
    defaultBadge: "LIVE_MONITORING" | "STATUS_PAGE_SYNC" | "COMMUNITY_REPORTS";
    surfaces: Map<string, SurfaceAccum>;
  };

  const serviceMap = new Map<string, ServiceAccum>();

  for (const row of rows) {
    if (!serviceMap.has(row.slug)) {
      serviceMap.set(row.slug, {
        slug: row.slug,
        name: row.name,
        description: row.description,
        category: row.category,
        defaultBadge: row.defaultBadge,
        surfaces: new Map(),
      });
    }

    const svc = serviceMap.get(row.slug)!;

    if (!svc.surfaces.has(row.surface_id)) {
      svc.surfaces.set(row.surface_id, { id: row.surface_id, observations: [] });
    }

    if (row.observedAt && row.status) {
      svc.surfaces.get(row.surface_id)!.observations.push({
        observedAt: row.observedAt,
        status: row.status,
        latencyMs: row.latencyMs,
      });
    }
  }

  return Array.from(serviceMap.values()).map((service) => {
    const surfaces = Array.from(service.surfaces.values());
    const allObservations = surfaces.flatMap((s) => s.observations);

    // Filter recent observations (last 6 hours) for status determination
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const recentObservations = allObservations.filter((o) => o.observedAt >= sixHoursAgo);

    // If no observations in last 6 hours, status is UNKNOWN
    let status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" = "UNKNOWN";

    if (recentObservations.length > 0) {
      const statuses = recentObservations.map((o) => o.status);
      status = calculateWorstStatus(statuses);
    }

    // Build sparkline data from real latency observations
    const sparklineData: number[] = allObservations
      .sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime())
      .map((o) => o.latencyMs)
      .filter((lat): lat is number => lat !== null)
      .slice(-24);

    // Compute performance level
    const surfacePerformances = surfaces.map((surface) => {
      const latencies = surface.observations.filter((o) => o.latencyMs !== null).map((o) => o.latencyMs as number);
      const last5 = latencies.slice(0, 5);
      const last72h = latencies;
      const lastObservedAt = surface.observations[0]?.observedAt || null;
      return computeSurfacePerformance({ last72hLatencies: last72h, last5Latencies: last5, lastObservedAt });
    });
    const performanceLevel = aggregateServicePerformance(surfacePerformances.map((p) => p.level));
    const avgBaseline = surfacePerformances.length > 0
      ? Math.round(surfacePerformances.reduce((sum, p) => sum + p.baseline, 0) / surfacePerformances.length)
      : 0;

    return {
      slug: service.slug,
      name: service.name,
      description: service.description,
      category: service.category,
      status,
      badgeType: service.defaultBadge,
      latencyMs: allObservations[0]?.latencyMs || null,
      sparklineData,
      performanceLevel,
      performanceBaseline: avgBaseline,
      performanceScore: computePerformanceScore(allObservations[0]?.latencyMs || null, avgBaseline, performanceLevel),
    };
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const services = await getCategoryServices(category);
  const categoryLabel = formatCategoryLabel(category.toUpperCase());

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://downforai.com" },
    { name: categoryLabel, url: `https://downforai.com/category/${category}` },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#171717", marginBottom: "8px", letterSpacing: "-1px" }}>
          {categoryLabel} AI Services
        </h1>
        <p style={{ fontSize: "16px", color: "#737373" }}>
          Real-time status monitoring for {services.length} {categoryLabel} services
        </p>
      </div>

      <StatusDashboard services={services} />
    </div>
  );
}
