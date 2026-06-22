import type { StatusExplanation, SurfaceSnapshot } from "@/lib/service-page/types";

interface Props {
  serviceName: string;
  explanation: StatusExplanation;
  surfaces: SurfaceSnapshot[];
}

// Palette (indigo = brand only; semantic colours for the status chip).
const INK = "#0F172A";
const MUTED = "#475569";
const FAINT = "#94A3B8";
const BORDER = "#E2E8F0";
const PANEL = "#F8FAFC";
const ACCENT = "var(--accent)";
const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, monospace)";

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const measuredSurface = (capability: string) =>
  capability === "OFFICIAL_STATUS_PAGE" ? "status page"
  : capability === "BASIC_PUBLIC_SURFACE" ? "public endpoint"
  : "monitored surface";

type Block = {
  title: string;
  body: string;
  sourceLine: string;
  extraLine?: string;            // e.g. "Technical probe status: reachable" / "Affected: …"
  troubleshooting: string;
  troubleshootingCollapsible: boolean; // OPERATIONAL keeps it collapsed/secondary
};

// The ENTIRE content is derived from resolveServiceStatus output + real origin.
// A switch on (status, primarySource) — the panel never re-classifies or invents a cause.
function build(serviceName: string, e: StatusExplanation): Block {
  const monConf = `Monitoring confidence: ${e.monitoringConfidence}`;
  const sourceLine = `Signal source: ${e.signalSourceLabel} · ${monConf}`;

  // ── UNKNOWN — non-measurable capability ──
  if (e.status === "UNKNOWN") {
    if (e.monitoringCapability === "BLOCKED_FROM_PROBES") {
      return {
        title: "DownForAI cannot reliably verify this service",
        body: `DownForAI cannot reliably verify ${serviceName} from its probe network. The service may block datacenter probes or bot traffic, so failed checks are NOT treated as a confirmed outage.`,
        sourceLine: `Signal source: ${e.signalSourceLabel} · Monitoring confidence: Low`,
        troubleshooting: "Community reports may help identify user-visible issues.",
        troubleshootingCollapsible: false,
      };
    }
    if (e.monitoringCapability === "UNVERIFIABLE") {
      return {
        title: "DownForAI cannot reliably verify this service",
        body: `DownForAI cannot reliably reach ${serviceName}. Not enough trustworthy signal to classify it as operational, degraded, or down.`,
        sourceLine: `Signal source: ${e.signalSourceLabel} · Monitoring confidence: Low`,
        troubleshooting: "Community reports may help identify user-visible issues.",
        troubleshootingCollapsible: false,
      };
    }
    return {
      title: "Status temporarily unknown",
      body: `DownForAI does not have enough recent probe data to confirm the current status of ${serviceName}. This is usually temporary.`,
      sourceLine,
      troubleshooting: "Check back in a few minutes, or see the provider's official status page.",
      troubleshootingCollapsible: false,
    };
  }

  // ── Community-reported (REPORTED_ISSUES / community-driven) ──
  if (e.status === "REPORTED_ISSUES" || e.primarySource === "COMMUNITY") {
    const conf = e.communityConfidence ? cap(e.communityConfidence) : "Probable";
    return {
      title: "Users are reporting issues",
      body: `DownForAI detected an unusual spike in community reports for ${serviceName}. Technical probes may still be reachable, so this is shown as a community-reported issue, not a probe-confirmed outage.`,
      sourceLine: `Reports: ${e.reportsInWindow} in the last 30 minutes · above normal for this service · Source: community reports (${conf})`,
      extraLine: "Technical probe status: reachable",
      troubleshooting: "If you rely on this service, check the provider's official channels and consider a fallback while reports remain elevated.",
      troubleshootingCollapsible: false,
    };
  }

  // ── OUTAGE — official or probe confirmed ──
  if (e.status === "OUTAGE") {
    if (e.primarySource === "OFFICIAL") {
      return {
        title: "Confirmed provider-side outage",
        body: `${serviceName}'s official status source reports an outage. DownForAI treats this as a confirmed incident.`,
        sourceLine,
        troubleshooting: "This is likely not something you can fix locally. Check the provider's official updates, retry later, or switch to a fallback.",
        troubleshootingCollapsible: false,
      };
    }
    return {
      title: "Confirmed provider-side outage",
      body: `DownForAI detected repeated hard failures from the monitored surface for ${serviceName}. Treated as a confirmed outage for the monitored endpoint.`,
      sourceLine: `Measured surface: ${measuredSurface(e.monitoringCapability)} · Signal: DownForAI probe · ${monConf}`,
      troubleshooting: "This is likely not something you can fix locally. Check the provider's official updates, retry later, or switch to a fallback.",
      troubleshootingCollapsible: false,
    };
  }

  // ── DEGRADED — official source (e.g. OpenAI Atlassian "minor") ──
  if (e.status === "DEGRADED" && e.primarySource === "OFFICIAL") {
    return {
      title: "Official status reports a degraded service",
      body: `${serviceName}'s official status source currently reports a partial degradation. DownForAI treats this as a confirmed provider-side issue.`,
      sourceLine,
      extraLine: e.officialComponentDetail
        ? `Affected: ${e.officialComponentDetail}`
        : "The official source did not provide component-level detail in the data DownForAI collected.",
      troubleshooting: "If affected, provider-side recovery may be required. You can check your account dashboard, retry later, or use a fallback.",
      troubleshootingCollapsible: false,
    };
  }

  // ── DEGRADED — technical probe ──
  if (e.status === "DEGRADED") {
    return {
      title: "Technical monitoring detected issues",
      body: `DownForAI detected repeated failures or degraded responses from the monitored surface for ${serviceName}. This may indicate a provider-side issue, depending on the monitored endpoint.`,
      sourceLine: `Measured surface: ${measuredSurface(e.monitoringCapability)} · Signal: DownForAI probe · ${monConf}`,
      troubleshooting: "If you use this in production, check the provider's official channels and consider a fallback while the signal remains degraded.",
      troubleshootingCollapsible: false,
    };
  }

  // ── OPERATIONAL ──
  return {
    title: "No confirmed provider-side issue detected",
    body: `DownForAI currently sees ${serviceName} as operational based on available monitoring signals.`,
    sourceLine,
    troubleshooting: "The issue may be account-specific, regional, network-related, or related to authentication, billing, quota, or rate limits.",
    troubleshootingCollapsible: true,
  };
}

