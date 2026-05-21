import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ServiceCategory } from "@prisma/client";
import { formatCategoryLabel } from "@/lib/utils";
import { TopOutagesFilters } from "./TopOutagesFilters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Top AI Outages — Most Reported AI Services Today | DownForAI",
  description:
    "Real-time ranking of the most reported AI services. See which AI tools are experiencing issues right now, based on community reports.",
  alternates: { canonical: "/top-outages" },
  robots: { index: true, follow: true },
};

const PERIODS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "90d": 90 * 24 * 60 * 60 * 1000,
} as const;
type Period = keyof typeof PERIODS;

const PERIOD_LABELS: Record<Period, string> = {
  "24h": "last 24 hours",
  "7d": "last 7 days",
  "30d": "last 30 days",
  "90d": "last 90 days",
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

type ReportedService = {
  id: string;
  name: string;
  slug: string;
  category: string;
  reportCount: number;
  currentStatus: string | null;
};

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "UNKNOWN";
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    OPERATIONAL: { bg: "#dcfce7", color: "#166534", label: "Operational" },
    DEGRADED: { bg: "#fef3c7", color: "#92400e", label: "Degraded" },
    OUTAGE: { bg: "#fee2e2", color: "#991b1b", label: "Outage" },
    UNKNOWN: { bg: "#f5f5f5", color: "#525252", label: "Unknown" },
  };
  const c = cfg[s] ?? cfg.UNKNOWN;
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      padding: "2px 8px",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: 600,
      whiteSpace: "nowrap" as const,
    }}>
      {c.label}
    </span>
  );
}

function getDisruptionConfig(score: number) {
  if (score < 2) return { label: "Stable", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
  if (score < 5) return { label: "Minor disruptions", color: "#ca8a04", bg: "#fefce8", border: "#fef08a" };
  if (score < 8) return { label: "Significant disruptions", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" };
  return { label: "Major crisis", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
}

async function getTopReports(period: Period, categoryFilter: string): Promise<ReportedService[]> {
  const dateFilter = new Date(Date.now() - PERIODS[period]);

  type RawRow = {
    id: string;
    name: string;
    slug: string;
    category: string;
    report_count: bigint | number;
    current_status: string | null;
  };

  const statusSubquery = `(
    SELECT o.status
    FROM "ServiceSurface" ss
    JOIN "Observation" o ON o."serviceSurfaceId" = ss.id
    WHERE ss."serviceId" = s.id AND ss."isEnabled" = true
      AND o."observedAt" >= NOW() - INTERVAL '6 hours'
    ORDER BY o."observedAt" DESC LIMIT 1
  )`;

  let rows: RawRow[];

  if (categoryFilter === "all") {
    rows = await prisma.$queryRaw<RawRow[]>`
      WITH rc AS (
        SELECT cr."serviceId", COUNT(*)::int AS report_count
        FROM "CommunityReport" cr
        WHERE cr."createdAt" >= ${dateFilter}
          AND cr."isSpam" = false
          AND cr."isVisible" = true
        GROUP BY cr."serviceId"
        ORDER BY report_count DESC
        LIMIT 20
      )
      SELECT s.id, s.name, s.slug, s.category, rc.report_count,
        (SELECT o.status FROM "ServiceSurface" ss
         JOIN "Observation" o ON o."serviceSurfaceId" = ss.id
         WHERE ss."serviceId" = s.id AND ss."isEnabled" = true
           AND o."observedAt" >= NOW() - INTERVAL '6 hours'
         ORDER BY o."observedAt" DESC LIMIT 1) AS current_status
      FROM rc JOIN "Service" s ON s.id = rc."serviceId"
      ORDER BY rc.report_count DESC
    `;
  } else {
    const categoryEnum = categoryFilter.toUpperCase().replace(/-/g, "_") as ServiceCategory;
    rows = await prisma.$queryRaw<RawRow[]>`
      WITH rc AS (
        SELECT cr."serviceId", COUNT(*)::int AS report_count
        FROM "CommunityReport" cr
        JOIN "Service" sv ON sv.id = cr."serviceId" AND sv.category = ${categoryEnum}::"ServiceCategory"
        WHERE cr."createdAt" >= ${dateFilter}
          AND cr."isSpam" = false
          AND cr."isVisible" = true
        GROUP BY cr."serviceId"
        ORDER BY report_count DESC
        LIMIT 20
      )
      SELECT s.id, s.name, s.slug, s.category, rc.report_count,
        (SELECT o.status FROM "ServiceSurface" ss
         JOIN "Observation" o ON o."serviceSurfaceId" = ss.id
         WHERE ss."serviceId" = s.id AND ss."isEnabled" = true
           AND o."observedAt" >= NOW() - INTERVAL '6 hours'
         ORDER BY o."observedAt" DESC LIMIT 1) AS current_status
      FROM rc JOIN "Service" s ON s.id = rc."serviceId"
      ORDER BY rc.report_count DESC
    `;
  }

  // Suppress unused variable warning for statusSubquery
  void statusSubquery;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category,
    reportCount: Number(r.report_count),
    currentStatus: r.current_status,
  }));
}

