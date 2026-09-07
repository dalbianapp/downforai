import { put, get } from "@vercel/blob";

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
  try {
    const result = await get(pathname, { access: "public" });
    if (!result || result.statusCode !== 200) return null;
    return (await new Response(result.stream).json()) as T;
  } catch {
    // BlobNotFoundError (first deploy before the cron has run once) or any
    // transient Blob error — callers treat a null snapshot as "not ready yet".
    return null;
  }
}
