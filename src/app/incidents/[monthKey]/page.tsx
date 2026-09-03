import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishableIncidents,
  getIncidentMonthSummaries,
} from "@/lib/incidents/queries";
import { IncidentCard } from "@/components/incidents/IncidentCard";

// Static + ISR: no searchParams (a `?page=` dependency makes the route dynamic and
// lets crawlers wake the database on every hit). A month holds < 100 publishable
// incidents, so the whole month is listed on one page.
export const revalidate = 3600;

const MONTH_PAGE_SIZE = 100;

function isValidMonthKey(key: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(key)) return false;
  const [year, month] = key.split("-").map(Number);
  if (year < 2025 || year > 2030) return false;
  if (month < 1 || month > 12) return false;
  return true;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ monthKey: string }>;
}): Promise<Metadata> {
  const { monthKey } = await params;
  if (!isValidMonthKey(monthKey)) return {};

  const displayMonth = new Date(`${monthKey}-01T00:00:00Z`).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return {
    title: `AI Incidents — ${displayMonth} | DownForAI`,
    description: `All major AI service incidents detected by DownForAI in ${displayMonth}. Browse incidents, durations, and affected services.`,
    alternates: { canonical: `/incidents/${monthKey}` },
    robots: { index: true, follow: true },
  };
}

export default async function IncidentMonthPage({
  params,
}: {
  params: Promise<{ monthKey: string }>;
}) {
  const { monthKey } = await params;
  if (!isValidMonthKey(monthKey)) notFound();

  const [result, months] = await Promise.all([
    getPublishableIncidents({ page: 1, perPage: MONTH_PAGE_SIZE, monthKey }),
    getIncidentMonthSummaries(),
  ]);

  const currentMonth = months.find((m) => m.monthKey === monthKey);

  // 404 if no incidents for this month (and it's not an active month)
  if (result.total === 0 && !currentMonth) notFound();

  const displayMonth = currentMonth?.displayMonth ??
    new Date(`${monthKey}-01T00:00:00Z`).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `AI Incidents — ${displayMonth}`,
    url: `https://downforai.com/incidents/${monthKey}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
        { "@type": "ListItem", position: 2, name: "Incidents", item: "https://downforai.com/incidents" },
        { "@type": "ListItem", position: 3, name: displayMonth, item: `https://downforai.com/incidents/${monthKey}` },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <nav style={{ fontSize: "13px", color: "#525252" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#525252" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/incidents" style={{ textDecoration: "none", color: "#525252" }}>Incidents</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#171717" }}>{displayMonth}</span>
        </nav>

        <header style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#171717", letterSpacing: "-0.5px", margin: 0 }}>
            AI Incidents — {displayMonth}
          </h1>
          <p style={{ fontSize: "14px", color: "#525252", margin: 0 }}>
            {result.total} major incident{result.total !== 1 ? "s" : ""} detected across AI services in {displayMonth}.
          </p>
        </header>

        {result.incidents.length === 0 ? (
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
            No major incidents recorded for this period.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {result.incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}

        <div style={{ paddingTop: "16px", borderTop: "1px solid #e5e5e5" }}>
          <Link href="/incidents" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>
            ← Back to all incidents
          </Link>
        </div>
      </div>
    </>
  );
}
