import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

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
];

export async function GET() {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const services = await prisma.service.findMany({
    where: { slug: { in: PREMIUM_SLUGS } },
    include: {
      surfaces: {
        where: { isEnabled: true },
        include: {
          observations: {
            where: { observedAt: { gte: since30d } },
            orderBy: { observedAt: "desc" },
            take: 3000,
          },
        },
      },
      _count: {
        select: {
          incidents: {
            where: { startedAt: { gte: since30d } },
          },
        },
      },
    },
  });

  const data = services
    .map((service) => {
      const allObs = service.surfaces.flatMap((s) => s.observations);

      const obs24h = allObs.filter((o) => o.observedAt >= since24h);
      const obs7d = allObs.filter((o) => o.observedAt >= since7d);

      const uptime = (obs: typeof allObs) => {
        if (obs.length === 0) return null;
        const operational = obs.filter((o) => o.status === "OPERATIONAL").length;
        return parseFloat(((operational / obs.length) * 100).toFixed(4));
      };

      const latencies = allObs
        .map((o) => o.latencyMs)
        .filter((l): l is number => l !== null && l > 0)
        .sort((a, b) => a - b);

      const p50 =
        latencies.length > 0
          ? latencies[Math.floor(latencies.length * 0.5)]
          : null;
      const p95 =
        latencies.length > 0
          ? latencies[Math.floor(latencies.length * 0.95)]
          : null;

      return {
        slug: service.slug,
        name: service.name,
        category: service.category,
        uptime_24h: uptime(obs24h),
        uptime_7d: uptime(obs7d),
        uptime_30d: uptime(allObs),
        latency_p50_ms: p50,
        latency_p95_ms: p95,
        incidents_30d: service._count.incidents,
        observations_count: allObs.length,
        url: `https://downforai.com/${service.slug}`,
        badge: `https://downforai.com/api/badge/${service.slug}.svg`,
      };
    })
    .sort((a, b) => (b.uptime_30d ?? 0) - (a.uptime_30d ?? 0));

  return NextResponse.json(
    {
      generated_at: new Date().toISOString(),
      source: "https://downforai.com/reliability-index",
      license: "CC-BY-4.0",
      services: data,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}
