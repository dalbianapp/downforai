import type { ReportSummary } from "@/lib/service-page/types";

interface Props {
  reportSummary: ReportSummary;
  serviceName: string;
}

const TYPE_ICON: Record<string, string> = {
  OUTAGE: "⚠️",
  SLOW: "🐢",
  LOGIN: "🔐",
  ERROR: "❌",
  API: "🔌",
  OTHER: "💬",
};

const TYPE_LABEL: Record<string, string> = {
  OUTAGE: "Full outage",
  SLOW: "Slowness",
  LOGIN: "Login issues",
  ERROR: "Error messages",
  API: "API errors",
  OTHER: "Other",
};

export default function SymptomsPanel({ reportSummary, serviceName }: Props) {
  const entries = Object.entries(reportSummary.byType).sort(([, a], [, b]) => b - a);

  if (reportSummary.total24h === 0) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#171717",
            marginBottom: "12px",
          }}
        >
          Reported symptoms
        </h2>
        <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
          No user reports for {serviceName} in the last 24 hours.
        </p>
      </div>
    );
  }

  const total = reportSummary.total24h;

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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{ fontSize: "15px", fontWeight: 700, color: "#171717", margin: 0 }}
        >
          Reported symptoms
        </h2>
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>
          {total} report{total !== 1 ? "s" : ""} / 24h
        </span>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {entries.map(([type, count]) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={type}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#374151",
                    fontWeight: 500,
                  }}
                >
                  <span>{TYPE_ICON[type] ?? "💬"}</span>
                  <span>{TYPE_LABEL[type] ?? type}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    {count}×
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#9ca3af",
                      width: "32px",
                      textAlign: "right",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div
                style={{
                  height: "4px",
                  background: "#f0f0f0",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background:
                      type === "OUTAGE"
                        ? "#dc2626"
                        : type === "SLOW"
                        ? "#ca8a04"
                        : "#6b7280",
                    borderRadius: "999px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
