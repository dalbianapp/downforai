"use client";

import { useEffect, useRef } from "react";
import { useReport, ReportType } from "@/hooks/useReport";
import { formatDate, formatLatency } from "@/lib/utils";

type Status = "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" | "REPORTED_ISSUES";

interface Props {
  serviceName: string;
  serviceSlug: string;
  overallStatus: Status;
  lastProbeAt: Date | null;
  lastProbeLatency: number | null;
  hasOpenIncident: boolean;
  reportCount24h: number;
  surfaces: { id: string; displayName: string }[];
}

const STATUS_CONFIG: Record<Status, { icon: string; label: string; description: string; color: string }> = {
  OPERATIONAL:     { icon: "✅", label: "Operational",     description: "Everything works normally",      color: "#16a34a" },
  DEGRADED:        { icon: "⚠️", label: "Degraded",        description: "Partial issues detected",        color: "#ca8a04" },
  OUTAGE:          { icon: "❌", label: "Outage",           description: "Service is down",                color: "#dc2626" },
  UNKNOWN:         { icon: "❔", label: "Unknown",          description: "Monitoring data unavailable",    color: "#6b7280" },
  REPORTED_ISSUES: { icon: "⚠️", label: "Reported Issues", description: "Community reports issues",       color: "#ea580c" },
};

const REPORT_BUTTONS: { type: ReportType; label: string; icon: string }[] = [
  { type: "DOWN",      label: "Down / Not Working", icon: "🔴" },
  { type: "SLOW",      label: "Slow / Laggy",       icon: "🐢" },
  { type: "LOGIN",     label: "Login Issues",        icon: "🔐" },
  { type: "API_ERROR", label: "API Errors",          icon: "⚡" },
  { type: "OTHER",     label: "Other Issue",         icon: "❓" },
];

