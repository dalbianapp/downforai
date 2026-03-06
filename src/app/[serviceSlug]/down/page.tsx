import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { calculateWorstStatus, formatDate, formatCategoryLabel } from "@/lib/utils";
import Link from "next/link";
import { TIER_1_2_SERVICES } from "@/lib/ai-symptoms";

export const revalidate = 60;

export async function generateStaticParams() {
  return TIER_1_2_SERVICES.map((slug) => ({ serviceSlug: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
  });

  if (!service) return {};

  const title = `Is ${service.name} Down Right Now? — Live Status Check | DownForAI`;
  const description = `Check if ${service.name} is down right now. Real-time status monitoring, uptime history, and incident reports for ${service.name}. Get instant answers about ${service.name} outages and service disruptions.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${serviceSlug}/down`,
    },
    openGraph: {
      title,
      description,
      url: `https://downforai.com/${serviceSlug}/down`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

async function getServiceStatus(slug: string) {
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      surfaces: {
        include: {
          observations: {
            orderBy: { observedAt: "desc" },
            take: 96, // 24h of data
          },
        },
      },
      incidents: {
        where: { status: { in: ["OPEN", "MONITORING"] } },
        orderBy: { startedAt: "desc" },
        take: 3,
      },
    },
  });

  if (!service) return null;

  const latestObservations = service.surfaces
    .flatMap((s) => s.observations)
    .sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());

  const latestObs = latestObservations[0];
  const statuses = latestObservations.map((o) => o.status).filter((s) => s !== "UNKNOWN");
  const overallStatus = statuses.length > 0 ? calculateWorstStatus(statuses) : "UNKNOWN";

  // Count reports in last 24h
  const reportsCount24h = await prisma.communityReport.count({
    where: {
      serviceId: service.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  return { service, overallStatus, latestObs, reportsCount24h };
}

const statusInfo: Record<string, { answer: string; color: string; bg: string; description: string }> = {
  OPERATIONAL: {
    answer: "NO",
    color: "#16a34a",
    bg: "#f0fdf4",
    description: "is currently operational and running normally. All systems appear to be functioning as expected.",
  },
  DEGRADED: {
    answer: "PARTIALLY",
    color: "#ca8a04",
    bg: "#fefce8",
    description: "is experiencing degraded performance. Some features may be slow or intermittently unavailable.",
  },
  OUTAGE: {
    answer: "YES",
    color: "#dc2626",
    bg: "#fef2f2",
    description: "is currently experiencing an outage. The service is unavailable or severely impacted.",
  },
  UNKNOWN: {
    answer: "UNKNOWN",
    color: "#737373",
    bg: "#f5f5f5",
    description: "status is currently unknown. We're checking the service now.",
  },
};

export default async function ServiceDownPage({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}) {
  const { serviceSlug } = await params;

  // Only allow Tier 1+2 services
  if (!TIER_1_2_SERVICES.includes(serviceSlug)) {
    notFound();
  }

  const data = await getServiceStatus(serviceSlug);
  if (!data) notFound();

  const { service, overallStatus, latestObs, reportsCount24h } = data;
  const info = statusInfo[overallStatus] || statusInfo.UNKNOWN;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" }}>
        <Link href="/" style={{ color: "#a3a3a3", textDecoration: "none" }}>
          Home
        </Link>
        <span>/</span>
        <Link href={`/${service.slug}`} style={{ color: "#a3a3a3", textDecoration: "none" }}>
          {service.name}
        </Link>
        <span>/</span>
        <span style={{ color: "#525252" }}>Is {service.name} Down?</span>
      </nav>

      {/* H1 */}
      <h1
        style={{
          fontSize: "40px",
          fontWeight: 800,
          color: "#171717",
          letterSpacing: "-2px",
          marginBottom: "16px",
          lineHeight: 1.1,
        }}
      >
        Is {service.name} Down Right Now?
      </h1>

      {/* Answer Card */}
      <div
        style={{
          background: info.bg,
          border: `2px solid ${info.color}40`,
          borderRadius: "20px",
          padding: "48px 32px",
          marginBottom: "32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "80px", fontWeight: 900, color: info.color, marginBottom: "16px", letterSpacing: "-3px" }}>
          {info.answer}
        </div>
        <div style={{ fontSize: "18px", color: "#525252", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto" }}>
          {service.name} {info.description}
        </div>
        {latestObs && (
          <div style={{ fontSize: "13px", color: "#a3a3a3", marginTop: "12px" }}>
            Last checked: {formatDate(latestObs.observedAt)}
          </div>
        )}
        {reportsCount24h > 0 && (
          <div
            style={{
              display: "inline-block",
              fontSize: "13px",
              color: info.color,
              background: "#ffffff",
              padding: "8px 16px",
              borderRadius: "10px",
              border: `1px solid ${info.color}30`,
              marginTop: "16px",
            }}
          >
            👥 {reportsCount24h} user{reportsCount24h > 1 ? "s" : ""} reported issues in the last 24h
          </div>
        )}
      </div>

      {/* Active Incidents */}
      {service.incidents.length > 0 && (
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
            Active Incidents
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {service.incidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626", marginBottom: "6px" }}>
                  {inc.title}
                </div>
                {inc.summary && (
                  <div style={{ fontSize: "13px", color: "#525252", marginBottom: "8px" }}>{inc.summary}</div>
                )}
                <div style={{ fontSize: "12px", color: "#a3a3a3" }}>Started: {formatDate(inc.startedAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>Quick Actions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            href={`/${service.slug}`}
            style={{
              display: "block",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e5e5",
              background: "#fafafa",
              textDecoration: "none",
              color: "#171717",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
              📊 View Detailed Status & Uptime
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>See latency charts, uptime history, and more</div>
          </Link>
          <Link
            href={`/${service.slug}#report-section`}
            style={{
              display: "block",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e5e5",
              background: "#fafafa",
              textDecoration: "none",
              color: "#171717",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>⚠️ Report an Issue</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Help others by reporting problems you're experiencing
            </div>
          </Link>
          {service.websiteUrl && (
            <a
              href={service.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e5e5e5",
                background: "#fafafa",
                textDecoration: "none",
                color: "#171717",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
                🌐 Visit {service.name} Website
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Go to the official website</div>
            </a>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
              How do I know if {service.name} is down for everyone or just me?
            </div>
            <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6 }}>
              Check the status on this page and look at community reports. If many users are reporting issues, it's
              likely a widespread outage. If not, the problem may be on your end (network, browser, account).
            </div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
              What should I do if {service.name} is down?
            </div>
            <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6 }}>
              First, check this status page for updates. Try refreshing the page, clearing your cache, or using a
              different browser. If the service is experiencing an outage, wait for it to be resolved. You can report
              the issue to help other users stay informed.
            </div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
              How often is this status updated?
            </div>
            <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6 }}>
              We check {service.name} every 15 minutes with automated monitoring. Community reports are reflected in
              real-time. This page is refreshed every 60 seconds to show you the latest information.
            </div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
              What category is {service.name}?
            </div>
            <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6 }}>
              {service.name} is in the{" "}
              <Link href={`/category/${service.category.toLowerCase()}`} style={{ color: "#2563eb" }}>
                {formatCategoryLabel(service.category)}
              </Link>{" "}
              category. {service.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
