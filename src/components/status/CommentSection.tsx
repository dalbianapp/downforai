"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  pseudo: string;
  content: string;
  aiReply: string | null;
  createdAt: string;
}

interface CommentSectionProps {
  serviceSlug: string;
  serviceName: string;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CommentSection({ serviceSlug, serviceName }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pseudo, setPseudo] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?serviceSlug=${serviceSlug}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } finally {
      setLoading(false);
    }
  }, [serviceSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceSlug, pseudo: pseudo.trim() || "Anonymous", content }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post comment");
      } else {
        setSuccess(true);
        setContent("");
        setPseudo("");
        // Add the new comment to the list immediately
        setComments((prev) => [data.comment, ...prev].slice(0, 20));
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "20px", marginTop: "24px" }}>
      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#171717", marginBottom: "16px" }}>
        Community Discussion
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="Your name (optional)"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          maxLength={50}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #e5e5e5",
            fontSize: "13px",
            marginBottom: "8px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <textarea
          placeholder={`Share your experience with ${serviceName}...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={3}
          required
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #e5e5e5",
            fontSize: "13px",
            resize: "vertical",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
          <span style={{ fontSize: "11px", color: "#a3a3a3" }}>{content.length}/1000</span>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              border: "none",
              background: submitting || !content.trim() ? "#e5e5e5" : "#171717",
              color: submitting || !content.trim() ? "#a3a3a3" : "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: submitting || !content.trim() ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: "8px", fontSize: "13px", color: "#ef4444" }}>{error}</div>
        )}
        {success && (
          <div style={{ marginTop: "8px", fontSize: "13px", color: "#16a34a" }}>
            Comment posted! An AI reply will appear shortly.
          </div>
        )}
      </form>

      {/* Comments list */}
      {loading ? (
        <div style={{ fontSize: "13px", color: "#a3a3a3", textAlign: "center", padding: "16px 0" }}>
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ fontSize: "13px", color: "#a3a3a3", textAlign: "center", padding: "16px 0" }}>
          No comments yet. Be the first to share your experience!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#fafafa",
                border: "1px solid #f0f0f0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#171717" }}>
                  {comment.pseudo}
                </span>
                <span style={{ fontSize: "11px", color: "#a3a3a3" }}>
                  {timeAgo(comment.createdAt)}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#525252", margin: 0, lineHeight: 1.5 }}>
                {comment.content}
              </p>
              {comment.aiReply && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", marginBottom: "4px" }}>
                    ✦ DownForAI Assistant
                  </div>
                  <p style={{ fontSize: "13px", color: "#1e40af", margin: 0, lineHeight: 1.5 }}>
                    {comment.aiReply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
