import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StatusDashboard } from "@/components/status/StatusDashboard";
import { calculateWorstStatus, formatCategoryLabel } from "@/lib/utils";
import { ServiceCategory } from "@prisma/client";

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

  return {
    title: `${categoryLabel} AI Services — Real-Time Status Monitor | DownForAI`,
    description: `Real-time status monitoring for ${categoryLabel} AI services. Check uptime and incidents.`,
    alternates: {
      canonical: `/category/${category}`,
    },
  };
}

async function getCategoryServices(category: string) {
  const categoryUpper = category.toUpperCase() as ServiceCategory;

  const services = await prisma.service.findMany({
    where: { category: categoryUpper },
    include: {
      surfaces: {
        include: {
          observations: {
            where: {
              observedAt: {
                gte: new Date(Date.now() - 6 * 60 * 60 * 1000),
              },
            },
            orderBy: { observedAt: "desc" },
            take: 24,
          },
        },
      },
    },
  });

  return services.map((service) => {
    const allObservations = service.surfaces.flatMap((s) => s.observations);
    let status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" = "UNKNOWN";

    if (allObservations.length > 0) {
      const statuses = allObservations.map((o) => o.status);
      status = calculateWorstStatus(statuses);
    }

    // Build sparkline data from real latency observations
    const sparklineData: number[] = allObservations
      .sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime())
      .map((o) => o.latencyMs)
      .filter((lat): lat is number => lat !== null)
      .slice(-24);

    return {
      slug: service.slug,
      name: service.name,
      description: service.description,
      category: service.category,
      status,
      badgeType: service.defaultBadge,
      latencyMs: allObservations[0]?.latencyMs || null,
      sparklineData,
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
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
