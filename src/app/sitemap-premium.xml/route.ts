import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

  const urls = services
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
