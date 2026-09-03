"use client";

import { useState } from "react";
import { formatCategoryLabel } from "@/lib/utils";
import { TopOutagesFilters } from "./TopOutagesFilters";

export type Period = "24h" | "7d" | "30d" | "90d";

export type ReportedService = {
  id: string;
  name: string;
  slug: string;
  category: string;
  reportCount: number;
  currentStatus: string | null;
};

const PERIOD_LABELS: Record<Period, string> = {
  "24h": "last 24 hours",
  "7d": "last 7 days",
  "30d": "last 30 days",
  "90d": "last 90 days",
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const TOP_N = 20;

function isPeriod(value: string): value is Period {
  return value === "24h" || value === "7d" || value === "30d" || value === "90d";
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "UNKNOWN";
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    OPERATIONAL: { bg: "#dcfce7", color: "#166534", label: "Operational" },
    DEGRADED: { bg: "#fef3c7", color: "#92400e", label: "Degraded" },
    OUTAGE: { bg: "#fee2e2", color: "#991b1b", label: "Outage" },
    UNKNOWN: { bg: "#f5f5f5", color: "#525252", label: "Unknown" },
  };
  const c = cfg[s] ?? cfg.UNKNOWN;
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      padding: "2px 8px",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: 600,
      whiteSpace: "nowrap" as const,
    }}>
      {c.label}
    </span>
  );
}

// Client-side filtering over a static snapshot (all services with reports, per
// period). The server renders this page once per ISR window; switching period or
// category never triggers a request, so crawlers cannot fan out into dozens of
// dynamic variants that each hit the database.
export function TopOutagesBoard({ data }: { data: Record<Period, ReportedService[]> }) {
  const [period, setPeriod] = useState<Period>("24h");
  const [category, setCategory] = useState("all");

  const categoryEnum = category.toUpperCase().replace(/-/g, "_");
  const services = data[period]
    .filter((s) => category === "all" || s.category === categoryEnum)
    .slice(0, TOP_N);
  const top3 = services.slice(0, 3);
  const rest = services.slice(3);

  const onChange = (nextPeriod: string, nextCategory: string) => {
    if (isPeriod(nextPeriod)) setPeriod(nextPeriod);
    setCategory(nextCategory);
  };

  return (
    <>
      {/* Filters */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
        <TopOutagesFilters currentPeriod={period} currentCategory={category} onChange={onChange} />
      </div>

      {/* No results */}
      {services.length === 0 && (
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "12px",
          padding: "48px 32px",
          textAlign: "center" as const,
          marginBottom: "24px",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#166534", marginBottom: "8px" }}>
            No outages reported in this period
          </div>
          <div style={{ fontSize: "14px", color: "#16a34a" }}>
            The AI ecosystem is running smoothly.
          </div>
        </div>
      )}

      {/* Podium — top 3 */}
      {top3.length > 0 && (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" as const, marginBottom: "16px" }}>
          {top3.map((service, i) => (
            <div key={service.id} style={{
              flex: "1 1 200px",
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center" as const,
              boxShadow: i === 0 ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
            }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{RANK_MEDALS[i]}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#a3a3a3", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "6px" }}>
                {formatCategoryLabel(service.category)}
              </div>
              <a href={`/${service.slug}`} style={{ fontSize: "15px", fontWeight: 700, color: "#171717", textDecoration: "none", display: "block", marginBottom: "10px" }}>
                {service.name}
              </a>
              <div style={{ marginBottom: "10px" }}>
                <StatusBadge status={service.currentStatus} />
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#dc2626" }}>
                {service.reportCount}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                report{service.reportCount !== 1 ? "s" : ""} ({PERIOD_LABELS[period]})
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rank 4–20 */}
      {rest.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
          {rest.map((service, i) => (
            <div key={service.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 20px",
              borderBottom: i < rest.length - 1 ? "1px solid #f5f5f5" : "none",
            }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#a3a3a3", minWidth: "28px", flexShrink: 0 }}>
                #{i + 4}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a href={`/${service.slug}`} style={{ fontSize: "15px", fontWeight: 600, color: "#171717", textDecoration: "none" }}>
                  {service.name}
                </a>
                <div style={{ fontSize: "12px", color: "#a3a3a3", marginTop: "1px" }}>
                  {formatCategoryLabel(service.category)}
                </div>
              </div>
              <StatusBadge status={service.currentStatus} />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#dc2626", minWidth: "32px", textAlign: "right" as const, flexShrink: 0 }}>
                {service.reportCount}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
