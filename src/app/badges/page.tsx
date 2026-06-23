import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import BadgeGenerator from "@/components/badges/BadgeGenerator";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Free AI Status Badges & AI Dependencies Badge | DownForAI",
  description:
    "Generate a live status badge for your README — single AI service or a multi-service 'AI dependencies' badge. Real-time status for 800+ AI services. Free, no API key, no signup.",
  alternates: { canonical: "/badges" },
  robots: { index: true, follow: true },
};

const REPO_URL = "https://github.com/dalbianapp/downforai-status-badges";
const DATASET_URL = "https://downforai.com/ai-status-services.json";

const EXAMPLES: { title: string; src: string; md: string }[] = [
  {
    title: "OpenAI (single service)",
    src: "/api/badge/openai.svg",
    md: "[![OpenAI status](https://downforai.com/api/badge/openai.svg)](https://downforai.com/openai)",
  },
  {
    title: "Anthropic (single service)",
    src: "/api/badge/anthropic.svg",
    md: "[![Anthropic status](https://downforai.com/api/badge/anthropic.svg)](https://downforai.com/anthropic)",
  },
  {
    title: "AI dependencies (OpenAI + Anthropic + Gemini)",
    src: "/api/badge/stack?services=openai,anthropic,google-gemini",
    md: "[![AI dependencies status](https://downforai.com/api/badge/stack?services=openai,anthropic,google-gemini)](https://downforai.com/)",
  },
];

const INK = "#0F172A";
const MUTED = "#475569";
const FAINT = "#94A3B8";
const BORDER = "#E2E8F0";
const PANEL = "#F8FAFC";
const ACCENT = "var(--accent)";

const codeBlock: React.CSSProperties = {
  background: "#0F172A", color: "#E2E8F0", padding: "12px 14px", borderRadius: "8px",
  fontSize: "12px", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", display: "block",
};

export default async function BadgesPage() {
  const services = await prisma.service.findMany({
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://downforai.com" },
    { name: "Status Badges", url: "https://downforai.com/badges" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ fontSize: "clamp(26px,4vw,34px)", fontWeight: 800, color: INK, letterSpacing: "-0.5px", marginBottom: "12px" }}>
          AI Status Badges
        </h1>
        <p style={{ fontSize: "16px", color: MUTED, lineHeight: 1.6, marginBottom: "8px", maxWidth: "720px" }}>
          Show live AI service status in your README, docs, or dashboard. Build a single-service badge or an{" "}
          <strong>“AI dependencies”</strong> badge that aggregates your whole AI stack into one status. Free, no API key, no signup.
        </p>
        <p style={{ fontSize: "13px", color: FAINT, marginBottom: "28px" }}>
          Every badge links back to its live DownForAI page. No JavaScript, no tracking, GDPR-friendly.
        </p>

        {/* Generator */}
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: INK, marginBottom: "12px" }}>Badge generator</h2>
        <BadgeGenerator services={services} />

        {/* Ready-to-copy examples */}
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: INK, margin: "40px 0 12px" }}>Ready to copy</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {EXAMPLES.map((ex) => (
            <div key={ex.title} style={{ border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "16px", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: INK }}>{ex.title}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ex.src} alt={`${ex.title} badge`} style={{ height: "20px" }} />
              </div>
              <code style={codeBlock}>{ex.md}</code>
            </div>
          ))}
        </div>

        {/* How the AI dependencies badge works */}
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: INK, margin: "40px 0 12px" }}>How the AI dependencies badge works</h2>
        <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "18px 22px", fontSize: "14px", color: MUTED, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 8px" }}>
            The stack badge (<code>/api/badge/stack?services=…</code>) aggregates the worst current status across the services you list:
          </p>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li><strong style={{ color: "#16A34A" }}>operational</strong> — every dependency is operational</li>
            <li><strong style={{ color: "#CA8A04" }}>degraded</strong> — at least one dependency is degraded or community-reported</li>
            <li><strong style={{ color: "#DC2626" }}>outage</strong> — at least one dependency has a confirmed outage</li>
            <li><strong style={{ color: "#6B7280" }}>unknown</strong> — at least one dependency can’t be verified (or an unknown slug)</li>
          </ul>
          <p style={{ margin: "10px 0 0" }}>
            Status comes from the same resolver as the rest of DownForAI (official status feeds + HTTP probes + community signal). Add <code>&amp;style=compact</code> for a compact coloured-dot badge. Up to <strong>25</strong> services are evaluated per badge; beyond that the badge shows <strong>unknown</strong> rather than risk a falsely-green result.
          </p>
        </div>

        {/* HTML + JSON API */}
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: INK, margin: "40px 0 12px" }}>HTML &amp; JSON</h2>
        <p style={{ fontSize: "14px", color: MUTED, margin: "0 0 8px" }}>HTML version of any badge:</p>
        <code style={codeBlock}>{`<a href="https://downforai.com/openai"><img src="https://downforai.com/api/badge/openai.svg" alt="OpenAI status" /></a>`}</code>
        <p style={{ fontSize: "14px", color: MUTED, margin: "16px 0 8px" }}>Need raw JSON instead of an image?</p>
        <code style={codeBlock}>{`curl https://downforai.com/api/status/openai`}</code>

        {/* Open dataset */}
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: INK, margin: "40px 0 12px" }}>Open dataset (CC-BY-4.0)</h2>
        <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.6, margin: "0 0 8px", maxWidth: "720px" }}>
          A machine-readable directory of every monitored AI service — slug, name, category, DownForAI URL, badge URL, official
          status URL, and monitoring confidence. Free to reuse under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" style={{ color: ACCENT }} rel="noopener" target="_blank">CC-BY-4.0</a>.
        </p>
        <code style={codeBlock}>{`curl ${DATASET_URL}`}</code>
        <p style={{ fontSize: "13px", color: FAINT, marginTop: "8px" }}>
          <a href={DATASET_URL} style={{ color: ACCENT }} rel="noopener" target="_blank">View the dataset →</a>
        </p>

        {/* Footer links */}
        <div style={{ marginTop: "40px", display: "flex", gap: "10px 20px", flexWrap: "wrap", fontSize: "14px" }}>
          <a href={REPO_URL} style={{ color: ACCENT }} rel="noopener" target="_blank">Badge assets on GitHub →</a>
          <Link href="/reliability-index" style={{ color: ACCENT }}>AI Reliability Leaderboard →</Link>
          <Link href="/" style={{ color: ACCENT }}>Browse all 800+ services →</Link>
        </div>
      </div>
    </>
  );
}
