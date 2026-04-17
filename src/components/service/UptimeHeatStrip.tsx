"use client";

import { useEffect, useState } from "react";
import { UptimeBarWithHours } from "@/components/status/UptimeBar";

interface SparklineBucket {
  bucketStart: string;
  p50: number | null;
  p95: number | null;
  modeStatus: string | null;
}

interface Props {
  serviceId: string;
  uptime24h: number | null;
}

const STATUS_MAP: Record<string, string> = {
  OPERATIONAL: "OPERATIONAL",
  DEGRADED: "DEGRADED",
  OUTAGE: "OUTAGE",
};

export default function UptimeHeatStrip({ serviceId, uptime24h }: Props) {
  const [slots, setSlots] = useState<Array<{ status: string; time: Date }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/service/${serviceId}/sparkline`)
      .then((r) => r.json())
      .then((data: { buckets: SparklineBucket[] }) => {
        const mapped = data.buckets.map((b) => ({
          status: STATUS_MAP[b.modeStatus ?? ""] ?? "UNKNOWN",
          time: new Date(b.bucketStart),
        }));
        setSlots(mapped);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [serviceId]);

  const uptimeDisplay =
    uptime24h != null ? `${uptime24h.toFixed(1)}%` : "—";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#171717",
            margin: 0,
          }}
        >
          Uptime — last 24h
        </h2>
        <span
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color:
              uptime24h == null
                ? "#6b7280"
                : uptime24h >= 99
                ? "#16a34a"
                : uptime24h >= 90
                ? "#ca8a04"
                : "#dc2626",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {uptimeDisplay}
        </span>
      </div>

      {loading ? (
        <div
          style={{
            height: "48px",
            background: "#f5f5f5",
            borderRadius: "6px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ) : slots.length > 0 ? (
        <UptimeBarWithHours slots={slots} uptimePercent={uptime24h ?? 0} />
      ) : (
        <div
          style={{
            height: "24px",
            background: "#f5f5f5",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "#a3a3a3",
          }}
        >
          No data available
        </div>
      )}
    </div>
  );
}
