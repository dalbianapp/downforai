"use client";

import Link from "next/link";
import { ServiceStatus, BadgeType } from "@prisma/client";
import { StatusBadge } from "../status/StatusBadge";
import { AreaChart } from "../status/AreaChart";
import { getPerformanceColor, type PerformanceLevel } from "@/lib/performance";

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

interface BentoService {
  slug: string;
  name: string;
  description: string | null;
  status: ServiceStatus;
  badgeType: BadgeType;
  sparklineData: number[];
  latencyMs: number | null;
  performanceLevel: PerformanceLevel;
}

interface BentoSectionProps {
  services: BentoService[];
}

export function BentoSection({ services }: BentoSectionProps) {
  // Sort: outage > degraded > unknown > operational
  const sorted = [...services].sort((a, b) => {
    const order = { OUTAGE: 0, DEGRADED: 1, UNKNOWN: 2, OPERATIONAL: 3 };
    return order[a.status] - order[b.status];
  });

  // Get featured services (top 4)
  const featured = sorted.slice(0, 4);
  const [main, second, third, fourth] = featured;

  if (!main) return null;

  // Status-based styling
  const getStatusBorder = (status: ServiceStatus) => {
    switch (status) {
      case 'OUTAGE': return '#fde8e8';      // Rouge TRÈS léger (au lieu de #fecaca)
      case 'DEGRADED': return '#fef9c3';     // Jaune très léger
      case 'OPERATIONAL': return '#dcfce7';  // Vert très léger
      default: return 'var(--border)';
    }
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'OUTAGE': return '#dc2626';
      case 'DEGRADED': return '#ca8a04';
      case 'OPERATIONAL': return '#16a34a';
      default: return '#737373';
    }
  };

  // Get chart color: use status color for OUTAGE/UNKNOWN, otherwise use performance color
  const getChartColor = (status: ServiceStatus, performanceLevel: PerformanceLevel) => {
    if (status === 'OUTAGE' || status === 'UNKNOWN') {
      return getStatusColor(status);
    }
    return getPerformanceColor(performanceLevel);
  };

  const getStatusShadow = (status: ServiceStatus) => {
    switch (status) {
      case 'OUTAGE': return '0 1px 3px rgba(220, 38, 38, 0.04)';
      case 'DEGRADED': return '0 1px 3px rgba(202, 138, 4, 0.04)';
      case 'OPERATIONAL': return '0 1px 3px rgba(22, 163, 74, 0.04)';
      default: return '0 1px 3px rgba(0,0,0,0.03)';
    }
  };

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        {/* Main card - large with AreaChart (left, spans 2 rows) */}
        <Link
          href={`/${main.slug}`}
          className="md:row-span-2 rounded-[20px] transition-all duration-300 flex flex-col hover:scale-[1.01] cursor-pointer"
          style={{
            background: 'var(--surface)',
            border: `1px solid ${getStatusBorder(main.status)}`,
            boxShadow: getStatusShadow(main.status),
            padding: '36px',
          }}
        >
          <StatusBadge status={main.status} size="lg" />
          <h3
            className="font-extrabold mt-4 mb-2"
            style={{
              fontSize: '36px',
              letterSpacing: '-1.5px',
              color: 'var(--text)',
              lineHeight: 1.1,
            }}
          >
            {main.name}
          </h3>
          {main.description && (
            <p className="mb-6" style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
              {main.description}
            </p>
          )}
          <div className="mt-auto">
            <AreaChart
              data={main.sparklineData}
              color={getChartColor(main.status, main.performanceLevel)}
              height={80}
            />
          </div>
        </Link>

        {/* Right column container */}
        <div className="flex flex-col gap-4">
          {/* Second card - medium with AreaChart (top right) */}
          {second && (
            <Link
              href={`/${second.slug}`}
              className="rounded-[20px] transition-all duration-300 hover:scale-[1.01] cursor-pointer"
              style={{
                background: 'var(--surface)',
                border: `1px solid ${getStatusBorder(second.status)}`,
                boxShadow: getStatusShadow(second.status),
                padding: '24px',
              }}
            >
              <StatusBadge status={second.status} size="sm" />
              <h4
                className="font-bold mt-3 mb-2"
                style={{ fontSize: '20px', color: 'var(--text)' }}
              >
                {second.name}
              </h4>
              {second.description && (
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  {second.description}
                </p>
              )}
              <AreaChart
                data={second.sparklineData}
                color={getChartColor(second.status, second.performanceLevel)}
                height={45}
              />
            </Link>
          )}

          {/* Bottom row - two small cards side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Third card - small with Sparkline */}
            {third && (
              <Link
                href={`/${third.slug}`}
                className="rounded-[20px] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${getStatusBorder(third.status)}`,
                  boxShadow: getStatusShadow(third.status),
                  padding: '20px',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getStatusColor(third.status) }}
                  />
                  <h5
                    className="font-semibold"
                    style={{ fontSize: '14px', color: 'var(--text)' }}
                  >
                    {third.name}
                  </h5>
                </div>
                <div className="flex flex-col gap-2">
                  <svg width="100%" height={28} viewBox="0 0 120 28" preserveAspectRatio="none">
                    <path
                      d={sparklinePath(third.sparklineData, 120, 28)}
                      fill="none"
                      stroke={getChartColor(third.status, third.performanceLevel)}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className="text-xs font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {third.latencyMs ? `${third.latencyMs}ms` : '—'}
                  </span>
                </div>
              </Link>
            )}

            {/* Fourth card - small with Sparkline */}
            {fourth && (
              <Link
                href={`/${fourth.slug}`}
                className="rounded-[20px] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${getStatusBorder(fourth.status)}`,
                  boxShadow: getStatusShadow(fourth.status),
                  padding: '20px',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getStatusColor(fourth.status) }}
                  />
                  <h5
                    className="font-semibold"
                    style={{ fontSize: '14px', color: 'var(--text)' }}
                  >
                    {fourth.name}
                  </h5>
                </div>
                <div className="flex flex-col gap-2">
                  <svg width="100%" height={28} viewBox="0 0 120 28" preserveAspectRatio="none">
                    <path
                      d={sparklinePath(fourth.sparklineData, 120, 28)}
                      fill="none"
                      stroke={getChartColor(fourth.status, fourth.performanceLevel)}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className="text-xs font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {fourth.latencyMs ? `${fourth.latencyMs}ms` : '—'}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
