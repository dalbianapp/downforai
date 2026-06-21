"use client";

import { BadgeType, ServiceStatus } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { getBadgeIcon, getBadgeLabel } from "@/lib/badges";

interface TransparencyBadgeProps {
  badge: BadgeType;
  phrase?: string;
  showPhrase?: boolean;
  status?: ServiceStatus;
}

export function TransparencyBadge({
  badge,
  phrase,
  showPhrase = false,
  status,
}: TransparencyBadgeProps) {
  const icon = getBadgeIcon(badge, status);
  const label = getBadgeLabel(badge);

  return (
    <div className="flex flex-col gap-2">
      <Badge variant="default" className="inline-flex w-fit">
        <span className="mr-2 text-lg">{icon}</span>
        {label}
      </Badge>
      {showPhrase && phrase && (
        <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
          {phrase}
        </p>
      )}
    </div>
  );
}
