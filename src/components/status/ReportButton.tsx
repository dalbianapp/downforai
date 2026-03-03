"use client";

import { useState, useCallback } from "react";

interface ReportButtonProps {
  serviceSlug: string;
  serviceName: string;
}

const REPORT_TYPES = [
  { value: "DOWN", label: "Down / Not Working", icon: "🔴" },
  { value: "SLOW", label: "Slow / Laggy", icon: "🐌" },
  { value: "LOGIN", label: "Login Issues", icon: "🔒" },
  { value: "API_ERROR", label: "API Errors", icon: "⚡" },
  { value: "OTHER", label: "Other Issue", icon: "❓" },
];

export function ReportButton({ serviceSlug, serviceName }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "rate_limited">("idle");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleReport = useCallback(async (reportType: string) => {
    setSelectedType(reportType);
    setStatus("loading");

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceSlug, reportType }),
      });

      if (response.status === 429) {
        setStatus("rate_limited");
      } else if (response.ok) {
        setStatus("success");
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
          setSelectedType(null);
        }, 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [serviceSlug]);

  // Bouton sticky mobile + inline desktop
  return (
    <>
      {/* Panneau de report */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "24px",
          marginTop: "8px",
        }}
      >
        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#166534" }}>Thanks for reporting!</div>
            <div style={{ fontSize: "13px", color: "#16a34a", marginTop: "4px" }}>
              Your report helps the community know what's happening.
            </div>
          </div>
        ) : status === "rate_limited" ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏱️</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#92400e" }}>Already reported</div>
            <div style={{ fontSize: "13px", color: "#ca8a04", marginTop: "4px" }}>
              You can report again in 15 minutes.
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#171717", marginBottom: "4px" }}>
                Having issues with {serviceName}?
              </div>
              <div style={{ fontSize: "13px", color: "#a3a3a3" }}>
                Select the type of problem you're experiencing
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleReport(type.value)}
                  disabled={status === "loading"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e5e5e5",
                    background: selectedType === type.value && status === "loading" ? "#f5f5f5" : "#ffffff",
                    cursor: status === "loading" ? "wait" : "pointer",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#171717",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                    opacity: status === "loading" && selectedType !== type.value ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { if (status !== "loading") e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.color = "#171717"; }}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                  {selectedType === type.value && status === "loading" && (
                    <span style={{ marginLeft: "4px" }}>⏳</span>
                  )}
                </button>
              ))}
            </div>
            {status === "error" && (
              <div style={{ fontSize: "13px", color: "#dc2626", marginTop: "12px" }}>
                Failed to submit. Please try again.
              </div>
            )}
          </>
        )}
      </div>

      {/* Bouton sticky mobile */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          right: '16px',
          zIndex: 50,
          display: isOpen ? 'none' : 'block',
        }}
        className="md:hidden"
      >
        <button
          onClick={() => {
            setIsOpen(true);
            // Scroll vers le panneau de report
            document.getElementById("report-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "14px",
            borderRadius: "14px",
            border: "none",
            background: "#dc2626",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
          }}
        >
          ⚠️ Report an Issue
        </button>
      </div>
    </>
  );
}
