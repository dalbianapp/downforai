import type { TopServiceContent } from "@/content/top-services/types";

interface Props {
  topContent: TopServiceContent | null;
}

const COST_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Easy switch", color: "#16a34a", bg: "#f0fdf4" },
  medium: { label: "Moderate effort", color: "#ca8a04", bg: "#fefce8" },
  high: { label: "Major migration", color: "#dc2626", bg: "#fef2f2" },
};

export default function FallbackAlternativesPanel({ topContent }: Props) {
  if (!topContent || topContent.fallbackAlternatives.length === 0) return null;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
        <h2
          style={{ fontSize: "15px", fontWeight: 700, color: "#171717", margin: 0 }}
        >
          Fallback alternatives
        </h2>
        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" }}>
          What to use if this service is down
        </p>
      </div>

      <div style={{ padding: "8px 0" }}>
        {topContent.fallbackAlternatives.map((alt, i) => {
          const cc = COST_CONFIG[alt.switchingCost] ?? COST_CONFIG.medium;

          return (
            <div
              key={i}
              style={{
                padding: "14px 20px",
                borderBottom:
                  i < topContent.fallbackAlternatives.length - 1
                    ? "1px solid #f5f5f5"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginBottom: "2px",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      fontWeight: 600,
                    }}
                  >
                    {alt.scenario}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#171717",
                      lineHeight: 1.4,
                    }}
                  >
                    {alt.alternative}
                  </div>
                  {alt.note && (
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: "#6b7280",
                        lineHeight: 1.5,
                      }}
                    >
                      {alt.note}
                    </div>
                  )}
                </div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: cc.color,
                    background: cc.bg,
                    border: `1px solid ${cc.color}30`,
                    borderRadius: "999px",
                    padding: "3px 10px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {cc.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
