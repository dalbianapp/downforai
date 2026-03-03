import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DownForAI — Real-Time AI Service Status Monitor";
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
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            fontSize: "120px",
            marginBottom: "20px",
          }}
        >
          ↓
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-2px",
            marginBottom: "16px",
          }}
        >
          DownForAI
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "32px",
            color: "#a3a3a3",
            fontWeight: 500,
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.4,
          }}
        >
          Real-time status for 200+ AI services
        </div>

        {/* Status indicators */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#16a34a",
              }}
            />
            <span style={{ color: "#a3a3a3", fontSize: "20px" }}>Operational</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#ca8a04",
              }}
            />
            <span style={{ color: "#a3a3a3", fontSize: "20px" }}>Degraded</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#dc2626",
              }}
            />
            <span style={{ color: "#a3a3a3", fontSize: "20px" }}>Outage</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
