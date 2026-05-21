import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Outages Report — May 2026: The State of AI Reliability",
  description:
    "Explore the May 2026 AI Outages Report by DownForAI. Real-time data on 817 services, including the major OpenAI crash, latency trends, and uptime rankings.",
  alternates: { canonical: "/reports/ai-outages-may-2026" },
  robots: { index: true, follow: true },
};

export default function AiOutagesMay2026Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
      { "@type": "ListItem", position: 2, name: "Reports", item: "https://downforai.com/reports" },
      { "@type": "ListItem", position: 3, name: "AI Outages May 2026" },
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
        <a href="/reports" style={{ color: "#2563eb", textDecoration: "none" }}>Reports</a>
        {" / "}
        <span>AI Outages May 2026</span>
      </nav>

      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", marginBottom: "24px", lineHeight: 1.2 }}>
        AI Outages Report — May 2026
      </h1>

      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        May 2026 was a turbulent month for AI infrastructure. Across the 817 AI services monitored by DownForAI, we recorded significant volatility, most notably a massive OpenAI outage on April 20 that cascaded into May, and persistent latency issues for image-generation APIs. Community reporting surged by 135%, underscoring a growing reliance on independent monitoring as official status pages continue to lag behind real-world user experiences.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Key Findings
      </h2>
      <ul style={{ marginLeft: "24px", listStyleType: "disc", marginBottom: "16px" }}>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          We collected 283 unique outage reports across 25+ countries, a 135% increase from the previous period.
        </li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          OpenAI experienced a severe, multi-hour outage on April 20, generating 30+ independent reports within minutes.
        </li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          Anthropic maintained the highest large-scale API reliability, at approximately 99.9% uptime.
        </li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          Specialized hardware providers like Groq (~50ms p50) and Cerebras (~80ms p50) dominated the low-latency charts.
        </li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>
          Major AI models actively poll our data: 297 requests/12h from ChatGPT-User, 251 from PerplexityBot.
        </li>
      </ul>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Most Reported Services
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse" as const, marginBottom: "24px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "14px" }}>Rank</th>
            <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "14px" }}>Service</th>
            <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "14px" }}>Community Reports</th>
            <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "14px" }}>Primary Issue</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>1</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}><a href="/civitai" style={{ color: "#2563eb", textDecoration: "underline" }}>Civitai</a></td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>~40</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>Complete Outage / Gateway Timeouts</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>2</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}><a href="/openai" style={{ color: "#2563eb", textDecoration: "underline" }}>OpenAI</a></td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>30+</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>API 500 Errors / ChatGPT Down</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>3</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}><a href="/google-gemini" style={{ color: "#2563eb", textDecoration: "underline" }}>Google Gemini</a></td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>15+</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>High Latency / Connection Refused</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>4</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}><a href="/ollama" style={{ color: "#2563eb", textDecoration: "underline" }}>Ollama</a></td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>15+</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>API errors, local sync failures</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>5</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}><a href="/github-copilot" style={{ color: "#2563eb", textDecoration: "underline" }}>GitHub Copilot</a></td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>12+</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>IDE Disconnections (Recurring)</td>
          </tr>
        </tbody>
      </table>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Notable Incidents
      </h2>

      <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#171717", marginTop: "32px", marginBottom: "12px" }}>
        The OpenAI April 20 Cascade
      </h3>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        On April 20, 2026, OpenAI suffered a massive infrastructure failure. Official status pages showed "Degraded Performance," but our community metrics told a different story: 30 localized reports flooded in from users across Europe and North America within a 45-minute window. This event remains one of the most dramatic incident clusters detected by DownForAI.
      </p>

      <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#171717", marginTop: "32px", marginBottom: "12px" }}>
        SpicyChat &amp; Civitai Volatility
      </h3>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Niche and community-driven AI platforms showed extreme volatility. SpicyChat AI experienced a sudden cluster of 7 reports on May 5. Civitai remains the most heavily reported service on our platform with nearly 40 reports, consistently battling gateway timeouts during peak US evening hours.
      </p>

      <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#171717", marginTop: "32px", marginBottom: "12px" }}>
        NVIDIA NIM Geographic Issues
      </h3>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        We observed persistent high-latency reports for NVIDIA NIM specifically from Italy and Egypt, suggesting regional CDN or routing issues rather than core API failure — meaning your users in some regions may experience outages your US-centric monitoring misses entirely.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Uptime &amp; Latency Rankings
      </h2>

      <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#171717", marginTop: "32px", marginBottom: "12px" }}>
        Top 3 Most Reliable (Uptime)
      </h3>
      <ol style={{ marginLeft: "24px", marginBottom: "16px" }}>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Anthropic (~99.9%)</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Groq (~99.8%)</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Together AI (~99.7%)</li>
      </ol>

      <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#171717", marginTop: "32px", marginBottom: "12px" }}>
        Fastest p50 Latency
      </h3>
      <ol style={{ marginLeft: "24px", marginBottom: "16px" }}>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Groq (~50ms)</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Cerebras (~80ms)</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Together AI (~120ms)</li>
      </ol>

      <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#171717", marginTop: "32px", marginBottom: "12px" }}>
        Slowest p50 Latency
      </h3>
      <ol style={{ marginLeft: "24px", marginBottom: "16px" }}>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Midjourney (~800ms)</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>DALL-E (~600ms)</li>
        <li style={{ marginBottom: "8px", fontSize: "16px", lineHeight: 1.7, color: "#374151" }}>Suno (~500ms)</li>
      </ol>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Stay Ahead of Outages
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Add a live status badge to your project with our <a href="/badges" style={{ color: "#2563eb", textDecoration: "underline" }}>free badge generator</a>. Explore the full <a href="/reliability-index" style={{ color: "#2563eb", textDecoration: "underline" }}>AI Reliability Index</a> for up-to-date rankings.
      </p>
    </div>
  );
}