export function StatusAndReport({
  serviceName,
  serviceSlug,
  overallStatus,
  lastProbeAt,
  lastProbeLatency,
  hasOpenIncident,
  reportCount24h,
  surfaces,
}: Props) {
  const report = useReport(serviceSlug, reportCount24h);
  const stickyRef = useRef<HTMLDivElement>(null);
  const reportNowRef = useRef(report.reportNow);
  reportNowRef.current = report.reportNow;

  // Listen for custom event dispatched by the bottom card / mobile sticky
  useEffect(() => {
    const handler = () => reportNowRef.current();
    window.addEventListener("open-report-modal", handler);
    return () => window.removeEventListener("open-report-modal", handler);
  }, []);

  // Sticky button: show after 400px scroll, only on mobile (CSS hides on desktop)
  useEffect(() => {
    const handleScroll = () => {
      if (!stickyRef.current) return;
      stickyRef.current.style.display = window.scrollY > 400 ? "block" : "none";
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cfg = STATUS_CONFIG[overallStatus] ?? STATUS_CONFIG.UNKNOWN;
  const shortName = serviceName.length > 22 ? serviceName.slice(0, 22) + "…" : serviceName;

  return (
    <>
      <style>{`
        .sar-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 640px) {
          .sar-grid { grid-template-columns: 1fr; }
        }
        .sar-sticky {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9998;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.95);
          border-top: 1px solid #e5e5e5;
          backdrop-filter: blur(8px);
        }
        @media (min-width: 641px) {
          .sar-sticky { display: none !important; }
        }
        @keyframes sarFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1);    }
        }
      `}</style>

      {/* ── 2-column grid ── */}
      <div className="sar-grid">

        {/* LEFT — Current status */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "28px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
        }}>
          <h2 style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#a3a3a3",
            margin: "0 0 20px",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}>
            Current Status
          </h2>

          <div style={{ fontSize: "52px", lineHeight: 1, marginBottom: "10px" }}>
            {cfg.icon}
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: cfg.color, marginBottom: "4px" }}>
            {cfg.label}
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
            {cfg.description}
          </div>

          <div style={{
            borderTop: "1px solid #f5f5f5",
            paddingTop: "16px",
            textAlign: "left",
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            {/* Probe info */}
            <div style={{ fontSize: "13px", color: "#525252" }}>
              <span style={{ color: "#16a34a", marginRight: "5px" }}>✓</span>
              Checked by our probes
              {lastProbeLatency != null && (
                <span style={{ color: "#a3a3a3" }}> · {formatLatency(lastProbeLatency)}</span>
              )}
              {lastProbeAt && (
                <div suppressHydrationWarning style={{ fontSize: "12px", color: "#a3a3a3", marginTop: "2px", paddingLeft: "16px" }}>
                  Verified {formatDate(lastProbeAt)}
                </div>
              )}
            </div>

            {/* Incident info */}
            <div style={{ fontSize: "13px", color: "#525252" }}>
              {hasOpenIncident ? (
                <><span style={{ color: "#ca8a04", marginRight: "5px" }}>⚠</span>Active incident in progress</>
              ) : (
                <><span style={{ color: "#16a34a", marginRight: "5px" }}>✓</span>No major incident reported</>
              )}
            </div>

            {/* Report count */}
            <div style={{ fontSize: "12px", color: "#a3a3a3" }}>
              <span style={{ marginRight: "4px" }}>ⓘ</span>
              {report.liveCount > 0
                ? `${report.liveCount} user report${report.liveCount !== 1 ? "s" : ""} in the last 24h`
                : "No reports in the last 24h"}
            </div>
          </div>
        </div>

        {/* RIGHT — Report */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", margin: "0 0 10px" }}>
            Having issues?
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px", lineHeight: 1.55 }}>
            Help other users by reporting if {serviceName} is not working for you.
          </p>

          {/* Cooldown / error feedback */}
          {report.cooldownError && (
            <div style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "13px",
              color: "#92400e",
              marginBottom: "14px",
            }}>
              Please wait 15 minutes before reporting again.
            </div>
          )}
          {report.errorMessage && !report.cooldownError && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "13px",
              color: "#991b1b",
              marginBottom: "14px",
            }}>
              {report.errorMessage}
            </div>
          )}

          {/* Big red button — sends DOWN immediately on click */}
          <button
            onClick={report.reportNow}
            disabled={report.submitting}
            style={{
              width: "100%",
              padding: "16px 20px",
              fontSize: "15px",
              fontWeight: 700,
              color: "#ffffff",
              background: report.submitting ? "#9ca3af" : "#dc2626",
              border: "none",
              borderRadius: "12px",
              cursor: report.submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!report.submitting) e.currentTarget.style.background = "#b91c1c"; }}
            onMouseLeave={(e) => { if (!report.submitting) e.currentTarget.style.background = report.submitting ? "#9ca3af" : "#dc2626"; }}
          >
            {report.submitting ? "Sending…" : `⚠️ I confirm: ${shortName} is not working`}
          </button>

          {/* Live count */}
          <div style={{ marginTop: "auto", paddingTop: "20px", fontSize: "14px", color: "#6b7280" }}>
            <span style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#171717",
              verticalAlign: "middle",
              marginRight: "6px",
            }}>
              {report.liveCount}
            </span>
            reports in the last 24 hours
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {report.showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "sarFadeIn 0.18s ease-out",
        }}>
          {/* Overlay */}
          <div
            onClick={report.closeModal}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }}
          />

          {/* Modal box */}
          <div style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "480px",
            width: "90vw",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            {/* Close */}
            <button
              onClick={report.closeModal}
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
            >✕</button>

            {report.success ? (
              /* Success screen */
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "52px", marginBottom: "12px" }}>✅</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#16a34a", marginBottom: "8px" }}>
                  Report sent! Thank you.
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
                  Your report helps the community stay informed.
                </div>
                <button
                  onClick={report.closeModal}
                  style={{
                    padding: "10px 28px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#171717",
                    background: "#f5f5f5",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", margin: "0 0 12px", paddingRight: "28px" }}>
                  Add details (optional)
                </h3>

                {/* Report confirmed banner */}
                <div style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "#166534",
                  marginBottom: "20px",
                }}>
                  ✓ Your report has been registered. Help the community by adding more details below.
                </div>

                {/* Type picker */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#171717", marginBottom: "10px" }}>
                    What type of issue?
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {REPORT_BUTTONS.map((btn) => {
                      const active = report.selectedType === btn.type;
                      return (
                        <button
                          key={btn.type}
                          onClick={() => report.setSelectedType(btn.type)}
                          style={{
                            padding: "8px 14px",
                            fontSize: "13px",
                            fontWeight: 500,
                            border: active ? "2px solid #dc2626" : "1px solid #e5e5e5",
                            background: active ? "#fef2f2" : "#ffffff",
                            color: active ? "#dc2626" : "#171717",
                            borderRadius: "9999px",
                            cursor: "pointer",
                            transition: "all 0.12s",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          {btn.icon} {btn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Affected component (only if > 1 surface) */}
                {surfaces.length > 1 && (
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#171717", marginBottom: "8px" }}>
                      🔧 Affected component
                    </label>
                    <select
                      value={report.surface}
                      onChange={(e) => report.setSurface(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontSize: "14px",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                        background: "#ffffff",
                        color: "#171717",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Not sure</option>
                      {surfaces.map((s) => (
                        <option key={s.id} value={s.id}>{s.displayName}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#171717", marginBottom: "8px" }}>
                    💬 Describe the issue{" "}
                    <span style={{ fontWeight: 400, color: "#a3a3a3", fontStyle: "italic" }}>(optional)</span>
                  </label>
                  <textarea
                    placeholder="e.g., API returns 429 errors since 10am, login page loads slowly…"
                    value={report.comment}
                    onChange={(e) => report.setComment(e.target.value.slice(0, 500))}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: "14px",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      background: "#ffffff",
                      color: "#171717",
                      resize: "vertical",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ fontSize: "11px", color: "#a3a3a3", marginTop: "2px", textAlign: "right" }}>
                    {report.comment.length}/500
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#171717", marginBottom: "8px" }}>
                    📧 Get notified when {serviceName} is back{" "}
                    <span style={{ fontWeight: 400, color: "#a3a3a3", fontStyle: "italic" }}>(optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={report.email}
                    onChange={(e) => report.setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: "14px",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      background: "#ffffff",
                      color: "#171717",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Add details submit */}
                <button
                  onClick={report.handleAddDetails}
                  disabled={report.submitting}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#ffffff",
                    background: report.submitting ? "#9ca3af" : "#dc2626",
                    border: "none",
                    borderRadius: "10px",
                    cursor: report.submitting ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!report.submitting) e.currentTarget.style.background = "#b91c1c"; }}
                  onMouseLeave={(e) => { if (!report.submitting) e.currentTarget.style.background = report.submitting ? "#9ca3af" : "#dc2626"; }}
                >
                  {report.submitting ? "Sending…" : "Add details"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile sticky button (JS-controlled, CSS hides on desktop) ── */}
      <div ref={stickyRef} className="sar-sticky">
        <button
          onClick={report.reportNow}
          disabled={report.submitting}
          style={{
            width: "100%",
            padding: "14px 20px",
            fontSize: "15px",
            fontWeight: 700,
            color: "#ffffff",
            background: report.submitting ? "#9ca3af" : "#dc2626",
            border: "none",
            borderRadius: "12px",
            cursor: report.submitting ? "not-allowed" : "pointer",
          }}
        >
          {report.submitting ? "Sending…" : `🔴 Report issue with ${shortName}`}
        </button>
      </div>
    </>
  );
}
