import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import dynamic from "next/dynamic";
import { truncateDescription } from "@/lib/seo";
import { getServiceDashboard } from "@/lib/service-page/getServiceDashboard";
import { getServiceBySlug, getReports24hCount, getLastResolvedIncident } from "@/lib/service-queries";
import { buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd } from "@/lib/service-page/structuredData";
import { InteractiveLink } from "@/components/ui/InteractiveLink";
import { StatusAndReport } from "@/components/status/StatusAndReport";
import { ReportBottomCard } from "@/components/status/ReportBottomCard";
import { CommentSection } from "@/components/status/CommentSection";
import AffiliateBlock from "@/components/affiliate/AffiliateBlock";

// Service page components
import ServiceHeroHeader from "@/components/service/ServiceHeroHeader";
import ServiceSignalStrip from "@/components/service/ServiceSignalStrip";
import SurfaceHealthGrid from "@/components/service/SurfaceHealthGrid";
import UptimeHeatStrip from "@/components/service/UptimeHeatStrip";
import LatencySparklinePanel from "@/components/service/LatencySparklinePanel";
import DiagnosisPanel from "@/components/service/DiagnosisPanel";
import IncidentTimelinePanel from "@/components/service/IncidentTimelinePanel";
import SymptomsPanel from "@/components/service/SymptomsPanel";
import CommunityEvidencePanel from "@/components/service/CommunityEvidencePanel";
import ErrorSignaturesPanel from "@/components/service/ErrorSignaturesPanel";
import ProviderSpecificPanel from "@/components/service/ProviderSpecificPanel";
import FallbackAlternativesPanel from "@/components/service/FallbackAlternativesPanel";
import MethodologyPanel from "@/components/service/MethodologyPanel";
import BadgeEmbed from "@/components/service/BadgeEmbed";
import { ReliabilitySummary } from "@/components/service/ReliabilitySummary";

const WorldReportMap = dynamic(
  () => import("@/components/status/WorldReportMap").then((mod) => ({ default: mod.WorldReportMap }))
);

export const revalidate = 300;

export async function generateStaticParams() {
  const services = await prisma.service.findMany({ select: { slug: true } });
  return services.map((s) => ({ serviceSlug: s.slug }));
}

function buildServiceTitle(serviceName: string, year: number, capability?: string | null): string {
  if (capability === "BLOCKED_FROM_PROBES") {
    const primary = `Is ${serviceName} Down? Status & User Reports ${year}`;
    const fallback = `${serviceName} Status & User Reports ${year}`;
    return primary.length <= 60 ? primary : fallback;
  }
  if (capability === "UNVERIFIABLE") {
    const primary = `Is ${serviceName} Down? Status Unconfirmed ${year}`;
    const fallback = `${serviceName} Status Unconfirmed ${year}`;
    return primary.length <= 60 ? primary : fallback;
  }
  const primary = `Is ${serviceName} Down Today? Live Status & Outages ${year}`;
  const fallback = `Is ${serviceName} Down? Live Status ${year}`;
  const shortFallback = `${serviceName} Status & Outages ${year}`;
  if (primary.length <= 60) return primary;
  if (fallback.length <= 60) return fallback;
  return shortFallback;
}

