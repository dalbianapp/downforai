import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology — How DownForAI detects AI incidents | DownForAI",
  description:
    "How DownForAI monitors 800+ AI services: probe cadence, classification logic, signal sources, and what we don't claim. Independent, data-driven, transparent.",
  alternates: { canonical: "/methodology" },
  robots: { index: true, follow: true },
};

export default function MethodologyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "DownForAI Methodology",
    url: "https://downforai.com/methodology",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
        { "@type": "ListItem", position: 2, name: "Methodology", item: "https://downforai.com/methodology" },
      ],
    },
  };

  const sectionStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  };

  const h2Style = {
    fontSize: "20px",
    fontWeight: 700 as const,
    color: "#171717",
    margin: 0,
  };

  const pStyle = {
    color: "#171717",
    lineHeight: 1.75,
    margin: 0,
    fontSize: "15px",
  };

  const liStyle = {
    color: "#171717",
    lineHeight: 1.75,
    fontSize: "15px",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article style={{ display: "flex", flexDirection: "column", gap: "40px", maxWidth: "720px" }}>
        <nav style={{ fontSize: "13px", color: "#525252" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#525252" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#171717" }}>Methodology</span>
        </nav>

        <header style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#171717", letterSpacing: "-1px", margin: 0 }}>
            How DownForAI Works
          </h1>
          <p style={{ fontSize: "17px", color: "#525252", margin: 0, lineHeight: 1.6 }}>
            Transparency about what we measure, how we measure it, and what we don't claim.
          </p>
        </header>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Who we are</h2>
          <p style={pStyle}>
            DownForAI is an independent monitoring project for AI services, operated as a
            solo technical effort. We have no affiliation, sponsorship, or financial
            relationship with any AI provider listed on this site. We are not paid to
            report any particular status.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>How we detect incidents</h2>
          <p style={pStyle}>
            We run automated HTTP probes every 2 to 5 minutes against each monitored
            service from multiple geographically distributed locations. For each probe, we record:
          </p>
          <ul style={{ paddingLeft: "24px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            <li style={liStyle}>HTTP response code (200, 429, 5xx, etc.)</li>
            <li style={liStyle}>Response latency in milliseconds</li>
            <li style={liStyle}>TLS handshake success / failure</li>
            <li style={liStyle}>Response body signals (content-type, error patterns)</li>
            <li style={liStyle}>Regional path / CDN edge hit</li>
          </ul>
          <p style={pStyle}>
            We classify each service surface as <strong>Operational</strong>,{" "}
            <strong>Degraded</strong>, or <strong>Outage</strong> based on a weighted
            combination of probe results over a rolling time window. We also compute
            latency baselines (median and median absolute deviation) to detect statistical
            anomalies distinct from hard errors.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>How we classify incidents</h2>
          <p style={pStyle}>
            When a service shows degraded or failed probes, we apply a diagnosis classifier
            with four possible outcomes:
          </p>
          <ul style={{ paddingLeft: "24px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <li style={liStyle}>
              <strong>Global outage</strong> — Multiple surfaces across multiple probe
              locations report failure. Concurrent community reports increase confidence.
            </li>
            <li style={liStyle}>
              <strong>Partial incident</strong> — A single surface degraded (e.g. API fails
              while web works) or isolated regional failure.
            </li>
            <li style={liStyle}>
              <strong>Local / client-side issue</strong> — All probes healthy, no significant
              volume of community reports. The issue is likely on the user's end (network,
              credentials, rate limits).
            </li>
            <li style={liStyle}>
              <strong>Inconclusive</strong> — Insufficient signal. We prefer honesty over
              false positives.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Our signal sources</h2>
          <ul style={{ paddingLeft: "24px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <li style={liStyle}>
              <strong>Live monitoring</strong> — Our own automated probes. Primary signal.
            </li>
            <li style={liStyle}>
              <strong>Status page sync</strong> — When a provider's official status page
              reports an incident, we surface it. Secondary signal.
            </li>
            <li style={liStyle}>
              <strong>Community reports</strong> — User-submitted reports on this site.
              Tertiary signal; used to corroborate probe data, not to declare outages on
              their own.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>What we don't claim</h2>
          <p style={pStyle}>
            DownForAI is <strong>not</strong> an SLA, an insurance product, or an official
            source. We show you signal. We show you data. We show you what we see. We don't:
          </p>
          <ul style={{ paddingLeft: "24px", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            <li style={liStyle}>Claim authority over any provider's true service status</li>
            <li style={liStyle}>Replace the provider's official status page</li>
            <li style={liStyle}>Guarantee that our classification is always correct</li>
            <li style={liStyle}>Detect incidents that do not affect our probes or that resolve faster than our cadence</li>
          </ul>
          <p style={pStyle}>
            When our signal conflicts with the provider's official status page, check both.
            When our signal matches community reports but the official page is green,
            that's exactly the kind of gap we try to surface.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>How to interpret what you see</h2>
          <ul style={{ paddingLeft: "24px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <li style={liStyle}>
              <strong>Operational but slow</strong> — Service responds, but latency is above
              baseline. Check your integrations for timeouts.
            </li>
            <li style={liStyle}>
              <strong>Degraded</strong> — Some probes fail. If only one surface is affected,
              the issue is likely partial. Consider a fallback.
            </li>
            <li style={liStyle}>
              <strong>Outage</strong> — Multiple probes fail across regions. Cross-check the
              provider's status page.
            </li>
            <li style={liStyle}>
              <strong>No data</strong> — Either monitoring is paused for this surface, or
              probes haven't had time to run yet.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Browse incidents</h2>
          <p style={pStyle}>
            All major incidents detected by our monitoring are archived publicly. Browse
            by month or by service in the{" "}
            <Link href="/incidents" style={{ color: "#2563eb", textDecoration: "underline" }}>
              incidents archive
            </Link>
            .
          </p>
        </section>
      </article>
    </>
  );
}
