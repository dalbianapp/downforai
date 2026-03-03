import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — DownForAI",
  description: "Get in touch with the DownForAI team. Report bugs, suggest services, or ask questions.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
        ← Back to dashboard
      </Link>

      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", letterSpacing: "-1px", marginBottom: "8px" }}>Contact Us</h1>
        <p style={{ fontSize: "14px", color: "#525252", marginBottom: "28px" }}>
          Have a question, found a bug, or want to suggest a new AI service to monitor?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
          {/* Email */}
          <a
            href="mailto:contact@downforai.com"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "16px 20px", background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: "12px", textDecoration: "none", transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: "24px" }}>📧</span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e40af" }}>Email Us</div>
              <div style={{ fontSize: "13px", color: "#2563eb" }}>contact@downforai.com</div>
            </div>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/downforai"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "16px 20px", background: "#f5f5f5", border: "1px solid #e5e5e5",
              borderRadius: "12px", textDecoration: "none", transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: "24px" }}>💻</span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#171717" }}>GitHub</div>
              <div style={{ fontSize: "13px", color: "#525252" }}>Report bugs or contribute</div>
            </div>
          </a>

          {/* Twitter/X */}
          <a
            href="https://x.com/downforai"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "16px 20px", background: "#f5f5f5", border: "1px solid #e5e5e5",
              borderRadius: "12px", textDecoration: "none", transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: "24px" }}>🐦</span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#171717" }}>X (Twitter)</div>
              <div style={{ fontSize: "13px", color: "#525252" }}>Follow us for real-time updates</div>
            </div>
          </a>
        </div>

        <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.8 }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>Common Requests</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ padding: "12px 16px", background: "#fafafa", borderRadius: "10px", border: "1px solid #f0f0f0" }}>
              <span style={{ fontWeight: 600, color: "#171717" }}>🔍 "Add a new AI service"</span>
              <span style={{ display: "block", fontSize: "13px", color: "#a3a3a3", marginTop: "2px" }}>Email us with the service name, website URL, and category. We'll review and add it within 48 hours.</span>
            </div>
            <div style={{ padding: "12px 16px", background: "#fafafa", borderRadius: "10px", border: "1px solid #f0f0f0" }}>
              <span style={{ fontWeight: 600, color: "#171717" }}>🐛 "I found a bug"</span>
              <span style={{ display: "block", fontSize: "13px", color: "#a3a3a3", marginTop: "2px" }}>Please describe the issue, the page it occurred on, and your browser. Screenshots help!</span>
            </div>
            <div style={{ padding: "12px 16px", background: "#fafafa", borderRadius: "10px", border: "1px solid #f0f0f0" }}>
              <span style={{ fontWeight: 600, color: "#171717" }}>📊 "Status seems wrong"</span>
              <span style={{ display: "block", fontSize: "13px", color: "#a3a3a3", marginTop: "2px" }}>You can report issues directly from any service page. If the automated status seems incorrect, let us know by email.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
