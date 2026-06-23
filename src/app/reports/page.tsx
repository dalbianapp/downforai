import { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AI Outages Monthly Reports — DownForAI",
  description:
    "Monthly AI reliability reports from DownForAI. Community report data, uptime trends, and outage analysis for 800+ AI services.",
  alternates: { canonical: "/reports" },
  robots: { index: true, follow: true },
};

type MonthRow = { month: string; report_count: number };

async function getReportMonths() {
  try {
    const rows = await prisma.$queryRaw<MonthRow[]>`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') AS month,
        CAST(COUNT(*) AS INTEGER) AS report_count
      FROM "CommunityReport"
      WHERE "isSpam" = false
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month DESC
    `;
    return rows.map((r) => ({ month: r.month, report_count: Number(r.report_count) }));
  } catch {
    return [];
  }
}

function formatMonth(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  return new Date(year, mon - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default async function ReportsIndexPage() {
  const months = await getReportMonths();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
      { "@type": "ListItem", position: 2, name: "Reports", item: "https://downforai.com/reports" },
    ],
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
        <a href="/" style={{ color: "#2563eb", textDecoration: "none" }}>Home</a>{" / "}
        <span>Reports</span>
      </nav>

      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", marginBottom: "8px", lineHeight: 1.2 }}>
        AI Outages Monthly Reports
      </h1>
      <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "32px" }}>
        Monthly analysis of AI service disruptions, community reports, and reliability trends across 800+ monitored services.
      </p>

      {/* Featured data report */}
      <Link
        href="/reports/state-of-ai-reliability-q2-2026"
        style={{
          display: "block",
          padding: "20px 24px",
          background: "#EEF2FF",
          border: "1px solid #C7D2FE",
          borderRadius: "14px",
          textDecoration: "none",
          marginBottom: "32px",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#4F46E5", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
          Featured · Data Report
        </div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#171717", lineHeight: 1.3 }}>
          The State of AI Reliability — Q2 2026
        </div>
        <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>
          Only 16% of 817 monitored AI services expose a verified status feed — and just 27% of LLMs. <span style={{ color: "#4F46E5", fontWeight: 600 }}>Read the report →</span>
        </div>
      </Link>

      {months.length === 0 ? (
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>No reports available yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {months.map((m) => (
            <Link
              key={m.month}
              href={`/reports/${m.month}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                textDecoration: "none",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#171717" }}>
                  AI Outages Report — {formatMonth(m.month)}
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                  {m.report_count} community reports
                </div>
              </div>
              <span style={{ fontSize: "13px", color: "#2563eb", flexShrink: 0 }}>View →</span>
            </Link>
          ))}
        </div>
      )}

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
