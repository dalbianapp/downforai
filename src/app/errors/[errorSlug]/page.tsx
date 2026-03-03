import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GLOBAL_ERRORS, getErrorInfo } from "@/lib/ai-symptoms";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // Cache for 1 hour

export async function generateStaticParams() {
  return GLOBAL_ERRORS.map((slug) => ({ errorSlug: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ errorSlug: string }>;
}): Promise<Metadata> {
  const { errorSlug } = await params;
  const errorInfo = getErrorInfo(errorSlug);

  if (!errorInfo) return {};

  return {
    title: `${errorInfo.title} — What It Means & How to Fix It | DownForAI`,
    description: `${errorInfo.description} Learn the common causes of ${errorInfo.title.toLowerCase()}, practical solutions, and which AI services are currently affected.`,
  };
}

async function getAffectedServices(errorSlug: string) {
  // Map error to relevant symptoms
  const symptomMapping: Record<string, string[]> = {
    "api-error": ["api-error"],
    "rate-limit": ["api-error", "slow-response"],
    "timeout": ["slow-response", "not-working"],
    "authentication-failed": ["login-issue"],
    "server-error": ["not-working"],
    "maintenance": ["not-working"],
    "network-error": ["not-working"],
    "quota-exceeded": ["api-error"],
    "service-unavailable": ["not-working"],
    "connection-failed": ["not-working"],
  };

  const relevantSymptoms = symptomMapping[errorSlug] || [];

  if (relevantSymptoms.length === 0) return [];

  // Get services currently experiencing issues
  const recentReports = await prisma.communityReport.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // Last 6h
    },
    include: {
      service: {
        select: {
          slug: true,
          name: true,
          category: true,
        },
      },
    },
    distinct: ["serviceId"],
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return recentReports.map((report) => ({
    slug: report.service.slug,
    name: report.service.name,
    category: report.service.category,
  }));
}

