import type { Metadata } from "next";
import Link from "next/link";
import { getSpeedIndex } from "@/lib/speed-index/getSpeedIndex";
import { SpeedIndexTable } from "@/components/speed-index/SpeedIndexTable";
import { generateBreadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "LLM Speed Index — Live AI API Latency Rankings | DownForAI",
  description:
    "Real-time latency and reliability rankings for all major LLM APIs. Compare p50/p95 response times, uptime %, and incident history across OpenAI, Anthropic, Mistral, Groq, and 50+ providers. Updated every 15 minutes.",
  alternates: { canonical: "/speed-index" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "LLM Speed Index — Live AI API Latency Rankings",
    description:
      "p50/p95 latency, uptime, and incident counts for 50+ LLM providers. Free, live data from DownForAI.",
    url: "https://downforai.com/speed-index",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LLM Speed Index — Live AI API Latency Rankings",
  },
};

export default async function SpeedIndexPage() {
  const { data, generatedAt } = await getSpeedIndex("LLM");

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://downforai.com" },
    { name: "LLM Speed Index", url: "https://downforai.com/speed-index" },
  ]);

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "LLM Speed Index — AI API Latency Rankings",
    description:
      "Real-time p50/p95 latency, uptime percentage, and incident count data for major LLM API providers. Updated every 15 minutes via continuous monitoring.",
    url: "https://downforai.com/speed-index",
    creator: {
      "@type": "Organization",
      name: "DownForAI",
      url: "https://downforai.com",
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
    keywords: [
      "LLM latency",
      "AI API speed",
      "OpenAI latency",
      "LLM benchmark",
      "AI API uptime",
    ],
  };

  const lastUpdated = new Date(generatedAt).toUTCString();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 16px" }}>
        {/* Breadcrumb */}
        <nav
          style={{
            fontSize: "13px",
            color: "#a3a3a3",
            marginBottom: "24px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <Link href="/" style={{ color: "#a3a3a3", textDecoration: "none" }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: "#525252" }}>LLM Speed Index</span>
        </nav>

        {/* Header */}
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 800,
            color: "#171717",
            letterSpacing: "-1px",
            lineHeight: 1.15,
            marginBottom: "12px",
          }}
        >
          LLM Speed Index — Live AI API Latency Rankings
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#525252",
            lineHeight: 1.65,
            marginBottom: "6px",
            maxWidth: "720px",
          }}
        >
          Measured latency and reliability for{" "}
          <strong>{data.length} LLM API providers</strong>, ranked by 7-day p50
          response time. Toggle between 7-day and 24-hour windows. Probed every ~90
          minutes by DownForAI.
        </p>

        <p
          style={{
            fontSize: "13px",
            color: "#a3a3a3",
            marginBottom: "36px",
          }}
        >
          Last updated: {lastUpdated}
        </p>

        {/* Client component: champion cards + toggle + sortable table + copy */}
        <SpeedIndexTable data={data} generatedAt={generatedAt} />

        {/* Methodology block — SSR, always visible to crawlers */}
        <div
          style={{
            marginTop: "40px",
            padding: "20px 24px",
            background: "#f9fafb",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            fontSize: "13px",
            color: "#525252",
            lineHeight: 1.75,
          }}
        >
          <strong>Methodology:</strong> DownForAI measures monitored API and endpoint
          response latency through scheduled checks (each surface is re-checked roughly
          every 90 minutes). Latency reflects monitored surface response time — it is{" "}
          <strong>NOT</strong> a tokens-per-second model generation benchmark. Rankings
          use a 7-day or 24-hour window and exclude services with insufficient
          observations (&lt;10 probe results in the 7-day window). Trend compares the
          last 24 hours against the previous 24-hour period. Data is updated
          approximately every 15 minutes.{" "}
          <Link href="/methodology" style={{ color: "#2563eb" }}>
            Full methodology →
          </Link>
        </div>

        {/* Related links */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            fontSize: "13px",
            color: "#a3a3a3",
          }}
        >
          <Link
            href="/reliability"
            style={{ color: "#2563eb", textDecoration: "none" }}
          >
            AI Reliability Rankings
          </Link>
          <span>·</span>
          <Link
            href="/reliability-index"
            style={{ color: "#2563eb", textDecoration: "none" }}
          >
            Reliability Index
          </Link>
          <span>·</span>
          <Link
            href="/guides/ai-api-uptime-comparison-2026"
            style={{ color: "#2563eb", textDecoration: "none" }}
          >
            AI API Uptime Comparison 2026
          </Link>
          <span>·</span>
          <Link
            href="/methodology"
            style={{ color: "#2563eb", textDecoration: "none" }}
          >
            How We Monitor
          </Link>
        </div>
      </div>
    </>
  );
}
