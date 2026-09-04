import type { TopServiceContent } from "@/content/top-services/types";

// LLM — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start llm-2.ts and register it in ./index.ts if it grows.
export const LLM: Record<string, TopServiceContent> = {
  chatgpt: {
    slug: "chatgpt",
    providerSummary:
      "ChatGPT is OpenAI's consumer-facing AI assistant across web and mobile. It provides access to OpenAI chat models and tools, with plan-dependent limits and features.",
    officialStatusUrl: "https://status.openai.com",
    docsUrl: "https://help.openai.com/en/collections/3742473-chatgpt",
    pricingUrl: "https://openai.com/chatgpt/pricing/",
    communityLinks: [
      { type: "reddit", url: "https://reddit.com/r/ChatGPT", label: "r/ChatGPT", verified: true },
      { type: "reddit", url: "https://reddit.com/r/OpenAI", label: "r/OpenAI", verified: true },
      { type: "x", url: "https://x.com/OpenAI", label: "@OpenAI", verified: true },
    ],
    monitoredSurfaces: [
      { name: "ChatGPT Web", description: "Consumer web interface", criticality: "critical" },
      { name: "ChatGPT Mobile Apps", description: "Mobile backend", criticality: "high" },
      { name: "Auth / Login", description: "ChatGPT sign-in flow", criticality: "critical" },
      { name: "Conversation Backend", description: "Message submission", criticality: "critical" },
      { name: "Image Generation", description: "DALL-E image generation", criticality: "medium" },
      { name: "Voice Mode", description: "Voice mode backend", criticality: "medium" },
    ],
    statusSegmentation: ["ChatGPT", "APIs", "Codex", "Sora"],
    modelFamilies: [
      "GPT-4o / GPT-4o mini",
      "GPT-5 (2026)",
      "o1 / o3 (reasoning)",
      "DALL-E 3 (image)",
    ],
    commonLimits: [
      "Limits vary by plan and load. OpenAI's official pricing page does not publish stable message caps for all ChatGPT tiers; link users to the pricing page instead of hard-coding counts.",
    ],
    knownFailurePatterns: [
      {
        pattern: "Login failed / session expired",
        scope: "global",
        signal: "auth-related 5xx errors, reports on r/OpenAI",
        quickCheck: "Try incognito, check status page for Auth component",
      },
      {
        pattern: "Message generation stuck / empty response",
        scope: "global",
        signal: "Conversation backend degraded, specific model overloaded",
        quickCheck: "Switch model (GPT-4o mini instead of GPT-5), retry in new chat",
      },
      {
        pattern: "Chat unavailable, please try again later",
        scope: "global",
        signal: "Capacity outage or deployment rollback",
        quickCheck: "Official status page may lag early user reports",
      },
      {
        pattern: "Network error on specific network path",
        scope: "local",
        signal: "Isolated to users on specific network configurations",
        quickCheck: "Test from another trusted network and compare behavior across web/mobile",
      },
      {
        pattern: "Status divergence between ChatGPT web and API",
        scope: "partial",
        signal:
          "ChatGPT web errors while API calls succeed (or vice versa) — different infrastructures",
        quickCheck:
          "Test api.openai.com/v1/models via cURL; if API works, issue is web-side only",
      },
      {
        pattern: "Model picker missing GPT-4o / GPT-5",
        scope: "partial",
        signal: "Intermittent across users",
        quickCheck: "Hard refresh, verify subscription tier",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ChatGPT web is degraded",
        alternative:
          "OpenAI API Playground (platform.openai.com/playground) can reduce downtime for interactive workflows",
        switchingCost: "low",
      },
      {
        scenario: "ChatGPT and API both down",
        alternative: "Claude (claude.ai) can reduce downtime for general chat workloads",
        switchingCost: "low",
      },
      {
        scenario: "OpenAI ecosystem unavailable",
        alternative: "Google Gemini or Mistral Le Chat can reduce downtime for text workloads",
        switchingCost: "low",
      },
      {
        scenario: "Need offline continuity",
        alternative: "Ollama + open-weight models locally",
        switchingCost: "high",
        note: "Zero dependency after setup",
      },
    ],
    ecosystemDependencies: [
      "Many third-party apps depend on OpenAI APIs or models, but dependencies vary by vendor and can change over time",
      "Microsoft Copilot (consumer) runs on OpenAI models via Azure OpenAI (separate infrastructure)",
      "Azure OpenAI Service is a distinct infrastructure — often stays up during direct OpenAI API outages",
    ],
    operatorNotes: [
      "Community channels often surface issues before official incident pages, but reports are noisy and should be cross-checked",
      "Some incidents appear around rollout or traffic spikes, but users should rely on live probe/status signals rather than assumed outage windows",
      "Workspace SSO and chatgpt.com login path can behave differently from pure consumer login; don't classify an SSO issue as a global outage without checking",
      "During API outages, users with Azure OpenAI provisioning are often unaffected — consider fallback routing if your stack supports it",
    ],
    diagnosticHeaders: [
      "x-request-id",
      "x-ratelimit-limit-requests",
      "x-ratelimit-remaining-requests",
      "x-ratelimit-reset-requests",
      "x-ratelimit-limit-tokens",
      "x-ratelimit-remaining-tokens",
      "X-Client-Request-Id",
    ],
    diagnosticCommands: [
      `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY" — basic API reachability check`,
      "Check status.openai.com components for ChatGPT vs APIs separately",
      "Retry with a unique X-Client-Request-Id and log x-request-id from the response for support tickets",
    ],
  },
  openai: {
    slug: "openai",
    providerSummary:
      "The OpenAI API provides programmatic access to OpenAI models (chat completions, responses, realtime, images, audio, embeddings, batch, files, assistants). Different infrastructure from ChatGPT web.",
    officialStatusUrl: "https://status.openai.com",
    docsUrl: "https://platform.openai.com/docs",
    pricingUrl: "https://openai.com/api/pricing",
    communityLinks: [
      {
        type: "forum",
        url: "https://community.openai.com",
        label: "OpenAI Developer Forum",
        verified: true,
      },
      { type: "reddit", url: "https://reddit.com/r/OpenAI", label: "r/OpenAI", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Chat Completions API", description: "", criticality: "critical" },
      { name: "Responses API", description: "", criticality: "high" },
      { name: "Realtime API", description: "Streaming audio/text", criticality: "high" },
      { name: "Images API", description: "", criticality: "medium" },
      { name: "Audio API", description: "TTS/Whisper", criticality: "medium" },
      { name: "Embeddings API", description: "", criticality: "medium" },
      { name: "Batch API", description: "Async", criticality: "low" },
      { name: "Assistants API", description: "", criticality: "medium" },
      { name: "Files API", description: "", criticality: "low" },
    ],
    statusSegmentation: ["APIs", "ChatGPT", "Codex", "Sora"],
    modelFamilies: [
      "GPT-5, GPT-4o, GPT-4o mini",
      "o1, o3 (reasoning)",
      "DALL-E 3 (images)",
      "Whisper (STT), TTS",
    ],
    commonLimits: [
      "API access uses tiered rate limits (Tier 1-5) based on payment history and usage",
      "Rate limits expressed per-model in requests-per-minute (RPM) and tokens-per-minute (TPM)",
      "Tier thresholds and exact limits are published on platform.openai.com",
    ],
    knownFailurePatterns: [
      {
        pattern: "429 rate_limit_exceeded",
        scope: "local",
        signal: "x-ratelimit-remaining-* headers at zero",
        quickCheck:
          "Implement exponential backoff, review retry-after header, upgrade tier if structural",
      },
      {
        pattern: "529 / 5xx overloaded",
        scope: "global",
        signal: "Elevated error rate across accounts",
        quickCheck:
          "Retry with backoff, switch model (GPT-5 → GPT-4o), check Azure OpenAI if provisioned",
      },
      {
        pattern: "Specific endpoint degraded while others healthy",
        scope: "partial",
        signal: "e.g. Responses API fails but Chat Completions works",
        quickCheck: "Official status page with API sub-component breakdown",
      },
      {
        pattern: "401 invalid_api_key",
        scope: "local",
        signal: "Auth failure consistent across all endpoints",
        quickCheck: "Verify key, check org/project scope, regenerate if needed",
      },
      {
        pattern: "Regional latency spikes",
        scope: "partial",
        signal: "p95 latency anomalies without error rate increase",
        quickCheck: "Test from multiple regions; consider Azure OpenAI regional endpoints",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Direct OpenAI API is degraded",
        alternative:
          "Azure OpenAI Service can reduce downtime for prod workloads (separate infrastructure)",
        switchingCost: "low",
        note: "Low-medium cost if already provisioned",
      },
      {
        scenario: "Full OpenAI ecosystem unavailable",
        alternative:
          "Anthropic API, Google Gemini API, Mistral API can reduce downtime for general chat",
        switchingCost: "low",
        note: "Low cost with abstraction layer",
      },
      {
        scenario: "Embeddings API down",
        alternative: "Voyage AI or Cohere Embed are drop-in alternatives",
        switchingCost: "low",
      },
      {
        scenario: "Latency-sensitive workloads",
        alternative: "Groq (fast inference on open-weight models) can reduce latency tail",
        switchingCost: "medium",
        note: "Different model quality",
      },
    ],
    ecosystemDependencies: [
      "Many third-party apps depend on OpenAI APIs; dependency patterns vary",
      "Azure OpenAI Service is a distinct infrastructure, not a proxy",
      "Assistants API depends on Files API for attached resources",
    ],
    operatorNotes: [
      "The Azure OpenAI/direct OpenAI split is the most important fallback for production users",
      "Rate limit headers (x-ratelimit-*) return real quota state on every response — log them proactively, don't wait for 429",
      "Tier upgrades are often automatic based on spending; programmatic tier probing is unnecessary",
      "For Realtime API, connection drops are expected; implement reconnect logic, don't flag as outage",
    ],
    diagnosticHeaders: [
      "x-request-id",
      "x-ratelimit-limit-requests",
      "x-ratelimit-remaining-requests",
      "x-ratelimit-reset-requests",
      "x-ratelimit-limit-tokens",
      "x-ratelimit-remaining-tokens",
      "retry-after",
    ],
    diagnosticCommands: [
      `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY" — basic reachability + lists models`,
      `curl https://api.openai.com/v1/chat/completions -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d '{"model":"gpt-4o","messages":[{"role":"user","content":"ping"}]}' — real inference test`,
      "curl -I https://api.openai.com — TLS/DNS sanity check",
    ],
  },
  "claude-chat": {
    slug: "claude-chat",
    providerSummary:
      "Claude is Anthropic's AI assistant focused on safety and long-context reasoning. The consumer-facing product lives at claude.ai. For developer API access, see the separate Anthropic API card.",
    officialStatusUrl: "https://status.anthropic.com",
    docsUrl: "https://docs.anthropic.com",
    pricingUrl: "https://www.anthropic.com/pricing",
    communityLinks: [
      {
        type: "reddit",
        url: "https://reddit.com/r/ClaudeAI",
        label: "r/ClaudeAI",
        verified: true,
      },
      {
        type: "x",
        url: "https://x.com/AnthropicAI",
        label: "@AnthropicAI",
        verified: true,
      },
    ],
    monitoredSurfaces: [
      { name: "claude.ai", description: "Consumer web interface", criticality: "critical" },
      { name: "Claude mobile apps", description: "Mobile backend", criticality: "high" },
      { name: "Auth (claude.ai sign-in)", description: "Authentication", criticality: "critical" },
    ],
    statusSegmentation: [
      "claude.ai",
      "Claude API",
      "Claude Console (platform.claude.com)",
      "Claude Code",
    ],
    modelFamilies: [
      "Claude Opus 4.6, Claude Opus 4.1, Claude Opus 4",
      "Claude Sonnet 4.6, Claude Sonnet 4.5, Claude Sonnet 4",
      "Claude Haiku 4.5",
      "Claude Sonnet 3.7 (deprecated but still seen in legacy integrations)",
    ],
    commonLimits: [
      "claude.ai usage limits vary by plan and load; official exact caps are not publicly fixed and change with load",
      "Pro, Max, Team, Enterprise tiers available; consult pricing page for current plans",
    ],
    knownFailurePatterns: [
      {
        pattern: "Claude is temporarily unavailable on claude.ai",
        scope: "global",
        signal: "Web UI error, Claude API may still work",
        quickCheck: "Try API via platform.claude.com Workbench",
      },
      {
        pattern: "API healthy, claude.ai degraded",
        scope: "partial",
        signal: "Direct API calls succeed while web chat fails",
        quickCheck:
          "status.anthropic.com component breakdown; use API directly if you're a developer",
      },
      {
        pattern: "Long-context requests fail while short ones succeed",
        scope: "partial",
        signal: "Errors on high-token requests, success on low-token",
        quickCheck: "Reduce context, use prompt caching, try Bedrock/Vertex if available",
      },
      {
        pattern: "Authentication loop on claude.ai",
        scope: "global",
        signal: "Sign-in redirect loop, invalid session",
        quickCheck: "Clear cookies, try incognito, check status page for Auth component",
      },
      {
        pattern: "Model deprecation / model not found",
        scope: "local",
        signal: "Specific model ID returns 404 or deprecation warning",
        quickCheck: "docs.anthropic.com/models for current IDs",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "claude.ai is degraded but API works",
        alternative:
          "API Console Workbench at platform.claude.com can reduce downtime for power users",
        switchingCost: "low",
      },
      {
        scenario:
          "Direct Anthropic path is degraded and org has Bedrock/Vertex provisioned",
        alternative:
          "AWS Bedrock or Google Vertex AI (separate infrastructures hosting Claude)",
        switchingCost: "low",
      },
      {
        scenario: "All Anthropic routes unavailable",
        alternative:
          "OpenAI ChatGPT / Mistral Le Chat can reduce downtime for general chat",
        switchingCost: "low",
      },
      {
        scenario: "Claude-specific reasoning workloads",
        alternative: "Google Gemini 2.5 Pro is a close equivalent",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [
      "Cursor, Continue.dev, Zed, Claude Code — all route workloads to Claude models by default in many configurations",
      "Enterprise SaaS products often consume Claude via AWS Bedrock or Google Vertex AI rather than direct API",
      "Direct Anthropic API and Bedrock/Vertex-hosted Claude are separate infrastructures with different reliability profiles",
    ],
    operatorNotes: [
      "Direct Anthropic API and Bedrock-hosted Claude are different infrastructures. Bedrock can stay up during direct API outages.",
      "Model aliases and provider-specific model IDs differ across Claude API, Bedrock, and Vertex — a 'model not found' error may just be a cross-platform ID mismatch",
      "For long-context workloads (>100k tokens), Sonnet often has better availability than Opus during capacity incidents",
      "Claude Code has its own status component separate from claude.ai",
    ],
    diagnosticCommands: [
      "Visit status.anthropic.com — verify which component is affected (claude.ai, Claude API, Claude Code, Console)",
      "For API diagnostic, see the separate Anthropic API card",
    ],
  },
  anthropic: {
    slug: "anthropic",
    providerSummary:
      "The Anthropic API provides programmatic access to Claude models via a REST interface at https://api.anthropic.com. Also available through AWS Bedrock and Google Vertex AI as separate infrastructures.",
    officialStatusUrl: "https://status.anthropic.com",
    docsUrl: "https://docs.anthropic.com",
    pricingUrl: "https://www.anthropic.com/pricing#anthropic-api",
    communityLinks: [
      {
        type: "reddit",
        url: "https://reddit.com/r/ClaudeAI",
        label: "r/ClaudeAI",
        verified: true,
      },
      {
        type: "x",
        url: "https://x.com/AnthropicAI",
        label: "@AnthropicAI",
        verified: true,
      },
    ],
    monitoredSurfaces: [
      { name: "Claude API", description: "Direct API access", criticality: "critical" },
      {
        name: "Claude Console / Workbench",
        description: "Dev dashboard",
        criticality: "high",
      },
      {
        name: "AWS Bedrock — Claude models",
        description: "Alternate infrastructure",
        criticality: "high",
      },
      {
        name: "Google Vertex AI — Claude models",
        description: "Alternate infrastructure",
        criticality: "medium",
      },
      { name: "Message Batches API", description: "Async", criticality: "low" },
    ],
    statusSegmentation: ["Claude API", "Claude Console", "claude.ai", "Claude Code"],
    modelFamilies: [
      "Claude Opus 4.6, Claude Opus 4.1",
      "Claude Sonnet 4.6, Claude Sonnet 4.5",
      "Claude Haiku 4.5",
      "Claude Sonnet 3.7 (deprecated)",
      "Model IDs differ across Claude API, Bedrock, and Vertex — verify per-platform",
    ],
    commonLimits: [
      "Rate limits per tier; API returns real-time remaining quota via anthropic-ratelimit-* headers",
      "Prompt caching reduces input token costs significantly for repeated contexts",
      "Message Batches API offers ~50% cost reduction for async workloads",
    ],
    knownFailurePatterns: [
      {
        pattern: "429 with retry-after header",
        scope: "local",
        signal:
          "anthropic-ratelimit-requests-remaining or tokens-remaining at zero",
        quickCheck:
          "Implement backoff respecting retry-after, upgrade tier if structural",
      },
      {
        pattern: "529 overloaded",
        scope: "global",
        signal: "Sustained 529 across accounts, often model-specific",
        quickCheck:
          "Switch model (Sonnet instead of Opus), exponential backoff, consider Bedrock fallback",
      },
      {
        pattern: "400 missing anthropic-version header",
        scope: "local",
        signal: "Consistent 400 on all requests",
        quickCheck: "Ensure anthropic-version: 2023-06-01 header is set",
      },
      {
        pattern: "Direct Anthropic vs Bedrock/Vertex divergence",
        scope: "partial",
        signal:
          "Direct API degraded while Bedrock/Vertex healthy (or vice versa)",
        quickCheck: "Test the same model on both paths if provisioned",
      },
      {
        pattern: "401 invalid authentication",
        scope: "local",
        signal: "Auth failure on all endpoints",
        quickCheck: "Verify x-api-key header, check key status in Console",
      },
      {
        pattern: "Model not found across providers",
        scope: "local",
        signal: "Works on direct API, fails on Bedrock (or vice versa)",
        quickCheck: "Verify Bedrock/Vertex-specific model ID format",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Direct Anthropic API is degraded",
        alternative:
          "AWS Bedrock-hosted Claude can reduce downtime if your org is on AWS",
        switchingCost: "low",
        note: "Low cost if already provisioned",
      },
      {
        scenario: "Anthropic and Bedrock both down",
        alternative:
          "Google Vertex AI-hosted Claude is a third infrastructure path",
        switchingCost: "medium",
      },
      {
        scenario: "All Anthropic paths unavailable",
        alternative:
          "OpenAI API or Google Gemini API can reduce downtime for general chat",
        switchingCost: "low",
        note: "Low cost with abstraction layer",
      },
      {
        scenario: "Long-context workloads specifically",
        alternative: "Gemini 2.5 Pro handles very long contexts",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [
      "Claude Code depends on Anthropic API + auth",
      "Cursor, Continue.dev route to Claude models by default for many users",
      "Enterprise deployments often prefer Bedrock/Vertex for SLA and compliance",
    ],
    operatorNotes: [
      "The anthropic-version header is required on every request — missing it returns a 400 that juniors often misdiagnose as an endpoint outage",
      "Monitor anthropic-ratelimit-* headers proactively — don't wait for 429s",
      "Prompt caching changes effective rate limits dramatically; measure with caching enabled",
      "For high-volume prod: provision Bedrock or Vertex as a fallback route; it's a different infrastructure, often unaffected by direct API incidents",
    ],
    diagnosticHeaders: [
      "retry-after",
      "anthropic-ratelimit-requests-limit",
      "anthropic-ratelimit-requests-remaining",
      "anthropic-ratelimit-requests-reset",
      "anthropic-ratelimit-input-tokens-limit",
      "anthropic-ratelimit-input-tokens-remaining",
      "anthropic-ratelimit-output-tokens-limit",
      "anthropic-ratelimit-output-tokens-remaining",
      "request-id",
    ],
    diagnosticCommands: [
      `curl https://api.anthropic.com/v1/models -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" — reachability + model list`,
      `curl https://api.anthropic.com/v1/messages -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" -d '{"model":"claude-sonnet-4-5","max_tokens":10,"messages":[{"role":"user","content":"ping"}]}' — real inference test`,
      "Check status.anthropic.com for component-level breakdown (API vs Console vs claude.ai vs Claude Code)",
    ],
  },
  "google-gemini": {
    slug: "google-gemini",
    providerSummary:
      "Google's flagship AI assistant across Gemini web/mobile and Google's developer/enterprise AI stack. Available via gemini.google.com, AI Studio (free dev access), and Vertex AI (enterprise).",
    officialStatusUrl: "https://status.cloud.google.com",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    pricingUrl: "https://ai.google.dev/pricing",
    communityLinks: [
      {
        type: "reddit",
        url: "https://reddit.com/r/GoogleGeminiAI",
        label: "r/GoogleGeminiAI",
        verified: true,
      },
      { type: "x", url: "https://x.com/GoogleAI", label: "@GoogleAI", verified: true },
    ],
    monitoredSurfaces: [
      {
        name: "Gemini Web",
        description: "Consumer web interface",
        criticality: "critical",
      },
      { name: "Gemini Mobile Apps", description: "Mobile backend", criticality: "high" },
      { name: "Gemini API", description: "Developer API", criticality: "critical" },
      { name: "Google AI Studio", description: "Dev playground", criticality: "high" },
      {
        name: "Vertex AI — Gemini models",
        description: "Enterprise infrastructure",
        criticality: "critical",
      },
      {
        name: "Workspace integration",
        description: "Google Workspace AI features",
        criticality: "medium",
      },
    ],
    statusSegmentation: ["Vertex AI", "Google AI Studio", "Gemini API", "Workspace"],
    modelFamilies: [
      "Gemini 2.5 Pro, Gemini 2.5 Flash",
      "Gemini 2.0 Flash / Flash-Lite",
      "Gemini Nano (on-device)",
    ],
    commonLimits: [
      "Free tier available via AI Studio with per-minute rate limits",
      "Paid API access via AI Studio or Vertex AI with tier-based quotas",
      "Vertex AI offers quota increases via GCP console",
    ],
    knownFailurePatterns: [
      {
        pattern: "Something went wrong on gemini.google.com",
        scope: "global",
        signal: "Web UI error, API may still work",
        quickCheck:
          "Try AI Studio directly, check Google Cloud status for Vertex AI component",
      },
      {
        pattern: "Image generation blocked by content filter",
        scope: "local",
        signal: "Specific prompts fail, others work",
        quickCheck: "Rephrase prompt, not a platform issue",
      },
      {
        pattern: "API 429 quota exceeded",
        scope: "local",
        signal: "Rate limit headers from Google API",
        quickCheck: "AI Studio console for quota status, upgrade tier or move to Vertex",
      },
      {
        pattern: "AI Studio healthy, Vertex AI degraded (or vice versa)",
        scope: "partial",
        signal: "Different infrastructures can fail independently",
        quickCheck: "Test both paths if your stack supports it",
      },
      {
        pattern: "Workspace integration lag",
        scope: "partial",
        signal: "Gmail/Docs AI slow while gemini.google.com normal",
        quickCheck: "Workspace status dashboard separately",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "gemini.google.com is down",
        alternative: "AI Studio can reduce downtime for dev workflows",
        switchingCost: "low",
      },
      {
        scenario: "AI Studio is down",
        alternative:
          "Vertex AI (separate infrastructure) can reduce downtime",
        switchingCost: "low",
        note: "Low-medium if on GCP",
      },
      {
        scenario: "Full Google AI stack unavailable",
        alternative:
          "OpenAI API or Anthropic API can reduce downtime",
        switchingCost: "low",
        note: "Low cost with abstraction layer",
      },
      {
        scenario: "Long-context workloads",
        alternative:
          "Claude API is a close alternative for >1M token handling",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [
      "Workspace AI features depend on Gemini backend",
      "Android integration (Gemini assistant) depends on cloud API",
      "Vertex AI and AI Studio are separate infrastructures; enterprise Vertex users often unaffected by gemini.google.com outages",
    ],
    operatorNotes: [
      "Vertex AI and AI Studio route through different quota pools; verify which one your workload uses",
      "Google's status page covers Vertex AI but not gemini.google.com directly — consumer UI outages may not be flagged",
      "Workspace integration can degrade independently of core Gemini — check the right status dashboard",
      "Gemini models have the longest context windows in the industry; tooling that assumes OpenAI-style token limits may underestimate capacity",
    ],
    diagnosticHeaders: ["x-goog-api-client", "x-goog-quota-user"],
    diagnosticCommands: [
      `curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" — basic reachability + model list`,
      "Check status.cloud.google.com for Vertex AI component status",
      "For enterprise debugging, Google Cloud Console has per-quota monitoring",
    ],
  },
  deepseek: {
    slug: "deepseek",
    providerSummary:
      "Chinese AI lab producing open-weight frontier models (DeepSeek V3, R1 reasoning, Coder). Direct web/API access at deepseek.com; models also hosted on multiple third-party inference providers.",
    officialStatusUrl: "https://status.deepseek.com",
    docsUrl: "https://api-docs.deepseek.com",
    pricingUrl: "https://api-docs.deepseek.com/quick_start/pricing",
    communityLinks: [
      {
        type: "github",
        url: "https://github.com/deepseek-ai",
        label: "deepseek-ai",
        verified: true,
      },
      {
        type: "reddit",
        url: "https://reddit.com/r/DeepSeek",
        label: "r/DeepSeek",
        verified: true,
      },
      {
        type: "x",
        url: "https://x.com/deepseek_ai",
        label: "@deepseek_ai",
        verified: true,
      },
    ],
    monitoredSurfaces: [
      {
        name: "chat.deepseek.com",
        description: "Consumer web interface",
        criticality: "critical",
      },
      { name: "DeepSeek mobile apps", description: "Mobile backend", criticality: "high" },
      { name: "DeepSeek API", description: "Developer API", criticality: "critical" },
    ],
    statusSegmentation: ["Web", "API", "Mobile"],
    modelFamilies: [
      "DeepSeek V3 (general chat)",
      "DeepSeek R1 (reasoning)",
      "DeepSeek Coder",
    ],
    commonLimits: [
      "OpenAI-compatible API with per-token pricing",
      "Rate limits per account; consult api-docs.deepseek.com for current tier structure",
    ],
    knownFailurePatterns: [
      {
        pattern: "Capacity constraints during viral demand spikes",
        scope: "global",
        signal: "Sustained 429 or 5xx across accounts",
        quickCheck:
          "Use third-party hosted DeepSeek (Together AI, Fireworks, Groq) as fallback",
      },
      {
        pattern: "Regional access variability",
        scope: "partial",
        signal: "Some users report access issues, others not",
        quickCheck:
          "Test from multiple network paths; third-party hosts may be more consistent",
      },
      {
        pattern: "API 429 during US business hours",
        scope: "partial",
        signal: "Rate limits concentrated during peak global demand",
        quickCheck:
          "Schedule batch workloads off-peak, use third-party hosts",
      },
      {
        pattern: "Model cold start latency",
        scope: "partial",
        signal: "First request slow, subsequent fast",
        quickCheck: "Warm up with ping request before prod traffic",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Direct DeepSeek API is degraded",
        alternative:
          "Together AI, Fireworks AI, or Groq host DeepSeek models as OpenAI-compatible APIs",
        switchingCost: "low",
        note: "Base URL swap",
      },
      {
        scenario: "All DeepSeek paths unavailable — reasoning workloads",
        alternative:
          "OpenAI o1/o3 or Claude Opus can reduce downtime",
        switchingCost: "low",
      },
      {
        scenario: "Self-hosted resilience needed",
        alternative:
          "DeepSeek models are open-weight, can be run via vLLM or Ollama",
        switchingCost: "high",
      },
      {
        scenario: "Coding workloads specifically",
        alternative:
          "Qwen 2.5 Coder or Llama 3.3 (via Groq/Together) are alternatives",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [
      "DeepSeek models are open-weight — many third-party inference providers host them",
      "Cursor, Continue.dev, and OpenRouter offer DeepSeek model routing",
    ],
    operatorNotes: [
      "Unlike closed-weight providers, DeepSeek has a real 'reseller market' — Together AI, Fireworks AI, DeepInfra, Groq all host DeepSeek R1 and V3 with different reliability profiles",
      "When direct DeepSeek API is down, the fastest fallback is a base-URL swap to a third-party host",
      "DeepSeek API is OpenAI-compatible: client libraries work with minimal code changes",
    ],
    diagnosticCommands: [
      `curl https://api.deepseek.com/v1/models -H "Authorization: Bearer $DEEPSEEK_API_KEY" — reachability`,
      "OpenAI-compatible: existing OpenAI client code works by changing base_url",
      "Fallback test: swap to https://api.together.xyz/v1 with Together API key to test same model",
    ],
  },
  ollama: {
    slug: "ollama",
    providerSummary:
      "Popular local LLM runtime with local API, CLI, and cloud-hosted models. Official docs explicitly document integrations with tools such as Claude Code and Codex via ollama launch.",
    officialStatusUrl: "https://status.ollama.com",
    docsUrl: "https://docs.ollama.com",
    pricingUrl: "https://ollama.com/pricing",
    communityLinks: [
      {
        type: "github",
        url: "https://github.com/ollama/ollama/issues",
        label: "ollama/ollama issues",
        verified: true,
      },
      {
        type: "discord",
        url: "https://discord.gg/ollama",
        label: "Ollama Discord",
        verified: true,
      },
      {
        type: "reddit",
        url: "https://reddit.com/r/ollama",
        label: "r/ollama",
        verified: true,
      },
      { type: "x", url: "https://x.com/ollama", label: "@ollama", verified: true },
    ],
    monitoredSurfaces: [
      {
        name: "Ollama Registry",
        description: "Critical for new model pulls",
        criticality: "critical",
      },
      {
        name: "Ollama Cloud API",
        description: "Managed inference (public beta since Jan 2026)",
        criticality: "high",
      },
      { name: "Ollama website", description: "Docs, downloads", criticality: "medium" },
    ],
    statusSegmentation: ["Cloud", "Registry", "Web"],
    modelFamilies: [
      "User pulls what they want: Llama 3.3, Qwen 2.5, Mistral, Phi-3, DeepSeek R1, Gemma, etc.",
      "Also supports vision models (LLaVA, Llama 3.2 Vision) and embedding models",
    ],
    commonLimits: [
      "Local deployment: unlimited, bounded only by user hardware (RAM, VRAM, disk)",
      "Ollama Cloud: authenticated via API key, tiered plans (Free / Pro / Max); usage limits reset hourly and weekly per official pricing",
      "No auth required for localhost API; auth required for Cloud API",
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud healthy, local daemon unhealthy (or inverse)",
        scope: "partial",
        signal:
          "Local ollama commands fail, Cloud API works (or vice versa)",
        quickCheck:
          "curl http://localhost:11434/api/tags for local; status.ollama.com for Cloud",
      },
      {
        pattern: "pull failed / model not found on new model",
        scope: "partial",
        signal: "Registry connection fails",
        quickCheck:
          "curl -I https://registry.ollama.ai/v2/library/<model>/manifests/latest; if 5xx, Registry is down but models already cached work",
      },
      {
        pattern: "connection refused to localhost:11434",
        scope: "local",
        signal:
          "Most 'Ollama is down' reports are this — daemon not running",
        quickCheck: "Run ollama serve, restart via systemd/LaunchAgent",
      },
      {
        pattern: "Slow generation / hangs",
        scope: "local",
        signal: "Swap thrashing, GPU OOM, context too long",
        quickCheck:
          "ollama ps, reduce context window, use quantized model",
      },
      {
        pattern: "Cloud API 401 unauthorized",
        scope: "local",
        signal: "Cloud-only failure",
        quickCheck: "Regenerate key at ollama.com/settings/keys",
      },
      {
        pattern: "Model fails to load after pull",
        scope: "local",
        signal: "Modelfile load failure, OOM — disk/RAM insufficient",
        quickCheck: "Check disk space, try smaller quantization (Q4_K_M vs Q8)",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Registry is down but you need a cached model",
        alternative: "Local ollama run <cached-model> continues to work",
        switchingCost: "low",
      },
      {
        scenario: "Registry down and need new model",
        alternative: "Hugging Face direct download + Modelfile import",
        switchingCost: "medium",
      },
      {
        scenario: "Ollama Cloud degraded",
        alternative:
          "Groq, Together AI, Fireworks AI host many of the same open-weight models via OpenAI-compatible APIs",
        switchingCost: "low",
      },
      {
        scenario: "Local daemon unstable on current hardware",
        alternative: "LM Studio (GUI) is a drop-in alternative for the same models",
        switchingCost: "low",
      },
      {
        scenario: "Local daemon is healthy but model pull fails",
        alternative:
          "Test already-cached local models before switching provider",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [
      "Integrates with: Claude Code, Codex CLI, Continue.dev, Zed, Cursor, Raycast AI, Open WebUI, LobeChat, LangChain, LlamaIndex",
      "Ollama docs now explicitly support launching external integrations like Claude Code and Codex via ollama launch",
      "Models pulled from: Ollama Registry + Hugging Face (direct URL)",
      "Runs on: macOS, Linux, Windows, Docker",
    ],
    operatorNotes: [
      "Key distinction: local Ollama and Ollama Cloud are different infrastructures. Local can work fine while Cloud is down, and vice versa.",
      "Auth difference: localhost API requires no authentication; Cloud API requires API key. Never expose localhost:11434 to the public internet without auth middleware.",
      "Check ollama --version and compare with the latest release if you suspect daemon/model compatibility issues",
      "Many 'Ollama is down' reports are actually local daemon or hardware issues rather than platform outages",
      "When downforai shows Ollama 'operational', we monitor the Cloud registry and API; local runs are the user's responsibility",
    ],
    diagnosticCommands: [
      "curl http://localhost:11434/api/tags — local daemon reachability (should return installed models list)",
      `curl http://localhost:11434/api/chat -d '{"model":"llama3.3","messages":[{"role":"user","content":"ping"}]}' — real local inference test`,
      "ollama ps — active model processes",
      "ollama ls — list installed models",
      "ollama serve — start daemon manually",
      "ollama pull <model> — test Registry connectivity by pulling a small model",
    ],
  },
  "xai-grok": {
    slug: "xai-grok",
    providerSummary:
      "xAI's conversational AI, integrated into X/Twitter and available via grok.com and xAI API.",
    docsUrl: "https://docs.x.ai",
    pricingUrl: "https://x.ai/api",
    communityLinks: [
      { type: "x", url: "https://x.com/xai", label: "@xai" },
      { type: "x", url: "https://x.com/grok", label: "@grok" },
      { type: "reddit", url: "https://reddit.com/r/GrokAI", label: "r/GrokAI" },
    ],
    monitoredSurfaces: [
      { name: "grok.com", description: "", criticality: "critical" },
      { name: "X platform integration", description: "", criticality: "high" },
      { name: "xAI API", description: "", criticality: "medium" },
    ],
    modelFamilies: ["Grok 3", "Grok 3 Reasoning", "Grok Imagine (image)"],
    knownFailurePatterns: [
      {
        pattern: "X platform outages cascade to Grok on X",
        scope: "partial",
        signal: "Grok on X fails while grok.com remains accessible",
        quickCheck: "Check official X status page",
      },
      {
        pattern: "grok.com stays up independently of X platform",
        scope: "partial",
        signal: "grok.com healthy while X integration is degraded",
        quickCheck: "Access grok.com directly as fallback",
      },
      {
        pattern: "API rate limits",
        scope: "local",
        signal: "429 responses from api.x.ai",
        quickCheck: "Check rate limit headers, reduce request frequency",
      },
      {
        pattern: "Image generation content filtering",
        scope: "local",
        signal: "Specific image prompts rejected",
        quickCheck: "Rephrase prompt, check xAI content policy",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "X integration fails",
        alternative: "grok.com can reduce downtime",
        switchingCost: "low",
      },
      {
        scenario: "Grok fully unavailable",
        alternative: "ChatGPT or Claude for general workloads",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [
      "Grok on X depends on X platform; grok.com and API are separate paths",
    ],
    operatorNotes: [
      "Grok on X and grok.com are separate entry points — verify which one is affected before generalizing",
    ],
  },
  "microsoft-copilot": {
    slug: "microsoft-copilot",
    providerSummary:
      "Microsoft's consumer AI assistant (separate from Microsoft 365 Copilot). Runs on OpenAI models via Azure OpenAI.",
    officialStatusUrl: "https://status.microsoft.com",
    docsUrl: "https://learn.microsoft.com/en-us/copilot/",
    pricingUrl: "https://www.microsoft.com/en-us/microsoft-copilot",
    communityLinks: [
      { type: "reddit", url: "https://reddit.com/r/CopilotPro", label: "r/CopilotPro" },
    ],
    monitoredSurfaces: [
      { name: "copilot.microsoft.com", description: "", criticality: "critical" },
      { name: "Windows integration", description: "", criticality: "high" },
      { name: "Edge integration", description: "", criticality: "medium" },
      { name: "Mobile apps", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Azure OpenAI capacity issues cascade",
        scope: "partial",
        signal: "Degraded responses or timeouts during Azure OpenAI incidents",
        quickCheck: "Check Azure status page for Azure OpenAI component",
      },
      {
        pattern: "Edge-specific bugs",
        scope: "local",
        signal: "Edge integration fails while copilot.microsoft.com works",
        quickCheck: "Test on copilot.microsoft.com directly",
      },
      {
        pattern: "Confusion with Microsoft 365 Copilot",
        scope: "local",
        signal: "Users reporting issues on wrong product",
        quickCheck: "Verify which product is being used — consumer Copilot vs M365 Copilot",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Microsoft Copilot is degraded",
        alternative:
          "ChatGPT directly can reduce downtime (bypasses Microsoft layer)",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [
      "Azure OpenAI Service (different from direct OpenAI API)",
    ],
    operatorNotes: [
      "Consumer Microsoft Copilot and Microsoft 365 Copilot are distinct products with different status scopes — verify which one users mean",
    ],
  },
  "character-ai": {
    slug: "character-ai",
    providerSummary:
      "AI companion and roleplay platform. High-concurrency long-polling sessions, heavy load scaling.",
    officialStatusUrl: "https://status.character.ai",
    docsUrl: "https://support.character.ai",
    pricingUrl: "https://character.ai/plus",
    communityLinks: [
      { type: "reddit", url: "https://reddit.com/r/CharacterAI", label: "r/CharacterAI" },
      { type: "discord", url: "https://discord.gg/characterai", label: "Character.AI Discord" },
      { type: "x", url: "https://x.com/character_ai", label: "@character_ai" },
    ],
    monitoredSurfaces: [
      { name: "character.ai web", description: "", criticality: "critical" },
      { name: "Mobile apps (iOS/Android)", description: "", criticality: "high" },
      { name: "Chat infrastructure", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Servers at capacity during peak",
        scope: "global",
        signal: "Error messages indicating server overload",
        quickCheck: "Wait and retry; check r/CharacterAI for confirmation",
      },
      {
        pattern: "Conversation state loss",
        scope: "partial",
        signal: "Chat history missing or reset",
        quickCheck: "Check if account is logged in; refresh session",
      },
      {
        pattern: "Content filter changes (often mistaken for outages)",
        scope: "partial",
        signal: "Specific character types or topics suddenly fail",
        quickCheck: "Check r/CharacterAI for filter update announcements",
      },
      {
        pattern: "Image gen delays",
        scope: "partial",
        signal: "Image generation slow or failing while chat works",
        quickCheck: "Check status page for image generation component",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Character.AI is degraded",
        alternative:
          "Alternative roleplay platforms (Chub.ai, Janitor AI, SpicyChat) can reduce downtime",
        switchingCost: "low",
        note: "Different content policies",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Periodic content filter changes are often perceived as outages — monitor reddit to distinguish filter updates from real incidents",
    ],
  },
  poe: {
    slug: "poe",
    providerSummary:
      "Quora's multi-model aggregator. Access multiple AI models (Claude, GPT, Gemini, DeepSeek, custom bots) via one interface.",
    docsUrl: "https://creator.poe.com/docs",
    pricingUrl: "https://poe.com/subscribe",
    communityLinks: [
      { type: "reddit", url: "https://reddit.com/r/PoeAI", label: "r/PoeAI" },
    ],
    monitoredSurfaces: [
      { name: "poe.com", description: "", criticality: "critical" },
      { name: "Poe mobile apps", description: "", criticality: "high" },
      { name: "Bot creator API", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Specific model bots fail (upstream cascade, often timeout before clear error)",
        scope: "partial",
        signal: "Individual model bot fails while others work",
        quickCheck: "Check the original model provider's status",
      },
      {
        pattern: "Compute points exhausted (quota, not outage)",
        scope: "local",
        signal: "Points balance at zero, no error message from provider",
        quickCheck: "Check compute points balance in Poe account",
      },
      {
        pattern: "Custom bot timeouts",
        scope: "partial",
        signal: "Custom bots time out while standard bots work",
        quickCheck: "Check the external API endpoint powering the custom bot",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Poe is degraded",
        alternative:
          "Direct providers (ChatGPT, claude.ai, gemini.google.com) can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [
      "Poe is a middle layer — fails when upstream (OpenAI/Anthropic/Google) fails",
    ],
    operatorNotes: [
      "Poe's UI often spins on upstream failures rather than returning a clear 5xx; check the original model provider's status before concluding Poe-wide outage",
    ],
  },
  "le-chat-mistral": {
    slug: "le-chat-mistral",
    providerSummary:
      "European LLM champion's consumer chat app. Free tier; strong multilingual and coding.",
    officialStatusUrl: "https://status.mistral.ai",
    docsUrl: "https://docs.mistral.ai",
    pricingUrl: "https://mistral.ai/pricing",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/mistralai", label: "Mistral Discord" },
      { type: "x", url: "https://x.com/MistralAI", label: "@MistralAI" },
    ],
    monitoredSurfaces: [
      { name: "chat.mistral.ai", description: "", criticality: "critical" },
      { name: "Mobile apps", description: "", criticality: "high" },
    ],
    modelFamilies: [
      "Mistral Large",
      "Mistral Small",
      "Codestral (code)",
      "Pixtral (vision)",
    ],
    knownFailurePatterns: [
      {
        pattern: "Capacity issues during peak EU hours",
        scope: "partial",
        signal: "Slow responses or errors during EU business hours",
        quickCheck: "Check status.mistral.ai, try off-peak hours",
      },
      {
        pattern: "Region-specific latency",
        scope: "partial",
        signal: "Latency higher for specific geographic regions",
        quickCheck: "Test from different regions or use La Plateforme API",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Le Chat is degraded",
        alternative:
          "La Plateforme API playground can reduce downtime",
        switchingCost: "low",
      },
      {
        scenario: "Open-weight Mistral models needed",
        alternative: "Groq/Together AI host them",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Le Chat uses La Plateforme API backend"],
    operatorNotes: [
      "Mistral models are partly open-weight — Hugging Face / Ollama self-host is a resilient fallback for some models",
    ],
  },
  mistral: {
    slug: "mistral",
    providerSummary:
      "Mistral's direct API (La Plateforme) and Codestral API for code workloads.",
    officialStatusUrl: "https://status.mistral.ai",
    docsUrl: "https://docs.mistral.ai",
    pricingUrl: "https://mistral.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.mistral.ai", description: "", criticality: "critical" },
      { name: "Codestral API", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tier-based rate limits",
        scope: "local",
        signal: "429 responses based on tier quota",
        quickCheck: "Check quota in La Plateforme dashboard",
      },
      {
        pattern: "Codestral endpoint latency",
        scope: "partial",
        signal: "Higher latency on Codestral vs other endpoints",
        quickCheck: "Check status.mistral.ai for Codestral component",
      },
      {
        pattern: "EU region-specific capacity",
        scope: "partial",
        signal: "Capacity issues during peak EU hours",
        quickCheck: "Check status.mistral.ai, try off-peak hours",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Direct API is degraded",
        alternative: "AWS Bedrock hosts Mistral models as alternate infrastructure",
        switchingCost: "low",
        note: "Low-medium cost if already provisioned",
      },
      {
        scenario: "Open-weight Mistral needed",
        alternative: "Groq/Together AI host open-weight Mistral",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Mistral models on Bedrock are a separate infrastructure; can stay up during direct API issues",
    ],
  },
  cohere: {
    slug: "cohere",
    providerSummary:
      "Enterprise-focused LLM provider. Strong embeddings, RAG, multilingual (Aya). Canadian company.",
    officialStatusUrl: "https://status.cohere.com",
    docsUrl: "https://docs.cohere.com",
    pricingUrl: "https://cohere.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "api.cohere.com",
        description: "Chat, Generate, Embed, Rerank, Tools",
        criticality: "critical",
      },
    ],
    modelFamilies: ["Command R+", "Command R", "Aya (multilingual)", "Embed v3"],
    knownFailurePatterns: [
      {
        pattern: "Trial key rate limits",
        scope: "local",
        signal: "429 on trial API keys",
        quickCheck: "Upgrade to paid tier or request quota increase",
      },
      {
        pattern: "Embed endpoint spikes",
        scope: "partial",
        signal: "Embed API latency spikes during high load",
        quickCheck: "Check status.cohere.com for embed component",
      },
      {
        pattern: "Aya multilingual timeouts",
        scope: "partial",
        signal: "Aya model requests time out",
        quickCheck: "Retry with backoff; check status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Cohere Embed is degraded",
        alternative:
          "Voyage AI and OpenAI text-embedding-3 can reduce downtime for RAG",
        switchingCost: "low",
      },
      {
        scenario: "Cohere chat is degraded",
        alternative: "OpenAI/Anthropic for chat",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Cohere's Embed API is strong at scale for RAG — Voyage AI is the closest drop-in replacement",
    ],
  },
  lmstudio: {
    slug: "lmstudio",
    providerSummary:
      "Desktop GUI for running local LLMs. Alternative to Ollama with visual model management.",
    docsUrl: "https://lmstudio.ai/docs",
    pricingUrl: "https://lmstudio.ai",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/lmstudio", label: "LM Studio Discord" },
      {
        type: "github",
        url: "https://github.com/lmstudio-ai/lmstudio",
        label: "lmstudio-ai/lmstudio",
      },
    ],
    monitoredSurfaces: [
      {
        name: "lmstudio.ai",
        description: "Download + catalog via HF",
        criticality: "critical",
      },
    ],
    knownFailurePatterns: [
      {
        pattern: "App crash on model load",
        scope: "local",
        signal: "LM Studio crashes when loading specific models",
        quickCheck: "Try smaller quantization, check available RAM/VRAM",
      },
      {
        pattern: "HF download rate limit",
        scope: "partial",
        signal: "Model download fails or is throttled from Hugging Face",
        quickCheck: "Verify HF token is set; retry later",
      },
      {
        pattern: "Local server port conflicts",
        scope: "local",
        signal: "LM Studio server fails to start on default port",
        quickCheck: "Check if another process occupies port 1234; change port in settings",
      },
      {
        pattern: "Hardware saturation",
        scope: "local",
        signal: "Generation very slow or unresponsive",
        quickCheck: "Use smaller model or lower quantization; monitor GPU/RAM usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LM Studio has issues",
        alternative: "Ollama, Jan.ai, GPT4All are alternative local runtimes",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Most 'LM Studio is down' reports are local issues; real outages are HF catalog-side",
    ],
  },
  openrouter: {
    slug: "openrouter",
    providerSummary:
      "Multi-provider LLM routing API. Access many models (OpenAI, Anthropic, Google, open-weight) via one OpenAI-compatible interface.",
    officialStatusUrl: "https://status.openrouter.ai",
    docsUrl: "https://openrouter.ai/docs",
    pricingUrl: "https://openrouter.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "openrouter.ai", description: "", criticality: "critical" },
      { name: "API (openrouter.ai/api/v1)", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Upstream provider cascades",
        scope: "partial",
        signal: "Specific provider's models fail while others work",
        quickCheck: "Check individual provider status; switch to alternate model",
      },
      {
        pattern: "Specific model routing errors",
        scope: "partial",
        signal: "Specific model returns routing error",
        quickCheck: "Try alternate model or provider; check OpenRouter status",
      },
      {
        pattern: "Credit top-up issues",
        scope: "local",
        signal: "Credit balance not updated after top-up",
        quickCheck: "Check OpenRouter dashboard; contact support if delayed",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "OpenRouter is degraded",
        alternative:
          "Direct provider APIs (OpenAI, Anthropic, Google) can reduce downtime",
        switchingCost: "low",
        note: "Requires per-provider keys",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "OpenRouter is a routing layer — most failures trace back to specific upstream providers. Check individual model provider status before concluding OpenRouter-wide outage.",
    ],
  },
  "tencent-hunyuan": {
    slug: "tencent-hunyuan",
    providerSummary:
      "Tencent's LLM family. Strong multilingual (especially Chinese-native), available via Tencent Cloud.",
    officialStatusUrl: "https://status.cloud.tencent.com",
    docsUrl: "https://cloud.tencent.com/document/product/1729",
    pricingUrl: "https://cloud.tencent.com/product/hunyuan",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Tencent Cloud AI API", description: "", criticality: "critical" },
      { name: "Hunyuan models", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tencent Cloud regional outages cascade",
        scope: "partial",
        signal: "Regional Tencent Cloud outage affects Hunyuan",
        quickCheck: "Check status.cloud.tencent.com for regional status",
      },
      {
        pattern: "Cross-border latency issues",
        scope: "partial",
        signal: "Higher latency for users outside mainland China",
        quickCheck: "Expected baseline; use closer regional endpoint if available",
      },
      {
        pattern: "Documentation primarily in Chinese",
        scope: "local",
        signal: "Difficulty navigating documentation in non-Chinese languages",
        quickCheck: "Use machine translation; check English documentation if available",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Hunyuan is degraded",
        alternative:
          "DeepSeek (Chinese-native), Qwen (Alibaba), direct OpenAI can reduce downtime for Chinese workloads",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Tencent Cloud is strongest in mainland China regions — cross-border users may experience higher latency as baseline",
    ],
  },
  lmarena: {
    slug: "lmarena",
    providerSummary:
      "LLM benchmarking platform via crowd-sourced blind comparisons (Elo ranking). Used by researchers and devs to evaluate model quality.",
    docsUrl: "https://lmarena.ai/docs",
    communityLinks: [
      { type: "x", url: "https://x.com/laborai_lmsys", label: "@laborai_lmsys", verified: false },
    ],
    monitoredSurfaces: [
      { name: "lmarena.ai", description: "Web arena interface", criticality: "critical" },
      { name: "Arena Battle Backend", description: "Model comparison execution", criticality: "critical" },
      { name: "Leaderboard API", description: "Elo ranking data", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "High traffic during model launches",
        scope: "global",
        signal: "Queue timeouts spike around major model releases",
        quickCheck: "Try again at off-peak hours — expected behavior, not a hard outage",
      },
      {
        pattern: "Queue timeout on battle request",
        scope: "global",
        signal: "Battle initiation fails or hangs",
        quickCheck: "Retry; check LMArena Twitter for capacity notices",
      },
      {
        pattern: "Specific model backend unavailable",
        scope: "partial",
        signal: "One model in a comparison fails to respond",
        quickCheck: "Restart the arena battle to get a different model pair",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LMArena is degraded",
        alternative:
          "Artificial Analysis or open leaderboard data can provide benchmark comparisons",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Traffic spikes massively around major model releases — queue delays during launch events are expected, not outages.",
    ],
  },
  "moonshot-kimi": {
    slug: "moonshot-kimi",
    providerSummary:
      "Chinese AI lab Moonshot's assistant. Strong long-context capabilities. Popular in China and expanding internationally.",
    docsUrl: "https://platform.moonshot.cn/docs",
    pricingUrl: "https://platform.moonshot.cn/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "kimi.moonshot.cn", description: "Consumer web chat", criticality: "critical" },
      { name: "Moonshot API", description: "Developer API (platform.moonshot.cn)", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Regional access variability",
        scope: "partial",
        signal: "Access differs by country or network",
        quickCheck: "Test from different region; check for geo-restrictions",
      },
      {
        pattern: "Capacity constraints during Chinese business hours",
        scope: "global",
        signal: "Slow responses or queuing during peak hours (UTC+8 9–18h)",
        quickCheck: "Retry off-peak; switch to API with retry logic",
      },
      {
        pattern: "Long-context requests slower",
        scope: "local",
        signal: "Very long prompts (100k+ tokens) take significantly longer",
        quickCheck: "Expected behavior — not an outage; reduce context if latency-sensitive",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Moonshot Kimi is degraded",
        alternative:
          "DeepSeek or Qwen are Chinese-native alternatives at low cost; Claude or Gemini for international long-context use",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  genspark: {
    slug: "genspark",
    providerSummary:
      "AI agent platform for open-ended research and tasks. $300M Series B, $100M ARR run rate.",
    docsUrl: "https://www.genspark.ai/help",
    pricingUrl: "https://www.genspark.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "genspark.ai", description: "Web interface", criticality: "critical" },
      { name: "Agent Execution Backend", description: "Research and task agent runner", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent task timeouts",
        scope: "global",
        signal: "Research tasks fail to complete within expected time",
        quickCheck: "Retry with a narrower task scope",
      },
      {
        pattern: "Research quality variability",
        scope: "local",
        signal: "Results inconsistent across similar queries",
        quickCheck: "Rephrase query; not always an infrastructure issue",
      },
      {
        pattern: "Capacity during peak hours",
        scope: "global",
        signal: "Slow task initiation or queue delays",
        quickCheck: "Retry off-peak; check Genspark announcements",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Genspark is degraded",
        alternative:
          "Perplexity (research) or Manus (tasks) can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  quillbot: {
    slug: "quillbot",
    providerSummary:
      "AI paraphrasing, grammar checking, summarization. Strong in academic and student use cases.",
    docsUrl: "https://help.quillbot.com",
    pricingUrl: "https://quillbot.com/premium",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "quillbot.com", description: "Web paraphraser and tools", criticality: "critical" },
      { name: "Chrome Extension", description: "Browser extension", criticality: "high" },
      { name: "Paraphraser API", description: "Backend paraphrasing service", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Paraphraser quota limits on free tier",
        scope: "local",
        signal: "Word limit reached for the day",
        quickCheck: "Upgrade to Premium or wait for daily reset",
      },
      {
        pattern: "Chrome extension conflicts",
        scope: "local",
        signal: "Extension not working in specific browser context",
        quickCheck: "Try the web app directly; update or reinstall extension",
      },
      {
        pattern: "Slow processing on long texts",
        scope: "global",
        signal: "Paraphrasing hangs on large inputs",
        quickCheck: "Break text into smaller chunks; check server load",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "QuillBot is degraded",
        alternative:
          "Grammarly, WordTune, or ChatGPT can reduce downtime for paraphrasing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "alibaba-qwen": {
    slug: "alibaba-qwen",
    providerSummary:
      "Alibaba Cloud's open-weight LLM family. Qwen 2.5 is among the best open models. Strong multilingual including Chinese.",
    docsUrl: "https://qwen.readthedocs.io",
    communityLinks: [
      { type: "github", url: "https://github.com/QwenLM/Qwen2.5", label: "QwenLM/Qwen2.5", verified: true },
    ],
    monitoredSurfaces: [
      { name: "DashScope API", description: "Alibaba Cloud hosted inference", criticality: "critical" },
      { name: "HuggingFace Models", description: "Qwen model downloads on HuggingFace", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "DashScope regional availability",
        scope: "partial",
        signal: "Hosted inference unavailable in certain regions",
        quickCheck: "Check Alibaba Cloud status; try self-hosting via Ollama",
      },
      {
        pattern: "Model download rate limits on HuggingFace",
        scope: "global",
        signal: "Slow or failed model downloads from HF",
        quickCheck: "Use HuggingFace mirror or direct Modelscope download",
      },
      {
        pattern: "Version compatibility issues",
        scope: "local",
        signal: "Inference framework incompatible with model version",
        quickCheck: "Check model card for compatible transformers/vllm versions",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Qwen API (DashScope) is degraded",
        alternative:
          "Self-host via Ollama, or use Qwen on Together AI or Groq",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "baidu-ernie": {
    slug: "baidu-ernie",
    providerSummary:
      "Baidu's LLM family (ERNIE Bot). Strong in Chinese language tasks. Available via Baidu AI Cloud.",
    officialStatusUrl: "https://cloud.baidu.com/status",
    docsUrl: "https://cloud.baidu.com/doc/WENXINWORKSHOP",
    pricingUrl: "https://cloud.baidu.com/product/wenxinworkshop",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "yiyan.baidu.com", description: "Consumer chat interface", criticality: "critical" },
      { name: "Baidu AI Cloud API", description: "ERNIE API for developers", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Regional access limitations",
        scope: "partial",
        signal: "Service primarily available in China; international access may be limited",
        quickCheck: "Verify geo-restrictions; check Baidu AI Cloud status",
      },
      {
        pattern: "Capacity issues during peak Chinese hours",
        scope: "global",
        signal: "Slow responses during UTC+8 business hours",
        quickCheck: "Retry off-peak; use API with retry logic",
      },
      {
        pattern: "Cross-border latency",
        scope: "local",
        signal: "High latency for international users",
        quickCheck: "Expected for China-hosted service; use CDN-accelerated endpoint if available",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Baidu ERNIE is degraded",
        alternative:
          "DeepSeek, Qwen, or Tencent Hunyuan are Chinese-native alternatives",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "zhipu-chatglm": {
    slug: "zhipu-chatglm",
    providerSummary:
      "Zhipu AI's open-weight LLM (GLM-4 family). Strong coding and reasoning. Available via API and self-hosted.",
    docsUrl: "https://open.bigmodel.cn/dev/api",
    pricingUrl: "https://open.bigmodel.cn/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "chatglm.cn", description: "Consumer web interface", criticality: "critical" },
      { name: "Zhipu API", description: "open.bigmodel.cn API endpoint", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API rate limits",
        scope: "local",
        signal: "Rate limit errors on high-frequency API calls",
        quickCheck: "Check quota in Zhipu developer console; implement backoff",
      },
      {
        pattern: "Regional access variability",
        scope: "partial",
        signal: "Access differs by country or network path",
        quickCheck: "Test from different regions; may require VPN for international access",
      },
      {
        pattern: "Model version transitions",
        scope: "global",
        signal: "API behavior changes between GLM versions",
        quickCheck: "Pin specific model version in API calls; check changelog",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ChatGLM is degraded",
        alternative:
          "DeepSeek, Qwen, or Moonshot Kimi are comparable Chinese alternatives",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  stepfun: {
    slug: "stepfun",
    providerSummary:
      "Chinese AI lab focused on multimodal and video generation (Step-1V, Step-Video). Rising player in AI video space.",
    docsUrl: "https://platform.stepfun.com/docs",
    pricingUrl: "https://platform.stepfun.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "stepfun.com", description: "Web interface", criticality: "critical" },
      { name: "Step API", description: "Developer API endpoint", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue delays on video generation",
        scope: "global",
        signal: "Video jobs wait much longer than advertised",
        quickCheck: "Check job status in platform; retry or reduce video length",
      },
      {
        pattern: "Regional access limitations",
        scope: "partial",
        signal: "Service primarily China-accessible",
        quickCheck: "Verify geo-restrictions; check StepFun platform announcements",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "StepFun video is degraded",
        alternative:
          "Kling AI, Runway, or Hailuo can reduce downtime for AI video generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "qwen-chat": {
    slug: "qwen-chat",
    providerSummary:
      "Alibaba's consumer chat interface for Qwen models. Web-based, free tier available.",
    docsUrl: "https://qwen.readthedocs.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "qwen.ai / tongyi.aliyun.com", description: "Consumer web chat", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Capacity during peak Chinese hours",
        scope: "global",
        signal: "Slow responses during UTC+8 business hours",
        quickCheck: "Retry off-peak; use DashScope API for higher reliability",
      },
      {
        pattern: "Regional access variability",
        scope: "partial",
        signal: "Inconsistent access from outside China",
        quickCheck: "Test from different regions; may require VPN for some areas",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Qwen Chat is degraded",
        alternative:
          "Self-host Qwen via Ollama, or use the DashScope API directly",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "copy-ai": {
    slug: "copy-ai",
    providerSummary:
      "AI marketing content generator. Sales copy, email, social media, workflow automation.",
    docsUrl: "https://www.copy.ai/support",
    pricingUrl: "https://www.copy.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "copy.ai", description: "Web editor", criticality: "critical" },
      { name: "Workflow Automation Backend", description: "Automated content workflow runner", criticality: "high" },
      { name: "Chrome Extension", description: "Browser extension", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Workflow execution failures",
        scope: "global",
        signal: "Automated workflows fail or produce no output",
        quickCheck: "Check Copy.ai status; re-run workflow manually",
      },
      {
        pattern: "Upstream model issues",
        scope: "global",
        signal: "Generation fails due to underlying model outage",
        quickCheck: "Check OpenAI/Anthropic status as Copy.ai routes to their models",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Word or generation credits exhausted",
        quickCheck: "Check account credit balance; upgrade plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Copy.ai is degraded",
        alternative:
          "Jasper, ChatGPT, or Writer.com can reduce downtime for AI content generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
};
