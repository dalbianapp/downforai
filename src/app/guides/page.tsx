import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Reliability Guides & Reports — DownForAI",
  description:
    "Practical guides on AI API monitoring, uptime comparison, outage patterns, and reliability reports for developers and businesses.",
  alternates: { canonical: "/guides" },
  robots: { index: true, follow: true },
};

const guides = [
  {
    tag: "REPORT",
    title: "AI Outages Report — May 2026",
    href: "/reports/2026-05",
    description:
      "Real-time data on 817 services: the OpenAI April 20 cascade, latency rankings, and 283 community reports from 25+ countries.",
  },
  {
    tag: "GUIDE",
    title: "AI API Uptime Comparison 2026",
    href: "/guides/ai-api-uptime-comparison-2026",
    description:
      "Compare uptime, latency, and incident frequency across OpenAI, Anthropic, Google, Groq, and 10+ other providers.",
  },
  {
    tag: "GUIDE",
    title: "What to Do When ChatGPT is Down",
    href: "/guides/chatgpt-down-alternatives",
    description:
      "5 reliable ChatGPT alternatives compared by uptime (~99.9% to 100%), features, and cost.",
  },
  {
    tag: "GUIDE",
    title: "How to Monitor AI API Status in Your App",
    href: "/guides/how-to-monitor-ai-api-status",
    description:
      "Technical guide covering circuit breakers, the DownForAI status API, status badges, and custom endpoint checks.",
  },
  {
    tag: "ANALYSIS",
    title: "AI Outage Patterns: When Do Services Crash?",
    href: "/guides/ai-outage-patterns",
    description:
      "We found patterns: peak US evening hours, Tuesday/Thursday deployments, model launch days. Data from 817 services.",
  },
  {
    tag: "BUSINESS",
    title: "The Real Cost of AI Downtime in 2026",
    href: "/guides/cost-of-ai-downtime",
    description:
      "How AI outages translate into lost productivity, broken pipelines, and engineering complexity. Includes cost estimates.",
  },
  {
    tag: "COMPARISON",
    title: "OpenAI vs Anthropic vs Google: Reliability Q2 2026",
    href: "/guides/openai-vs-anthropic-vs-google-reliability",
    description:
      "Data-driven comparison: who has the best uptime, lowest incident rate, and most transparent status communication.",
  },
  {
    tag: "TOOLS",
    title: "Free AI Monitoring Tools for Developers",
    href: "/guides/free-ai-monitoring-tools",
    description:
      "Comparing DownForAI, UptimeRobot, Better Stack, Checkly, custom checks, and official status pages.",
  },
];

export default function GuidesIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
      { "@type": "ListItem", position: 2, name: "Guides" },
    ],
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
        <a href="/" style={{ color: "#2563eb", textDecoration: "none" }}>Home</a>
        {" / "}
        <span>Guides</span>
      </nav>

      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", marginBottom: "24px", lineHeight: 1.2 }}>
        AI Reliability Guides &amp; Reports
      </h1>

      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "32px" }}>
        Practical guides for developers and businesses who depend on AI APIs. Topics include API reliability comparisons, monitoring strategies, outage pattern analysis, and monthly incident reports.
      </p>

      {guides.map((guide) => (
        <div
          key={guide.href}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
            }}
          >
            {guide.tag}
          </div>
          <a
            href={guide.href}
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#171717",
              textDecoration: "none",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {guide.title}
          </a>
          <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
            {guide.description}
          </p>
        </div>
      ))}
    </div>
  );
}
