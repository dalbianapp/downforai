import { NextResponse } from "next/server";
import { sendTelegramAlert } from "@/lib/notifications/telegram";

const STATUS_PAGES = [
  {
    slug: "openai",
    name: "OpenAI",
    url: "https://status.openai.com",
    selector: "All Systems Operational",
  },
  {
    slug: "chatgpt",
    name: "ChatGPT",
    url: "https://status.openai.com",
    selector: "All Systems Operational",
  },
  {
    slug: "anthropic",
    name: "Anthropic",
    url: "https://status.anthropic.com",
    selector: "All Systems Operational",
  },
  {
    slug: "claude-chat",
    name: "Claude",
    url: "https://status.anthropic.com",
    selector: "All Systems Operational",
  },
  {
    slug: "github-copilot",
    name: "GitHub Copilot",
    url: "https://www.githubstatus.com",
    selector: "All Systems Operational",
  },
  {
    slug: "google-gemini",
    name: "Google Gemini",
    url: "https://status.cloud.google.com",
    selector: "Available",
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    url: "https://status.midjourney.com",
    selector: "All Systems Operational",
  },
];

// In-memory cooldown — resets on cold start, which is acceptable
const lastAlerted: Record<string, number> = {};
const COOLDOWN_MS = 30 * 60 * 1000; // 30 min between alerts for the same service

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts: string[] = [];

  for (const page of STATUS_PAGES) {
    try {
      const response = await fetch(page.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DownForAI/1.0)" },
        signal: AbortSignal.timeout(5000),
      });
      const html = await response.text();
      const isHealthy = html.includes(page.selector);

      if (!isHealthy) {
        const now = Date.now();
        const lastAlert = lastAlerted[page.slug] ?? 0;

        if (now - lastAlert > COOLDOWN_MS) {
          lastAlerted[page.slug] = now;
          await sendTelegramAlert(
            `🚨 <b>STATUS PAGE ALERT — ${page.name}</b>\n\n` +
            `Official status page no longer shows "${page.selector}"\n` +
            `Source: ${page.url}\n\n` +
            `→ https://downforai.com/${page.slug}`
          );
          alerts.push(page.slug);
        }
      }
    } catch (error) {
      console.error(`[status-pages] Failed to fetch ${page.url}:`, error);
    }
  }

  return NextResponse.json({
    ok: true,
    checked: STATUS_PAGES.length,
    alerts,
    timestamp: new Date().toISOString(),
  });
}