function buildServiceDescription(serviceName: string, reports24h: number, capability?: string | null): string {
  if (capability === "BLOCKED_FROM_PROBES") {
    return truncateDescription(
      `Is ${serviceName} down today? DownForAI cannot reliably verify this service from its probe network. See community reports and current availability notes.`
    );
  }
  if (capability === "UNVERIFIABLE") {
    return truncateDescription(
      `Is ${serviceName} down today? DownForAI cannot reliably reach this service from its monitoring infrastructure. Its current status remains unconfirmed.`
    );
  }
  const reportLabel = reports24h === 1 ? "report" : "reports";
  if (reports24h > 0) {
    return truncateDescription(
      `Is ${serviceName} down today? Check live status, latency, and outage reports. ${reports24h} community ${reportLabel} in the last 24 hours.`
    );
  }
  return truncateDescription(
    `Is ${serviceName} down today? Check live status, latency, and outage reports. Updated every ~75 minutes by DownForAI.`
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = await getServiceBySlug(serviceSlug);
  if (!service) return {};

  const reports24h = await getReports24hCount(service.id);

  const year = new Date().getFullYear();
  const title = buildServiceTitle(service.name, year, service.monitoringCapability);
  const description = buildServiceDescription(service.name, reports24h, service.monitoringCapability);

  return {
    title,
    description,
    alternates: {
      canonical: `/${serviceSlug}`,
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://downforai.com/${serviceSlug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}) {
  const { serviceSlug } = await params;
  const dashboard = await getServiceDashboard(serviceSlug);
  if (!dashboard) notFound();

  const { service, overallStatus, headline, diagnosis, surfaces, uptime24h, incidents30d, reportSummary, topContent } = dashboard;

  const lastIncident = await getLastResolvedIncident(service.id);

  // Derive props for StatusAndReport
  const mostRecent = surfaces.reduce<typeof surfaces[number] | null>((best, s) => {
    if (!s.lastObservedAt) return best;
    if (!best?.lastObservedAt) return s;
    return s.lastObservedAt > best.lastObservedAt ? s : best;
  }, null);
  const hasOpenIncident = incidents30d.some(
    (i) => i.status === "OPEN" || i.status === "MONITORING"
  );

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(service);
  const softwareAppJsonLd = buildSoftwareApplicationJsonLd(service, dashboard);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "#a3a3a3",
          marginBottom: "24px",
        }}
      >
        <InteractiveLink href="/">Home</InteractiveLink>
        <span>/</span>
        <InteractiveLink href={`/category/${service.category.toLowerCase().replace(/_/g, "-")}`}>
          {service.category.replace(/_/g, " ")}
        </InteractiveLink>
        <span>/</span>
        <span style={{ color: "#525252" }}>{service.name}</span>
      </nav>

      {/* Hero: H1 + status card + diagnosis badge + provider chips */}
      <ServiceHeroHeader
        service={service}
        overallStatus={overallStatus}
        headline={headline}
        diagnosis={diagnosis}
        surfaces={surfaces}
        reportSummary={reportSummary}
        topContent={topContent}
        lastIncidentDate={lastIncident?.startedAt ?? null}
      />

      {/* 4 KPI tiles */}
      <div style={{ marginTop: "24px" }}>
        <ServiceSignalStrip
          uptime24h={uptime24h}
          surfaces={surfaces}
          incidents30d={incidents30d}
        />
      </div>

      {/* Reliability synthesis — SSR prose, readable by crawlers */}
      <div style={{ marginTop: "24px" }}>
        <ReliabilitySummary
          service={service}
          overallStatus={overallStatus}
          diagnosis={diagnosis}
          surfaces={surfaces}
          uptime24h={uptime24h}
          incidents30d={incidents30d}
          reportSummary={reportSummary}
          lastIncident={lastIncident}
        />
      </div>

      {/* Status + report — 2-column layout */}
      <div style={{ marginTop: "24px" }}>
        <StatusAndReport
          serviceName={service.name}
          serviceSlug={service.slug}
          overallStatus={overallStatus}
          lastProbeAt={mostRecent?.lastObservedAt ?? null}
          lastProbeLatency={mostRecent?.latestLatencyMs ?? null}
          hasOpenIncident={hasOpenIncident}
          reportCount24h={reportSummary.total24h}
          surfaces={surfaces.map((s) => ({ id: s.surfaceId, displayName: s.displayName }))}
        />
      </div>

      {/* Surface health grid */}
      <div style={{ marginTop: "24px" }}>
        <SurfaceHealthGrid
          surfaces={surfaces}
          overallStatus={overallStatus}
          reports24hCount={reportSummary.total24h}
        />
      </div>

      {/* Uptime heat strip (client — fetches sparkline) */}
      <div style={{ marginTop: "24px" }}>
        <UptimeHeatStrip serviceId={service.id} uptime24h={uptime24h} />
      </div>

      {/* Latency sparkline (client — fetches sparkline) */}
      <div style={{ marginTop: "24px" }}>
        <LatencySparklinePanel serviceId={service.id} />
      </div>

      {/* Affiliate block */}
      <div style={{ marginTop: "24px" }}>
        <AffiliateBlock serviceName={service.name} category={service.category} />
      </div>

      {/* Diagnosis: "Is X down for everyone?" */}
      <div style={{ marginTop: "24px" }}>
        <DiagnosisPanel
          serviceName={service.name}
          diagnosis={diagnosis}
          surfaces={surfaces}
          reportSummary={reportSummary}
        />
      </div>

      {/* Incident timeline */}
      <div style={{ marginTop: "24px" }}>
        <IncidentTimelinePanel incidents={incidents30d} serviceSlug={service.slug} />
      </div>

      {/* World report map */}
      <div style={{ marginTop: "24px" }}>
        <WorldReportMap serviceSlug={service.slug} />
      </div>

      {/* Reported symptoms */}
      <div style={{ marginTop: "24px" }}>
        <SymptomsPanel reportSummary={reportSummary} serviceName={service.name} />
      </div>

      {/* Community reports */}
      <div style={{ marginTop: "24px" }}>
        <CommunityEvidencePanel recentComments={reportSummary.recentComments} />
      </div>

      {/* Known error signatures (client accordion) */}
      {topContent && topContent.knownFailurePatterns.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <ErrorSignaturesPanel patterns={topContent.knownFailurePatterns} />
        </div>
      )}

      {/* Provider-specific details */}
      {topContent && (
        <div style={{ marginTop: "24px" }}>
          <ProviderSpecificPanel topContent={topContent} />
        </div>
      )}

      {/* Fallback alternatives */}
      {topContent && topContent.fallbackAlternatives.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <FallbackAlternativesPanel topContent={topContent} />
        </div>
      )}

      {/* Methodology */}
      <div style={{ marginTop: "24px" }}>
        <MethodologyPanel />
      </div>

      {/* Badge embed */}
      <div style={{ marginTop: "24px" }}>
        <BadgeEmbed serviceSlug={service.slug} serviceName={service.name} />
      </div>

      {/* Comment section */}
      <div style={{ marginTop: "24px" }}>
        <CommentSection serviceSlug={service.slug} serviceName={service.name} />
      </div>

      {/* Bottom report CTA */}
      <div style={{ marginTop: "24px" }}>
        <ReportBottomCard serviceName={service.name} />
      </div>
    </div>
  );
}
