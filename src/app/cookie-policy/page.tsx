import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy — DownForAI",
  description: "Cookie policy for DownForAI. Learn what cookies we use, why, and how to manage them.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/cookie-policy",
  },
};

export default function CookiePolicyPage() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
        ← Back to dashboard
      </Link>

      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", letterSpacing: "-1px", marginBottom: "8px" }}>Cookie Policy</h1>
        <p style={{ fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" }}>Last updated: March 2026</p>

        {/* Quick summary */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "16px", marginBottom: "28px" }}>
          <div style={{ fontWeight: 700, color: "#1e40af", marginBottom: "6px" }}>🍪 TL;DR</div>
          <div style={{ fontSize: "13px", color: "#2563eb", lineHeight: 1.6 }}>
            • Essential cookies only (session management, spam prevention)<br/>
            • Analytics via PostHog (privacy-friendly, EU instance)<br/>
            • No advertising cookies currently active<br/>
            • Third-party ad cookies may be added in the future (opt-out available)<br/>
            • You can manage or disable cookies in your browser at any time
          </div>
        </div>

        <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.8 }}>
          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device by your browser when you visit a website. They allow websites to remember preferences, maintain sessions, and collect usage data. You can control or delete cookies through your browser settings at any time.
            </p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>2. Essential Cookies</h2>
            <p>These cookies are strictly necessary for the site to function. They cannot be disabled without breaking core features.</p>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ background: "#f5f5f5", borderRadius: "10px", padding: "12px 16px" }}>
                <div style={{ fontWeight: 700, color: "#171717", fontSize: "13px" }}>Session cookie</div>
                <div style={{ fontSize: "13px", color: "#737373", marginTop: "2px" }}>Maintains your session while browsing the site. Expires when you close your browser.</div>
              </div>
              <div style={{ background: "#f5f5f5", borderRadius: "10px", padding: "12px 16px" }}>
                <div style={{ fontWeight: 700, color: "#171717", fontSize: "13px" }}>Anti-spam / rate-limiting</div>
                <div style={{ fontSize: "13px", color: "#737373", marginTop: "2px" }}>Used to prevent duplicate or abusive service reports. Based on a hashed IP address — your actual IP is never stored. Expires after 24 hours.</div>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>3. Analytics Cookies — PostHog</h2>
            <p>
              We use <strong>PostHog</strong> (EU instance at <code style={{ background: "#f5f5f5", padding: "1px 5px", borderRadius: "4px", fontSize: "13px" }}>eu.i.posthog.com</code>) to understand how visitors use DownForAI. PostHog collects anonymous usage data such as page views and click events. No personally identifiable information is collected.
            </p>
            <p style={{ marginTop: "8px" }}>
              PostHog is configured to respect privacy: data is processed on EU servers, and IP addresses are anonymized. You can opt out of PostHog analytics at any time by visiting{" "}
              <a href="https://posthog.com/docs/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>posthog.com/docs/privacy</a>.
            </p>
            <div style={{ background: "#f5f5f5", borderRadius: "10px", padding: "12px 16px", marginTop: "12px" }}>
              <div style={{ fontWeight: 700, color: "#171717", fontSize: "13px" }}>PostHog analytics cookies</div>
              <div style={{ fontSize: "13px", color: "#737373", marginTop: "2px" }}>
                <code style={{ background: "#e5e5e5", padding: "1px 4px", borderRadius: "3px" }}>ph_*</code> — Tracks anonymous session and user events for product analytics. Duration: up to 1 year.
              </div>
            </div>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>4. Advertising Cookies (Future)</h2>
            <p>
              DownForAI does not currently serve advertising. In the future, we may partner with ad networks such as <strong>Ezoic</strong> or <strong>Google AdSense</strong> to display non-intrusive ads and keep the service free. If and when this happens:
            </p>
            <p style={{ marginTop: "8px" }}>
              • You will be notified via an updated cookie banner<br/>
              • You will be able to opt out of personalised advertising<br/>
              • A full list of third-party cookies will be published here<br/>
              • An <code style={{ background: "#f5f5f5", padding: "1px 5px", borderRadius: "4px", fontSize: "13px" }}>ads.txt</code> file will be activated at the root of this domain
            </p>
            <p style={{ marginTop: "8px" }}>
              Until then, no advertising cookies are set on this site.
            </p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>5. Your Rights (GDPR)</h2>
            <p>Under the General Data Protection Regulation (GDPR), if you are located in the European Union, you have the right to:</p>
            <p style={{ marginTop: "4px" }}>
              • <strong>Access</strong> the data we hold about you<br/>
              • <strong>Correct</strong> inaccurate data<br/>
              • <strong>Request deletion</strong> of your data ("right to be forgotten")<br/>
              • <strong>Object</strong> to certain types of processing<br/>
              • <strong>Withdraw consent</strong> for analytics cookies at any time
            </p>
            <p style={{ marginTop: "8px" }}>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:contact@downforai.com" style={{ color: "#2563eb" }}>contact@downforai.com</a>.
            </p>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>6. How to Manage Cookies</h2>
            <p>You can control and delete cookies through your browser settings:</p>
            <p style={{ marginTop: "8px" }}>
              • <strong>Chrome</strong>: Settings → Privacy and security → Cookies and other site data<br/>
              • <strong>Firefox</strong>: Settings → Privacy & Security → Cookies and Site Data<br/>
              • <strong>Safari</strong>: Preferences → Privacy → Manage Website Data<br/>
              • <strong>Edge</strong>: Settings → Privacy, search, and services → Cookies
            </p>
            <p style={{ marginTop: "8px" }}>
              Note: disabling essential cookies may prevent some features (like report submission) from working correctly.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>7. Contact</h2>
            <p>
              For any cookie or privacy-related questions:{" "}
              <a href="mailto:contact@downforai.com" style={{ color: "#2563eb" }}>contact@downforai.com</a>
            </p>
            <p style={{ marginTop: "8px" }}>
              See also our <Link href="/privacy" style={{ color: "#2563eb", textDecoration: "none" }}>Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
