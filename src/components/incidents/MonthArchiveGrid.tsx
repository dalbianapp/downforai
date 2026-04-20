import Link from "next/link";
import type { IncidentMonthSummary } from "@/lib/incidents/types";

export function MonthArchiveGrid({
  months,
  activeMonth,
}: {
  months: IncidentMonthSummary[];
  activeMonth?: string;
}) {
  if (months.length === 0) {
    return (
      <div style={{ color: "#737373", fontSize: "14px" }}>
        No incident data available yet.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      }}
    >
      {months.map((month) => {
        const isActive = activeMonth === month.monthKey;
        return (
          <Link
            key={month.monthKey}
            href={`/incidents/${month.monthKey}`}
            style={{
              background: isActive ? "#f0f9ff" : "#ffffff",
              border: `1px solid ${isActive ? "#2563eb" : "#e5e5e5"}`,
              borderRadius: "12px",
              padding: "16px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "14px", color: "#171717" }}>
              {month.displayMonth}
            </div>
            <div style={{ fontSize: "12px", marginTop: "4px", color: "#525252" }}>
              {month.incidentCount} incident{month.incidentCount !== 1 ? "s" : ""}
              {month.criticalCount > 0 && ` · ${month.criticalCount} critical`}
            </div>
            {month.topServices.length > 0 && (
              <div style={{ fontSize: "11px", marginTop: "8px", color: "#737373" }}>
                Top: {month.topServices.slice(0, 3).map((s) => s.name).join(", ")}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
