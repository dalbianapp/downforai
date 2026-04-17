import type { IncidentSummary } from "@/lib/service-page/types";

interface Props {
  incidents: IncidentSummary[];
}

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MEDIUM: "#ca8a04",
  LOW: "#6b7280",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Ongoing",
  RESOLVED: "Resolved",
  INVESTIGATING: "Investigating",
  MONITORING: "Monitoring",
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default function IncidentTimelinePanel({ incidents }: Props) {
  if (incidents.length === 0) {
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
            marginBottom: "16px",
          }}
        >
          Incident history (30d)
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            fontSize: "13px",
            color: "#166534",
          }}
        >
          <span style={{ fontSize: "16px" }}>✓</span>
          No incidents recorded in the past 30 days.
        </div>
      </div>
    );
  }

  const displayed = incidents.slice(0, 5);

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
          Incident history (30d)
        </h2>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: incidents.length === 0 ? "#16a34a" : incidents.length <= 2 ? "#ca8a04" : "#dc2626",
            background: incidents.length === 0 ? "#f0fdf4" : incidents.length <= 2 ? "#fefce8" : "#fef2f2",
            border: `1px solid ${incidents.length === 0 ? "#bbf7d0" : incidents.length <= 2 ? "#fef08a" : "#fecaca"}`,
            borderRadius: "999px",
            padding: "2px 10px",
          }}
        >
          {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ padding: "8px 20px 20px" }}>
        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: "7px",
              top: "24px",
              bottom: "8px",
              width: "1px",
              background: "#e5e5e5",
            }}
          />

          {displayed.map((incident, i) => {
            const isOpen = incident.status === "OPEN" || incident.status === "INVESTIGATING";
            const severityColor = SEVERITY_COLOR[incident.severity] ?? "#6b7280";

            return (
              <div
                key={incident.id}
                style={{
                  display: "flex",
                  gap: "16px",
                  paddingTop: i === 0 ? "12px" : "16px",
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: isOpen ? severityColor : "#d1d5db",
                    border: `2px solid ${isOpen ? severityColor : "#e5e5e5"}`,
                    flexShrink: 0,
                    marginTop: "3px",
                    zIndex: 1,
                    boxShadow: isOpen ? `0 0 6px ${severityColor}50` : "none",
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#171717",
                        lineHeight: 1.4,
                      }}
                    >
                      {incident.title}
                    </span>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: isOpen ? severityColor : "#6b7280",
                          background: isOpen ? `${severityColor}15` : "#f5f5f5",
                          border: `1px solid ${isOpen ? `${severityColor}30` : "#e5e5e5"}`,
                          borderRadius: "999px",
                          padding: "2px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {STATUS_LABEL[incident.status] ?? incident.status}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#9ca3af",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{formatDate(incident.startedAt)}</span>
                    {incident.duration != null && (
                      <span>· {formatDuration(incident.duration)}</span>
                    )}
                    <span
                      style={{
                        color: severityColor,
                        fontWeight: 600,
                      }}
                    >
                      {incident.severity}
                    </span>
                  </div>

                  {incident.summary && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "12px",
                        color: "#6b7280",
                        lineHeight: 1.5,
                      }}
                    >
                      {incident.summary}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {incidents.length > 5 && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid #f0f0f0",
              fontSize: "12px",
              color: "#9ca3af",
              textAlign: "center",
            }}
          >
            Showing 5 of {incidents.length} incidents
          </div>
        )}
      </div>
    </div>
  );
}
