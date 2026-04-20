import type { SurfaceSnapshot } from "@/lib/service-page/types";
import { getStatusConfig, getRelativeTime } from "./_statusConfig";

interface Props {
  surfaces: SurfaceSnapshot[];
  overallStatus?: string;
  reports24hCount?: number;
}

export default function SurfaceHealthGrid({ surfaces, overallStatus, reports24hCount }: Props) {
  if (surfaces.length === 0) return null;

  const isReportedIssues = overallStatus === "REPORTED_ISSUES";

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

          const showNoProbErrors = isReportedIssues && s.status === "OPERATIONAL";
          const dotColor = showNoProbErrors ? "#9ca3af" : sc.dot;
          const badgeText = showNoProbErrors ? "No probe errors" : sc.label;
          const badgeColor = showNoProbErrors ? "#6b7280" : sc.text;
          const badgeBg = showNoProbErrors ? "#f5f5f5" : sc.bg;
          const badgeBorder = showNoProbErrors ? "#e5e5e5" : sc.border;

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
                    backgroundColor: dotColor,
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
                    color: badgeColor,
                    background: badgeBg,
                    border: `1px solid ${badgeBorder}`,
                    borderRadius: "999px",
                    padding: "2px 8px",
                  }}
                >
                  {badgeText}
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

      {isReportedIssues && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "8px",
            padding: "12px 16px",
            margin: "12px 20px 20px",
            fontSize: "13px",
            color: "#92400e",
          }}
        >
          ⚠️ Probes show normal HTTP responses, but {reports24hCount ?? 0} users
          reported issues in the last 24 hours. The problem may affect
          authentication, specific models, or regions not covered by synthetic
          probes.
        </div>
      )}
    </div>
  );
}
