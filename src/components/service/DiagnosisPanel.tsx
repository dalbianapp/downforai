import type { DiagnosisResult, SurfaceSnapshot, ReportSummary } from "@/lib/service-page/types";

interface Props {
  serviceName: string;
  diagnosis: DiagnosisResult;
  surfaces: SurfaceSnapshot[];
  reportSummary: ReportSummary;
}

const SCOPE_DESC: Record<string, string> = {
  global: "Our probes detect the issue from multiple locations — this appears to be a provider-side outage.",
  partial: "Some surfaces or regions are affected. The issue may not impact all users equally.",
  local: "Our probes see normal responses. The issue is likely on your end or in your network path.",
  unknown: "We don't have enough signal to determine the scope. Check back in a few minutes.",
  inconclusive: "Automated monitoring is not available for this service. Check the provider's official status page for the latest information.",
};

const CONFIDENCE_LABEL: Record<string, string> = {
  HIGH: "High confidence",
  MEDIUM: "Moderate confidence",
  LOW: "Low confidence — limited data",
};

export default function DiagnosisPanel({
  serviceName,
  diagnosis,
  surfaces,
  reportSummary,
}: Props) {
  const outageSurfaces = surfaces.filter(
    (s) => s.status === "OUTAGE" || s.status === "DEGRADED"
  );

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <h2
          style={{ fontSize: "15px", fontWeight: 700, color: "#171717", margin: 0 }}
        >
          Is {serviceName} down for everyone?
        </h2>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Verdict block */}
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#171717",
              marginBottom: "6px",
            }}
          >
            {diagnosis.label}
          </div>
          <div style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6 }}>
            {SCOPE_DESC[diagnosis.scope]}
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "11px",
              color: "#9ca3af",
            }}
          >
            {CONFIDENCE_LABEL[diagnosis.confidence]}
          </div>
        </div>

        {/* Probe summary */}
        {surfaces.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "10px",
              }}
            >
              Probe summary ({surfaces.length} surface{surfaces.length !== 1 ? "s" : ""})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {outageSurfaces.length > 0 ? (
                outageSurfaces.map((s) => (
                  <div
                    key={s.surfaceId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor:
                          s.status === "OUTAGE" ? "#dc2626" : "#ca8a04",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: 500 }}>{s.displayName}</span>
                    <span style={{ color: "#9ca3af" }}>
                      {s.status === "OUTAGE" ? "Outage" : "Degraded"}
                      {s.latestHttpStatus ? ` · HTTP ${s.latestHttpStatus}` : ""}
                    </span>
                  </div>
                ))
              ) : surfaces.some((s) => s.status === "UNKNOWN") ? (
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Status of monitored surfaces could not be determined.
                </div>
              ) : (
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  All surfaces operational as of last probe.
                </div>
              )}
            </div>
          </div>
        )}

        {/* User reports */}
        {reportSummary.total24h > 0 && (
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: "14px",
            }}
          >
            <div style={{ fontSize: "13px", color: "#4b5563" }}>
              <strong style={{ color: "#171717" }}>{reportSummary.total24h}</strong>{" "}
              user report{reportSummary.total24h !== 1 ? "s" : ""} in the last 24 hours
              {Object.keys(reportSummary.byType).length > 0 && (
                <span style={{ color: "#9ca3af" }}>
                  {" "}— {Object.entries(reportSummary.byType)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([type, count]) => `${count}× ${type.toLowerCase()}`)
                    .join(", ")}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Reasons list */}
        {diagnosis.reasons.length > 0 && (
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: "14px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Signals detected
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
              {diagnosis.reasons.map((r, i) => (
                <li
                  key={i}
                  style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6 }}
                >
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
