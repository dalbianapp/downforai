import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AI Reliability Rankings — Compare AI Service Uptime by Category | DownForAI",
  description:
    "Compare the reliability of AI services by category. Uptime rankings for LLMs, image generators, coding tools, and more based on 90 days of community reports.",
  alternates: { canonical: "/reliability" },
  robots: { index: true, follow: true },
};

export default async function ReliabilityIndexPage() {
  const categoryCounts = await prisma.service.groupBy({
    by: ["category"],
    _count: { id: true },
  });

  const countMap = new Map(categoryCounts.map((c) => [c.category as string, c._count.id]));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
      { "@type": "ListItem", position: 2, name: "Reliability", item: "https://downforai.com/reliability" },
    ],
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
        <a href="/" style={{ color: "#2563eb", textDecoration: "none" }}>Home</a>
        {" / "}
        <span>Reliability</span>
      </nav>

      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", marginBottom: "8px", letterSpacing: "-1px", lineHeight: 1.2 }}>
        AI Reliability Rankings by Category
      </h1>
      <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "40px", lineHeight: 1.6 }}>
        90-day reliability rankings based on community reports. Services with fewer reports rank higher.
        Updated hourly.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {CATEGORIES.map((cat) => {
          const enumKey = cat.slug.toUpperCase().replace(/-/g, "_");
          const count = countMap.get(enumKey) ?? 0;
          return (
            <a key={cat.slug} href={`/reliability/${cat.slug}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "20px",
                height: "100%",
                boxSizing: "border-box" as const,
              }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#171717", marginBottom: "6px" }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                  {count} service{count !== 1 ? "s" : ""} monitored
                </div>
                <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600 }}>
                  View ranking →
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div style={{ padding: "20px 24px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px" }}>
        <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
          Rankings are based on community reports submitted by DownForAI users over the past 90 days.
          A lower report count indicates more reliable service.{" "}
          See also:{" "}
          <a href="/top-outages" style={{ color: "#2563eb", textDecoration: "underline" }}>Top Outages Right Now</a>
          {" · "}
          <a href="/reliability-index" style={{ color: "#2563eb", textDecoration: "underline" }}>AI Reliability Index</a>
        </p>
      </div>
    </div>
  );
}
