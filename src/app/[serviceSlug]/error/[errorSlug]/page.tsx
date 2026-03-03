import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { calculateWorstStatus, formatDate, formatCategoryLabel } from "@/lib/utils";
import Link from "next/link";
import { getErrorsForCategory, getErrorInfo, getServiceLinks, getRelevantReportTypes } from "@/lib/error-playbooks";
import { BackToServiceButton } from "@/components/ui/BackToServiceButton";

export const revalidate = 60;

export async function generateStaticParams() {
  // Generate pages for each service × their category's errors
  const services = await prisma.service.findMany({
    select: { slug: true, category: true },
  });

  const params: { serviceSlug: string; errorSlug: string }[] = [];

  for (const service of services) {
    const errors = getErrorsForCategory(service.category);
    for (const error of errors) {
      params.push({ serviceSlug: service.slug, errorSlug: error.slug });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string; errorSlug: string }>;
}): Promise<Metadata> {
  const { serviceSlug, errorSlug } = await params;

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
  });

  if (!service) return {};

  const errorInfo = getErrorInfo(service.category, errorSlug);
  if (!errorInfo) return {};

  const title = `${service.name}: ${errorInfo.metaTitle} | DownForAI`;
  const description = `${service.name} ${errorInfo.title}? Check live status, troubleshooting steps, and community reports.`;

  // Noindex if no activity (0 reports in 28 days AND 0 incidents in 90 days)
  const recentReports = await prisma.communityReport.count({
    where: {
      serviceId: service.id,
      createdAt: { gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
    },
  });

  const recentIncidents = await prisma.incident.count({
    where: {
      serviceId: service.id,
      startedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
  });

  const shouldIndex = recentReports > 0 || recentIncidents > 0;

  return {
    title,
    description,
    alternates: {
      canonical: `/${serviceSlug}/error/${errorSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://downforai.com/${serviceSlug}/error/${errorSlug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
    },
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

async function getServiceErrorData(slug: string, errorSlug: string) {
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      surfaces: {
        include: {
          observations: {
            orderBy: { observedAt: "desc" },
            take: 96, // 24h
          },
        },
      },
      incidents: {
        where: { status: { in: ["OPEN", "MONITORING", "RESOLVED"] } },
        orderBy: { startedAt: "desc" },
        take: 5,
      },
    },
  });

  if (!service) return null;

  const latestObservations = service.surfaces
    .flatMap((s) => s.observations)
    .sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());

  const statuses = latestObservations.map((o) => o.status).filter((s) => s !== "UNKNOWN");
  const overallStatus = statuses.length > 0 ? calculateWorstStatus(statuses) : "UNKNOWN";

  // Get relevant report types for this error
  const relevantTypes = getRelevantReportTypes(errorSlug);

  // Reports in last 24h (FILTERED by relevant types)
  const reportsLast24h = await prisma.communityReport.count({
    where: {
      serviceId: service.id,
      reportType: { in: relevantTypes },
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  // Report breakdown by type (last 24h - ALL types for context)
  const reportsByType = await prisma.communityReport.groupBy({
    by: ["reportType"],
    where: {
      serviceId: service.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    _count: { reportType: true },
  });

  const reportTypeDistribution = reportsByType.reduce((acc, r) => {
    acc[r.reportType] = r._count.reportType;
    return acc;
  }, {} as Record<string, number>);

  // Latest comments filtered by relevant report types (last 7 days)
  const relevantComments = await prisma.communityReport.findMany({
    where: {
      serviceId: service.id,
      reportType: { in: relevantTypes },
      comment: { not: null },
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: {
      surface: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Filter comments >= 10 chars
  const filteredComments = relevantComments.filter((r) => r.comment && r.comment.length >= 10);

  const latestObs = latestObservations[0];

  return {
    service,
    overallStatus,
    reportsLast24h,
    reportTypeDistribution,
    latestObs,
    relevantTypes,
    relevantComments: filteredComments,
  };
}

const statusColors: Record<string, { color: string; bg: string; label: string }> = {
  OPERATIONAL: { color: "#16a34a", bg: "#f0fdf4", label: "Operational" },
  DEGRADED: { color: "#ca8a04", bg: "#fefce8", label: "Degraded" },
  OUTAGE: { color: "#dc2626", bg: "#fef2f2", label: "Major Outage" },
  UNKNOWN: { color: "#737373", bg: "#f5f5f5", label: "Checking..." },
};

// Report type icons and labels
const reportTypeInfo: Record<string, { icon: string; label: string }> = {
  DOWN: { icon: "🔴", label: "Down" },
  SLOW: { icon: "🐢", label: "Slow" },
  LOGIN: { icon: "🔐", label: "Login" },
  API_ERROR: { icon: "⚡", label: "API Error" },
  OTHER: { icon: "❓", label: "Other" },
};

// Country code to flag emoji
function getCountryFlag(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Relative time formatter
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function ServiceErrorPage({
  params,
}: {
  params: Promise<{ serviceSlug: string; errorSlug: string }>;
}) {
  const { serviceSlug, errorSlug } = await params;

  const data = await getServiceErrorData(serviceSlug, errorSlug);
  if (!data) notFound();

  const { service, overallStatus, reportsLast24h, reportTypeDistribution, latestObs, relevantTypes, relevantComments } = data;

  const errorInfo = getErrorInfo(service.category, errorSlug);
  if (!errorInfo) notFound();

  const sc = statusColors[overallStatus] || statusColors.UNKNOWN;
  const serviceLinks = getServiceLinks(serviceSlug);

  // Replace {service} placeholder in all text
  const replaceService = (text: string) => text.replace(/{service}/g, service.name);

  const latestIncident = service.incidents[0];

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
      {
        "@type": "ListItem",
        position: 2,
        name: formatCategoryLabel(service.category),
        item: `https://downforai.com/category/${service.category.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.name,
        item: `https://downforai.com/${serviceSlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: errorInfo.title,
        item: `https://downforai.com/${serviceSlug}/error/${errorSlug}`,
      },
    ],
  };

  // FAQPage JSON-LD
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: errorInfo.faq.map((faqItem) => ({
      "@type": "Question",
      name: replaceService(faqItem.q),
      acceptedAnswer: {
        "@type": "Answer",
        text: replaceService(faqItem.a),
      },
    })),
  };

  // HowTo JSON-LD (only if hasHowToSchema)
  const howToJsonLd = errorInfo.hasHowToSchema
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to fix ${service.name} ${errorInfo.title}`,
        step: errorInfo.fixSteps.map((step, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          name: `Step ${idx + 1}`,
          text: replaceService(step),
        })),
      }
    : null;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}

      {/* 1. Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a3a3a3", marginBottom: "16px" }}>
        <Link href="/" style={{ color: "#a3a3a3", textDecoration: "none" }}>
          Home
        </Link>
        <span>/</span>
        <Link href={`/category/${service.category.toLowerCase()}`} style={{ color: "#a3a3a3", textDecoration: "none" }}>
          {formatCategoryLabel(service.category)}
        </Link>
        <span>/</span>
        <Link href={`/${service.slug}`} style={{ color: "#a3a3a3", textDecoration: "none" }}>
          {service.name}
        </Link>
        <span>/</span>
        <span style={{ color: "#525252" }}>{errorInfo.title}</span>
      </nav>

      {/* Quick access back to service page */}
      <BackToServiceButton href={`/${service.slug}`} serviceName={service.name} />

      {/* 2. H1 */}
      <h1
        style={{
          fontSize: "36px",
          fontWeight: 800,
          color: "#171717",
          letterSpacing: "-1.5px",
          marginBottom: "24px",
          lineHeight: 1.1,
        }}
      >
        {service.name}: {errorInfo.title}
      </h1>

      {/* 3. TL;DR Status Block */}
      <div
        style={{
          background: sc.bg,
          border: `2px solid ${sc.color}40`,
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: sc.color,
              boxShadow: overallStatus !== "OPERATIONAL" ? `0 0 10px ${sc.color}60` : "none",
            }}
          />
          <div style={{ fontSize: "18px", fontWeight: 700, color: sc.color }}>
            Current Status: {sc.label}
          </div>
        </div>
        {latestObs && (
          <div style={{ fontSize: "13px", color: "#525252", marginBottom: "8px" }}>
            Last checked: {formatDate(latestObs.observedAt)}
          </div>
        )}
        {reportsLast24h > 0 && (
          <div
            style={{
              display: "inline-block",
              fontSize: "13px",
              color: sc.color,
              background: "#ffffff",
              padding: "8px 16px",
              borderRadius: "10px",
              border: `1px solid ${sc.color}30`,
            }}
          >
            👥 {reportsLast24h} report{reportsLast24h > 1 ? "s" : ""} in last 24h
          </div>
        )}
      </div>

      {/* 4. "What We're Seeing Right Now" */}
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>
          What We're Seeing Right Now
        </h2>
        <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.7 }}>
          {reportsLast24h > 0 ? (
            <>
              In the last 24 hours, {service.name} received <strong>{reportsLast24h}</strong>{" "}
              {relevantTypes.length > 1
                ? `report${reportsLast24h > 1 ? "s" : ""} related to this issue (${relevantTypes.map((t) => reportTypeInfo[t]?.label || t).join(", ")})`
                : `${reportTypeInfo[relevantTypes[0]]?.label.toLowerCase() || "related"} report${reportsLast24h > 1 ? "s" : ""}`
              }.{" "}
              {latestIncident && (
                <>
                  The latest incident was <strong>"{latestIncident.title}"</strong>, {latestIncident.status} {formatDate(latestIncident.startedAt)}.
                </>
              )}
            </>
          ) : (
            <>
              No recent issues reported. If you're experiencing problems with {service.name}, report below to help the community.
            </>
          )}
        </div>
      </div>

      {/* Report Type Breakdown */}
      {Object.keys(reportTypeDistribution).length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            {service.name} Reports (last 24h)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(["DOWN", "SLOW", "API_ERROR", "LOGIN", "OTHER"] as const).map((type) => {
              const count = reportTypeDistribution[type] || 0;
              if (count === 0) return null;
              const info = reportTypeInfo[type];
              const isRelevant = relevantTypes.includes(type);

              return (
                <div
                  key={type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: isRelevant ? "#eff6ff" : "#fafafa",
                    border: isRelevant ? "1px solid #bfdbfe" : "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{info.icon}</span>
                    <span style={{ fontSize: "14px", fontWeight: isRelevant ? 600 : 500, color: isRelevant ? "#1e40af" : "#171717" }}>
                      {info.label}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: isRelevant ? 600 : 500, color: isRelevant ? "#1e40af" : "#6b7280" }}>
                    {count} {isRelevant && "← this page"}
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: "1px solid #e5e5e5", fontSize: "13px", color: "#6b7280", textAlign: "right" }}>
              Total: {Object.values(reportTypeDistribution).reduce((sum, c) => sum + c, 0)} reports
            </div>
          </div>
        </div>
      )}

      {/* 5. "What is this error?" */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>
          What is this error?
        </h2>
        <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.7 }}>
          {replaceService(errorInfo.description)}
        </p>
      </div>

      {/* 6. Error Signatures */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>
          Error Signatures
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {errorInfo.errorSignatures.map((sig, idx) => (
            <code
              key={idx}
              style={{
                background: "#f5f5f5",
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "12px",
                fontFamily: "monospace",
                color: "#525252",
              }}
            >
              {sig}
            </code>
          ))}
        </div>
      </div>

      {/* 7. Common Causes */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
          Common Causes
        </h2>
        <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {errorInfo.causes.map((cause, idx) => (
            <li key={idx} style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6 }}>
              {replaceService(cause)}
            </li>
          ))}
        </ul>
      </div>

      {/* 8. How to Fix It */}
      <div
        style={{
          background: "#f0fdf4",
          border: "2px solid #bbf7d0",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#166534", marginBottom: "16px" }}>
          ✓ How to Fix It
        </h2>
        <ol style={{ margin: 0, paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {errorInfo.fixSteps.map((step, idx) => (
            <li key={idx} style={{ fontSize: "14px", color: "#14532d", lineHeight: 1.7, fontWeight: 500 }}>
              {replaceService(step)}
            </li>
          ))}
        </ol>

        {/* Service-specific links */}
        {Object.keys(serviceLinks).length > 0 && (
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#166534", marginBottom: "8px" }}>
              {service.name} Resources:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {serviceLinks.statusPage && (
                <a
                  href={serviceLinks.statusPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}
                >
                  Status Page →
                </a>
              )}
              {serviceLinks.documentation && (
                <a
                  href={serviceLinks.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}
                >
                  Documentation →
                </a>
              )}
              {serviceLinks.dashboard && (
                <a
                  href={serviceLinks.dashboard}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}
                >
                  Dashboard →
                </a>
              )}
              {serviceLinks.usagePage && (
                <a
                  href={serviceLinks.usagePage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}
                >
                  Usage →
                </a>
              )}
              {serviceLinks.supportPage && (
                <a
                  href={serviceLinks.supportPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}
                >
                  Support →
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 9. Live Signals */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
          Live Signals
        </h2>

        {/* Surface Status */}
        {service.surfaces.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "8px" }}>
              Service Components
            </div>
            {service.surfaces.map((surface) => {
              const lastObs = surface.observations[0];
              const surfaceStatus = lastObs?.status || "UNKNOWN";
              const surfaceSc = statusColors[surfaceStatus] || statusColors.UNKNOWN;
              return (
                <div
                  key={surface.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: surfaceSc.color,
                      }}
                    />
                    <span style={{ fontSize: "13px", color: "#171717" }}>{surface.displayName}</span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: surfaceSc.color }}>
                    {surfaceSc.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Report Distribution */}
        {reportsLast24h > 0 && (
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "8px" }}>
              Report Breakdown (24h)
            </div>
            <div
              style={{
                display: "flex",
                height: "8px",
                borderRadius: "4px",
                overflow: "hidden",
                background: "#f3f4f6",
                marginBottom: "8px",
              }}
            >
              {Object.entries(reportTypeDistribution).map(([type, count]) => {
                const percentage = (count / reportsLast24h) * 100;
                const colors: Record<string, string> = {
                  DOWN: "#dc2626",
                  SLOW: "#ca8a04",
                  LOGIN: "#2563eb",
                  API_ERROR: "#9333ea",
                  OTHER: "#6b7280",
                };
                return (
                  <div
                    key={type}
                    style={{
                      width: `${percentage}%`,
                      background: colors[type] || "#6b7280",
                    }}
                    title={`${type}: ${count}`}
                  />
                );
              })}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "#6b7280" }}>
              {Object.entries(reportTypeDistribution).map(([type, count]) => (
                <div key={type}>
                  {type}: {count}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Reports */}
      {relevantComments.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            User Reports
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {relevantComments.map((report) => {
              const typeInfo = reportTypeInfo[report.reportType] || { icon: "❓", label: "Other" };
              const flag = getCountryFlag(report.countryCode);
              const timeAgo = getRelativeTime(report.createdAt);

              return (
                <div
                  key={report.id}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #f0f0f0",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", color: "#6b7280" }}>
                    <span>{typeInfo.icon}</span>
                    <span style={{ fontWeight: 600, color: "#171717" }}>{typeInfo.label}</span>
                    {report.surface?.displayName && (
                      <>
                        <span>·</span>
                        <span>{report.surface.displayName}</span>
                      </>
                    )}
                    {flag && (
                      <>
                        <span>·</span>
                        <span>{flag}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{timeAgo}</span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#171717", fontStyle: "italic", lineHeight: 1.5 }}>
                    &ldquo;{report.comment}&rdquo;
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 10. Recent Incidents */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
          Recent Incidents
        </h2>
        {service.incidents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px", color: "#a3a3a3", fontSize: "13px" }}>
            No incidents in the past 30 days
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {service.incidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #f0f0f0",
                  background: "#fafafa",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: inc.severity === "CRITICAL" || inc.severity === "MAJOR" ? "#dc2626" : "#ca8a04",
                      backgroundColor: inc.severity === "CRITICAL" || inc.severity === "MAJOR" ? "#fef2f2" : "#fefce8",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {inc.severity}
                  </span>
                  {inc.status === "RESOLVED" && (
                    <span style={{ fontSize: "11px", color: "#16a34a" }}>✓ Resolved</span>
                  )}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717" }}>{inc.title}</div>
                {inc.summary && (
                  <div style={{ fontSize: "12px", color: "#525252", marginTop: "4px" }}>{inc.summary}</div>
                )}
                <div style={{ fontSize: "11px", color: "#a3a3a3", marginTop: "6px" }}>
                  {formatDate(inc.startedAt)}
                  {inc.resolvedAt && ` → ${formatDate(inc.resolvedAt)}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 11. FAQ */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {errorInfo.faq.map((faqItem, idx) => (
            <div key={idx}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
                {replaceService(faqItem.q)}
              </div>
              <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6 }}>
                {replaceService(faqItem.a)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 12. Related Pages */}
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
          Related Pages
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            href={`/${service.slug}`}
            style={{
              fontSize: "14px",
              color: "#2563eb",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📊 {service.name} Status Dashboard
          </Link>
          <Link
            href={`/${service.slug}/down`}
            style={{
              fontSize: "14px",
              color: "#2563eb",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ❓ Is {service.name} Down?
          </Link>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
            Other {service.name} issues:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {getErrorsForCategory(service.category)
              .filter((e) => e.slug !== errorSlug)
              .map((error) => (
                <Link
                  key={error.slug}
                  href={`/${service.slug}/error/${error.slug}`}
                  style={{
                    fontSize: "12px",
                    color: "#2563eb",
                    textDecoration: "none",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "#ffffff",
                    border: "1px solid #e5e5e5",
                  }}
                >
                  {error.title}
                </Link>
              ))}
          </div>
          <Link
            href={`/category/${service.category.toLowerCase()}`}
            style={{
              fontSize: "14px",
              color: "#2563eb",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
            }}
          >
            🔍 All {formatCategoryLabel(service.category)} Services
          </Link>
        </div>
      </div>
    </div>
  );
}
