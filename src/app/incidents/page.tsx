import Link from "next/link";
import type { Metadata } from "next";
import {
  getPublishableIncidents,
  getIncidentMonthSummaries,
  getIncidentArchiveStats,
} from "@/lib/incidents/queries";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { IncidentStatsBar } from "@/components/incidents/IncidentStatsBar";
import { MonthArchiveGrid } from "@/components/incidents/MonthArchiveGrid";

// Static + ISR. Pagination used to come from `?page=` searchParams, which makes the
// route dynamic (rendered on every request, ignoring `revalidate`) and gave crawlers
// an endless surface that woke the Neon compute every couple of minutes. The archive
// now shows the latest incidents here and delegates browsing to the month pages.
export const revalidate = 3600;

const LATEST_COUNT = 20;

export const metadata: Metadata = {
  title: "AI Incidents Archive — Real outages across 800+ AI services | DownForAI",
  description:
    "Public archive of AI service incidents detected by DownForAI monitoring. Browse by month, by service, or by severity. Independent, data-driven, updated hourly.",
  alternates: { canonical: "/incidents" },
  robots: { index: true, follow: true },
};

export default async function IncidentsArchivePage() {
  const [incidentsResult, months, stats] = await Promise.all([
    getPublishableIncidents({ page: 1, perPage: LATEST_COUNT }),
    getIncidentMonthSummaries(),
    getIncidentArchiveStats(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Incidents Archive",
    description: "Archive of AI service incidents detected by DownForAI monitoring.",
    url: "https://downforai.com/incidents",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
        { "@type": "ListItem", position: 2, name: "Incidents", item: "https://downforai.com/incidents" },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Header */}
        <header style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <nav style={{ fontSize: "13px", color: "#525252" }}>
            <Link href="/" style={{ textDecoration: "none", color: "#525252" }}>
              Home
            </Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: "#171717" }}>Incidents</span>
          </nav>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#171717", letterSpacing: "-1px", margin: 0 }}>
            AI Incidents Archive
          </h1>
          <p style={{ fontSize: "15px", color: "#525252", maxWidth: "680px", lineHeight: 1.6, margin: 0 }}>
            Public archive of significant incidents detected across 800+ AI services.
            DownForAI checks monitored surfaces on a rotating schedule, roughly every 75 minutes per surface, from a single centralized probe infrastructure. Updated hourly.{" "}
            <Link href="/methodology" style={{ color: "#2563eb", textDecoration: "underline" }}>
              See our methodology
            </Link>
            .
          </p>
        </header>

        {/* Stats bar */}
        <IncidentStatsBar stats={stats} />

        {/* Month archive grid */}
        <section>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            Browse by month
          </h2>
          <MonthArchiveGrid months={months} />
        </section>

        {/* Incident list */}
        <section>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            Latest incidents{" "}
            <span style={{ fontSize: "14px", fontWeight: 400, color: "#525252" }}>
              ({incidentsResult.total} total)
            </span>
          </h2>

          {incidentsResult.incidents.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "32px",
                textAlign: "center",
                color: "#525252",
              }}
            >
              No incidents match the current filters.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {incidentsResult.incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </section>

        {/* Older incidents live on the month pages (static, one per month) */}
        {incidentsResult.total > LATEST_COUNT && (
          <p style={{ textAlign: "center", fontSize: "13px", color: "#525252", paddingTop: "24px", borderTop: "1px solid #e5e5e5", margin: 0 }}>
            Showing the {LATEST_COUNT} most recent incidents. Browse older ones by month above.
          </p>
        )}

        {/* Footer link */}
        <footer style={{ paddingTop: "24px", borderTop: "1px solid #e5e5e5", fontSize: "13px", color: "#525252" }}>
          Looking for a specific service?{" "}
          <Link href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>
            Browse all 800+ monitored AI services →
          </Link>
        </footer>
      </div>
    </>
  );
}
