import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StatusDashboard } from "@/components/status/StatusDashboard";
import { HeroSection } from "@/components/home/HeroSection";
import { BentoSection } from "@/components/home/BentoSection";
import { RecentIncidents } from "@/components/home/RecentIncidents";
import { CTAButton } from "@/components/ui/CTAButton";
import { calculateWorstStatus } from "@/lib/utils";
import { generateWebSiteJsonLd } from "@/lib/seo";
import { computeSurfacePerformance, aggregateServicePerformance, computePerformanceScore, getPerformanceColor } from "@/lib/performance";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DownForAI — Is Your AI Down? Real-Time AI Status Monitor",
  description:
    "Real-time status monitoring for 200+ AI services. Check if ChatGPT, Claude, Gemini, Midjourney, and more are down right now.",
};

export const revalidate = 60;

async function getServicesStatus() {
  const services = await prisma.service.findMany({
    include: {
      surfaces: {
        include: {
          observations: {
            orderBy: { observedAt: "desc" },
            take: 72, // Get last 72 observations for performance baseline
          },
        },
      },
    },
  });

  return services.map((service) => {
    const allObservations = service.surfaces.flatMap((s) => s.observations);

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
      .sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime()) // Sort ascending (oldest to newest)
      .map((o) => o.latencyMs)
      .filter((lat): lat is number => lat !== null) // Remove nulls
      .slice(-24); // Keep last 24 points max

    // Compute performance level
    const surfacePerformances = service.surfaces.map((surface) => {
      const latencies = surface.observations.filter((o) => o.latencyMs !== null).map((o) => o.latencyMs as number);
      const last5 = latencies.slice(0, 5);
      const last72h = latencies;
      return computeSurfacePerformance({ last72hLatencies: last72h, last5Latencies: last5 });
    });
    const performanceLevel = aggregateServicePerformance(surfacePerformances.map((p) => p.level));
    const avgBaseline = surfacePerformances.length > 0
      ? Math.round(surfacePerformances.reduce((sum, p) => sum + p.baseline, 0) / surfacePerformances.length)
      : 0;

    return {
      id: service.id,
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

async function getRecentIncidents() {
  const incidents = await prisma.incident.findMany({
    include: {
      service: {
        select: { name: true },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  return incidents;
}

export default async function HomePage() {
  const services = await getServicesStatus();
  const incidents = await getRecentIncidents();

  const counts = {
    operational: services.filter((s) => s.status === "OPERATIONAL").length,
    degraded: services.filter((s) => s.status === "DEGRADED").length,
    outage: services.filter((s) => s.status === "OUTAGE").length,
    total: services.length,
  };

  // Featured services for Bento: 4 most problematic + 2 biggest operational
  const problematicServices = services
    .filter((s) => s.status === "OUTAGE" || s.status === "DEGRADED")
    .sort((a, b) => {
      const statusOrder = { OUTAGE: 0, DEGRADED: 1, UNKNOWN: 2, OPERATIONAL: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    })
    .slice(0, 4);

  const operationalServices = services
    .filter((s) => s.status === "OPERATIONAL")
    .slice(0, 2);

  const featuredServices = [...problematicServices, ...operationalServices].slice(0, 4);

  // Performance alerts: services with elevated/severe latency but not in outage
  const perfAlerts = services
    .filter((s) => s.performanceLevel !== "NORMAL" && s.status !== "OUTAGE")
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 6);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://downforai.com";
  const jsonLd = generateWebSiteJsonLd("DownForAI", siteUrl);

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <HeroSection
        operational={counts.operational}
        degraded={counts.degraded}
        outage={counts.outage}
        total={counts.total}
      />

      {/* Bento Section - Featured Services (seulement si incidents) */}
      {featuredServices.some(s => s.status === 'OUTAGE' || s.status === 'DEGRADED') ? (
        <BentoSection services={featuredServices} />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '20px 24px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
          }}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', flexShrink: 0 }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#166534' }}>
              All systems operational
            </div>
            <div style={{ fontSize: '13px', color: '#16a34a' }}>
              No issues detected across {counts.total} AI services
            </div>
          </div>
        </div>
      )}

      {/* Performance Alerts */}
      {perfAlerts.length > 0 && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '14px',
            padding: '20px 24px',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#92400e' }}>
              Performance Alerts
            </div>
            <div style={{ fontSize: '13px', color: '#b45309' }}>
              Services responding but with elevated latency
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {perfAlerts.map((service) => (
              <Link
                key={service.slug}
                href={`/${service.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  background: '#ffffff',
                  border: `1px solid ${service.performanceLevel === 'SEVERE' ? '#fecaca' : '#fef3c7'}`,
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: '#171717',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: getPerformanceColor(service.performanceLevel),
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: 600 }}>{service.name}</span>
                <span style={{ fontFamily: 'monospace', color: '#737373' }}>
                  {service.latencyMs ? `${service.latencyMs}ms` : '—'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      <div
        className="h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--border), transparent)'
        }}
      />

      {/* Dashboard - All Services */}
      <StatusDashboard services={services} />

      {/* Recent Incidents */}
      {incidents.length > 0 && (
        <RecentIncidents incidents={incidents} />
      )}

      {/* Bottom CTA */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#171717', marginBottom: '8px' }}>
          Having issues with an AI service?
        </h3>
        <p style={{ fontSize: '14px', color: '#525252', marginBottom: '16px' }}>
          Help the community by reporting your experience
        </p>
        <CTAButton href="/report">
          Report an Issue
        </CTAButton>
      </div>
    </div>
  );
}
