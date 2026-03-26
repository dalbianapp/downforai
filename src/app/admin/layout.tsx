"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavStats {
  pendingComments: number;
  reportsToday: number;
  activeIncidents: number;
}

function Badge({ n, color }: { n: number; color: string }) {
  if (!n) return null;
  return (
    <span style={{
      marginLeft: "4px", fontSize: "10px", fontWeight: 700,
      padding: "1px 5px", borderRadius: "10px",
      background: color, color: "#fff", lineHeight: 1.4,
    }}>
      {n > 99 ? "99+" : n}
    </span>
  );
}

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/comments", label: "Comments", badgeKey: "pendingComments" as const, badgeColor: "#ca8a04" },
  { href: "/admin/reports", label: "Reports", badgeKey: "reportsToday" as const, badgeColor: "#2563eb" },
  { href: "/admin/incidents", label: "Incidents", badgeKey: "activeIncidents" as const, badgeColor: "#dc2626" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navStats, setNavStats] = useState<NavStats>({ pendingComments: 0, reportsToday: 0, activeIncidents: 0 });

  useEffect(() => {
    const load = () =>
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then((d) => setNavStats({ pendingComments: d.pendingComments || 0, reportsToday: d.reportsToday || 0, activeIncidents: d.activeIncidents || 0 }))
        .catch(() => {});
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Top bar */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "0 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "52px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Logo */}
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#f8fafc", marginRight: "12px", letterSpacing: "-0.01em" }}>
              ↓ DownForAI
            </span>
            <span style={{ color: "#334155", fontSize: "14px" }}>|</span>
            <nav style={{ display: "flex", gap: "2px", marginLeft: "8px" }}>
              {NAV.map((item) => {
                const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const badgeCount = item.badgeKey ? navStats[item.badgeKey] : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "5px 12px",
                      borderRadius: "7px",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#f8fafc" : "#94a3b8",
                      background: isActive ? "#1e293b" : "transparent",
                      textDecoration: "none",
                      transition: "all 0.1s",
                    }}
                  >
                    {item.label}
                    {item.badgeKey && <Badge n={badgeCount} color={item.badgeColor!} />}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <a
              href="https://www.statut-services.fr/admin"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "12px", color: "#64748b", textDecoration: "none" }}
            >
              Admin FR ↗
            </a>
            <Link href="/" style={{ fontSize: "12px", color: "#64748b", textDecoration: "none" }}>
              ← Site
            </Link>
            <button
              onClick={handleLogout}
              style={{ fontSize: "12px", color: "#64748b", background: "none", border: "1px solid #1e293b", borderRadius: "6px", cursor: "pointer", padding: "4px 10px" }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 20px" }}>
        {children}
      </div>
    </div>
  );
}
