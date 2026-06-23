import { Metadata } from "next";
import Link from "next/link";

// Static editorial snapshot report — no DB. Figures verified against the dataset
// on the snapshot date (23 June 2026); the dataset is point-in-time by design.

const SNAPSHOT = "23 June 2026";
const PATH = "/reports/state-of-ai-reliability-q2-2026";
const REPORT_URL = `https://downforai.com${PATH}`;
const CHART1 = "/reports/chart1-status-gap.svg";
const CHART1_PNG = "https://downforai.com/reports/chart1-status-gap.png";
const CHART2 = "/reports/chart2-llm-gap.svg";
const CHART3 = "/reports/chart3-by-category.svg";
const DATASET = "https://downforai.com/ai-status-services.json";
const CC_BY = "https://creativecommons.org/licenses/by/4.0/";

const TITLE = "The State of AI Reliability — Q2 2026";
const SUBTITLE =
  "The AI status-page gap: only 16% of monitored AI services expose a verified status feed.";
const DESCRIPTION =
  "Only 16% of 817 monitored AI services (134) expose a verified status feed — and just 27% of LLMs. A DownForAI data report, dataset snapshot 23 June 2026. CC BY 4.0.";

export const metadata: Metadata = {
  title: `${TITLE} | DownForAI`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    title: TITLE,
    description: DESCRIPTION,
    url: REPORT_URL,
    images: [{ url: CHART1_PNG, width: 1200, height: 675, alt: SUBTITLE }],
    publishedTime: "2026-06-23T00:00:00.000Z",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [CHART1_PNG],
  },
};

// Verified against current DB on the snapshot date (134/817 = 16%; LLM 17/62 = 27%).
const CATEGORIES: { label: string; services: number; verified: number; pct: number }[] = [
  { label: "Infrastructure", services: 51, verified: 21, pct: 41 },
  { label: "Developer tools", services: 78, verified: 22, pct: 28 },
  { label: "LLM APIs", services: 62, verified: 17, pct: 27 },
  { label: "Productivity", services: 57, verified: 12, pct: 21 },
  { label: "Support AI", services: 35, verified: 7, pct: 20 },
  { label: "Audio", services: 52, verified: 10, pct: 19 },
  { label: "Agents", services: 45, verified: 8, pct: 18 },
  { label: "Search", services: 25, verified: 4, pct: 16 },
  { label: "Vector DB", services: 32, verified: 5, pct: 16 },
  { label: "Image", services: 59, verified: 9, pct: 15 },
  { label: "MLOps", services: 43, verified: 6, pct: 14 },
  { label: "Video", services: 54, verified: 7, pct: 13 },
  { label: "Design", services: 40, verified: 3, pct: 8 },
  { label: "Education", services: 39, verified: 2, pct: 5 },
  { label: "Roleplay", services: 44, verified: 1, pct: 2 },
  { label: "Marketing AI", services: 33, verified: 0, pct: 0 },
  { label: "3D & Avatars", services: 28, verified: 0, pct: 0 },
  { label: "HR AI", services: 10, verified: 0, pct: 0 },
  { label: "Legal AI", services: 10, verified: 0, pct: 0 },
  { label: "Sports-betting AI", services: 20, verified: 0, pct: 0 },
];

const ACCENT = "#4F46E5";
const ACCENT_TINT = "#EEF2FF";
const INK = "#0F172A";
const BODY = "#334155";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const BORDER_SUBTLE = "#F1F5F9";

const h2: React.CSSProperties = {
  fontSize: "27px",
  fontWeight: 800,
  color: INK,
  lineHeight: 1.25,
  letterSpacing: "-0.02em",
  margin: "0 0 16px",
};
const p: React.CSSProperties = {
  fontSize: "17px",
  lineHeight: 1.72,
  color: BODY,
  margin: "0 0 18px",
};
const section: React.CSSProperties = { margin: "48px 0" };
const rule: React.CSSProperties = { height: "1px", background: BORDER_SUBTLE, border: 0, margin: "48px 0" };

