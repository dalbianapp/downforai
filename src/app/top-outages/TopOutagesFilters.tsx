"use client";

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
  // Filters are pure client state now (no query-string navigation): the page is
  // static/ISR and must not depend on searchParams, otherwise every crawler hit
  // renders it dynamically and wakes the database.
  onChange: (period: string, category: string) => void;
}

export function TopOutagesFilters({ currentPeriod, currentCategory, onChange }: Props) {
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
            onClick={() => onChange(p.value, currentCategory)}
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
            onClick={() => onChange(currentPeriod, c.value)}
            style={btnStyle(currentCategory === c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
