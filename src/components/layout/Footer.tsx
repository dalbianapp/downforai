"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer style={{ borderTop: "1px solid #E2E8F0", marginTop: "48px", padding: "40px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "32px", marginBottom: "32px" }}>

          {/* About */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "12px" }}>DownForAI</div>
            <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.6 }}>
              Free, real-time status monitoring for 800+ AI services. Independent and community-driven.
            </p>
          </div>

          {/* Categories */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "12px" }}>Categories</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {CATEGORIES.map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "12px" }}>Resources</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Link href="/reliability-index" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Reliability Leaderboard</Link>
              <Link href="/top-outages" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Top Outages</Link>
              <Link href="/reliability" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Reliability Rankings</Link>
              <Link href="/guides" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Guides</Link>
              <Link href="/reports" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Reports</Link>
              <Link href="/data" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Data</Link>
              <Link href="/about" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>About</Link>
              <Link href="/methodology" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Methodology</Link>
              <Link href="/incidents" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Incidents</Link>
              <Link href="/developers" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Developers</Link>
              <Link href="/badges" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Status Badges</Link>
              <Link href="/report" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Report an Issue</Link>
              <Link href="/contact" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Contact</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "12px" }}>Legal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Link href="/privacy" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Privacy Policy</Link>
              <Link href="/terms" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Terms of Service</Link>
              <Link href="/cookie-policy" style={{ fontSize: "13px", color: "#94A3B8", textDecoration: "none" }}>Cookie Policy</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "12px", color: "#94A3B8" }}>
            © {new Date().getFullYear()} DownForAI. Not affiliated with any AI service provider.
          </div>
          <div style={{ fontSize: "12px", color: "#94A3B8" }}>
            Monitoring 800+ AI services · 100% free · Open data
          </div>
        </div>
      </div>
    </footer>
  );
}
