import type { SurfaceSnapshot } from "@/lib/service-page/types";
import { getStatusConfig, getRelativeTime } from "./_statusConfig";

interface Props {
  surfaces: SurfaceSnapshot[];
}

export default function SurfaceHealthGrid({ surfaces }: Props) {
  if (surfaces.length === 0) return null;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <h2
          style={{ fontSize: "15px", fontWeight: 700, color: "#171717", margin: 0 }}
        >
          Surface Health
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1px",
          background: "#f0f0f0",
        }}
      >
        {surfaces.map((s) => {
          const sc = getStatusConfig(s.status);
          const lastSeen = s.lastObservedAt
            ? getRelativeTime(s.lastObservedAt)
            : "—";

          return (
            <div
              key={s.surfaceId}
              style={{
                background: "#ffffff",
                padding: "16px 20px",
              }}
            >
              {/* Surface name + status dot */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: sc.dot,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#171717",
                    flex: 1,
                  }}
                >
                  {s.displayName}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: sc.text,
                    background: sc.bg,
                    border: `1px solid ${sc.border}`,
                    borderRadius: "999px",
                    padding: "2px 8px",
                  }}
                >
                  {sc.label}
                </span>
              </div>

              {/* KPIs row */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                {s.latestHttpStatus && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color:
                        s.latestHttpStatus < 400
                          ? "#16a34a"
                          : s.latestHttpStatus < 500
                          ? "#ca8a04"
                          : "#dc2626",
                    }}
                  >
                    HTTP {s.latestHttpStatus}
                  </span>
                )}
                {s.p50Latency24h != null && (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    p50 {s.p50Latency24h}ms
                  </span>
                )}
                <span style={{ marginLeft: "auto" }}>{lastSeen}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
