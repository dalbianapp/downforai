"use client";

import { useMemo, useState } from "react";

type Svc = { slug: string; name: string };
type Format = "single" | "stack" | "compact";

const ACCENT = "var(--accent)";
const BORDER = "#E2E8F0";
const INK = "#0F172A";
const MUTED = "#64748B";

export default function BadgeGenerator({ services }: { services: Svc[] }) {
  const [selected, setSelected] = useState<Svc[]>([]);
  const [format, setFormat] = useState<Format>("stack");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const picked = new Set(selected.map((s) => s.slug));
    return services
      .filter((s) => !picked.has(s.slug) && (s.slug.includes(q) || s.name.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [query, services, selected]);

  const showList = focused && matches.length > 0;

  function add(s: Svc) {
    setSelected((prev) => (prev.some((x) => x.slug === s.slug) ? prev : [...prev, s]));
    setQuery("");
  }
  function remove(slug: string) {
    setSelected((prev) => prev.filter((s) => s.slug !== slug));
  }

  const single = selected[0];

  const { badgeSrc, markdown } = useMemo(() => {
    if (selected.length === 0) return { badgeSrc: "", markdown: "" };
    const list = selected.map((s) => s.slug).join(",");
    if (format === "single") {
      return {
        badgeSrc: `/api/badge/${single.slug}.svg`,
        markdown: `[![${single.name} status](https://downforai.com/api/badge/${single.slug}.svg)](https://downforai.com/${single.slug})`,
      };
    }
    if (format === "compact") {
      return {
        badgeSrc: `/api/badge/stack?services=${list}&style=compact`,
        markdown: `[![AI dependencies](https://downforai.com/api/badge/stack?services=${list}&style=compact)](https://downforai.com/)`,
      };
    }
    return {
      badgeSrc: `/api/badge/stack?services=${list}`,
      markdown: `[![AI dependencies status](https://downforai.com/api/badge/stack?services=${list})](https://downforai.com/)`,
    };
  }, [selected, format, single]);

  function copy() {
    if (!markdown) return;
    const done = () => { setCopied("ok"); setTimeout(() => setCopied("idle"), 1800); };
    const fail = () => { setCopied("fail"); setTimeout(() => setCopied("idle"), 2500); };
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(markdown).then(done).catch(() => fallbackCopy(markdown) ? done() : fail());
      } else {
        fallbackCopy(markdown) ? done() : fail();
      }
    } catch {
      fail();
    }
  }

  const box: React.CSSProperties = { border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "20px", background: "#fff" };

  return (
    <div style={box}>
      {/* Format selector */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {([
          ["stack", "AI dependencies (stack)"],
          ["single", "Single service"],
          ["compact", "Compact dot"],
        ] as [Format, string][]).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            style={{
              padding: "7px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              border: `1px solid ${format === f ? ACCENT : BORDER}`,
              background: format === f ? ACCENT : "#fff",
              color: format === f ? "#fff" : MUTED,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Autocomplete */}
      <label htmlFor="badge-search" style={{ fontSize: "13px", fontWeight: 600, color: INK }}>
        {format === "single" ? "Pick a service" : "Add your AI dependencies"}
      </label>
      <div style={{ position: "relative", marginTop: "6px" }}>
        <input
          id="badge-search"
          role="combobox"
          aria-expanded={showList}
          aria-controls="badge-suggestions"
          aria-autocomplete="list"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches[0]) { e.preventDefault(); add(matches[0]); }
            else if (e.key === "Escape") setFocused(false);
          }}
          placeholder="Search 800+ services (e.g. openai, claude, midjourney)…"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: "8px", fontSize: "14px" }}
        />
        {showList && (
          <div id="badge-suggestions" role="listbox" style={{ position: "absolute", zIndex: 10, top: "44px", left: 0, right: 0, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px", boxShadow: "0 6px 20px rgba(15,23,42,0.10)", overflow: "hidden" }}>
            {matches.map((s) => (
              <button
                key={s.slug}
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault() /* keep focus so onBlur doesn't fire first */}
                onClick={() => add(s)}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", border: "none", background: "#fff", cursor: "pointer", fontSize: "14px", color: INK }}
              >
                {s.name} <span style={{ color: MUTED, fontSize: "12px" }}>· {s.slug}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
          {selected.map((s, i) => {
            const dimmed = format === "single" && i > 0;
            return (
              <span
                key={s.slug}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px",
                  background: dimmed ? "#F1F5F9" : "#EEF2FF",
                  color: dimmed ? "#94A3B8" : "#3730A3",
                  border: `1px solid ${BORDER}`, borderRadius: "999px", padding: "4px 10px",
                }}
              >
                {s.name}
                <button onClick={() => remove(s.slug)} aria-label={`Remove ${s.name}`} style={{ border: "none", background: "transparent", cursor: "pointer", color: "inherit", fontSize: "14px", lineHeight: 1 }}>×</button>
              </span>
            );
          })}
        </div>
      )}

      {/* Single-mode disambiguation (visible, not hover-only) */}
      {format === "single" && selected.length > 1 && (
        <p style={{ marginTop: "8px", fontSize: "12px", color: MUTED }}>
          Single badge uses <strong>{single.name}</strong> (the first one added). Remove the others to change it.
        </p>
      )}

      {/* Live preview + markdown */}
      {selected.length > 0 ? (
        <>
          <div style={{ marginTop: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={badgeSrc} alt="badge preview" style={{ height: "20px" }} />
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "stretch" }}>
            <code style={{ flex: 1, userSelect: "all", background: "#0F172A", color: "#E2E8F0", padding: "12px 14px", borderRadius: "8px", fontSize: "12px", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {markdown}
            </code>
            <button
              onClick={copy}
              style={{ flexShrink: 0, padding: "0 16px", borderRadius: "8px", border: `1px solid ${copied === "ok" ? "#16A34A" : copied === "fail" ? "#DC2626" : ACCENT}`, background: copied === "ok" ? "#F0FDF4" : copied === "fail" ? "#FEF2F2" : ACCENT, color: copied === "ok" ? "#16A34A" : copied === "fail" ? "#DC2626" : "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {copied === "ok" ? "✓ Copied" : copied === "fail" ? "Copy failed — select it" : "Copy"}
            </button>
          </div>
        </>
      ) : (
        <p style={{ marginTop: "16px", fontSize: "13px", color: MUTED }}>
          Add one or more services to generate a live badge and copy-paste Markdown.
        </p>
      )}
    </div>
  );
}

// Legacy clipboard fallback (insecure context / permission denied), mirroring
// the existing pattern in BadgeEmbed.tsx. Returns true on success.
function fallbackCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
