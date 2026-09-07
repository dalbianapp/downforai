import { ImageResponse } from "next/og";
import { getServiceSnapshot } from "@/lib/snapshot/read";

export const runtime = "nodejs";
export const alt = "Service Status";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ serviceSlug: string }> }) {
  const { serviceSlug } = await params;

  // Reads the hourly snapshot (src/lib/snapshot) instead of Prisma — this
  // route used to wake the DB on every first visitor to a given service's
  // OG image, since Vercel's own image cache only kicks in after that.
  const dashboard = await getServiceSnapshot(serviceSlug);

  if (!dashboard) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#171717",
            color: "#fff",
            fontSize: "48px",
          }}
        >
          Service Not Found
        </div>
      ),
      { ...size }
    );
  }

  const { service } = dashboard;
  // Already resolved by the snapshot cron (same site-wide derivation the
  // service page uses). REPORTED_ISSUES is a page-level label, not a color
  // this route ever rendered, so it maps to DEGRADED here as before.
  const overallStatus = dashboard.overallStatus === "REPORTED_ISSUES" ? "DEGRADED" : dashboard.overallStatus;

  const statusConfig = {
    OPERATIONAL: { color: "#16a34a", label: "Operational", emoji: "✅" },
    DEGRADED: { color: "#ca8a04", label: "Degraded", emoji: "⚠️" },
    OUTAGE: { color: "#dc2626", label: "Major Outage", emoji: "🔴" },
    UNKNOWN: { color: "#737373", label: "Checking...", emoji: "❓" },
  };

  const status = statusConfig[overallStatus] || statusConfig.UNKNOWN;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #171717 0%, #262626 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Service Name */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-2px",
            marginBottom: "32px",
            textAlign: "center",
          }}
        >
          {service.name}
        </div>

        {/* Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            padding: "24px 48px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            border: `2px solid ${status.color}`,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: status.color,
              boxShadow: `0 0 20px ${status.color}80`,
            }}
          />
          <div
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: status.color,
            }}
          >
            {status.label}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#a3a3a3",
            fontSize: "28px",
          }}
        >
          <span style={{ fontSize: "36px" }}>↓</span>
          <span>DownForAI</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
