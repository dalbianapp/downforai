/**
 * Discovers working checkUrl endpoints for services blocked by Cloudflare.
 * Tests multiple candidates per service, picks best one.
 * Output: CLOUDFLARE-FIX.md + scripts/update-cloudflare-services.ts
 */

const TIMEOUT_MS = 5000;
const CONCURRENCY = 10;

type Candidate = { url: string; label: string };
type ProbeResult = { url: string; label: string; status: number | null; latencyMs: number; ok: boolean; error?: string };

const SERVICES: Array<{ slug: string; domain: string; candidates: Candidate[] }> = [
  // ─── PRIORITY HIGH ────────────────────────────────────────────────────────
  {
    slug: "midjourney",
    domain: "midjourney.com",
    candidates: [
      { url: "https://status.midjourney.com/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.midjourney.com/", label: "status_page" },
      { url: "https://www.midjourney.com/favicon.ico", label: "favicon" },
      { url: "https://www.midjourney.com/robots.txt", label: "robots" },
    ],
  },
  {
    slug: "character-ai",
    domain: "character.ai",
    candidates: [
      { url: "https://status.character.ai/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.character.ai/", label: "status_page" },
      { url: "https://character.ai/robots.txt", label: "robots" },
      { url: "https://character.ai/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "xai-grok",
    domain: "x.ai",
    candidates: [
      { url: "https://status.x.ai/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.x.ai/", label: "status_page" },
      { url: "https://x.ai/robots.txt", label: "robots" },
      { url: "https://x.ai/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "grok-imagine",
    domain: "x.ai",
    candidates: [
      { url: "https://status.x.ai/api/v2/status.json", label: "atlassian_json" },
      { url: "https://x.ai/robots.txt", label: "robots" },
    ],
  },
  {
    slug: "poe",
    domain: "poe.com",
    candidates: [
      { url: "https://status.poe.com/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.poe.com/", label: "status_page" },
      { url: "https://poe.com/robots.txt", label: "robots" },
      { url: "https://poe.com/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "viggle",
    domain: "viggle.ai",
    candidates: [
      { url: "https://status.viggle.ai/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.viggle.ai/", label: "status_page" },
      { url: "https://viggle.ai/robots.txt", label: "robots" },
      { url: "https://viggle.ai/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "crushon-ai",
    domain: "crushon.ai",
    candidates: [
      { url: "https://status.crushon.ai/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.crushon.ai/", label: "status_page" },
      { url: "https://crushon.ai/robots.txt", label: "robots" },
      { url: "https://crushon.ai/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "genspark",
    domain: "genspark.ai",
    candidates: [
      { url: "https://status.genspark.ai/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.genspark.ai/", label: "status_page" },
      { url: "https://www.genspark.ai/robots.txt", label: "robots" },
      { url: "https://www.genspark.ai/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "ideogram",
    domain: "ideogram.ai",
    candidates: [
      { url: "https://status.ideogram.ai/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.ideogram.ai/", label: "status_page" },
      { url: "https://ideogram.ai/robots.txt", label: "robots" },
      { url: "https://ideogram.ai/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "canva-ai",
    domain: "canva.com",
    candidates: [
      { url: "https://www.canva-status.com/api/v2/status.json", label: "atlassian_json" },
      { url: "https://www.canva-status.com/", label: "status_page" },
      { url: "https://status.canva.com/api/v2/status.json", label: "atlassian_json_alt" },
      { url: "https://www.canva.com/robots.txt", label: "robots" },
    ],
  },
  {
    slug: "janitorai",
    domain: "janitorai.com",
    candidates: [
      { url: "https://status.janitorai.com/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.janitorai.com/", label: "status_page" },
      { url: "https://janitorai.com/robots.txt", label: "robots" },
      { url: "https://janitorai.com/favicon.ico", label: "favicon" },
    ],
  },

  // ─── PRIORITY MEDIUM ──────────────────────────────────────────────────────
  {
    slug: "inflection-pi",
    domain: "pi.ai",
    candidates: [
      { url: "https://status.inflection.ai/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.pi.ai/api/v2/status.json", label: "atlassian_json_pi" },
      { url: "https://pi.ai/robots.txt", label: "robots" },
      { url: "https://pi.ai/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "line-ai",
    domain: "line.me",
    candidates: [
      { url: "https://status.line.me/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.line.me/", label: "status_page" },
      { url: "https://line.me/robots.txt", label: "robots" },
      { url: "https://line.me/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "craiyon",
    domain: "craiyon.com",
    candidates: [
      { url: "https://status.craiyon.com/api/v2/status.json", label: "atlassian_json" },
      { url: "https://www.craiyon.com/robots.txt", label: "robots" },
      { url: "https://www.craiyon.com/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "hiwaifu",
    domain: "hiwaifu.com",
    candidates: [
      { url: "https://status.hiwaifu.com/api/v2/status.json", label: "atlassian_json" },
      { url: "https://www.hiwaifu.com/robots.txt", label: "robots" },
      { url: "https://www.hiwaifu.com/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "contentatscale",
    domain: "contentatscale.ai",
    candidates: [
      { url: "https://status.contentatscale.ai/api/v2/status.json", label: "atlassian_json" },
      { url: "https://contentatscale.ai/robots.txt", label: "robots" },
      { url: "https://contentatscale.ai/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "outranking",
    domain: "outranking.io",
    candidates: [
      { url: "https://status.outranking.io/api/v2/status.json", label: "atlassian_json" },
      { url: "https://www.outranking.io/robots.txt", label: "robots" },
      { url: "https://www.outranking.io/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "piktochart-ai",
    domain: "piktochart.com",
    candidates: [
      { url: "https://status.piktochart.com/api/v2/status.json", label: "atlassian_json" },
      { url: "https://piktochart.com/robots.txt", label: "robots" },
      { url: "https://piktochart.com/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "gamma",
    domain: "gamma.app",
    candidates: [
      { url: "https://status.gamma.app/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.gamma.app/", label: "status_page" },
      { url: "https://gamma.app/robots.txt", label: "robots" },
      { url: "https://gamma.app/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "nightcafe",
    domain: "nightcafe.studio",
    candidates: [
      { url: "https://status.nightcafe.studio/api/v2/status.json", label: "atlassian_json" },
      { url: "https://creator.nightcafe.studio/robots.txt", label: "robots" },
      { url: "https://creator.nightcafe.studio/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "comfyui",
    domain: "comfy.org",
    candidates: [
      { url: "https://status.comfy.org/api/v2/status.json", label: "atlassian_json" },
      { url: "https://www.comfy.org/robots.txt", label: "robots" },
      { url: "https://www.comfy.org/favicon.ico", label: "favicon" },
    ],
  },
  {
    slug: "tensor-art",
    domain: "tensor.art",
    candidates: [
      { url: "https://status.tensor.art/api/v2/status.json", label: "atlassian_json" },
      { url: "https://tensor.art/robots.txt", label: "robots" },
      { url: "https://tensor.art/favicon.ico", label: "favicon" },
    ],
  },

  // ─── PRIORITY LOW ─────────────────────────────────────────────────────────
  { slug: "vocal-remover",  domain: "vocalremover.org",  candidates: [{ url: "https://vocalremover.org/robots.txt", label: "robots" }, { url: "https://vocalremover.org/favicon.ico", label: "favicon" }] },
  { slug: "kittel-ai",      domain: "kittl.com",          candidates: [{ url: "https://status.kittl.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://www.kittl.com/robots.txt", label: "robots" }] },
  { slug: "looka",          domain: "looka.com",          candidates: [{ url: "https://status.looka.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://looka.com/robots.txt", label: "robots" }, { url: "https://looka.com/favicon.ico", label: "favicon" }] },
  { slug: "brainly-ai",     domain: "brainly.com",        candidates: [{ url: "https://status.brainly.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://brainly.com/robots.txt", label: "robots" }] },
  { slug: "gauth",          domain: "gauthmath.com",      candidates: [{ url: "https://status.gauthmath.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://www.gauthmath.com/robots.txt", label: "robots" }] },
  { slug: "quizgecko",      domain: "quizgecko.com",      candidates: [{ url: "https://status.quizgecko.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://quizgecko.com/robots.txt", label: "robots" }] },
  { slug: "quizlet-qchat",  domain: "quizlet.com",        candidates: [{ url: "https://status.quizlet.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://quizlet.com/robots.txt", label: "robots" }] },
  { slug: "studyfetch",     domain: "studyfetch.com",     candidates: [{ url: "https://status.studyfetch.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://www.studyfetch.com/robots.txt", label: "robots" }] },
  { slug: "promeai",        domain: "promeai.pro",        candidates: [{ url: "https://status.promeai.pro/api/v2/status.json", label: "atlassian_json" }, { url: "https://www.promeai.pro/robots.txt", label: "robots" }] },
  { slug: "zimmwriter",     domain: "zimmwriter.com",     candidates: [{ url: "https://status.zimmwriter.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://zimmwriter.com/robots.txt", label: "robots" }] },
  { slug: "consensus",      domain: "consensus.app",      candidates: [{ url: "https://status.consensus.app/api/v2/status.json", label: "atlassian_json" }, { url: "https://consensus.app/robots.txt", label: "robots" }] },
  { slug: "speechify",      domain: "speechify.com",      candidates: [{ url: "https://status.speechify.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://speechify.com/robots.txt", label: "robots" }] },
  { slug: "supernormal",    domain: "supernormal.com",    candidates: [{ url: "https://status.supernormal.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://supernormal.com/robots.txt", label: "robots" }] },
  { slug: "chatfai",        domain: "chatfai.com",        candidates: [{ url: "https://status.chatfai.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://chatfai.com/robots.txt", label: "robots" }] },
  { slug: "muah-ai",        domain: "muah.ai",            candidates: [{ url: "https://status.muah.ai/api/v2/status.json", label: "atlassian_json" }, { url: "https://muah.ai/robots.txt", label: "robots" }] },
  { slug: "elicit",         domain: "elicit.com",         candidates: [{ url: "https://status.elicit.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://elicit.com/robots.txt", label: "robots" }] },
  { slug: "ada-support",    domain: "ada.cx",             candidates: [{ url: "https://status.ada.cx/api/v2/status.json", label: "atlassian_json" }, { url: "https://www.ada.cx/robots.txt", label: "robots" }] },
  { slug: "sybill",         domain: "sybill.ai",          candidates: [{ url: "https://status.sybill.ai/api/v2/status.json", label: "atlassian_json" }, { url: "https://www.sybill.ai/robots.txt", label: "robots" }] },
  { slug: "couchbase-capella", domain: "couchbase.com",   candidates: [{ url: "https://status.couchbase.com/api/v2/status.json", label: "atlassian_json" }, { url: "https://www.couchbase.com/robots.txt", label: "robots" }] },

  // ─── DEGRADED ─────────────────────────────────────────────────────────────
  {
    slug: "adobe-express",
    domain: "adobe.com",
    candidates: [
      { url: "https://status.adobe.com/api/v2/status.json", label: "atlassian_json" },
      { url: "https://status.adobe.com/", label: "status_page" },
      { url: "https://www.adobe.com/robots.txt", label: "robots" },
    ],
  },
  {
    slug: "adobe-photoshop-ai",
    domain: "adobe.com",
    candidates: [
      { url: "https://status.adobe.com/api/v2/status.json", label: "atlassian_json" },
    ],
  },
  {
    slug: "smithery-ai",
    domain: "smithery.ai",
    candidates: [
      { url: "https://smithery.ai/favicon.ico", label: "favicon" },
      { url: "https://smithery.ai/robots.txt", label: "robots" },
    ],
  },
  {
    slug: "sizzle",
    domain: "sizzleai.com",
    candidates: [
      { url: "https://sizzleai.com/robots.txt", label: "robots" },
      { url: "https://sizzleai.com/favicon.ico", label: "favicon" },
    ],
  },
];

async function probe(candidate: Candidate): Promise<ProbeResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(candidate.url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StatusBot/1.0)",
        "Accept": "*/*",
      },
    });
    clearTimeout(t);
    const latencyMs = Date.now() - start;
    return { ...candidate, status: res.status, latencyMs, ok: res.ok };
  } catch (e: unknown) {
    const msg = e instanceof Error ? (e.name === "AbortError" ? "TIMEOUT" : e.message.slice(0, 60)) : String(e);
    return { ...candidate, status: null, latencyMs: Date.now() - start, ok: false, error: msg };
  }
}

const LABEL_PRIORITY: Record<string, number> = {
  atlassian_json: 1,
  atlassian_json_pi: 1,
  atlassian_json_alt: 2,
  status_page: 3,
  robots: 4,
  favicon: 5,
};

function pickBest(results: ProbeResult[]): ProbeResult | null {
  const ok = results.filter((r) => r.ok).sort((a, b) => (LABEL_PRIORITY[a.label] ?? 9) - (LABEL_PRIORITY[b.label] ?? 9));
  return ok[0] ?? null;
}

async function probeService(svc: (typeof SERVICES)[0]) {
  const promises = svc.candidates.map((c) => probe(c));
  // Fan out in parallel (few candidates per service)
  const results = await Promise.all(promises);
  return { slug: svc.slug, results, best: pickBest(results) };
}

async function main() {
  console.log(`Probing ${SERVICES.length} services...\n`);

  // Process in chunks of CONCURRENCY
  const allResults: Awaited<ReturnType<typeof probeService>>[] = [];
  for (let i = 0; i < SERVICES.length; i += CONCURRENCY) {
    const chunk = SERVICES.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(chunk.map(probeService));
    allResults.push(...chunkResults);
    process.stdout.write(`\r  ${Math.min(i + CONCURRENCY, SERVICES.length)}/${SERVICES.length} done...`);
  }
  console.log("\n");

  // Print full JSON for CLOUDFLARE-FIX.md generation
  console.log("=== RESULTS_JSON ===");
  console.log(JSON.stringify(allResults.map(r => ({
    slug: r.slug,
    best_url: r.best?.url ?? null,
    best_label: r.best?.label ?? null,
    best_status: r.best?.status ?? null,
    best_latency: r.best?.latencyMs ?? null,
    action: r.best
      ? (r.best.label === "atlassian_json" || r.best.label === "atlassian_json_pi" || r.best.label === "atlassian_json_alt")
        ? "UPDATE_STATUS_PAGE"
        : r.best.label === "status_page"
        ? "UPDATE_STATUS_PAGE"
        : "USE_FALLBACK"
      : "NO_ENDPOINT",
    probes: r.results.map(p => ({ label: p.label, status: p.status, ms: p.latencyMs, ok: p.ok, err: p.error })),
  })), null, 2));
}

main().catch(console.error);
