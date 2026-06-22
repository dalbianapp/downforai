import { Metadata } from "next";
import Link from "next/link";
import { getReliabilityLeaderboard, type LeaderboardRow } from "@/lib/reliability/getReliabilityLeaderboard";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import { formatCategoryLabel } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AI Reliability Leaderboard — Incidents, Reports & Uptime | DownForAI",
  description:
    "Compare 90-day reliability signals across 800+ AI services: confirmed incidents, community reports, monitoring confidence, and verified availability. Not a model-speed benchmark.",
  alternates: { canonical: "/reliability-index" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "AI Reliability Leaderboard — Incidents, Reports & Uptime",
    description:
      "90-day reliability signals across 800+ AI services: confirmed incidents, community reports, and verified availability. Signals, not a single misleading ranking.",
    url: "https://downforai.com/reliability-index",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Reliability Leaderboard — Incidents, Reports & Uptime",
    description: "90-day reliability signals across 800+ AI services. Incidents, community reports, verified availability.",
  },
};

// ── Palette (indigo = brand/links only; semantic colors = operational state) ──
const INK = "#0F172A";
const MUTED = "#64748B";
const FAINT = "#94A3B8";
const BORDER = "#E2E8F0";
const PANEL = "#F8FAFC";
const ACCENT = "var(--accent)"; // #4F46E5
const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, monospace)";

const MAIN_CATS = ["LLM", "IMAGE", "VIDEO", "AUDIO", "DEV", "INFRA", "SEARCH", "PRODUCTIVITY"] as const;

const catSlug = (k: string) => k.toLowerCase().replace(/_/g, "-");

const CONFIDENCE_LABEL: Record<string, string> = {
  OFFICIAL_STATUS_API: "Official API",
  OFFICIAL_STATUS_PAGE: "Status page",
  BASIC_PUBLIC_SURFACE: "Basic probe",
  BLOCKED_FROM_PROBES: "Limited",
  UNVERIFIABLE: "Unverifiable",
};
const CONFIDENCE_ORDER = ["OFFICIAL_STATUS_API", "OFFICIAL_STATUS_PAGE", "BASIC_PUBLIC_SURFACE", "BLOCKED_FROM_PROBES", "UNVERIFIABLE"];

const availColor = (v: number | null) =>
  v == null ? FAINT : v >= 99.9 ? "#16A34A" : v >= 99 ? "#65A30D" : v >= 95 ? "#CA8A04" : "#DC2626";
const fmtAvail = (v: number | null) => (v == null ? "—" : `${v.toFixed(2)}%`);
const confLabel = (c: string) => CONFIDENCE_LABEL[c] ?? c;
const svcLink = (r: LeaderboardRow) => (
  <Link href={`/${r.slug}`} style={{ color: INK, fontWeight: 600, textDecoration: "none" }}>{r.name}</Link>
);

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <th style={{ padding: "10px 12px", textAlign: align, fontWeight: 600, fontSize: "12px", color: MUTED, whiteSpace: "nowrap" }}>{children}</th>;
}
const td: React.CSSProperties = { padding: "10px 12px", borderBottom: `1px solid ${BORDER}` };
const tdMono: React.CSSProperties = { ...td, textAlign: "right", fontFamily: MONO };

