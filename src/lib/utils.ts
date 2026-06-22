import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function formatLatency(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// Availability = non-OUTAGE rate. DEGRADED is NOT downtime (counted as up here),
// consistent with the service pages, leaderboard, and badges API. "Down" = OUTAGE only.
export function calculateUptimePercentage(statuses: string[]): number {
  const up = statuses.filter((s) => s === "OPERATIONAL" || s === "DEGRADED").length;
  return Math.round((up / statuses.length) * 100);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    LLM: "from-blue-500/20 to-blue-600/20",
    IMAGE: "from-purple-500/20 to-purple-600/20",
    VIDEO: "from-pink-500/20 to-pink-600/20",
    AUDIO: "from-green-500/20 to-green-600/20",
    DEV: "from-orange-500/20 to-orange-600/20",
    INFRA: "from-red-500/20 to-red-600/20",
    SEARCH: "from-cyan-500/20 to-cyan-600/20",
    PRODUCTIVITY: "from-yellow-500/20 to-yellow-600/20",
    AGENTS: "from-indigo-500/20 to-indigo-600/20",
    THREE_D: "from-teal-500/20 to-teal-600/20",
    DESIGN: "from-rose-500/20 to-rose-600/20",
    MLOPS: "from-violet-500/20 to-violet-600/20",
    VECTOR_DB: "from-emerald-500/20 to-emerald-600/20",
    ROLEPLAY: "from-fuchsia-500/20 to-fuchsia-600/20",
    MARKETING: "from-amber-500/20 to-amber-600/20",
    SUPPORT: "from-sky-500/20 to-sky-600/20",
    EDUCATION: "from-lime-500/20 to-lime-600/20",
    HR_AI: "from-orange-500/20 to-orange-600/20",
    LEGAL_AI: "from-slate-500/20 to-slate-600/20",
    SPORTS_BETTING: "from-green-500/20 to-green-600/20",
  };
  return colors[category] || "from-gray-500/20 to-gray-600/20";
}

export function getCategoryInitialBgColor(category: string): string {
  const colors: Record<string, string> = {
    LLM: "bg-blue-500",
    IMAGE: "bg-purple-500",
    VIDEO: "bg-pink-500",
    AUDIO: "bg-green-500",
    DEV: "bg-orange-500",
    INFRA: "bg-red-500",
    SEARCH: "bg-cyan-500",
    PRODUCTIVITY: "bg-yellow-500",
    AGENTS: "bg-indigo-500",
    THREE_D: "bg-teal-500",
    DESIGN: "bg-rose-500",
    MLOPS: "bg-violet-500",
    VECTOR_DB: "bg-emerald-500",
    ROLEPLAY: "bg-fuchsia-500",
    MARKETING: "bg-amber-500",
    SUPPORT: "bg-sky-500",
    EDUCATION: "bg-lime-500",
    HR_AI: "bg-orange-500",
    LEGAL_AI: "bg-slate-500",
    SPORTS_BETTING: "bg-green-600",
  };
  return colors[category] || "bg-gray-500";
}

export function getInitial(text: string): string {
  return text.charAt(0).toUpperCase();
}

export function formatCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    LLM: "LLM",
    IMAGE: "Image",
    VIDEO: "Video",
    AUDIO: "Audio",
    DEV: "Dev Tools",
    INFRA: "Infrastructure",
    SEARCH: "Search",
    PRODUCTIVITY: "Productivity",
    AGENTS: "Agents",
    THREE_D: "3D & Avatars",
    DESIGN: "Design",
    MLOPS: "MLOps",
    VECTOR_DB: "Vector DB",
    ROLEPLAY: "Roleplay AI",
    MARKETING: "Marketing AI",
    SUPPORT: "Support AI",
    EDUCATION: "Education AI",
    HR_AI: "HR & Recruitment AI",
    LEGAL_AI: "Legal AI",
    SPORTS_BETTING: "Sports Betting AI",
  };
  return labels[category] || category;
}

export function calculateWorstStatus(
  statuses: ("OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN")[]
): "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" {
  if (statuses.includes("OUTAGE")) return "OUTAGE";
  if (statuses.includes("DEGRADED")) return "DEGRADED";
  if (statuses.includes("UNKNOWN")) return "UNKNOWN";
  return "OPERATIONAL";
}
