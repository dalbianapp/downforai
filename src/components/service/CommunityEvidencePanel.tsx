import type { ReportSummary } from "@/lib/service-page/types";
import { getRelativeTime } from "./_statusConfig";

interface Props {
  recentComments: ReportSummary["recentComments"];
}

const TYPE_ICON: Record<string, string> = {
  OUTAGE: "⚠️",
  SLOW: "🐢",
  LOGIN: "🔐",
  ERROR: "❌",
  API: "🔌",
  OTHER: "💬",
};

const TYPE_COLOR: Record<string, string> = {
  OUTAGE: "#dc2626",
  SLOW: "#ca8a04",
  LOGIN: "#7c3aed",
  ERROR: "#dc2626",
  API: "#2563eb",
  OTHER: "#6b7280",
};

const TYPE_BG: Record<string, string> = {
  OUTAGE: "#fef2f2",
  SLOW: "#fefce8",
  LOGIN: "#f5f3ff",
  ERROR: "#fef2f2",
  API: "#eff6ff",
  OTHER: "#f9fafb",
};

export default function CommunityEvidencePanel({ recentComments }: Props) {
  if (recentComments.length === 0) return null;

  const displayed = recentComments.slice(0, 5);

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
          Community reports
        </h2>
        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" }}>
          What users are saying right now
        </p>
      </div>

      <div style={{ padding: "8px 0" }}>
        {displayed.map((comment, i) => {
          const typeColor = TYPE_COLOR[comment.reportType] ?? "#6b7280";
          const typeBg = TYPE_BG[comment.reportType] ?? "#f9fafb";
          const typeIcon = TYPE_ICON[comment.reportType] ?? "💬";

          return (
            <div
              key={i}
              style={{
                padding: "14px 20px",
                borderBottom:
                  i < displayed.length - 1 ? "1px solid #f5f5f5" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                {/* Avatar placeholder */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "#9ca3af",
                    flexShrink: 0,
                    fontWeight: 600,
                  }}
                >
                  {comment.pseudo.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {comment.pseudo}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: typeColor,
                        background: typeBg,
                        border: `1px solid ${typeColor}30`,
                        borderRadius: "999px",
                        padding: "1px 7px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {typeIcon} {comment.reportType.toLowerCase()}
                    </span>
                    <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>
                      {getRelativeTime(comment.createdAt)}
                    </span>
                  </div>

                  {/* Comment */}
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#4b5563",
                      lineHeight: 1.5,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    } as React.CSSProperties}
                  >
                    {comment.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
