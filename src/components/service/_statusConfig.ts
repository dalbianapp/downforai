export type StatusKey = "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | "REPORTED_ISSUES";

export const STATUS_CONFIG: Record<
  StatusKey,
  { dot: string; bg: string; border: string; text: string; label: string }
> = {
  OPERATIONAL: {
    dot: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#166534",
    label: "Operational",
  },
  REPORTED_ISSUES: {
    dot: "#f59e0b",
    bg: "#fffbeb",
    border: "#fef3c7",
    text: "#92400e",
    label: "Reported Issues",
  },
  DEGRADED: {
    dot: "#ca8a04",
    bg: "#fefce8",
    border: "#fef08a",
    text: "#854d0e",
    label: "Degraded",
  },
  OUTAGE: {
    dot: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    text: "#991b1b",
    label: "Outage",
  },
  UNKNOWN: {
    dot: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e5e5",
    text: "#374151",
    label: "Unknown",
  },
};

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[(status as StatusKey) ?? "UNKNOWN"] ?? STATUS_CONFIG.UNKNOWN;
}

export function getRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
