import type {
  SurfaceSnapshot,
  DiagnosisResult,
  IncidentSummary,
  ReportSummary,
} from "@/lib/service-page/types";

interface Props {
  service: { name: string; slug: string; category: string };
  overallStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | "REPORTED_ISSUES";
  diagnosis: DiagnosisResult;
  surfaces: SurfaceSnapshot[];
  uptime24h: number | null;
  incidents30d: IncidentSummary[];
  reportSummary: ReportSummary;
  lastIncident: { startedAt: Date } | null;
}

// Domain noun per category — drives differentiation of empty-state sentences
const DOMAIN: Record<string, string> = {
  LLM:           "inference",
  IMAGE:         "image generation",
  VIDEO:         "video processing",
  AUDIO:         "audio service",
  DEV:           "development tooling",
  INFRA:         "infrastructure",
  SEARCH:        "search",
  PRODUCTIVITY:  "productivity suite",
  AGENTS:        "agent runtime",
  THREE_D:       "3D generation",
  DESIGN:        "design tooling",
  MLOPS:         "ML pipeline",
  VECTOR_DB:     "vector database",
  ROLEPLAY:      "platform",
  MARKETING:     "marketing platform",
  SUPPORT:       "support platform",
  EDUCATION:     "learning platform",
  HR_AI:         "HR AI platform",
  LEGAL_AI:      "legal AI service",
  SPORTS_BETTING: "platform",
};

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function confidence(
  surfaces: SurfaceSnapshot[],
  uptime24h: number | null
): { label: "High" | "Medium" | "Low"; surfacesWithLatency: number } {
  const active = surfaces.filter((s) => s.lastObservedAt !== null);
  const withLatency = surfaces.filter((s) => s.p50Latency24h !== null).length;
  if (active.length >= 2 && withLatency >= 1 && uptime24h !== null)
    return { label: "High", surfacesWithLatency: withLatency };
  if (active.length >= 1 && (withLatency >= 1 || uptime24h !== null))
    return { label: "Medium", surfacesWithLatency: withLatency };
  return { label: "Low", surfacesWithLatency: withLatency };
}

function para1(
  service: Props["service"],
  surfaces: SurfaceSnapshot[],
  uptime24h: number | null,
  overallStatus: Props["overallStatus"]
): string {
  const n = surfaces.length;
  const names = surfaces.map((s) => s.displayName);

  let footprint: string;
  if (n === 0) {
    footprint = `DownForAI has ${service.name} queued for monitoring.`;
  } else if (n === 1) {
    footprint = `DownForAI monitors ${service.name} via a single endpoint — ${names[0]}.`;
  } else if (n === 2) {
    footprint = `DownForAI monitors ${service.name} across two surfaces: ${names[0]} and ${names[1]}.`;
  } else {
    const list = [...names.slice(0, -1), `and ${names[names.length - 1]}`].join(", ");
    footprint = `DownForAI tracks ${service.name} across ${n} monitoring surfaces: ${list}.`;
  }

  const statusMap: Record<Props["overallStatus"], string> = {
    OPERATIONAL:
      "Current status: operational — all surfaces are responding normally.",
    DEGRADED:
      "Current status: degraded — one or more surfaces are returning slower-than-normal responses.",
    OUTAGE:
      "Current status: outage — one or more surfaces are currently unavailable.",
    UNKNOWN:
      "Current status: unknown — insufficient recent probe data to confirm availability.",
    REPORTED_ISSUES:
      "Automated probes return normal responses, though user reports suggest active issues.",
  };

  let uptimeLine = "";
  if (uptime24h !== null) {
    const pct = uptime24h.toFixed(1);
    if (uptime24h >= 99.5) {
      uptimeLine = ` Measured uptime over the last 24 hours: ${pct}%.`;
    } else if (uptime24h >= 95) {
      uptimeLine = ` 24-hour uptime: ${pct}% — slightly below full availability.`;
    } else {
      uptimeLine = ` 24-hour uptime: ${pct}%, indicating meaningful availability loss during this period.`;
    }
  }

  // Prefer the surface with the richest latency data
  const latSurface =
    surfaces.find((s) => s.p50Latency24h !== null && s.p95Latency24h !== null) ??
    surfaces.find((s) => s.p50Latency24h !== null);
  let latLine = "";
  if (latSurface?.p50Latency24h != null) {
    const p50 = latSurface.p50Latency24h;
    const p95 = latSurface.p95Latency24h;
    latLine = p95 != null
      ? ` Median response time (24 h): ${p50} ms; p95: ${p95} ms.`
      : ` Median response time (24 h): ${p50} ms.`;
  }

  return `${footprint} ${statusMap[overallStatus]}${uptimeLine}${latLine}`.trim();
}

