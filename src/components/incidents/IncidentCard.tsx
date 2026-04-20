import Link from "next/link";
import type { PublishableIncident } from "@/lib/incidents/types";

const SEVERITY_CONFIG = {
  CRITICAL: { label: "Critical", color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
  MAJOR: { label: "Major", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  MINOR: { label: "Minor", color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
} as const;

const STATUS_CONFIG = {
  OPEN: { label: "Ongoing", color: "#dc2626" },
  MONITORING: { label: "Monitoring", color: "#ca8a04" },
  RESOLVED: { label: "Resolved", color: "#16a34a" },
} as const;

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }) + " UTC";
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "ongoing";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function IncidentCard({ incident }: { incident: PublishableIncident }) {
  const sev = SEVERITY_CONFIG[incident.severity];
  const stat = STATUS_CONFIG[incident.status];

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: sev.color,
                background: sev.bg,
                border: `1px solid ${sev.border}`,
                borderRadius: "4px",
                padding: "2px 8px",
              }}
            >
              {sev.label}
            </span>
            <span style={{ fontSize: "12px", fontWeight: 500, color: stat.color }}>
              • {stat.label}
            </span>
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#171717", marginBottom: "6px" }}>
            <Link href={`/${incident.serviceSlug}`} style={{ textDecoration: "none", color: "inherit" }}>
              {incident.serviceName}
            </Link>
          </h3>
          <p style={{ fontSize: "13px", color: "#525252", marginBottom: "10px", lineHeight: 1.6 }}>
            {incident.enrichedDescription}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "#737373", flexWrap: "wrap" }}>
            <span>Started: {formatDate(incident.startedAt)}</span>
            {incident.resolvedAt && <span>Resolved: {formatDate(incident.resolvedAt)}</span>}
            <span>Duration: {formatDuration(incident.durationMinutes)}</span>
            <Link
              href={`/${incident.serviceSlug}`}
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              View service →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
