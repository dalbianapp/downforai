"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { SpeedIndexRow } from "@/lib/speed-index/getSpeedIndex";

type Timeframe = "7d" | "24h";
type SortKey = "p50" | "p95" | "uptime" | "trend24h" | "reports24h" | "incidents7d";
type SortDir = "asc" | "desc";

const STATUS_DOT: Record<string, string> = {
  OPERATIONAL: "#16a34a",
  DEGRADED: "#ca8a04",
  OUTAGE: "#dc2626",
  UNKNOWN: "#a3a3a3",
};

const STATUS_LABEL: Record<string, string> = {
  OPERATIONAL: "OK",
  DEGRADED: "Degraded",
  OUTAGE: "Down",
  UNKNOWN: "?",
};

function fmtMs(v: number | null): string {
  if (v === null) return "—";
  return `${v}ms`;
}

function fmtPct(v: number | null): string {
  if (v === null) return "—";
  return `${v.toFixed(2)}%`;
}

function fmtTrend(v: number | null): { text: string; color: string } {
  if (v === null) return { text: "—", color: "#a3a3a3" };
  if (v < -20) return { text: `−${Math.abs(v)}ms`, color: "#16a34a" };
  if (v > 20) return { text: `+${v}ms`, color: "#dc2626" };
  return { text: "~stable", color: "#a3a3a3" };
}

