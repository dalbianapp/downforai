import { Metadata } from "next";
import Link from "next/link";
import { GLOBAL_ERRORS, getErrorInfo } from "@/lib/ai-symptoms";

export const metadata: Metadata = {
  title: "AI Service Error Guide — Common Errors & Solutions | DownForAI",
  description: "Comprehensive guide to common AI service errors. Learn what each error means, why it happens, and how to fix it. Covers API errors, rate limits, timeouts, authentication issues, and more.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/errors",
  },
};

const FAQ_ITEMS = [
  {
    q: "Why do AI services return errors so often?",
    a: "AI services operate at massive scale, handling millions of requests per day. Errors occur when servers are overloaded by traffic spikes, during infrastructure maintenance, or when upstream dependencies like cloud providers or databases experience issues. Unlike traditional software, AI inference is computationally expensive — a sudden surge in demand can exhaust GPU capacity within seconds, triggering 503 or 429 errors across all users simultaneously.",
  },
  {
    q: "What is a rate limit and how do I avoid hitting it?",
    a: "A rate limit is a cap on how many API requests you can make in a given time window (e.g., 60 requests per minute). AI providers enforce these limits to ensure fair usage and protect their infrastructure. To avoid hitting rate limits, implement exponential backoff in your code, cache repeated responses, batch requests when the API supports it, and monitor the X-RateLimit-Remaining response header to throttle your usage proactively.",
  },
  {
    q: "How long do AI service outages typically last?",
    a: "Most AI service outages are resolved within 15 to 90 minutes. Minor incidents like temporary server overloads usually clear in under 30 minutes. Major infrastructure failures or database issues can take 2 to 6 hours. Incidents affecting specific regions or features tend to resolve faster than full platform outages. Checking the service's official status page gives the most accurate recovery timeline.",
  },
  {
    q: "Is a 503 error on my side or the server's side?",
    a: "A 503 Service Unavailable error is always server-side — it means the server is temporarily unable to handle your request. Nothing in your code or configuration caused it. The most common triggers are server overload, active maintenance, or an upstream dependency failure. The correct response is to wait and retry with exponential backoff. If the error persists beyond 30 minutes, check the service's status page.",
  },
  {
    q: "What should I do first when an AI service stops working?",
    a: "Start by checking DownForAI for real-time status and community reports — this tells you instantly whether others are affected. Then visit the service's official status page (e.g., status.openai.com). If the service appears operational, check your API key validity, review your quota usage in the dashboard, and inspect the exact error code in the response body. For 5xx errors, wait 2-3 minutes and retry before digging into your code.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function ErrorsIndexPage() {
  const errorInfos = GLOBAL_ERRORS.map((slug) => ({
    slug,
    info: getErrorInfo(slug)!,
  }));

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" }}>
        <Link href="/" style={{ color: "#a3a3a3", textDecoration: "none" }}>
          Home
        </Link>
        <span>/</span>
        <span style={{ color: "#525252" }}>Error Guide</span>
      </nav>

      {/* Header */}
      <h1
        style={{
          fontSize: "40px",
          fontWeight: 800,
          color: "#171717",
          letterSpacing: "-2px",
          marginBottom: "16px",
          lineHeight: 1.1,
        }}
      >
        AI Service Error Guide
      </h1>

      {/* Rich intro — ~170 words */}
      <div style={{ fontSize: "16px", color: "#525252", marginBottom: "36px", lineHeight: 1.7 }}>
        <p style={{ margin: "0 0 14px 0" }}>
          AI services — language models, image generators, coding assistants, cloud inference APIs — fail in
          predictable ways. A <strong style={{ color: "#171717" }}>429 Rate Limit</strong> means you sent
          requests too fast. A <strong style={{ color: "#171717" }}>503 Service Unavailable</strong> means the
          servers are overwhelmed or down. An <strong style={{ color: "#171717" }}>authentication error</strong>{" "}
          usually points to an expired or misconfigured API key. Understanding the pattern behind each error
          saves hours of debugging.
        </p>
        <p style={{ margin: 0 }}>
          This guide covers the 10 most common errors across all major AI platforms — what triggers them,
          the root causes engineers most often overlook, and the fastest path to resolution. Each error page
          also links to live service status so you can immediately tell whether the problem is on your side
          or theirs. Browse the errors below or search for a specific service on the{" "}
          <Link href="/" style={{ color: "#2563eb", textDecoration: "none" }}>
            DownForAI homepage
          </Link>
          .
        </p>
      </div>

      {/* Error Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {errorInfos.map(({ slug, info }) => (
          <Link
            key={slug}
            href={`/errors/${slug}`}
            style={{
              display: "block",
              padding: "20px",
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: "12px",
              textDecoration: "none",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>{info.icon}</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>
              {info.title}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, marginBottom: "12px" }}>
              {info.description}
            </div>
            {info.commonCauses && info.commonCauses.length > 0 && (
              <ul style={{ margin: "0 0 12px 0", padding: "0 0 0 16px", listStyle: "disc" }}>
                {info.commonCauses.slice(0, 3).map((cause, i) => (
                  <li key={i} style={{ fontSize: "12px", color: "#9ca3af", lineHeight: 1.5, marginBottom: "2px" }}>
                    {cause}
                  </li>
                ))}
              </ul>
            )}
            <div style={{ fontSize: "13px", color: "#2563eb", fontWeight: 500 }}>
              Learn more →
            </div>
          </Link>
        ))}
      </div>

      {/* FAQ Section */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#171717", marginBottom: "24px", letterSpacing: "-0.5px" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", margin: "0 0 8px 0" }}>
                {item.q}
              </h3>
              <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.7, margin: 0 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Help */}
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>
          Still Having Issues?
        </h2>
        <p style={{ fontSize: "14px", color: "#525252", marginBottom: "16px", lineHeight: 1.6 }}>
          If you&apos;re experiencing errors with a specific AI service, check its real-time status and report issues to help the community.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "#171717",
            color: "#ffffff",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          View All Service Statuses
        </Link>
      </div>
    </div>
  );
}
