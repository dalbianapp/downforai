import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { calculateWorstStatus, formatDate, formatCategoryLabel } from "@/lib/utils";
import Link from "next/link";
import { TIER_1_SERVICES, getSymptomInfo, getSymptomsForCategory } from "@/lib/ai-symptoms";

export const revalidate = 60;

export async function generateStaticParams() {
  // Get all services from database to match slugs with categories
  const services = await prisma.service.findMany({
    where: { slug: { in: TIER_1_SERVICES } },
    select: { slug: true, category: true },
  });

  const params: { serviceSlug: string; symptom: string }[] = [];

  for (const service of services) {
    const symptoms = getSymptomsForCategory(service.category);
    for (const symptom of symptoms) {
      params.push({ serviceSlug: service.slug, symptom });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string; symptom: string }>;
}): Promise<Metadata> {
  const { serviceSlug, symptom } = await params;
  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
  });

  if (!service) return {};

  const symptomInfo = getSymptomInfo(symptom);
  if (!symptomInfo) return {};

  const title = `${service.name} ${symptomInfo.title}? Check Status & Solutions | DownForAI`;
  const description = `Experiencing ${symptomInfo.title.toLowerCase()} with ${service.name}? ${symptomInfo.description} Get real-time status updates, common causes, and step-by-step solutions.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${serviceSlug}/${symptom}`,
    },
    openGraph: {
      title,
      description,
      url: `https://downforai.com/${serviceSlug}/${symptom}`,
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

const statusInfo: Record<string, { color: string; bg: string; label: string }> = {
  OPERATIONAL: { color: "#16a34a", bg: "#f0fdf4", label: "Operational" },
  DEGRADED: { color: "#ca8a04", bg: "#fefce8", label: "Degraded Performance" },
  OUTAGE: { color: "#dc2626", bg: "#fef2f2", label: "Service Outage" },
  UNKNOWN: { color: "#737373", bg: "#f5f5f5", label: "Status Unknown" },
};

export default async function SymptomPage({
  params,
}: {
  params: Promise<{ serviceSlug: string; symptom: string }>;
}) {
  const { serviceSlug, symptom } = await params;

  // Only allow Tier 1 services
  if (!TIER_1_SERVICES.includes(serviceSlug)) {
    notFound();
  }

  const data = await getServiceStatus(serviceSlug);
  if (!data) notFound();

  const { service, overallStatus, latestObs, reportsCount24h } = data;

  // Verify symptom is valid for this service's category
  const validSymptoms = getSymptomsForCategory(service.category);
  if (!validSymptoms.includes(symptom)) {
    notFound();
  }

  const symptomInfo = getSymptomInfo(symptom);
  if (!symptomInfo) notFound();

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
        <span style={{ color: "#525252" }}>
          {symptomInfo.icon} {symptomInfo.title}
        </span>
      </nav>

      {/* H1 */}
      <h1
        style={{
          fontSize: "36px",
          fontWeight: 800,
          color: "#171717",
          letterSpacing: "-1.5px",
          marginBottom: "16px",
          lineHeight: 1.1,
        }}
      >
        {service.name} {symptomInfo.title}? Check Status & Solutions
      </h1>

      {/* Current Status Card */}
      <div
        style={{
          background: info.bg,
          border: `2px solid ${info.color}40`,
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
              backgroundColor: info.color,
              boxShadow: overallStatus !== "OPERATIONAL" ? `0 0 10px ${info.color}60` : "none",
            }}
          />
          <div style={{ fontSize: "18px", fontWeight: 700, color: info.color }}>
            Current Status: {info.label}
          </div>
        </div>
        {latestObs && (
          <div style={{ fontSize: "13px", color: "#525252" }}>
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
              marginTop: "12px",
            }}
          >
            👥 {reportsCount24h} user{reportsCount24h > 1 ? "s" : ""} reported issues in the last 24h
          </div>
        )}
      </div>

      {/* Problem Description */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div style={{ fontSize: "24px", marginBottom: "12px" }}>{symptomInfo.icon}</div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>
          What is "{symptomInfo.title}"?
        </h2>
        <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6 }}>
          {symptomInfo.description}
        </p>
      </div>

      {/* Active Incidents */}
      {service.incidents.length > 0 && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#dc2626", marginBottom: "16px" }}>
            ⚠️ Active Incidents
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {service.incidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  border: "1px solid #fecaca",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
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

      {/* Common Causes */}
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
          {symptomInfo.commonCauses.map((cause, idx) => (
            <li key={idx} style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6 }}>
              {cause}
            </li>
          ))}
        </ul>
      </div>

      {/* Solutions */}
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#166534", marginBottom: "16px" }}>
          ✓ How to Fix It
        </h2>
        <ol style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {symptomInfo.solutions.map((solution, idx) => (
            <li key={idx} style={{ fontSize: "14px", color: "#14532d", lineHeight: 1.6, fontWeight: 500 }}>
              {solution}
            </li>
          ))}
        </ol>
      </div>

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
              📊 View Full Status Dashboard
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>See latency charts, uptime, and incident history</div>
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
            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>⚠️ Report This Issue</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Help others by confirming you're experiencing this problem
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
                🌐 Visit {service.name} Official Status
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Check the provider's own status page</div>
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
              Why is {service.name} experiencing {symptomInfo.title.toLowerCase()}?
            </div>
            <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6 }}>
              There can be multiple reasons. Common causes include {symptomInfo.commonCauses[0]?.toLowerCase()}, {symptomInfo.commonCauses[1]?.toLowerCase()}, and other infrastructure or configuration issues. Check the "Common Causes" section above for a complete list.
            </div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
              How long does it typically take to resolve?
            </div>
            <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6 }}>
              Resolution time varies depending on the root cause. Minor issues may resolve in minutes, while major outages or infrastructure problems can take hours. Check this page regularly for status updates, or view the{" "}
              <Link href={`/${service.slug}`} style={{ color: "#2563eb" }}>
                full status dashboard
              </Link>{" "}
              for historical incident duration data.
            </div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
              Is this problem affecting everyone or just me?
            </div>
            <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6 }}>
              Check the community reports counter at the top of this page. If many users are reporting issues, it's likely a widespread problem. If report numbers are low, the issue might be specific to your network, account, or configuration.
            </div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
              What other {formatCategoryLabel(service.category)} services can I use?
            </div>
            <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6 }}>
              Browse our{" "}
              <Link href={`/category/${service.category.toLowerCase()}`} style={{ color: "#2563eb" }}>
                {formatCategoryLabel(service.category)} category
              </Link>{" "}
              to see alternative services with their current status. We monitor dozens of AI tools to help you find working alternatives when you need them.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
