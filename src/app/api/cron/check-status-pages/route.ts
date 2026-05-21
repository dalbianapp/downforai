import { NextResponse } from "next/server";
import { sendTelegramAlert } from "@/lib/notifications/telegram";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Set to true during debugging to skip Telegram sends
const DRY_RUN = false;

// Atlassian Statuspage services — use JSON API, check indicator field
const ATLASSIAN_PAGES = [
  { slug: "openai",         name: "OpenAI",         url: "https://status.openai.com/api/v2/status.json" },
  { slug: "chatgpt",        name: "ChatGPT",         url: "https://status.openai.com/api/v2/status.json" },
  { slug: "anthropic",      name: "Anthropic",       url: "https://status.claude.com/api/v2/status.json" },
  { slug: "claude-chat",    name: "Claude",          url: "https://status.claude.com/api/v2/status.json" },
  { slug: "github-copilot", name: "GitHub Copilot",  url: "https://www.githubstatus.com/api/v2/status.json" },
  { slug: "midjourney",     name: "Midjourney",      url: "https://status.midjourney.com/api/v2/status.json" },
];

// Google Cloud — custom incidents.json (no Atlassian endpoint)
const GOOGLE_CLOUD = {
  slug: "google-gemini",
  name: "Google Gemini / Cloud",
  url: "https://status.cloud.google.com/incidents.json",
};

// In-memory cooldown — resets on cold start, acceptable for our use case
const lastAlerted: Record<string, number> = {};
const COOLDOWN_MS = 30 * 60 * 1000; // 30 min between alerts for the same service

async function maybeAlert(slug: string, _name: string, message: string, alerts: string[]) {
  const now = Date.now();
  const lastAlert = lastAlerted[slug] ?? 0;
  if (now - lastAlert <= COOLDOWN_MS) return;

  lastAlerted[slug] = now;
  alerts.push(slug);

  if (!DRY_RUN) {
    await sendTelegramAlert(message);
  } else {
    console.log(`[status-pages] DRY_RUN — would alert: ${slug} — ${message.slice(0, 80)}`);
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts: string[] = [];
  const results: Record<string, { indicator?: string; ok: boolean; error?: string }> = {};

  // --- Atlassian Statuspage (JSON /api/v2/status.json) ---
  // Deduplicate URLs so openai+chatgpt only fetch once
  const fetched = new Map<string, { indicator: string; description: string }>();

  for (const page of ATLASSIAN_PAGES) {
    try {
      let data = fetched.get(page.url);
      if (!data) {
        const res = await fetch(page.url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; DownForAI/1.0)" },
          signal: AbortSignal.timeout(5000),
          redirect: "follow",
        });

        // Non-2xx (e.g. 404 for Midjourney) — endpoint unavailable, stay silent
        if (!res.ok) {
          console.log(`[status-pages] ${page.slug}: HTTP ${res.status} — endpoint unavailable, skipping`);
          results[page.slug] = { ok: true, error: `HTTP ${res.status} — no data` };
          continue;
        }

        const json = await res.json() as { status?: { indicator?: string; description?: string } };

        // Guard: JSON must have the expected shape, otherwise stay silent
        const indicator = json?.status?.indicator;
        const description = json?.status?.description ?? "";
        if (typeof indicator !== "string") {
          console.log(`[status-pages] ${page.slug}: unexpected JSON shape — skipping`);
          results[page.slug] = { ok: true, error: "unexpected JSON shape" };
          continue;
        }

        data = { indicator, description };
        fetched.set(page.url, data);
      }

      results[page.slug] = { indicator: data.indicator, ok: data.indicator === "none" };

      // Only alert when indicator is explicitly non-operational
      if (data.indicator !== "none") {
        await maybeAlert(
          page.slug,
          page.name,
          `🚨 <b>STATUS PAGE ALERT — ${page.name}</b>\n\n` +
          `Official status: ${data.description} (${data.indicator})\n` +
          `Source: ${page.url.replace("/api/v2/status.json", "")}\n\n` +
          `→ https://downforai.com/${page.slug}`,
          alerts
        );
      }
    } catch (error) {
      // Network error, timeout, JSON parse error — stay silent
      console.error(`[status-pages] ${page.slug}: fetch error — ${error}`);
      results[page.slug] = { ok: true, error: String(error) };
    }
  }

  // --- Google Cloud (incidents.json — check for open incidents) ---
  try {
    const res = await fetch(GOOGLE_CLOUD.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DownForAI/1.0)" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.log(`[status-pages] ${GOOGLE_CLOUD.slug}: HTTP ${res.status} — endpoint unavailable, skipping`);
      results[GOOGLE_CLOUD.slug] = { ok: true, error: `HTTP ${res.status} — no data` };
    } else {
      const json = await res.json();
      // Guard: must be a non-empty array
      if (!Array.isArray(json)) {
        console.log(`[status-pages] ${GOOGLE_CLOUD.slug}: unexpected response shape — skipping`);
        results[GOOGLE_CLOUD.slug] = { ok: true, error: "unexpected response shape" };
      } else {
        const incidents = json as Array<{ end?: string; external_desc?: string }>;
        // An open incident has no "end" field or end is in the future
        const openIncidents = incidents.filter(
          (i) => !i.end || new Date(i.end).getTime() > Date.now()
        );

        results[GOOGLE_CLOUD.slug] = { ok: openIncidents.length === 0 };

        if (openIncidents.length > 0) {
          const latest = openIncidents[0];
          await maybeAlert(
            GOOGLE_CLOUD.slug,
            GOOGLE_CLOUD.name,
            `🚨 <b>STATUS PAGE ALERT — ${GOOGLE_CLOUD.name}</b>\n\n` +
            `Open incident: ${(latest.external_desc ?? "unknown").slice(0, 120)}\n` +
            `Source: ${GOOGLE_CLOUD.url}\n\n` +
            `→ https://downforai.com/${GOOGLE_CLOUD.slug}`,
            alerts
          );
        }
      }
    }
  } catch (error) {
    // Network error, timeout — stay silent
    console.error(`[status-pages] ${GOOGLE_CLOUD.slug}: fetch error — ${error}`);
    results[GOOGLE_CLOUD.slug] = { ok: true, error: String(error) };
  }

  return NextResponse.json({
    ok: true,
    dry_run: DRY_RUN,
    checked: ATLASSIAN_PAGES.length + 1,
    alerts,
    results,
    timestamp: new Date().toISOString(),
  });
}
