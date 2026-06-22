import { Metadata } from "next";
import Link from "next/link";
import { generateBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Free AI Status Badges for Your README — DownForAI",
  description:
    "Add a live AI service status badge to your GitHub README, docs, or dashboard. Free, no API key, no signup. Supports 775+ AI services.",
  alternates: { canonical: "/badges" },
  robots: { index: true, follow: true },
};

const POPULAR_BADGES = [
  { slug: "openai", name: "OpenAI" },
  { slug: "anthropic", name: "Anthropic" },
  { slug: "google-gemini", name: "Google Gemini" },
  { slug: "deepseek", name: "DeepSeek" },
  { slug: "xai-grok", name: "xAI Grok" },
  { slug: "perplexity", name: "Perplexity" },
  { slug: "groq", name: "Groq" },
  { slug: "mistral", name: "Mistral" },
  { slug: "midjourney", name: "Midjourney" },
  { slug: "github-copilot", name: "GitHub Copilot" },
  { slug: "cursor", name: "Cursor" },
  { slug: "replicate", name: "Replicate" },
];

export default function BadgesPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://downforai.com" },
    { name: "Status Badges", url: "https://downforai.com/badges" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
          Free AI Status Badges
        </h1>
        <p style={{ fontSize: "16px", color: "#525252", lineHeight: 1.6, marginBottom: "32px" }}>
          Show real-time AI service status in your README, docs, or dashboard. Free, no API key,
          no signup. Auto-updates every 5 minutes.
        </p>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Quick Start</h2>
        <p style={{ fontSize: "14px", color: "#525252", marginBottom: "10px" }}>
          Copy this Markdown into your README:
        </p>
        <pre
          style={{
            background: "#1e1e1e",
            color: "#e5e5e5",
            padding: "16px",
            borderRadius: "8px",
            overflowX: "auto",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          <code>{`[![OpenAI Status](https://downforai.com/api/badge/openai.svg)](https://downforai.com/openai)`}</code>
        </pre>
        <p style={{ fontSize: "13px", color: "#737373", marginTop: "10px" }}>
          Replace <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: "3px" }}>openai</code> with any AI service slug.{" "}
          <Link href="/" style={{ color: "#2563eb" }}>
            Browse all 775+ services →
          </Link>
        </p>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", marginTop: "40px" }}>
          Popular Badges
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px",
          }}
        >
          {POPULAR_BADGES.map((b) => (
            <div
              key={b.slug}
              style={{
                padding: "16px",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <Link
                  href={`/${b.slug}`}
                  style={{ fontWeight: 600, fontSize: "14px", color: "#171717", textDecoration: "none" }}
                >
                  {b.name}
                </Link>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/badge/${b.slug}.svg`}
                  alt={`${b.name} status`}
                  style={{ height: "20px" }}
                />
              </div>
              <details style={{ fontSize: "12px" }}>
                <summary style={{ cursor: "pointer", color: "#2563eb", userSelect: "none" }}>
                  Show code
                </summary>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "8px",
                    borderRadius: "4px",
                    marginTop: "8px",
                    overflowX: "auto",
                    fontSize: "11px",
                    lineHeight: 1.5,
                  }}
                >
                  <code>{`[![${b.name} Status](https://downforai.com/api/badge/${b.slug}.svg)](https://downforai.com/${b.slug})`}</code>
                </pre>
              </details>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", marginTop: "40px" }}>
          HTML version
        </h2>
        <pre
          style={{
            background: "#1e1e1e",
            color: "#e5e5e5",
            padding: "16px",
            borderRadius: "8px",
            overflowX: "auto",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          <code>{`<a href="https://downforai.com/openai">
  <img src="https://downforai.com/api/badge/openai.svg" alt="OpenAI Status" />
</a>`}</code>
        </pre>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", marginTop: "40px" }}>
          JSON Status API
        </h2>
        <p style={{ fontSize: "14px", color: "#525252", marginBottom: "10px" }}>
          Need programmatic access? Fetch the live status as JSON:
        </p>
        <pre
          style={{
            background: "#1e1e1e",
            color: "#e5e5e5",
            padding: "16px",
            borderRadius: "8px",
            overflowX: "auto",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          <code>{`curl https://downforai.com/api/status/openai`}</code>
        </pre>
        <p style={{ fontSize: "13px", color: "#737373", marginTop: "10px" }}>
          Works with any service slug. Returns status, latency, and badge URL.
        </p>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", marginTop: "40px" }}>
          Aggregated Reliability Data
        </h2>
        <p style={{ fontSize: "14px", color: "#525252", marginBottom: "10px" }}>
          Looking for uptime percentages and incident counts?
        </p>
        <pre
          style={{
            background: "#1e1e1e",
            color: "#e5e5e5",
            padding: "16px",
            borderRadius: "8px",
            overflowX: "auto",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          <code>{`curl https://downforai.com/api/reliability-index`}</code>
        </pre>
        <p style={{ fontSize: "13px", color: "#737373", marginTop: "10px" }}>
          Returns 30-day uptime, p50/p95 latency, and incident counts for the 50 most-tracked AI services (from 800+ monitored).
          See the{" "}
          <Link href="/reliability-index" style={{ color: "#2563eb" }}>
            Reliability Index →
          </Link>
        </p>

        <div
          style={{
            marginTop: "48px",
            padding: "20px",
            background: "#f9fafb",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#525252",
            lineHeight: 1.7,
          }}
        >
          <strong>How badges work:</strong> Each badge is an SVG image generated server-side and
          cached at the CDN for 5 minutes. Status reflects the latest probe result — if 5+ users
          report an issue in 2 hours, the badge shows "reported issues" even if probes are green.
          No JavaScript, no tracking, GDPR-friendly.
        </div>

        <p style={{ marginTop: "32px", fontSize: "13px", color: "#737373" }}>
          Missing a service?{" "}
          <Link href="/contact" style={{ color: "#2563eb" }}>
            Contact us
          </Link>{" "}
          — we monitor 775+ AI services.
        </p>
      </div>
    </>
  );
}
