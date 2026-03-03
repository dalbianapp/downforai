import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About DownForAI — Real-Time AI Status Monitoring",
  description: "Learn about DownForAI, the free real-time status monitoring platform for 200+ AI services. Our mission, how it works, and who we are.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <Link href="/" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
        ← Back to dashboard
      </Link>

      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#171717", letterSpacing: "-1px", marginBottom: "24px" }}>About DownForAI</h1>

        <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.8 }}>
          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>Our Mission</h2>
            <p>
              DownForAI is a free, independent monitoring platform that tracks the real-time status of 200+ AI services — from ChatGPT and Claude to Midjourney, Stable Diffusion, and beyond.
            </p>
            <p style={{ marginTop: "8px" }}>
              When an AI service goes down, developers and users need to know immediately. Is it just me, or is everyone affected? DownForAI answers that question in seconds.
            </p>
          </section>

          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>How It Works</h2>
            <p>We monitor AI services through three complementary methods:</p>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px" }}>
                <span style={{ fontWeight: 700, color: "#166534" }}>🤖 Automated Monitoring</span>
                <span style={{ display: "block", fontSize: "13px", color: "#16a34a", marginTop: "2px" }}>We ping service endpoints every 5 minutes to check availability and measure latency.</span>
              </div>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "12px 16px" }}>
                <span style={{ fontWeight: 700, color: "#1e40af" }}>📡 Status Page Sync</span>
                <span style={{ display: "block", fontSize: "13px", color: "#2563eb", marginTop: "2px" }}>We aggregate data from official status pages when available.</span>
              </div>
              <div style={{ background: "#fefce8", border: "1px solid #fef08a", borderRadius: "10px", padding: "12px 16px" }}>
                <span style={{ fontWeight: 700, color: "#854d0e" }}>👥 Community Reports</span>
                <span style={{ display: "block", fontSize: "13px", color: "#ca8a04", marginTop: "2px" }}>Users can report issues directly from any service page. When multiple reports come in, we create an incident.</span>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>Who We Are</h2>
            <p>
              DownForAI is an independent project. We are not affiliated with any AI company. Our goal is to provide transparent, unbiased status information to the AI community.
            </p>
          </section>

          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>Services We Monitor</h2>
            <p>
              We currently track 200+ AI services across 11 categories: LLMs (ChatGPT, Claude, Gemini...), Image Generation (Midjourney, DALL-E, Stable Diffusion...), Video, Audio, Dev Tools, Infrastructure, Search, Productivity, Agents (Devin, LangChain...), Design (Figma, CapCut...), and 3D & Avatars.
            </p>
            <p style={{ marginTop: "8px" }}>
              Missing a service? <Link href="/contact" style={{ color: "#2563eb", textDecoration: "none" }}>Let us know</Link> and we'll add it.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#171717", marginBottom: "8px" }}>Tech Stack</h2>
            <p>
              Built with Next.js, PostgreSQL (Neon), Prisma, and deployed on Vercel. Designed for speed, reliability, and real-time accuracy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
