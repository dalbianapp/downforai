"use client";

import Link from "next/link";

interface BackToServiceButtonProps {
  href: string;
  serviceName: string;
}

export function BackToServiceButton({ href, serviceName }: BackToServiceButtonProps) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#2563eb",
        textDecoration: "none",
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid #e0e7ff",
        background: "#eff6ff",
        marginBottom: "24px",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#dbeafe";
        e.currentTarget.style.borderColor = "#bfdbfe";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#eff6ff";
        e.currentTarget.style.borderColor = "#e0e7ff";
      }}
    >
      <span>←</span>
      <span>View full {serviceName} status</span>
    </Link>
  );
}
