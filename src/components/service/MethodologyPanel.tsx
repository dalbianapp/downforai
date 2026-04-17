export default function MethodologyPanel() {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <h2
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "10px",
        }}
      >
        How we monitor
      </h2>
      <p
        style={{
          fontSize: "13px",
          color: "#6b7280",
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        downforai.com probes each AI service every 2–5 minutes from multiple
        independent locations. We measure HTTP response codes, latency (p50 &amp;
        p95), and endpoint availability across the surfaces listed above. Status
        is classified as <strong style={{ color: "#171717" }}>Operational</strong>,{" "}
        <strong style={{ color: "#171717" }}>Degraded</strong>, or{" "}
        <strong style={{ color: "#171717" }}>Outage</strong> based on a weighted
        combination of probe results. Uptime is calculated over 30-minute buckets
        and the last 24 hours. User reports are factored into our diagnosis as a
        secondary signal. We are independent of all providers listed and receive no
        compensation to report any particular status.
      </p>
    </div>
  );
}
