import type { SurfaceSnapshot, StatusExplanation, ReportSummary } from "@/lib/service-page/types";
import type { TopServiceContent } from "@/content/top-services/types";
import { getStatusConfig, monitoringConfidence } from "./_statusConfig";
import SnippetMagnet from "./SnippetMagnet";

interface Props {
  service: { slug: string; name: string; monitoringCapability: string };
  overallStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | "REPORTED_ISSUES";
  headline: "MONITORING_LIMITED" | "STATUS_UNCERTAIN" | null;
  statusExplanation: StatusExplanation;
  surfaces: SurfaceSnapshot[];
  reportSummary: ReportSummary;
  topContent: TopServiceContent | null;
  lastIncidentDate?: Date | null;
}

// What drove the status — honest signal source, never "is it your fault".
const SOURCE_LABEL: Record<string, string> = {
  OFFICIAL: "Official status",
  TECHNICAL: "Probe-monitored",
  COMMUNITY: "Community-reported",
  CAPABILITY: "Limited monitoring",
};

const CONFIDENCE_COLOR: Record<string, string> = {
  High: "#dc2626",
  Medium: "#ca8a04",
  Low: "#6b7280",
};

export default function ServiceHeroHeader({
  service,
  overallStatus,
  headline,
  statusExplanation,
  surfaces,
  reportSummary,
  topContent,
  lastIncidentDate,
}: Props) {
  const sc = getStatusConfig(overallStatus);

  const lastProbe = surfaces
    .map((s) => s.lastObservedAt)
    .filter(Boolean)
    .sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] as Date | null;

  const lastProbeLabel = lastProbe
    ? (() => {
        const diffMins = Math.round((Date.now() - lastProbe.getTime()) / 60_000);
        if (diffMins < 2) return "< 2 min ago";
        if (diffMins < 60) return `${diffMins} min ago`;
        return `${Math.floor(diffMins / 60)}h ago`;
      })()
    : null;

  return (
    <div>
      {/* H1 */}
      <h1
        style={{
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 800,
          color: "#171717",
          letterSpacing: "-1px",
          lineHeight: 1.15,
          marginBottom: "16px",
        }}
      >
        {service.monitoringCapability === "BLOCKED_FROM_PROBES"
          ? `${service.name} status: monitoring limited`
          : service.monitoringCapability === "UNVERIFIABLE"
          ? `${service.name} status: unconfirmed`
          : `${service.name} status: API, auth, latency & outage reports`}
      </h1>

      <SnippetMagnet
        serviceName={service.name}
        status={overallStatus}
        surfaceCount={surfaces.length}
        reports24h={reportSummary.total24h}
        lastIncidentDate={lastIncidentDate}
        monitoringCapability={service.monitoringCapability}
      />

      {/* Status card */}
      <div
        style={{
          background: sc.bg,
          border: `1px solid ${sc.border}`,
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* Left: dot + label + meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: sc.dot,
              flexShrink: 0,
              boxShadow:
                overallStatus !== "OPERATIONAL"
                  ? `0 0 8px ${sc.dot}60`
                  : "none",
            }}
          />
          <div>
            <div
              style={{ fontSize: "18px", fontWeight: 700, color: sc.text }}
            >
              {headline === "MONITORING_LIMITED"
                ? "Monitoring limited"
                : headline === "STATUS_UNCERTAIN"
                ? "Status uncertain"
                : sc.label}
            </div>
            {overallStatus === "REPORTED_ISSUES" ? (
              <div style={{ fontSize: "12px", color: "#92400e", marginTop: "2px" }}>
                Probes show normal responses, but users are reporting problems.
              </div>
            ) : headline === "MONITORING_LIMITED" ? (
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                Our probes are blocked by this service — automated status cannot be verified.
              </div>
            ) : headline === "STATUS_UNCERTAIN" ? (
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                Service unreachable from our probe infrastructure — status uncertain.
              </div>
            ) : (
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginTop: "2px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {lastProbeLabel && <span>Last probe {lastProbeLabel}</span>}
                <span>·</span>
                <span>{surfaces.length} surface{surfaces.length !== 1 ? "s" : ""}</span>
                {reportSummary.total24h > 0 && (
                  <>
                    <span>·</span>
                    <span>{reportSummary.total24h} report{reportSummary.total24h !== 1 ? "s" : ""} / 24h</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: diagnosis verdict */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: CONFIDENCE_COLOR[monitoringConfidence(service.monitoringCapability)] ?? "#6b7280",
              background: "#ffffff",
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid #e5e5e5",
            }}
          >
            {SOURCE_LABEL[statusExplanation.primarySource] ?? "Monitored"}
          </span>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
            {monitoringConfidence(service.monitoringCapability)} confidence
          </span>
        </div>
      </div>

      {/* Provider chips: status page, docs, pricing */}
      {topContent && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          {topContent.officialStatusUrl && (
            <a
              href={topContent.officialStatusUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={chipStyle}
            >
              📡 Official status page →
            </a>
          )}
          {topContent.docsUrl && (
            <a
              href={topContent.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={chipStyle}
            >
              📚 Docs →
            </a>
          )}
          {topContent.pricingUrl && (
            <a
              href={topContent.pricingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={chipStyle}
            >
              💳 Pricing →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const chipStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#374151",
  background: "#f9fafb",
  border: "1px solid #e5e5e5",
  borderRadius: "999px",
  padding: "5px 12px",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
};
