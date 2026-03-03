"use client";

import { ServiceStatus } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";

interface StatusBadgeProps {
  status: ServiceStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  OPERATIONAL: {
    variant: "operational" as const,
    label: "Operational",
    icon: "✅",
  },
  DEGRADED: {
    variant: "degraded" as const,
    label: "Degraded",
    icon: "⚠️",
  },
  OUTAGE: {
    variant: "outage" as const,
    label: "Major Outage",
    icon: "🔴",
  },
  UNKNOWN: {
    variant: "unknown" as const,
    label: "Checking...",
    icon: "⏳",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const pulseClass = status === "OUTAGE" ? "animate-pulse-outline" : "";

  return (
    <Badge variant={config.variant} className={`${sizeClasses[size]} ${pulseClass}`}>
      <span className="mr-2">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