export default async function ReliabilityLeaderboardPage() {
  const { rows, summary, generatedAt } = await getReliabilityLeaderboard();

  // Section 3 — most reported (raw counts, DESC)
  const mostReported = [...rows].filter((r) => r.reports90d > 0).sort((a, b) => b.reports90d - a.reports90d).slice(0, 20);

  // Section 4 — confirmed incidents (incident minutes DESC, then incidents DESC)
  const withIncidents = [...rows]
    .filter((r) => r.incidents90d > 0)
    .sort((a, b) => b.outageMinutes90d - a.outageMinutes90d || b.incidents90d - a.incidents90d);

  // Section 5 — official sources, grouped (no forced absolute rank)
  const official = rows.filter((r) => r.capability === "OFFICIAL_STATUS_API" || r.capability === "OFFICIAL_STATUS_PAGE");
  // Disjoint severity partition (every official service in exactly one bucket).
  const offOutage = official.filter((r) => r.outageObs90d > 0).sort((a, b) => b.outageObs90d - a.outageObs90d);
  const offDegraded = official.filter((r) => r.outageObs90d === 0 && (r.incidents90d > 0 || r.degradedObs90d > 0)).sort((a, b) => b.degradedObs90d - a.degradedObs90d);
  const offClean = official.filter((r) => r.outageObs90d === 0 && r.incidents90d === 0 && r.degradedObs90d === 0).sort((a, b) => a.name.localeCompare(b.name));

  // Section 6 — category mesh
  const byCat = new Map<string, LeaderboardRow[]>();
  for (const r of rows) (byCat.get(r.category) ?? byCat.set(r.category, []).get(r.category)!).push(r);
  const categorySections = MAIN_CATS.map((key) => {
    const all = byCat.get(key) ?? [];
    const examples = all.filter((r) => r.outageObs90d === 0 && r.incidents90d === 0).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 3);
    return { key, label: formatCategoryLabel(key), tracked: all.length, examples };
  }).filter((c) => c.tracked > 0);
  const remainingCats = [...byCat.keys()].filter((k) => !MAIN_CATS.includes(k as typeof MAIN_CATS[number])).sort();

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://downforai.com" },
    { name: "AI Reliability Leaderboard", url: "https://downforai.com/reliability-index" },
  ]);
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "AI Reliability Leaderboard",
    description:
      "90-day reliability signals for monitored AI services: verified availability (non-outage rate), confirmed incidents, separately-counted degradations, community-reported issues, and monitoring confidence. A blocked probe is never treated as an outage; degraded periods are not counted as downtime.",
    url: "https://downforai.com/reliability-index",
    creator: { "@type": "Organization", name: "DownForAI", url: "https://downforai.com" },
    license: "https://creativecommons.org/licenses/by/4.0/",
    keywords: ["AI reliability", "AI uptime", "AI incidents", "AI service availability", "AI status"],
  };

  const lastUpdated = new Date(generatedAt).toUTCString();
  const keySignals = [
    { n: summary.totalTracked.toString(), t: "services tracked" },
    { n: summary.officialSources.toString(), t: "official status sources" },
    { n: summary.incidents90d.toString(), t: "confirmed incidents (90d)" },
    { n: summary.reports90d.toString(), t: "community reports (90d)" },
    { n: summary.noConfirmedOutage.toString(), t: "services with no confirmed outage (90d)" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "32px 16px" }}>
        <nav style={{ fontSize: "13px", color: FAINT, marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/" style={{ color: FAINT, textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <span style={{ color: MUTED }}>AI Reliability Leaderboard</span>
        </nav>

        {/* ════ 1. HERO ════ */}
        <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: INK, letterSpacing: "-1px", lineHeight: 1.12, marginBottom: "14px" }}>
          AI Reliability Leaderboard
        </h1>
        <p style={{ fontSize: "17px", color: MUTED, lineHeight: 1.6, marginBottom: "16px", maxWidth: "800px" }}>
          Compare 90-day reliability signals across 800+ AI services: confirmed incidents, community reports,
          monitoring confidence, and verified availability. <strong>Not a model-speed benchmark.</strong>
        </p>
        <p style={{ fontSize: "14px", color: INK, lineHeight: 1.6, background: PANEL, borderLeft: `3px solid ${ACCENT}`, borderRadius: "0 8px 8px 0", padding: "12px 16px", marginBottom: "20px", maxWidth: "800px" }}>
          When most AI services have no confirmed hard outage, a single &ldquo;most reliable&rdquo; ranking would be
          misleading. DownForAI shows the underlying reliability signals instead.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
          {[
            { n: summary.totalTracked.toString(), t: "services tracked" },
            { n: summary.officialSources.toString(), t: "official status sources" },
            { n: "90-day", t: "window" },
          ].map((b) => (
            <div key={b.t} style={{ display: "inline-flex", alignItems: "baseline", gap: "6px", background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "9px", padding: "7px 12px" }}>
              <span className="mono" style={{ fontFamily: MONO, fontWeight: 700, fontSize: "14px", color: ACCENT }}>{b.n}</span>
              <span style={{ fontSize: "12px", color: MUTED }}>{b.t}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: FAINT, marginBottom: "40px" }}>Last updated: {lastUpdated}</p>

        {/* ════ 2. KEY SIGNALS ════ */}
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: INK, letterSpacing: "-0.5px", marginBottom: "16px" }}>Key signals (90 days)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px", marginBottom: "44px" }}>
          {keySignals.map((s) => (
            <div key={s.t} style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "16px 18px", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
              <div className="mono" style={{ fontFamily: MONO, fontSize: "26px", fontWeight: 800, color: INK, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: "12px", color: MUTED, marginTop: "6px", lineHeight: 1.35 }}>{s.t}</div>
            </div>
          ))}
        </div>

        {/* ════ 3. MOST REPORTED ════ */}
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: INK, letterSpacing: "-0.5px", marginBottom: "8px" }}>Most reported AI services (90d)</h2>
        <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6, marginBottom: "16px", maxWidth: "800px" }}>
          Raw community reports over the last 90 days. <strong>Not normalized by user base</strong> — popular services may receive more reports.
        </p>
        {mostReported.length > 0 ? (
          <div style={{ overflowX: "auto", borderRadius: "12px", border: `1px solid ${BORDER}`, marginBottom: "44px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead><tr style={{ background: PANEL, borderBottom: `2px solid ${BORDER}` }}>
                <Th>Service</Th><Th>Category</Th><Th align="right">Reports 90d</Th><Th align="right">Confirmed incidents</Th><Th align="right">Availability</Th><Th align="right">Confidence</Th>
              </tr></thead>
              <tbody>
                {mostReported.map((r, i) => (
                  <tr key={r.slug} style={{ background: i % 2 ? PANEL : "#fff" }}>
                    <td style={td}>{svcLink(r)}</td>
                    <td style={{ ...td, color: MUTED, fontSize: "13px" }}>{formatCategoryLabel(r.category)}</td>
                    <td style={{ ...tdMono, fontWeight: 700, color: "#CA8A04" }}>{r.reports90d}</td>
                    <td style={{ ...tdMono, color: r.incidents90d > 0 ? "#DC2626" : FAINT }}>{r.incidents90d}</td>
                    <td style={{ ...tdMono, color: availColor(r.availability90d) }}>{fmtAvail(r.availability90d)}</td>
                    <td style={{ ...td, textAlign: "right", color: MUTED, fontSize: "12px" }}>{confLabel(r.capability)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p style={{ fontSize: "13px", color: FAINT, marginBottom: "44px" }}>No community reports in the last 90 days.</p>}

        {/* ════ 4. CONFIRMED INCIDENTS ════ */}
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: INK, letterSpacing: "-0.5px", marginBottom: "8px" }}>Confirmed incidents (90d)</h2>
        <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6, marginBottom: "16px", maxWidth: "800px" }}>
          Services with confirmed outage or degradation incidents observed by DownForAI. Incident minutes sum the duration of confirmed incidents.
        </p>
        {withIncidents.length > 0 ? (
          <div style={{ overflowX: "auto", borderRadius: "12px", border: `1px solid ${BORDER}`, marginBottom: "44px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead><tr style={{ background: PANEL, borderBottom: `2px solid ${BORDER}` }}>
                <Th>Service</Th><Th>Category</Th><Th align="right">Incidents</Th><Th align="right">Incident minutes</Th><Th align="right">Degraded checks</Th><Th align="right">Availability</Th><Th align="right">Source</Th>
              </tr></thead>
              <tbody>
                {withIncidents.map((r, i) => (
                  <tr key={r.slug} style={{ background: i % 2 ? PANEL : "#fff" }}>
                    <td style={td}>{svcLink(r)}</td>
                    <td style={{ ...td, color: MUTED, fontSize: "13px" }}>{formatCategoryLabel(r.category)}</td>
                    <td style={{ ...tdMono, fontWeight: 700, color: "#DC2626" }}>{r.incidents90d}</td>
                    <td style={{ ...tdMono, color: INK }}>{r.outageMinutes90d.toLocaleString()}</td>
                    <td style={{ ...tdMono, color: r.degradedObs90d > 0 ? "#CA8A04" : FAINT }}>{r.degradedObs90d}</td>
                    <td style={{ ...tdMono, color: availColor(r.availability90d) }}>{fmtAvail(r.availability90d)}</td>
                    <td style={{ ...td, textAlign: "right", color: MUTED, fontSize: "12px" }}>{confLabel(r.capability)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p style={{ fontSize: "13px", color: FAINT, marginBottom: "44px" }}>No confirmed incidents in the last 90 days.</p>}

        {/* ════ 5. OFFICIALLY MONITORED ════ */}
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: INK, letterSpacing: "-0.5px", marginBottom: "8px" }}>Officially monitored reliability leaders</h2>
        <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6, marginBottom: "20px", maxWidth: "800px" }}>
          Restricted to the {official.length} services with an official status API or status page, where availability is measured comparably.
          Grouped by outcome rather than ranked — most have no confirmed hard outage.
        </p>

        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#16A34A", marginBottom: "10px" }}>No confirmed incidents or degradations (90d) — {offClean.length}</h3>
        <div style={{ display: "flex", gap: "6px 12px", flexWrap: "wrap", marginBottom: "28px" }}>
          {offClean.map((r) => (
            <Link key={r.slug} href={`/${r.slug}`} style={{ fontSize: "13px", color: INK, textDecoration: "none", background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "7px", padding: "4px 9px" }}>{r.name}</Link>
          ))}
        </div>

        {offDegraded.length > 0 && (
          <>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#CA8A04", marginBottom: "10px" }}>Confirmed degradations / incidents, no hard outage — {offDegraded.length}</h3>
            <OfficialTable list={offDegraded} />
          </>
        )}
        {offOutage.length > 0 && (
          <>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#DC2626", marginBottom: "10px" }}>Confirmed outages (90d) — {offOutage.length}</h3>
            <OfficialTable list={offOutage} />
          </>
        )}

        {/* ════ 6. CATEGORY MESH ════ */}
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: INK, letterSpacing: "-0.5px", margin: "20px 0 8px" }}>Reliability leaders by category</h2>
        <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.6, marginBottom: "24px", maxWidth: "800px" }}>
          Browse like-for-like reliability rankings within each category.
        </p>
        {categorySections.map(({ key, label, tracked, examples }) => {
          const slug = catSlug(key);
          return (
            <section key={key} style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: INK, margin: 0 }}>{label} <span className="mono" style={{ fontFamily: MONO, fontSize: "12px", color: FAINT, fontWeight: 400 }}>· {tracked} tracked</span></h3>
                <Link href={`/reliability/${slug}`} style={{ fontSize: "14px", fontWeight: 600, color: ACCENT, textDecoration: "none" }}>View full {label} reliability rankings →</Link>
              </div>
              {examples.length > 0 && (
                <div style={{ display: "flex", gap: "6px 10px", flexWrap: "wrap" }}>
                  {examples.map((r) => (
                    <Link key={r.slug} href={`/${r.slug}`} style={{ fontSize: "13px", color: MUTED, textDecoration: "none" }}>{r.name}</Link>
                  ))}
                  <span style={{ fontSize: "13px", color: FAINT }}>· no confirmed outages</span>
                </div>
              )}
            </section>
          );
        })}
        {remainingCats.length > 0 && (
          <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "18px 20px", margin: "16px 0 44px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: INK, marginBottom: "10px" }}>Browse all categories →</div>
            <div style={{ display: "flex", gap: "8px 14px", flexWrap: "wrap" }}>
              {remainingCats.map((k) => (
                <Link key={k} href={`/reliability/${catSlug(k)}`} style={{ fontSize: "13px", color: ACCENT, textDecoration: "none" }}>{formatCategoryLabel(k)}</Link>
              ))}
            </div>
          </div>
        )}

        {/* ════ 7. CONFIDENCE MAP ════ */}
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: INK, marginBottom: "8px" }}>How reliable is our signal?</h2>
        <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6, marginBottom: "16px", maxWidth: "800px" }}>
          Monitoring confidence reflects how a service is observed — the quality of <strong>our measurement</strong>, not the service&apos;s reliability.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "44px" }}>
          {CONFIDENCE_ORDER.filter((c) => (summary.capabilityCounts[c] ?? 0) > 0).map((c) => (
            <div key={c} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "10px 14px" }}>
              <span className="mono" style={{ fontFamily: MONO, fontWeight: 700, fontSize: "16px", color: INK }}>{summary.capabilityCounts[c]}</span>
              <span style={{ fontSize: "12px", color: MUTED, marginLeft: "7px" }}>{confLabel(c)}</span>
            </div>
          ))}
        </div>

        {/* ════ 8. METHODOLOGY ════ */}
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: INK, marginBottom: "12px" }}>How this leaderboard works</h2>
        <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "20px 24px", fontSize: "14px", color: MUTED, lineHeight: 1.7, marginBottom: "44px", maxWidth: "860px" }}>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li><strong>Availability = non-outage rate</strong> over a rolling 90-day window. &ldquo;Down&rdquo; means a hard <strong>OUTAGE</strong> only. A <strong>degraded</strong> period is <strong>not</strong> downtime — it is counted as a separate signal. A blocked or rate-limited probe is never counted as an outage.</li>
            <li><strong>Confirmed incidents</strong> exclude false positives. <strong>Community reports</strong> are user-submitted, counted as <strong>raw totals not normalized by user base</strong>, and shown as their own independent signal — a popular service naturally receives more.</li>
            <li><strong>Monitoring confidence</strong> (official API, status page, basic probe, limited, unverifiable) describes the quality of <strong>our measurement</strong>, not the service&apos;s reliability — we never rank by it.</li>
            <li>Each surface is re-checked roughly every <strong>75 minutes</strong>. Any response-time figures shown elsewhere reflect the monitored surface (often a homepage or status page) — <strong>not model inference speed or tokens-per-second</strong>.</li>
          </ul>
          <div style={{ marginTop: "14px" }}>
            <Link href="/methodology" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>Full methodology →</Link>
          </div>
        </div>

        {/* Related */}
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: INK, marginBottom: "12px" }}>Related</h2>
        <div style={{ display: "flex", gap: "10px 20px", flexWrap: "wrap", fontSize: "14px" }}>
          <Link href="/reliability" style={{ color: ACCENT, textDecoration: "none" }}>Reliability rankings by category →</Link>
          <Link href="/top-outages" style={{ color: ACCENT, textDecoration: "none" }}>Live top outages →</Link>
          <Link href="/methodology" style={{ color: ACCENT, textDecoration: "none" }}>How we monitor →</Link>
          <Link href="/" style={{ color: ACCENT, textDecoration: "none" }}>Live status for 800+ AI services →</Link>
        </div>
      </div>
    </>
  );
}

