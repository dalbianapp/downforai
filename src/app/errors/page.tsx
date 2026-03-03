import { Metadata } from "next";
import Link from "next/link";
import { GLOBAL_ERRORS, getErrorInfo } from "@/lib/ai-symptoms";

export const metadata: Metadata = {
  title: "AI Service Error Guide — Common Errors & Solutions | DownForAI",
  description: "Comprehensive guide to common AI service errors. Learn what each error means, why it happens, and how to fix it. Covers API errors, rate limits, timeouts, authentication issues, and more.",
  alternates: {
    canonical: "/errors",
  },
};

export default function ErrorsIndexPage() {
  const errorInfos = GLOBAL_ERRORS.map((slug) => ({
    slug,
    info: getErrorInfo(slug)!,
  }));

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
      <p style={{ fontSize: "17px", color: "#525252", marginBottom: "32px", lineHeight: 1.6 }}>
        Common errors you might encounter when using AI services, what they mean, and how to fix them.
      </p>

      {/* Error Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "16px", marginBottom: "32px" }}>
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
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>{info.icon}</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>
              {info.title}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>
              {info.description}
            </div>
            <div style={{ fontSize: "13px", color: "#2563eb", marginTop: "12px", fontWeight: 500 }}>
              Learn more →
            </div>
          </Link>
        ))}
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
          If you're experiencing errors with a specific AI service, check its real-time status and report issues to help the community.
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