function uptimeColor(v: number | null): string {
  if (v === null) return "#a3a3a3";
  if (v >= 99.9) return "#16a34a";
  if (v >= 99) return "#65a30d";
  if (v >= 95) return "#ca8a04";
  return "#dc2626";
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ChampionCard({
  emoji,
  label,
  value,
  provider,
  slug,
  valueColor = "#525252",
}: {
  emoji: string;
  label: string;
  value: string;
  provider: string | null;
  slug: string | null;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: "22px", marginBottom: "8px" }}>{emoji}</div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "#a3a3a3",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>
      {slug ? (
        <Link href={`/${slug}`} style={{ textDecoration: "none" }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#171717",
              marginBottom: "3px",
              lineHeight: 1.2,
            }}
          >
            {provider}
          </div>
        </Link>
      ) : (
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#a3a3a3",
            marginBottom: "3px",
          }}
        >
          —
        </div>
      )}
      <div
        style={{
          fontSize: "13px",
          fontFamily: "monospace",
          color: valueColor,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SortTh({
  label,
  colKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  colKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = current === colKey;
  return (
    <th
      onClick={() => onSort(colKey)}
      style={{
        padding: "10px 8px",
        textAlign: "right",
        fontWeight: 600,
        fontSize: "13px",
        color: isActive ? "#171717" : "#525252",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <span style={{ color: "#a3a3a3", marginLeft: "3px", fontSize: "11px" }}>
        {isActive ? (dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </th>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  data: SpeedIndexRow[];
  generatedAt: string;
}

export function SpeedIndexTable({ data, generatedAt }: Props) {
  const [timeframe, setTimeframe] = useState<Timeframe>("7d");
  const [sortKey, setSortKey] = useState<SortKey>("p50");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [copied, setCopied] = useState(false);

  const p50Of = (r: SpeedIndexRow) => (timeframe === "7d" ? r.p507d : r.p5024h);
  const p95Of = (r: SpeedIndexRow) => (timeframe === "7d" ? r.p957d : r.p9524h);
  const uptimeOf = (r: SpeedIndexRow) => (timeframe === "7d" ? r.uptime7d : r.uptime24h);

  const sortedData = useMemo(() => {
    const getVal = (r: SpeedIndexRow): number | null => {
      switch (sortKey) {
        case "p50":         return timeframe === "7d" ? r.p507d : r.p5024h;
        case "p95":         return timeframe === "7d" ? r.p957d : r.p9524h;
        case "uptime":      return timeframe === "7d" ? r.uptime7d : r.uptime24h;
        case "trend24h":    return r.trend24h;
        case "reports24h":  return r.reports24h;
        case "incidents7d": return r.incidents7d;
        default:            return null;
      }
    };

    return [...data].sort((a, b) => {
      const aVal = getVal(a);
      const bVal = getVal(b);
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [data, timeframe, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Uptime: higher is better → default descending
      setSortDir(key === "uptime" ? "desc" : "asc");
    }
  }

  // Champion cards — always computed from the full dataset
  const fastest = data
    .filter((r) => p50Of(r) !== null)
    .sort((a, b) => (p50Of(a) ?? Infinity) - (p50Of(b) ?? Infinity))[0] ?? null;

  const mostReliable = data
    .filter((r) => uptimeOf(r) !== null)
    .sort((a, b) => (uptimeOf(b) ?? 0) - (uptimeOf(a) ?? 0))[0] ?? null;

  const biggestImprover = data
    .filter((r) => r.trend24h !== null && r.trend24h < -20)
    .sort((a, b) => (a.trend24h ?? 0) - (b.trend24h ?? 0))[0] ?? null;

  const mostReported = data
    .filter((r) => r.reports24h > 0)
    .sort((a, b) => b.reports24h - a.reports24h)[0] ?? null;

  function copyMarkdown() {
    const tfLabel = timeframe === "7d" ? "7d" : "24h";
    const header = `| # | Provider | Status | p50 ${tfLabel} | p95 ${tfLabel} | Uptime ${tfLabel} | Trend 24h | Incidents 7d | Reports 24h |`;
    const sep = `|---|---|---|---|---|---|---|---|---|`;
    const rows = sortedData.map((r, i) => {
      const trend = fmtTrend(r.trend24h);
      return `| ${i + 1} | [${r.name}](https://downforai.com/${r.slug}) | ${r.latestStatus} | ${fmtMs(p50Of(r))} | ${fmtMs(p95Of(r))} | ${fmtPct(uptimeOf(r))} | ${trend.text} | ${r.incidents7d} | ${r.reports24h} |`;
    });
    const md = [
      `## LLM Speed Index — Last ${tfLabel} — downforai.com/speed-index`,
      "",
      header,
      sep,
      ...rows,
      "",
      `*Source: [DownForAI Speed Index](https://downforai.com/speed-index). Latency is endpoint response time, not tokens/s.*`,
    ].join("\n");

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const genLabel = (() => {
    const d = new Date(generatedAt);
    const mins = Math.round((Date.now() - d.getTime()) / 60_000);
    if (mins < 2) return "< 2 min ago";
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)}h ago`;
  })();

  const thBaseStyle: React.CSSProperties = {
    padding: "10px 8px",
    textAlign: "left" as const,
    fontWeight: 600,
    fontSize: "13px",
    color: "#525252",
    whiteSpace: "nowrap" as const,
  };
  const tdBaseStyle: React.CSSProperties = {
    padding: "10px 8px",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "middle",
  };

  return (
    <div>
      {/* Champion cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        <ChampionCard
          emoji="⚡"
          label="Fastest API"
          value={fastest ? `${fmtMs(p50Of(fastest))} p50` : "—"}
          provider={fastest?.name ?? null}
          slug={fastest?.slug ?? null}
          valueColor="#2563eb"
        />
        <ChampionCard
          emoji="✅"
          label="Most Reliable"
          value={mostReliable ? `${fmtPct(uptimeOf(mostReliable))} uptime` : "—"}
          provider={mostReliable?.name ?? null}
          slug={mostReliable?.slug ?? null}
          valueColor="#16a34a"
        />
        <ChampionCard
          emoji="📈"
          label="Biggest Improvement"
          value={
            biggestImprover
              ? `${Math.abs(biggestImprover.trend24h!)}ms faster vs yesterday`
              : "no movers yet"
          }
          provider={biggestImprover?.name ?? null}
          slug={biggestImprover?.slug ?? null}
          valueColor={biggestImprover ? "#16a34a" : "#a3a3a3"}
        />
        <ChampionCard
          emoji="🔔"
          label="Most Reported 24h"
          value={mostReported ? `${mostReported.reports24h} reports` : "all clear"}
          provider={mostReported?.name ?? null}
          slug={mostReported?.slug ?? null}
          valueColor={mostReported ? "#dc2626" : "#16a34a"}
        />
      </div>

      {/* Controls row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        {/* Window toggle */}
        <div
          style={{
            display: "flex",
            gap: "3px",
            background: "#f0f0f0",
            borderRadius: "8px",
            padding: "3px",
          }}
        >
          {(["7d", "24h"] as const).map((w) => (
            <button
              key={w}
              onClick={() => setTimeframe(w)}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                transition: "all 0.1s",
                background: timeframe === w ? "#ffffff" : "transparent",
                color: timeframe === w ? "#171717" : "#737373",
                boxShadow: timeframe === w ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              Last {w === "7d" ? "7 days" : "24 hours"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#a3a3a3" }}>
            {data.length} providers · updated {genLabel}
          </span>
          <button
            onClick={copyMarkdown}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid #e5e5e5",
              background: copied ? "#f0fdf4" : "#ffffff",
              color: copied ? "#16a34a" : "#525252",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {copied ? "✓ Copied!" : "Copy as Markdown"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e5e5e5" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr
              style={{
                background: "#fafafa",
                borderBottom: "2px solid #e5e5e5",
              }}
            >
              <th style={{ ...thBaseStyle, width: "40px" }}>#</th>
              <th style={thBaseStyle}>Provider</th>
              <th style={thBaseStyle}>Status</th>
              <SortTh
                label={`p50 ${timeframe}`}
                colKey="p50"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortTh
                label={`p95 ${timeframe}`}
                colKey="p95"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortTh
                label={`Uptime ${timeframe}`}
                colKey="uptime"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortTh
                label="Trend 24h"
                colKey="trend24h"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortTh
                label="Incidents 7d"
                colKey="incidents7d"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortTh
                label="Reports 24h"
                colKey="reports24h"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((r, i) => {
              const p50 = p50Of(r);
              const p95 = p95Of(r);
              const uptime = uptimeOf(r);
              const trend = fmtTrend(r.trend24h);
              const dotColor = STATUS_DOT[r.latestStatus] ?? "#a3a3a3";

              return (
                <tr
                  key={r.slug}
                  style={{ background: i % 2 === 0 ? "#ffffff" : "#fafafa" }}
                >
                  <td style={{ ...tdBaseStyle, color: "#a3a3a3", fontSize: "12px", fontWeight: 500 }}>
                    {i + 1}
                  </td>
                  <td style={tdBaseStyle}>
                    <Link
                      href={`/${r.slug}`}
                      style={{ color: "#171717", fontWeight: 600, textDecoration: "none" }}
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td style={tdBaseStyle}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: dotColor,
                          flexShrink: 0,
                          display: "inline-block",
                        }}
                      />
                      <span style={{ fontSize: "12px", color: "#737373" }}>
                        {STATUS_LABEL[r.latestStatus] ?? "?"}
                      </span>
                    </span>
                  </td>
                  <td
                    style={{
                      ...tdBaseStyle,
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: "#171717",
                    }}
                  >
                    {p50 !== null ? `${p50}ms` : <span style={{ color: "#a3a3a3" }}>—</span>}
                  </td>
                  <td
                    style={{
                      ...tdBaseStyle,
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: "#737373",
                    }}
                  >
                    {p95 !== null ? `${p95}ms` : <span style={{ color: "#a3a3a3" }}>—</span>}
                  </td>
                  <td
                    style={{
                      ...tdBaseStyle,
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: uptimeColor(uptime),
                      fontWeight: 500,
                    }}
                  >
                    {uptime !== null ? `${uptime.toFixed(2)}%` : <span style={{ color: "#a3a3a3" }}>—</span>}
                  </td>
                  <td
                    style={{
                      ...tdBaseStyle,
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      color: trend.color,
                    }}
                  >
                    {trend.text}
                  </td>
                  <td style={{ ...tdBaseStyle, textAlign: "right" }}>
                    {r.incidents7d > 0 ? (
                      <Link
                        href={`/incidents/service/${r.slug}`}
                        style={{
                          color: "#dc2626",
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        {r.incidents7d}
                      </Link>
                    ) : (
                      <span style={{ color: "#16a34a", fontWeight: 500 }}>0</span>
                    )}
                  </td>
                  <td style={{ ...tdBaseStyle, textAlign: "right" }}>
                    {r.reports24h > 0 ? (
                      <span style={{ color: "#ca8a04", fontWeight: 600 }}>
                        {r.reports24h}
                      </span>
                    ) : (
                      <span style={{ color: "#a3a3a3" }}>0</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {sortedData.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{ padding: "40px", textAlign: "center", color: "#a3a3a3" }}
                >
                  No data available — check back shortly.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