function para2(
  service: Props["service"],
  incidents30d: IncidentSummary[],
  reportSummary: ReportSummary,
  lastIncident: { startedAt: Date } | null,
  diagnosis: DiagnosisResult
): string | null {
  const domain = DOMAIN[service.category] ?? "service";
  const reports = reportSummary.total24h;

  // Helper: top-2 symptom labels from byType
  function topTypes(): string {
    return Object.entries(reportSummary.byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([t]) => t.toLowerCase().replace(/_/g, " "))
      .join(" and ");
  }

  // Open incident takes priority
  const open = incidents30d.find(
    (i) => i.status === "OPEN" || i.status === "MONITORING"
  );
  if (open) {
    const dur = open.duration != null ? ` (ongoing — ${open.duration} min so far)` : " (ongoing)";
    const reportNote =
      reports > 0
        ? ` ${reports} community report${reports !== 1 ? "s" : ""} in the last 24 hours corroborate this.`
        : "";
    return `${service.name} currently has an active incident: "${open.title}"${dur}.${reportNote}`;
  }

  const latest = incidents30d[0];

  // Incidents + reports
  if (latest && reports > 0) {
    const when = fmtDate(latest.startedAt);
    const dur = latest.duration != null ? ` lasting ${latest.duration} min` : "";
    const types = topTypes();
    return `${service.name} had ${incidents30d.length} tracked incident${incidents30d.length !== 1 ? "s" : ""} in the last 30 days. Most recent: "${latest.title}" on ${when}${dur}. ${reports} community report${reports !== 1 ? "s" : ""} were submitted in the last 24 hours${types ? `, primarily ${types}` : ""}.`;
  }

  // Incidents only
  if (latest) {
    const when = fmtDate(latest.startedAt);
    const dur = latest.duration != null ? `, lasting ${latest.duration} min` : "";
    return `${service.name} had ${incidents30d.length} tracked incident${incidents30d.length !== 1 ? "s" : ""} over the last 30 days. The most recent was logged on ${when} ("${latest.title}"${dur}).`;
  }

  // Reports only
  if (reports > 0) {
    const types = topTypes();
    const scopeNote =
      diagnosis.scope === "global"
        ? " Reports point to a provider-wide issue."
        : diagnosis.scope === "partial"
        ? " Reports suggest a partial service disruption."
        : "";
    return `No tracked incidents in the last 30 days, but ${reports} community report${reports !== 1 ? "s" : ""} were submitted in the last 24 hours${types ? ` (primarily ${types})` : ""}.${scopeNote}`;
  }

  // Last incident outside 30-day window
  if (lastIncident) {
    const when = fmtDate(lastIncident.startedAt);
    const v = service.slug.length % 3;
    if (v === 0)
      return `No ${domain} disruptions have been tracked for ${service.name} in the last 30 days. The most recent incident on record was ${when}. Monitoring continues across all configured surfaces.`;
    if (v === 1)
      return `The last confirmed ${service.name} disruption logged by DownForAI was ${when} — outside the current 30-day window. No new incidents or community reports have been recorded since.`;
    return `${service.name} has maintained a clean 30-day incident record. Prior disruption history dates back to ${when}. No community reports have been submitted in the last 24 hours.`;
  }

  // Fully clean: no incidents, no reports, no prior history
  // Use a deterministic but service-specific variant to avoid identical paragraphs across hundreds of pages
  const v = (service.slug.charCodeAt(0) + service.slug.length) % 4;
  if (v === 0)
    return `No ${domain} incidents have been tracked for ${service.name} since monitoring began, and no community reports were submitted in the last 24 hours. Automated checks continue on the configured schedule.`;
  if (v === 1)
    return `DownForAI has not recorded any ${service.name} ${domain} disruptions. The service is probed approximately every 75 minutes; no user reports have been received in the last 24 hours.`;
  if (v === 2)
    return `${service.name} has had no tracked outages since joining the DownForAI monitoring network. No community reports have been filed in the last 24 hours.`;
  return `No incidents have been logged for ${service.name}, and no community reports were received in the last 24 hours. Probes run continuously across the configured surfaces.`;
}

export function ReliabilitySummary({
  service,
  overallStatus,
  diagnosis,
  surfaces,
  uptime24h,
  incidents30d,
  reportSummary,
  lastIncident,
}: Props) {
  const p1 = para1(service, surfaces, uptime24h, overallStatus);
  const p2 = para2(service, incidents30d, reportSummary, lastIncident, diagnosis);
  const { label: confLabel, surfacesWithLatency } = confidence(surfaces, uptime24h);

  const lastSeen = surfaces
    .map((s) => s.lastObservedAt)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  const lastChecked = lastSeen
    ? (() => {
        const mins = Math.round((Date.now() - lastSeen.getTime()) / 60_000);
        if (mins < 2) return "< 2 min ago";
        if (mins < 60) return `${mins} min ago`;
        return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
      })()
    : null;

  const confColors = {
    High:   { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    Medium: { color: "#ca8a04", bg: "#fffbeb", border: "#fef3c7" },
    Low:    { color: "#6b7280", bg: "#f9fafb", border: "#e5e5e5" },
  }[confLabel];

  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        padding: "20px 24px",
      }}
    >
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.75,
          color: "#374151",
          margin: 0,
          marginBottom: p2 ? "10px" : 0,
        }}
      >
        {p1}
      </p>

      {p2 && (
        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.75,
            color: "#374151",
            margin: 0,
            marginBottom: "14px",
          }}
        >
          {p2}
        </p>
      )}

      <div
        style={{
          borderTop: "1px solid #e5e5e5",
          paddingTop: "10px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: confColors.color,
            background: confColors.bg,
            border: `1px solid ${confColors.border}`,
            borderRadius: "999px",
            padding: "2px 8px",
          }}
        >
          Data confidence: {confLabel}
        </span>
        <span style={{ fontSize: "11px", color: "#9ca3af" }}>
          {[
            lastChecked && `Last checked ${lastChecked}`,
            surfaces.length > 0 &&
              `${surfaces.length} monitored surface${surfaces.length !== 1 ? "s" : ""}`,
            surfacesWithLatency > 0 &&
              `${surfacesWithLatency} with 24 h latency data`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    </div>
  );
}
