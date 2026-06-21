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
        DownForAI checks monitored AI service surfaces on a rotating schedule,
        roughly every 75 minutes per surface, from a single centralized probe
        infrastructure. For services with an official machine-readable status page,
        we use that official status signal when available. For other services, we
        perform a basic public-surface check. Some services block datacenter probes;
        in those cases we mark them as &ldquo;Monitoring limited&rdquo; instead of
        treating a failed probe as a confirmed outage. Status is classified as{" "}
        <strong style={{ color: "#171717" }}>Operational</strong>,{" "}
        <strong style={{ color: "#171717" }}>Degraded</strong>, or{" "}
        <strong style={{ color: "#171717" }}>Outage</strong>.{" "}
        Network latency (check response time) measures how long the monitored
        endpoint took to respond to our probe — it is not model inference speed,
        time-to-first-token, or tokens-per-second performance. We are independent
        of all providers listed and receive no compensation to report any particular
        status.
      </p>
    </div>
  );
}
