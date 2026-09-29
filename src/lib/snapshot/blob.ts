import { put, get, BlobNotFoundError } from "@vercel/blob";

// Thin wrapper around Vercel Blob for JSON snapshots: deterministic
// pathnames, overwritten in place every hour by the snapshot cron — this
// replaces the Prisma calls that used to run on every page regeneration.

export async function putJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    // Store was provisioned in public mode (Vercel Blob's default; private
    // stores need an explicit private configuration). Not a real exposure:
    // pathnames aren't linked anywhere and the content (status, uptime,
    // already-moderated public comments) is the same data the site already
    // renders publicly on every service page.
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 3600, // matches the hourly write cadence
  });
}

export async function getJson<T>(pathname: string): Promise<T | null> {
  // Only a genuine BlobNotFoundError means "not ready yet" (first deploy
  // before the cron has run once) -> null, which callers turn into
  // notFound(). Any other error (rate limit, timeout, transient 5xx) is
  // retried a couple of times and, if still failing, rethrown instead of
  // being swallowed into null: with revalidate=21600 on the pages that call
  // this, a silently-swallowed transient error used to get baked in as a
  // cached 404 for up to 6h (root cause of the Sept 2026 deepseek/runpod/
  // dreamina 404s — one bad regeneration, then stuck until the next window).
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await get(pathname, { access: "public" });
      if (!result || result.statusCode !== 200) return null;
      return (await new Response(result.stream).json()) as T;
    } catch (err) {
      if (err instanceof BlobNotFoundError) return null;
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 200 * attempt));
    }
  }
  return null;
}
