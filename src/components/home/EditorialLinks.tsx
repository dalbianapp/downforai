import Link from "next/link";

const EDITORIAL_LINKS = [
  {
    href: "/reliability-index",
    title: "AI Reliability Leaderboard",
    description: "90-day incidents, community reports, and verified availability across 800+ AI services.",
  },
  {
    href: "/guides/ai-api-uptime-comparison-2026",
    title: "AI API Uptime Comparison 2026",
    description: "Reliability deep-dive on 50 major AI services — from 800+ monitored.",
  },
  {
    href: "/reliability",
    title: "AI Reliability Rankings",
    description: "90-day rolling reliability scores by category.",
  },
  {
    href: "/top-outages",
    title: "Live Top Outages",
    description: "The most-reported AI services right now.",
  },
  {
    href: "/reports/2026-05",
    title: "May 2026 Outage Report",
    description: "Monthly breakdown of incidents, causes, and affected services.",
  },
  {
    href: "/methodology",
    title: "How We Monitor",
    description: "Synthetic probes, latency measurement, and community signals explained.",
  },
  {
    href: "/data",
    title: "Open Data for Researchers",
    description: "Community reports, API access, and citation formats.",
  },
  {
    href: "/guides",
    title: "All Guides",
    description: "Deep dives into AI monitoring, downtime patterns, and best practices.",
  },
];

export function EditorialLinks() {
  return (
    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: "16px",
        padding: "28px 24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: "#0F172A",
            margin: 0,
            marginBottom: "4px",
          }}
        >
          AI Reliability Research
        </h2>
        <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
          Uptime data, incident reports, and monitoring guides
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "10px",
        }}
      >
        {EDITORIAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: "block",
              padding: "12px 14px",
              background: "#ffffff",
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#0F172A",
                marginBottom: "3px",
              }}
            >
              {link.title}
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.4 }}>
              {link.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
