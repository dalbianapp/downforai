import type { TopServiceContent } from "@/content/top-services/types";

interface Props {
  topContent: TopServiceContent | null;
}

const COMMUNITY_ICON: Record<string, string> = {
  discord: "💬",
  reddit: "🟠",
  github: "⚫",
  forum: "🗣️",
  x: "✕",
};

export default function ProviderSpecificPanel({ topContent }: Props) {
  if (!topContent) return null;

  const hasCommunity = topContent.communityLinks.length > 0;
  const hasSurfaces = topContent.monitoredSurfaces.length > 0;
  const hasSegmentation = topContent.statusSegmentation && topContent.statusSegmentation.length > 0;
  const hasModels = topContent.modelFamilies && topContent.modelFamilies.length > 0;
  const hasLimits = topContent.commonLimits && topContent.commonLimits.length > 0;
  const hasEcosystem = topContent.ecosystemDependencies.length > 0;
  const hasOperatorNotes = topContent.operatorNotes.length > 0;
  const hasDiagnostics =
    (topContent.diagnosticHeaders && topContent.diagnosticHeaders.length > 0) ||
    (topContent.diagnosticCommands && topContent.diagnosticCommands.length > 0);

  const hasAnyContent =
    hasCommunity ||
    hasSurfaces ||
    hasSegmentation ||
    hasModels ||
    hasLimits ||
    hasEcosystem ||
    hasOperatorNotes ||
    hasDiagnostics;

  if (!hasAnyContent) return null;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
        <h2
          style={{ fontSize: "15px", fontWeight: 700, color: "#171717", margin: 0 }}
        >
          Provider details
        </h2>
        {topContent.providerSummary && (
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              margin: "6px 0 0",
              lineHeight: 1.6,
            }}
          >
            {topContent.providerSummary}
          </p>
        )}
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Community links */}
        {hasCommunity && (
          <div>
            <SectionTitle>Community channels</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
              {topContent.communityLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    color: "#374151",
                    background: "#f9fafb",
                    border: "1px solid #e5e5e5",
                    borderRadius: "999px",
                    padding: "5px 12px",
                    textDecoration: "none",
                  }}
                >
                  {COMMUNITY_ICON[link.type] ?? "🔗"} {link.label}
                  {link.verified && (
                    <span style={{ color: "#2563eb", fontSize: "10px" }}>✓</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Monitored surfaces */}
        {hasSurfaces && (
          <div>
            <SectionTitle>What we monitor</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
              {topContent.monitoredSurfaces.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "13px",
                  }}
                >
                  <CriticalityDot criticality={s.criticality} />
                  <div>
                    <span style={{ fontWeight: 600, color: "#171717" }}>{s.name}</span>
                    <span style={{ color: "#6b7280" }}> — {s.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status segmentation */}
        {hasSegmentation && (
          <div>
            <SectionTitle>Status page segments</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
              {topContent.statusSegmentation!.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "12px",
                    color: "#374151",
                    background: "#f5f5f5",
                    border: "1px solid #e5e5e5",
                    borderRadius: "6px",
                    padding: "3px 10px",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Model families */}
        {hasModels && (
          <div>
            <SectionTitle>Model families</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
              {topContent.modelFamilies!.map((m, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "12px",
                    color: "#374151",
                    background: "#f5f5f5",
                    border: "1px solid #e5e5e5",
                    borderRadius: "6px",
                    padding: "3px 10px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Common limits */}
        {hasLimits && (
          <div>
            <SectionTitle>Common limits &amp; quotas</SectionTitle>
            <ul
              style={{
                margin: "8px 0 0",
                padding: "0 0 0 18px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {topContent.commonLimits!.map((l, i) => (
                <li key={i} style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.5 }}>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ecosystem dependencies */}
        {hasEcosystem && (
          <div>
            <SectionTitle>Ecosystem dependencies</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
              {topContent.ecosystemDependencies.map((dep, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "12px",
                    color: "#374151",
                    background: "#f9fafb",
                    border: "1px solid #e5e5e5",
                    borderRadius: "6px",
                    padding: "3px 10px",
                  }}
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Operator notes */}
        {hasOperatorNotes && (
          <div>
            <SectionTitle>Operator notes</SectionTitle>
            <ul
              style={{
                margin: "8px 0 0",
                padding: "0 0 0 18px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {topContent.operatorNotes.map((note, i) => (
                <li key={i} style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.5 }}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Diagnostic headers */}
        {hasDiagnostics && (
          <div>
            <SectionTitle>Diagnostic signals</SectionTitle>
            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {topContent.diagnosticHeaders && topContent.diagnosticHeaders.map((h, i) => (
                <code
                  key={i}
                  style={{
                    fontSize: "12px",
                    color: "#374151",
                    background: "#f5f5f5",
                    border: "1px solid #e5e5e5",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    display: "block",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {h}
                </code>
              ))}
              {topContent.diagnosticCommands && topContent.diagnosticCommands.map((cmd, i) => (
                <code
                  key={`cmd-${i}`}
                  style={{
                    fontSize: "12px",
                    color: "#16a34a",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    display: "block",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  $ {cmd}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "12px",
        fontWeight: 700,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </div>
  );
}

function CriticalityDot({ criticality }: { criticality: string }) {
  const color =
    criticality === "critical"
      ? "#dc2626"
      : criticality === "high"
      ? "#ca8a04"
      : criticality === "medium"
      ? "#2563eb"
      : "#9ca3af";

  return (
    <div
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: color,
        flexShrink: 0,
        marginTop: "4px",
      }}
    />
  );
}
