import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI Service Status Monitor for 800+ Tools | DownForAI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          padding: "48px",
        }}
      >
        {/* Brand — top-left */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "48px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "28px", color: "#ffffff" }}>↓</span>
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.5px" }}>
            DownForAI
          </span>
        </div>

        {/* Hero number */}
        <div
          style={{
            fontSize: "120px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-4px",
            lineHeight: 1,
            marginBottom: "8px",
            display: "flex",
          }}
        >
          800<span style={{ color: "#6366f1" }}>+</span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: "40px",
            fontWeight: 700,
            color: "#e5e5e5",
            letterSpacing: "-1px",
            marginBottom: "28px",
          }}
        >
          AI Services Monitored
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "24px",
            color: "#a3a3a3",
            fontWeight: 500,
            marginBottom: "12px",
          }}
        >
          Outages · Status · Response Times · Reports
        </div>

        {/* Moat */}
        <div
          style={{
            fontSize: "18px",
            color: "#737373",
            fontWeight: 400,
            marginBottom: "48px",
          }}
        >
          Major LLMs + niche AI tools most trackers miss
        </div>

        {/* Status indicators — secondary */}
        <div style={{ display: "flex", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ color: "#737373", fontSize: "18px" }}>Operational</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ca8a04" }} />
            <span style={{ color: "#737373", fontSize: "18px" }}>Degraded</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#dc2626" }} />
            <span style={{ color: "#737373", fontSize: "18px" }}>Outage</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
