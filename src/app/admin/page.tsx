"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DayPoint { date: string; count: number }
interface TopService { name: string; slug: string; count: number }
interface Stats {
  services: number;
  reportsToday: number;
  pendingComments: number;
  activeIncidents: number;
  totalStandaloneComments: number;
  reportsLast7Days: DayPoint[];
  commentsLast7Days: DayPoint[];
  topReportedToday: TopService[];
  topCommented: TopService[];
}
interface AffiliateStats {
  stats: { today: number; last7d: number; last30d: number; total: number };
  topServices: { serviceName: string; count: number }[];
  recentClicks: { id: string; serviceName: string; page: string; createdAt: string }[];
}
interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  startedAt: string;
  service: { name: string; slug: string };
}

const SEV_STYLE: Record<string, { bg: string; color: string }> = {
  CRITICAL: { bg: "#fee2e2", color: "#dc2626" },
  MAJOR:    { bg: "#fef3c7", color: "#ca8a04" },
  MINOR:    { bg: "#f0fdf4", color: "#16a34a" },
};

function StatCard({ label, value, href, accent, sub }: { label: string; value: number | string; href?: string; accent?: string; sub?: string }) {
  const inner = (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", height: "100%" }}>
      <div style={{ fontSize: "30px", fontWeight: 800, color: accent || "#0f172a", marginBottom: "2px", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>{sub}</div>}
    </div>
  );
  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
  return inner;
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function MiniBar({ name, count, max, slug }: { name: string; count: number; max: number; slug: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ padding: "8px 16px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "10px" }}>
      <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", fontWeight: 500, color: "#334155", textDecoration: "none", width: "160px", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</a>
      <div style={{ flex: 1, background: "#f1f5f9", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#3b82f6", borderRadius: "4px" }} />
      </div>
      <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", width: "28px", textAlign: "right" }}>{count}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [affiliate, setAffiliate] = useState<AffiliateStats | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
    fetch("/api/admin/incidents").then((r) => r.json()).then((d) => setIncidents(d.incidents || []));
    fetch("/api/admin/affiliate").then((r) => r.json()).then(setAffiliate);
  }, []);

  async function resolveIncident(id: string) {
    setResolvingId(id);
    await fetch("/api/admin/incidents", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setIncidents((prev) => prev.filter((i) => i.id !== id));
    setResolvingId(null);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `downforai-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  const maxReported = stats?.topReportedToday[0]?.count || 1;
  const maxCommented = stats?.topCommented[0]?.count || 1;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>Dashboard</h1>
          <p style={{ fontSize: "13px", color: "#94a3b8" }}>DownForAI monitoring overview · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "9px", border: "1px solid #16a34a", background: exporting ? "#f0fdf4" : "#fff", color: "#16a34a", fontSize: "13px", fontWeight: 600, cursor: exporting ? "wait" : "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
        >
          {exporting ? "⏳ Generating..." : "⬇ Export Excel"}
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        <StatCard label="Total Services" value={stats?.services ?? "—"} sub="monitored" />
        <StatCard label="Reports Today" value={stats?.reportsToday ?? "—"} href="/admin/reports" accent={stats && stats.reportsToday > 0 ? "#2563eb" : undefined} sub="community signals" />
        <StatCard label="Unanswered Comments" value={stats?.pendingComments ?? "—"} href="/admin/comments" accent={stats && stats.pendingComments > 0 ? "#ca8a04" : undefined} sub="need reply" />
        <StatCard label="Active Incidents" value={stats?.activeIncidents ?? "—"} href="/admin/incidents" accent={stats && stats.activeIncidents > 0 ? "#dc2626" : undefined} sub="open or monitoring" />
        <StatCard label="Discussion Comments" value={stats?.totalStandaloneComments ?? "—"} href="/admin/comments" sub="standalone" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <SectionCard title="Reports — last 7 days">
          <div style={{ padding: "16px 0 8px" }}>
            {stats ? (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={stats.reportsLast7Days} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} cursor={{ fill: "#f1f5f9" }} />
                  <Bar dataKey="count" name="Reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: 13 }}>Loading...</div>}
          </div>
        </SectionCard>

        <SectionCard title="Comments — last 7 days">
          <div style={{ padding: "16px 0 8px" }}>
            {stats ? (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={stats.commentsLast7Days} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} cursor={{ fill: "#f1f5f9" }} />
                  <Bar dataKey="count" name="Comments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: 13 }}>Loading...</div>}
          </div>
        </SectionCard>
      </div>

      {/* Top 10 row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <SectionCard title="Top 10 Most Reported Today" action={<Link href="/admin/reports?dateRange=today" style={{ fontSize: "12px", color: "#3b82f6", textDecoration: "none" }}>View all →</Link>}>
          {!stats ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#cbd5e1", fontSize: 13 }}>Loading...</div>
          ) : stats.topReportedToday.length === 0 ? (
            <div style={{ padding: "24px 16px", fontSize: 13, color: "#94a3b8" }}>No reports today</div>
          ) : (
            <div>{stats.topReportedToday.map((s) => <MiniBar key={s.slug} name={s.name} count={s.count} max={maxReported} slug={s.slug} />)}</div>
          )}
        </SectionCard>

        <SectionCard title="Top 10 Most Commented" action={<Link href="/admin/comments" style={{ fontSize: "12px", color: "#3b82f6", textDecoration: "none" }}>View all →</Link>}>
          {!stats ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#cbd5e1", fontSize: 13 }}>Loading...</div>
          ) : stats.topCommented.length === 0 ? (
            <div style={{ padding: "24px 16px", fontSize: 13, color: "#94a3b8" }}>No comments yet</div>
          ) : (
            <div>{stats.topCommented.map((s) => <MiniBar key={s.slug} name={s.name} count={s.count} max={maxCommented} slug={s.slug} />)}</div>
          )}
        </SectionCard>
      </div>

      {/* Affiliate stats */}
      <div style={{ marginBottom: "16px" }}>
        <SectionCard title="NordVPN Affiliate Clicks">
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", borderBottom: "1px solid #f1f5f9" }}>
              {[
                { label: "Today", value: affiliate?.stats.today ?? "—" },
                { label: "Last 7 days", value: affiliate?.stats.last7d ?? "—" },
                { label: "Last 30 days", value: affiliate?.stats.last30d ?? "—" },
                { label: "All time", value: affiliate?.stats.total ?? "—" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "16px 20px", borderRight: i < 3 ? "1px solid #f1f5f9" : undefined }}>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {affiliate && affiliate.topServices.length > 0 && (
              <div style={{ padding: "12px 0 4px" }}>
                <div style={{ padding: "6px 20px 8px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Top Services</div>
                {affiliate.topServices.slice(0, 10).map((s) => (
                  <MiniBar key={s.serviceName} name={s.serviceName} count={s.count} max={affiliate.topServices[0].count} slug={s.serviceName.toLowerCase().replace(/\s+/g, "-")} />
                ))}
              </div>
            )}
            {affiliate && affiliate.recentClicks.length > 0 && (
              <div style={{ padding: "12px 20px 16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Recent Clicks</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {affiliate.recentClicks.slice(0, 10).map((c) => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", padding: "4px 0", borderBottom: "1px solid #f8fafc" }}>
                      <span style={{ fontWeight: 500 }}>{c.serviceName}</span>
                      <span style={{ color: "#94a3b8" }}>{c.page}</span>
                      <span style={{ color: "#94a3b8" }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {affiliate && affiliate.stats.total === 0 && (
              <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>No affiliate clicks yet</div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Active incidents */}
      <SectionCard title="Active Incidents" action={<Link href="/admin/incidents" style={{ fontSize: "12px", color: "#3b82f6", textDecoration: "none" }}>View all →</Link>}>
        {incidents.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", fontSize: "14px", color: "#16a34a", fontWeight: 600 }}>✓ All clear — no active incidents</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Service", "Title", "Severity", "Status", "Started", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => {
                const sev = SEV_STYLE[inc.severity] || SEV_STYLE.MINOR;
                const minsAgo = Math.round((Date.now() - new Date(inc.startedAt).getTime()) / 60000);
                const dur = minsAgo < 60 ? `${minsAgo}m` : `${Math.floor(minsAgo / 60)}h ${minsAgo % 60}m`;
                return (
                  <tr key={inc.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600 }}>
                      <a href={`/${inc.service.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>{inc.service.name}</a>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#475569" }}>{inc.title}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px", background: sev.bg, color: sev.color }}>{inc.severity}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: inc.status === "OPEN" ? "#dc2626" : "#ca8a04" }}>{inc.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{dur} ago</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => resolveIncident(inc.id)} disabled={resolvingId === inc.id} style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "7px", border: "1px solid #bbf7d0", background: "#f0fdf4", cursor: "pointer", color: "#16a34a", fontWeight: 600 }}>
                        {resolvingId === inc.id ? "..." : "Resolve"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
