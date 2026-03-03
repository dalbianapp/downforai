"use client";

import Link from "next/link";
import { ServiceStatus } from "@prisma/client";
import { Sparkline } from "./Sparkline";
import { formatCategoryLabel } from "@/lib/utils";

interface ServiceRowProps {
  slug: string;
  name: string;
  category: string;
  status: ServiceStatus;
  latencyMs: number | null;
  sparklineData: (number | null)[];
}

const statusConfig = {
  OPERATIONAL: {
    dotColor: "#16a34a",
    dotGlow: "none",
    bgColor: "transparent",
    borderColor: "transparent",
    badge: null,
  },
  DEGRADED: {
    dotColor: "#ca8a04",
    dotGlow: "0 0 8px rgba(202, 138, 4, 0.4)",
    bgColor: "#fefce8",
    borderColor: "#fef9c3",
    badge: { label: "Slow", color: "#854d0e", bg: "#fef9c3" },
  },
  OUTAGE: {
    dotColor: "#dc2626",
    dotGlow: "0 0 8px rgba(220, 38, 38, 0.4)",
    bgColor: "#fef2f2",
    borderColor: "#fde8e8",
    badge: { label: "Down", color: "#991b1b", bg: "#fecaca" },
  },
  UNKNOWN: {
    dotColor: "#737373",
    dotGlow: "none",
    bgColor: "transparent",
    borderColor: "transparent",
    badge: null,
  },
};

export function ServiceRow({ slug, name, category, status, latencyMs, sparklineData }: ServiceRowProps) {
  const config = statusConfig[status];

  return (
    <Link href={`/${slug}`}>
      <div
        className="flex items-center gap-3 rounded-xl transition-all duration-200 hover:brightness-[0.98]"
        style={{
          padding: '14px 12px',
          backgroundColor: config.bgColor,
          border: `1px solid ${config.borderColor}`,
        }}
      >
        {/* Status dot with glow */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: config.dotColor,
            boxShadow: config.dotGlow,
          }}
        />

        {/* Service name */}
        <div className="flex-1 min-w-0">
          <span
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#171717',
            }}
          >
            {name}
          </span>
        </div>

        {/* Status badge for problems */}
        {config.badge && (
          <span
            className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide"
            style={{
              color: config.badge.color,
              backgroundColor: config.badge.bg,
            }}
          >
            {config.badge.label}
          </span>
        )}

        {/* Category badge - hidden on mobile */}
        <div className="hidden sm:block">
          <span
            className="text-[11px] px-2 py-1 rounded"
            style={{
              color: '#737373',
              backgroundColor: '#f5f5f5',
              border: '1px solid #e5e5e5',
            }}
          >
            {formatCategoryLabel(category)}
          </span>
        </div>

        {/* Sparkline - hidden on very small screens */}
        <div className="hidden md:block">
          <Sparkline data={sparklineData} color={config.dotColor} width={90} height={28} />
        </div>

        {/* Latency */}
        <div
          className="text-right w-16 font-mono"
          style={{
            fontSize: '13px',
            color: '#a3a3a3',
          }}
        >
          {status === "OUTAGE" ? "—" : latencyMs !== null ? `${latencyMs}ms` : "—"}
        </div>
      </div>
    </Link>
  );
}
