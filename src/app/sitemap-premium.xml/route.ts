import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Editorial pages added directly as static URLs (no DB lookup needed)
const EDITORIAL_PATHS = [
  "/reports/ai-outages-may-2026",
  "/guides",
  "/guides/ai-api-uptime-comparison-2026",
  "/guides/chatgpt-down-alternatives",
  "/guides/how-to-monitor-ai-api-status",
  "/guides/ai-outage-patterns",
  "/guides/cost-of-ai-downtime",
  "/guides/openai-vs-anthropic-vs-google-reliability",
  "/guides/free-ai-monitoring-tools",
  "/data",
  "/about",
];

const PREMIUM_SLUGS = [
  "openai", "anthropic", "google-gemini", "deepseek", "perplexity",
  "xai-grok", "midjourney", "suno", "groq", "mistral",
  "hugging-face", "replicate", "together-ai", "elevenlabs", "runway",
  "stability-ai", "cursor", "replit", "github-copilot", "ollama",
  "meta-llama", "cohere", "character-ai", "poe", "adobe-firefly",
  "microsoft-copilot", "claude", "chatgpt", "kling-ai", "lovable",
  "moonshot-kimi", "sora", "viggle", "grok-imagine", "krea-ai",
  "google-ai-studio", "quillbot", "vast-ai", "baidu-ai-cloud", "candy-ai",
  "magnific", "lmarena", "cerebras", "sillytavern", "crushon-ai",
  "genspark", "devin", "tripo3d", "voicemod", "n8n",
  "civitai", "chai-ai", "databricks", "chub-ai", "kiro", "nvidia-nim",
  // Sports Betting AI (20 services)
  "oddsjam", "forebet", "rithmm", "leans-ai", "zcode-system",
  "bettingpros-sharp-ai", "betideas", "sports-ai", "deepbetting",
  "sportsline", "betql", "dimers", "action-network", "sharp-app",
  "juice-reel", "accuscore", "rebelbetting", "parlay-savant",
  "sportbot-ai", "pandascore",
];

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://downforai.com";

  const services = await prisma.service.findMany({
    where: { slug: { in: PREMIUM_SLUGS } },
    select: { slug: true, updatedAt: true },
  });

  const foundSlugs = services.map((s) => s.slug);
  const missingSlugs = PREMIUM_SLUGS.filter((s) => !foundSlugs.includes(s));
  if (missingSlugs.length > 0) {
    console.warn("[sitemap-premium] slugs not found in DB:", missingSlugs);
  }

  const serviceUrls = services
    .map(
      (s) => `
  <url>
    <loc>${baseUrl}/${s.slug}</loc>
    <lastmod>${s.updatedAt.toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`
    )
    .join("");

  const editorialUrls = EDITORIAL_PATHS.map(
    (path) => `
  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${serviceUrls}${editorialUrls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
