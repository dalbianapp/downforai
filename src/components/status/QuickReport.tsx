"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

interface QuickReportProps {
  serviceSlug: string;
  serviceName: string;
  initialCount: number;
  surfaces: { id: string; displayName: string }[];
}

type ReportType = "DOWN" | "SLOW" | "LOGIN" | "API_ERROR" | "OTHER";

interface ReportButton {
  type: ReportType;
  label: string;
  icon: string;
}

const REPORT_BUTTONS: ReportButton[] = [
  { type: "DOWN", label: "Down / Not Working", icon: "🔴" },
  { type: "SLOW", label: "Slow / Laggy", icon: "🐢" },
  { type: "LOGIN", label: "Login Issues", icon: "🔐" },
  { type: "API_ERROR", label: "API Errors", icon: "⚡" },
  { type: "OTHER", label: "Other Issue", icon: "❓" },
];

const TYPE_COLORS: Record<ReportType, string> = {
  DOWN: "#dc2626", // red
  SLOW: "#ca8a04", // yellow
  LOGIN: "#2563eb", // blue
  API_ERROR: "#9333ea", // purple
  OTHER: "#6b7280", // gray
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function QuickReport({ serviceSlug, serviceName, initialCount, surfaces }: QuickReportProps) {
  const [liveCount, setLiveCount] = useState(initialCount);
  const [submittingType, setSubmittingType] = useState<ReportType | null>(null);
  const [successType, setSuccessType] = useState<ReportType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detailSurface, setDetailSurface] = useState("");
  const [detailComment, setDetailComment] = useState("");
  const [detailEmail, setDetailEmail] = useState("");
  const [detailSubmitting, setDetailSubmitting] = useState(false);
  const [detailSuccess, setDetailSuccess] = useState(false);

  // Fetch stats for the distribution bar
  const { data: stats } = useSWR(
    `/api/report/stats?service=${serviceSlug}`,
    fetcher,
    { refreshInterval: 30000 } // refresh every 30s
  );

  // Update live count when stats change
  useEffect(() => {
    if (stats?.total24h !== undefined) {
      setLiveCount(stats.total24h);
    }
  }, [stats]);

  // Check localStorage for cooldown
  const getCooldownKey = (type: ReportType) => `report-cooldown-${serviceSlug}-${type}`;

  const isOnCooldown = (type: ReportType): boolean => {
    if (typeof window === "undefined") return false;
    const cooldownEnd = localStorage.getItem(getCooldownKey(type));
    if (!cooldownEnd) return false;
    return Date.now() < parseInt(cooldownEnd, 10);
  };

  const setCooldown = (type: ReportType) => {
    const cooldownEnd = Date.now() + 15 * 60 * 1000; // 15 min
    localStorage.setItem(getCooldownKey(type), cooldownEnd.toString());
  };

  const handleReport = async (type: ReportType) => {
    if (isOnCooldown(type)) {
      setErrorMessage("Please wait 15 minutes before reporting again.");
      return;
    }

    setSubmittingType(type);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceSlug, reportType: type }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setErrorMessage("Rate limit exceeded. Please wait 15 minutes.");
        } else {
          setErrorMessage(data.error || "Failed to submit report");
        }
        setSubmittingType(null);
        return;
      }

      // Success
      setCooldown(type);
      setSuccessType(type);
      setSubmittingType(null);
      setShowModal(true); // Open modal for optional details

      // Update count
      if (data.newCount !== undefined) {
        setLiveCount(data.newCount);
      }

      // Keep success state visible for 10s
      setTimeout(() => {
        setSuccessType(null);
      }, 10000);
    } catch (error) {
      console.error("Report error:", error);
      setErrorMessage("Network error. Please try again.");
      setSubmittingType(null);
    }
  };

  const handleSubmitDetails = async () => {
    if (!successType) return;

    // If no details provided, just close the modal
    if (!detailEmail && !detailComment && !detailSurface) {
      setShowModal(false);
      return;
    }

    setDetailSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug,
          reportType: successType,
          surfaceId: detailSurface || undefined,
          email: detailEmail || undefined,
          comment: detailComment || undefined,
          isDetailUpdate: true, // Flag to update existing report instead of creating duplicate
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to submit details");
        setDetailSubmitting(false);
        return;
      }

      // Success - show success message
      setDetailSuccess(true);
      setDetailSubmitting(false);

      // Close modal after 1.5s
      setTimeout(() => {
        setShowModal(false);
        setDetailSuccess(false);
        setDetailSurface("");
        setDetailEmail("");
        setDetailComment("");
        setErrorMessage(null);
      }, 1500);
    } catch (error) {
      console.error("Details error:", error);
      setErrorMessage("Network error. Please try again.");
      setDetailSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDetailSurface("");
    setDetailEmail("");
    setDetailComment("");
    setErrorMessage(null);
    setDetailSuccess(false);
  };

  // Calculate distribution bar
  const totalReports = stats?.total24h || 0;
  const byType = stats?.byType || {};

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        padding: "32px",
        marginBottom: "24px",
      }}
    >
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
        Having issues with {serviceName}?
      </h2>
      <p style={{ fontSize: "14px", color: "#525252", marginBottom: "20px" }}>
        Report problems quickly and help the community stay informed.
      </p>

      {/* Report Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
        {REPORT_BUTTONS.map((button) => {
          const isSubmitting = submittingType === button.type;
          const isSuccess = successType === button.type;
          const isDisabled = isOnCooldown(button.type) || isSubmitting;

          return (
            <button
              key={button.type}
              onClick={() => handleReport(button.type)}
              disabled={isDisabled}
              style={{
                border: isSuccess ? "1px solid #bbf7d0" : "1px solid #e5e5e5",
                background: isSuccess ? "#f0fdf4" : isDisabled ? "#f9fafb" : "#ffffff",
                color: isSuccess ? "#166534" : isDisabled ? "#9ca3af" : "#171717",
                borderRadius: "9999px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: isDisabled ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isSuccess) {
                  e.currentTarget.style.background = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isSuccess) {
                  e.currentTarget.style.background = "#ffffff";
                }
              }}
            >
              {isSuccess ? "✓" : button.icon} {button.label}
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {errorMessage && !showModal && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "13px",
            color: "#991b1b",
            marginBottom: "16px",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Modal for optional details */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {/* Overlay */}
          <div
            onClick={handleCloseModal}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.5)",
            }}
          />

          {/* Modal */}
          <div
            style={{
              position: "relative",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "480px",
              width: "90vw",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "none",
                fontSize: "24px",
                color: "#a3a3a3",
                cursor: "pointer",
                lineHeight: 1,
                padding: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#171717")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#a3a3a3")}
            >
              ✕
            </button>

            {/* Success message or detail success */}
            {detailSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <div style={{ fontSize: "18px", fontWeight: 600, color: "#16a34a" }}>
                  Details saved!
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "18px", fontWeight: 600, color: "#16a34a", marginBottom: "8px" }}>
                  ✅ Report sent! Thank you.
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
                  Want to add details? (optional)
                </div>

                {/* Affected component dropdown - FIRST (only if multiple surfaces) */}
                {surfaces.length > 1 && (
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#171717", marginBottom: "8px" }}>
                      🔧 Affected component
                    </label>
                    <select
                      value={detailSurface}
                      onChange={(e) => setDetailSurface(e.target.value)}
                      disabled={detailSubmitting}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                        background: "#ffffff",
                        color: "#171717",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Not sure</option>
                      {surfaces.map((surface) => (
                        <option key={surface.id} value={surface.id}>
                          {surface.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Comment textarea - SECOND */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#171717", marginBottom: "8px" }}>
                    💬 Describe the issue
                  </label>
                  <textarea
                    placeholder="e.g., API returns 429 errors since 10am, ChatGPT web is slow..."
                    value={detailComment}
                    onChange={(e) => setDetailComment(e.target.value.slice(0, 500))}
                    disabled={detailSubmitting}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      background: "#ffffff",
                      color: "#171717",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                  <div style={{ fontSize: "11px", color: "#a3a3a3", marginTop: "4px", textAlign: "right" }}>
                    {detailComment.length}/500
                  </div>
                </div>

                {/* Email input - THIRD */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#171717", marginBottom: "8px" }}>
                    📧 Get notified when {serviceName} is back
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={detailEmail}
                    onChange={(e) => setDetailEmail(e.target.value)}
                    disabled={detailSubmitting}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      background: "#ffffff",
                      color: "#171717",
                    }}
                  />
                </div>

                {/* Error message in modal */}
                {errorMessage && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "13px",
                      color: "#991b1b",
                      marginBottom: "16px",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmitDetails}
                  disabled={detailSubmitting}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#ffffff",
                    background: detailSubmitting ? "#9ca3af" : "#2563eb",
                    border: "none",
                    borderRadius: "8px",
                    cursor: detailSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!detailSubmitting) {
                      e.currentTarget.style.background = "#1d4ed8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!detailSubmitting) {
                      e.currentTarget.style.background = "#2563eb";
                    }
                  }}
                >
                  {detailSubmitting ? "Submitting..." : "Submit details"}
                </button>
              </>
            )}
          </div>

          {/* Inline CSS for fadeIn animation */}
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}

      {/* Live Counter */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "32px", fontWeight: 800, color: "#171717", lineHeight: 1 }}>
          {liveCount}
        </div>
        <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
          reports in the last 24 hours
        </div>
      </div>

      {/* Distribution Bar */}
      {totalReports > 0 && (
        <div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>Report breakdown</div>
          <div
            style={{
              display: "flex",
              height: "8px",
              borderRadius: "4px",
              overflow: "hidden",
              background: "#f3f4f6",
            }}
          >
            {REPORT_BUTTONS.map((button) => {
              const count = byType[button.type] || 0;
              const percentage = (count / totalReports) * 100;
              if (percentage === 0) return null;
              return (
                <div
                  key={button.type}
                  style={{
                    width: `${percentage}%`,
                    background: TYPE_COLORS[button.type],
                  }}
                  title={`${button.label}: ${count}`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
            {REPORT_BUTTONS.map((button) => {
              const count = byType[button.type] || 0;
              if (count === 0) return null;
              return (
                <div key={button.type} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#6b7280" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "2px",
                      background: TYPE_COLORS[button.type],
                    }}
                  />
                  {button.label}: {count}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
