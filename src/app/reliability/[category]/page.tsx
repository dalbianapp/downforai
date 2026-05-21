import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ServiceCategory } from "@prisma/client";
import { formatCategoryLabel } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.values(ServiceCategory).map((cat) => ({
    category: cat.toLowerCase().replace(/_/g, "-"),
  }));
}

const CATEGORY_INTROS: Partial<Record<string, string>> = {
  LLM: "Choosing an LLM provider means choosing a reliability level. This ranking compiles community reports submitted on DownForAI over the past 90 days. Services with fewer reports rank higher — they are the foundation of a reliable AI stack.",
  IMAGE: "AI image generation tools have varying reliability profiles. Some services experience frequent timeouts during peak US evening hours. This ranking shows which image AI tools are the most stable based on 90 days of user reports.",
  VIDEO: "AI video generation is computationally intensive and prone to queue-based delays. This ranking surfaces the most reliable video AI tools based on 90 days of community reports from DownForAI users.",
  AUDIO: "Text-to-speech, music generation, and audio AI tools require low-latency infrastructure. This ranking shows which audio AI services have the fewest disruptions over the past 90 days.",
  DEV: "Coding assistants and developer AI tools are embedded in daily engineering workflows. Downtime directly impacts productivity and flow. This ranking shows which developer AI tools have the fewest community-reported disruptions.",
  INFRA: "AI infrastructure providers underpin the entire AI stack. Failures here cascade across dependent services. This ranking shows which infrastructure providers have the best reliability track record over 90 days.",
  SEARCH: "AI search engines and research tools need to be available when users need answers. This ranking shows the most reliable AI search services based on 90 days of user reports.",
  PRODUCTIVITY: "AI productivity tools are embedded in daily work routines — downtime is immediately felt. This ranking shows which productivity AI services have maintained the most consistent availability.",
  AGENTS: "AI agents and autonomous tools require sustained API reliability for multi-step workflows. This ranking shows which agentic AI services have the most stable track records over 90 days.",
  THREE_D: "3D generation and avatar AI tools are niche but critical for creative and gaming workflows. This ranking shows which 3D AI services have maintained consistent availability over 90 days.",
  DESIGN: "AI design tools power creative workflows with tight deadlines. This ranking shows which design AI services have the fewest disruptions based on 90 days of community reports.",
  MLOPS: "MLOps platforms and experiment tracking tools need to be reliably available during critical training runs. This ranking shows the most reliable MLOps AI services over 90 days.",
  VECTOR_DB: "Vector databases are critical components in RAG pipelines and semantic search. Downtime directly impacts AI application reliability. This ranking shows the most stable vector DB services.",
  ROLEPLAY: "AI roleplay and character simulation services range widely in reliability. This ranking surfaces the most consistently available services over the past 90 days.",
  MARKETING: "AI marketing tools need to be available during campaign launches and content deadlines. This ranking shows which marketing AI services have the fewest disruptions over 90 days.",
  SUPPORT: "AI customer support tools handle live user interactions. Downtime means failed support experiences at the worst moments. This ranking shows the most reliable support AI services.",
  EDUCATION: "AI education and tutoring tools need to be available when students need help. This ranking shows which education AI services have the best reliability track record over 90 days.",
  HR_AI: "AI HR tools handle sensitive workflows including recruiting and performance management. This ranking shows the most reliable HR AI services based on 90 days of community reports.",
  LEGAL_AI: "AI legal tools support time-sensitive workflows where downtime has real professional consequences. This ranking shows which legal AI services have maintained the most consistent availability.",
  SPORTS_BETTING: "AI sports betting tools provide real-time predictions and analysis. Reliability is critical during live events. This ranking shows which sports betting AI services have the best track record.",
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

type RankedService = {
  id: string;
  name: string;
  slug: string;
  reportCount: number;
  currentStatus: string | null;
};

async function getCategoryReliability(categoryEnum: ServiceCategory): Promise<RankedService[]> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  type RawRow = {
    id: string;
    name: string;
    slug: string;
    report_count: bigint | number;
    current_status: string | null;
  };

  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      s.id, s.name, s.slug,
      CAST(COUNT(cr.id) AS INTEGER) AS report_count,
      (
        SELECT o.status
        FROM "ServiceSurface" ss
        JOIN "Observation" o ON o."serviceSurfaceId" = ss.id
        WHERE ss."serviceId" = s.id AND ss."isEnabled" = true
          AND o."observedAt" >= NOW() - INTERVAL '6 hours'
        ORDER BY o."observedAt" DESC LIMIT 1
      ) AS current_status
    FROM "Service" s
    LEFT JOIN "CommunityReport" cr
      ON cr."serviceId" = s.id
      AND cr."createdAt" >= ${ninetyDaysAgo}
      AND cr."isSpam" = false
      AND cr."isVisible" = true
    WHERE s.category = ${categoryEnum}::"ServiceCategory"
    GROUP BY s.id, s.name, s.slug
    ORDER BY report_count ASC, s.name ASC
  `;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    reportCount: Number(r.report_count),
    currentStatus: r.current_status,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const enumKey = category.toUpperCase().replace(/-/g, "_");
  const validCategories = Object.values(ServiceCategory) as string[];
  if (!validCategories.includes(enumKey)) return {};

  const categoryEnum = enumKey as ServiceCategory;
  const categoryLabel = formatCategoryLabel(categoryEnum);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [count, totalReports] = await Promise.all([
    prisma.service.count({ where: { category: categoryEnum } }),
    prisma.communityReport.count({
      where: {
        service: { category: categoryEnum },
        createdAt: { gte: ninetyDaysAgo },
        isSpam: false,
        isVisible: true,
      },
    }),
  ]);

  return {
    title: `${categoryLabel} AI Reliability Ranking 2026 — Most Reliable AI Services | DownForAI`,
    description: `Compare the reliability of ${count} ${categoryLabel} AI services. Rankings based on ${totalReports} community reports over 90 days.`,
    alternates: { canonical: `/reliability/${category}` },
    robots: { index: true, follow: true },
  };
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default async function ReliabilityCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const enumKey = category.toUpperCase().replace(/-/g, "_");
  const validCategories = Object.values(ServiceCategory) as string[];
  if (!validCategories.includes(enumKey)) notFound();

  const categoryEnum = enumKey as ServiceCategory;
  const categoryLabel = formatCategoryLabel(categoryEnum);
  const services = await getCategoryReliability(categoryEnum);

  if (services.length === 0) notFound();

  const totalReports = services.reduce((sum, s) => sum + s.reportCount, 0);
  const top3 = services.slice(0, 3);
  const bottom3 = [...services].reverse().slice(0, 3).filter((s) => s.reportCount > 0);
  const intro = CATEGORY_INTROS[categoryEnum] ?? `This ranking compiles community reports for ${categoryLabel} AI services submitted on DownForAI over the past 90 days. Services with fewer reports rank higher.`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
      { "@type": "ListItem", position: 2, name: "Reliability", item: "https://downforai.com/reliability" },
      { "@type": "ListItem", position: 3, name: `${categoryLabel} Reliability` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How is this reliability ranking calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The ranking is based on the number of community reports submitted by DownForAI users over the past 90 days. Services with fewer reports rank higher. Each report represents a user confirming that a service was not working for them.",
        },
      },
      {
        "@type": "Question",
        name: `How many ${categoryLabel} services are tracked?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `DownForAI currently monitors ${services.length} ${categoryLabel} AI services. All services are checked automatically every 75 minutes.`,
        },
      },
    ],
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
        <a href="/" style={{ color: "#2563eb", textDecoration: "none" }}>Home</a>
        {" / "}
        <a href="/reliability" style={{ color: "#2563eb", textDecoration: "none" }}>Reliability</a>
        {" / "}
        <span>{categoryLabel}</span>
      </nav>

      {/* Header */}
      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", marginBottom: "8px", letterSpacing: "-1px", lineHeight: 1.2 }}>
        {categoryLabel} AI Reliability Ranking — 2026
      </h1>
      <p style={{ fontSize: "16px", color: "#374151", marginBottom: "24px", lineHeight: 1.7 }}>
        {intro}
      </p>

      {/* Stats */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" as const, marginBottom: "32px" }}>
        {[
          { label: "Services monitored", value: services.length },
          { label: "Community reports (90d)", value: totalReports },
          { label: "Period analyzed", value: "Last 90 days" },
        ].map((stat) => (
          <div key={stat.label} style={{
            flex: "1 1 160px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "14px 16px",
          }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#171717" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Top 3 most reliable podium */}
      {top3.length > 0 && (
        <>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            Most Reliable {categoryLabel} Services
          </h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" as const, marginBottom: "32px" }}>
            {top3.map((service, i) => (
              <div key={service.id} style={{
                flex: "1 1 180px",
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center" as const,
                boxShadow: i === 0 ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
              }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{RANK_MEDALS[i]}</div>
                <a href={`/${service.slug}`} style={{ fontSize: "15px", fontWeight: 700, color: "#171717", textDecoration: "none", display: "block", marginBottom: "10px" }}>
                  {service.name}
                </a>
                <div style={{ marginBottom: "10px" }}>
                  <StatusBadge status={service.currentStatus} />
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#16a34a" }}>
                  {service.reportCount}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  report{service.reportCount !== 1 ? "s" : ""} in 90 days
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Full ranking table */}
      <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
        Full Ranking
      </h2>
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", overflow: "hidden", marginBottom: "32px" }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 100px 120px",
          gap: "8px",
          padding: "12px 20px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e5e5",
          fontSize: "12px",
          fontWeight: 700,
          color: "#6b7280",
          textTransform: "uppercase" as const,
          letterSpacing: "0.05em",
        }}>
          <span>#</span>
          <span>Service</span>
          <span style={{ textAlign: "center" as const }}>Reports (90d)</span>
          <span style={{ textAlign: "center" as const }}>Status</span>
        </div>
        {services.map((service, i) => (
          <div key={service.id} style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 100px 120px",
            gap: "8px",
            padding: "12px 20px",
            alignItems: "center",
            borderBottom: i < services.length - 1 ? "1px solid #f5f5f5" : "none",
          }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#a3a3a3" }}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
            </span>
            <a href={`/${service.slug}`} style={{ fontSize: "14px", fontWeight: 600, color: "#171717", textDecoration: "none" }}>
              {service.name}
            </a>
            <span style={{ fontSize: "14px", fontWeight: 700, color: service.reportCount === 0 ? "#16a34a" : "#dc2626", textAlign: "center" as const }}>
              {service.reportCount}
            </span>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <StatusBadge status={service.currentStatus} />
            </div>
          </div>
        ))}
      </div>

      {/* Most reported section */}
      {bottom3.length > 0 && (
        <>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>
            Most Reported
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px", lineHeight: 1.6 }}>
            Services with the highest report counts in the past 90 days. Note: services with more users may receive more reports even with a similar disruption rate.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" as const, marginBottom: "32px" }}>
            {bottom3.map((service) => (
              <div key={service.id} style={{
                flex: "1 1 160px",
                background: "#fff5f5",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                padding: "16px",
              }}>
                <a href={`/${service.slug}`} style={{ fontSize: "14px", fontWeight: 700, color: "#171717", textDecoration: "none", display: "block", marginBottom: "6px" }}>
                  {service.name}
                </a>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#dc2626" }}>
                  {service.reportCount}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>reports in 90 days</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Browse category link */}
      <div style={{ marginBottom: "24px" }}>
        <a href={`/category/${category}`} style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "10px 16px",
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#0369a1",
          textDecoration: "none",
          fontWeight: 500,
        }}>
          Browse all {categoryLabel} services →
        </a>
      </div>

      {/* Methodology */}
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
          Methodology
        </div>
        <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: "0 0 12px" }}>
          Period analyzed: 90 rolling days, updated hourly. Sources: Community reports submitted by DownForAI users. This ranking measures perception based on user experience, not technical uptime telemetry.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" as const }}>
          <a href="/top-outages" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>Top Outages Right Now</a>
          <a href="/reliability-index" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>AI Reliability Index</a>
          <a href="/reports/2026-05" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}>Monthly Report</a>
        </div>
      </div>

      {/* FAQ section (JSON-LD already added above) */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "20px 24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: "16px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
              How is this reliability ranking calculated?
            </div>
            <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
              The ranking is based on the number of community reports submitted by DownForAI users over the past 90 days. Services with fewer reports rank higher. Each report represents a user confirming that a service was not working for them.
            </p>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
              How many {categoryLabel} services are tracked?
            </div>
            <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
              DownForAI currently monitors {services.length} {categoryLabel} AI services. All services are checked automatically every 75 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
