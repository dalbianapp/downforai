import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StatusDashboard } from "@/components/status/StatusDashboard";
import { formatCategoryLabel } from "@/lib/utils";
import { badgeFromCapability } from "@/lib/badges";
import { ServiceCategory } from "@prisma/client";
import { computeSurfacePerformance, aggregateServicePerformance, computePerformanceScore } from "@/lib/performance";
import { isValidForPublicLatency } from "@/lib/monitoring/probeValidity";
import { communitySignalOf } from "@/lib/status/resolveServiceStatus";
import { resolveDisplayStatus } from "@/lib/status/deriveTechnicalStatus";
import { generateBreadcrumbJsonLd, truncateTitle, truncateDescription } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  return Object.values(ServiceCategory).map((category) => ({
    category: category.toLowerCase().replace(/_/g, "-"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryLabel = formatCategoryLabel(category.toUpperCase().replace(/-/g, "_"));

  const count = await prisma.service.count({
    where: { category: category.toUpperCase().replace(/-/g, "_") as ServiceCategory },
  });

  const fullTitle = `${count} ${categoryLabel} AI Tools Monitored Live | DownForAI`;
  const title = truncateTitle(fullTitle, `${count} ${categoryLabel} AI Tools Monitored Live`);
  const description = truncateDescription(
    `Track ${count} ${categoryLabel} AI services in real-time. Live uptime monitoring, latency tracking, and community outage reports for every major ${categoryLabel} tool.`
  );

  return {
    title,
    description,
    openGraph: { description },
    twitter: { description },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/category/${category}`,
    },
  };
}

async function getCategoryServices(category: string) {
  const categoryUpper = category.toUpperCase().replace(/-/g, "_") as ServiceCategory;

  type RawRow = {
    slug: string;
    name: string;
    description: string | null;
    category: string;
    defaultBadge: "LIVE_MONITORING" | "STATUS_PAGE_SYNC" | "COMMUNITY_REPORTS";
    monitoringCapability: string;
    communityStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | null;
    communityConfidence: "CONFIRMED" | "PROBABLE" | null;
    communityReportsWindow: number | null;
    communitySignalAt: Date | null;
    surface_id: string;
    observedAt: Date | null;
    status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | null;
    latencyMs: number | null;
    probeResult: string | null;
    officialStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | null;
  };

  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      s.slug,
      s.name,
      s.description,
      s.category,
      s."defaultBadge",
      s."monitoringCapability"::text AS "monitoringCapability",
      s."communityStatus"            AS "communityStatus",
      s."communityConfidence"        AS "communityConfidence",
      s."communityReportsWindow"     AS "communityReportsWindow",
      s."communitySignalAt"          AS "communitySignalAt",
      ss.id           AS surface_id,
      o."observedAt",
      o.status,
      o."latencyMs",
      o."probeResult",
      o."officialStatus"
    FROM "Service" s
    INNER JOIN "ServiceSurface" ss ON ss."serviceId" = s.id AND ss."isEnabled" = true
    LEFT JOIN LATERAL (
      SELECT "observedAt", status, "latencyMs", "probeResult"::text AS "probeResult", "officialStatus"::text AS "officialStatus"
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
    observations: { observedAt: Date; status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN"; latencyMs: number | null; probeResult: string | null; officialStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | null }[];
  };
  type ServiceAccum = {
    slug: string;
    name: string;
    description: string | null;
    category: string;
    defaultBadge: "LIVE_MONITORING" | "STATUS_PAGE_SYNC" | "COMMUNITY_REPORTS";
    monitoringCapability: string;
    communityStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | null;
    communityConfidence: "CONFIRMED" | "PROBABLE" | null;
    communityReportsWindow: number | null;
    communitySignalAt: Date | null;
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
        monitoringCapability: row.monitoringCapability,
        communityStatus: row.communityStatus,
        communityConfidence: row.communityConfidence,
        communityReportsWindow: row.communityReportsWindow,
        communitySignalAt: row.communitySignalAt,
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
        probeResult: row.probeResult,
        officialStatus: row.officialStatus,
      });
    }
  }

  return Array.from(serviceMap.values()).map((service) => {
    const surfaces = Array.from(service.surfaces.values());
    const allObservations = surfaces.flatMap((s) => s.observations);

    // Displayed status = CURRENT state: latest observation PER surface + official-
    // prime + community fold — the SINGLE site-wide derivation (no worst-of window).
    const latestPerSurface = surfaces
      .map((s) =>
        s.observations.reduce<(typeof s.observations)[number] | null>(
          (latest, o) => (latest === null || o.observedAt > latest.observedAt ? o : latest),
          null,
        ),
      )
      .filter((o): o is NonNullable<typeof o> => o !== null)
      .map((o) => ({ status: o.status, officialStatus: o.officialStatus, observedAt: o.observedAt }));

    const status = resolveDisplayStatus(
      service.monitoringCapability,
      latestPerSurface,
      communitySignalOf(service),
    ).status;

    // Build sparkline data from real latency observations
    const sparklineData: number[] = allObservations
      .sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime())
      .filter((o) => isValidForPublicLatency(o.probeResult, o.latencyMs))
      .map((o) => o.latencyMs as number)
      .slice(-24);

    // Compute performance level
    const surfacePerformances = surfaces.map((surface) => {
      const latencies = surface.observations.filter((o) => isValidForPublicLatency(o.probeResult, o.latencyMs)).map((o) => o.latencyMs as number);
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
      badgeType: badgeFromCapability(service.monitoringCapability),
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
  const categoryLabel = formatCategoryLabel(category.toUpperCase().replace(/-/g, "_"));

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

      {/* Reliability ranking link */}
      <a
        href={`/reliability/${category}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#0369a1",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        📊 View {categoryLabel} reliability ranking →
      </a>

      {category === "sports-betting" && (
        <div style={{
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "13px",
          color: "#92400e",
        }}>
          ⚠️ DownForAI monitors service availability only. This is not betting advice. Please gamble responsibly.
        </div>
      )}

      <StatusDashboard services={services} />
    </div>
  );
}
