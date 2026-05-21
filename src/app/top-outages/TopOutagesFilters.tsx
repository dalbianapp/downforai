"use client";

import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

const PERIODS = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

const ALL_CATEGORIES = [
  { value: "all", label: "All" },
  ...CATEGORIES.map((c) => ({ value: c.slug, label: c.label })),
];

interface Props {
  currentPeriod: string;
  currentCategory: string;
}

export function TopOutagesFilters({ currentPeriod, currentCategory }: Props) {
  const router = useRouter();

  const navigate = (period: string, category: string) => {
    const params = new URLSearchParams();
    if (period !== "24h") params.set("period", period);
    if (category !== "all") params.set("category", category);
    const qs = params.toString();
    router.push(`/top-outages${qs ? `?${qs}` : ""}`);
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: active ? 700 : 500,
    background: active ? "#171717" : "#f5f5f5",
    color: active ? "#ffffff" : "#525252",
    border: "none",
    borderRadius: "9999px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "background 0.12s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Period filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => navigate(p.value, currentCategory)}
            style={btnStyle(currentPeriod === p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Category filter — horizontally scrollable */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
        {ALL_CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => navigate(currentPeriod, c.value)}
            style={btnStyle(currentCategory === c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
