"use client";

import Link from "next/link";
import { ServiceStatus } from "@prisma/client";
import { getPerformanceColor, type PerformanceLevel } from "@/lib/performance";

interface ServiceCardProps {
  slug: string;
  name: string;
  category: string;
  status: ServiceStatus;
  sparklineData: number[];
  latencyMs?: number | null;
  performanceLevel: PerformanceLevel;
}

const statusColors: Record<string, string> = {
  OPERATIONAL: "#16a34a",
  DEGRADED: "#f59e0b",
  OUTAGE: "#ef4444",
  UNKNOWN: "#6b7280",
};

// Catmull-Rom → Bézier cubiques (courbes lissées pro)
function sparklinePath(values: number[], width: number, height: number): string {
  const n = values.length;
  if (n < 2) return "";
  const padding = 2;
  const tension = 0.25;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1e-9, max - min);
  const w = width - padding * 2;
  const h = height - padding * 2;
  const stepX = w / (n - 1);

  const pts = values.map((v, i) => ({
    x: padding + i * stepX,
    y: padding + (1 - (v - min) / range) * h,
  }));

  const clamp = (i: number) => pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

  for (let i = 0; i < n - 1; i++) {
    const p0 = clamp(i - 1);
    const p1 = clamp(i);
    const p2 = clamp(i + 1);
    const p3 = clamp(i + 2);
    const c1x = p1.x + (p2.x - p0.x) * tension / 6;
    const c1y = p1.y + (p2.y - p0.y) * tension / 6;
    const c2x = p2.x - (p3.x - p1.x) * tension / 6;
    const c2y = p2.y - (p3.y - p1.y) * tension / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export function ServiceCard({ slug, name, category: _category, status, sparklineData, latencyMs, performanceLevel }: ServiceCardProps) {
  // Dual color system: status color for dot, performance color for sparkline
  const dotColor = statusColors[status] || "#6b7280";
  const sparkColor = (status === "OUTAGE" || status === "UNKNOWN")
    ? dotColor
    : getPerformanceColor(performanceLevel);

  const hasIssue = status === "OUTAGE" || status === "DEGRADED" || performanceLevel !== "NORMAL";

  // Card background and border based on status and performance
  const cardBg =
    status === "OUTAGE" ? "#fef2f2" :
    status === "DEGRADED" ? "#fefce8" :
    performanceLevel === "SEVERE" ? "#fef2f2" :
    performanceLevel === "ELEVATED" ? "#fffbeb" :
    "#ffffff";

  const cardBorder =
    status === "OUTAGE" ? "#fecaca" :
    status === "DEGRADED" ? "#fef08a" :
    performanceLevel === "SEVERE" ? "#fecaca" :
    performanceLevel === "ELEVATED" ? "#fef3c7" :
    "#f0f0f0";

  const svgW = 140;
  const svgH = 24;
  const pathD = sparklineData.length >= 2 ? sparklinePath(sparklineData, svgW, svgH) : "";

  const lastPt = sparklineData.length >= 2 ? (() => {
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = Math.max(1e-9, max - min);
    const h = svgH - 4;
    const t = (sparklineData[sparklineData.length - 1] - min) / range;
    return { x: svgW - 2, y: 2 + (1 - t) * h };
  })() : null;

  return (
    <Link href={`/${slug}`}>
      <div
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '12px',
          padding: '12px',
          transition: 'all 0.15s ease',
          cursor: 'pointer',
          height: '100%',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
          e.currentTarget.style.borderColor = hasIssue
            ? (cardBorder === '#fecaca' ? '#fca5a5' : cardBorder === '#fef08a' ? '#fde047' : cardBorder === '#fef3c7' ? '#fde68a' : '#e5e5e5')
            : '#e5e5e5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = cardBorder;
        }}
      >
        {/* Nom + dot */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: dotColor,
              flexShrink: 0,
              marginTop: '5px',
              boxShadow: hasIssue ? `0 0 6px ${dotColor}40` : 'none',
            }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#171717',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
              minHeight: '36px',
              flex: 1,
            }}
          >
            {name}
          </span>
        </div>

        {/* Sparkline Bézier lissée */}
        <div style={{ height: svgH }}>
          <svg
            width="100%"
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            preserveAspectRatio="none"
            style={{ display: 'block', opacity: 0.6 }}
          >
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={sparkColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {lastPt && (
              <circle cx={lastPt.x} cy={lastPt.y} r={2} fill={sparkColor} />
            )}
          </svg>
        </div>

        {/* Latency */}
        {latencyMs && (
          <div style={{ fontSize: "11px", color: "#a3a3a3", textAlign: "right", marginTop: "2px" }}>
            {latencyMs}ms
          </div>
        )}
      </div>
    </Link>
  );
}
