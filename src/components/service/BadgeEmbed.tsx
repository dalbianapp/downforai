"use client";

import { useState } from "react";

interface BadgeEmbedProps {
  serviceSlug: string;
  serviceName: string;
}

export default function BadgeEmbed({ serviceSlug, serviceName }: BadgeEmbedProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const badgeUrl = `https://downforai.com/api/badge/${serviceSlug}.svg`;
  const linkUrl = `https://downforai.com/${serviceSlug}`;

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

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#171717", margin: 0 }}>
          Embed status badge
        </h3>
        <span style={{ fontSize: "12px", color: "#737373" }}>
          Add to your README, docs, or dashboard
        </span>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Preview */}
        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "12px", color: "#525252", display: "block", marginBottom: "8px" }}>
            Preview
          </span>
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={badgeUrl} alt={`${serviceName} status`} style={{ height: "20px" }} />
          </a>
        </div>

        {/* Markdown */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#525252" }}>Markdown</span>
            <button
              onClick={() => handleCopy(markdown, "md")}
              style={{
                fontSize: "12px",
                color: copied === "md" ? "#16a34a" : "#2563eb",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px 8px",
              }}
            >
              {copied === "md" ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <div
            style={{
              background: "#f5f5f5",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              padding: "10px 14px",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#171717",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {markdown}
          </div>
        </div>

        {/* HTML */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#525252" }}>HTML</span>
            <button
              onClick={() => handleCopy(html, "html")}
              style={{
                fontSize: "12px",
                color: copied === "html" ? "#16a34a" : "#2563eb",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px 8px",
              }}
            >
              {copied === "html" ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <div
            style={{
              background: "#f5f5f5",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              padding: "10px 14px",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#171717",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {html}
          </div>
        </div>
      </div>
    </section>
  );
}
