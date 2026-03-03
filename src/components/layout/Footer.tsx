import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #e5e5e5", marginTop: "48px", padding: "40px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "32px", marginBottom: "32px" }}>

          {/* About */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>DownForAI</div>
            <p style={{ fontSize: "13px", color: "#a3a3a3", lineHeight: 1.6 }}>
              Free, real-time status monitoring for 200+ AI services. Independent and community-driven.
            </p>
          </div>

          {/* Categories */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>Categories</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {CATEGORIES.map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ fontSize: "13px", color: "#a3a3a3", textDecoration: "none" }}>
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>Resources</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Link href="/about" style={{ fontSize: "13px", color: "#a3a3a3", textDecoration: "none" }}>About</Link>
              <Link href="/incidents" style={{ fontSize: "13px", color: "#a3a3a3", textDecoration: "none" }}>Incidents</Link>
              <Link href="/report" style={{ fontSize: "13px", color: "#a3a3a3", textDecoration: "none" }}>Report an Issue</Link>
              <Link href="/contact" style={{ fontSize: "13px", color: "#a3a3a3", textDecoration: "none" }}>Contact</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#171717", marginBottom: "12px" }}>Legal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Link href="/privacy" style={{ fontSize: "13px", color: "#a3a3a3", textDecoration: "none" }}>Privacy Policy</Link>
              <Link href="/terms" style={{ fontSize: "13px", color: "#a3a3a3", textDecoration: "none" }}>Terms of Service</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "12px", color: "#a3a3a3" }}>
            © {new Date().getFullYear()} DownForAI. Not affiliated with any AI service provider.
          </div>
          <div style={{ fontSize: "12px", color: "#a3a3a3" }}>
            Monitoring 200+ AI services · 100% free · Open data
          </div>
        </div>
      </div>
    </footer>
  );
}
