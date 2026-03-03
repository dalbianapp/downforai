import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — DownForAI",
  description: "Privacy policy for DownForAI. Learn how we handle your data, what we collect, and your rights.",
  robots: "noindex, follow",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
        ← Back to dashboard
      </Link>

      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", letterSpacing: "-1px", marginBottom: "8px" }}>Privacy Policy</h1>
        <p style={{ fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" }}>Last updated: February 2026</p>

        {/* Quick summary */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px", marginBottom: "28px" }}>
          <div style={{ fontWeight: 700, color: "#166534", marginBottom: "6px" }}>🔒 TL;DR</div>
          <div style={{ fontSize: "13px", color: "#16a34a", lineHeight: 1.6 }}>
            • No advertising cookies or third-party tracking<br/>
            • IP addresses are hashed (never stored in plain text)<br/>
            • No data sold to third parties<br/>
            • Reports are anonymous<br/>
            • You can request data deletion anytime
          </div>
        </div>

        <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.8 }}>
          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>1. Data We Collect</h2>
            <p><strong>When you browse:</strong> We collect basic analytics (page views, country of origin) through Vercel Analytics. No personal data is stored.</p>
            <p style={{ marginTop: "8px" }}><strong>When you report an issue:</strong> We store a SHA-256 hash of your IP address (for rate limiting and spam prevention). The actual IP address is never saved. Reports do not contain any personally identifiable information.</p>
            <p style={{ marginTop: "8px" }}><strong>When you contact us:</strong> We store your email address and message to respond to your inquiry. This data is deleted after the inquiry is resolved.</p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>2. How We Use Data</h2>
            <p>Data is used exclusively to:</p>
            <p style={{ marginTop: "4px" }}>• Operate and improve the monitoring service<br/>• Prevent spam and abuse (rate limiting)<br/>• Generate aggregate statistics (e.g., "X reports in the last hour")<br/>• Respond to user inquiries</p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>3. Cookies</h2>
            <p>DownForAI does not use advertising or tracking cookies. We may use essential cookies for basic site functionality (e.g., preventing duplicate reports).</p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <p style={{ marginTop: "4px" }}>• <strong>Vercel</strong> (hosting & analytics) — Covina, CA, USA<br/>• <strong>Neon</strong> (database) — San Francisco, CA, USA</p>
            <p style={{ marginTop: "8px" }}>These services have their own privacy policies. No personal data is shared with any other third party.</p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>5. Data Retention</h2>
            <p>• Community reports: kept for 90 days, then automatically deleted<br/>• IP hashes: kept for 90 days<br/>• Contact form messages: deleted after inquiry resolution<br/>• Analytics data: aggregated and anonymized</p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>6. Your Rights</h2>
            <p>Under GDPR and applicable privacy laws, you have the right to:</p>
            <p style={{ marginTop: "4px" }}>• Access your data<br/>• Request correction or deletion<br/>• Object to processing<br/>• Data portability</p>
            <p style={{ marginTop: "8px" }}>To exercise these rights, contact us at <a href="mailto:contact@downforai.com" style={{ color: "#2563eb" }}>contact@downforai.com</a>.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>7. Contact</h2>
            <p>For any privacy-related questions: <a href="mailto:contact@downforai.com" style={{ color: "#2563eb" }}>contact@downforai.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