export default function StatusExplanationPanel({ serviceName, explanation, surfaces }: Props) {
  const b = build(serviceName, explanation);
  const issueSurfaces = surfaces.filter((s) => s.status === "OUTAGE" || s.status === "DEGRADED");

  return (
    <div style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${PANEL}` }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: INK, margin: 0 }}>
          What DownForAI can verify about {serviceName}
        </h2>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Verdict — derived from resolveServiceStatus, never re-classified */}
        <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: INK, marginBottom: "6px" }}>{b.title}</div>
          <div style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6 }}>{b.body}</div>
          {b.extraLine && (
            <div style={{ fontSize: "12px", color: "#16A34A", marginTop: "8px", fontWeight: 600 }}>{b.extraLine}</div>
          )}
          <div className="mono" style={{ fontFamily: MONO, fontSize: "11px", color: FAINT, marginTop: "10px" }}>{b.sourceLine}</div>
        </div>

        {/* Probe summary (only meaningful when surfaces have issues) */}
        {issueSurfaces.length > 0 && (
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
              Monitored surfaces ({surfaces.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {issueSurfaces.map((s) => (
                <div key={s.surfaceId} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#374151" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: s.status === "OUTAGE" ? "#DC2626" : "#CA8A04", flexShrink: 0, display: "inline-block" }} />
                  <span style={{ fontWeight: 500 }}>{s.displayName}</span>
                  <span style={{ color: FAINT }}>
                    {s.status === "OUTAGE" ? "Outage" : "Degraded"}{s.latestHttpStatus ? ` · HTTP ${s.latestHttpStatus}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting — secondary, non-accusatory. Collapsible on healthy services. */}
        {b.troubleshootingCollapsible ? (
          <details style={{ borderTop: `1px solid ${PANEL}`, paddingTop: "14px" }}>
            <summary style={{ cursor: "pointer", fontSize: "13px", fontWeight: 600, color: ACCENT, userSelect: "none" }}>
              Still having trouble?
            </summary>
            <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6, margin: "8px 0 0" }}>{b.troubleshooting}</p>
          </details>
        ) : (
          <div style={{ borderTop: `1px solid ${PANEL}`, paddingTop: "14px", fontSize: "13px", color: MUTED, lineHeight: 1.6 }}>
            {b.troubleshooting}
          </div>
        )}
      </div>
    </div>
  );
}
