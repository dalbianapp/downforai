import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — DownForAI",
  description: "Terms of service for DownForAI. Rules for using our AI status monitoring platform.",
  robots: "noindex, follow",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
        ← Back to dashboard
      </Link>

      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", letterSpacing: "-1px", marginBottom: "8px" }}>Terms of Service</h1>
        <p style={{ fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" }}>Last updated: February 2026</p>

        <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.8 }}>
          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>1. Service Description</h2>
            <p>DownForAI provides real-time status monitoring for AI services. The information displayed is based on automated checks, official status pages, and community reports. While we strive for accuracy, we cannot guarantee that status information is always 100% accurate or up-to-date.</p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>2. Acceptable Use</h2>
            <p>When using DownForAI, you agree to:</p>
            <p style={{ marginTop: "4px" }}>• Submit only truthful reports about service issues you are personally experiencing<br/>• Not abuse the reporting system (spam, false reports, automated submissions)<br/>• Not attempt to scrape, overload, or disrupt the service<br/>• Not impersonate any AI service or official status page</p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>3. Disclaimer</h2>
            <p>DownForAI is provided "as is" without warranties of any kind. We are not affiliated with any AI service provider listed on this platform. Status information is for informational purposes only and should not be the sole basis for critical business decisions.</p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>4. Intellectual Property</h2>
            <p>Service names, logos, and trademarks belong to their respective owners. DownForAI does not claim ownership of any third-party intellectual property. Our platform, design, and original content are protected by copyright.</p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>5. Limitation of Liability</h2>
            <p>DownForAI shall not be liable for any damages arising from the use or inability to use this service, including but not limited to inaccurate status information, service downtime, or data loss.</p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>6. Modifications</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>7. Contact</h2>
            <p>Questions about these terms? Contact us at <a href="mailto:contact@downforai.com" style={{ color: "#2563eb" }}>contact@downforai.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
