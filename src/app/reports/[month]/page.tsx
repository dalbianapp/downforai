import { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateBreadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 3600;

function formatMonth(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  return new Date(year, mon - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatReportType(type: string): string {
  const map: Record<string, string> = {
    DOWN: "Complete Outage",
    SLOW: "Slow / Degraded",
    LOGIN: "Login Issues",
    API_ERROR: "API Errors",
    OTHER: "Other",
  };
  return map[type] ?? type;
}

type MonthRow = { month: string };

export async function generateStaticParams() {
  try {
    const rows = await prisma.$queryRaw<MonthRow[]>`
      SELECT DISTINCT TO_CHAR("createdAt", 'YYYY-MM') AS month
      FROM "CommunityReport"
      WHERE "isSpam" = false
      ORDER BY month DESC
    `;
    return rows.map((r) => ({ month: r.month }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ month: string }>;
}): Promise<Metadata> {
  const { month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month)) return {};
  const label = formatMonth(month);
  return {
    title: `AI Outages Report — ${label} | DownForAI`,
    description: `Monthly AI reliability report for ${label}. Community reports, top outages, and uptime rankings across 800+ monitored AI services.`,
    alternates: { canonical: `/reports/${month}` },
    robots: { index: true, follow: true },
  };
}

type StatsRow = { total: number; unique_countries: number; unique_services: number };
type TopServiceRow = { service_slug: string; service_name: string; report_count: number };
type TypeBreakdownRow = { report_type: string; count: number };
type CountryRow = { country_code: string; count: number };
type PrevRow = { total: number };

async function getMonthData(month: string) {
  const [year, mon] = month.split("-").map(Number);
  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 1);
  const prevDate = new Date(year, mon - 2, 1);
  const prevStart = new Date(prevDate.getFullYear(), prevDate.getMonth(), 1);
  const prevEnd = start;

  const [statsRows, topServices, typeBreakdown, topCountries, prevRows] = await Promise.all([
    prisma.$queryRaw<StatsRow[]>`
      SELECT
        CAST(COUNT(*) AS INTEGER) AS total,
        CAST(COUNT(DISTINCT "countryCode") AS INTEGER) AS unique_countries,
        CAST(COUNT(DISTINCT "serviceId") AS INTEGER) AS unique_services
      FROM "CommunityReport"
      WHERE "isSpam" = false AND "createdAt" >= ${start} AND "createdAt" < ${end}
    `,
    prisma.$queryRaw<TopServiceRow[]>`
      SELECT s.slug AS service_slug, s.name AS service_name,
             CAST(COUNT(*) AS INTEGER) AS report_count
      FROM "CommunityReport" cr
      JOIN "Service" s ON s.id = cr."serviceId"
      WHERE cr."isSpam" = false AND cr."createdAt" >= ${start} AND cr."createdAt" < ${end}
      GROUP BY s.slug, s.name
      ORDER BY report_count DESC
      LIMIT 10
    `,
    prisma.$queryRaw<TypeBreakdownRow[]>`
      SELECT "reportType" AS report_type,
             CAST(COUNT(*) AS INTEGER) AS count
      FROM "CommunityReport"
      WHERE "isSpam" = false AND "createdAt" >= ${start} AND "createdAt" < ${end}
      GROUP BY "reportType"
      ORDER BY count DESC
    `,
    prisma.$queryRaw<CountryRow[]>`
      SELECT "countryCode" AS country_code,
             CAST(COUNT(*) AS INTEGER) AS count
      FROM "CommunityReport"
      WHERE "isSpam" = false AND "createdAt" >= ${start} AND "createdAt" < ${end}
        AND "countryCode" IS NOT NULL
      GROUP BY "countryCode"
      ORDER BY count DESC
      LIMIT 5
    `,
    prisma.$queryRaw<PrevRow[]>`
      SELECT CAST(COUNT(*) AS INTEGER) AS total
      FROM "CommunityReport"
      WHERE "isSpam" = false AND "createdAt" >= ${prevStart} AND "createdAt" < ${prevEnd}
    `,
  ]);

  return {
    total: Number(statsRows[0]?.total ?? 0),
    uniqueCountries: Number(statsRows[0]?.unique_countries ?? 0),
    uniqueServices: Number(statsRows[0]?.unique_services ?? 0),
    prevTotal: Number(prevRows[0]?.total ?? 0),
    topServices: topServices.map((r) => ({ ...r, report_count: Number(r.report_count) })),
    typeBreakdown: typeBreakdown.map((r) => ({ ...r, count: Number(r.count) })),
    topCountries: topCountries.map((r) => ({ ...r, count: Number(r.count) })),
  };
}

export default async function ReportMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month)) notFound();

  const label = formatMonth(month);
  const data = await getMonthData(month);

  const prevMonth = (() => {
    const [year, mon] = month.split("-").map(Number);
    const d = new Date(year, mon - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  const changeVsPrev =
    data.prevTotal > 0
      ? Math.round(((data.total - data.prevTotal) / data.prevTotal) * 100)
      : null;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://downforai.com" },
    { name: "Reports", url: "https://downforai.com/reports" },
    { name: `AI Outages ${label}`, url: `https://downforai.com/reports/${month}` },
  ]);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
        <a href="/" style={{ color: "#2563eb", textDecoration: "none" }}>Home</a>{" / "}
        <a href="/reports" style={{ color: "#2563eb", textDecoration: "none" }}>Reports</a>{" / "}
        <span>AI Outages {label}</span>
      </nav>

      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", marginBottom: "8px", lineHeight: 1.2 }}>
        AI Outages Report — {label}
      </h1>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "32px" }}>
        Based on community-submitted reports on DownForAI · Updated hourly
      </p>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#171717" }}>{data.total}</div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Community Reports</div>
          {changeVsPrev !== null && (
            <div
              style={{
                fontSize: "12px",
                color: changeVsPrev > 0 ? "#dc2626" : "#16a34a",
                marginTop: "4px",
              }}
            >
              {changeVsPrev > 0 ? "▲" : "▼"} {Math.abs(changeVsPrev)}% vs prev month
            </div>
          )}
        </div>
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#171717" }}>{data.uniqueServices}</div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Services Affected</div>
        </div>
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#171717" }}>{data.uniqueCountries}</div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Countries</div>
        </div>
      </div>

      {data.total === 0 ? (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            padding: "24px",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#166534", marginBottom: "8px" }}>
            No community reports recorded for {label}
          </div>
          <div style={{ fontSize: "14px", color: "#16a34a" }}>
            This month had no submitted outage reports.
          </div>
        </div>
      ) : (
        <>
          {/* Top services */}
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            Most Reported Services
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" as const, marginBottom: "40px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #e5e7eb", padding: "10px 12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "13px" }}>Rank</th>
                <th style={{ border: "1px solid #e5e7eb", padding: "10px 12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "13px" }}>Service</th>
                <th style={{ border: "1px solid #e5e7eb", padding: "10px 12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "13px" }}>Reports</th>
                <th style={{ border: "1px solid #e5e7eb", padding: "10px 12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "13px" }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {data.topServices.map((svc, i) => (
                <tr key={svc.service_slug}>
                  <td style={{ border: "1px solid #e5e7eb", padding: "10px 12px", fontSize: "14px", color: "#374151" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "10px 12px", fontSize: "14px" }}>
                    <a href={`/${svc.service_slug}`} style={{ color: "#2563eb", textDecoration: "underline" }}>
                      {svc.service_name}
                    </a>
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "10px 12px", fontSize: "14px", color: "#374151", fontWeight: 600 }}>
                    {svc.report_count}
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "10px 12px", fontSize: "14px", color: "#6b7280" }}>
                    {data.total > 0 ? `${Math.round((svc.report_count / data.total) * 100)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Type breakdown */}
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            Report Type Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "40px" }}>
            {data.typeBreakdown.map((t) => (
              <div key={t.report_type} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "130px", fontSize: "13px", color: "#374151", flexShrink: 0 }}>
                  {formatReportType(t.report_type)}
                </div>
                <div style={{ flex: 1, background: "#f3f4f6", borderRadius: "4px", height: "20px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.round((t.count / data.total) * 100)}%`,
                      height: "100%",
                      background:
                        t.report_type === "DOWN"
                          ? "#ef4444"
                          : t.report_type === "SLOW"
                          ? "#f59e0b"
                          : "#6366f1",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div style={{ width: "80px", textAlign: "right" as const, fontSize: "13px", color: "#374151", fontWeight: 600 }}>
                  {t.count} ({Math.round((t.count / data.total) * 100)}%)
                </div>
              </div>
            ))}
          </div>

          {/* Top countries */}
          {data.topCountries.length > 0 && (
            <>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
                Geographic Distribution
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "8px", marginBottom: "40px" }}>
                {data.topCountries.map((c) => (
                  <div
                    key={c.country_code}
                    style={{
                      padding: "8px 16px",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{c.country_code}</span>
                    <span style={{ color: "#6b7280", marginLeft: "8px" }}>{c.count} reports</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Navigation */}
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px", marginTop: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap" as const,
            gap: "12px",
          }}
        >
          <Link href={`/reports/${prevMonth}`} style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>
            ← {formatMonth(prevMonth)}
          </Link>
          <Link href="/reports" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>
            All Reports
          </Link>
        </div>
      </div>

      <div style={{ marginTop: "40px", display: "flex", gap: "16px", flexWrap: "wrap" as const }}>
        <a href="/reliability-index" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>
          AI Reliability Index
        </a>
        <a href="/top-outages" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>
          Top Outages Right Now
        </a>
        <a href="/reliability" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>
          Reliability Rankings
        </a>
      </div>
    </div>
  );
}
