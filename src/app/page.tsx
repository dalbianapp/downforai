import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StatusDashboard } from "@/components/status/StatusDashboard";
import { HeroSection } from "@/components/home/HeroSection";
import { BentoSection } from "@/components/home/BentoSection";
import { RecentIncidents } from "@/components/home/RecentIncidents";
import { EditorialLinks } from "@/components/home/EditorialLinks";
import { CTAButton } from "@/components/ui/CTAButton";
import { calculateWorstStatus } from "@/lib/utils";
import { generateWebSiteJsonLd } from "@/lib/seo";
import { computeSurfacePerformance, aggregateServicePerformance, computePerformanceScore, getPerformanceColor } from "@/lib/performance";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DownForAI — Real-time status & diagnostics for 800+ AI tools",
  description:
    "Independent real-time monitoring for AI APIs, chat interfaces, and dev tools. Faster than official status pages, cleaner than Reddit. Incidents, latency, fallback alternatives.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const revalidate = 300;

async function getServicesStatus() {
  type RawRow = {
    service_id: string;
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
      s.id            AS service_id,
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
  `;

  // Regroupe : service → surfaces → observations
  type SurfaceAccum = {
    id: string;
    observations: { observedAt: Date; status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN"; latencyMs: number | null }[];
  };
  type ServiceAccum = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string;
    defaultBadge: "LIVE_MONITORING" | "STATUS_PAGE_SYNC" | "COMMUNITY_REPORTS";
    surfaces: Map<string, SurfaceAccum>;
  };

  const serviceMap = new Map<string, ServiceAccum>();

  for (const row of rows) {
    if (!serviceMap.has(row.service_id)) {
      serviceMap.set(row.service_id, {
        id: row.service_id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        category: row.category,
        defaultBadge: row.defaultBadge,
        surfaces: new Map(),
      });
    }

    const svc = serviceMap.get(row.service_id)!;

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
      .sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime()) // Sort ascending (oldest to newest)
      .map((o) => o.latencyMs)
      .filter((lat): lat is number => lat !== null) // Remove nulls
      .slice(-24); // Keep last 24 points max

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
    .filter((s) =>
      s.performanceLevel !== "NORMAL" &&
      s.performanceLevel !== "UNKNOWN" &&
      s.status !== "OUTAGE" &&
      s.status !== "UNKNOWN"
    )
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

      {/* Major Outages — compact list of all OUTAGE/DEGRADED services */}
      {(counts.outage > 0 || counts.degraded > 0) && (() => {
        const outageServices = services
          .filter(s => s.status === 'OUTAGE' || s.status === 'DEGRADED')
          .sort((a, b) => {
            const order = { OUTAGE: 0, DEGRADED: 1, UNKNOWN: 2, OPERATIONAL: 3 } as const;
            return order[a.status] - order[b.status];
          });
        return (
          <div
            style={{
              background: '#fff5f5',
              border: '1px solid #fecaca',
              borderRadius: '14px',
              padding: '20px 24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#991b1b' }}>
                  ⚠️ Major Outages & Degradations
                </div>
                <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '2px' }}>
                  {counts.outage > 0 && `${counts.outage} outage${counts.outage > 1 ? 's' : ''}`}
                  {counts.outage > 0 && counts.degraded > 0 && ' · '}
                  {counts.degraded > 0 && `${counts.degraded} degraded`}
                </div>
              </div>
              <Link
                href="/top-outages"
                style={{ fontSize: '12px', color: '#b91c1c', textDecoration: 'underline' }}
              >
                View all →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {outageServices.slice(0, 12).map(s => (
                <Link
                  key={s.slug}
                  href={`/${s.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: `1px solid ${s.status === 'OUTAGE' ? '#fecaca' : '#fde68a'}`,
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: s.status === 'OUTAGE' ? '#dc2626' : '#ca8a04',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#171717', flex: 1 }}>
                    {s.name}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: s.status === 'OUTAGE' ? '#fef2f2' : '#fffbeb',
                      color: s.status === 'OUTAGE' ? '#dc2626' : '#92400e',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {s.status === 'OUTAGE' ? 'OUTAGE' : 'DEGRADED'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

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

      {/* Quick access CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Link
          href="/reliability-index"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            textDecoration: 'none',
            color: '#0c4a6e',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>AI Reliability Index</span>
            <span style={{ fontSize: '13px', color: '#0369a1', marginLeft: '8px' }}>
              Uptime, latency p50/p95 &amp; incidents for 50 major AI services
            </span>
          </div>
          <span style={{ fontSize: '13px', color: '#0369a1', flexShrink: 0 }}>View →</span>
        </Link>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/top-outages"
            style={{
              flex: '1 1 220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#fff5f5',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              textDecoration: 'none',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#991b1b' }}>🔴 Top Outages</span>
              <span style={{ fontSize: '13px', color: '#b91c1c', display: 'block', marginTop: '1px' }}>
                Most reported AI services right now
              </span>
            </div>
            <span style={{ fontSize: '13px', color: '#b91c1c', flexShrink: 0 }}>View →</span>
          </Link>
          <Link
            href="/reliability"
            style={{
              flex: '1 1 220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              textDecoration: 'none',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#166534' }}>Reliability Rankings</span>
              <span style={{ fontSize: '13px', color: '#16a34a', display: 'block', marginTop: '1px' }}>
                By category, 90-day rolling
              </span>
            </div>
            <span style={{ fontSize: '13px', color: '#16a34a', flexShrink: 0 }}>View →</span>
          </Link>
        </div>
      </div>

      {/* Dashboard - All Services */}
      <StatusDashboard services={services} />

      {/* Recent Incidents */}
      {incidents.length > 0 && (
        <RecentIncidents incidents={incidents} />
      )}

      {/* Editorial Links — SSR maillage interne */}
      <EditorialLinks />

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
