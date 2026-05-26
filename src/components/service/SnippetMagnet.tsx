interface SnippetMagnetProps {
  serviceName: string;
  status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | "REPORTED_ISSUES";
  surfaceCount: number;
  reports24h: number;
  lastIncidentDate?: Date | null;
}

export default function SnippetMagnet({
  serviceName,
  status,
  surfaceCount,
  reports24h,
  lastIncidentDate,
}: SnippetMagnetProps) {
  const surfaceLabel = surfaceCount === 1 ? "surface" : "surfaces";
  const reportLabel = reports24h === 1 ? "report" : "reports";

  let text: string;

  if (status === "OUTAGE") {
    text = `${serviceName} appears down right now. DownForAI checks ${serviceName} every ~75 minutes across ${surfaceCount} monitored ${surfaceLabel}, with ${reports24h} community ${reportLabel} in the last 24 hours.`;
  } else if (status === "DEGRADED") {
    text = `${serviceName} appears degraded right now. DownForAI checks ${serviceName} every ~75 minutes across ${surfaceCount} monitored ${surfaceLabel}, with ${reports24h} community ${reportLabel} in the last 24 hours.`;
  } else if (status === "REPORTED_ISSUES") {
    text = `${serviceName} is operational but users are reporting issues right now. DownForAI checks ${serviceName} every ~75 minutes across ${surfaceCount} monitored ${surfaceLabel}, with ${reports24h} community ${reportLabel} in the last 24 hours.`;
  } else if (status === "OPERATIONAL" && lastIncidentDate) {
    const formatted = lastIncidentDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    text = `${serviceName} is operational right now. Last tracked incident: ${formatted}. DownForAI checks ${surfaceCount} monitored ${surfaceLabel} every ~75 minutes.`;
  } else if (status === "OPERATIONAL") {
    text = `${serviceName} is operational right now. DownForAI checks ${serviceName} every ~75 minutes across ${surfaceCount} monitored ${surfaceLabel}, with ${reports24h} community ${reportLabel} in the last 24 hours.`;
  } else {
    text = `DownForAI is checking ${serviceName} right now. We monitor ${surfaceCount} ${surfaceLabel} for availability, latency, and community outage reports.`;
  }

  return (
    <p
      style={{
        fontSize: "14px",
        lineHeight: 1.6,
        color: "#6b7280",
        marginTop: "8px",
        marginBottom: "0px",
      }}
    >
      {text}
    </p>
  );
}
