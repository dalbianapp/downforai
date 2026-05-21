import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About DownForAI: Independent AI Status Monitoring",
  description:
    "DownForAI monitors 817 AI services in real time, tracking uptime, latency, incidents, and community reports worldwide.",
  alternates: { canonical: "/about" },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
      { "@type": "ListItem", position: 2, name: "About" },
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
        <span>About</span>
      </nav>

      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", marginBottom: "24px", lineHeight: 1.2 }}>
        About DownForAI
      </h1>

      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        DownForAI is an independent monitoring platform for AI services. We track availability, latency, and incident signals of 817 AI services — from large language models to image generators, coding assistants, vector databases, and specialized AI tools.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Why We Built DownForAI
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        AI tools are now part of daily work for millions of developers, creators, and businesses. When they go down, information is fragmented: official status pages lag behind reality, social media is noisy, and users are left wondering "is it just me?" DownForAI brings all signals together — synthetic monitoring, latency measurement, and community reports — into one real-time dashboard.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Our Scale
      </h2>
      <ul style={{ marginLeft: "24px", listStyleType: "disc", marginBottom: "16px" }}>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>817 services monitored in real time</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Automated checks every 75 minutes from multiple locations</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>p50 and p95 latency measurements per probe</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>283 community reports collected from users in 25+ countries</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Major LLMs actively query our data: ChatGPT-User and PerplexityBot send hundreds of requests per 12-hour window for their own status awareness</li>
      </ul>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Our Methodology
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Two complementary data streams:
      </p>
      <ul style={{ marginLeft: "24px", listStyleType: "disc", marginBottom: "16px" }}>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          Synthetic Testing — automated endpoint checks measuring HTTP response times and status codes across all monitored services
        </li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          Community Verification — user reports that capture issues automated checks may miss, including regional failures and quality degradation
        </li>
      </ul>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Read the full <a href="/methodology" style={{ color: "#2563eb", textDecoration: "underline" }}>Methodology →</a>
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Independence
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        DownForAI is entirely independent. Not sponsored by, affiliated with, or funded by any AI provider. When <a href="/openai" style={{ color: "#2563eb", textDecoration: "underline" }}>OpenAI</a> fails, we report it. When <a href="/groq" style={{ color: "#2563eb", textDecoration: "underline" }}>Groq</a> is the fastest, the data proves it. Our monitoring is the same for every service.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Built by Dalbian
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Based in France. We built DownForAI because AI reliability is too important to remain scattered across status pages, social posts, and anecdotal reports. The infrastructure that powers our work is increasingly critical — it deserves the same monitoring rigor as traditional software.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Explore
      </h2>
      <ul style={{ marginLeft: "24px", listStyleType: "disc", marginBottom: "16px" }}>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          <a href="/reliability-index" style={{ color: "#2563eb", textDecoration: "underline" }}>AI Reliability Index</a> — live uptime and latency rankings
        </li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          <a href="/badges" style={{ color: "#2563eb", textDecoration: "underline" }}>Status Badges</a> — embed live status in your README
        </li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          <a href="/developers" style={{ color: "#2563eb", textDecoration: "underline" }}>Developer API</a> — programmatic status access
        </li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          <a href="/data" style={{ color: "#2563eb", textDecoration: "underline" }}>Data for Researchers</a> — reports, API, citation formats
        </li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          <a href="/guides" style={{ color: "#2563eb", textDecoration: "underline" }}>Guides &amp; Reports</a> — monitoring strategies and monthly outage reports
        </li>
      </ul>
    </div>
  );
}