function Figure({ src, caption, eager }: { src: string; caption: string; eager?: boolean }) {
  return (
    <figure style={{ margin: "32px 0" }}>
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: "14px", overflow: "hidden", background: "#fff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={caption}
          loading={eager ? "eager" : "lazy"}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>
      <figcaption style={{ fontSize: "13px", color: MUTED, marginTop: "10px", textAlign: "center" }}>
        {caption} · Source: DownForAI, snapshot {SNAPSHOT}.{" "}
        <a href={CC_BY} style={{ color: MUTED, textDecoration: "underline" }}>
          CC BY 4.0
        </a>
      </figcaption>
    </figure>
  );
}

export default function Q2ReliabilityReport() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    headline: TITLE,
    name: TITLE,
    description: DESCRIPTION,
    datePublished: "2026-06-23",
    dateModified: "2026-06-23",
    image: CHART1_PNG,
    url: REPORT_URL,
    inLanguage: "en",
    isAccessibleForFree: true,
    license: CC_BY,
    creditText: "DownForAI",
    author: { "@type": "Organization", name: "DownForAI", url: "https://downforai.com" },
    publisher: {
      "@type": "Organization",
      name: "DownForAI",
      url: "https://downforai.com",
      logo: { "@type": "ImageObject", url: "https://downforai.com/icon.svg" },
    },
    about: { "@type": "Thing", name: "AI service status transparency" },
    keywords: "AI reliability, status page, uptime, AI outages, status feed",
  };

  return (
    <article style={{ maxWidth: "820px", margin: "0 auto", color: BODY }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: "13px", color: MUTED, marginBottom: "28px" }}>
        <Link href="/" style={{ color: ACCENT, textDecoration: "none" }}>Home</Link>
        {" / "}
        <Link href="/reports" style={{ color: ACCENT, textDecoration: "none" }}>Reports</Link>
        {" / "}
        <span>State of AI Reliability — Q2 2026</span>
      </nav>

      {/* Hero */}
      <header style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>
          Data Report · Q2 2026
        </div>
        <h1 style={{ fontSize: "44px", fontWeight: 800, color: INK, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
          The State of AI Reliability
        </h1>
        <p style={{ fontSize: "21px", lineHeight: 1.5, color: MUTED, fontWeight: 500, margin: "0 0 24px" }}>
          {SUBTITLE}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", alignItems: "center", fontSize: "13px", color: MUTED, borderTop: `1px solid ${BORDER_SUBTLE}`, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "14px 0" }}>
          <span>By <strong style={{ color: INK }}>DownForAI</strong></span>
          <span>·</span>
          <span>Dataset snapshot <strong style={{ color: INK }}>{SNAPSHOT}</strong></span>
          <span>·</span>
          <span>817 AI services, 20 categories</span>
          <span>·</span>
          <a href={CC_BY} style={{ color: ACCENT, textDecoration: "none" }}>CC BY 4.0</a>
        </div>
      </header>

      {/* Chart 1 — headline */}
      <Figure src={CHART1} caption="The AI status-page gap — 134 of 817 monitored AI services expose a verified status feed" eager />

      {/* TL;DR stat cards */}
      <section style={{ ...section, marginTop: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px" }}>
          {[
            { big: "16%", small: "of 817 services expose a verified status feed (134)" },
            { big: "27%", small: "of LLMs do — just 17 of 62 monitored" },
            { big: "5", small: "categories with zero verified status feeds" },
          ].map((s) => (
            <div key={s.big} style={{ background: ACCENT_TINT, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "20px" }}>
              <div style={{ fontSize: "40px", fontWeight: 800, color: ACCENT, lineHeight: 1, letterSpacing: "-0.03em" }}>{s.big}</div>
              <div style={{ fontSize: "13px", color: BODY, marginTop: "8px", lineHeight: 1.45 }}>{s.small}</div>
            </div>
          ))}
        </div>
        <p style={{ ...p, fontSize: "16px", marginTop: "22px" }}>
          The practical consequence: for most AI services, when something breaks, teams <strong>cannot independently confirm whether the fault is theirs or their provider&apos;s</strong> — because the provider exposes no status feed to check against. This report and its dataset are free to cite and reuse under{" "}
          <a href={CC_BY} style={{ color: ACCENT }}>CC BY 4.0</a>. Open data:{" "}
          <a href={DATASET} style={{ color: ACCENT }}>downforai.com/ai-status-services.json</a>.
        </p>
      </section>

      <hr style={rule} />

      {/* Why this matters */}
      <section style={section}>
        <h2 style={h2}>Why this matters</h2>
        <p style={p}>
          Modern software runs on AI services it does not control. A single chatbot product might depend on an LLM API, a speech-to-text service, an image generator, and a vector database — four external dependencies, four potential points of failure, owned by four different companies.
        </p>
        <p style={p}>
          When one of them degrades, the product breaks. And the first question every engineering team asks is the same: <strong style={{ color: INK }}>&ldquo;Is it us, or is it them?&rdquo;</strong>
        </p>
        <p style={p}>
          Answering that requires one thing: a way to check the provider&apos;s status independently — something public, official, and machine-readable. A status feed. We wanted to know how often that basic accountability actually exists across the services we track. So we measured it.
        </p>
      </section>

      {/* Headline number */}
      <section style={section}>
        <h2 style={h2}>The headline number: 16%</h2>
        <p style={p}>
          Across the <strong style={{ color: INK }}>817 AI services monitored by DownForAI</strong>, only <strong style={{ color: INK }}>134 expose a verified, machine-readable status feed</strong> — a public status endpoint (such as an Atlassian Statuspage JSON feed or a cloud-provider health API) that we can independently confirm and monitor. That is <strong style={{ color: INK }}>16% of our monitored catalog</strong>.
        </p>
        <p style={p}>
          The other <strong style={{ color: INK }}>683 services (84%)</strong> expose no verified public status feed. Some may communicate incidents through other channels — a support page, a changelog, a social account — but none of these is an official, independently checkable status feed suitable for automated monitoring. We count proof, not promises: a marketing page claiming &ldquo;99.9% uptime&rdquo; does not qualify, and neither does a reachable homepage.
        </p>
        <p style={{ ...p, fontSize: "15px", color: MUTED, fontStyle: "italic" }}>
          A note on scope: this is 16% of DownForAI&apos;s monitored catalog of 817 services — deliberately broad, and weighted toward the long tail of niche and emerging tools. It is not a random sample of &ldquo;the AI industry,&rdquo; and shouldn&apos;t be read as one.
        </p>
      </section>

      {/* LLM blind spot */}
      <section style={section}>
        <h2 style={h2}>The LLM blind spot</h2>
        <p style={p}>The most consequential finding is in the category everyone depends on.</p>
        <Figure src={CHART2} caption="The LLM blind spot — only 17 of 62 monitored LLM services expose a verified status feed" />
        <p style={p}>
          <strong style={{ color: INK }}>Large language models are the foundation of the 2026 AI boom — and only 27% of the ones we monitor expose a verified status feed.</strong> Of 62 LLM services, just 17 publish one. The other 45 offer no verified, machine-readable way to confirm whether they are operational.
        </p>
        <p style={p}>
          The well-known frontier labs mostly do publish status feeds. Names like <strong style={{ color: INK }}>OpenAI, Anthropic, and Mistral</strong> expose clean, machine-readable status endpoints that anyone — including DownForAI — can monitor in real time. That is the model the rest of the category should follow.
        </p>
        <p style={p}>
          The opacity concentrates in the <strong style={{ color: INK }}>long tail of LLM providers</strong>: smaller, regional, and specialized model APIs that quietly power a large share of production applications. They are precisely the services least likely to tell you when they&apos;re down — and the hardest to independently verify when they are.
        </p>
      </section>

      {/* By category */}
      <section style={section}>
        <h2 style={h2}>Transparency tracks technical buyers</h2>
        <p style={p}>Breaking coverage down by category reveals a clear pattern.</p>
        <Figure src={CHART3} caption="Verified status-feed coverage by AI category, across 20 categories" />

        {/* Styled table */}
        <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: "14px", margin: "8px 0 22px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: "440px" }}>
            <thead>
              <tr style={{ background: "#FAFAFC" }}>
                <th style={{ textAlign: "left", padding: "12px 16px", color: MUTED, fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Category</th>
                <th style={{ textAlign: "right", padding: "12px 12px", color: MUTED, fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Services</th>
                <th style={{ textAlign: "right", padding: "12px 12px", color: MUTED, fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Verified</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: MUTED, fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", width: "38%" }}>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((c, i) => (
                <tr key={c.label} style={{ borderTop: `1px solid ${BORDER_SUBTLE}`, background: i % 2 ? "#fff" : "#FCFCFD" }}>
                  <td style={{ padding: "11px 16px", color: INK, fontWeight: 600 }}>{c.label}</td>
                  <td style={{ padding: "11px 12px", textAlign: "right", color: BODY, fontVariantNumeric: "tabular-nums" }}>{c.services}</td>
                  <td style={{ padding: "11px 12px", textAlign: "right", color: BODY, fontVariantNumeric: "tabular-nums" }}>{c.verified}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flex: 1, height: "7px", background: BORDER_SUBTLE, borderRadius: "999px", overflow: "hidden", minWidth: "40px" }}>
                        <div style={{ width: `${c.pct}%`, height: "100%", background: c.pct === 0 ? "transparent" : ACCENT, borderRadius: "999px" }} />
                      </div>
                      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: c.pct === 0 ? MUTED : INK, minWidth: "34px", textAlign: "right" }}>{c.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={p}>
          The pattern suggests status transparency is strongest in categories with <strong style={{ color: INK }}>technical buyers</strong>. Infrastructure (41%) and developer tools (28%) lead — their customers expect, and audit, operational transparency. An engineer evaluating a vector database or a CI tool looks for a status feed, and its absence is a red flag, so vendors provide one.
        </p>
        <p style={p}>
          At the other end, <strong style={{ color: INK }}>five categories had no verified official status feed in our dataset</strong>: marketing AI, 3D &amp; avatar tools, HR AI, legal AI, and sports-betting AI. These serve buyers who rarely ask &ldquo;where&apos;s your status feed?&rdquo; — so it doesn&apos;t get built. (Two of these categories contain only 10 services each, so read the 0% as &ldquo;none detected in a small sample,&rdquo; not a sweeping claim.)
        </p>
      </section>

      {/* Consequences */}
      <section style={section}>
        <h2 style={h2}>What the transparency gap means in practice</h2>
        {[
          { n: "1", t: "Misattributed failures.", d: "When a product breaks and its AI dependency exposes no status feed, blame lands on the wrong party. Support teams burn hours and engineers chase bugs that aren't theirs — because the provider gave no way to rule itself out." },
          { n: "2", t: "Less public accountability.", d: "A provider with no public status surface leaves no public record of its outages. Transparency creates pressure to improve; its absence quietly removes it." },
          { n: "3", t: "The verification gap falls on third parties.", d: "Where official status feeds don't exist, the only remaining signals are independent monitoring and community reports. That's the 84% of our catalog operating on trust alone." },
        ].map((item) => (
          <div key={item.n} style={{ display: "flex", gap: "16px", marginBottom: "18px" }}>
            <div style={{ flexShrink: 0, width: "34px", height: "34px", borderRadius: "10px", background: ACCENT_TINT, color: ACCENT, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{item.n}</div>
            <p style={{ ...p, margin: 0 }}>
              <strong style={{ color: INK }}>{item.t}</strong> {item.d}
            </p>
          </div>
        ))}
      </section>

      <hr style={rule} />

      {/* Methodology */}
      <section style={section}>
        <h2 style={h2}>Methodology &amp; limitations</h2>
        <p style={p}>
          This report is based on DownForAI&apos;s continuous monitoring of <strong style={{ color: INK }}>817 AI services</strong> as of the dataset snapshot dated <strong style={{ color: INK }}>{SNAPSHOT}</strong>, spanning 20 categories from LLM APIs to niche vertical tools.
        </p>
        <p style={p}>
          <strong style={{ color: INK }}>What counts.</strong> A service is counted as having a &ldquo;verified status feed&rdquo; only when it exposes a public, machine-readable status endpoint we can independently confirm and monitor — an Atlassian Statuspage JSON feed, a cloud-provider health API, or equivalent. Self-reported uptime claims, marketing copy, support pages, social posts, and reachable homepages do <strong style={{ color: INK }}>not</strong> qualify.
        </p>
        <p style={p}>
          <strong style={{ color: INK }}>We do not infer outages from probe failures.</strong> A service that blocks automated probes (403, 429, or similar) is recorded as <strong style={{ color: INK }}>unverifiable</strong>, never as &ldquo;down&rdquo; — a blocked probe is not evidence of an outage. Not displaying what we cannot prove is core to how we report.
        </p>
        <ul style={{ ...p, paddingLeft: "20px" }}>
          <li style={{ marginBottom: "10px" }}>The 817-service catalog is <strong style={{ color: INK }}>not a statistically random sample</strong> of the AI industry. It is deliberately broad and over-represents the long tail of niche, regional, and emerging tools. Figures describe <em>DownForAI&apos;s monitored catalog</em>, not &ldquo;the AI industry.&rdquo;</li>
          <li style={{ marginBottom: "10px" }}>Some services may publish a verified status feed that DownForAI has not yet detected. If we missed yours, tell us and we&apos;ll update the dataset.</li>
          <li style={{ marginBottom: "10px" }}>A <strong style={{ color: INK }}>missing status feed does not mean a service is unreliable.</strong> It means its reliability cannot be independently verified — a different, narrower claim.</li>
          <li>Small categories (HR AI, legal AI: 10 services each) make percentages volatile; we report counts alongside percentages for this reason.</li>
        </ul>
        <p style={p}>
          The full dataset — every service, category, DownForAI page, and official status URL where one exists — is published openly at{" "}
          <a href={DATASET} style={{ color: ACCENT }}>downforai.com/ai-status-services.json</a> under CC BY 4.0.
        </p>
      </section>

      {/* Key stats callout */}
      <section style={{ ...section, background: ACCENT_TINT, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "28px 28px 8px" }}>
        <h2 style={{ ...h2, fontSize: "20px" }}>Key stats to cite</h2>
        <ul style={{ ...p, paddingLeft: "20px", fontSize: "16px" }}>
          <li style={{ marginBottom: "10px" }}><strong style={{ color: INK }}>134 of 817</strong> monitored AI services expose a verified, machine-readable status feed (<strong style={{ color: INK }}>16%</strong>).</li>
          <li style={{ marginBottom: "10px" }}>Among LLMs, only <strong style={{ color: INK }}>17 of 62 (27%)</strong> do.</li>
          <li style={{ marginBottom: "10px" }}><strong style={{ color: INK }}>Five categories</strong> — marketing AI, 3D &amp; avatars, HR AI, legal AI, sports-betting AI — had <strong style={{ color: INK }}>zero</strong> verified status feeds.</li>
          <li><strong style={{ color: INK }}>Infrastructure</strong> led all categories at <strong style={{ color: INK }}>41%</strong>; <strong style={{ color: INK }}>roleplay AI</strong> trailed at <strong style={{ color: INK }}>2%</strong>.</li>
        </ul>
      </section>

      {/* Cite this report */}
      <section style={section}>
        <h2 style={h2}>Cite this report</h2>
        <p style={p}>
          Released under <a href={CC_BY} style={{ color: ACCENT }}>CC BY 4.0</a>. Quote, chart, and republish the figures freely with attribution to <strong style={{ color: INK }}>DownForAI (downforai.com)</strong>. The three charts above are hosted on this page and free to reuse with attribution.
        </p>
        <blockquote style={{ margin: "0 0 18px", padding: "16px 20px", borderLeft: `3px solid ${ACCENT}`, background: "#FAFAFC", borderRadius: "0 10px 10px 0", fontSize: "15px", color: BODY, lineHeight: 1.6 }}>
          DownForAI, &ldquo;The State of AI Reliability — Q2 2026.&rdquo; Based on continuous monitoring of 817 AI services; dataset snapshot {SNAPSHOT}.{" "}
          <a href="https://downforai.com/" style={{ color: ACCENT }}>https://downforai.com/</a>
        </blockquote>
        <p style={{ ...p, fontSize: "15px", color: MUTED }}>
          <strong style={{ color: INK }}>Corrections welcome.</strong> If your service publishes an official status feed missing from our dataset, send it to us and we&apos;ll update it. Raw data behind every figure:{" "}
          <a href={DATASET} style={{ color: ACCENT }}>downforai.com/ai-status-services.json</a>.
        </p>
      </section>

      {/* Footer CTA */}
      <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: `1px solid ${BORDER}`, fontSize: "15px", color: MUTED }}>
        DownForAI monitors the real-time status of 800+ AI services — including the obscure, regional, and long-tail providers most status trackers ignore.{" "}
        <Link href="/" style={{ color: ACCENT, fontWeight: 600 }}>Check any AI service&apos;s live status →</Link>
      </div>
    </article>
  );
}
