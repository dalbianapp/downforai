// Legacy routes permanently removed (410 Gone). The old per-service
// /[slug]/down, /[slug]/error/[errorSlug] and /[slug]/[symptom] pages drove
// almost no traffic and wasted crawl budget — the middleware now returns 410
// for them instead of redirecting. Shared here so middleware and any tooling
// use one source of truth (next.config no longer needs these).

// All valid symptom slugs — an EXPLICIT allowlist so we never 410 a real route
// (e.g. /category/llm: "llm" is not a symptom; and "category" is reserved below).
export const SYMPTOM_SLUGS = [
  "api-error",
  "authentication-failed",
  "completion-not-working",
  "connection-failed",
  "deployment-failed",
  "export-failed",
  "extension-broken",
  "generation-failed",
  "gpu-unavailable",
  "login-issue",
  "maintenance",
  "model-error",
  "network-error",
  "not-generating",
  "not-working",
  "queue-full",
  "quota-exceeded",
  "rate-limit",
  "server-error",
  "service-unavailable",
  "slow-rendering",
  "slow-response",
  "sync-error",
  "task-failed",
  "timeout",
  "transcription-failed",
] as const;

const SYMPTOM_SET: ReadonlySet<string> = new Set(SYMPTOM_SLUGS);

// First-path-segments that are real top-level routes, never a service slug.
// Belt-and-suspenders so a 2-segment reserved route (e.g. /errors/rate-limit,
// where "rate-limit" IS a symptom slug) is never mistaken for a removed page.
export const RESERVED_PREFIXES: ReadonlySet<string> = new Set([
  "about", "admin", "api", "badges", "category", "contact", "cookie-policy",
  "data", "developers", "errors", "guides", "incidents", "methodology",
  "privacy", "reliability", "reliability-index", "report", "reports",
  "terms", "top-outages",
]);

/**
 * True only for the permanently-removed legacy page shapes:
 *   /[slug]/down · /[slug]/[symptom] · /[slug]/error/[errorSlug]
 * Never matches a real service page (/[slug], 1 segment) or any reserved route.
 */
export function isLegacyGoneRoute(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return false;          // "/" or "/[slug]" → keep
  if (RESERVED_PREFIXES.has(parts[0])) return false;

  if (parts.length === 2) {
    return parts[1] === "down" || SYMPTOM_SET.has(parts[1]);
  }
  if (parts.length === 3) {
    return parts[1] === "error";               // /[slug]/error/[errorSlug]
  }
  return false;
}
