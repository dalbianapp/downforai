"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Report {
  id: string;
  createdAt: string;
  countryCode: string | null;
  reportType: string;
  comment: string | null;
  isVisible: boolean;
  isSpam: boolean;
  service: { name: string; slug: string };
  surface: { displayName: string } | null;
}

interface ReportsData {
  reports: Report[];
  total: number;
  page: number;
  pages: number;
  typeCounts: Record<string, number>;
}

const TYPE_META: Record<string, { bg: string; color: string; chartColor: string }> = {
  DOWN:      { bg: "#fee2e2", color: "#dc2626", chartColor: "#ef4444" },
  SLOW:      { bg: "#fef3c7", color: "#ca8a04", chartColor: "#f59e0b" },
  LOGIN:     { bg: "#ede9fe", color: "#7c3aed", chartColor: "#8b5cf6" },
  API_ERROR: { bg: "#ffedd5", color: "#ea580c", chartColor: "#f97316" },
  OTHER:     { bg: "#f1f5f9", color: "#475569", chartColor: "#94a3b8" },
};

const DATE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return "yesterday";
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), dateRange });
    if (serviceFilter) params.set("serviceSlug", serviceFilter);
    const res = await fetch(`/api/admin/reports?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [page, dateRange, serviceFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Build chart data from typeCounts
  const chartData = data
    ? Object.entries(data.typeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>Reports</h1>
        <p style={{ fontSize: "13px", color: "#94a3b8" }}>{data ? `${data.total} reports` : "Community issue reports"}</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "9px", padding: "3px" }}>
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setDateRange(opt.value); setPage(1); }}
              style={{ padding: "5px 12px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: dateRange === opt.value ? 600 : 400, background: dateRange === opt.value ? "#fff" : "transparent", color: dateRange === opt.value ? "#0f172a" : "#64748b", cursor: "pointer", boxShadow: dateRange === opt.value ? "0 1px 2px rgba(0,0,0,0.08)" : "none" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Filter by service slug..."
          value={serviceFilter}
          onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", width: "200px", background: "#fff" }}
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>Reports by type</h2>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="count" name="Reports" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.type} fill={TYPE_META[entry.type]?.chartColor || "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", fontSize: "14px", color: "#94a3b8" }}>Loading...</div>
        ) : !data?.reports.length ? (
          <div style={{ padding: "60px", textAlign: "center", fontSize: "14px", color: "#94a3b8" }}>No reports found</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["When", "Service", "Surface", "Type", "Country", "Comment", "Flags"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.reports.map((r) => {
                  const meta = TYPE_META[r.reportType] || TYPE_META.OTHER;
                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid #f1f5f9", opacity: r.isSpam ? 0.45 : 1 }}>
                      <td style={{ padding: "11px 14px", fontSize: "12px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "#475569" }}>{timeAgo(r.createdAt)}</div>
                        <div style={{ color: "#94a3b8", marginTop: "1px" }}>{new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 600, verticalAlign: "top" }}>
                        <a href={`/${r.service.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>{r.service.name}</a>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: "#64748b", verticalAlign: "top" }}>{r.surface?.displayName || "—"}</td>
                      <td style={{ padding: "11px 14px", verticalAlign: "top" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "5px", background: meta.bg, color: meta.color }}>{r.reportType}</span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: "13px", color: "#475569", verticalAlign: "top" }}>{r.countryCode || "—"}</td>
                      <td style={{ padding: "11px 14px", fontSize: "13px", color: "#334155", maxWidth: "220px", verticalAlign: "top" }}>
                        {r.comment ? (
                          <span style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, lineHeight: 1.5 }}>{r.comment}</span>
                        ) : <span style={{ color: "#e2e8f0" }}>—</span>}
                      </td>
                      <td style={{ padding: "11px 14px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {r.isSpam && <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "#fee2e2", color: "#dc2626", fontWeight: 700 }}>SPAM</span>}
                          {!r.isVisible && <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "#f1f5f9", color: "#64748b", fontWeight: 700 }}>HIDDEN</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "13px", color: page === 1 ? "#cbd5e1" : "#0f172a" }}>← Prev</button>
          <span style={{ padding: "7px 16px", fontSize: "13px", color: "#64748b" }}>Page {page} / {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: page === data.pages ? "not-allowed" : "pointer", fontSize: "13px", color: page === data.pages ? "#cbd5e1" : "#0f172a" }}>Next →</button>
        </div>
      )}
    </div>
  );
}
