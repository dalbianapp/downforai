"use client";

import { useState, useEffect } from "react";

interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  startedAt: string;
  service: { name: string; slug: string };
}

const SEV_META: Record<string, { bg: string; color: string; dot: string }> = {
  CRITICAL: { bg: "#fee2e2", color: "#dc2626", dot: "#dc2626" },
  MAJOR:    { bg: "#fef3c7", color: "#ca8a04", dot: "#f59e0b" },
  MINOR:    { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
};

function fmtDuration(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/incidents").then((r) => r.json()).then((d) => {
      setIncidents(d.incidents || []);
      setLoading(false);
    });
  }, []);

  async function resolveIncident(id: string) {
    setResolvingId(id);
    await fetch("/api/admin/incidents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setIncidents((prev) => prev.filter((i) => i.id !== id));
    setResolvingId(null);
  }

  const filtered = severityFilter === "all"
    ? incidents
    : incidents.filter((i) => i.severity === severityFilter);

  // Sort by startedAt desc (most recent first)
  const sorted = [...filtered].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>Incidents</h1>
          <p style={{ fontSize: "13px", color: "#94a3b8" }}>
            {incidents.length === 0 ? "No active incidents" : `${incidents.length} active incident${incidents.length > 1 ? "s" : ""}`}
          </p>
        </div>
        {/* Severity filter */}
        <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "9px", padding: "3px" }}>
          {["all", "CRITICAL", "MAJOR", "MINOR"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              style={{ padding: "5px 12px", borderRadius: "7px", border: "none", fontSize: "12px", fontWeight: severityFilter === s ? 700 : 400, background: severityFilter === s ? "#fff" : "transparent", color: severityFilter === s ? "#0f172a" : "#64748b", cursor: "pointer", boxShadow: severityFilter === s ? "0 1px 2px rgba(0,0,0,0.08)" : "none" }}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline / cards */}
      {loading ? (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "60px", textAlign: "center", fontSize: "14px", color: "#94a3b8" }}>Loading...</div>
      ) : sorted.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>✓</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#16a34a" }}>All clear — no active incidents</div>
          <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>All services are operational</div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div style={{ position: "absolute", left: "20px", top: "24px", bottom: "24px", width: "2px", background: "#e2e8f0", zIndex: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sorted.map((inc) => {
              const meta = SEV_META[inc.severity] || SEV_META.MINOR;
              const durationMs = Date.now() - new Date(inc.startedAt).getTime();
              const startedAt = new Date(inc.startedAt);
              return (
                <div key={inc.id} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                  {/* Timeline dot */}
                  <div style={{ position: "relative", zIndex: 1, flexShrink: 0, width: "42px", display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: meta.dot, border: "3px solid #fff", boxShadow: `0 0 0 2px ${meta.dot}40`, marginTop: "18px" }} />
                  </div>
                  {/* Card */}
                  <div style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                          <a href={`/${inc.service.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", textDecoration: "none" }}>{inc.service.name}</a>
                          <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px", background: meta.bg, color: meta.color }}>{inc.severity}</span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: inc.status === "OPEN" ? "#dc2626" : "#ca8a04" }}>{inc.status}</span>
                        </div>
                        <div style={{ fontSize: "13px", color: "#475569", marginBottom: "8px" }}>{inc.title}</div>
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                          <div>
                            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>STARTED </span>
                            <span style={{ fontSize: "12px", color: "#475569" }}>{startedAt.toLocaleDateString()} {startedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>DURATION </span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: meta.color }}>{fmtDuration(durationMs)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => resolveIncident(inc.id)}
                        disabled={resolvingId === inc.id}
                        style={{ fontSize: "13px", padding: "7px 16px", borderRadius: "8px", border: "1px solid #bbf7d0", background: "#f0fdf4", cursor: "pointer", color: "#16a34a", fontWeight: 600, flexShrink: 0 }}
                      >
                        {resolvingId === inc.id ? "Resolving..." : "Mark Resolved"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
