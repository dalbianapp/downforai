"use client";

import { useMemo } from "react";
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
  const chartData = useMemo(() => {
    if (observations.length === 0) {
      return [];
    }

    // Aggregate by 30-minute intervals
    const grouped: Record<string, number[]> = {};

    observations.forEach((obs) => {
      if (obs.latencyMs === null) return;

      const time = new Date(obs.observedAt);
      const bucket = new Date(Math.floor(time.getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000));
      const key = bucket.toISOString();

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(obs.latencyMs);
    });

    // Calculate averages
    return Object.entries(grouped)
      .map(([time, latencies]) => ({
        time: new Date(time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        latency: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [observations]);

  if (chartData.length === 0) {
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
          formatter={(value) => formatLatency(value as number)}
          cursor={{ stroke: "#e5e5e5" }}
        />
        <Area
          type="monotone"
          dataKey="latency"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorLatency)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
