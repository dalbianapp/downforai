"use client";

export function InteractiveLink({ href, children, color = "#a3a3a3", hoverColor = "#2563eb", ...props }: { href: string; children: React.ReactNode; color?: string; hoverColor?: string }) {
  return (
    <a
      href={href}
      style={{ color, textDecoration: "none" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = color; }}
      {...props}
    >
      {children}
    </a>
  );
}
