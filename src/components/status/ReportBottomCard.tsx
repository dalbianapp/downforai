"use client";

interface Props {
  serviceName: string;
}

export function ReportBottomCard({ serviceName }: Props) {
  const shortName = serviceName.length > 22 ? serviceName.slice(0, 22) + "…" : serviceName;

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-report-modal"));
  };

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e5e5e5",
      borderRadius: "16px",
      padding: "32px",
      textAlign: "center",
    }}>
      <h3 style={{
        fontSize: "18px",
        fontWeight: 700,
        color: "#171717",
        margin: "0 0 10px",
      }}>
        Still having issues with {serviceName}?
      </h3>
      <p style={{
        fontSize: "14px",
        color: "#6b7280",
        margin: "0 0 20px",
        lineHeight: 1.55,
      }}>
        Let the community know and help others experiencing the same problem.
      </p>
      <button
        onClick={handleClick}
        style={{
          padding: "14px 32px",
          fontSize: "15px",
          fontWeight: 700,
          color: "#ffffff",
          background: "#dc2626",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#b91c1c"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#dc2626"; }}
      >
        ⚠️ Report an issue with {shortName}
      </button>
    </div>
  );
}
