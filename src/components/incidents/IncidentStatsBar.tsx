import type { IncidentArchiveStats } from "@/lib/incidents/types";

export function IncidentStatsBar({ stats }: { stats: IncidentArchiveStats }) {
  const items = [
    { label: "Total incidents", value: stats.totalIncidents.toString() },
    { label: "Resolved", value: stats.totalResolved.toString() },
    { label: "Currently open", value: stats.totalOpen.toString() },
    { label: "Services affected", value: stats.servicesAffected.toString() },
    {
      label: "Avg duration",
      value: stats.avgDurationMinutes
        ? stats.avgDurationMinutes >= 60
          ? `${Math.floor(stats.avgDurationMinutes / 60)}h ${stats.avgDurationMinutes % 60}m`
          : `${stats.avgDurationMinutes}m`
        : "—",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#171717" }}>
            {item.value}
          </div>
          <div style={{ fontSize: "12px", marginTop: "4px", color: "#525252" }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
