/**
 * Temporary validation endpoint — jetable après usage.
 * Teste les URL candidates depuis les IPs Vercel (pas depuis l'IP locale).
 * Lecture seule. N'écrit RIEN en base.
 *
 * Usage:
 *   curl -s "https://downforai.com/api/admin/validate-urls" \
 *        -H "Authorization: Bearer $CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;
const BOT_UA = "DownForAIStatusBot/1.0 (+https://downforai.com/methodology)";
const TIMEOUT_MS = 8000;

type Candidate = { slug: string; checkUrl: string; type: string };

// Même liste que scripts/repair-checkurls.ts, avec les corrections des 404
const CANDIDATES: Candidate[] = [
  // ── LLM ──────────────────────────────────────────────────────────────────────
  { slug: "openai",          checkUrl: "https://status.openai.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "chatgpt",         checkUrl: "https://status.openai.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "openai-api",      checkUrl: "https://status.openai.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "gpt-image",       checkUrl: "https://status.openai.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "openai-operator", checkUrl: "https://status.openai.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "whisper-openai",  checkUrl: "https://status.openai.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "anthropic",       checkUrl: "https://status.anthropic.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "claude-chat",     checkUrl: "https://status.anthropic.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "anthropic-api",   checkUrl: "https://status.anthropic.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "mistral",         checkUrl: "https://status.mistral.ai/api/v2/status.json",    type: "atlassian_json" },
  { slug: "cohere",          checkUrl: "https://status.cohere.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "ai21",            checkUrl: "https://status.ai21.com/api/v2/status.json",      type: "atlassian_json" },
  { slug: "moonshot-kimi",   checkUrl: "https://status.moonshot.cn/api/v2/status.json",   type: "atlassian_json" },
  { slug: "quillbot",        checkUrl: "https://status.quillbot.com/api/v2/status.json",  type: "atlassian_json" },
  { slug: "corcel-io",       checkUrl: "https://status.corcel.io/api/v2/status.json",     type: "atlassian_json" },
  { slug: "huggingchat",     checkUrl: "https://status.huggingface.co/api/v2/status.json",type: "atlassian_json" },
  { slug: "hugging-face",    checkUrl: "https://status.huggingface.co/api/v2/status.json",type: "atlassian_json" },
  { slug: "deepseek",        checkUrl: "https://status.deepseek.com/",                    type: "status_html" },
  { slug: "deepseek-coder",  checkUrl: "https://status.deepseek.com/",                    type: "status_html" },
  { slug: "openrouter",      checkUrl: "https://status.openrouter.ai/",                   type: "status_html" },
  { slug: "writesonic",      checkUrl: "https://status.writesonic.com/",                  type: "status_html" },
  { slug: "copy-ai",         checkUrl: "https://status.copy.ai/",                         type: "status_html" },

  // ── DEV ──────────────────────────────────────────────────────────────────────
  { slug: "github-copilot",  checkUrl: "https://www.githubstatus.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "github-models",   checkUrl: "https://www.githubstatus.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "gitlab-duo",      checkUrl: "https://status.gitlab.com/",                      type: "status_html" },
  { slug: "groq-api",        checkUrl: "https://status.groq.com/",                        type: "status_html" },
  { slug: "replit-ai",       checkUrl: "https://status.replit.com/",                      type: "status_html" },
  { slug: "v0-vercel",       checkUrl: "https://www.vercel-status.com/api/v2/status.json",type: "atlassian_json" },
  { slug: "supabase-ai",     checkUrl: "https://status.supabase.com/api/v2/status.json",  type: "atlassian_json" },
  { slug: "supabase-vector", checkUrl: "https://status.supabase.com/api/v2/status.json",  type: "atlassian_json" },
  { slug: "cursor",          checkUrl: "https://status.cursor.com/",                      type: "status_html" },
  { slug: "lovable",         checkUrl: "https://status.lovable.dev/",                     type: "status_html" },
  { slug: "bolt-new",        checkUrl: "https://status.stackblitz.com/",                  type: "status_html" },
  { slug: "mintlify",        checkUrl: "https://status.mintlify.com/",                    type: "status_html" },
  { slug: "tabnine",         checkUrl: "https://status.tabnine.com/",                     type: "status_html" },
  { slug: "codeium",         checkUrl: "https://status.codeium.com/",                     type: "status_html" },
  { slug: "render-ai",       checkUrl: "https://status.render.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "railway-ai",      checkUrl: "https://railway.instatus.com/",                   type: "status_html" },
  { slug: "snyk-code-ai",    checkUrl: "https://status.snyk.io/api/v2/status.json",       type: "atlassian_json" },
  { slug: "sourcegraph-cody",checkUrl: "https://status.sourcegraph.com/",                 type: "status_html" },
  { slug: "val-town",        checkUrl: "https://status.val.town/",                        type: "status_html" },

  // ── INFRA ────────────────────────────────────────────────────────────────────
  { slug: "groq",            checkUrl: "https://status.groq.com/",                        type: "status_html" },
  { slug: "together-ai",     checkUrl: "https://status.together.ai/",                     type: "status_html" },
  { slug: "fireworks-ai",    checkUrl: "https://status.fireworks.ai/",                    type: "status_html" },
  { slug: "replicate",       checkUrl: "https://status.replicate.com/",                   type: "status_html" },
  { slug: "fal-ai",          checkUrl: "https://status.fal.ai/",                          type: "status_html" },
  { slug: "fal-ai-flux",     checkUrl: "https://status.fal.ai/",                          type: "status_html" },
  { slug: "aws-bedrock",     checkUrl: "https://health.aws.amazon.com/health/status",     type: "status_html" },
  { slug: "aws-sagemaker",   checkUrl: "https://health.aws.amazon.com/health/status",     type: "status_html" },
  { slug: "amazon-nova",     checkUrl: "https://health.aws.amazon.com/health/status",     type: "status_html" },
  { slug: "amazon-q",        checkUrl: "https://health.aws.amazon.com/health/status",     type: "status_html" },
  { slug: "amazon-q-developer", checkUrl: "https://health.aws.amazon.com/health/status", type: "status_html" },
  { slug: "azure-ai-studio", checkUrl: "https://azure.status.microsoft/en-us/status/",   type: "status_html" },
  { slug: "google-vertex",   checkUrl: "https://status.cloud.google.com/",                type: "status_html" },
  { slug: "google-ai-platform", checkUrl: "https://status.cloud.google.com/",             type: "status_html" },
  { slug: "google-ai-studio",checkUrl: "https://status.cloud.google.com/",                type: "status_html" },
  { slug: "databricks",      checkUrl: "https://status.databricks.com/",                  type: "status_html" },
  { slug: "modal",           checkUrl: "https://status.modal.com/",                       type: "status_html" },
  { slug: "lambda-labs",     checkUrl: "https://status.lambdalabs.com/",                  type: "status_html" },
  { slug: "vercel-infra",    checkUrl: "https://www.vercel-status.com/api/v2/status.json",type: "atlassian_json" },
  { slug: "vultr-cloud-gpu", checkUrl: "https://status.vultr.com/",                       type: "status_html" },
  { slug: "paperspace",      checkUrl: "https://status.paperspace.com/",                  type: "status_html" },
  { slug: "runpod",          checkUrl: "https://status.runpod.io/",                       type: "status_html" },
  { slug: "cloudflare-ai",   checkUrl: "https://www.cloudflarestatus.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "nvidia-nim",      checkUrl: "https://status.ngc.nvidia.com/",                  type: "status_html" },
  { slug: "deepinfra",       checkUrl: "https://status.deepinfra.com/",                   type: "status_html" },

  // ── AUDIO ────────────────────────────────────────────────────────────────────
  { slug: "elevenlabs",      checkUrl: "https://status.elevenlabs.io/api/v2/status.json", type: "atlassian_json" },
  { slug: "assembly-ai",     checkUrl: "https://status.assemblyai.com/",                  type: "status_html" },
  { slug: "deepgram",        checkUrl: "https://status.deepgram.com/api/v2/status.json",  type: "atlassian_json" },
  { slug: "suno",            checkUrl: "https://status.suno.com/",                        type: "status_html" },
  { slug: "udio",            checkUrl: "https://status.udio.com/",                        type: "status_html" },
  { slug: "murf",            checkUrl: "https://status.murf.ai/",                         type: "status_html" },
  { slug: "resemble-ai",     checkUrl: "https://status.resemble.ai/",                     type: "status_html" },
  { slug: "cartesia-ai",     checkUrl: "https://status.cartesia.ai/",                     type: "status_html" },
  { slug: "descript",        checkUrl: "https://status.descript.com/",                    type: "status_html" },
  { slug: "descript-video",  checkUrl: "https://status.descript.com/",                    type: "status_html" },
  { slug: "rev-ai",          checkUrl: "https://status.rev.com/",                         type: "status_html" },

  // ── IMAGE ────────────────────────────────────────────────────────────────────
  { slug: "stability-ai",    checkUrl: "https://status.stability.ai/api/v2/status.json",  type: "atlassian_json" },
  { slug: "stable-video-diffusion", checkUrl: "https://status.stability.ai/api/v2/status.json", type: "atlassian_json" },
  { slug: "stable-audio",    checkUrl: "https://status.stability.ai/api/v2/status.json",  type: "atlassian_json" },
  { slug: "figma-ai",        checkUrl: "https://status.figma.com/api/v2/status.json",     type: "atlassian_json" },
  { slug: "photoroom",       checkUrl: "https://status.photoroom.com/",                   type: "status_html" },
  { slug: "runway",          checkUrl: "https://status.runwayml.com/",                    type: "status_html" },
  { slug: "pika",            checkUrl: "https://status.pika.art/",                        type: "status_html" },
  { slug: "civitai",         checkUrl: "https://status.civitai.com/",                     type: "status_html" },
  { slug: "leonardo-ai",     checkUrl: "https://status.leonardo.ai/",                     type: "status_html" },
  { slug: "freepik-ai",      checkUrl: "https://status.freepik.com/",                     type: "status_html" },
  { slug: "luma-dream-machine", checkUrl: "https://status.lumalabs.ai/",                  type: "status_html" },
  { slug: "luma-ai",         checkUrl: "https://status.lumalabs.ai/",                     type: "status_html" },

  // ── VIDEO ────────────────────────────────────────────────────────────────────
  { slug: "synthesia",       checkUrl: "https://status.synthesia.io/api/v2/status.json",  type: "atlassian_json" },
  { slug: "heygen",          checkUrl: "https://status.heygen.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "captions-ai",     checkUrl: "https://status.captions.ai/",                    type: "status_html" },

  // ── SEARCH / RAG ─────────────────────────────────────────────────────────────
  { slug: "elastic-ai",      checkUrl: "https://status.elastic.co/api/v2/status.json",   type: "atlassian_json" },
  { slug: "pinecone",        checkUrl: "https://status.pinecone.io/api/v2/status.json",   type: "atlassian_json" },
  { slug: "weaviate",        checkUrl: "https://status.weaviate.io/",                     type: "status_html" },
  { slug: "algolia-ai",      checkUrl: "https://status.algolia.com/api/v2/status.json",   type: "atlassian_json" },

  // ── PRODUCTIVITY ─────────────────────────────────────────────────────────────
  { slug: "notion-ai",       checkUrl: "https://status.notion.so/api/v2/status.json",     type: "atlassian_json" },
  { slug: "slack-ai",        checkUrl: "https://status.slack.com/",                       type: "status_html" },
  { slug: "zoom-ai",         checkUrl: "https://status.zoom.us/api/v2/status.json",       type: "atlassian_json" },
  { slug: "linear-ai",       checkUrl: "https://status.linear.app/api/v2/status.json",    type: "atlassian_json" },
  { slug: "clickup-ai",      checkUrl: "https://status.clickup.com/",                     type: "status_html" },
  { slug: "airtable-ai",     checkUrl: "https://status.airtable.com/api/v2/status.json",  type: "atlassian_json" },
  { slug: "grammarly",       checkUrl: "https://status.grammarly.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "atlassian-ai",    checkUrl: "https://status.atlassian.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "miro-ai",         checkUrl: "https://status.miro.com/api/v2/status.json",      type: "atlassian_json" },
  { slug: "otter-ai",        checkUrl: "https://status.otter.ai/",                        type: "status_html" },
  { slug: "jasper",          checkUrl: "https://status.jasper.ai/",                       type: "status_html" },
  { slug: "monday-ai",       checkUrl: "https://status.monday.com/",                      type: "status_html" },
  { slug: "taskade-ai",      checkUrl: "https://status.taskade.com/",                     type: "status_html" },

  // ── AGENTS / AUTOMATION ──────────────────────────────────────────────────────
  { slug: "zapier-ai",       checkUrl: "https://status.zapier.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "retool-ai",       checkUrl: "https://status.retool.com/api/v2/status.json",    type: "atlassian_json" },
  { slug: "n8n",             checkUrl: "https://status.n8n.io/",                          type: "status_html" },
  { slug: "voiceflow",       checkUrl: "https://status.voiceflow.com/",                   type: "status_html" },
  { slug: "dify",            checkUrl: "https://status.dify.ai/",                         type: "status_html" },
  { slug: "crewai",          checkUrl: "https://status.crewai.com/",                      type: "status_html" },
  { slug: "langchain",       checkUrl: "https://status.langchain.com/",                   type: "status_html" },
  { slug: "langsmith",       checkUrl: "https://status.langchain.com/",                   type: "status_html" },

  // ── MLOPS ────────────────────────────────────────────────────────────────────
  { slug: "weights-and-biases", checkUrl: "https://status.wandb.ai/",                    type: "status_html" },
  { slug: "datadog-llm",     checkUrl: "https://status.datadoghq.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "langfuse",        checkUrl: "https://status.langfuse.com/",                    type: "status_html" },
  { slug: "comet-ml",        checkUrl: "https://status.comet.com/",                       type: "status_html" },
  { slug: "neptune-ai",      checkUrl: "https://status.neptune.ai/",                      type: "status_html" },
  { slug: "humanloop",       checkUrl: "https://status.humanloop.com/",                   type: "status_html" },
  { slug: "portkey",         checkUrl: "https://status.portkey.ai/",                      type: "status_html" },
  { slug: "helicone",        checkUrl: "https://status.helicone.ai/",                     type: "status_html" },

  // ── VECTOR DB ────────────────────────────────────────────────────────────────
  { slug: "mongodb-atlas-vector", checkUrl: "https://status.mongodb.com/api/v2/status.json", type: "atlassian_json" },
  { slug: "neon-pgvector",   checkUrl: "https://neonstatus.com/",                         type: "status_html" },
  { slug: "snowflake-cortex",checkUrl: "https://status.snowflake.com/api/v2/status.json", type: "atlassian_json" },

  // ── SUPPORT ──────────────────────────────────────────────────────────────────
  { slug: "zendesk-ai",      checkUrl: "https://status.zendesk.com/",                     type: "status_html" },
  { slug: "freshdesk-ai",    checkUrl: "https://status.freshworks.com/",                  type: "status_html" },
  { slug: "hubspot-ai",      checkUrl: "https://status.hubspot.com/",                     type: "status_html" },
  { slug: "salesforce-einstein", checkUrl: "https://status.salesforce.com/",              type: "status_html" },
  { slug: "intercom-fin",    checkUrl: "https://www.intercomstatus.com/api/v2/status.json",type: "atlassian_json" },
  { slug: "gong-io",         checkUrl: "https://status.gong.io/",                         type: "status_html" },
  { slug: "talkdesk-ai",     checkUrl: "https://status.talkdesk.com/",                    type: "status_html" },
];

async function probe(slug: string, checkUrl: string, type: string) {
  const start = Date.now();
  try {
    let res = await fetch(checkUrl, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
      headers: { "User-Agent": BOT_UA, "Accept": "*/*", "Cache-Control": "no-cache" },
    });
    if (res.status === 403 || res.status === 405) {
      res = await fetch(checkUrl, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: "follow",
        headers: { "User-Agent": BOT_UA, "Accept": "text/html,application/json,*/*" },
      });
    }
    return { slug, type, candidateUrl: checkUrl, httpStatus: res.status, latencyMs: Date.now() - start, ok: res.ok, errorType: null };
  } catch (err: unknown) {
    const errorType = err instanceof Error
      ? (err.name === "TimeoutError" ? "TIMEOUT" : err.message)
      : String(err);
    return { slug, type, candidateUrl: checkUrl, httpStatus: null, latencyMs: Date.now() - start, ok: false, errorType };
  }
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("Authorization");
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Batch in groups of 20 to avoid overwhelming Vercel's connection pool
  const BATCH = 20;
  const all: Awaited<ReturnType<typeof probe>>[] = [];

  for (let i = 0; i < CANDIDATES.length; i += BATCH) {
    const slice = CANDIDATES.slice(i, i + BATCH);
    const results = await Promise.all(slice.map(c => probe(c.slug, c.checkUrl, c.type)));
    all.push(...results);
  }

  const ok   = all.filter(r => r.ok);
  const fail = all.filter(r => !r.ok);

  return NextResponse.json({
    summary: { total: CANDIDATES.length, ok: ok.length, fail: fail.length },
    ok,
    fail,
  });
}