function OfficialTable({ list }: { list: LeaderboardRow[] }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: "12px", border: `1px solid ${BORDER}`, marginBottom: "28px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead><tr style={{ background: PANEL, borderBottom: `2px solid ${BORDER}` }}>
          <Th>Service</Th><Th>Source</Th><Th align="right">Availability</Th><Th align="right">Incidents</Th><Th align="right">Degraded checks</Th><Th align="right">Reports</Th>
        </tr></thead>
        <tbody>
          {list.map((r, i) => (
            <tr key={r.slug} style={{ background: i % 2 ? PANEL : "#fff" }}>
              <td style={td}>{svcLink(r)}</td>
              <td style={{ ...td, color: MUTED, fontSize: "12px" }}>{confLabel(r.capability)}</td>
              <td style={{ ...tdMono, color: availColor(r.availability90d) }}>{fmtAvail(r.availability90d)}</td>
              <td style={{ ...tdMono, color: r.incidents90d > 0 ? "#DC2626" : FAINT }}>{r.incidents90d}</td>
              <td style={{ ...tdMono, color: r.degradedObs90d > 0 ? "#CA8A04" : FAINT }}>{r.degradedObs90d}</td>
              <td style={{ ...tdMono, color: r.reports90d > 0 ? "#CA8A04" : FAINT }}>{r.reports90d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
