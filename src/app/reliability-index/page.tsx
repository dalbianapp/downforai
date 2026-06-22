import { Metadata } from "next";
import { MonitoringCapability } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatCategoryLabel } from "@/lib/utils";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Reliability Index — Live Uptime & Latency for 50 AI Services",
  description:
    "Real-time reliability ranking of the 50 most-tracked AI services — part of 800+ monitored by DownForAI. Uptime, latency p50/p95, and incident counts updated hourly.",
  alternates: { canonical: "/reliability-index" },
  robots: { index: true, follow: true },
};

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

async function getReliabilityData() {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const services = await prisma.service.findMany({
    where: {
      slug: { in: PREMIUM_SLUGS },
      monitoringCapability: {
        notIn: [MonitoringCapability.BLOCKED_FROM_PROBES, MonitoringCapability.UNVERIFIABLE],
      },
    },
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

  return services
    .map((service) => {
      const allObs = service.surfaces.flatMap((s) => s.observations);

      const obs24h = allObs.filter((o) => o.observedAt >= since24h);
      const obs7d = allObs.filter((o) => o.observedAt >= since7d);

      const uptime = (obs: typeof allObs) => {
        if (obs.length === 0) return null;
        const operational = obs.filter((o) => o.status === "OPERATIONAL").length;
        return (operational / obs.length) * 100;
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
        uptime24h: uptime(obs24h),
        uptime7d: uptime(obs7d),
        uptime30d: uptime(allObs),
        p50,
        p95,
        incidents30d: service._count.incidents,
        observations: allObs.length,
      };
    })
    .sort((a, b) => (b.uptime30d ?? 0) - (a.uptime30d ?? 0));
}

function UptimeCell({ value }: { value: number | null }) {
  if (value === null) return <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "monospace", color: "#a3a3a3" }}>—</td>;
  const color = value >= 99.9 ? "#16a34a" : value >= 99 ? "#65a30d" : value >= 95 ? "#ca8a04" : "#dc2626";
  return (
    <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "monospace", color }}>
      {value.toFixed(2)}%
    </td>
  );
}

export default async function ReliabilityIndexPage() {
  const data = await getReliabilityData();

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://downforai.com" },
    { name: "AI Reliability Index", url: "https://downforai.com/reliability-index" },
  ]);

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "AI Reliability Index",
    description: "Real-time uptime and latency data for the 50 most-tracked AI services — part of 800+ monitored by DownForAI",
    url: "https://downforai.com/reliability-index",
    creator: {
      "@type": "Organization",
      name: "DownForAI",
      url: "https://downforai.com",
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: "https://downforai.com/api/reliability-index",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
          AI Reliability Index
        </h1>
        <p style={{ fontSize: "16px", color: "#525252", lineHeight: 1.6, marginBottom: "8px" }}>
          Live uptime and latency data for {data.length} major AI services. Updated hourly.
          Ranked by 30-day uptime.
        </p>
        <p style={{ fontSize: "13px", color: "#a3a3a3", lineHeight: 1.5, marginBottom: "24px" }}>
          Network latency (p50/p95) reflects probe endpoint response time — not model inference speed or time-to-first-token.
        </p>

        <div style={{ marginBottom: "24px", display: "flex", gap: "12px", fontSize: "13px", flexWrap: "wrap" }}>
          <a
            href="/api/reliability-index"
            style={{ color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
          >
            JSON API
          </a>
          <span style={{ color: "#a3a3a3" }}>·</span>
          <Link
            href="/methodology"
            style={{ color: "#2563eb", textDecoration: "none" }}
          >
            Methodology
          </Link>
          <span style={{ color: "#a3a3a3" }}>·</span>
          <Link
            href="/badges"
            style={{ color: "#2563eb", textDecoration: "none" }}
          >
            Status badges
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #e5e5e5",
                  textAlign: "left",
                  background: "#fafafa",
                }}
              >
                <th style={{ padding: "12px 8px", fontWeight: 600, color: "#525252" }}>#</th>
                <th style={{ padding: "12px 8px", fontWeight: 600, color: "#525252" }}>Service</th>
                <th style={{ padding: "12px 8px", fontWeight: 600, color: "#525252" }}>Category</th>
                <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600, color: "#525252" }}>
                  Uptime 24h
                </th>
                <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600, color: "#525252" }}>
                  Uptime 7d
                </th>
                <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600, color: "#525252" }}>
                  Uptime 30d
                </th>
                <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600, color: "#525252" }}>
                  p50
                </th>
                <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600, color: "#525252" }}>
                  p95
                </th>
                <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600, color: "#525252" }}>
                  Incidents 30d
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((s, i) => (
                <tr
                  key={s.slug}
                  style={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <td style={{ padding: "10px 8px", color: "#a3a3a3", fontSize: "13px" }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <Link
                      href={`/${s.slug}`}
                      style={{ color: "#171717", fontWeight: 600, textDecoration: "none" }}
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td style={{ padding: "10px 8px", color: "#737373", fontSize: "12px" }}>
                    {formatCategoryLabel(s.category)}
                  </td>
                  <UptimeCell value={s.uptime24h} />
                  <UptimeCell value={s.uptime7d} />
                  <UptimeCell value={s.uptime30d} />
                  <td
                    style={{
                      padding: "10px 8px",
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: "#737373",
                    }}
                  >
                    {s.p50 !== null ? `${s.p50}ms` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: "#737373",
                    }}
                  >
                    {s.p95 !== null ? `${s.p95}ms` : "—"}
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    {s.incidents30d > 0 ? (
                      <Link
                        href={`/incidents/service/${s.slug}`}
                        style={{ color: "#dc2626", textDecoration: "none", fontWeight: 500 }}
                      >
                        {s.incidents30d}
                      </Link>
                    ) : (
                      <span style={{ color: "#16a34a" }}>0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: "32px",
            padding: "16px 20px",
            background: "#f9fafb",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#525252",
            lineHeight: 1.7,
          }}
        >
          <strong>About this index:</strong> Data collected every 15 minutes from probes monitoring
          API endpoints. Uptime is the percentage of checks returning a healthy response. Latency
          p50/p95 computed from the last 30 days of observations. Free to use — attribution
          appreciated. See{" "}
          <Link href="/methodology" style={{ color: "#2563eb" }}>
            methodology
          </Link>{" "}
          for details.
        </div>
      </div>
    </>
  );
}
