"use client";

import { useEffect, useState } from "react";
import { LatencyChart } from "@/components/status/LatencyChart";

interface SparklineBucket {
  bucketStart: string;
  p50: number | null;
  p95: number | null;
  modeStatus: string | null;
}

interface Props {
  serviceId: string;
}

export default function LatencySparklinePanel({ serviceId }: Props) {
  const [observations, setObservations] = useState<
    Array<{ observedAt: Date; latencyMs: number | null }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/service/${serviceId}/sparkline`)
      .then((r) => r.json())
      .then((data: { buckets: SparklineBucket[] }) => {
        // Map buckets → observations format LatencyChart expects
        const obs = data.buckets
          .filter((b) => b.p50 != null)
          .map((b) => ({
            observedAt: new Date(b.bucketStart),
            latencyMs: b.p50,
          }));
        setObservations(obs);
      })
      .catch(() => setObservations([]))
      .finally(() => setLoading(false));
  }, [serviceId]);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <h2
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#171717",
          marginBottom: "16px",
        }}
      >
        Network latency — last 20 probes
      </h2>

      {loading ? (
        <div
          style={{
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#a3a3a3",
            fontSize: "13px",
          }}
        >
          Loading…
        </div>
      ) : (
        <LatencyChart observations={observations} />
      )}
    </div>
  );
}