async function getDisruptionScore(): Promise<number> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [last2h, last30d] = await Promise.all([
    prisma.communityReport.count({
      where: { createdAt: { gte: twoHoursAgo }, isSpam: false, isVisible: true },
    }),
    prisma.communityReport.count({
      where: { createdAt: { gte: thirtyDaysAgo }, isSpam: false, isVisible: true },
    }),
  ]);

  const avg2h = last30d / 360; // 30 days × 24h / 2 = 360 two-hour windows
  const raw = avg2h > 0 ? (last2h / avg2h) * 5 : 0;
  return Math.min(10, Math.round(raw * 10) / 10);
}

export default async function TopOutagesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const period = (sp.period && sp.period in PERIODS ? sp.period : "24h") as Period;
  const categoryFilter = sp.category || "all";

  const [services, disruptionScore] = await Promise.all([
    getTopReports(period, categoryFilter),
    getDisruptionScore(),
  ]);

  const top3 = services.slice(0, 3);
  const rest = services.slice(3);
  const disruptionCfg = getDisruptionConfig(disruptionScore);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
      { "@type": "ListItem", position: 2, name: "Top Outages", item: "https://downforai.com/top-outages" },
    ],
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
        <a href="/" style={{ color: "#2563eb", textDecoration: "none" }}>Home</a>
        {" / "}
        <span>Top Outages</span>
      </nav>

      {/* Header */}
      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", marginBottom: "8px", letterSpacing: "-1px", lineHeight: 1.2 }}>
        Top AI Outages Right Now
      </h1>
      <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "24px", lineHeight: 1.6 }}>
        Ranking of the most reported AI services by users. Based on real-time community reports.
      </p>

      {/* AI Disruption Index */}
      <div style={{
        background: disruptionCfg.bg,
        border: `1px solid ${disruptionCfg.border}`,
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap" as const,
      }}>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: disruptionCfg.color, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "4px" }}>
            AI Disruption Index
          </div>
          <div style={{ fontSize: "13px", color: "#525252" }}>
            Reports in last 2h vs 30-day average
          </div>
        </div>
        <div style={{ textAlign: "right" as const }}>
          <div style={{ fontSize: "28px", fontWeight: 800, color: disruptionCfg.color, lineHeight: 1 }}>
            {disruptionScore.toFixed(1)}
            <span style={{ fontSize: "16px", fontWeight: 500 }}> / 10</span>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: disruptionCfg.color, marginTop: "2px" }}>
            {disruptionCfg.label}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
        <TopOutagesFilters currentPeriod={period} currentCategory={categoryFilter} />
      </div>

      {/* No results */}
      {services.length === 0 && (
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "12px",
          padding: "48px 32px",
          textAlign: "center" as const,
          marginBottom: "24px",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#166534", marginBottom: "8px" }}>
            No outages reported in this period
          </div>
          <div style={{ fontSize: "14px", color: "#16a34a" }}>
            The AI ecosystem is running smoothly.
          </div>
        </div>
      )}

      {/* Podium — top 3 */}
      {top3.length > 0 && (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" as const, marginBottom: "16px" }}>
          {top3.map((service, i) => (
            <div key={service.id} style={{
              flex: "1 1 200px",
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center" as const,
              boxShadow: i === 0 ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
            }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{RANK_MEDALS[i]}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#a3a3a3", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "6px" }}>
                {formatCategoryLabel(service.category)}
              </div>
              <a href={`/${service.slug}`} style={{ fontSize: "15px", fontWeight: 700, color: "#171717", textDecoration: "none", display: "block", marginBottom: "10px" }}>
                {service.name}
              </a>
              <div style={{ marginBottom: "10px" }}>
                <StatusBadge status={service.currentStatus} />
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#dc2626" }}>
                {service.reportCount}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                report{service.reportCount !== 1 ? "s" : ""} ({PERIOD_LABELS[period]})
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rank 4–20 */}
      {rest.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
          {rest.map((service, i) => (
            <div key={service.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 20px",
              borderBottom: i < rest.length - 1 ? "1px solid #f5f5f5" : "none",
            }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#a3a3a3", minWidth: "28px", flexShrink: 0 }}>
                #{i + 4}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a href={`/${service.slug}`} style={{ fontSize: "15px", fontWeight: 600, color: "#171717", textDecoration: "none" }}>
                  {service.name}
                </a>
                <div style={{ fontSize: "12px", color: "#a3a3a3", marginTop: "1px" }}>
                  {formatCategoryLabel(service.category)}
                </div>
              </div>
              <StatusBadge status={service.currentStatus} />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#dc2626", minWidth: "32px", textAlign: "right" as const, flexShrink: 0 }}>
                {service.reportCount}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Methodology */}
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px 24px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
          Methodology
        </div>
        <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: "0 0 12px" }}>
          This ranking is based on the number of community reports submitted on DownForAI during the selected period. Each report represents a user confirming that a service is not working for them. Services with more users may receive more reports even with a similar disruption rate.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" as const }}>
          <a href="/report" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>Report an issue</a>
          <a href="/reliability-index" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>AI Reliability Index</a>
          <a href="/reports/2026-05" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>Monthly Report</a>
          <a href="/reliability" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>Reliability Rankings</a>
        </div>
      </div>
    </div>
  );
}
