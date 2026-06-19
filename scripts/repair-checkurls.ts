/**
 * Repairs checkUrl for 117 services that currently ping homepages/CDN
 * instead of real status pages.
 * Validated from Vercel IPs (2026-06-19). 18 excluded: 4 WAF-blocked + 14 DNS-fail.
 *
 * Usage:
 *   npx tsx scripts/repair-checkurls.ts           (validate — no DB writes)
 *   npx tsx scripts/repair-checkurls.ts --commit  (write validated URLs to DB)
 *
 * IMPORTANT: default mode is read-only. --commit is required to mutate the DB.
 */

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");
const BOT_UA = "DownForAIStatusBot/1.0 (+https://downforai.com/methodology)";
const TIMEOUT_MS = 8000;

if (COMMIT) {
  console.log("🚀 COMMIT mode — will write validated URLs to DB.\n");
} else {
  console.log("🔍 VALIDATE mode — no DB writes. Pass --commit to apply.\n");
}

// ─── MAPPING service slug → new checkUrl ─────────────────────────────────────
// Sources: Atlassian /api/v2/status.json (highest quality) > status page HTML > skip
// xai-grok excluded intentionally — status.x.ai returns 403 (Cloudflare blocked)

type Update = { slug: string; checkUrl: string; type: "atlassian_json" | "status_html" };