export default async function ErrorPage({
  params,
}: {
  params: Promise<{ errorSlug: string }>;
}) {
  const { errorSlug } = await params;

  // Only allow predefined errors
  if (!GLOBAL_ERRORS.includes(errorSlug)) {
    notFound();
  }

  const errorInfo = getErrorInfo(errorSlug);
  if (!errorInfo) notFound();

  const affectedServices = await getAffectedServices(errorSlug);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" }}>
        <Link href="/" style={{ color: "#a3a3a3", textDecoration: "none" }}>
          Home
        </Link>
        <span>/</span>
        <Link href="/errors" style={{ color: "#a3a3a3", textDecoration: "none" }}>
          Errors
        </Link>
        <span>/</span>
        <span style={{ color: "#525252" }}>{errorInfo.title}</span>
      </nav>

      {/* H1 */}
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
        {errorInfo.icon} {errorInfo.title}
      </h1>
      <p style={{ fontSize: "18px", color: "#525252", marginBottom: "32px", lineHeight: 1.6 }}>
        What it means & how to fix it
      </p>

      {/* Description Card */}
      <div
        style={{
          background: "#fef2f2",
          border: "2px solid #fecaca",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#dc2626", marginBottom: "12px" }}>
          What is this error?
        </div>
        <div style={{ fontSize: "15px", color: "#525252", lineHeight: 1.7 }}>
          {errorInfo.description}
        </div>
        {errorInfo.technicalDetails && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "#ffffff",
              borderRadius: "8px",
              fontSize: "13px",
              fontFamily: "monospace",
              color: "#525252",
              border: "1px solid #fecaca",
            }}
          >
            {errorInfo.technicalDetails}
          </div>
        )}
      </div>

      {/* Common Causes */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
          Common Causes
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {errorInfo.commonCauses.map((cause, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "12px",
                padding: "12px",
                background: "#fafafa",
                borderRadius: "10px",
                border: "1px solid #f0f0f0",
              }}
            >
              <div style={{ fontSize: "18px", flexShrink: 0 }}>•</div>
              <div style={{ fontSize: "14px", color: "#171717", lineHeight: 1.6 }}>{cause}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Solutions */}
      <div
        style={{
          background: "#f0fdf4",
          border: "2px solid #bbf7d0",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#166534", marginBottom: "16px" }}>
          ✓ How to Fix It
        </h2>
        <ol style={{ margin: 0, paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {errorInfo.solutions.map((solution, idx) => (
            <li key={idx} style={{ fontSize: "14px", color: "#14532d", lineHeight: 1.7, fontWeight: 500 }}>
              {solution}
            </li>
          ))}
        </ol>
      </div>

      {/* Affected Services */}
      {affectedServices.length > 0 && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>
            Services Recently Reporting Issues
          </h2>
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
            These AI services have had user reports in the last 6 hours:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {affectedServices.map((service) => (
              <Link
                key={service.slug}
                href={`/${service.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #f0f0f0",
                  background: "#fafafa",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#171717" }}>{service.name}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{service.category}</div>
                </div>
                <div style={{ fontSize: "12px", color: "#2563eb" }}>View Status →</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Prevention Tips */}
      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #fef3c7",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#92400e", marginBottom: "16px" }}>
          💡 Prevention Tips
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "14px", color: "#78350f", lineHeight: 1.7 }}>
            <strong>Implement proper error handling:</strong> Always catch and log errors with detailed context (timestamps, request IDs, parameters).
          </div>
          <div style={{ fontSize: "14px", color: "#78350f", lineHeight: 1.7 }}>
            <strong>Use retry logic:</strong> Implement exponential backoff for transient errors. Don't retry immediately—wait progressively longer between attempts.
          </div>
          <div style={{ fontSize: "14px", color: "#78350f", lineHeight: 1.7 }}>
            <strong>Monitor your usage:</strong> Set up alerts for quota limits, error rates, and unusual patterns. Catch issues before they impact users.
          </div>
          <div style={{ fontSize: "14px", color: "#78350f", lineHeight: 1.7 }}>
            <strong>Stay updated:</strong> Subscribe to service status notifications and follow official channels for maintenance announcements.
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#171717", marginBottom: "8px" }}>
              Is this error on my side or the service's side?
            </div>
            <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.7 }}>
              Check the "Common Causes" section above. Network errors, authentication failures, and connection issues are often client-side. Server errors, maintenance, and service unavailability are provider-side. Use our{" "}
              <Link href="/" style={{ color: "#2563eb" }}>
                status monitoring dashboard
              </Link>{" "}
              to see if others are experiencing the same problem.
            </div>
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#171717", marginBottom: "8px" }}>
              How long will it take to resolve?
            </div>
            <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.7 }}>
              Resolution time varies by error type. Client-side issues (authentication, network) can be fixed immediately by following the solutions above. Server-side issues depend on the provider's response time—typically minutes to hours for minor issues, longer for major outages.
            </div>
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#171717", marginBottom: "8px" }}>
              Should I keep retrying or wait?
            </div>
            <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.7 }}>
              Use exponential backoff: wait 1s, then 2s, 4s, 8s, etc. between retries. Don't retry immediately or in a tight loop—you'll waste resources and may get rate limited. For rate limit errors specifically, wait for the reset time indicated in response headers.
            </div>
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#171717", marginBottom: "8px" }}>
              Where can I report persistent errors?
            </div>
            <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.7 }}>
              First, check if the service has reported issues on our{" "}
              <Link href="/" style={{ color: "#2563eb" }}>
                status pages
              </Link>
              . If not, report directly to the service provider's support team with error details (timestamps, request IDs, exact error messages). You can also report on our platform to alert the community.
            </div>
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#171717", marginBottom: "8px" }}>
              What information should I include when reporting an error?
            </div>
            <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.7 }}>
              Include: exact error message or code, timestamp, request ID (if provided), HTTP status code, endpoint URL, approximate payload size, and any recent changes to your integration. This helps support teams diagnose issues quickly.
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div
        style={{
          marginTop: "32px",
          padding: "20px",
          background: "#fafafa",
          borderRadius: "12px",
          border: "1px solid #e5e5e5",
        }}
      >
        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Related Resources</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Link href="/" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}>
            ← Back to Status Dashboard
          </Link>
          <span style={{ color: "#e5e5e5" }}>•</span>
          <Link href="/errors" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}>
            All Error Guides
          </Link>
        </div>
      </div>
    </div>
  );
}
