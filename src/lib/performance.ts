export type PerformanceLevel = "UNKNOWN" | "NORMAL" | "ELEVATED" | "SEVERE";

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mad(values: number[], med: number): number {
  const deviations = values.map((v) => Math.abs(v - med));
  return median(deviations);
}

interface BaselineResult { baseline: number; mad: number; points: number; }

export function computeBaseline(latencies: number[]): BaselineResult {
  const clean = latencies.filter((x) => Number.isFinite(x) && x > 0);
  if (clean.length < 8) return { baseline: 800, mad: 200, points: clean.length };
  const med = median(clean);
  const m = mad(clean, med);
  const baseline = Math.min(Math.max(med, 350), 5000);
  return { baseline, mad: m, points: clean.length };
}

function classifyPoint(
  latency: number,
  baseline: number,
  isBootstrap: boolean
): "NORMAL" | "ELEVATED" | "SEVERE" {
  const elevatedMult = isBootstrap ? 3.5 : 2.5;
  const severeMult = isBootstrap ? 6 : 5;
  const absElevated = isBootstrap ? 1500 : 1200;
  const absSevere = isBootstrap ? 3000 : 2500;

  const elevatedRel = Math.max(baseline * elevatedMult, baseline + 800);
  const severeRel = Math.max(baseline * severeMult, baseline + 2000);

  if (latency >= severeRel || latency >= absSevere) return "SEVERE";
  if (latency >= elevatedRel || latency >= absElevated) return "ELEVATED";
  return "NORMAL";
}

function smoothLevel(
  pointLevels: Array<"NORMAL" | "ELEVATED" | "SEVERE">
): PerformanceLevel {
  const window = pointLevels.slice(0, 3);
  const severeCount = window.filter((x) => x === "SEVERE").length;
  const elevatedCount = window.filter((x) => x !== "NORMAL").length;

  if (severeCount >= 2) return "SEVERE";
  if (elevatedCount >= 2) return "ELEVATED";
  return "NORMAL";
}

export interface PerformanceResult { level: PerformanceLevel; baseline: number; baselinePoints: number; }

export function computeSurfacePerformance(opts: {
  last72hLatencies: number[];
  last5Latencies: number[];
  lastObservedAt?: Date | null;
}): PerformanceResult {
  const validLatencies = opts.last5Latencies.filter((x) => Number.isFinite(x) && x > 0);
  if (validLatencies.length < 3) {
    return { level: "UNKNOWN", baseline: 0, baselinePoints: 0 };
  }
  if (opts.lastObservedAt) {
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
    if (opts.lastObservedAt.getTime() < threeHoursAgo) {
      return { level: "UNKNOWN", baseline: 0, baselinePoints: 0 };
    }
  }
  const { baseline, points } = computeBaseline(opts.last72hLatencies);

  // Guard: baseline pas encore fiable (moins de 24h de données)
  const isBootstrap = points < 48;
  if (points < 24) {
    return { level: "NORMAL", baseline, baselinePoints: points };
  }

  const pointLevels = validLatencies.map((x) => classifyPoint(x, baseline, isBootstrap));
  const level = smoothLevel(pointLevels);
  return { level, baseline, baselinePoints: points };
}

export function aggregateServicePerformance(levels: PerformanceLevel[]): PerformanceLevel {
  const nonUnknown = levels.filter((l) => l !== "UNKNOWN");
  if (nonUnknown.length === 0) return "UNKNOWN";
  if (nonUnknown.includes("SEVERE")) return "SEVERE";
  if (nonUnknown.includes("ELEVATED")) return "ELEVATED";
  return "NORMAL";
}

export function getPerformanceColor(level: PerformanceLevel): string {
  switch (level) {
    case "SEVERE": return "#ef4444";
    case "ELEVATED": return "#f59e0b";
    case "NORMAL": return "#16a34a";
    case "UNKNOWN": return "#6b7280";
  }
}

export function computePerformanceScore(lastLatency: number | null, baseline: number, level: PerformanceLevel): number {
  if (!lastLatency || baseline <= 0 || level === "UNKNOWN") return 0;
  const ratio = Math.min(lastLatency / baseline, 20);
  const severityWeight = level === "SEVERE" ? 2 : 1;
  return ratio * severityWeight;
}
