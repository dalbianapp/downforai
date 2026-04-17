import type { SurfaceSnapshot, DiagnosisResult } from "./types";

export function classifyServiceIssue(input: {
  surfaces: SurfaceSnapshot[];
  reports24h: number;
  reports2h: number;
  hasOpenIncident: boolean;
}): DiagnosisResult {
  const { surfaces, reports2h, hasOpenIncident } = input;

  const degradedSurfaces = surfaces.filter((s) => s.status === "DEGRADED");
  const outageSurfaces = surfaces.filter((s) => s.status === "OUTAGE");
  const unknownSurfaces = surfaces.filter((s) => s.status === "UNKNOWN");
  const allProbesHealthy =
    degradedSurfaces.length === 0 && outageSurfaces.length === 0;

  // 1. Global outage
  if (hasOpenIncident || outageSurfaces.length >= 2) {
    return {
      label: "Likely provider-side issue",
      scope: "global",
      confidence: "HIGH",
      reasons: [
        hasOpenIncident ? "Official incident currently open" : null,
        outageSurfaces.length >= 2
          ? `${outageSurfaces.length} surfaces reporting outage`
          : null,
        reports2h > 10 ? `${reports2h} user reports in last 2 hours` : null,
      ].filter(Boolean) as string[],
    };
  }

  // 2. Partial issue
  if (
    (degradedSurfaces.length + outageSurfaces.length >= 1 && reports2h >= 5) ||
    (outageSurfaces.length === 1 && degradedSurfaces.length === 0)
  ) {
    const affectedNames = [...outageSurfaces, ...degradedSurfaces]
      .map((s) => s.displayName)
      .join(", ");
    return {
      label: "Likely partial provider issue",
      scope: "partial",
      confidence: "MEDIUM",
      reasons: [
        `Affected surfaces: ${affectedNames}`,
        reports2h > 0 ? `${reports2h} user reports in last 2 hours` : null,
        "Other surfaces appear healthy",
      ].filter(Boolean) as string[],
    };
  }

  // 3. Local/client issue
  if (allProbesHealthy && reports2h < 3) {
    return {
      label: "Likely local or client-side issue",
      scope: "local",
      confidence: "MEDIUM",
      reasons: [
        "All monitored surfaces operational",
        reports2h === 0
          ? "No recent user reports"
          : `Only ${reports2h} user reports (below threshold)`,
        "Check your network, credentials, or rate limits",
      ],
    };
  }

  // 4. Inconclusive
  return {
    label: "Monitoring data inconclusive",
    scope: "unknown",
    confidence: "LOW",
    reasons: [
      unknownSurfaces.length > 0
        ? `${unknownSurfaces.length} surfaces returning unknown status`
        : null,
      "Insufficient signal to determine scope",
      "Check official status page for confirmation",
    ].filter(Boolean) as string[],
  };
}
