import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developers — Status Badges & API | DownForAI",
  description:
    "Embed real-time AI service status badges in your README, docs, or dashboard. Free, no API key required.",
  alternates: { canonical: "/developers" },
  robots: { index: true, follow: true },
};

const EXAMPLES = [
  { slug: "openai",        name: "OpenAI" },
  { slug: "anthropic",     name: "Anthropic" },
  { slug: "google-gemini", name: "Google Gemini" },
  { slug: "github-copilot",name: "GitHub Copilot" },
  { slug: "ollama",        name: "Ollama" },
];

export default function DevelopersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "DownForAI for Developers",
    url: "https://downforai.com/developers",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",       item: "https://downforai.com" },
        { "@type": "ListItem", position: 2, name: "Developers", item: "https://downforai.com/developers" },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 16px 64px" }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: "13px", color: "#525252", marginBottom: "32px", display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/" style={{ color: "#525252", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <span style={{ color: "#171717" }}>Developers</span>
        </nav>

        {/* Header */}
        <header style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#171717", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "12px" }}>
            DownForAI for Developers
          </h1>
          <p style={{ fontSize: "17px", color: "#525252", lineHeight: 1.6 }}>
            Embed real-time AI service status in your README, docs, or dashboard.
            Free, no API key required, updates every 5 minutes.
          </p>
        </header>

        {/* Badge URL format */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            Status Badges
          </h2>
          <p style={{ color: "#525252", lineHeight: 1.7, marginBottom: "16px" }}>
            Add a live status badge for any AI service to your project. The badge
            shows the current status and links back to the full status dashboard.
          </p>

          <div style={{ background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#525252", marginBottom: "10px" }}>Badge URL format</div>
            <code style={{ display: "block", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "12px 16px", fontFamily: "monospace", fontSize: "14px", color: "#171717" }}>
              {"https://downforai.com/api/badge/{service-slug}.svg"}
            </code>
          </div>

          {/* Live examples */}
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#171717", marginBottom: "12px" }}>
            Live examples
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {EXAMPLES.map((s) => (
              <div key={s.slug} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <a href={`/${s.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/badge/${s.slug}.svg`} alt={`${s.name} status`} style={{ height: "20px" }} />
                </a>
                <code style={{ fontFamily: "monospace", fontSize: "12px", color: "#6b7280" }}>
                  /api/badge/{s.slug}.svg
                </code>
              </div>
            ))}
          </div>

          {/* Markdown */}
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#171717", marginBottom: "8px" }}>
            Markdown (GitHub README)
          </h3>
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "12px 16px", fontFamily: "monospace", fontSize: "13px", color: "#171717", overflowX: "auto", marginBottom: "20px" }}>
            {"[![OpenAI status](https://downforai.com/api/badge/openai.svg)](https://downforai.com/openai)"}
          </div>

          {/* HTML */}
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#171717", marginBottom: "8px" }}>
            HTML
          </h3>
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "12px 16px", fontFamily: "monospace", fontSize: "13px", color: "#171717", overflowX: "auto" }}>
            {'<a href="https://downforai.com/openai"><img src="https://downforai.com/api/badge/openai.svg" alt="OpenAI status" /></a>'}
          </div>
        </section>

        {/* How it works */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            How it works
          </h2>
          <ul style={{ color: "#525252", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <li>Badges reflect the latest probe result, updated every 2–5 minutes</li>
            <li>CDN-cached for 5 minutes — fast worldwide, minimal database load</li>
            <li>If 5+ users report issues in 2 hours, badge shows "reported issues" even if probes are green</li>
            <li>No API key required — free and unlimited</li>
            <li>SVG format — sharp on all screens, under 2KB</li>
          </ul>
        </section>

        {/* Available services */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            Available services
          </h2>
          <p style={{ color: "#525252", lineHeight: 1.7, marginBottom: "12px" }}>
            Badges are available for all 810+ services monitored by DownForAI.
            Find the service slug in the URL of its status page:
          </p>
          <ul style={{ color: "#525252", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
            <li><code style={{ fontFamily: "monospace" }}>downforai.com/openai</code> → slug: <code style={{ fontFamily: "monospace" }}>openai</code></li>
            <li><code style={{ fontFamily: "monospace" }}>downforai.com/github-copilot</code> → slug: <code style={{ fontFamily: "monospace" }}>github-copilot</code></li>
            <li><code style={{ fontFamily: "monospace" }}>downforai.com/ollama</code> → slug: <code style={{ fontFamily: "monospace" }}>ollama</code></li>
          </ul>
          <Link href="/" style={{ color: "#2563eb", textDecoration: "underline", fontSize: "14px" }}>
            Browse all 810+ monitored services →
          </Link>
        </section>

        {/* Coming soon */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            Coming soon
          </h2>
          <ul style={{ color: "#525252", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <li><strong style={{ color: "#171717" }}>JSON API</strong> — Programmatic access to status, incidents, and latency</li>
            <li><strong style={{ color: "#171717" }}>Webhooks</strong> — Get notified when a service goes down</li>
            <li><strong style={{ color: "#171717" }}>RSS/Atom feed</strong> — Subscribe to incident updates</li>
          </ul>
          <p style={{ color: "#6b7280", lineHeight: 1.7, marginTop: "16px", fontSize: "14px" }}>
            Want to be notified when these ship?{" "}
            <Link href="/contact" style={{ color: "#2563eb", textDecoration: "underline" }}>
              Get in touch →
            </Link>
          </p>
        </section>

        {/* See also */}
        <section>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
            See also
          </h2>
          <ul style={{ color: "#525252", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>
              <Link href="/guides/how-to-monitor-ai-api-status" style={{ color: "#2563eb", textDecoration: "underline" }}>
                How to Monitor AI API Status in Your Application
              </Link>
              {" "}— Circuit breakers, fallback patterns, and custom checks
            </li>
            <li>
              <Link href="/data" style={{ color: "#2563eb", textDecoration: "underline" }}>
                Data for Researchers & Journalists
              </Link>
              {" "}— API access, citation formats, and open data license
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
