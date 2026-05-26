import type { SurfaceSnapshot, DiagnosisResult, ReportSummary } from "@/lib/service-page/types";
import type { TopServiceContent } from "@/content/top-services/types";
import { getStatusConfig } from "./_statusConfig";
import SnippetMagnet from "./SnippetMagnet";

interface Props {
  service: { slug: string; name: string };
  overallStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | "REPORTED_ISSUES";
  diagnosis: DiagnosisResult;
  surfaces: SurfaceSnapshot[];
  reportSummary: ReportSummary;
  topContent: TopServiceContent | null;
  lastIncidentDate?: Date | null;
}

const SCOPE_LABEL: Record<string, string> = {
  global: "Provider-wide issue",
  partial: "Partial outage",
  local: "Likely your side",
  unknown: "Inconclusive",
};

const CONFIDENCE_COLOR: Record<string, string> = {
  HIGH: "#dc2626",
  MEDIUM: "#ca8a04",
  LOW: "#6b7280",
};

export default function ServiceHeroHeader({
  service,
  overallStatus,
  diagnosis,
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
        {service.name} status: API, auth, latency &amp; outage reports
      </h1>

      <SnippetMagnet
        serviceName={service.name}
        status={overallStatus}
        surfaceCount={surfaces.length}
        reports24h={reportSummary.total24h}
        lastIncidentDate={lastIncidentDate}
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
              {sc.label}
            </div>
            {overallStatus === "REPORTED_ISSUES" ? (
              <div style={{ fontSize: "12px", color: "#92400e", marginTop: "2px" }}>
                Probes show normal responses, but users are reporting problems.
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
              color: CONFIDENCE_COLOR[diagnosis.confidence] ?? "#6b7280",
              background: "#ffffff",
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid #e5e5e5",
            }}
          >
            {SCOPE_LABEL[diagnosis.scope] ?? diagnosis.scope}
          </span>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
            {diagnosis.confidence} confidence
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
