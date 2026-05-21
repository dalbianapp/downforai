import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Monitor AI API Status in Your Application",
  description:
    "A technical guide for developers on monitoring AI API reliability. Learn fallback mechanisms, custom monitoring, and the DownForAI JSON API.",
  alternates: { canonical: "/guides/how-to-monitor-ai-api-status" },
  robots: { index: true, follow: true },
};

export default function HowToMonitorAiApiStatusPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://downforai.com/guides" },
      { "@type": "ListItem", position: 3, name: "How to Monitor AI API Status" },
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
        <a href="/guides" style={{ color: "#2563eb", textDecoration: "none" }}>Guides</a>
        {" / "}
        <span>How to Monitor AI API Status</span>
      </nav>

      <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", marginBottom: "24px", lineHeight: 1.2 }}>
        How to Monitor AI API Status in Your Application
      </h1>

      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Official status pages are not enough. They often show "All Systems Operational" while users experience 500 errors or massive latency spikes. DownForAI monitors 817 services every 75 minutes across multiple checkpoints. Here is how to integrate real-time AI monitoring into your development workflow.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Why Official Status Pages Fail
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Official status pages may not show: early degradation before a threshold is crossed, regional problems that affect only some users, product-specific failures on one endpoint, latency increases that degrade UX without breaking requests, intermittent errors that are hard to reproduce, or downstream impact on services that depend on an AI provider.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Method 1 — The Fallback &amp; Circuit Breaker Pattern
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Never hardcode a single AI provider. Implement a circuit breaker: if Provider A times out or returns errors above a threshold, automatically route to Provider B. This pattern is the single most effective reliability improvement for AI-dependent applications.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Method 2 — DownForAI Status API
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Query live status for any service programmatically.
      </p>
      <pre style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", overflowX: "auto" as const, marginBottom: "16px" }}>
        {`curl https://downforai.com/api/status/openai`}
      </pre>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Use the response to make routing decisions:
      </p>
      <pre style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", overflowX: "auto" as const, marginBottom: "16px" }}>
        {`async function getReliableProvider() {
  const res = await fetch('https://downforai.com/api/status/openai');
  const data = await res.json();

  if (data.status === 'degraded' || data.latency_ms > 2000) {
    console.log('OpenAI struggling. Falling back to Anthropic.');
    return useAnthropicApi();
  }
  return useOpenAiApi();
}`}
      </pre>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        See full documentation on the <a href="/developers" style={{ color: "#2563eb", textDecoration: "underline" }}>Developers page →</a>
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Method 3 — GitHub Status Badges
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Add a live status badge to your README so contributors always see the current state of your dependencies:
      </p>
      <pre style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", overflowX: "auto" as const, marginBottom: "16px" }}>
        {`[![OpenAI Status](https://downforai.com/api/badge/openai.svg)](https://downforai.com/openai)`}
      </pre>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        Visit the <a href="/badges" style={{ color: "#2563eb", textDecoration: "underline" }}>Badge Generator</a> for any of our 817 monitored services.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Method 4 — Custom AI Endpoint Checks
      </h2>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        For production applications with strict SLAs, build custom checks that send lightweight requests to the exact same endpoint your application uses. This catches failures that generic HTTP checks miss — for example, when a model returns 200 but the response quality is degraded. Use DownForAI as an external complement for independent signal.
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#171717", marginTop: "40px", marginBottom: "16px", lineHeight: 1.3 }}>
        Recommended Monitoring Stack
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse" as const, marginBottom: "24px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "14px" }}>Layer</th>
            <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "14px" }}>Tool</th>
            <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left" as const, fontWeight: 700, background: "#f9fafb", fontSize: "14px" }}>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>External signal</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>DownForAI</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>Independent provider status</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>Custom checks</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>Your monitoring platform</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>Exact endpoint validation</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>Circuit breaker</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>In-application logic</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>Automatic failover</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>Status badges</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>DownForAI badges</td>
            <td style={{ border: "1px solid #e5e7eb", padding: "12px", fontSize: "14px", color: "#374151" }}>Team awareness</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#374151", marginBottom: "16px" }}>
        See also: <a href="/guides/ai-api-uptime-comparison-2026" style={{ color: "#2563eb", textDecoration: "underline" }}>AI API Uptime Comparison 2026 →</a>
      </p>
    </div>
  );
}
