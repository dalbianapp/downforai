"use client";

import Link from "next/link";
import { useState } from "react";

interface BadgeEmbedProps {
  serviceSlug: string;
  serviceName: string;
}

export default function BadgeEmbed({ serviceSlug, serviceName }: BadgeEmbedProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const badgeUrl = `https://downforai.com/api/badge/${serviceSlug}.svg`;
  const linkUrl = `https://downforai.com/${serviceSlug}`;

  // Markdown/HTML point at the service page → a clickable badge = a backlink.
  const markdown = `[![${serviceName} status](${badgeUrl})](${linkUrl})`;
  const html = `<a href="${linkUrl}"><img src="${badgeUrl}" alt="${serviceName} status" /></a>`;

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const codeBox: React.CSSProperties = {
    background: "#f5f5f5",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    padding: "10px 14px",
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#171717",
    overflowX: "auto",
    whiteSpace: "nowrap",
  };
  const copyBtn = (type: string): React.CSSProperties => ({
    fontSize: "12px",
    color: copied === type ? "#16a34a" : "#2563eb",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px 8px",
  });

  return (
    // Collapsible + low on the page: discreet, but the live badge preview shows in
    // the summary even when collapsed (the adoption hook). Content stays in the DOM
    // so the internal link to /badges is crawlable.
    <details
      style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", overflow: "hidden" }}
    >
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt={`${serviceName} status`} style={{ height: "20px", flexShrink: 0 }} />
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#171717" }}>Embed this status badge</span>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#737373", whiteSpace: "nowrap" }}>
          README · docs ▾
        </span>
      </summary>

      <div style={{ padding: "0 20px 16px", borderTop: "1px solid #f0f0f0" }}>
        {/* Markdown */}
        <div style={{ margin: "14px 0 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#525252" }}>Markdown</span>
            <button onClick={() => handleCopy(markdown, "md")} style={copyBtn("md")}>
              {copied === "md" ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <div style={codeBox}>{markdown}</div>
        </div>

        {/* HTML */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#525252" }}>HTML</span>
            <button onClick={() => handleCopy(html, "html")} style={copyBtn("html")}>
              {copied === "html" ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <div style={codeBox}>{html}</div>
        </div>

        {/* More options → the generator page (single internal link, crawlable) */}
        <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f5f5f5" }}>
          <Link href="/badges" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
            More badge options (stack, compact, open dataset) →
          </Link>
        </div>
      </div>
    </details>
  );
}
