import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getDisplayStatusMap } from "@/lib/status/getDisplayStatus";
import { TopOutagesBoard, type Period, type ReportedService } from "./TopOutagesBoard";

// Static + ISR. This page used to be `force-dynamic` with query-string filters, so
// every crawler hit (and every filter combination) rendered it fresh against the
// database and kept the Neon compute awake. It now renders a snapshot of all four
// periods at most once per hour; period/category filtering happens client-side.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Top AI Outages — Most Reported AI Services Today | DownForAI",
  description:
    "Ranking of the most reported AI services. See which AI tools are experiencing issues right now, based on community reports.",
  alternates: { canonical: "/top-outages" },
  robots: { index: true, follow: true },
};

const PERIODS: Record<Period, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "90d": 90 * 24 * 60 * 60 * 1000,
};

function getDisruptionConfig(score: number) {
  if (score < 2) return { label: "Stable", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
  if (score < 5) return { label: "Minor disruptions", color: "#ca8a04", bg: "#fefce8", border: "#fef08a" };
  if (score < 8) return { label: "Significant disruptions", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" };
  return { label: "Major crisis", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
}

// Every service with at least one visible report, per period (no LIMIT: the client
// filters by category and keeps the top 20). The report table is small (~1k rows),
// so this is four cheap aggregates + one status lookup per regeneration.
async function getReportsByPeriod(): Promise<Record<Period, ReportedService[]>> {
  const now = Date.now();

  type RawRow = {
    id: string;
    name: string;
    slug: string;
    category: string;
    report_count: bigint | number;
  };

  const periods = Object.keys(PERIODS) as Period[];
  const perPeriod = await Promise.all(
    periods.map(async (period) => {
      const dateFilter = new Date(now - PERIODS[period]);
      const rows = await prisma.$queryRaw<RawRow[]>`
        SELECT s.id, s.name, s.slug, s.category::text AS category, COUNT(*)::int AS report_count
        FROM "CommunityReport" cr
        JOIN "Service" s ON s.id = cr."serviceId"
        WHERE cr."createdAt" >= ${dateFilter}
          AND cr."isSpam" = false
          AND cr."isVisible" = true
        GROUP BY s.id, s.name, s.slug, s.category
        ORDER BY report_count DESC
      `;
      return [period, rows] as const;
    })
  );

  // Current status via the single site-wide derivation (current state +
  // official-prime + community fold) — same source as every other surface.
  const slugs = [...new Set(perPeriod.flatMap(([, rows]) => rows.map((r) => r.slug)))];
  const statusMap = slugs.length > 0 ? await getDisplayStatusMap(slugs) : null;

  const result = {} as Record<Period, ReportedService[]>;
  for (const [period, rows] of perPeriod) {
    result[period] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      reportCount: Number(r.report_count),
      currentStatus: statusMap?.get(r.slug)?.display.status ?? null,
    }));
  }
  return result;
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

export default async function TopOutagesPage() {
  const [data, disruptionScore] = await Promise.all([
    getReportsByPeriod(),
    getDisruptionScore(),
  ]);

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
        Ranking of the most reported AI services by users. Based on community reports, refreshed hourly.
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

      {/* Filters + podium + ranking (client-side over the static snapshot) */}
      <TopOutagesBoard data={data} />

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
