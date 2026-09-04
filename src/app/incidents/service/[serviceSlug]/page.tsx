import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPublishableIncidents } from "@/lib/incidents/queries";
import { IncidentCard } from "@/components/incidents/IncidentCard";

// Static + ISR: no searchParams (a `?page=` dependency makes the route dynamic and
// lets crawlers wake the database on every hit). A service's full publishable
// history fits on one page.
export const revalidate = 3600;

const SERVICE_PAGE_SIZE = 100;

// Without generateStaticParams, Next renders a dynamic-segment page on every request
// (build table: ƒ) and `revalidate` is ignored — verified in production after the
// searchParams removal. An empty list keeps the build cheap (no 817 extra prerenders)
// and makes every service history page on-demand ISR, cached 1h after its first hit.
export async function generateStaticParams(): Promise<Array<{ serviceSlug: string }>> {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
    select: { name: true },
  });
  if (!service) return {};

  return {
    title: `${service.name} Incident History | DownForAI`,
    description: `Complete incident history for ${service.name}: durations, severities, and outages detected by DownForAI monitoring.`,
    alternates: { canonical: `/incidents/service/${serviceSlug}` },
    robots: { index: true, follow: true },
  };
}

export default async function IncidentByServicePage({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}) {
  const { serviceSlug } = await params;

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
    select: { name: true, slug: true, category: true },
  });
  if (!service) notFound();

  const result = await getPublishableIncidents({ page: 1, perPage: SERVICE_PAGE_SIZE, serviceSlug });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${service.name} Incident History`,
    url: `https://downforai.com/incidents/service/${serviceSlug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
        { "@type": "ListItem", position: 2, name: "Incidents", item: "https://downforai.com/incidents" },
        { "@type": "ListItem", position: 3, name: service.name, item: `https://downforai.com/incidents/service/${serviceSlug}` },
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
          <span style={{ color: "#171717" }}>{service.name}</span>
        </nav>

        <header style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#171717", letterSpacing: "-0.5px", margin: 0 }}>
            {service.name} Incident History
          </h1>
          <p style={{ fontSize: "14px", color: "#525252", margin: 0 }}>
            {result.total} major incident{result.total !== 1 ? "s" : ""} detected for {service.name}.{" "}
            <Link href={`/${serviceSlug}`} style={{ color: "#2563eb", textDecoration: "underline" }}>
              View live status dashboard →
            </Link>
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
            No major incidents recorded for {service.name}.
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
