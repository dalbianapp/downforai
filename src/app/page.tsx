import { Metadata } from "next";
import type { IncidentStatus, IncidentSeverity } from "@prisma/client";
import { StatusDashboard } from "@/components/status/StatusDashboard";
import { HeroSection } from "@/components/home/HeroSection";
import { BentoSection } from "@/components/home/BentoSection";
import { RecentIncidents } from "@/components/home/RecentIncidents";
import { EditorialLinks } from "@/components/home/EditorialLinks";
import { CTAButton } from "@/components/ui/CTAButton";
import { generateWebSiteJsonLd } from "@/lib/seo";
import { getPerformanceColor } from "@/lib/performance";
import { getIndexSnapshot } from "@/lib/snapshot/read";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Is AI Down Right Now? Live AI Outages Today | DownForAI",
  description:
    "Is AI down right now? Live status and outage tracking for 800+ AI services — from major LLMs to niche AI tools most trackers miss.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

export default async function HomePage() {
  // Reads the hourly snapshot (src/lib/snapshot) instead of querying Prisma
  // directly — this page used to run a raw SQL query across every service on
  // every ISR regeneration, which is most of why the DB never slept.
  const snapshot = await getIndexSnapshot();
  const services = snapshot?.services ?? [];
  const incidents = (snapshot?.recentIncidents ?? []).map((inc) => ({
    ...inc,
    status: inc.status as IncidentStatus,
    severity: inc.severity as IncidentSeverity,
    startedAt: new Date(inc.startedAt),
    resolvedAt: inc.resolvedAt ? new Date(inc.resolvedAt) : null,
  }));

  const counts = {
    operational: services.filter((s) => s.status === "OPERATIONAL").length,
    degraded: services.filter((s) => s.status === "DEGRADED").length,
    outage: services.filter((s) => s.status === "OUTAGE").length,
    total: services.length,
  };
  const limited = counts.total - counts.operational - counts.degraded - counts.outage;
  const officialApiCount = services.filter((s) => s.badgeType === "STATUS_PAGE_SYNC").length;

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
        limited={limited}
        total={counts.total}
        officialApiCount={officialApiCount}
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
            background: 'rgba(79,70,229,0.05)',
            border: '1px solid rgba(79,70,229,0.18)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: '#312E81',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>AI Reliability Index</span>
            <span style={{ fontSize: '13px', color: '#4F46E5', marginLeft: '8px' }}>
              Deep-dive reliability data for the 50 most-tracked AI services — from 800+ monitored
            </span>
          </div>
          <span style={{ fontSize: '13px', color: '#4F46E5', flexShrink: 0 }}>View →</span>
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
