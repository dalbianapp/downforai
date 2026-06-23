import { NextRequest, NextResponse } from "next/server";
import { type ServiceStatus } from "@prisma/client";
import { getDisplayStatusMap } from "@/lib/status/getDisplayStatus";

// NOTE: intentionally NOT `dynamic = "force-dynamic"`. The handler is already
// dynamic (reads ?services from request.url), and force-dynamic makes Vercel drop
// our s-maxage so the CDN never caches the badge — every render would hit Neon.
// Without it, Vercel honours the Cache-Control below and caches per-URL at the edge.

const CACHE_SECONDS = 120; // 2 min — within the 60–300s target
const MAX_SERVICES = 25;   // guard against abuse / oversized requests

// Aggregated severity for an "AI dependencies" badge. Worst wins:
// outage > degraded > unknown > operational. UNKNOWN (incl. an unknown slug or a
// service we had to drop) beats operational on purpose — we never claim "all deps
// OK" if one can't be verified.
type Severity = "operational" | "unknown" | "degraded" | "outage";
const RANK: Record<Severity, number> = { operational: 0, unknown: 1, degraded: 2, outage: 3 };

const SEVERITY_STYLE: Record<Severity, { bg: string; label: string; dot: string }> = {
  operational: { bg: "#22c55e", label: "operational", dot: "#22c55e" },
  degraded:    { bg: "#f59e0b", label: "degraded",    dot: "#f59e0b" },
  outage:      { bg: "#ef4444", label: "outage",      dot: "#ef4444" },
  unknown:     { bg: "#6b7280", label: "unknown",     dot: "#9ca3af" },
};

function severityOf(status: ServiceStatus): Severity {
  if (status === "OUTAGE") return "outage";
  if (status === "DEGRADED") return "degraded";
  if (status === "OPERATIONAL") return "operational";
  return "unknown";
}

// Escape every dynamic string before it touches the SVG (label is user-controlled).
function esc(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c] as string),
  );
}

// shields.io-like flat badge. No tracking, no external refs.
function flatBadge(label: string, value: string, bg: string): string {
  const L = esc(label);
  const V = esc(value);
  const lw = Math.round(L.length * 6.5 + 14);
  const vw = Math.round(V.length * 6.5 + 14);
  const w = lw + vw;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${L}: ${V}">
  <title>${L}: ${V}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${w}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="20" fill="#555"/>
    <rect x="${lw}" width="${vw}" height="20" fill="${bg}"/>
    <rect width="${w}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${lw / 2}" y="14" fill="#010101" fill-opacity=".3">${L}</text>
    <text x="${lw / 2}" y="13">${L}</text>
    <text x="${lw + vw / 2}" y="14" fill="#010101" fill-opacity=".3">${V}</text>
    <text x="${lw + vw / 2}" y="13">${V}</text>
  </g>
</svg>`;
}

// Compact variant: a single pill with a coloured status dot + "{label}".
function compactBadge(label: string, dot: string): string {
  const L = esc(label);
  const w = Math.round(L.length * 6.5 + 30);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${L}">
  <title>${L}</title>
  <clipPath id="r"><rect width="${w}" height="20" rx="10" fill="#fff"/></clipPath>
  <g clip-path="url(#r)"><rect width="${w}" height="20" fill="#1e293b"/></g>
  <circle cx="11" cy="10" r="4" fill="${dot}"/>
  <g fill="#fff" text-anchor="start" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="20" y="14">${L}</text>
  </g>
</svg>`;
}

function svgResponse(svg: string, cacheSeconds = CACHE_SECONDS, httpStatus = 200): NextResponse {
  return new NextResponse(svg, {
    status: httpStatus,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds}`,
    },
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const style = url.searchParams.get("style") === "compact" ? "compact" : "flat";
  // Strip control chars (XML 1.0 forbids them) before length-capping the label.
  const rawLabel =
    (url.searchParams.get("label") ?? "AI deps").replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 40) || "AI deps";

  // Parse + sanitise the services list. Never throw — a broken badge helps no one.
  const validSlugs = [
    ...new Set(
      (url.searchParams.get("services") ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => /^[a-z0-9-]{1,64}$/.test(s)),
    ),
  ];
  // If the caller listed more than we evaluate, the dropped ones are "not verified"
  // → seed worst at "unknown" so the badge can never falsely claim all-operational.
  const truncated = validSlugs.length > MAX_SERVICES;
  const slugs = validSlugs.slice(0, MAX_SERVICES);

  const render = (worst: Severity) => {
    const st = SEVERITY_STYLE[worst];
    return style === "compact" ? compactBadge(rawLabel, st.dot) : flatBadge(rawLabel, st.label, st.bg);
  };

  try {
    if (slugs.length === 0) {
      return svgResponse(render("unknown"), 60);
    }

    // Single site-wide derivation (current state + official-prime + community).
    const statuses = await getDisplayStatusMap(slugs);

    // Worst-of across every REQUESTED slug. A slug not in the DB → unknown.
    let worst: Severity = truncated ? "unknown" : "operational";
    for (const slug of slugs) {
      const entry = statuses.get(slug);
      const sev: Severity = entry ? severityOf(entry.display.status) : "unknown";
      if (RANK[sev] > RANK[worst]) worst = sev;
    }

    return svgResponse(render(worst));
  } catch (error) {
    console.error("[badge/stack] error:", error);
    return svgResponse(render("unknown"), 60);
  }
}
