import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "operational"
    | "degraded"
    | "outage"
    | "unknown"
    | "default";
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", style, ...props }, ref) => {
    const variantStyles = {
      operational: {
        backgroundColor: 'var(--operational-bg)',
        color: 'var(--operational)',
        borderColor: 'var(--operational-border)',
      },
      degraded: {
        backgroundColor: 'var(--degraded-bg)',
        color: 'var(--degraded)',
        borderColor: 'var(--degraded-border)',
      },
      outage: {
        backgroundColor: 'var(--outage-bg)',
        color: 'var(--outage)',
        borderColor: 'var(--outage-border)',
      },
      unknown: {
        backgroundColor: 'var(--unknown-bg)',
        color: 'var(--unknown)',
        borderColor: 'var(--border)',
      },
      default: {
        backgroundColor: 'var(--surface-hover)',
        color: 'var(--text-secondary)',
        borderColor: 'var(--border)',
      },
    };

    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
          className
        )}
        style={{
          border: '1px solid',
          ...variantStyles[variant],
          ...style,
        }}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
