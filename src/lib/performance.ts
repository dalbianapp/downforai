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
  const baseline = Math.min(Math.max(med, 200), 5000);
  return { baseline, mad: m, points: clean.length };
}

function classifyPoint(latency: number, baseline: number): "NORMAL" | "ELEVATED" | "SEVERE" {
  const elevatedRel = Math.max(baseline * 3, baseline + 800);
  const severeRel = Math.max(baseline * 6, baseline + 2000);
  if (latency >= severeRel || latency >= 6000) return "SEVERE";
  if (latency >= elevatedRel || latency >= 2000) return "ELEVATED";
  return "NORMAL";
}

function smoothLevel(pointLevels: Array<"NORMAL" | "ELEVATED" | "SEVERE">): PerformanceLevel {
  const w = pointLevels.slice(0, 5);
  const severeCount = w.filter((x) => x === "SEVERE").length;
  const nonNormalCount = w.filter((x) => x !== "NORMAL").length;
  if (severeCount >= 2) return "SEVERE";
  if (nonNormalCount >= 3) return "ELEVATED";
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
  const pointLevels = validLatencies.map((x) => classifyPoint(x, baseline));
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
