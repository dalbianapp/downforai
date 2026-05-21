import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Reliability Data for Journalists, Researchers & Developers",
  description:
    "DownForAI monitors 817 AI services in real time. Access free data, API endpoints, reliability indexes, and monthly reports.",
  alternates: { canonical: "/data" },
  robots: { index: true, follow: true },
};

export default function DataPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
      { "@type": "ListItem", position: 2, name: "Data" },
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
        <span>Data</span>
      </nav>

      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", marginBottom: "24px", lineHeight: 1.2 }}>
        AI Reliability Data
      </h1>

      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        DownForAI is the largest independent monitoring platform for AI services. We track uptime, latency, and community-reported incidents across 817 AI services in real time. Our data is free, open, and available via multiple access methods.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Available Resources
      </h2>

      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "16px", color: "#171717", marginBottom: "8px" }}>Public JSON API</div>
        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", margin: 0, marginBottom: "8px" }}>
          Query current status for any service. Returns live status, latency, and incident data.
        </p>
        <a href="/developers" style={{ color: "#2563eb", textDecoration: "underline" }}>API Documentation →</a>
      </div>

      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "16px", color: "#171717", marginBottom: "8px" }}>AI Reliability Index</div>
        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", margin: 0, marginBottom: "8px" }}>
          Rankings by uptime, latency, and incident frequency. Updated in real time.
        </p>
        <a href="/reliability-index" style={{ color: "#2563eb", textDecoration: "underline" }}>View Reliability Index →</a>
      </div>

      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "16px", color: "#171717", marginBottom: "8px" }}>Monthly Reports</div>
        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", margin: 0, marginBottom: "8px" }}>
          Aggregate analysis of AI outages, latency trends, and community reports.
        </p>
        <a href="/reports/ai-outages-may-2026" style={{ color: "#2563eb", textDecoration: "underline" }}>AI Outages — May 2026 →</a>
      </div>

      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "16px", color: "#171717", marginBottom: "8px" }}>Status Badges</div>
        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", margin: 0, marginBottom: "8px" }}>
          SVG badges for GitHub READMEs, documentation, and dashboards.
        </p>
        <a href="/badges" style={{ color: "#2563eb", textDecoration: "underline" }}>Get Badges →</a>
      </div>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Coverage
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Our current monitoring scope:
      </p>
      <ul style={{ marginLeft: "24px", listStyleType: "disc", marginBottom: "16px" }}>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>817 AI services across 17 categories</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Checks every 75 minutes from multiple geographic locations</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>p50 and p95 latency measurements per probe</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Community reports from users in 25+ countries</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Incident tracking with status classification (Operational, Degraded, Outage, Reported Issues)</li>
      </ul>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        How to Cite DownForAI
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        For articles and research:
      </p>
      <pre style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", overflowX: "auto" as const, marginBottom: "16px" }}>
        {`Data from DownForAI (https://downforai.com), accessed [date].`}
      </pre>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        For report citations:
      </p>
      <pre style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", overflowX: "auto" as const, marginBottom: "16px" }}>
        {`DownForAI, "AI Outages — May 2026," https://downforai.com/reports/ai-outages-may-2026`}
      </pre>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        License
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Our aggregated status data and reports are available under <strong>CC-BY-4.0</strong>. Free to use with attribution.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Contact
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        For data requests, press inquiries, or research collaboration:{" "}
        <a href="mailto:dalbian.app@gmail.com" style={{ color: "#2563eb", textDecoration: "underline" }}>dalbian.app@gmail.com</a>
      </p>
    </div>
  );
}
