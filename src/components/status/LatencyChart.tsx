"use client";

import { useMemo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatLatency } from "@/lib/utils";

interface LatencyChartProps {
  observations: Array<{
    observedAt: Date;
    latencyMs: number | null;
  }>;
}

export function LatencyChart({ observations }: LatencyChartProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const chartData = useMemo(() => {
    if (!isClient) return [];

    const now = Date.now();
    const SLOT_MS = 30 * 60 * 1000; // 30 minutes

    // Generate 48 fixed slots covering the last 24h, ending at now
    const currentSlot = Math.floor(now / SLOT_MS) * SLOT_MS;
    const slots: { timestamp: number; time: string; latency: number | null }[] = [];

    for (let i = 47; i >= 0; i--) {
      const slotStart = currentSlot - i * SLOT_MS;
      const date = new Date(slotStart);
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      slots.push({
        timestamp: slotStart,
        time: `${h}:${m}`,
        latency: null,
      });
    }

    // Fill slots with observation data
    observations.forEach((obs) => {
      if (obs.latencyMs === null) return;
      const time = new Date(obs.observedAt).getTime();
      const bucketTs = Math.floor(time / SLOT_MS) * SLOT_MS;
      const slot = slots.find((s) => s.timestamp === bucketTs);
      if (slot) {
        // Average if multiple observations in same slot
        if (slot.latency === null) {
          slot.latency = obs.latencyMs;
        } else {
          slot.latency = Math.round((slot.latency + obs.latencyMs) / 2);
        }
      }
    });

    return slots;
  }, [observations, isClient]);

  if (!isClient) {
    return <div style={{ height: "300px" }} />;
  }

  const hasData = chartData.some((d) => d.latency !== null);
  if (!hasData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "256px", color: "#a3a3a3" }}>
        Latency data not available for this service
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="time"
          stroke="#a3a3a3"
          style={{ fontSize: "11px" }}
          interval={5}
        />
        <YAxis
          stroke="#a3a3a3"
          style={{ fontSize: "11px" }}
          label={{ value: "Latency (ms)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
          formatter={(value) => value !== null ? formatLatency(value as number) : "No data"}
          cursor={{ stroke: "#e5e5e5" }}
        />
        <Area
          type="monotone"
          dataKey="latency"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorLatency)"
          dot={false}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
