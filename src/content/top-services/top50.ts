import type { TopServiceContent } from "./types";

export const TOP_SERVICE_CONTENT: Record<string, TopServiceContent> = {
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

  "github-copilot": {
    slug: "github-copilot",
    providerSummary:
      "GitHub Copilot is GitHub's AI coding assistant (IDE autocomplete, chat, coding agent, code review, CLI). Uses included and premium models depending on feature and plan; model availability varies by feature.",
    officialStatusUrl: "https://www.githubstatus.com",
    docsUrl: "https://docs.github.com/en/copilot",
    pricingUrl: "https://github.com/features/copilot/plans",
    communityLinks: [
      {
        type: "github",
        url: "https://github.com/orgs/community/discussions/categories/copilot",
        label: "GitHub Community Copilot",
        verified: true,
      },
      {
        type: "reddit",
        url: "https://reddit.com/r/GithubCopilot",
        label: "r/GithubCopilot",
        verified: true,
      },
      { type: "x", url: "https://x.com/github", label: "@github", verified: true },
    ],
    monitoredSurfaces: [
      {
        name: "Copilot IDE completions",
        description: "Inline code completions",
        criticality: "critical",
      },
      { name: "Copilot Chat", description: "Chat interface", criticality: "high" },
      {
        name: "Copilot coding agent",
        description: "Autonomous PR generation",
        criticality: "medium",
      },
      {
        name: "Copilot code review",
        description: "PR inline suggestions",
        criticality: "medium",
      },
      { name: "Copilot CLI", description: "CLI copilot command", criticality: "medium" },
      {
        name: "GitHub Auth / SSO",
        description: "Copilot depends on GitHub session",
        criticality: "critical",
      },
      {
        name: "VS Code Marketplace",
        description: "Extension updates",
        criticality: "low",
      },
    ],
    statusSegmentation: ["Copilot", "API Requests", "Actions", "Git Operations"],
    modelFamilies: [
      "Model availability varies by feature and plan",
      "Included models (covered by base plan) vs premium models (count against premium request quota)",
      "User can switch model in Chat for some features",
    ],
    commonLimits: [
      "Copilot Free: up to 2,000 inline suggestion requests and up to 50 premium requests per month",
      "Copilot Pro ($10/mo): unlimited completions, 300 premium requests/month",
      "Copilot Pro+ ($39/mo): higher premium request quota",
      "Copilot Business ($19/user/mo): org controls, audit logs",
      "Copilot Enterprise ($39/user/mo): org policies, custom models",
      "Premium request counters reset on the 1st of each month at 00:00:00 UTC",
    ],
    knownFailurePatterns: [
      {
        pattern: "IDE completions timeout / grayed out",
        scope: "global",
        signal:
          "githubstatus.com Copilot component degraded, or local extension crash",
        quickCheck: "Reload window, check status, check GitHub auth token",
      },
      {
        pattern: "Copilot Chat unavailable but completions work",
        scope: "partial",
        signal: "Chat endpoint degraded, completions endpoint healthy",
        quickCheck:
          "Chat fails in IDE, ghost text still appears → confirmed partial outage",
      },
      {
        pattern:
          "Premium request exhaustion vs included-model chat still working",
        scope: "local",
        signal:
          "You've used all your premium requests banner, but included models still respond",
        quickCheck: "Switch Chat model picker to an included model",
      },
      {
        pattern: "Copilot is not available for your account",
        scope: "local",
        signal: "Isolated to specific users, works for teammates",
        quickCheck: "GitHub subscription, org SSO, seat assignment, org policy",
      },
      {
        pattern: "GitHub Auth cascading failure",
        scope: "global",
        signal: "GitHub status page shows auth component issue",
        quickCheck: "Log out/in, check github.com sign-in separately",
      },
      {
        pattern: "Local auth state expiration or proxy/VPN interference",
        scope: "local",
        signal:
          "Intermittent failures tied to specific networks (corporate proxy)",
        quickCheck:
          "Verify api.githubcopilot.com and api.github.com are whitelisted; check proxy TLS cert rewriting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Copilot IDE completions unavailable",
        alternative:
          "GitHub Chat on the web (github.com/copilot) can reduce downtime while IDE extension is failing",
        switchingCost: "low",
      },
      {
        scenario: "Copilot IDE completions unavailable (need new IDE)",
        alternative:
          "Cursor or Windsurf/Codeium can reduce downtime for active coding sessions",
        switchingCost: "medium",
      },
      {
        scenario: "Copilot Chat down but completions work",
        alternative:
          "Continue with completions, use claude.ai or chatgpt.com for chat separately",
        switchingCost: "low",
      },
      {
        scenario: "Premium requests exhausted",
        alternative: "Switch to included models in Chat picker",
        switchingCost: "low",
      },
      {
        scenario: "Air-gapped or highly regulated environments",
        alternative: "Continue.dev + Ollama (local open-weight models)",
        switchingCost: "high",
        note: "Zero dependency after setup",
      },
    ],
    ecosystemDependencies: [
      "Depends on: GitHub auth, VS Code (or JetBrains) extension host, upstream model backends",
      "Often confused with: Microsoft Copilot (separate product)",
      "Cascading failures: if GitHub auth fails, Copilot + Actions + Codespaces all fail together",
      "GitHub org policy can disable CLI/features independently of the base subscription",
    ],
    operatorNotes: [
      "A significant share of user-reported Copilot incidents turn out to be auth, licensing, or org-policy issues rather than a platform-wide outage",
      "The githubstatus.com Copilot component is separate from API and Actions — verify you're reading the right component",
      "api.githubcopilot.com must be whitelisted in enterprise proxies; TLS cert interception by corporate proxies is a common silent failure mode",
      "Enterprise admins can disable Copilot at org level — a whole team suddenly losing Copilot is often a policy change, not an outage",
      "Copilot CLI is officially documented and available on all paid plans subject to org policy",
    ],
    diagnosticCommands: [
      "copilot --version — verify CLI installed and authenticated",
      "Check GitHub auth status in IDE: reload window, check sign-in in command palette",
      "curl -I https://api.githubcopilot.com — verify api.githubcopilot.com reachable",
      "Check githubstatus.com Copilot component specifically (not just overall GitHub status)",
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

  perplexity: {
    slug: "perplexity",
    providerSummary:
      "AI-powered search engine with sourced answers. Combines LLM reasoning with real-time web search and citations. Consumer app plus Sonar API for developers.",
    officialStatusUrl: "https://status.perplexity.ai",
    docsUrl: "https://docs.perplexity.ai",
    pricingUrl: "https://perplexity.ai/pro",
    communityLinks: [
      {
        type: "discord",
        url: "https://discord.gg/perplexity-ai",
        label: "Perplexity Discord",
        verified: true,
      },
      {
        type: "reddit",
        url: "https://reddit.com/r/perplexity_ai",
        label: "r/perplexity_ai",
        verified: true,
      },
      {
        type: "x",
        url: "https://x.com/perplexity_ai",
        label: "@perplexity_ai",
        verified: true,
      },
    ],
    monitoredSurfaces: [
      {
        name: "perplexity.ai web",
        description: "Consumer web interface",
        criticality: "critical",
      },
      {
        name: "Perplexity mobile apps",
        description: "Mobile backend",
        criticality: "high",
      },
      { name: "Sonar API", description: "Developer API", criticality: "high" },
      {
        name: "Web search backend",
        description: "Scraping/indexing infrastructure (unique dependency)",
        criticality: "critical",
      },
    ],
    statusSegmentation: ["Web App", "API", "Search Infrastructure"],
    modelFamilies: [
      "Sonar (proprietary search-augmented)",
      "Sonar Pro",
      "Claude, GPT, Grok (Pro user choice for underlying reasoning)",
    ],
    commonLimits: [
      "Free tier: limited Pro Searches per day",
      "Pro tier ($20/mo): expanded Pro Searches, Deep Research access",
      "Sonar API: pay-per-request with tier-based quotas",
    ],
    knownFailurePatterns: [
      {
        pattern: "Failed to fetch sources",
        scope: "partial",
        signal: "LLM healthy, but source retrieval fails",
        quickCheck:
          "Retry after a minute; if persistent, sources-side issue, not Perplexity itself",
      },
      {
        pattern: "Citation links return 404",
        scope: "local",
        signal: "Answer is correct but source link is stale",
        quickCheck:
          "Expected for time-sensitive sources; Perplexity caches but doesn't mirror",
      },
      {
        pattern: "Deep Research timeout",
        scope: "partial",
        signal: "Deep Research mode stuck Researching...",
        quickCheck: "Deep Research runs 5-10 min; don't assume stuck under 10 min",
      },
      {
        pattern: "Upstream model backend issue",
        scope: "partial",
        signal: "Specific model (Claude/GPT/Grok) fails while others work",
        quickCheck: "Switch underlying model in Pro settings",
      },
      {
        pattern: "Search index staleness",
        scope: "partial",
        signal: "Very recent news missing from search",
        quickCheck: "Normal; Perplexity indexes with delay, not real-time",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Perplexity is degraded",
        alternative: "You.com or Kagi offer similar AI-powered search",
        switchingCost: "low",
      },
      {
        scenario: "Coding search specifically",
        alternative: "Phind is an alternative",
        switchingCost: "low",
      },
      {
        scenario: "Only source retrieval is broken",
        alternative:
          "Direct ChatGPT with web browsing or Claude with web access can reduce downtime",
        switchingCost: "low",
      },
      {
        scenario: "Deep research workloads",
        alternative:
          "Claude Projects with manual document upload can substitute for Perplexity Deep Research",
        switchingCost: "medium",
        note: "Manual setup",
      },
    ],
    ecosystemDependencies: [
      "Depends on web scraping/crawling infrastructure (proprietary plus upstream search providers)",
      "Underlying LLM models (Claude, GPT, etc.) — cascades possible from those providers",
    ],
    operatorNotes: [
      "Source fetching failures are often upstream (the sites Perplexity is trying to read), not Perplexity itself",
      "Deep Research is a long-running task; UI 'stuck' perception is common — timeouts are 5-10 min typically",
      "Pro users can select the underlying reasoning model; a model-specific issue can be worked around without leaving Perplexity",
      "Real-time news indexing has delay — not a real-time search engine like Google News",
    ],
    diagnosticCommands: [
      `curl https://api.perplexity.ai/chat/completions -H "Authorization: Bearer $PPLX_API_KEY" -H "Content-Type: application/json" -d '{"model":"sonar","messages":[{"role":"user","content":"ping"}]}' — Sonar API reachability`,
      "Check status.perplexity.ai for component-level breakdown",
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

  cursor: {
    slug: "cursor",
    providerSummary:
      "AI-native code editor/IDE with tab completion, chat, agents, and model routing. Based on a VS Code fork; routes workloads to Anthropic, OpenAI, and Google models.",
    officialStatusUrl: "https://status.cursor.com",
    docsUrl: "https://docs.cursor.com",
    pricingUrl: "https://cursor.com/pricing",
    communityLinks: [
      {
        type: "forum",
        url: "https://forum.cursor.com",
        label: "Cursor Forum",
        verified: true,
      },
      {
        type: "reddit",
        url: "https://reddit.com/r/cursor",
        label: "r/cursor",
        verified: true,
      },
      {
        type: "discord",
        url: "https://discord.gg/cursor",
        label: "Cursor Discord",
        verified: true,
      },
      { type: "x", url: "https://x.com/cursor_ai", label: "@cursor_ai", verified: true },
    ],
    monitoredSurfaces: [
      {
        name: "Cursor IDE",
        description: "Core IDE features",
        criticality: "critical",
      },
      { name: "Cursor CLI", description: "CLI interface", criticality: "high" },
      {
        name: "Cloud Agents",
        description: "Background agent tasks",
        criticality: "high",
      },
      {
        name: "Marketplace",
        description: "Extension marketplace",
        criticality: "medium",
      },
      { name: "Bugbot", description: "Bug detection bot", criticality: "medium" },
      {
        name: "Automations",
        description: "Automation features",
        criticality: "medium",
      },
      {
        name: "cursor.com",
        description: "Website and authentication",
        criticality: "critical",
      },
    ],
    statusSegmentation: [
      "IDE",
      "CLI",
      "Cloud Agents",
      "Marketplace",
      "Bugbot",
      "Automations",
      "cursor.com",
    ],
    modelFamilies: [
      "Anthropic (Claude Sonnet / Opus)",
      "OpenAI (GPT / o-series)",
      "Google (Gemini)",
      "Cursor proprietary/specialized internal model(s)",
      "User can bring their own API keys",
    ],
    commonLimits: [
      "Hobby: limited agent requests + limited tab completions",
      "Pro: $20/mo — expanded usage",
      "Pro+: $60/mo — higher usage",
      "Ultra: $200/mo — top-tier individual",
      "Teams: $40/user/mo — centralized billing, org controls",
      "Enterprise: custom — SSO, policy controls, SLAs",
    ],
    knownFailurePatterns: [
      {
        pattern:
          "Upstream-model-specific degradation while Cursor IDE/core remains healthy",
        scope: "partial",
        signal: "Claude-routed Chat fails, Cursor UI works fine",
        quickCheck: "Switch model to GPT or Gemini in model picker",
      },
      {
        pattern: "Tab not working / no ghost text",
        scope: "global",
        signal:
          "status.cursor.com IDE/Tab component, or local cache issue",
        quickCheck:
          "Reload window (Cmd+Shift+P → Reload Window), check status page",
      },
      {
        pattern: "Chat returns high load error",
        scope: "partial",
        signal: "Anthropic/OpenAI upstream degraded",
        quickCheck: "Switch model in Chat picker, check upstream provider status",
      },
      {
        pattern: "Composer / multi-file edit stuck",
        scope: "partial",
        signal: "Chat works, Composer doesn't (multi-file backend degraded)",
        quickCheck: "Retry with shorter context, reduce file scope",
      },
      {
        pattern: "Cloud Agent task stuck",
        scope: "partial",
        signal: "status.cursor.com Cloud Agents component",
        quickCheck: "Cancel task, retry, check forum",
      },
      {
        pattern: "Auth failure / sign-in loop",
        scope: "global",
        signal: "cursor.com auth component",
        quickCheck: "Sign out, clear Cursor app data, try again",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "One upstream model is degraded (Claude/GPT/Gemini)",
        alternative: "Switch model inside Cursor before leaving the IDE",
        switchingCost: "low",
      },
      {
        scenario: "Cursor IDE globally unavailable",
        alternative:
          "Windsurf or VS Code + Copilot can reduce downtime for active sessions",
        switchingCost: "low",
      },
      {
        scenario: "Tab completions unavailable but Chat works",
        alternative: "Use Chat for inline suggestions manually",
        switchingCost: "low",
      },
      {
        scenario: "Cloud Agents unavailable",
        alternative:
          "Claude Code CLI or Devin can reduce downtime for autonomous tasks",
        switchingCost: "medium",
      },
      {
        scenario: "Offline continuity",
        alternative: "VS Code + Continue.dev + local Ollama",
        switchingCost: "high",
        note: "Zero dependency after setup",
      },
    ],
    ecosystemDependencies: [
      "Built on: VS Code (fork) — VS Code Marketplace issues can affect extension installs",
      "Routes to: Anthropic API, OpenAI API, Google Gemini API — upstream outages cascade",
      "Auth: Cursor's own auth system, independent of GitHub",
    ],
    operatorNotes: [
      "Cursor's status page decomposes surfaces well: IDE, CLI, Cloud Agents, Marketplace, Bugbot, Automations, cursor.com can fail independently",
      "Upstream cascades are common: when Claude API has incidents, Cursor's Claude-routed Chat degrades. Model picker swap is the first workaround.",
      "The Cursor forum (forum.cursor.com) often surfaces issues minutes before the status page updates",
      "Cursor auth is independent of GitHub — a GitHub outage doesn't break Cursor sign-in",
    ],
    diagnosticCommands: [
      "Check status.cursor.com per-component (IDE, CLI, Cloud Agents, Marketplace, Bugbot, Automations, cursor.com)",
      "In IDE: Cmd+Shift+P → Developer: Reload Window to clear extension state",
      "Test model switching: Chat panel → model picker dropdown",
      "For Cloud Agents: cancel current task, verify new task creation in status page",
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

  groq: {
    slug: "groq",
    providerSummary:
      "Ultra-fast inference via custom LPU hardware. Hosts open-source models (Llama, Mixtral, Qwen, DeepSeek, Whisper) with low latency.",
    officialStatusUrl: "https://groqstatus.com",
    docsUrl: "https://console.groq.com/docs",
    pricingUrl: "https://groq.com/pricing",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/groq", label: "Groq Discord" },
      { type: "x", url: "https://x.com/GroqInc", label: "@GroqInc" },
    ],
    monitoredSurfaces: [
      {
        name: "api.groq.com",
        description: "OpenAI-compatible API",
        criticality: "critical",
      },
    ],
    modelFamilies: [
      "Llama 3.3",
      "Llama 3.1",
      "Mixtral",
      "DeepSeek R1 Distill",
      "Qwen",
      "Whisper",
    ],
    knownFailurePatterns: [
      {
        pattern: "Capacity-driven 429s during peak",
        scope: "partial",
        signal: "429 rate limit errors during high demand periods",
        quickCheck: "Implement backoff; check groqstatus.com",
      },
      {
        pattern: "Model cold start",
        scope: "partial",
        signal: "First request slow after model inactivity",
        quickCheck: "Warm up with a ping request before prod traffic",
      },
      {
        pattern: "Specific model availability changes",
        scope: "partial",
        signal: "Model previously available now returns 404",
        quickCheck: "Check current model list at console.groq.com/docs/models",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Groq is degraded",
        alternative:
          "Together AI, Fireworks AI, DeepInfra host similar open models",
        switchingCost: "low",
        note: "Base URL swap",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Groq's API is OpenAI-compatible — swap base_url in client to fall back to/from other providers in seconds",
    ],
  },

  "together-ai": {
    slug: "together-ai",
    providerSummary:
      "Managed inference for open-source models at scale. Hosts DeepSeek, Llama, Qwen, Mixtral, etc.",
    officialStatusUrl: "https://status.together.ai",
    docsUrl: "https://docs.together.ai",
    pricingUrl: "https://www.together.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "api.together.xyz",
        description: "Inference, Fine-tuning, Code Sandbox",
        criticality: "critical",
      },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model cold start on less-used models",
        scope: "partial",
        signal: "First request to a less-used model is slow",
        quickCheck: "Retry; warm up model with a ping request",
      },
      {
        pattern: "Rate limits",
        scope: "local",
        signal: "429 responses based on account tier",
        quickCheck: "Check quota in Together dashboard",
      },
      {
        pattern: "Dedicated endpoint provisioning delays",
        scope: "partial",
        signal: "Newly provisioned dedicated endpoints slow to become active",
        quickCheck: "Check provisioning status in Together dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Together is degraded",
        alternative: "Fireworks AI, Groq, Replicate, DeepInfra host similar open models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Together is a key resilience layer for DeepSeek users when direct DeepSeek API is congested",
    ],
  },

  "hugging-face": {
    slug: "hugging-face",
    providerSummary:
      "Model hub, datasets, Spaces (demos), Inference API, Inference Endpoints. Central infrastructure for open-source AI.",
    officialStatusUrl: "https://status.huggingface.co",
    docsUrl: "https://huggingface.co/docs",
    pricingUrl: "https://huggingface.co/pricing",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/huggingface", label: "HuggingFace Discord" },
      {
        type: "forum",
        url: "https://discuss.huggingface.co",
        label: "HuggingFace Forum",
      },
    ],
    monitoredSurfaces: [
      { name: "huggingface.co", description: "", criticality: "critical" },
      { name: "Model downloads (CDN)", description: "", criticality: "high" },
      { name: "Inference API", description: "", criticality: "medium" },
      { name: "Spaces", description: "", criticality: "medium" },
      { name: "Datasets", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Gated-model download rate limits",
        scope: "local",
        signal: "429 or auth errors on gated model downloads",
        quickCheck: "Verify HF token and model access approval",
      },
      {
        pattern: "Inference API cold start",
        scope: "partial",
        signal: "First Inference API request slow after model inactivity",
        quickCheck: "Retry after a few seconds; model is loading",
      },
      {
        pattern: "Spaces free-tier sleep/wake cycles",
        scope: "partial",
        signal: "Space takes 20-30s to respond on first request",
        quickCheck: "Expected for free-tier Spaces; upgrade to paid for always-on",
      },
      {
        pattern: "CDN regional slowness",
        scope: "partial",
        signal: "Model downloads slow in specific regions",
        quickCheck: "Mirror to regional object storage for production use",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "HF CDN is slow",
        alternative: "Mirror popular models to S3/object storage",
        switchingCost: "medium",
      },
      {
        scenario: "HF Hub unavailable",
        alternative: "Modelscope is a Chinese alternative hub",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "HF CDN downloads are often the prod bottleneck — for reliability, mirror critical models to your own storage",
    ],
  },

  replicate: {
    slug: "replicate",
    providerSummary:
      "Run open-source models via API, pay-per-second. Popular for image/video/audio generation workloads.",
    officialStatusUrl: "https://www.replicatestatus.com",
    docsUrl: "https://replicate.com/docs",
    pricingUrl: "https://replicate.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.replicate.com", description: "", criticality: "critical" },
      { name: "Model run endpoints", description: "", criticality: "high" },
      { name: "Webhooks", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cold start delays on rarely-used models",
        scope: "partial",
        signal: "First prediction on an infrequently used model takes significantly longer",
        quickCheck: "Wait for cold start; consider a dedicated deployment for critical models",
      },
      {
        pattern: "GPU availability fluctuations",
        scope: "partial",
        signal: "Predictions queued or failing due to GPU shortage",
        quickCheck: "Check replicatestatus.com; retry with backoff",
      },
      {
        pattern: "Webhook delivery lag",
        scope: "partial",
        signal: "Prediction complete but webhook not received promptly",
        quickCheck: "Poll prediction status as backup; don't rely solely on webhooks",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Replicate is degraded",
        alternative: "Fal.ai and Modal are alternatives for image/video workloads",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Prediction webhooks can be delayed — don't assume webhook delivery is real-time; poll as backup",
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

  "claude-code": {
    slug: "claude-code",
    providerSummary:
      "Anthropic's coding agent CLI and IDE extensions. Runs locally, executes multi-step coding tasks via Anthropic API.",
    officialStatusUrl: "https://status.anthropic.com",
    docsUrl: "https://docs.anthropic.com/en/docs/claude-code",
    pricingUrl: "https://www.anthropic.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "Claude Code backend (Anthropic API)",
        description: "",
        criticality: "critical",
      },
      { name: "CLI updates", description: "", criticality: "high" },
      {
        name: "VS Code/JetBrains extensions",
        description: "",
        criticality: "medium",
      },
    ],
    knownFailurePatterns: [
      {
        pattern: "Auth failures (own auth flow, not claude.ai)",
        scope: "local",
        signal: "Authentication errors specific to Claude Code, not claude.ai",
        quickCheck: "Re-authenticate via Claude Code CLI; check status.anthropic.com Claude Code component",
      },
      {
        pattern: "Tool use errors",
        scope: "partial",
        signal: "Tool execution failures during multi-step tasks",
        quickCheck: "Check Anthropic API status; retry task",
      },
      {
        pattern: "Rate limits shared with Anthropic API",
        scope: "local",
        signal: "429 errors from underlying Anthropic API",
        quickCheck: "Implement backoff; check anthropic-ratelimit-* headers",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Claude Code is degraded",
        alternative: "Cursor, Codex CLI, Devin can reduce downtime for autonomous tasks",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Claude Code has its own status component — a claude.ai outage doesn't always mean Claude Code is down",
    ],
  },

  midjourney: {
    slug: "midjourney",
    providerSummary:
      "AI image generator. Accessible via website and Discord-based workflows; no public official API should be assumed.",
    officialStatusUrl: "https://status.midjourney.com",
    docsUrl: "https://docs.midjourney.com",
    pricingUrl: "https://midjourney.com/explore",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/midjourney", label: "Midjourney Discord" },
      { type: "reddit", url: "https://reddit.com/r/midjourney", label: "r/midjourney" },
      { type: "x", url: "https://x.com/midjourney", label: "@midjourney" },
    ],
    monitoredSurfaces: [
      { name: "midjourney.com", description: "", criticality: "critical" },
      { name: "Discord bot", description: "", criticality: "high" },
      { name: "Image generation queue", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue delays during peak hours",
        scope: "partial",
        signal: "Generation jobs take longer than usual",
        quickCheck: "Check status.midjourney.com; wait during peak hours",
      },
      {
        pattern: "Discord bot downtime",
        scope: "partial",
        signal: "Discord bot unresponsive while midjourney.com may work",
        quickCheck: "Try midjourney.com web interface directly",
      },
      {
        pattern: "Content filter prompt rejections",
        scope: "local",
        signal: "Specific prompts rejected consistently",
        quickCheck: "Rephrase prompt; check Midjourney content policy",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Midjourney is degraded",
        alternative:
          "Leonardo AI, Ideogram, DALL-E 3 (via ChatGPT) can reduce downtime for image workflows",
        switchingCost: "low",
      },
      {
        scenario: "Technical alternative needed",
        alternative: "Flux on Replicate/Fal",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Unofficial API wrappers violate TOS and are actively rate-limited or blocked — not viable for production integrations",
    ],
  },

  "stability-ai": {
    slug: "stability-ai",
    providerSummary:
      "Creators of Stable Diffusion. Offers API, DreamStudio, and open-weight models.",
    officialStatusUrl: "https://status.stability.ai",
    docsUrl: "https://platform.stability.ai/docs",
    pricingUrl: "https://platform.stability.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.stability.ai", description: "", criticality: "critical" },
      { name: "DreamStudio", description: "", criticality: "high" },
      { name: "Model catalog", description: "", criticality: "medium" },
    ],
    modelFamilies: [
      "Stable Diffusion 3.5",
      "SDXL",
      "Stable Video",
      "Stable Audio",
    ],
    knownFailurePatterns: [
      {
        pattern: "Credit depletion (often mistaken for outage)",
        scope: "local",
        signal: "Requests fail with payment/quota error",
        quickCheck: "Check credit balance in DreamStudio; not a platform outage",
      },
      {
        pattern: "SD3.5-specific errors",
        scope: "partial",
        signal: "SD3.5 endpoint fails while others work",
        quickCheck: "Check status.stability.ai for model-specific component",
      },
      {
        pattern: "NSFW filter false positives",
        scope: "local",
        signal: "Safe prompts rejected by content filter",
        quickCheck: "Rephrase prompt; adjust style modifiers",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Stability API is degraded",
        alternative: "Replicate/Fal (host SD models) can reduce downtime",
        switchingCost: "low",
      },
      {
        scenario: "Heavy users needing resilience",
        alternative: "Self-hosting via ComfyUI/A1111",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "SD models are open-weight — self-hosting via ComfyUI or Automatic1111 is a resilient fallback for production",
    ],
  },

  "leonardo-ai": {
    slug: "leonardo-ai",
    providerSummary:
      "Image generator with strong game-dev asset training (characters, environments).",
    docsUrl: "https://docs.leonardo.ai",
    pricingUrl: "https://leonardo.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "leonardo.ai", description: "", criticality: "critical" },
      { name: "Leonardo API", description: "", criticality: "high" },
      { name: "Canvas editor", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Daily token quota depletion (often mistaken for outage)",
        scope: "local",
        signal: "Generation fails with quota error",
        quickCheck: "Check token balance; tokens reset daily",
      },
      {
        pattern: "Canvas save errors",
        scope: "partial",
        signal: "Canvas edits fail to save",
        quickCheck: "Retry save; check browser console for errors",
      },
      {
        pattern: "Specific model availability",
        scope: "partial",
        signal: "Specific fine-tuned models unavailable",
        quickCheck: "Try a different model; check Leonardo status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Leonardo is degraded",
        alternative: "Midjourney, Ideogram, Playground AI can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Tokens reset daily — many 'down' reports are quota exhaustion, not outages",
    ],
  },

  ideogram: {
    slug: "ideogram",
    providerSummary:
      "Image generator with strong typographic fidelity — high quality for text-in-image workflows (logos, posters, UI mockups).",
    docsUrl: "https://developer.ideogram.ai",
    pricingUrl: "https://ideogram.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ideogram.ai", description: "", criticality: "critical" },
      { name: "Ideogram API", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Text rendering failures on edge-case characters",
        scope: "partial",
        signal: "Unusual characters or scripts not rendered correctly",
        quickCheck: "Simplify text content; check Ideogram docs for supported scripts",
      },
      {
        pattern: "API quota limits",
        scope: "local",
        signal: "429 responses from Ideogram API",
        quickCheck: "Check quota in Ideogram dashboard",
      },
      {
        pattern: "Content filter rejections",
        scope: "local",
        signal: "Specific prompts rejected by content filter",
        quickCheck: "Rephrase prompt; check Ideogram content policy",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Ideogram is degraded",
        alternative:
          "Flux with careful prompting or DALL-E 3 can reduce downtime for text-heavy images",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Ideogram model/API versions evolve; consult current docs rather than hard-coding versions",
    ],
  },

  runway: {
    slug: "runway",
    providerSummary:
      "Video AI. Gen-4 and Act-Two (character animation); professional video editor.",
    officialStatusUrl: "https://status.runwayml.com",
    docsUrl: "https://docs.runwayml.com",
    pricingUrl: "https://runwayml.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "runwayml.com", description: "", criticality: "critical" },
      { name: "API", description: "", criticality: "high" },
      { name: "Render queue", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Render times mistaken for stuck jobs",
        scope: "local",
        signal: "Job appears stuck but is still processing",
        quickCheck: "Wait several minutes; video renders are not instant",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance; credits reset monthly per tier",
      },
      {
        pattern: "Tool-specific errors",
        scope: "partial",
        signal: "Specific Runway tool fails while others work",
        quickCheck: "Check status.runwayml.com for tool-specific components",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Runway is degraded",
        alternative: "Kling AI, Luma Dream Machine, Pika can reduce downtime for video workflows",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Renders take minutes — don't refresh UI too early. Credits reset monthly per tier.",
    ],
  },

  "kling-ai": {
    slug: "kling-ai",
    providerSummary:
      "Chinese video AI. Strong quality; active feature development (image-to-video, camera controls).",
    docsUrl: "https://docs.kling.ai",
    pricingUrl: "https://klingai.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "klingai.com", description: "", criticality: "critical" },
      { name: "Mobile apps", description: "", criticality: "high" },
      { name: "Kling API", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue times during high demand",
        scope: "partial",
        signal: "Long queue wait times during peak periods",
        quickCheck: "Check klingai.com queue status; try off-peak",
      },
      {
        pattern: "Prompt filter rejections",
        scope: "local",
        signal: "Specific prompts rejected by content filter",
        quickCheck: "Rephrase prompt; check Kling content policy",
      },
      {
        pattern: "Payment method complications in some regions",
        scope: "local",
        signal: "Payment fails for users in certain regions",
        quickCheck: "Check supported payment methods for your region",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kling is degraded",
        alternative: "Runway, Hailuo AI (MiniMax), Luma Dream Machine can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },

  pika: {
    slug: "pika",
    providerSummary: "Video AI with unique effects (Pikadditions, Pikascenes, lipsync).",
    docsUrl: "https://pika.art/help",
    pricingUrl: "https://pika.art/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "pika.art", description: "", criticality: "critical" },
      { name: "Discord integration", description: "", criticality: "high" },
      { name: "Render queue", description: "", criticality: "medium" },
      { name: "Pikadditions feature", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue delays during peak",
        scope: "partial",
        signal: "Renders take longer than usual during peak hours",
        quickCheck: "Check Pika status; try off-peak",
      },
      {
        pattern: "Specific effect (Pikadditions) failures",
        scope: "partial",
        signal: "Pikadditions fails while other features work",
        quickCheck: "Check Pika status for feature-specific issues",
      },
      {
        pattern: "Audio sync issues",
        scope: "partial",
        signal: "Generated video audio out of sync",
        quickCheck: "Retry generation; check Pika Discord for known issues",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Generic video generation needed",
        alternative: "Runway, Luma, Kling can reduce downtime",
        switchingCost: "low",
      },
      {
        scenario: "Pikadditions-specific effects",
        alternative: "No direct equivalent available",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Pika has unique effects (Pikadditions for inserting objects) with limited direct alternatives — outages on that feature are more impactful",
    ],
  },

  "luma-dream-machine": {
    slug: "luma-dream-machine",
    providerSummary:
      "Luma Labs' video generation product. Strong on camera movement and realism.",
    docsUrl: "https://docs.lumalabs.ai",
    pricingUrl: "https://lumalabs.ai/dream-machine",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "lumalabs.ai/dream-machine",
        description: "",
        criticality: "critical",
      },
      { name: "Dream Machine API", description: "", criticality: "high" },
      { name: "Mobile apps", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue during peak",
        scope: "partial",
        signal: "Long queue times during peak demand",
        quickCheck: "Wait or try off-peak; check Luma status",
      },
      {
        pattern: "iOS app auth issues",
        scope: "local",
        signal: "iOS app fails to authenticate while web works",
        quickCheck: "Try web interface; reinstall iOS app",
      },
      {
        pattern: "Extend/reverse specific errors",
        scope: "partial",
        signal: "Extend or reverse features fail while basic generation works",
        quickCheck: "Retry with a fresh generation",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dream Machine is degraded",
        alternative: "Runway, Kling, Pika can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Luma Labs also offers Genie (3D) as a separate product — don't conflate the two",
    ],
  },

  elevenlabs: {
    slug: "elevenlabs",
    providerSummary:
      "High-throughput AI voice TTS API. Voice cloning, dubbing, audiobooks, conversational AI.",
    officialStatusUrl: "https://status.elevenlabs.io",
    docsUrl: "https://elevenlabs.io/docs",
    pricingUrl: "https://elevenlabs.io/pricing",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/elevenlabs", label: "ElevenLabs Discord" },
      { type: "x", url: "https://x.com/elevenlabsio", label: "@elevenlabsio" },
      { type: "reddit", url: "https://reddit.com/r/ElevenLabs", label: "r/ElevenLabs" },
    ],
    monitoredSurfaces: [
      {
        name: "api.elevenlabs.io",
        description: "TTS, STT, Dubbing, Voice Lab",
        criticality: "critical",
      },
      { name: "Web UI", description: "", criticality: "high" },
      { name: "Mobile apps", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Character quota depletion",
        scope: "local",
        signal: "TTS requests fail with quota error",
        quickCheck: "Check character balance; quota resets monthly",
      },
      {
        pattern: "Voice cloning approval delays",
        scope: "partial",
        signal: "Voice clone submission pending for extended time",
        quickCheck: "Check ElevenLabs support; approval has manual review steps",
      },
      {
        pattern: "Specific voice unavailability",
        scope: "partial",
        signal: "Specific voice ID returns error while others work",
        quickCheck: "Try a different voice; check if voice was removed from library",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ElevenLabs is degraded",
        alternative: "OpenAI TTS, Play.ht, Cartesia (low-latency) can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Streaming TTS has strict latency requirements — p95 >500ms degrades product UX meaningfully; monitor closely",
    ],
  },

  suno: {
    slug: "suno",
    providerSummary:
      "AI music generator producing full songs from text prompts. Also instrumentals and custom lyrics.",
    docsUrl: "https://suno.com/docs",
    pricingUrl: "https://suno.com/pricing",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/suno", label: "Suno Discord" },
      { type: "reddit", url: "https://reddit.com/r/SunoAI", label: "r/SunoAI" },
    ],
    monitoredSurfaces: [
      { name: "suno.com", description: "", criticality: "critical" },
      { name: "Mobile app", description: "", criticality: "high" },
      { name: "Generation queue", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue during peak",
        scope: "partial",
        signal: "Generation jobs take longer during peak demand",
        quickCheck: "Wait and retry; check Suno Discord for status",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance; credits reset on billing cycle",
      },
      {
        pattern: "Copyright filter prompt rejections",
        scope: "local",
        signal: "Specific prompts rejected for copyright reasons",
        quickCheck: "Rephrase prompt; avoid referencing copyrighted artists/songs",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Suno is degraded",
        alternative:
          "Udio, Beatoven.ai, AIVA can reduce downtime for music generation",
        switchingCost: "low",
        note: "Different style outputs",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Copyright-related filters cause some specific prompts to fail — not always an outage signal",
    ],
  },

  udio: {
    slug: "udio",
    providerSummary:
      "Music AI generator. Slightly more technical controls than Suno; popular with musicians.",
    docsUrl: "https://udio.com/help",
    pricingUrl: "https://www.udio.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "udio.com", description: "", criticality: "critical" },
      { name: "Generation API", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue times",
        scope: "partial",
        signal: "Generation jobs queued during peak demand",
        quickCheck: "Wait and retry; try off-peak hours",
      },
      {
        pattern: "Copyright filter rejections similar to Suno",
        scope: "local",
        signal: "Prompts rejected for copyright reasons",
        quickCheck: "Rephrase prompt; avoid referencing copyrighted material",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Udio is degraded",
        alternative: "Suno, Beatoven, local Riffusion can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },

  heygen: {
    slug: "heygen",
    providerSummary:
      "AI avatar video generation. Marketing, training, localization use cases.",
    officialStatusUrl: "https://status.heygen.com",
    docsUrl: "https://docs.heygen.com",
    pricingUrl: "https://heygen.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "heygen.com", description: "", criticality: "critical" },
      { name: "API", description: "", criticality: "high" },
      { name: "Render pipeline", description: "", criticality: "medium" },
      { name: "Avatar IV generator", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Long renders (minutes)",
        scope: "local",
        signal: "Avatar video renders take several minutes",
        quickCheck: "Wait for render to complete; check HeyGen status for queue issues",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance in HeyGen dashboard",
      },
      {
        pattern: "Avatar-specific bugs",
        scope: "partial",
        signal: "Specific avatar types fail while others work",
        quickCheck: "Try a different avatar; check HeyGen status",
      },
      {
        pattern: "Voice cloning approval delays",
        scope: "partial",
        signal: "Voice clone pending for extended time",
        quickCheck: "Check HeyGen support; approval may have manual steps",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "HeyGen is degraded",
        alternative:
          "Synthesia, D-ID, Colossyan can reduce downtime for avatar video",
        switchingCost: "low",
        note: "Different avatar libraries",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "HeyGen API supports Zapier and similar integrations — monitor render queue depth for early signal",
    ],
  },

  "v0-vercel": {
    slug: "v0-vercel",
    providerSummary:
      "UI generation from natural-language prompts. Integrated with Vercel deploy pipeline; strong React/shadcn/ui output.",
    officialStatusUrl: "https://www.vercel-status.com",
    docsUrl: "https://v0.dev/docs",
    pricingUrl: "https://v0.dev/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "v0.dev", description: "", criticality: "critical" },
      { name: "Generation backend", description: "", criticality: "high" },
      { name: "Vercel deploy pipeline", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation quota limits",
        scope: "local",
        signal: "Generation fails with quota error",
        quickCheck: "Check v0 credit/quota balance",
      },
      {
        pattern: "Specific component library errors",
        scope: "partial",
        signal: "Certain component types fail to generate correctly",
        quickCheck: "Try alternative component descriptions; check v0 docs",
      },
      {
        pattern: "Deploy pipeline failures",
        scope: "partial",
        signal: "v0 generation works but Vercel deploy fails",
        quickCheck: "Check Vercel status separately; deploy manually if needed",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "v0 is degraded",
        alternative: "Bolt.new, Lovable can reduce downtime for UI generation",
        switchingCost: "low",
      },
      {
        scenario: "Lightweight fallback needed",
        alternative: "Claude + manual copy-paste",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "v0 depends on Vercel infrastructure — monitor Vercel status for correlated outages",
    ],
  },

  "bolt-new": {
    slug: "bolt-new",
    providerSummary:
      "StackBlitz's AI full-stack app builder. In-browser Node.js via WebContainers, instant preview.",
    docsUrl: "https://support.bolt.new",
    pricingUrl: "https://bolt.new/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "bolt.new", description: "", criticality: "critical" },
      { name: "WebContainer backend", description: "", criticality: "high" },
      { name: "Generation API", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "WebContainer failures (unique dependency)",
        scope: "partial",
        signal: "In-browser Node.js environment fails to initialize",
        quickCheck: "Refresh page; check browser compatibility (requires modern Chromium)",
      },
      {
        pattern: "Token depletion",
        scope: "local",
        signal: "Generation fails with token/credit error",
        quickCheck: "Check token balance in Bolt.new account",
      },
      {
        pattern: "Framework-specific errors (Next.js edge cases)",
        scope: "partial",
        signal: "Next.js builds fail in WebContainer",
        quickCheck: "Try a different framework or simpler config; check Bolt.new community",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Bolt.new is degraded",
        alternative: "v0, Lovable, Replit AI can reduce downtime for app generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Bolt depends on StackBlitz WebContainer technology — a unique dependency not shared by competitors",
    ],
  },

  lovable: {
    slug: "lovable",
    providerSummary:
      "Full-stack app generation via conversation. Popular with non-technical founders.",
    docsUrl: "https://docs.lovable.dev",
    pricingUrl: "https://lovable.dev/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lovable.dev", description: "", criticality: "critical" },
      { name: "Generation backend", description: "", criticality: "high" },
      { name: "Supabase integration", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance in Lovable account",
      },
      {
        pattern: "Supabase connection issues (cascading)",
        scope: "partial",
        signal: "Database-dependent features fail when Supabase is degraded",
        quickCheck: "Check Supabase status separately; Lovable depends on Supabase",
      },
      {
        pattern: "Deployment failures",
        scope: "partial",
        signal: "Generation succeeds but deployment fails",
        quickCheck: "Check deployment logs; try manual deploy",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Lovable is degraded",
        alternative: "Bolt.new, v0, Cursor can reduce downtime for app generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Lovable heavily depends on Supabase — a Supabase outage can cascade to Lovable",
    ],
  },

  codeium: {
    slug: "codeium",
    providerSummary:
      "AI coding assistant (Codeium IDE plugin) and Windsurf (dedicated IDE with Cascade agent).",
    officialStatusUrl: "https://status.codeium.com",
    docsUrl: "https://docs.codeium.com",
    pricingUrl: "https://codeium.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "codeium.com", description: "", criticality: "critical" },
      { name: "Windsurf auth", description: "", criticality: "high" },
      { name: "Completion API", description: "", criticality: "medium" },
      { name: "Cascade agent backend", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Auth sync issues",
        scope: "partial",
        signal: "Auth token fails to sync between IDE and account",
        quickCheck: "Re-authenticate; check status.codeium.com",
      },
      {
        pattern: "Cascade long-running tasks",
        scope: "partial",
        signal: "Cascade agent tasks time out or get stuck",
        quickCheck: "Cancel and retry; check Cascade backend status",
      },
      {
        pattern: "Model backend cascades (upstream providers)",
        scope: "partial",
        signal: "Completions fail due to upstream model provider outage",
        quickCheck: "Check upstream provider status; wait for resolution",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Codeium is degraded",
        alternative: "Cursor, GitHub Copilot, Continue.dev can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Codeium's free tier is unlimited for individuals — rare positioning in this market",
    ],
  },

  "replit-ai": {
    slug: "replit-ai",
    providerSummary:
      "In-browser IDE with AI assistant (Replit Agent). Education and rapid prototyping.",
    officialStatusUrl: "https://status.replit.com",
    docsUrl: "https://docs.replit.com/replitai",
    pricingUrl: "https://replit.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "replit.com", description: "", criticality: "critical" },
      { name: "Agent backend", description: "", criticality: "high" },
      { name: "Code execution containers", description: "", criticality: "medium" },
      { name: "Deploy targets", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Container start failures",
        scope: "partial",
        signal: "Repl containers fail to start",
        quickCheck: "Check status.replit.com; try forking the Repl",
      },
      {
        pattern: "Deploy timeouts",
        scope: "partial",
        signal: "Deployments time out during peak",
        quickCheck: "Retry deployment; check Replit status",
      },
      {
        pattern: "Agent task stuck",
        scope: "partial",
        signal: "Agent appears to hang on a task",
        quickCheck: "Stop and restart Agent; reduce task complexity",
      },
      {
        pattern: "Auth sync issues",
        scope: "partial",
        signal: "Auth token issues between IDE and account",
        quickCheck: "Re-authenticate; refresh session",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Replit AI is degraded",
        alternative:
          "CodeSandbox, Gitpod Flex, Glitch can reduce downtime for browser-based dev",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Replit Agent consumes 'cycles' quickly — quota exhaustion is a common 'down' misdiagnosis",
    ],
  },

  devin: {
    slug: "devin",
    providerSummary:
      "Cognition Labs' autonomous SWE agent. Completes tasks end-to-end via Slack or web.",
    officialStatusUrl: "https://status.cognition.ai",
    docsUrl: "https://docs.devin.ai",
    pricingUrl: "https://devin.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.devin.ai", description: "", criticality: "critical" },
      { name: "Slack integration", description: "", criticality: "high" },
      { name: "Task execution backend", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Task stuck in 'thinking'",
        scope: "partial",
        signal: "Devin task does not progress beyond thinking state",
        quickCheck: "Cancel and resubmit task; check status.cognition.ai",
      },
      {
        pattern: "Slack integration lag",
        scope: "partial",
        signal: "Devin slow to respond via Slack while web works",
        quickCheck: "Use app.devin.ai web interface as fallback",
      },
      {
        pattern: "Repo permission-related errors",
        scope: "local",
        signal: "Devin fails to access or commit to repository",
        quickCheck: "Verify GitHub/GitLab integration permissions",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Devin is degraded",
        alternative:
          "Claude Code, Cursor Cloud Agents, Windsurf Cascade can reduce downtime for autonomous coding",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Devin has high per-seat cost; outages meaningfully impact Devin-dependent teams",
    ],
  },

  tabnine: {
    slug: "tabnine",
    providerSummary:
      "One of the earliest AI coding assistants. Enterprise-focused; strong air-gapped/on-prem deployment.",
    officialStatusUrl: "https://status.tabnine.com",
    docsUrl: "https://docs.tabnine.com",
    pricingUrl: "https://www.tabnine.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "tabnine.com", description: "", criticality: "critical" },
      { name: "Completion API", description: "", criticality: "high" },
      {
        name: "Enterprise self-hosted instances",
        description: "",
        criticality: "medium",
      },
    ],
    knownFailurePatterns: [
      {
        pattern: "Auth token expiry",
        scope: "local",
        signal: "Completions stop working after token expiry",
        quickCheck: "Re-authenticate in IDE; refresh Tabnine token",
      },
      {
        pattern: "Model selection issues",
        scope: "partial",
        signal: "Wrong model used or model selection fails",
        quickCheck: "Check IDE plugin settings; verify model config",
      },
      {
        pattern: "Enterprise proxy configuration issues",
        scope: "local",
        signal: "Enterprise deployment fails to connect through proxy",
        quickCheck: "Verify proxy allowlist includes Tabnine endpoints",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Tabnine cloud is degraded",
        alternative: "Cursor, Copilot, Continue.dev can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Tabnine offers fully air-gapped on-prem deployment — relevant for regulated industries",
    ],
  },

  "jetbrains-ai": {
    slug: "jetbrains-ai",
    providerSummary:
      "JetBrains IDEs' native AI (IntelliJ, PyCharm, WebStorm, etc.). Competes with Copilot inside JetBrains ecosystem.",
    docsUrl: "https://www.jetbrains.com/help/ai-assistant",
    pricingUrl: "https://www.jetbrains.com/ai/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "JetBrains AI backend", description: "", criticality: "critical" },
      { name: "IDE plugin host", description: "", criticality: "high" },
      { name: "JetBrains account auth", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "JetBrains account SSO issues",
        scope: "partial",
        signal: "SSO login fails for JetBrains account",
        quickCheck: "Try password login; check JetBrains account status",
      },
      {
        pattern: "IDE plugin version mismatches",
        scope: "local",
        signal: "AI features unavailable after IDE or plugin update",
        quickCheck: "Check plugin compatibility; downgrade or upgrade as needed",
      },
      {
        pattern: "Model routing errors",
        scope: "partial",
        signal: "AI requests fail with routing errors",
        quickCheck: "Check JetBrains AI backend status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "JetBrains AI is degraded",
        alternative:
          "GitHub Copilot (JetBrains plugin), Cursor (separate IDE) can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "JetBrains AI integrates deeply with IDE features (refactoring, smart completion) — not just a chat sidebar",
    ],
  },

  pinecone: {
    slug: "pinecone",
    providerSummary:
      "Managed vector database for RAG and semantic search. Serverless and pod-based options.",
    officialStatusUrl: "https://status.pinecone.io",
    docsUrl: "https://docs.pinecone.io",
    pricingUrl: "https://www.pinecone.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "Control Plane",
        description: "Can fail while data plane works",
        criticality: "high",
      },
      {
        name: "Data Plane",
        description: "Regional, per-environment",
        criticality: "critical",
      },
      {
        name: "Serverless endpoints per region",
        description: "Serverless inference",
        criticality: "high",
      },
    ],
    statusSegmentation: ["Control Plane", "Data Plane"],
    knownFailurePatterns: [
      {
        pattern: "Control Plane vs Data Plane divergence",
        scope: "partial",
        signal: "Creating indices may fail while querying existing ones works",
        quickCheck: "Test read operations independently of management API",
      },
      {
        pattern: "Region-specific outages",
        scope: "partial",
        signal: "One region fails while others healthy",
        quickCheck: "Check status.pinecone.io for per-region breakdown",
      },
      {
        pattern: "Pod scaling delays",
        scope: "partial",
        signal: "New pod-based index takes longer than expected to become available",
        quickCheck: "Check index status via API; wait for ready state",
      },
      {
        pattern: "Quota exceeded",
        scope: "local",
        signal: "Requests fail with quota error",
        quickCheck: "Check quota in Pinecone console",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Pinecone Data Plane is degraded",
        alternative:
          "Weaviate, Qdrant, Turbopuffer can reduce downtime for vector queries",
        switchingCost: "medium",
        note: "Data migration required",
      },
      {
        scenario: "Production resilience needed",
        alternative: "pgvector self-hosted is a resilient fallback",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Pinecone Control Plane and Data Plane fail independently — a management API outage doesn't necessarily break live queries. Verify which plane is affected.",
    ],
  },

  weaviate: {
    slug: "weaviate",
    providerSummary:
      "Open-source vector DB (cloud hosted or self-hosted). Hybrid search, multi-tenant support.",
    officialStatusUrl: "https://status.weaviate.cloud",
    docsUrl: "https://weaviate.io/developers",
    pricingUrl: "https://weaviate.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "Weaviate Cloud Control Plane",
        description: "Cluster management",
        criticality: "high",
      },
      {
        name: "Weaviate Cloud Data Plane",
        description: "Queries",
        criticality: "critical",
      },
      {
        name: "REST and gRPC APIs",
        description: "",
        criticality: "high",
      },
    ],
    statusSegmentation: ["Control Plane", "Data Plane"],
    knownFailurePatterns: [
      {
        pattern: "Cluster scaling delays",
        scope: "partial",
        signal: "Cluster scaling takes longer than expected",
        quickCheck: "Check cluster status in Weaviate Cloud console",
      },
      {
        pattern: "Multi-tenant isolation issues",
        scope: "partial",
        signal: "Tenant-specific data access problems",
        quickCheck: "Verify tenant configuration; check Weaviate status",
      },
      {
        pattern: "Backup failures",
        scope: "partial",
        signal: "Scheduled backups fail",
        quickCheck: "Check backup status in console; retry backup",
      },
      {
        pattern: "Control vs Data plane divergence",
        scope: "partial",
        signal: "Management API fails while query API works",
        quickCheck: "Test read operations independently of management operations",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Weaviate Cloud is degraded",
        alternative: "Self-hosting Weaviate (same open-source) is resilient",
        switchingCost: "high",
      },
      {
        scenario: "Alternative needed",
        alternative: "Pinecone, Qdrant are alternatives",
        switchingCost: "medium",
        note: "Data migration required",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Weaviate is open-source — self-hosting is a real resilience option, not a theoretical one",
    ],
  },

  qdrant: {
    slug: "qdrant",
    providerSummary: "Rust-based vector DB. Open-source with cloud hosting option.",
    officialStatusUrl: "https://status.qdrant.io",
    docsUrl: "https://qdrant.tech/documentation",
    pricingUrl: "https://qdrant.tech/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "Qdrant Cloud Control Plane",
        description: "",
        criticality: "high",
      },
      {
        name: "Qdrant Cloud Data Plane",
        description: "",
        criticality: "critical",
      },
    ],
    statusSegmentation: ["Control Plane", "Data Plane"],
    knownFailurePatterns: [
      {
        pattern: "Collection scaling",
        scope: "partial",
        signal: "Collection scaling operations take longer than expected",
        quickCheck: "Check Qdrant Cloud console for collection status",
      },
      {
        pattern: "Quota limits on free tier",
        scope: "local",
        signal: "Operations fail with quota error on free tier",
        quickCheck: "Check free tier limits; upgrade to paid tier if needed",
      },
      {
        pattern: "Control vs Data plane divergence",
        scope: "partial",
        signal: "Collection management fails while queries work",
        quickCheck: "Test read operations independently of management API",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Qdrant Cloud is degraded",
        alternative: "Self-hosted Qdrant (Docker) is production-ready",
        switchingCost: "medium",
      },
      {
        scenario: "Managed alternative needed",
        alternative: "Pinecone, Weaviate are alternatives",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Qdrant's self-hosted Docker image is production-ready — strong resilience story",
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

  "fireworks-ai": {
    slug: "fireworks-ai",
    providerSummary:
      "Fast inference for open-source models (Llama, DeepSeek, Mixtral, etc.) with fine-tuning support.",
    officialStatusUrl: "https://status.fireworks.ai",
    docsUrl: "https://docs.fireworks.ai",
    pricingUrl: "https://fireworks.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "api.fireworks.ai",
        description: "OpenAI-compatible API",
        criticality: "critical",
      },
      { name: "Fine-tuning jobs", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Capacity-driven 429s",
        scope: "partial",
        signal: "429 rate limit errors during peak demand",
        quickCheck: "Implement backoff; check groqstatus.com",
      },
      {
        pattern: "Fine-tuning job queue delays",
        scope: "partial",
        signal: "Fine-tuning jobs queued longer than expected",
        quickCheck: "Check job status in Fireworks dashboard",
      },
      {
        pattern: "Model cold start",
        scope: "partial",
        signal: "First request to model after inactivity is slow",
        quickCheck: "Warm up with a ping request before prod traffic",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fireworks is degraded",
        alternative: "Groq, Together AI, DeepInfra host similar models",
        switchingCost: "low",
        note: "Base URL swap",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: ["OpenAI-compatible API — client code swap is trivial"],
  },

  "notion-ai": {
    slug: "notion-ai",
    providerSummary:
      "AI integrated in Notion. Summarize, write, Q&A on docs, image generation.",
    officialStatusUrl: "https://status.notion.so",
    docsUrl: "https://www.notion.so/help/notion-ai",
    pricingUrl: "https://www.notion.so/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "notion.so", description: "", criticality: "critical" },
      { name: "AI backend", description: "", criticality: "high" },
      { name: "Mobile apps", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notion platform outages cascade to AI",
        scope: "partial",
        signal: "All Notion features including AI are unavailable",
        quickCheck: "Check status.notion.so for platform-wide issues",
      },
      {
        pattern: "AI rate limits during peak",
        scope: "partial",
        signal: "AI features slow or unavailable during peak usage",
        quickCheck: "Wait and retry; check Notion status for AI component",
      },
      {
        pattern: "Specific AI block errors",
        scope: "partial",
        signal: "Specific AI block types fail while others work",
        quickCheck: "Try a different AI block type; refresh page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Notion AI is degraded",
        alternative:
          "ChatGPT + manual copy-paste, Claude Projects with Notion exports can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Notion AI depends on Notion platform reliability — if Notion is down, Notion AI is down",
    ],
  },

  "canva-ai": {
    slug: "canva-ai",
    providerSummary:
      "Canva's AI suite (Magic Write, Magic Design, Magic Edit, Magic Expand). Bundled within Canva platform.",
    officialStatusUrl: "https://www.canva.com/status",
    docsUrl: "https://www.canva.com/help/",
    pricingUrl: "https://www.canva.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "canva.com", description: "", criticality: "critical" },
      { name: "Mobile apps", description: "", criticality: "high" },
      { name: "Magic Studio backends", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Canva platform outages cascade",
        scope: "partial",
        signal: "All Canva features including AI unavailable",
        quickCheck: "Check canva.com/status for platform-wide issues",
      },
      {
        pattern: "Specific Magic tool failures",
        scope: "partial",
        signal: "One Magic tool fails while others work",
        quickCheck: "Try a different Magic tool; check Canva status",
      },
      {
        pattern: "Credit depletion (Pro feature)",
        scope: "local",
        signal: "Magic tool fails with credit error",
        quickCheck: "Check Magic Studio credit balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Canva AI is degraded",
        alternative: "Figma AI, Adobe Express AI can reduce downtime for design AI",
        switchingCost: "low",
      },
      {
        scenario: "Image generation specifically",
        alternative: "Midjourney/DALL-E",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Canva AI is bundled — an AI-tool outage affects specific Magic tools while Canva core editor remains usable",
    ],
  },

  voicemod: {
    slug: "voicemod",
    providerSummary:
      "Real-time AI voice changer for gaming, streaming, meetings. Desktop-first with voice library and effects.",
    docsUrl: "https://help.voicemod.net",
    pricingUrl: "https://www.voicemod.net/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Voicemod desktop app", description: "", criticality: "critical" },
      { name: "License server", description: "", criticality: "high" },
      { name: "Voice library CDN", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "License activation failures",
        scope: "partial",
        signal: "License fails to activate or validate",
        quickCheck: "Check Voicemod license server status; retry activation",
      },
      {
        pattern: "Voice library download failures",
        scope: "partial",
        signal: "Voice effects fail to download from CDN",
        quickCheck: "Check CDN connectivity; retry download",
      },
      {
        pattern: "Audio routing config issues (often mistaken for outage)",
        scope: "local",
        signal: "Voicemod not affecting audio output",
        quickCheck: "Verify audio device routing in OS settings and Voicemod settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Voicemod is degraded",
        alternative:
          "MorphVOX, Clownfish Voice Changer, native OBS audio filters can reduce downtime",
        switchingCost: "low",
        note: "Reduced feature set",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Most 'Voicemod is down' reports are local audio routing configuration rather than platform outages — real outages are license-server-side",
    ],
  },

  tripo3d: {
    slug: "tripo3d",
    providerSummary:
      "Text/image-to-3D model generation. Used in game dev, AR/VR, product design workflows.",
    docsUrl: "https://platform.tripo3d.ai/docs",
    pricingUrl: "https://www.tripo3d.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "tripo3d.ai", description: "", criticality: "critical" },
      { name: "Tripo API", description: "", criticality: "high" },
      { name: "Generation backend", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation queue delays",
        scope: "partial",
        signal: "3D generation takes much longer than typical",
        quickCheck: "Wait several minutes; 3D generation is inherently slow",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance in Tripo3D account",
      },
      {
        pattern: "Specific format export errors",
        scope: "partial",
        signal: "Specific output format fails to export",
        quickCheck: "Try a different output format (GLB, OBJ, FBX)",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Tripo3D is degraded",
        alternative:
          "Meshy, Luma Genie, Rodin (Deemos) can reduce downtime for 3D generation",
        switchingCost: "low",
        note: "Different quality profiles",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "3D generation takes minutes — distinguish queue delay from actual failure before reporting outage",
    ],
  },

  magnific: {
    slug: "magnific",
    providerSummary:
      "AI image upscaler with creative reimagining (not just pixel upscaling — adds detail). Used by pro designers.",
    docsUrl: "https://magnific.ai/documentation",
    pricingUrl: "https://magnific.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "magnific.ai", description: "", criticality: "critical" },
      { name: "Upscale API", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Upscale fails with credit error",
        quickCheck: "Check credit balance in Magnific account",
      },
      {
        pattern: "Large-image upload timeouts",
        scope: "partial",
        signal: "Upload times out for very large images",
        quickCheck: "Reduce image size before upload; try again",
      },
      {
        pattern: "Specific style model errors",
        scope: "partial",
        signal: "Specific style/model combination fails",
        quickCheck: "Try a different style preset; check Magnific status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Magnific is degraded",
        alternative:
          "Topaz Gigapixel (desktop), Upscayl (free open-source), SUPIR via Replicate can reduce downtime for upscaling",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Magnific's creative mode adds detail — pure upscalers (Topaz) have different output characteristics; not a pixel-perfect swap",
    ],
  },

  "minimax-hailuo": {
    slug: "minimax-hailuo",
    providerSummary:
      "MiniMax's video AI (Hailuo). Chinese origin; strong realism and motion.",
    docsUrl: "https://www.minimaxi.com/en",
    pricingUrl: "https://hailuoai.video/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "hailuoai.video", description: "", criticality: "critical" },
      { name: "MiniMax API", description: "", criticality: "high" },
      { name: "Generation queue", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue delays during peak (global demand)",
        scope: "partial",
        signal: "Generation queue significantly backed up during peak hours",
        quickCheck: "Wait for queue to clear; try off-peak",
      },
      {
        pattern: "Regional access patterns",
        scope: "partial",
        signal: "Access quality varies by geographic region",
        quickCheck: "Test from different networks; use VPN if needed",
      },
      {
        pattern: "Content policy rejections",
        scope: "local",
        signal: "Specific prompts rejected by content filter",
        quickCheck: "Rephrase prompt; check MiniMax content policy",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Hailuo is degraded",
        alternative: "Kling AI, Runway, Pika can reduce downtime for video generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },

  "whisper-openai": {
    slug: "whisper-openai",
    providerSummary:
      "OpenAI's speech-to-text model. Available via OpenAI API, as open-weight model, and on third-party hosts (Groq, etc.).",
    officialStatusUrl: "https://status.openai.com",
    docsUrl: "https://platform.openai.com/docs/guides/speech-to-text",
    pricingUrl: "https://openai.com/api/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "api.openai.com Audio endpoint",
        description: "Whisper and successors",
        criticality: "critical",
      },
    ],
    knownFailurePatterns: [
      {
        pattern: "Same as OpenAI API (rate limits, 5xx)",
        scope: "partial",
        signal: "429 or 5xx from OpenAI Audio endpoint",
        quickCheck: "Check status.openai.com for Audio/API component",
      },
      {
        pattern: "Audio file size/format limits",
        scope: "local",
        signal: "Upload fails for large or unsupported format files",
        quickCheck: "Convert to supported format (mp3, mp4, wav); check max file size limit",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "OpenAI Whisper API is degraded",
        alternative:
          "AssemblyAI, Deepgram, Groq (Whisper-large-v3, fast + free tier), or local Whisper can reduce downtime for STT",
        switchingCost: "low",
        note: "Local = high setup cost",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Whisper is open-weight — self-hosted via whisper.cpp or faster-whisper is a production-grade fallback. Groq hosts Whisper with very low latency and a free tier.",
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

  openart: {
    slug: "openart",
    providerSummary:
      "AI image platform aggregating multiple models (Stable Diffusion, Flux, custom) with workflows and LoRA support.",
    docsUrl: "https://openart.ai/blog/guides",
    pricingUrl: "https://openart.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "openart.ai", description: "", criticality: "critical" },
      { name: "Generation backend", description: "", criticality: "high" },
      { name: "Model catalog", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance in OpenArt account",
      },
      {
        pattern: "Specific model availability",
        scope: "partial",
        signal: "Specific model unavailable while others work",
        quickCheck: "Try a different model; check OpenArt status",
      },
      {
        pattern: "LoRA loading errors",
        scope: "partial",
        signal: "LoRA fails to apply to generation",
        quickCheck: "Try without LoRA; check LoRA compatibility with base model",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "OpenArt is degraded",
        alternative:
          "Civitai (model sharing focus), direct Flux on Replicate, Midjourney can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },

  "luma-ai": {
    slug: "luma-ai",
    providerSummary:
      "Luma Labs' 3D capture (NeRF-based scene reconstruction) and Genie 3D object generation. Distinct from Dream Machine (video).",
    docsUrl: "https://docs.lumalabs.ai",
    pricingUrl: "https://lumalabs.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lumalabs.ai", description: "", criticality: "critical" },
      { name: "Capture API", description: "", criticality: "high" },
      { name: "Genie API", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Capture upload failures (large files)",
        scope: "partial",
        signal: "Large NeRF capture uploads fail or time out",
        quickCheck: "Reduce capture size; check upload progress; retry",
      },
      {
        pattern: "Genie generation queue",
        scope: "partial",
        signal: "Genie 3D generation queued for extended time",
        quickCheck: "Wait for queue to clear; try off-peak",
      },
      {
        pattern: "iOS app-specific bugs",
        scope: "local",
        signal: "iOS capture app fails while web interface works",
        quickCheck: "Try web interface; check for iOS app updates",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Luma Genie is degraded",
        alternative:
          "Polycam, Meshy, Tripo3D can reduce downtime for 3D capture/generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Luma Labs ships multiple products under the Luma brand (Dream Machine for video, Genie for 3D, Capture for NeRF) — disambiguate which product users mean",
    ],
  },
};
