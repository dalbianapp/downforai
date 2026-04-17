import type { SurfaceSnapshot, IncidentSummary } from "@/lib/service-page/types";

interface Props {
  uptime24h: number | null;
  surfaces: SurfaceSnapshot[];
  incidents30d: IncidentSummary[];
}

export default function ServiceSignalStrip({ uptime24h, surfaces, incidents30d }: Props) {
  // Aggregate p50/p95 across all surfaces (median of medians)
  const latencies = surfaces
    .map((s) => s.p50Latency24h)
    .filter((v): v is number => v !== null);
  const p50 =
    latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : null;

  const p95values = surfaces
    .map((s) => s.p95Latency24h)
    .filter((v): v is number => v !== null);
  const p95 =
    p95values.length > 0
      ? Math.round(p95values.reduce((a, b) => a + b, 0) / p95values.length)
      : null;

  const uptimeColor =
    uptime24h == null
      ? "#6b7280"
      : uptime24h >= 99
      ? "#16a34a"
      : uptime24h >= 90
      ? "#ca8a04"
      : "#dc2626";

  const tiles = [
    {
      label: "24h Uptime",
      value: uptime24h != null ? `${uptime24h.toFixed(1)}%` : "—",
      color: uptimeColor,
      mono: true,
    },
    {
      label: "p50 Latency",
      value: p50 != null ? `${p50}ms` : "—",
      color: p50 == null ? "#6b7280" : p50 < 500 ? "#16a34a" : p50 < 1500 ? "#ca8a04" : "#dc2626",
      mono: true,
    },
    {
      label: "p95 Latency",
      value: p95 != null ? `${p95}ms` : "—",
      color: p95 == null ? "#6b7280" : p95 < 1500 ? "#ca8a04" : "#dc2626",
      mono: true,
    },
    {
      label: "Incidents (30d)",
      value: incidents30d.length.toString(),
      color: incidents30d.length === 0 ? "#16a34a" : incidents30d.length <= 2 ? "#ca8a04" : "#dc2626",
      mono: false,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px",
      }}
      className="sm:grid-cols-4"
    >
      {tiles.map((tile) => (
        <div
          key={tile.label}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: tile.color,
              fontFamily: tile.mono ? "'JetBrains Mono', monospace" : "inherit",
              lineHeight: 1.2,
            }}
          >
            {tile.value}
          </div>
          <div
            style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}
          >
            {tile.label}
          </div>
        </div>
      ))}
    </div>
  );
}
