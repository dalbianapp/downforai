"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  source: "report" | "standalone";
  pseudo: string;
  content: string;
  reply: string | null;
  repliedAt: string | null;
  isVisible: boolean;
  isSpam: boolean;
  createdAt: string;
  service: { name: string; slug: string };
  reportType: string | null;
}

interface CommentsData {
  comments: Comment[];
  total: number;
  page: number;
  pages: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return "yesterday";
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function Th({ label }: { label: string }) {
  return (
    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", background: "#f8fafc" }}>
      {label}
    </th>
  );
}

export default function AdminCommentsPage() {
  const [data, setData] = useState<CommentsData | null>(null);
  const [page, setPage] = useState(1);
  const [serviceFilter, setServiceFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), source: sourceFilter });
    if (serviceFilter) params.set("serviceSlug", serviceFilter);
    const res = await fetch(`/api/admin/comments?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [page, serviceFilter, sourceFilter]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  async function generateAiReply(comment: Comment) {
    setGeneratingId(comment.id);
    const res = await fetch("/api/admin/comments/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: comment.id, source: comment.source, content: comment.content, serviceName: comment.service.name }),
    });
    const d = await res.json();
    if (d.reply) {
      setReplyText((prev) => ({ ...prev, [comment.id]: d.reply }));
      setReplyingId(comment.id);
      fetchComments();
    }
    setGeneratingId(null);
  }

  async function submitReply(comment: Comment) {
    const reply = replyText[comment.id];
    if (!reply?.trim()) return;
    setGeneratingId(comment.id);
    await fetch("/api/admin/comments/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: comment.id, source: comment.source, content: comment.content, serviceName: comment.service.name, manualReply: reply }),
    });
    setReplyingId(null);
    setReplyText((prev) => ({ ...prev, [comment.id]: "" }));
    setGeneratingId(null);
    fetchComments();
  }

  async function deleteComment(comment: Comment) {
    if (!confirm("Hide this comment?")) return;
    setDeletingId(comment.id);
    await fetch(`/api/admin/comments?id=${comment.id}&source=${comment.source}`, { method: "DELETE" });
    setDeletingId(null);
    fetchComments();
  }

  const pending = data?.comments.filter((c) => !c.reply).length || 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>Comments</h1>
          <p style={{ fontSize: "13px", color: "#94a3b8" }}>
            {data ? `${data.total} total` : "Loading..."}
            {pending > 0 && <span style={{ marginLeft: "8px", padding: "1px 8px", borderRadius: "10px", background: "#fef3c7", color: "#ca8a04", fontSize: "12px", fontWeight: 700 }}>{pending} unanswered on this page</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Filter by service slug..."
          value={serviceFilter}
          onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", width: "220px", background: "#fff" }}
        />
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", background: "#fff" }}
        >
          <option value="all">All sources</option>
          <option value="standalone">Discussion only</option>
          <option value="report">Report comments only</option>
        </select>
        {data && (
          <span style={{ marginLeft: "auto", fontSize: "13px", color: "#94a3b8" }}>
            Page {page} / {data.pages} · {data.total} comments
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", fontSize: "14px", color: "#94a3b8" }}>Loading...</div>
        ) : !data?.comments.length ? (
          <div style={{ padding: "60px", textAlign: "center", fontSize: "14px", color: "#94a3b8" }}>No comments found</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Th label="When" />
                  <Th label="Service" />
                  <Th label="Source" />
                  <Th label="Author" />
                  <Th label="Comment" />
                  <Th label="Reply" />
                  <Th label="Actions" />
                </tr>
              </thead>
              <tbody>
                {data.comments.map((c) => {
                  const unanswered = !c.reply && c.isVisible;
                  return (
                    <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9", opacity: !c.isVisible ? 0.45 : 1, background: unanswered ? "#fffbeb" : "#fff" }}>
                      {/* Date */}
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "#475569" }}>{timeAgo(c.createdAt)}</div>
                        <div style={{ color: "#94a3b8", marginTop: "2px" }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                      </td>
                      {/* Service */}
                      <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", verticalAlign: "top" }}>
                        <a href={`/${c.service.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>{c.service.name}</a>
                      </td>
                      {/* Source */}
                      <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "5px", whiteSpace: "nowrap", background: c.source === "standalone" ? "#eff6ff" : "#f0fdf4", color: c.source === "standalone" ? "#2563eb" : "#16a34a" }}>
                          {c.source === "standalone" ? "Discussion" : c.reportType || "Report"}
                        </span>
                      </td>
                      {/* Author */}
                      <td style={{ padding: "12px 14px", fontSize: "13px", color: "#475569", whiteSpace: "nowrap", verticalAlign: "top" }}>{c.pseudo}</td>
                      {/* Content */}
                      <td style={{ padding: "12px 14px", fontSize: "13px", color: "#334155", maxWidth: "260px", verticalAlign: "top" }}>
                        <div style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, lineHeight: 1.5 }}>{c.content}</div>
                      </td>
                      {/* Reply */}
                      <td style={{ padding: "12px 14px", fontSize: "13px", color: "#475569", maxWidth: "240px", verticalAlign: "top" }}>
                        {replyingId === c.id ? (
                          <div>
                            <textarea
                              value={replyText[c.id] || ""}
                              onChange={(e) => setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))}
                              rows={3}
                              style={{ width: "100%", padding: "6px 8px", borderRadius: "7px", border: "1px solid #e2e8f0", fontSize: "12px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", outline: "none" }}
                            />
                            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                              <button onClick={() => submitReply(c)} disabled={!!generatingId} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "none", background: "#0f172a", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Save</button>
                              <button onClick={() => setReplyingId(null)} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#475569" }}>Cancel</button>
                            </div>
                          </div>
                        ) : c.reply ? (
                          <div>
                            <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700, marginBottom: "3px" }}>✓ Replied</div>
                            <div style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>{c.reply}</div>
                            <button onClick={() => { setReplyingId(c.id); setReplyText((prev) => ({ ...prev, [c.id]: c.reply! })); }} style={{ fontSize: "11px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "4px" }}>Edit</button>
                          </div>
                        ) : (
                          <span style={{ color: "#cbd5e1", fontSize: "12px" }}>No reply yet</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap", verticalAlign: "top" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          <button
                            onClick={() => generateAiReply(c)}
                            disabled={generatingId === c.id}
                            style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "7px", border: "none", background: "#eff6ff", color: "#2563eb", cursor: "pointer", fontWeight: 700, textAlign: "left" }}
                          >
                            {generatingId === c.id ? "Generating..." : "✦ AI Reply"}
                          </button>
                          <button
                            onClick={() => { setReplyingId(c.id); setReplyText((prev) => ({ ...prev, [c.id]: prev[c.id] || "" })); }}
                            style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", textAlign: "left", color: "#475569" }}
                          >
                            ✎ Manual
                          </button>
                          <button
                            onClick={() => deleteComment(c)}
                            disabled={deletingId === c.id}
                            style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "7px", border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontWeight: 700, textAlign: "left" }}
                          >
                            {deletingId === c.id ? "..." : "Hide"}
                          </button>
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
