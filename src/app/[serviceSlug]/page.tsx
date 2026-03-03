import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { generateWebApplicationJsonLd } from "@/lib/seo";
import { calculateWorstStatus, formatDate } from "@/lib/utils";
import dynamic from "next/dynamic";
import { QuickReport } from "@/components/status/QuickReport";
import { InteractiveLink } from "@/components/ui/InteractiveLink";
import { getErrorsForCategory } from "@/lib/error-playbooks";
import { UptimeBarWithHours } from "@/components/status/UptimeBar";

const LatencyChart = dynamic(
  () => import("@/components/status/LatencyChart").then((mod) => ({ default: mod.LatencyChart }))
);

const WorldReportMap = dynamic(
  () => import("@/components/status/WorldReportMap").then((mod) => ({ default: mod.WorldReportMap }))
);

export const revalidate = 60;

export async function generateStaticParams() {
  const services = await prisma.service.findMany({ select: { slug: true } });
  return services.map((s) => ({ serviceSlug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = await prisma.service.findUnique({ where: { slug: serviceSlug } });
  if (!service) return {};
  return {
    title: `${service.name} Status — Is ${service.name} Down? | DownForAI`,
    description: `Real-time ${service.name} status. Check if ${service.name} is down right now. Live monitoring, uptime history, and incident reports.`,
    alternates: {
      canonical: `/${serviceSlug}`,
    },
    openGraph: {
      title: `${service.name} Status — Is ${service.name} Down?`,
      description: `Real-time ${service.name} status monitoring.`,
      url: `https://downforai.com/${serviceSlug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Is ${service.name} Down? — DownForAI`,
    },
  };
}

async function getServiceDetails(slug: string) {
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      surfaces: {
        include: {
          observations: {
            orderBy: { observedAt: "desc" },
            take: 192,
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

  const surfaceStatuses = service.surfaces.map((surface) => {
    const lastObs = surface.observations[0];
    return {
      displayName: surface.displayName,
      status: lastObs?.status || "UNKNOWN",
      latencyMs: lastObs?.latencyMs || null,
    };
  });

  const reportsCount24h = await prisma.communityReport.count({
    where: {
      serviceId: service.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  // Latest community reports with comments (min 10 chars)
  const latestReports = await prisma.communityReport.findMany({
    where: {
      serviceId: service.id,
      comment: { not: null },
    },
    include: {
      surface: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Filter reports with comments >= 10 chars
  const filteredReports = latestReports.filter((r) => r.comment && r.comment.length >= 10);

  // Reports grouped by surface (last 24h)
  const reportsBySurface = await prisma.communityReport.groupBy({
    by: ["surfaceId"],
    where: {
      serviceId: service.id,
      surfaceId: { not: null },
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    _count: { surfaceId: true },
    orderBy: { _count: { surfaceId: "desc" } },
  });

  // Map surface names from already-loaded service.surfaces (NO extra DB queries)
  const surfaceNameMap = new Map(
    service.surfaces.map((s) => [s.id, s.displayName])
  );

  const surfaceBreakdown = reportsBySurface.map((r) => ({
    surfaceName: surfaceNameMap.get(r.surfaceId!) || "Unknown",
    count: r._count.surfaceId,
  }));

  const latestObs = service.surfaces
    .flatMap((s) => s.observations)
    .sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime())[0];

  return { service, surfaceStatuses, reportsCount24h, latestObs, latestCommunityReports: filteredReports, surfaceBreakdown };
}

// Helper couleurs
const statusColors: Record<string, { color: string; bg: string; border: string; label: string }> = {
  OPERATIONAL: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Operational" },
  DEGRADED: { color: "#ca8a04", bg: "#fefce8", border: "#fef08a", label: "Degraded" },
  OUTAGE: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "Major Outage" },
  UNKNOWN: { color: "#737373", bg: "#f5f5f5", border: "#e5e5e5", label: "Checking..." },
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

export default async function ServicePage({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}) {
  const { serviceSlug } = await params;
  const data = await getServiceDetails(serviceSlug);
  if (!data) notFound();

  const { service, surfaceStatuses, reportsCount24h, latestObs, latestCommunityReports, surfaceBreakdown } = data;

  const statuses = service.surfaces
    .flatMap((s) => s.observations.map((o) => o.status))
    .filter((s) => s !== "UNKNOWN");
  const overallStatus = statuses.length > 0 ? calculateWorstStatus(statuses) : "UNKNOWN";
  const sc = statusColors[overallStatus] || statusColors.UNKNOWN;

  const jsonLd = generateWebApplicationJsonLd(service.name, service.websiteUrl || "");

  // Uptime data pour la barre
  const uptimeSlots: { status: string; time: Date }[] = [];
  const allObs = service.surfaces.flatMap((s) => s.observations).sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime());
  // Diviser en 48 slots (30 min chacun sur 24h)
  const now = Date.now();
  for (let i = 47; i >= 0; i--) {
    const slotStart = now - (i + 1) * 30 * 60 * 1000;
    const slotEnd = now - i * 30 * 60 * 1000;
    const slotObs = allObs.filter((o) => o.observedAt.getTime() >= slotStart && o.observedAt.getTime() < slotEnd);

    let status = "UNKNOWN";
    if (slotObs.length > 0) {
      if (slotObs.some((o) => o.status === "OUTAGE")) {
        status = "OUTAGE";
      } else if (slotObs.some((o) => o.status === "DEGRADED")) {
        status = "DEGRADED";
      } else {
        status = "OPERATIONAL";
      }
    }

    uptimeSlots.push({ status, time: new Date(slotStart) });
  }

  const uptimePercent = Math.round((uptimeSlots.filter((s) => s.status === "OPERATIONAL").length / uptimeSlots.length) * 100);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" }}>
        <InteractiveLink href="/">Home</InteractiveLink>
        <span>/</span>
        <InteractiveLink href={`/category/${service.category.toLowerCase()}`}>
          {service.category}
        </InteractiveLink>
        <span>/</span>
        <span style={{ color: "#525252" }}>{service.name}</span>
      </nav>

      {/* H1 */}
      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", letterSpacing: "-1.5px", marginBottom: "24px", lineHeight: 1.2 }}>
        {service.name} Status — Is {service.name} Down?
      </h1>

      {/* Status Card */}
      <div
        style={{
          background: sc.bg,
          border: `1px solid ${sc.border}`,
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: sc.color,
              boxShadow: overallStatus !== "OPERATIONAL" ? `0 0 8px ${sc.color}40` : "none",
            }}
          />
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: sc.color }}>{sc.label}</div>
            {latestObs && (
              <div style={{ fontSize: "12px", color: "#a3a3a3", marginTop: "2px" }}>
                Last checked: {formatDate(latestObs.observedAt)}
              </div>
            )}
          </div>
        </div>
        {reportsCount24h > 0 && (
          <div style={{ fontSize: "12px", color: "#525252", background: "#ffffff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e5e5" }}>
            👥 {reportsCount24h} report{reportsCount24h > 1 ? "s" : ""} in 24h
          </div>
        )}
      </div>

      {/* Quick Report Section - Positioned high for visibility */}
      <QuickReport
        serviceSlug={service.slug}
        serviceName={service.name}
        initialCount={reportsCount24h}
        surfaces={service.surfaces.map((s) => ({ id: s.id, displayName: s.displayName }))}
      />

      {/* Surfaces Table */}
      {surfaceStatuses.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", marginBottom: "24px", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", margin: 0 }}>Service Status</h2>
          </div>
          {surfaceStatuses.map((surface, idx) => {
            const ssc = statusColors[surface.status] || statusColors.UNKNOWN;
            return (
              <div
                key={surface.displayName}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  borderBottom: idx < surfaceStatuses.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: ssc.color }} />
                  <span style={{ fontSize: "14px", color: "#171717" }}>{surface.displayName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: ssc.color }}>{ssc.label}</span>
                  <span style={{ fontSize: "12px", color: "#a3a3a3", fontFamily: "monospace" }}>
                    {surface.latencyMs ? `${surface.latencyMs}ms` : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Uptime Bar */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", margin: 0 }}>24-Hour Uptime</h2>
          <span style={{ fontSize: "14px", fontWeight: 700, color: uptimePercent >= 99 ? "#16a34a" : uptimePercent >= 90 ? "#ca8a04" : "#dc2626" }}>{uptimePercent}%</span>
        </div>
        <UptimeBarWithHours slots={uptimeSlots} uptimePercent={uptimePercent} />
      </div>

      {/* Latency Chart */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>Latency (24h)</h2>
        <LatencyChart observations={service.surfaces.flatMap((s) => s.observations).slice(0, 192)} />
      </div>

      {/* Recent Incidents */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>Recent Incidents</h2>
        {service.incidents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px", color: "#a3a3a3", fontSize: "13px" }}>
            No incidents in the past 30 days
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {service.incidents.map((inc) => {
              const sevColor = inc.severity === "CRITICAL" ? "#dc2626" : inc.severity === "MAJOR" ? "#dc2626" : "#ca8a04";
              const sevBg = inc.severity === "CRITICAL" ? "#fef2f2" : inc.severity === "MAJOR" ? "#fef2f2" : "#fefce8";
              return (
                <div key={inc.id} style={{ padding: "12px 16px", borderRadius: "10px", border: "1px solid #f0f0f0", background: "#fafafa" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: sevColor, backgroundColor: sevBg, padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>
                      {inc.severity}
                    </span>
                    {inc.status === "RESOLVED" && (
                      <span style={{ fontSize: "11px", color: "#16a34a" }}>✓ Resolved</span>
                    )}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717" }}>{inc.title}</div>
                  {inc.summary && <div style={{ fontSize: "12px", color: "#525252", marginTop: "4px" }}>{inc.summary}</div>}
                  <div style={{ fontSize: "11px", color: "#a3a3a3", marginTop: "6px" }}>
                    {formatDate(inc.startedAt)}
                    {inc.resolvedAt && ` → ${formatDate(inc.resolvedAt)}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Most Affected Components */}
      {surfaceBreakdown.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            Most Affected Components (24h)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {surfaceBreakdown.map((item, idx) => {
              const maxCount = surfaceBreakdown[0].count;
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ minWidth: "120px", fontSize: "13px", color: "#171717", fontWeight: 500 }}>
                    {item.surfaceName}
                  </div>
                  <div style={{ flex: 1, background: "#f3f4f6", borderRadius: "4px", height: "24px", position: "relative", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: "#2563eb",
                        borderRadius: "4px",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <div style={{ minWidth: "80px", fontSize: "13px", color: "#6b7280", textAlign: "right" }}>
                    {item.count} report{item.count > 1 ? "s" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Community Reports */}
      {latestCommunityReports.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            Latest Community Reports
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {latestCommunityReports.map((report) => {
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

      {/* World Report Map */}
      <WorldReportMap serviceSlug={service.slug} />

      {/* Common Issues */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "20px", marginTop: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>Common Issues with {service.name}</h2>
        <p style={{ fontSize: "13px", color: "#737373", marginBottom: "16px", lineHeight: 1.5 }}>
          See detailed troubleshooting guides for the most common {service.name} errors:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {getErrorsForCategory(service.category).map((error) => (
            <div
              key={error.slug}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid #e5e5e5",
                background: "#fafafa",
                transition: "all 0.15s",
              }}
            >
              <InteractiveLink href={`/${service.slug}/error/${error.slug}`}>
                <div style={{ fontWeight: 600, marginBottom: "2px", fontSize: "14px" }}>{error.title}</div>
                <div style={{ fontSize: "12px", color: "#737373" }}>{error.description.replace(/{service}/g, service.name)}</div>
              </InteractiveLink>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "20px", marginTop: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>About {service.name}</h2>
        {service.description && (
          <p style={{ fontSize: "14px", color: "#525252", marginBottom: "12px", lineHeight: 1.6 }}>{service.description}</p>
        )}
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {service.websiteUrl && (
            <div>
              <div style={{ fontSize: "12px", color: "#a3a3a3", marginBottom: "4px" }}>Official Website</div>
              <a href={service.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}>
                Visit →
              </a>
            </div>
          )}
          <div>
            <div style={{ fontSize: "12px", color: "#a3a3a3", marginBottom: "4px" }}>Category</div>
            <a href={`/category/${service.category.toLowerCase()}`} style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}>
              {service.category}
            </a>
          </div>
        </div>
        {service.surfaces.length > 0 && (
          <div style={{ marginTop: "12px" }}>
            <div style={{ fontSize: "12px", color: "#a3a3a3", marginBottom: "6px" }}>Monitored Surfaces</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {service.surfaces.map((s) => (
                <span key={s.id} style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "6px", background: "#f5f5f5", color: "#525252", border: "1px solid #e5e5e5" }}>
                  {s.displayName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
