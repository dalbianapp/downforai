"use client";

export function CTAButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        padding: '10px 24px',
        background: '#2563eb',
        color: '#ffffff',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 600,
        textDecoration: 'none',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb'; }}
    >
      {children}
    </a>
  );
}
