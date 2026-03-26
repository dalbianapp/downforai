"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Invalid password");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ width: "100%", maxWidth: "360px", padding: "16px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "32px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#171717", marginBottom: "4px" }}>DownForAI Admin</h1>
          <p style={{ fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" }}>Enter your admin password to continue</p>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              required
              autoFocus
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e5e5",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: "12px",
              }}
            />
            {error && (
              <div style={{ fontSize: "13px", color: "#ef4444", marginBottom: "12px" }}>{error}</div>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                background: loading || !password ? "#e5e5e5" : "#171717",
                color: loading || !password ? "#a3a3a3" : "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading || !password ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
