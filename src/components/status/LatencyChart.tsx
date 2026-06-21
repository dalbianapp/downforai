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
    if (!isClient || observations.length === 0) return [];

    return observations.map((obs) => {
      const d = new Date(obs.observedAt);
      // toLocaleTimeString uses the browser's local timezone, never UTC
      const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      return {
        time,
        latency: obs.latencyMs,
      };
    });
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
          label={{ value: "Network latency (ms)", angle: -90, position: "insideLeft" }}
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
          connectNulls={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
