import { Metadata } from "next";
import { StatusDashboard } from "@/components/status/StatusDashboard";
import { formatCategoryLabel } from "@/lib/utils";
import { ServiceCategory } from "@prisma/client";
import { generateBreadcrumbJsonLd, truncateTitle, truncateDescription } from "@/lib/seo";
import { getIndexSnapshot } from "@/lib/snapshot/read";

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.values(ServiceCategory).map((category) => ({
    category: category.toLowerCase().replace(/_/g, "-"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryLabel = formatCategoryLabel(category.toUpperCase().replace(/-/g, "_"));
  const categoryUpper = category.toUpperCase().replace(/-/g, "_");

  const snapshot = await getIndexSnapshot();
  const count = (snapshot?.services ?? []).filter((s) => s.category === categoryUpper).length;

  const fullTitle = `${count} ${categoryLabel} AI Tools Monitored Live | DownForAI`;
  const title = truncateTitle(fullTitle, `${count} ${categoryLabel} AI Tools Monitored Live`);
  const description = truncateDescription(
    `Track ${count} ${categoryLabel} AI services in real-time. Live uptime monitoring, latency tracking, and community outage reports for every major ${categoryLabel} tool.`
  );

  return {
    title,
    description,
    openGraph: { description },
    twitter: { description },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/category/${category}`,
    },
  };
}

async function getCategoryServices(category: string) {
  // Reads the hourly snapshot (src/lib/snapshot) instead of querying Prisma
  // directly — same fix as the home page, for the same reason.
  const categoryUpper = category.toUpperCase().replace(/-/g, "_");
  const snapshot = await getIndexSnapshot();
  return (snapshot?.services ?? []).filter((s) => s.category === categoryUpper);
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const services = await getCategoryServices(category);
  const categoryLabel = formatCategoryLabel(category.toUpperCase().replace(/-/g, "_"));

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://downforai.com" },
    { name: categoryLabel, url: `https://downforai.com/category/${category}` },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#171717", marginBottom: "8px", letterSpacing: "-1px" }}>
          {categoryLabel} AI Services
        </h1>
        <p style={{ fontSize: "16px", color: "#737373" }}>
          Real-time status monitoring for {services.length} {categoryLabel} services
        </p>
      </div>

      {/* Reliability ranking link */}
      <a
        href={`/reliability/${category}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#0369a1",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        📊 View {categoryLabel} reliability ranking →
      </a>

      {category === "sports-betting" && (
        <div style={{
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "13px",
          color: "#92400e",
        }}>
          ⚠️ DownForAI monitors service availability only. This is not betting advice. Please gamble responsibly.
        </div>
      )}

      <StatusDashboard services={services} />
    </div>
  );
}