const UPDATES: Update[] = [
  // ── LLM ──────────────────────────────────────────────────────────────────────
  // OpenAI ecosystem (all share the same status page)
  { slug: "openai",          checkUrl: "https://status.openai.com/api/v2/status.json",   type: "atlassian_json" },
  { slug: "chatgpt",         checkUrl: "https://status.openai.com/api/v2/status.json",   type: "atlassian_json" },
  { slug: "openai-api",      checkUrl: "https://status.openai.com/api/v2/status.json",   type: "atlassian_json" },
  { slug: "gpt-image",       checkUrl: "https://status.openai.com/api/v2/status.json",   type: "atlassian_json" },
  { slug: "openai-operator", checkUrl: "https://status.openai.com/api/v2/status.json",   type: "atlassian_json" },
  { slug: "whisper-openai",  checkUrl: "https://status.openai.com/api/v2/status.json",   type: "atlassian_json" },
  // Anthropic ecosystem
  { slug: "anthropic",       checkUrl: "https://status.anthropic.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "claude-chat",     checkUrl: "https://status.anthropic.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "anthropic-api",   checkUrl: "https://status.anthropic.com/api/v2/status.json", type: "atlassian_json" },
  // Mistral ecosystem
  { slug: "mistral",         checkUrl: "https://status.mistral.ai/api/v2/status.json",   type: "atlassian_json" },
  // Cohere
  { slug: "cohere",          checkUrl: "https://status.cohere.com/api/v2/status.json",   type: "atlassian_json" },
  // AI21
  { slug: "ai21",            checkUrl: "https://status.ai21.com/api/v2/status.json",     type: "atlassian_json" },
  // Moonshot / Kimi
  { slug: "moonshot-kimi",   checkUrl: "https://status.moonshot.cn/api/v2/status.json",  type: "atlassian_json" },
  // QuillBot
  { slug: "quillbot",        checkUrl: "https://status.quillbot.com/api/v2/status.json", type: "atlassian_json" },
  // Corcel (was pointing to homepage)
  { slug: "corcel-io",       checkUrl: "https://status.corcel.io/api/v2/status.json",    type: "atlassian_json" },
  // HuggingFace ecosystem
  { slug: "huggingchat",     checkUrl: "https://status.huggingface.co/api/v2/status.json", type: "atlassian_json" },
  { slug: "hugging-face",    checkUrl: "https://status.huggingface.co/api/v2/status.json", type: "atlassian_json" },
  // OpenRouter
  { slug: "openrouter",      checkUrl: "https://status.openrouter.ai/",                  type: "status_html" },
  // WriteSonic
  { slug: "writesonic",      checkUrl: "https://status.writesonic.com/",                 type: "status_html" },

  // ── DEV ──────────────────────────────────────────────────────────────────────
  // GitHub Copilot → githubstatus.com (Atlassian)
  { slug: "github-copilot",  checkUrl: "https://www.githubstatus.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "github-models",   checkUrl: "https://www.githubstatus.com/api/v2/status.json", type: "atlassian_json" },
  // GitLab (no Atlassian JSON API — uses custom status page)
  { slug: "gitlab-duo",      checkUrl: "https://status.gitlab.com/",                     type: "status_html" },
  // Groq API (DEV surface)
  { slug: "groq-api",        checkUrl: "https://status.groq.com/",                       type: "status_html" },
  // Vercel v0
  { slug: "v0-vercel",       checkUrl: "https://www.vercel-status.com/api/v2/status.json", type: "atlassian_json" },
  // Supabase
  { slug: "supabase-ai",     checkUrl: "https://status.supabase.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "supabase-vector", checkUrl: "https://status.supabase.com/api/v2/status.json", type: "atlassian_json" },
  // Cursor
  { slug: "cursor",          checkUrl: "https://status.cursor.com/",                     type: "status_html" },
  // Lovable
  { slug: "lovable",         checkUrl: "https://status.lovable.dev/",                    type: "status_html" },
  // Bolt (StackBlitz)
  { slug: "bolt-new",        checkUrl: "https://status.stackblitz.com/",                 type: "status_html" },
  // Mintlify
  { slug: "mintlify",        checkUrl: "https://status.mintlify.com/",                   type: "status_html" },
  // Tabnine
  { slug: "tabnine",         checkUrl: "https://status.tabnine.com/",                    type: "status_html" },
  // Codeium / Windsurf
  { slug: "codeium",         checkUrl: "https://status.codeium.com/",                    type: "status_html" },
  // Render
  { slug: "render-ai",       checkUrl: "https://status.render.com/api/v2/status.json",   type: "atlassian_json" },
  // Railway
  { slug: "railway-ai",      checkUrl: "https://railway.instatus.com/",                  type: "status_html" },
  // Snyk
  { slug: "snyk-code-ai",    checkUrl: "https://status.snyk.io/api/v2/status.json",      type: "atlassian_json" },
  // Sourcegraph
  { slug: "sourcegraph-cody", checkUrl: "https://status.sourcegraph.com/",               type: "status_html" },
  // Val Town
  { slug: "val-town",        checkUrl: "https://status.val.town/",                       type: "status_html" },

  // ── INFRA ────────────────────────────────────────────────────────────────────
  // Groq (inference, separate from groq-api)
  { slug: "groq",            checkUrl: "https://status.groq.com/",                       type: "status_html" },
  // Together AI
  { slug: "together-ai",     checkUrl: "https://status.together.ai/",                    type: "status_html" },
  // Fireworks AI
  { slug: "fireworks-ai",    checkUrl: "https://status.fireworks.ai/",                   type: "status_html" },
  // Replicate
  { slug: "replicate",       checkUrl: "https://status.replicate.com/",                  type: "status_html" },
  // fal.ai
  { slug: "fal-ai",          checkUrl: "https://status.fal.ai/",                         type: "status_html" },
  { slug: "fal-ai-flux",     checkUrl: "https://status.fal.ai/",                         type: "status_html" },
  // AWS Bedrock → AWS Health
  { slug: "aws-bedrock",     checkUrl: "https://health.aws.amazon.com/health/status",    type: "status_html" },
  { slug: "aws-sagemaker",   checkUrl: "https://health.aws.amazon.com/health/status",    type: "status_html" },
  { slug: "amazon-nova",     checkUrl: "https://health.aws.amazon.com/health/status",    type: "status_html" },
  { slug: "amazon-q",        checkUrl: "https://health.aws.amazon.com/health/status",    type: "status_html" },
  { slug: "amazon-q-developer", checkUrl: "https://health.aws.amazon.com/health/status", type: "status_html" },
  // Azure AI
  { slug: "azure-ai-studio", checkUrl: "https://azure.status.microsoft/en-us/status/",  type: "status_html" },
  // Google Vertex / AI Platform
  { slug: "google-vertex",   checkUrl: "https://status.cloud.google.com/",               type: "status_html" },
  { slug: "google-ai-platform", checkUrl: "https://status.cloud.google.com/",            type: "status_html" },
  { slug: "google-ai-studio", checkUrl: "https://status.cloud.google.com/",              type: "status_html" },
  // Databricks
  { slug: "databricks",      checkUrl: "https://status.databricks.com/",                 type: "status_html" },
  // Modal
  { slug: "modal",           checkUrl: "https://status.modal.com/",                      type: "status_html" },
  // Lambda Labs
  { slug: "lambda-labs",     checkUrl: "https://status.lambdalabs.com/",                 type: "status_html" },
  // Vercel (infra)
  { slug: "vercel-infra",    checkUrl: "https://www.vercel-status.com/api/v2/status.json", type: "atlassian_json" },
  // Vultr (no Atlassian JSON API)
  { slug: "vultr-cloud-gpu", checkUrl: "https://status.vultr.com/",                     type: "status_html" },
  // Paperspace / DigitalOcean
  { slug: "paperspace",      checkUrl: "https://status.paperspace.com/",                 type: "status_html" },
  // Cloudflare AI
  { slug: "cloudflare-ai",   checkUrl: "https://www.cloudflarestatus.com/api/v2/status.json", type: "atlassian_json" },
  // Nvidia NIM
  { slug: "nvidia-nim",      checkUrl: "https://status.ngc.nvidia.com/",                 type: "status_html" },
  // DeepInfra
  { slug: "deepinfra",       checkUrl: "https://status.deepinfra.com/",                  type: "status_html" },

  // ── AUDIO ────────────────────────────────────────────────────────────────────
  // ElevenLabs
  { slug: "elevenlabs",      checkUrl: "https://status.elevenlabs.io/api/v2/status.json", type: "atlassian_json" },
  // AssemblyAI
  { slug: "assembly-ai",     checkUrl: "https://status.assemblyai.com/",                 type: "status_html" },
  // Deepgram
  { slug: "deepgram",        checkUrl: "https://status.deepgram.com/api/v2/status.json", type: "atlassian_json" },
  // Udio
  { slug: "udio",            checkUrl: "https://status.udio.com/",                       type: "status_html" },
  // Resemble AI
  { slug: "resemble-ai",     checkUrl: "https://status.resemble.ai/",                    type: "status_html" },
  // Cartesia
  { slug: "cartesia-ai",     checkUrl: "https://status.cartesia.ai/",                    type: "status_html" },
  // Descript (audio + video)
  { slug: "descript",        checkUrl: "https://status.descript.com/",                   type: "status_html" },
  { slug: "descript-video",  checkUrl: "https://status.descript.com/",                   type: "status_html" },
  // Rev.ai
  { slug: "rev-ai",          checkUrl: "https://status.rev.com/",                        type: "status_html" },

  // ── IMAGE ────────────────────────────────────────────────────────────────────
  // Stability AI
  { slug: "stability-ai",    checkUrl: "https://status.stability.ai/api/v2/status.json", type: "atlassian_json" },
  { slug: "stable-video-diffusion", checkUrl: "https://status.stability.ai/api/v2/status.json", type: "atlassian_json" },
  { slug: "stable-audio",    checkUrl: "https://status.stability.ai/api/v2/status.json", type: "atlassian_json" },
  // Figma (has AI features)
  { slug: "figma-ai",        checkUrl: "https://status.figma.com/api/v2/status.json",   type: "atlassian_json" },
  // Runway
  { slug: "runway",          checkUrl: "https://status.runwayml.com/",                   type: "status_html" },
  // Civitai
  { slug: "civitai",         checkUrl: "https://status.civitai.com/",                    type: "status_html" },
  // Luma (dream machine + video)
  { slug: "luma-dream-machine", checkUrl: "https://status.lumalabs.ai/",                 type: "status_html" },
  { slug: "luma-ai",         checkUrl: "https://status.lumalabs.ai/",                    type: "status_html" },

  // ── VIDEO ────────────────────────────────────────────────────────────────────
  // Synthesia
  { slug: "synthesia",       checkUrl: "https://status.synthesia.io/api/v2/status.json", type: "atlassian_json" },
  // HeyGen
  { slug: "heygen",          checkUrl: "https://status.heygen.com/api/v2/status.json",   type: "atlassian_json" },

  // ── SEARCH / RAG ─────────────────────────────────────────────────────────────
  // Elastic
  { slug: "elastic-ai",      checkUrl: "https://status.elastic.co/api/v2/status.json",  type: "atlassian_json" },
  // Pinecone
  { slug: "pinecone",        checkUrl: "https://status.pinecone.io/api/v2/status.json", type: "atlassian_json" },
  // Algolia
  { slug: "algolia-ai",      checkUrl: "https://status.algolia.com/api/v2/status.json", type: "atlassian_json" },

  // ── PRODUCTIVITY ─────────────────────────────────────────────────────────────
  // Notion
  { slug: "notion-ai",       checkUrl: "https://status.notion.so/api/v2/status.json",   type: "atlassian_json" },
  // Slack (no /api/v2 endpoint)
  { slug: "slack-ai",        checkUrl: "https://status.slack.com/",                     type: "status_html" },
  // Zoom
  { slug: "zoom-ai",         checkUrl: "https://status.zoom.us/api/v2/status.json",     type: "atlassian_json" },
  // Linear
  { slug: "linear-ai",       checkUrl: "https://status.linear.app/api/v2/status.json",  type: "atlassian_json" },
  // ClickUp (no /api/v2 endpoint)
  { slug: "clickup-ai",      checkUrl: "https://status.clickup.com/",                   type: "status_html" },
  // Airtable
  { slug: "airtable-ai",     checkUrl: "https://status.airtable.com/api/v2/status.json", type: "atlassian_json" },
  // Grammarly
  { slug: "grammarly",       checkUrl: "https://status.grammarly.com/api/v2/status.json", type: "atlassian_json" },
  // Atlassian AI (uses its own Atlassian status page)
  { slug: "atlassian-ai",    checkUrl: "https://status.atlassian.com/api/v2/status.json", type: "atlassian_json" },
  // Miro
  { slug: "miro-ai",         checkUrl: "https://status.miro.com/api/v2/status.json",    type: "atlassian_json" },
  // Otter.ai
  { slug: "otter-ai",        checkUrl: "https://status.otter.ai/",                      type: "status_html" },
  // Jasper
  { slug: "jasper",          checkUrl: "https://status.jasper.ai/",                     type: "status_html" },
  // Monday.com
  { slug: "monday-ai",       checkUrl: "https://status.monday.com/",                    type: "status_html" },

  // ── AGENTS / AUTOMATION ──────────────────────────────────────────────────────
  // Zapier
  { slug: "zapier-ai",       checkUrl: "https://status.zapier.com/api/v2/status.json",  type: "atlassian_json" },
  // Retool
  { slug: "retool-ai",       checkUrl: "https://status.retool.com/api/v2/status.json",  type: "atlassian_json" },
  // n8n
  { slug: "n8n",             checkUrl: "https://status.n8n.io/",                        type: "status_html" },
  // Voiceflow
  { slug: "voiceflow",       checkUrl: "https://status.voiceflow.com/",                 type: "status_html" },
  // Dify
  { slug: "dify",            checkUrl: "https://status.dify.ai/",                       type: "status_html" },
  // CrewAI
  { slug: "crewai",          checkUrl: "https://status.crewai.com/",                    type: "status_html" },

  // ── MLOPS ────────────────────────────────────────────────────────────────────
  // Datadog LLM observability
  { slug: "datadog-llm",     checkUrl: "https://status.datadoghq.com/api/v2/status.json", type: "atlassian_json" },
  // Langfuse
  { slug: "langfuse",        checkUrl: "https://status.langfuse.com/",                  type: "status_html" },
  // Comet ML
  { slug: "comet-ml",        checkUrl: "https://status.comet.com/",                     type: "status_html" },
  // Humanloop
  { slug: "humanloop",       checkUrl: "https://status.humanloop.com/",                 type: "status_html" },
  // Portkey
  { slug: "portkey",         checkUrl: "https://status.portkey.ai/",                    type: "status_html" },
  // Helicone
  { slug: "helicone",        checkUrl: "https://status.helicone.ai/",                   type: "status_html" },

  // ── VECTOR DB ────────────────────────────────────────────────────────────────
  // MongoDB Atlas
  { slug: "mongodb-atlas-vector", checkUrl: "https://status.mongodb.com/api/v2/status.json", type: "atlassian_json" },
  // Neon
  { slug: "neon-pgvector",   checkUrl: "https://neonstatus.com/",                       type: "status_html" },
  // Snowflake
  { slug: "snowflake-cortex", checkUrl: "https://status.snowflake.com/api/v2/status.json", type: "atlassian_json" },

  // ── SUPPORT ──────────────────────────────────────────────────────────────────
  // Zendesk (no /api/v2 endpoint)
  { slug: "zendesk-ai",      checkUrl: "https://status.zendesk.com/",                   type: "status_html" },
  // Freshdesk (403 locally, trying HTML — may work from Vercel IPs)
  { slug: "freshdesk-ai",    checkUrl: "https://status.freshworks.com/",                type: "status_html" },
  // HubSpot
  { slug: "hubspot-ai",      checkUrl: "https://status.hubspot.com/",                   type: "status_html" },
  // Salesforce
  { slug: "salesforce-einstein", checkUrl: "https://status.salesforce.com/",            type: "status_html" },
  // Intercom
  { slug: "intercom-fin",    checkUrl: "https://www.intercomstatus.com/api/v2/status.json", type: "atlassian_json" },
  // Gong
  { slug: "gong-io",         checkUrl: "https://status.gong.io/",                       type: "status_html" },
  // Talkdesk
  { slug: "talkdesk-ai",     checkUrl: "https://status.talkdesk.com/",                  type: "status_html" },
];

// ─── Validation fetch ─────────────────────────────────────────────────────────

type ProbeResult = {
  ok: boolean;
  httpStatus: number | null;
  latencyMs: number | null;
  error?: string;
};

async function probe(url: string): Promise<ProbeResult> {
  const start = Date.now();
  try {
    // Try HEAD first, fall back to GET on 403/405
    let res = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
      headers: { "User-Agent": BOT_UA, "Accept": "*/*", "Cache-Control": "no-cache" },
    });

    if (res.status === 403 || res.status === 405) {
      res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: "follow",
        headers: { "User-Agent": BOT_UA, "Accept": "text/html,application/json,*/*", "Cache-Control": "no-cache" },
      });
    }

    const latencyMs = Date.now() - start;
    return { ok: res.ok, httpStatus: res.status, latencyMs };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const msg = err instanceof Error ? err.name === "TimeoutError" ? "TIMEOUT" : err.message : String(err);
    return { ok: false, httpStatus: null, latencyMs, error: msg };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Validating ${UPDATES.length} candidate URLs (BOT_UA, 8s timeout)...\n`);

  // Probe all URLs concurrently (batched to avoid overwhelming remote hosts)
  const BATCH = 20;
  const probeResults: Array<{ update: Update; probe: ProbeResult; dbExists: boolean }> = [];

  for (let i = 0; i < UPDATES.length; i += BATCH) {
    const slice = UPDATES.slice(i, i + BATCH);
    const batch = await Promise.all(
      slice.map(async (u) => {
        const result = await probe(u.checkUrl);
        return { update: u, probe: result, dbExists: false };
      })
    );
    probeResults.push(...batch);
    process.stdout.write(`  probed ${Math.min(i + BATCH, UPDATES.length)}/${UPDATES.length}...\r`);
  }
  console.log("\n");

  // Verify each slug exists in DB
  const slugsToCheck = [...new Set(UPDATES.map(u => u.slug))];
  const dbServices = await prisma.service.findMany({
    where: { slug: { in: slugsToCheck } },
    select: { slug: true },
  });
  const existingSlugSet = new Set(dbServices.map(s => s.slug));

  for (const r of probeResults) {
    r.dbExists = existingSlugSet.has(r.update.slug);
  }

  // ── Classify results ──────────────────────────────────────────────────────
  const ok      = probeResults.filter(r => r.probe.ok && r.dbExists);
  const problem = probeResults.filter(r => !r.probe.ok || !r.dbExists);

  // ── Print report ──────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  VALIDATION REPORT — ${UPDATES.length} candidates`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`✅ OK (will ${COMMIT ? "UPDATE" : "would update"}): ${ok.length} services\n`);
  const colW = 30;
  console.log(`  ${"slug".padEnd(colW)} ${"type".padEnd(16)} ${"http".padStart(4)}  lat    checkUrl`);
  console.log("  " + "─".repeat(110));
  for (const r of ok) {
    const lat = r.probe.latencyMs != null ? `${r.probe.latencyMs}ms` : "?";
    console.log(
      `  ${r.update.slug.padEnd(colW)} ${r.update.type.padEnd(16)} ${String(r.probe.httpStatus).padStart(4)}  ${lat.padStart(6)}  ${r.update.checkUrl}`
    );
  }

  if (problem.length > 0) {
    console.log(`\n⚠️  PROBLÈME (skipped): ${problem.length} entries\n`);
    console.log(`  ${"slug".padEnd(colW)} ${"http".padStart(4)}  error / reason`);
    console.log("  " + "─".repeat(80));
    for (const r of problem) {
      const httpStr = r.probe.httpStatus != null ? String(r.probe.httpStatus) : "—";
      const reason = !r.dbExists
        ? "slug not found in DB"
        : r.probe.error ?? `HTTP ${r.probe.httpStatus}`;
      console.log(`  ${r.update.slug.padEnd(colW)} ${httpStr.padStart(4)}  ${reason}`);
    }
  }

  console.log(`\n${"═".repeat(65)}`);
  console.log(`  ✅ OK:        ${ok.length}`);
  console.log(`  ⚠️  Problème: ${problem.length}`);
  console.log(`  Total:       ${UPDATES.length}`);
  if (!COMMIT) {
    console.log(`\n  Run with --commit to write the ${ok.length} valid URLs to DB.`);
  }
  console.log(`${"═".repeat(65)}\n`);

  // ── Apply if --commit ─────────────────────────────────────────────────────
  if (COMMIT && ok.length > 0) {
    console.log(`Writing ${ok.length} checkUrls to DB...\n`);
    let updated = 0;

    for (const r of ok) {
      const service = await prisma.service.findUnique({
        where: { slug: r.update.slug },
        select: { id: true },
      });
      if (!service) continue;

      await prisma.serviceSurface.updateMany({
        where: { serviceId: service.id },
        data: { checkUrl: r.update.checkUrl },
      });
      console.log(`  ✓ ${r.update.slug} → ${r.update.checkUrl}`);
      updated++;
    }

    console.log(`\n  Done. ${updated} services updated.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
