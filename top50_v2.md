# DownForAI — Top 50 Service Content v2

> Contenu éditorial unique pour les 50 services AI les plus utilisés mondialement.
> Ce contenu ne doit JAMAIS être en DB. Il est versionné dans le repo.
> Format cible : `src/content/top-services/top50.ts` (conversion TS directe depuis ce MD).
>
> **Niveau de traitement :**
> - ⭐⭐⭐ **Fiches riches** (10) : ChatGPT, Claude, GitHub Copilot, Ollama, Cursor, OpenAI API, Anthropic API, Google Gemini, DeepSeek, Perplexity
> - ⭐⭐ **Fiches standard** (40) : champs essentiels vérifiables
> - ⭐ **Performers GSC** (8) : garder les acquis
>
> **Version** : 2.0 — 17 avril 2026
> **Révisé par** : peer-review Gemini + GPT, corrections factuelles intégrées
>
> **Règles de ton** :
> - Pas de superlatifs non sourcés ("dominant", "leading", "best-in-class")
> - Pas de chiffres d'usage non vérifiés (MAU, WAU, ARR)
> - `officialStatusUrl` = URL vérifiée ou `undefined`, jamais de placeholder
> - Fallbacks formulés "If X unavailable, Y can reduce downtime for [workload]"

---

## Schéma TypeScript cible

```typescript
export type TopServiceContent = {
  slug: string                        // correspond au Service.slug en DB (unique)
  providerSummary: string             // 1-2 phrases factuelles
  officialStatusUrl?: string          // undefined si non vérifié, jamais de placeholder
  docsUrl: string                     // documentation développeur primaire
  pricingUrl?: string
  communityLinks: {
    type: "discord" | "reddit" | "github" | "forum" | "x"
    url: string
    label: string
    verified?: boolean                // true seulement si confirmé officiel
  }[]
  monitoredSurfaces: {
    name: string
    description: string
    criticality: "critical" | "high" | "medium" | "low"
  }[]
  statusSegmentation?: string[]       // NEW v2: composants publics segmentés par le provider
  modelFamilies?: string[]
  commonLimits?: string[]             // formulations défendables, pas chiffres non sourcés
  knownFailurePatterns: {
    pattern: string
    scope: "global" | "partial" | "local"
    signal: string
    quickCheck: string
  }[]
  fallbackAlternatives: {
    scenario: string
    alternative: string
    switchingCost: "low" | "medium" | "high"
    note?: string
  }[]
  ecosystemDependencies: string[]
  operatorNotes: string[]
  diagnosticHeaders?: string[]        // NEW v2: headers HTTP à logger
  diagnosticCommands?: string[]       // NEW v2: commandes copy-paste pour diagnostic
}
```

---

# ⭐⭐⭐ FICHES RICHES (10 services)

---

## 1. ChatGPT

**slug** : `chatgpt`

### providerSummary
ChatGPT is OpenAI's consumer-facing AI assistant across web and mobile. It provides access to OpenAI chat models and tools, with plan-dependent limits and features.

### officialStatusUrl
`https://status.openai.com`

### docsUrl
`https://help.openai.com/en/collections/3742473-chatgpt`

### pricingUrl
`https://openai.com/chatgpt/pricing/`

### communityLinks
- **reddit** — `https://reddit.com/r/ChatGPT` — community (verified: true)
- **reddit** — `https://reddit.com/r/OpenAI` — more technical audience (verified: true)
- **x** — `https://x.com/OpenAI` — official announcements (verified: true)

### monitoredSurfaces
- **ChatGPT Web** (`chatgpt.com`) — **critical** — consumer interface
- **ChatGPT Mobile Apps** (iOS/Android) — **high** — mobile backend
- **Auth / Login** (ChatGPT sign-in flow; may redirect to IdP/SSO depending on workspace) — **critical**
- **Conversation Backend** — **critical** — message submission
- **Image Generation** (DALL-E integrated) — **medium**
- **Voice Mode** — **medium**

### statusSegmentation
- ChatGPT
- APIs
- Codex
- Sora

### modelFamilies
- GPT-4o / GPT-4o mini
- GPT-5 (2026)
- o1 / o3 (reasoning)
- DALL-E 3 (image)

### commonLimits
- Limits vary by plan and load. OpenAI's official pricing page does not publish stable message caps for all ChatGPT tiers; link users to the pricing page instead of hard-coding counts.

### knownFailurePatterns

- **"Login failed / session expired"**
  - Scope: global (when widespread)
  - Signal: auth-related 5xx errors, reports on r/OpenAI
  - Quick check: try incognito, check status page for Auth component

- **"Message generation stuck / empty response"**
  - Scope: global or model-specific
  - Signal: conversation backend degraded, specific model overloaded
  - Quick check: switch model (GPT-4o mini instead of GPT-5), retry in new chat

- **"Chat unavailable, please try again later"**
  - Scope: global
  - Signal: capacity outage or deployment rollback
  - Quick check: official status page may lag early user reports

- **"Something went wrong / network error" when routed via specific network path**
  - Scope: local
  - Signal: isolated to users on specific network configurations
  - Quick check: test from another trusted network and compare behavior across web/mobile before concluding it is a provider outage

- **Status divergence between ChatGPT web and API**
  - Scope: partial
  - Signal: ChatGPT web errors while API calls succeed (or vice versa) — different infrastructures
  - Quick check: test `api.openai.com/v1/models` via cURL; if API works, issue is web-side only

- **Model picker missing GPT-4o / GPT-5**
  - Scope: partial rollout or account tier mismatch
  - Signal: intermittent across users
  - Quick check: hard refresh, verify subscription tier

### fallbackAlternatives
- **If ChatGPT web is degraded**: OpenAI API Playground (`platform.openai.com/playground`) can reduce downtime for interactive workflows — **low** switching cost for devs
- **If ChatGPT web is degraded but OpenAI account auth works**: test the API Playground / platform separately before failing over your whole workflow
- **If ChatGPT + API both down**: Claude (claude.ai) can reduce downtime for general chat workloads — **low** cost
- **If OpenAI ecosystem unavailable**: Google Gemini or Mistral Le Chat can reduce downtime for text workloads — **low** cost
- **For offline continuity**: Ollama + open-weight models locally — **high** cost, zero dependency after setup

### ecosystemDependencies
- Many third-party apps depend on OpenAI APIs or models, but dependencies vary by vendor and can change over time
- Microsoft Copilot (consumer) runs on OpenAI models via Azure OpenAI (separate infrastructure)
- Azure OpenAI Service is a distinct infrastructure — often stays up during direct OpenAI API outages

### operatorNotes
- Community channels often surface issues before official incident pages, but reports are noisy and should be cross-checked
- Some incidents appear around rollout or traffic spikes, but users should rely on live probe/status signals rather than assumed outage windows
- Workspace SSO and chatgpt.com login path can behave differently from pure consumer login; don't classify an SSO issue as a global outage without checking
- During API outages, users with Azure OpenAI provisioning are often unaffected — consider fallback routing if your stack supports it

### diagnosticHeaders
- `x-request-id`
- `x-ratelimit-limit-requests`
- `x-ratelimit-remaining-requests`
- `x-ratelimit-reset-requests`
- `x-ratelimit-limit-tokens`
- `x-ratelimit-remaining-tokens`
- `X-Client-Request-Id`

### diagnosticCommands
- `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"` — basic API reachability check
- Check `status.openai.com` components for ChatGPT vs APIs separately
- Retry with a unique `X-Client-Request-Id` and log `x-request-id` from the response for support tickets

---

## 2. OpenAI API

**slug** : `openai`

### providerSummary
The OpenAI API provides programmatic access to OpenAI models (chat completions, responses, realtime, images, audio, embeddings, batch, files, assistants). Different infrastructure from ChatGPT web.

### officialStatusUrl
`https://status.openai.com`

### docsUrl
`https://platform.openai.com/docs`

### pricingUrl
`https://openai.com/api/pricing`

### communityLinks
- **forum** — `https://community.openai.com` — official developer forum (verified: true)
- **reddit** — `https://reddit.com/r/OpenAI` — community (verified: true)

### monitoredSurfaces
- **Chat Completions API** — **critical**
- **Responses API** — **high**
- **Realtime API** — **high** — streaming audio/text
- **Images API** — **medium**
- **Audio API** (TTS, Whisper) — **medium**
- **Embeddings API** — **medium**
- **Batch API** — **low** — async
- **Assistants API** — **medium**
- **Files API** — **low**

### statusSegmentation
- APIs
- ChatGPT
- Codex
- Sora

### modelFamilies
- GPT-5, GPT-4o, GPT-4o mini
- o1, o3 (reasoning)
- DALL-E 3 (images)
- Whisper (STT), TTS

### commonLimits
- API access uses tiered rate limits (Tier 1-5) based on payment history and usage
- Rate limits expressed per-model in requests-per-minute (RPM) and tokens-per-minute (TPM)
- Tier thresholds and exact limits are published on platform.openai.com

### knownFailurePatterns

- **429 "rate_limit_exceeded"**
  - Scope: local (your tier quota)
  - Signal: `x-ratelimit-remaining-*` headers at zero
  - Quick check: implement exponential backoff, review `retry-after` header, upgrade tier if structural

- **529 / 5xx "overloaded"**
  - Scope: global or model-specific
  - Signal: elevated error rate across accounts
  - Quick check: retry with backoff, switch model (e.g., GPT-5 → GPT-4o), check Azure OpenAI if provisioned

- **Specific endpoint degraded while others healthy**
  - Scope: partial
  - Signal: e.g., Responses API fails but Chat Completions works
  - Quick check: official status page with API sub-component breakdown

- **401 "invalid_api_key"**
  - Scope: local
  - Signal: auth failure consistent across all endpoints
  - Quick check: verify key, check org/project scope, regenerate if needed

- **Regional latency spikes**
  - Scope: partial
  - Signal: p95 latency anomalies without error rate increase
  - Quick check: test from multiple regions; consider Azure OpenAI regional endpoints

### fallbackAlternatives
- **If direct OpenAI API is degraded**: Azure OpenAI Service can reduce downtime for prod workloads (separate infrastructure) — **low-medium** cost if already provisioned
- **If full OpenAI ecosystem unavailable**: Anthropic API, Google Gemini API, Mistral API can reduce downtime for general chat — **low** cost with abstraction layer
- **If embeddings API down**: Voyage AI or Cohere Embed are drop-in alternatives — **low** cost
- **For latency-sensitive workloads**: Groq (fast inference on open-weight models) can reduce latency tail — **medium** cost (different model quality)

### ecosystemDependencies
- Many third-party apps depend on OpenAI APIs; dependency patterns vary
- Azure OpenAI Service is a distinct infrastructure, not a proxy
- Assistants API depends on Files API for attached resources

### operatorNotes
- The Azure OpenAI/direct OpenAI split is the most important fallback for production users
- Rate limit headers (`x-ratelimit-*`) return real quota state on every response — log them proactively, don't wait for 429
- Tier upgrades are often automatic based on spending; programmatic tier probing is unnecessary
- For Realtime API, connection drops are expected; implement reconnect logic, don't flag as outage

### diagnosticHeaders
- `x-request-id`
- `x-ratelimit-limit-requests`
- `x-ratelimit-remaining-requests`
- `x-ratelimit-reset-requests`
- `x-ratelimit-limit-tokens`
- `x-ratelimit-remaining-tokens`
- `retry-after`

### diagnosticCommands
- `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"` — basic reachability + lists models
- `curl https://api.openai.com/v1/chat/completions -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d '{"model":"gpt-4o","messages":[{"role":"user","content":"ping"}]}'` — real inference test
- `curl -I https://api.openai.com` — TLS/DNS sanity check (returns 404 but confirms reachability)

---

## 3. Anthropic Claude (consumer + web)

**slug** : `claude-chat`

### providerSummary
Claude is Anthropic's AI assistant focused on safety and long-context reasoning. The consumer-facing product lives at claude.ai. For developer API access, see the separate Anthropic API card.

### officialStatusUrl
`https://status.anthropic.com`

### docsUrl
`https://docs.anthropic.com`

### pricingUrl
`https://www.anthropic.com/pricing`

### communityLinks
- **reddit** — `https://reddit.com/r/ClaudeAI` — community (verified: true)
- **x** — `https://x.com/AnthropicAI` — official announcements (verified: true)

### monitoredSurfaces
- **claude.ai** (web UI) — **critical**
- **Claude mobile apps** (iOS/Android) — **high**
- **Auth (claude.ai sign-in)** — **critical**

### statusSegmentation
- claude.ai
- Claude API
- Claude Console (platform.claude.com)
- Claude Code

### modelFamilies
- Claude Opus 4.6, Claude Opus 4.1, Claude Opus 4
- Claude Sonnet 4.6, Claude Sonnet 4.5, Claude Sonnet 4
- Claude Haiku 4.5
- Claude Sonnet 3.7 (deprecated but still seen in legacy integrations)

### commonLimits
- claude.ai usage limits vary by plan and load; official exact caps are not publicly fixed and change with load
- Pro, Max, Team, Enterprise tiers available; consult pricing page for current plans

### knownFailurePatterns

- **"Claude is temporarily unavailable" on claude.ai**
  - Scope: global (UI-wide) or partial (specific models)
  - Signal: web UI error, Claude API may still work
  - Quick check: try API via platform.claude.com Workbench

- **API healthy, claude.ai degraded**
  - Scope: partial (major pattern)
  - Signal: direct API calls succeed while web chat fails
  - Quick check: status.anthropic.com component breakdown; use API directly if you're a developer

- **Long-context requests fail while short ones succeed**
  - Scope: partial (context-length-dependent)
  - Signal: errors on high-token requests, success on low-token
  - Quick check: reduce context, use prompt caching, try an alternative provider-hosted route (Bedrock/Vertex) if available

- **Authentication loop on claude.ai**
  - Scope: global or local
  - Signal: sign-in redirect loop, invalid session
  - Quick check: clear cookies, try incognito, check status page for Auth component

- **Model deprecation / "model not found"**
  - Scope: local
  - Signal: specific model ID returns 404 or deprecation warning
  - Quick check: docs.anthropic.com/models for current IDs

### fallbackAlternatives
- **If claude.ai is degraded but API works**: API Console Workbench at platform.claude.com can reduce downtime for power users — **low** cost
- **If direct Anthropic path is degraded and your org has Bedrock/Vertex provisioned**: retry the same workload on AWS Bedrock or Google Vertex AI (separate infrastructures hosting Claude) — **low-medium** cost
- **If all Anthropic routes unavailable**: OpenAI ChatGPT / Mistral Le Chat can reduce downtime for general chat — **low** cost
- **For Claude-specific reasoning workloads**: Google Gemini 2.5 Pro is a close equivalent — **low** cost

### ecosystemDependencies
- Cursor, Continue.dev, Zed, Claude Code — all route workloads to Claude models by default in many configurations
- Enterprise SaaS products often consume Claude via AWS Bedrock or Google Vertex AI rather than direct API
- Direct Anthropic API and Bedrock/Vertex-hosted Claude are separate infrastructures with different reliability profiles

### operatorNotes
- Direct Anthropic API and Bedrock-hosted Claude are **different infrastructures**. Bedrock can stay up during direct API outages.
- Model aliases and provider-specific model IDs differ across Claude API, Bedrock, and Vertex — a "model not found" error may just be a cross-platform ID mismatch
- For long-context workloads (>100k tokens), Sonnet often has better availability than Opus during capacity incidents
- Claude Code has its own status component separate from claude.ai

### diagnosticCommands
- Visit `status.anthropic.com` — verify which component is affected (claude.ai, Claude API, Claude Code, Console)
- For API diagnostic, see the separate Anthropic API card

---

## 4. Anthropic API

**slug** : `anthropic`

### providerSummary
The Anthropic API provides programmatic access to Claude models via a REST interface at `https://api.anthropic.com`. Also available through AWS Bedrock and Google Vertex AI as separate infrastructures.

### officialStatusUrl
`https://status.anthropic.com`

### docsUrl
`https://docs.anthropic.com`

### pricingUrl
`https://www.anthropic.com/pricing#anthropic-api`

### communityLinks
- **reddit** — `https://reddit.com/r/ClaudeAI` — community (verified: true)
- **x** — `https://x.com/AnthropicAI` — official announcements (verified: true)

### monitoredSurfaces
- **Claude API** (`api.anthropic.com`) — **critical** — direct access
- **Claude Console / Workbench** (`platform.claude.com`) — **high** — dev dashboard
- **AWS Bedrock — Claude models** — **high** — alternate infrastructure
- **Google Vertex AI — Claude models** — **medium** — alternate infrastructure
- **Message Batches API** — **low** — async

### statusSegmentation
- Claude API
- Claude Console
- claude.ai
- Claude Code

### modelFamilies
- Claude Opus 4.6, Claude Opus 4.1
- Claude Sonnet 4.6, Claude Sonnet 4.5
- Claude Haiku 4.5
- Claude Sonnet 3.7 (deprecated)
- Model IDs differ across Claude API, Bedrock, and Vertex — verify per-platform

### commonLimits
- Rate limits per tier; API returns real-time remaining quota via `anthropic-ratelimit-*` headers
- Prompt caching reduces input token costs significantly for repeated contexts
- Message Batches API offers ~50% cost reduction for async workloads

### knownFailurePatterns

- **429 with `retry-after` header**
  - Scope: local (tier quota)
  - Signal: `anthropic-ratelimit-requests-remaining` or `anthropic-ratelimit-*-tokens-remaining` at zero
  - Quick check: implement backoff respecting `retry-after`, upgrade tier if structural

- **529 "overloaded"**
  - Scope: global (capacity)
  - Signal: sustained 529 across accounts, often model-specific
  - Quick check: switch model (Sonnet instead of Opus), exponential backoff, consider Bedrock fallback

- **400 "missing anthropic-version header"**
  - Scope: local (request config)
  - Signal: consistent 400 on all requests
  - Quick check: ensure `anthropic-version: 2023-06-01` header is set

- **Direct Anthropic vs Bedrock/Vertex divergence**
  - Scope: partial
  - Signal: direct API degraded while Bedrock/Vertex healthy (or vice versa)
  - Quick check: test the same model on both paths if provisioned

- **401 "invalid authentication"**
  - Scope: local
  - Signal: auth failure on all endpoints
  - Quick check: verify `x-api-key` header, check key status in Console

- **"Model not found" across providers**
  - Scope: local (ID mismatch)
  - Signal: works on direct API, fails on Bedrock (or vice versa)
  - Quick check: verify Bedrock/Vertex-specific model ID format

### fallbackAlternatives
- **If direct Anthropic API is degraded**: AWS Bedrock-hosted Claude can reduce downtime if your org is on AWS — **low** cost if already provisioned
- **If Anthropic and Bedrock both down**: Google Vertex AI-hosted Claude is a third infrastructure path — **medium** cost
- **If all Anthropic paths unavailable**: OpenAI API or Google Gemini API can reduce downtime for general chat — **low** cost with abstraction layer
- **For long-context workloads specifically**: Gemini 2.5 Pro handles very long contexts — **low** cost

### ecosystemDependencies
- Claude Code depends on Anthropic API + auth
- Cursor, Continue.dev route to Claude models by default for many users
- Enterprise deployments often prefer Bedrock/Vertex for SLA and compliance

### operatorNotes
- The `anthropic-version` header is **required** on every request — missing it returns a 400 that juniors often misdiagnose as an endpoint outage
- Monitor `anthropic-ratelimit-*` headers proactively — don't wait for 429s
- Prompt caching changes effective rate limits dramatically; measure with caching enabled
- For high-volume prod: provision Bedrock or Vertex as a fallback route; it's a different infrastructure, often unaffected by direct API incidents

### diagnosticHeaders
- `retry-after`
- `anthropic-ratelimit-requests-limit`
- `anthropic-ratelimit-requests-remaining`
- `anthropic-ratelimit-requests-reset`
- `anthropic-ratelimit-input-tokens-limit`
- `anthropic-ratelimit-input-tokens-remaining`
- `anthropic-ratelimit-output-tokens-limit`
- `anthropic-ratelimit-output-tokens-remaining`
- `request-id`

### diagnosticCommands
- `curl https://api.anthropic.com/v1/models -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01"` — reachability + model list
- Real inference test: `curl https://api.anthropic.com/v1/messages -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" -d '{"model":"claude-sonnet-4-5","max_tokens":10,"messages":[{"role":"user","content":"ping"}]}'`
- Check `status.anthropic.com` for component-level breakdown (API vs Console vs claude.ai vs Claude Code)

---

## 5. GitHub Copilot

**slug** : `github-copilot`

### providerSummary
GitHub Copilot is GitHub's AI coding assistant (IDE autocomplete, chat, coding agent, code review, CLI). Uses included and premium models depending on feature and plan; model availability varies by feature.

### officialStatusUrl
`https://www.githubstatus.com`

### docsUrl
`https://docs.github.com/en/copilot`

### pricingUrl
`https://github.com/features/copilot/plans`

### communityLinks
- **github** — `https://github.com/orgs/community/discussions/categories/copilot` — official community (verified: true)
- **reddit** — `https://reddit.com/r/GithubCopilot` — community (verified: true)
- **x** — `https://x.com/github` — announcements (verified: true)

### monitoredSurfaces
- **Copilot IDE completions** (ghost text in VS Code / JetBrains / Neovim) — **critical**
- **Copilot Chat** (IDE + web) — **high**
- **Copilot coding agent** — **medium** — autonomous PR generation
- **Copilot code review** — **medium** — PR inline suggestions
- **Copilot CLI** (`copilot` command) — **medium** — officially documented surface
- **GitHub Auth / SSO** — **critical** — Copilot depends on GitHub session
- **VS Code Marketplace** (extension updates) — **low**

### statusSegmentation
- Copilot
- API Requests
- Actions
- Git Operations

### modelFamilies
- Model availability varies by feature and plan
- Included models (covered by base plan) vs premium models (count against premium request quota)
- User can switch model in Chat for some features

### commonLimits
- **Copilot Free**: up to 2,000 inline suggestion requests and up to 50 premium requests per month; chat interactions count as premium requests
- **Copilot Pro** ($10/mo): unlimited completions, 300 premium requests/month
- **Copilot Pro+** ($39/mo): higher premium request quota
- **Copilot Business** ($19/user/mo): org controls, audit logs
- **Copilot Enterprise** ($39/user/mo): org policies, custom models
- Premium request counters reset on the 1st of each month at 00:00:00 UTC

### knownFailurePatterns

- **IDE completions timeout / grayed out**
  - Scope: global or local (extension)
  - Signal: githubstatus.com Copilot component degraded, or local extension crash
  - Quick check: reload window, check status, check GitHub auth token

- **Copilot Chat unavailable but completions work**
  - Scope: partial (Chat-only outage)
  - Signal: Chat endpoint degraded, completions endpoint healthy
  - Quick check: chat fails in IDE, ghost text still appears → confirmed partial outage

- **Premium request exhaustion vs included-model chat still working**
  - Scope: local (quota)
  - Signal: "You've used all your premium requests" banner, but included models still respond
  - Quick check: switch Chat model picker to an included model

- **"Copilot is not available for your account"**
  - Scope: local (license / org policy)
  - Signal: isolated to specific users, works for teammates
  - Quick check: GitHub subscription, org SSO, seat assignment, org policy for features/CLI

- **GitHub Auth cascading failure**
  - Scope: global (when GitHub-wide)
  - Signal: GitHub status page shows auth component issue
  - Quick check: log out/in, check github.com sign-in separately

- **Local auth state expiration or proxy/VPN interference**
  - Scope: local
  - Signal: intermittent failures tied to specific networks (corporate proxy)
  - Quick check: verify `api.githubcopilot.com` and `api.github.com` are whitelisted; check that proxy does not rewrite TLS certs

### fallbackAlternatives
- **If Copilot IDE completions unavailable**: GitHub Chat on the web (`github.com/copilot`) can reduce downtime while IDE extension is failing — **low** cost
- **If Copilot IDE completions unavailable**: Cursor or Windsurf/Codeium can reduce downtime for active coding sessions — **medium** cost (new IDE setup)
- **If Copilot Chat down but completions work**: continue with completions, use claude.ai or chatgpt.com for chat separately — **low** cost
- **If premium requests exhausted**: switch to included models in Chat picker — **low** cost
- **For air-gapped or highly regulated environments**: Continue.dev + Ollama (local open-weight models) — **high** setup cost, zero dependency

### ecosystemDependencies
- **Depends on**: GitHub auth, VS Code (or JetBrains) extension host, upstream model backends
- **Often confused with**: Microsoft Copilot (separate product)
- **Cascading failures**: if GitHub auth fails, Copilot + Actions + Codespaces all fail together
- GitHub org policy can disable CLI/features independently of the base subscription

### operatorNotes
- A significant share of user-reported Copilot incidents turn out to be auth, licensing, or org-policy issues rather than a platform-wide outage
- The `githubstatus.com` Copilot component is separate from `API` and `Actions` — verify you're reading the right component
- `api.githubcopilot.com` must be whitelisted in enterprise proxies; TLS cert interception by corporate proxies is a common silent failure mode
- Enterprise admins can disable Copilot at org level — a whole team "suddenly losing Copilot" is often a policy change, not an outage
- Copilot CLI is officially documented and available on all paid plans subject to org policy

### diagnosticCommands
- `copilot --version` — verify CLI installed and authenticated
- Check GitHub auth status in IDE: reload window, check sign-in in command palette
- Verify `api.githubcopilot.com` reachable: `curl -I https://api.githubcopilot.com`
- Check `githubstatus.com` Copilot component specifically (not just overall GitHub status)

---

## 6. Google Gemini

**slug** : `google-gemini`

### providerSummary
Google's flagship AI assistant across Gemini web/mobile and Google's developer/enterprise AI stack. Available via gemini.google.com, AI Studio (free dev access), and Vertex AI (enterprise).

### officialStatusUrl
`https://status.cloud.google.com`

### docsUrl
`https://ai.google.dev/gemini-api/docs`

### pricingUrl
`https://ai.google.dev/pricing`

### communityLinks
- **reddit** — `https://reddit.com/r/GoogleGeminiAI` — community (verified: true)
- **x** — `https://x.com/GoogleAI` — official announcements (verified: true)

### monitoredSurfaces
- **Gemini Web** (`gemini.google.com`) — **critical** — consumer
- **Gemini Mobile Apps** (iOS/Android) — **high**
- **Gemini API** (`ai.google.dev`) — **critical** — dev API
- **Google AI Studio** — **high** — dev playground
- **Vertex AI — Gemini models** — **critical** — enterprise infrastructure
- **Workspace integration** (Gmail, Docs, Meet AI) — **medium**

### statusSegmentation
- Vertex AI
- Google AI Studio
- Gemini API
- Workspace (separate components for Gmail/Docs/Meet AI)

### modelFamilies
- Gemini 2.5 Pro, Gemini 2.5 Flash
- Gemini 2.0 Flash / Flash-Lite
- Gemini Nano (on-device)

### commonLimits
- Free tier available via AI Studio with per-minute rate limits
- Paid API access via AI Studio or Vertex AI with tier-based quotas
- Vertex AI offers quota increases via GCP console

### knownFailurePatterns

- **"Something went wrong" on gemini.google.com**
  - Scope: global (UI) or partial
  - Signal: web UI error, API may still work
  - Quick check: try AI Studio directly, check Google Cloud status for Vertex AI component

- **Image generation blocked by content filter**
  - Scope: local (filter, not outage)
  - Signal: specific prompts fail, others work
  - Quick check: rephrase prompt, not a platform issue

- **API 429 quota exceeded**
  - Scope: local (tier quota)
  - Signal: rate limit headers from Google API
  - Quick check: AI Studio console for quota status, upgrade tier or move to Vertex

- **AI Studio healthy, Vertex AI degraded (or vice versa)**
  - Scope: partial
  - Signal: different infrastructures can fail independently
  - Quick check: test both paths if your stack supports it

- **Workspace integration lag**
  - Scope: partial
  - Signal: Gmail/Docs AI slow while gemini.google.com normal
  - Quick check: Workspace status dashboard separately

### fallbackAlternatives
- **If gemini.google.com is down**: AI Studio can reduce downtime for dev workflows — **low** cost
- **If AI Studio is down**: Vertex AI (separate infrastructure) can reduce downtime — **low-medium** cost if on GCP
- **If full Google AI stack unavailable**: OpenAI API or Anthropic API can reduce downtime — **low** cost with abstraction layer
- **For long-context workloads specifically**: Claude API is a close alternative for >1M token handling — **low** cost

### ecosystemDependencies
- Workspace AI features depend on Gemini backend
- Android integration (Gemini assistant) depends on cloud API
- Vertex AI and AI Studio are separate infrastructures; enterprise Vertex users often unaffected by gemini.google.com outages

### operatorNotes
- Vertex AI and AI Studio route through different quota pools; verify which one your workload uses
- Google's status page covers Vertex AI but not gemini.google.com directly — consumer UI outages may not be flagged
- Workspace integration can degrade independently of core Gemini — check the right status dashboard
- Gemini models have the longest context windows in the industry; tooling that assumes OpenAI-style token limits may underestimate capacity

### diagnosticHeaders
- Standard Google API headers: `x-goog-api-client`, `x-goog-quota-user`

### diagnosticCommands
- `curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"` — basic reachability + model list
- Check `status.cloud.google.com` for Vertex AI component status
- For enterprise debugging, Google Cloud Console has per-quota monitoring

---

## 7. DeepSeek

**slug** : `deepseek`

### providerSummary
Chinese AI lab producing open-weight frontier models (DeepSeek V3, R1 reasoning, Coder). Direct web/API access at deepseek.com; models also hosted on multiple third-party inference providers.

### officialStatusUrl
`https://status.deepseek.com`

### docsUrl
`https://api-docs.deepseek.com`

### pricingUrl
`https://api-docs.deepseek.com/quick_start/pricing`

### communityLinks
- **github** — `https://github.com/deepseek-ai` — official repos (verified: true)
- **reddit** — `https://reddit.com/r/DeepSeek` — community (verified: true)
- **x** — `https://x.com/deepseek_ai` — official (verified: true)

### monitoredSurfaces
- **chat.deepseek.com** — **critical** — consumer web
- **DeepSeek mobile apps** — **high**
- **DeepSeek API** (`api.deepseek.com`) — **critical** — dev API

### statusSegmentation
- Web
- API
- Mobile

### modelFamilies
- DeepSeek V3 (general chat)
- DeepSeek R1 (reasoning)
- DeepSeek Coder

### commonLimits
- OpenAI-compatible API with per-token pricing
- Rate limits per account; consult api-docs.deepseek.com for current tier structure

### knownFailurePatterns

- **Capacity constraints during viral demand spikes**
  - Scope: global
  - Signal: sustained 429 or 5xx across accounts
  - Quick check: use third-party hosted DeepSeek (Together AI, Fireworks, Groq) as fallback

- **Regional access variability**
  - Scope: partial (network-dependent)
  - Signal: some users report access issues, others not
  - Quick check: test from multiple network paths; third-party hosts (Together, Fireworks) may be more consistent

- **API 429 during US business hours**
  - Scope: partial
  - Signal: rate limits concentrated during peak global demand
  - Quick check: schedule batch workloads off-peak, use third-party hosts

- **Model cold start latency**
  - Scope: partial
  - Signal: first request slow, subsequent fast
  - Quick check: warm up with ping request before prod traffic

### fallbackAlternatives
- **If direct DeepSeek API is degraded**: Together AI, Fireworks AI, or Groq host DeepSeek models as OpenAI-compatible APIs — **low** cost, base URL swap
- **If all DeepSeek paths unavailable**: for reasoning workloads, OpenAI o1/o3 or Claude Opus can reduce downtime — **low** cost
- **For self-hosted resilience**: DeepSeek models are open-weight, can be run via vLLM or Ollama — **high** setup cost
- **For coding specifically**: Qwen 2.5 Coder or Llama 3.3 (via Groq/Together) are alternatives — **low** cost

### ecosystemDependencies
- DeepSeek models are open-weight — many third-party inference providers host them
- Cursor, Continue.dev, and OpenRouter offer DeepSeek model routing

### operatorNotes
- Unlike closed-weight providers, DeepSeek has a real "reseller market" — Together AI, Fireworks AI, DeepInfra, Groq all host DeepSeek R1 and V3 with different reliability profiles
- When direct DeepSeek API is down, the fastest fallback is a base-URL swap to a third-party host
- DeepSeek API is OpenAI-compatible: client libraries work with minimal code changes

### diagnosticCommands
- `curl https://api.deepseek.com/v1/models -H "Authorization: Bearer $DEEPSEEK_API_KEY"` — reachability
- OpenAI-compatible: existing OpenAI client code works by changing `base_url`
- Fallback test: swap to `https://api.together.xyz/v1` with Together API key to test same model

---

## 8. Perplexity

**slug** : `perplexity`

### providerSummary
AI-powered search engine with sourced answers. Combines LLM reasoning with real-time web search and citations. Consumer app plus Sonar API for developers.

### officialStatusUrl
`https://status.perplexity.ai`

### docsUrl
`https://docs.perplexity.ai`

### pricingUrl
`https://perplexity.ai/pro`

### communityLinks
- **discord** — `https://discord.gg/perplexity-ai` — official community (verified: true)
- **reddit** — `https://reddit.com/r/perplexity_ai` — community (verified: true)
- **x** — `https://x.com/perplexity_ai` — official (verified: true)

### monitoredSurfaces
- **perplexity.ai web** — **critical**
- **Perplexity mobile apps** (iOS/Android) — **high**
- **Sonar API** (`api.perplexity.ai`) — **high** — dev API
- **Web search backend** (scraping/indexing) — **critical** — unique dependency

### statusSegmentation
- Web App
- API
- Search Infrastructure

### modelFamilies
- Sonar (proprietary search-augmented)
- Sonar Pro
- Claude, GPT, Grok (Pro user choice for underlying reasoning)

### commonLimits
- Free tier: limited Pro Searches per day
- Pro tier ($20/mo): expanded Pro Searches, Deep Research access
- Sonar API: pay-per-request with tier-based quotas

### knownFailurePatterns

- **"Failed to fetch sources"**
  - Scope: partial (web scraping infra)
  - Signal: LLM healthy, but source retrieval fails
  - Quick check: retry after a minute; if persistent, sources-side issue, not Perplexity itself

- **Citation links return 404**
  - Scope: local (source site changed)
  - Signal: answer is correct but source link is stale
  - Quick check: expected for time-sensitive sources; Perplexity caches but doesn't mirror

- **Deep Research timeout**
  - Scope: partial (Pro feature)
  - Signal: Deep Research mode stuck "Researching..."
  - Quick check: Deep Research runs 5-10 min; don't assume stuck under 10 min

- **Upstream model backend issue**
  - Scope: partial
  - Signal: specific model (Claude/GPT/Grok) fails while others work
  - Quick check: switch underlying model in Pro settings

- **Search index staleness**
  - Scope: partial
  - Signal: very recent news missing from search
  - Quick check: normal; Perplexity indexes with delay, not real-time

### fallbackAlternatives
- **If Perplexity is degraded**: You.com or Kagi offer similar AI-powered search — **low** cost
- **For coding search specifically**: Phind is an alternative — **low** cost
- **If only source retrieval is broken**: direct ChatGPT with web browsing or Claude with web access can reduce downtime — **low** cost
- **For deep research workloads**: Claude Projects with manual document upload can substitute for Perplexity Deep Research — **medium** cost (manual setup)

### ecosystemDependencies
- Depends on web scraping/crawling infrastructure (proprietary plus upstream search providers)
- Underlying LLM models (Claude, GPT, etc.) — cascades possible from those providers

### operatorNotes
- Source fetching failures are often upstream (the sites Perplexity is trying to read), not Perplexity itself
- Deep Research is a long-running task; UI "stuck" perception is common — timeouts are 5-10 min typically
- Pro users can select the underlying reasoning model; a model-specific issue can be worked around without leaving Perplexity
- Real-time news indexing has delay — not a real-time search engine like Google News

### diagnosticCommands
- `curl https://api.perplexity.ai/chat/completions -H "Authorization: Bearer $PPLX_API_KEY" -H "Content-Type: application/json" -d '{"model":"sonar","messages":[{"role":"user","content":"ping"}]}'` — Sonar API reachability
- Check `status.perplexity.ai` for component-level breakdown

---

## 9. Ollama

**slug** : `ollama`

### providerSummary
Popular local LLM runtime with local API, CLI, and cloud-hosted models. Official docs explicitly document integrations with tools such as Claude Code and Codex via `ollama launch`.

### officialStatusUrl
`https://status.ollama.com` (Cloud only; local runs are self-diagnosed)

### docsUrl
`https://docs.ollama.com`

### pricingUrl
`https://ollama.com/pricing`

### communityLinks
- **github** — `https://github.com/ollama/ollama/issues` — bug signal (verified: true)
- **discord** — `https://discord.gg/ollama` — official community (verified: true)
- **reddit** — `https://reddit.com/r/ollama` — community (verified: true)
- **x** — `https://x.com/ollama` — official (verified: true)

### monitoredSurfaces
- **Ollama Registry** (`registry.ollama.ai`) — **critical for new model pulls**
- **Ollama Cloud API** (`ollama.com/api`) — **high** — managed inference (public beta since Jan 2026)
- **Ollama website** (`ollama.com`) — **medium** — docs, downloads
- **Local daemon** (`http://localhost:11434`) — **N/A for downforai monitoring** — user-side

### statusSegmentation
- Cloud
- Registry
- Web

### modelFamilies
- User pulls what they want: Llama 3.3, Qwen 2.5, Mistral, Phi-3, DeepSeek R1, Gemma, etc.
- Also supports vision models (LLaVA, Llama 3.2 Vision) and embedding models

### commonLimits
- **Local deployment**: unlimited, bounded only by user hardware (RAM, VRAM, disk)
- **Ollama Cloud**: authenticated via API key, tiered plans (Free / Pro / Max); usage limits reset hourly and weekly per official pricing
- No auth required for localhost API; auth required for Cloud API

### knownFailurePatterns

- **Cloud healthy, local daemon unhealthy (or inverse)**
  - Scope: partial (major pattern for Ollama specifically)
  - Signal: local `ollama` commands fail, Cloud API works (or vice versa)
  - Quick check: `curl http://localhost:11434/api/tags` for local; `status.ollama.com` for Cloud

- **"pull failed" / "model not found" on new model**
  - Scope: depends
  - Signal: Registry connection fails
  - Quick check: `curl -I https://registry.ollama.ai/v2/library/<model>/manifests/latest`; if 5xx, Registry is down but models already cached work

- **"connection refused" to localhost:11434**
  - Scope: local (daemon not running)
  - Signal: most "Ollama is down" reports are this
  - Quick check: `ollama serve`, restart via systemd/LaunchAgent

- **Slow generation / hangs**
  - Scope: local (hardware saturation)
  - Signal: swap thrashing, GPU OOM, context too long
  - Quick check: `ollama ps`, reduce context window, use quantized model

- **Cloud API 401 "unauthorized"**
  - Scope: local (API key)
  - Signal: Cloud-only failure
  - Quick check: regenerate key at `ollama.com/settings/keys`

- **Model fails to load after pull**
  - Scope: local (disk/RAM insufficient)
  - Signal: modelfile load failure, OOM
  - Quick check: disk space, try smaller quantization (Q4_K_M vs Q8)

### fallbackAlternatives
- **If Registry is down but you need a cached model**: local `ollama run <cached-model>` continues to work — **low** cost
- **If Registry down and need new model**: Hugging Face direct download + Modelfile import — **medium** cost
- **If Ollama Cloud degraded**: Groq, Together AI, Fireworks AI host many of the same open-weight models via OpenAI-compatible APIs — **low** cost
- **If local daemon unstable on current hardware**: LM Studio (GUI) is a drop-in alternative for the same models — **low** cost
- **If local daemon is healthy but model pull fails**: test already-cached local models before switching provider

### ecosystemDependencies
- Integrates with: Claude Code, Codex CLI, Continue.dev, Zed, Cursor, Raycast AI, Open WebUI, LobeChat, LangChain, LlamaIndex
- Ollama docs now explicitly support launching external integrations like Claude Code and Codex via `ollama launch`
- Models pulled from: Ollama Registry + Hugging Face (direct URL)
- Runs on: macOS, Linux, Windows, Docker

### operatorNotes
- **Key distinction**: local Ollama and Ollama Cloud are different infrastructures. Local can work fine while Cloud is down, and vice versa.
- Auth difference: localhost API requires no authentication; Cloud API requires API key. Never expose localhost:11434 to the public internet without auth middleware.
- Check `ollama --version` and compare with the latest release if you suspect daemon/model compatibility issues
- Many "Ollama is down" reports are actually local daemon or hardware issues rather than platform outages
- When downforai shows Ollama "operational", we monitor the Cloud registry and API; local runs are the user's responsibility

### diagnosticCommands
- `curl http://localhost:11434/api/tags` — local daemon reachability (should return installed models list)
- `curl http://localhost:11434/api/chat -d '{"model":"llama3.3","messages":[{"role":"user","content":"ping"}]}'` — real local inference test
- `ollama ps` — active model processes
- `ollama ls` — list installed models
- `ollama serve` — start daemon manually
- `ollama pull <model>` — test Registry connectivity by pulling a small model
- Ollama exposes native latency metrics: `total_duration`, `load_duration`, `prompt_eval_count`, `prompt_eval_duration`, `eval_count`, `eval_duration`

---

## 10. Cursor

**slug** : `cursor`

### providerSummary
AI-native code editor/IDE with tab completion, chat, agents, and model routing. Based on a VS Code fork; routes workloads to Anthropic, OpenAI, and Google models.

### officialStatusUrl
`https://status.cursor.com`

### docsUrl
`https://docs.cursor.com`

### pricingUrl
`https://cursor.com/pricing`

### communityLinks
- **forum** — `https://forum.cursor.com` — official (verified: true)
- **reddit** — `https://reddit.com/r/cursor` — community (verified: true)
- **discord** — `https://discord.gg/cursor` — official community (verified: true)
- **x** — `https://x.com/cursor_ai` — official (verified: true)

### monitoredSurfaces
- **Cursor IDE** (Tab completions, Chat) — **critical**
- **Cursor CLI** — **high**
- **Cloud Agents** (background autonomous tasks) — **high**
- **Marketplace** (extensions) — **medium**
- **Bugbot** — **medium**
- **Automations** — **medium**
- **cursor.com** (site, auth) — **critical**

### statusSegmentation
- IDE
- CLI
- Cloud Agents
- Marketplace
- Bugbot
- Automations
- cursor.com

### modelFamilies
- Anthropic (Claude Sonnet / Opus)
- OpenAI (GPT / o-series)
- Google (Gemini)
- Cursor proprietary/specialized internal model(s) (naming subject to change)
- User can bring their own API keys

### commonLimits
- **Hobby**: limited agent requests + limited tab completions
- **Pro**: $20/mo — expanded usage
- **Pro+**: $60/mo — higher usage
- **Ultra**: $200/mo — top-tier individual
- **Teams**: $40/user/mo — centralized billing, org controls
- **Enterprise**: custom — SSO, policy controls, SLAs

### knownFailurePatterns

- **Upstream-model-specific degradation while Cursor IDE/core remains healthy**
  - Scope: partial (major Cursor-specific pattern)
  - Signal: Claude-routed Chat fails, Cursor UI works fine
  - Quick check: switch model to GPT or Gemini in model picker

- **"Tab not working" / no ghost text**
  - Scope: global (Cursor-wide) or local (extension stale)
  - Signal: status.cursor.com IDE/Tab component, or local cache issue
  - Quick check: reload window (Cmd+Shift+P → Reload Window), check status page

- **Chat returns "high load" error**
  - Scope: depends on upstream
  - Signal: Anthropic/OpenAI upstream degraded
  - Quick check: switch model in Chat picker, check upstream provider status

- **Composer / multi-file edit stuck**
  - Scope: partial
  - Signal: Chat works, Composer doesn't (multi-file backend degraded)
  - Quick check: retry with shorter context, reduce file scope

- **Cloud Agent task stuck**
  - Scope: partial (agent infra)
  - Signal: status.cursor.com Cloud Agents component
  - Quick check: cancel task, retry, check forum

- **Auth failure / sign-in loop**
  - Scope: global
  - Signal: cursor.com auth component
  - Quick check: sign out, clear Cursor app data, try again

### fallbackAlternatives
- **If one upstream model is degraded (Claude/GPT/Gemini)**: switch model inside Cursor before leaving the IDE — **low** cost
- **If Cursor IDE globally unavailable**: Windsurf or VS Code + Copilot can reduce downtime for active sessions — **low-medium** cost
- **If Tab completions unavailable but Chat works**: use Chat for inline suggestions manually — **low** cost
- **If Cloud Agents unavailable**: Claude Code CLI or Devin can reduce downtime for autonomous tasks — **medium** cost
- **For offline continuity**: VS Code + Continue.dev + local Ollama — **high** setup cost, zero dependency after

### ecosystemDependencies
- Built on: VS Code (fork) — VS Code Marketplace issues can affect extension installs
- Routes to: Anthropic API, OpenAI API, Google Gemini API — upstream outages cascade
- Auth: Cursor's own auth system, independent of GitHub

### operatorNotes
- Cursor's status page decomposes surfaces well: IDE, CLI, Cloud Agents, Marketplace, Bugbot, Automations, cursor.com can fail independently
- Marketplace / IDE shell / cloud agents can fail independently
- Upstream cascades are common: when Claude API has incidents, Cursor's Claude-routed Chat degrades. Model picker swap is the first workaround.
- The Cursor forum (`forum.cursor.com`) often surfaces issues minutes before the status page updates
- Cursor auth is independent of GitHub — a GitHub outage doesn't break Cursor sign-in

### diagnosticCommands
- Check `status.cursor.com` per-component (IDE, CLI, Cloud Agents, Marketplace, Bugbot, Automations, cursor.com)
- In IDE: Cmd+Shift+P → "Developer: Reload Window" to clear extension state
- Test model switching: Chat panel → model picker dropdown
- For Cloud Agents: cancel current task, verify new task creation in status page

---
# ⭐⭐ FICHES STANDARD (40 services)

> Format allégé : champs essentiels vérifiables. Pas de chiffres non sourcés. URLs `undefined` si non vérifiées.

---

## 11. xAI Grok

- **slug**: `xai-grok`
- **providerSummary**: xAI's conversational AI, integrated into X/Twitter and available via grok.com and xAI API.
- **officialStatusUrl**: *undefined* (no stable public status page at time of writing — rely on community signal + xAI/X announcements)
- **docsUrl**: `https://docs.x.ai`
- **pricingUrl**: `https://x.ai/premium` (consumer via X Premium+) / `https://x.ai/api` (API)
- **communityLinks**: x (`@xai`, `@grok`), reddit (`r/GrokAI`)
- **monitoredSurfaces**: grok.com (web), X platform integration, xAI API (`api.x.ai`)
- **modelFamilies**: Grok 3, Grok 3 Reasoning, Grok Imagine (image)
- **knownFailurePatterns**: X platform outages cascade to Grok on X; grok.com can stay up independently; API rate limits; image gen content filtering
- **fallbackAlternatives**: grok.com if X integration fails; ChatGPT/Claude for general workloads — **low** cost
- **ecosystemDependencies**: Grok on X depends on X platform; grok.com and API are separate paths
- **operatorNotes**: Grok on X and grok.com are separate entry points — verify which one is affected before generalizing

---

## 12. Microsoft Copilot (consumer)

- **slug**: `microsoft-copilot`
- **providerSummary**: Microsoft's consumer AI assistant (separate from Microsoft 365 Copilot). Runs on OpenAI models via Azure OpenAI.
- **officialStatusUrl**: `https://status.microsoft.com`
- **docsUrl**: `https://learn.microsoft.com/en-us/copilot/`
- **pricingUrl**: `https://www.microsoft.com/en-us/microsoft-copilot`
- **communityLinks**: reddit (`r/CopilotPro`)
- **monitoredSurfaces**: copilot.microsoft.com, Windows integration, Edge integration, mobile apps
- **modelFamilies**: GPT-4o / GPT-5 via Azure OpenAI
- **knownFailurePatterns**: Azure OpenAI capacity issues cascade; Edge-specific bugs; confusion with Microsoft 365 Copilot (separate product)
- **fallbackAlternatives**: If Microsoft Copilot is degraded, ChatGPT directly can reduce downtime (bypasses Microsoft layer) — **low** cost
- **ecosystemDependencies**: Azure OpenAI Service (different from direct OpenAI API)
- **operatorNotes**: Consumer Microsoft Copilot and Microsoft 365 Copilot are distinct products with different status scopes — verify which one users mean

---

## 13. Character.AI

- **slug**: `character-ai`
- **providerSummary**: AI companion and roleplay platform. High-concurrency long-polling sessions, heavy load scaling.
- **officialStatusUrl**: `https://status.character.ai`
- **docsUrl**: `https://support.character.ai`
- **pricingUrl**: `https://character.ai/plus`
- **communityLinks**: reddit (`r/CharacterAI`), discord, x
- **monitoredSurfaces**: character.ai web, mobile apps (iOS/Android), chat infrastructure
- **knownFailurePatterns**: "Servers at capacity" during peak, conversation state loss, content filter changes (often mistaken for outages), image gen delays
- **fallbackAlternatives**: If Character.AI is degraded, alternative roleplay platforms (Chub.ai, Janitor AI, SpicyChat) can reduce downtime — **low** cost (different content policies)
- **operatorNotes**: Periodic content filter changes are often perceived as outages — monitor reddit to distinguish filter updates from real incidents

---

## 14. Poe (Quora)

- **slug**: `poe`
- **providerSummary**: Quora's multi-model aggregator. Access multiple AI models (Claude, GPT, Gemini, DeepSeek, custom bots) via one interface.
- **officialStatusUrl**: *undefined* (no dedicated public status page verified)
- **docsUrl**: `https://creator.poe.com/docs`
- **pricingUrl**: `https://poe.com/subscribe`
- **communityLinks**: reddit (`r/PoeAI`)
- **monitoredSurfaces**: poe.com (web), Poe mobile apps, bot creator API
- **knownFailurePatterns**: specific model bots fail (upstream cascade, often timeout before clear error); "compute points exhausted" (quota, not outage); custom bot timeouts
- **fallbackAlternatives**: If Poe is degraded, direct providers (ChatGPT, claude.ai, gemini.google.com) can reduce downtime — **low** cost
- **ecosystemDependencies**: Poe is a middle layer — fails when upstream (OpenAI/Anthropic/Google) fails
- **operatorNotes**: Poe's UI often spins on upstream failures rather than returning a clear 5xx; check the original model provider's status before concluding Poe-wide outage

---

## 15. Mistral Le Chat

- **slug**: `le-chat-mistral`
- **providerSummary**: European LLM champion's consumer chat app. Free tier; strong multilingual and coding.
- **officialStatusUrl**: `https://status.mistral.ai`
- **docsUrl**: `https://docs.mistral.ai`
- **pricingUrl**: `https://mistral.ai/pricing`
- **communityLinks**: discord (`discord.gg/mistralai`), x (`@MistralAI`)
- **monitoredSurfaces**: chat.mistral.ai (web), mobile apps
- **modelFamilies**: Mistral Large, Mistral Small, Codestral (code), Pixtral (vision)
- **knownFailurePatterns**: capacity issues during peak EU hours, region-specific latency
- **fallbackAlternatives**: If Le Chat is degraded, La Plateforme API playground can reduce downtime — **low** cost; for open-weight Mistral models, Groq/Together AI host them — **low** cost
- **ecosystemDependencies**: Le Chat uses La Plateforme API backend
- **operatorNotes**: Mistral models are partly open-weight — Hugging Face / Ollama self-host is a resilient fallback for some models

---

## 16. Mistral API (La Plateforme)

- **slug**: `mistral`
- **providerSummary**: Mistral's direct API (La Plateforme) and Codestral API for code workloads.
- **officialStatusUrl**: `https://status.mistral.ai`
- **docsUrl**: `https://docs.mistral.ai`
- **pricingUrl**: `https://mistral.ai/pricing`
- **monitoredSurfaces**: api.mistral.ai, Codestral API
- **knownFailurePatterns**: tier-based rate limits, Codestral endpoint latency, EU region-specific capacity
- **fallbackAlternatives**: If direct API is degraded, AWS Bedrock hosts Mistral models as alternate infrastructure — **low-medium** cost; open-weight Mistral via Groq/Together AI — **low** cost
- **operatorNotes**: Mistral models on Bedrock are a separate infrastructure; can stay up during direct API issues

---

## 17. Cohere

- **slug**: `cohere`
- **providerSummary**: Enterprise-focused LLM provider. Strong embeddings, RAG, multilingual (Aya). Canadian company.
- **officialStatusUrl**: `https://status.cohere.com`
- **docsUrl**: `https://docs.cohere.com`
- **pricingUrl**: `https://cohere.com/pricing`
- **monitoredSurfaces**: api.cohere.com (Chat, Generate, Embed, Rerank, Tools)
- **modelFamilies**: Command R+, Command R, Aya (multilingual), Embed v3
- **knownFailurePatterns**: trial key rate limits, embed endpoint spikes, Aya multilingual timeouts
- **fallbackAlternatives**: If Cohere Embed is degraded, Voyage AI and OpenAI text-embedding-3 can reduce downtime for RAG — **low** cost; for chat, OpenAI/Anthropic — **low** cost
- **operatorNotes**: Cohere's Embed API is strong at scale for RAG — Voyage AI is the closest drop-in replacement

---

## 18. Groq

- **slug**: `groq`
- **providerSummary**: Ultra-fast inference via custom LPU hardware. Hosts open-source models (Llama, Mixtral, Qwen, DeepSeek, Whisper) with low latency.
- **officialStatusUrl**: `https://groqstatus.com`
- **docsUrl**: `https://console.groq.com/docs`
- **pricingUrl**: `https://groq.com/pricing`
- **communityLinks**: discord (`discord.gg/groq`), x (`@GroqInc`)
- **monitoredSurfaces**: api.groq.com (OpenAI-compatible API)
- **modelFamilies**: Llama 3.3, Llama 3.1, Mixtral, DeepSeek R1 Distill, Qwen, Whisper
- **knownFailurePatterns**: capacity-driven 429s during peak, model cold start, specific model availability changes
- **fallbackAlternatives**: If Groq is degraded, Together AI, Fireworks AI, DeepInfra host similar open models — **low** cost (base URL swap)
- **operatorNotes**: Groq's API is OpenAI-compatible — swap `base_url` in client to fall back to/from other providers in seconds

---

## 19. Together AI

- **slug**: `together-ai`
- **providerSummary**: Managed inference for open-source models at scale. Hosts DeepSeek, Llama, Qwen, Mixtral, etc.
- **officialStatusUrl**: `https://status.together.ai`
- **docsUrl**: `https://docs.together.ai`
- **pricingUrl**: `https://www.together.ai/pricing`
- **monitoredSurfaces**: api.together.xyz (Inference, Fine-tuning, Code Sandbox)
- **knownFailurePatterns**: model cold start on less-used models, rate limits, dedicated endpoint provisioning delays
- **fallbackAlternatives**: If Together is degraded, Fireworks AI, Groq, Replicate, DeepInfra host similar open models — **low** cost
- **operatorNotes**: Together is a key resilience layer for DeepSeek users when direct DeepSeek API is congested

---

## 20. Hugging Face

- **slug**: `hugging-face`
- **providerSummary**: Model hub, datasets, Spaces (demos), Inference API, Inference Endpoints. Central infrastructure for open-source AI.
- **officialStatusUrl**: `https://status.huggingface.co`
- **docsUrl**: `https://huggingface.co/docs`
- **pricingUrl**: `https://huggingface.co/pricing`
- **communityLinks**: discord, forum (`discuss.huggingface.co`)
- **monitoredSurfaces**: huggingface.co (web), model downloads (CDN), Inference API, Spaces, Datasets
- **knownFailurePatterns**: gated-model download rate limits, Inference API cold start, Spaces free-tier sleep/wake cycles, CDN regional slowness
- **fallbackAlternatives**: If HF CDN is slow, mirror popular models to S3/object storage — **medium** setup cost; Modelscope is a Chinese alternative hub — **medium** cost
- **operatorNotes**: HF CDN downloads are often the prod bottleneck — for reliability, mirror critical models to your own storage

---

## 21. Replicate

- **slug**: `replicate`
- **providerSummary**: Run open-source models via API, pay-per-second. Popular for image/video/audio generation workloads.
- **officialStatusUrl**: `https://www.replicatestatus.com`
- **docsUrl**: `https://replicate.com/docs`
- **pricingUrl**: `https://replicate.com/pricing`
- **monitoredSurfaces**: api.replicate.com, model run endpoints, webhooks
- **knownFailurePatterns**: cold start delays on rarely-used models, GPU availability fluctuations, webhook delivery lag
- **fallbackAlternatives**: If Replicate is degraded, Fal.ai and Modal are alternatives for image/video workloads — **low-medium** cost
- **operatorNotes**: Prediction webhooks can be delayed — don't assume webhook delivery is real-time; poll as backup

---

## 22. LM Studio

- **slug**: `lmstudio`
- **providerSummary**: Desktop GUI for running local LLMs. Alternative to Ollama with visual model management.
- **officialStatusUrl**: *undefined* (no public status page; GitHub issues for bug signal)
- **docsUrl**: `https://lmstudio.ai/docs`
- **pricingUrl**: free for individual use
- **communityLinks**: discord, github (`lmstudio-ai/lmstudio`)
- **monitoredSurfaces**: lmstudio.ai (download + catalog via HF)
- **knownFailurePatterns**: app crash on model load, HF download rate limit, local server port conflicts, hardware saturation
- **fallbackAlternatives**: If LM Studio has issues, Ollama, Jan.ai, GPT4All are alternative local runtimes — **low** cost
- **operatorNotes**: Most "LM Studio is down" reports are local issues; real outages are HF catalog-side

---

## 23. Claude Code

- **slug**: `claude-code`
- **providerSummary**: Anthropic's coding agent CLI and IDE extensions. Runs locally, executes multi-step coding tasks via Anthropic API.
- **officialStatusUrl**: `https://status.anthropic.com` (dedicated Claude Code component)
- **docsUrl**: `https://docs.anthropic.com/en/docs/claude-code`
- **pricingUrl**: included with Claude Pro / Max / Team / Enterprise plans
- **monitoredSurfaces**: Claude Code backend (Anthropic API), CLI updates, VS Code/JetBrains extensions
- **knownFailurePatterns**: auth failures (own auth flow, not claude.ai), tool use errors, rate limits shared with Anthropic API
- **fallbackAlternatives**: If Claude Code is degraded, Cursor, Codex CLI, Devin can reduce downtime for autonomous tasks — **medium** cost
- **operatorNotes**: Claude Code has its own status component — a claude.ai outage doesn't always mean Claude Code is down

---

## 24. Midjourney

- **slug**: `midjourney`
- **providerSummary**: AI image generator. Accessible via website and Discord-based workflows; no public official API should be assumed.
- **officialStatusUrl**: `https://status.midjourney.com` (limited detail)
- **docsUrl**: `https://docs.midjourney.com`
- **pricingUrl**: `https://midjourney.com/explore` (Basic / Standard / Pro / Mega tiers)
- **communityLinks**: discord (primary), reddit (`r/midjourney`), x
- **monitoredSurfaces**: midjourney.com (web), Discord bot, image generation queue
- **knownFailurePatterns**: queue delays during peak hours, Discord bot downtime, content filter prompt rejections
- **fallbackAlternatives**: If Midjourney is degraded, Leonardo AI, Ideogram, DALL-E 3 (via ChatGPT) can reduce downtime for image workflows — **low** cost; Flux on Replicate/Fal is a technical alternative — **low** cost
- **operatorNotes**: Unofficial API wrappers violate TOS and are actively rate-limited or blocked — not viable for production integrations

---

## 25. Stability AI

- **slug**: `stability-ai`
- **providerSummary**: Creators of Stable Diffusion. Offers API, DreamStudio, and open-weight models.
- **officialStatusUrl**: `https://status.stability.ai`
- **docsUrl**: `https://platform.stability.ai/docs`
- **pricingUrl**: `https://platform.stability.ai/pricing`
- **monitoredSurfaces**: api.stability.ai, DreamStudio (web), model catalog
- **modelFamilies**: Stable Diffusion 3.5, SDXL, Stable Video, Stable Audio
- **knownFailurePatterns**: credit depletion (often mistaken for outage), SD3.5-specific errors, NSFW filter false positives
- **fallbackAlternatives**: If Stability API is degraded, Replicate/Fal (host SD models) can reduce downtime — **low** cost; self-hosting via ComfyUI/A1111 is resilient for heavy users — **high** setup cost
- **operatorNotes**: SD models are open-weight — self-hosting via ComfyUI or Automatic1111 is a resilient fallback for production

---

## 26. Leonardo AI

- **slug**: `leonardo-ai`
- **providerSummary**: Image generator with strong game-dev asset training (characters, environments).
- **officialStatusUrl**: *undefined* (no public status page verified at time of writing)
- **docsUrl**: `https://docs.leonardo.ai`
- **pricingUrl**: `https://leonardo.ai/pricing`
- **monitoredSurfaces**: leonardo.ai (web), Leonardo API, Canvas editor
- **knownFailurePatterns**: daily token quota depletion (often mistaken for outage), Canvas save errors, specific model availability
- **fallbackAlternatives**: If Leonardo is degraded, Midjourney, Ideogram, Playground AI can reduce downtime for image workflows — **low** cost
- **operatorNotes**: Tokens reset daily — many "down" reports are quota exhaustion, not outages

---

## 27. Ideogram

- **slug**: `ideogram`
- **providerSummary**: Image generator with strong typographic fidelity — high quality for text-in-image workflows (logos, posters, UI mockups).
- **officialStatusUrl**: *undefined* (no public status page verified)
- **docsUrl**: `https://developer.ideogram.ai`
- **pricingUrl**: `https://ideogram.ai/pricing`
- **monitoredSurfaces**: ideogram.ai (web), Ideogram API (watch for model/version changes in docs rather than hard-coding API versions in the service card)
- **knownFailurePatterns**: text rendering failures on edge-case characters, API quota limits, content filter rejections
- **fallbackAlternatives**: If Ideogram is degraded, Flux with careful prompting or DALL-E 3 can reduce downtime for text-heavy images — **low** cost
- **operatorNotes**: Ideogram model/API versions evolve; consult current docs rather than hard-coding versions

---

## 28. Runway

- **slug**: `runway`
- **providerSummary**: Video AI. Gen-4 and Act-Two (character animation); professional video editor.
- **officialStatusUrl**: `https://status.runwayml.com`
- **docsUrl**: `https://docs.runwayml.com`
- **pricingUrl**: `https://runwayml.com/pricing`
- **monitoredSurfaces**: runwayml.com (web), API, render queue
- **knownFailurePatterns**: render times mistaken for stuck jobs, credit depletion, tool-specific errors
- **fallbackAlternatives**: If Runway is degraded, Kling AI, Luma Dream Machine, Pika can reduce downtime for video workflows — **low** cost
- **operatorNotes**: Renders take minutes — don't refresh UI too early. Credits reset monthly per tier.

---

## 29. Kling AI

- **slug**: `kling-ai`
- **providerSummary**: Chinese video AI. Strong quality; active feature development (image-to-video, camera controls).
- **officialStatusUrl**: *undefined* (no public status page verified)
- **docsUrl**: `https://docs.kling.ai`
- **pricingUrl**: `https://klingai.com/pricing`
- **monitoredSurfaces**: klingai.com (web), mobile apps, Kling API
- **knownFailurePatterns**: queue times during high demand, prompt filter rejections, payment method complications in some regions
- **fallbackAlternatives**: If Kling is degraded, Runway, Hailuo AI (MiniMax), Luma Dream Machine can reduce downtime for video workflows — **low** cost

---

## 30. Pika

- **slug**: `pika`
- **providerSummary**: Video AI with unique effects (Pikadditions, Pikascenes, lipsync).
- **officialStatusUrl**: *undefined* (no public status page verified)
- **docsUrl**: `https://pika.art/help`
- **pricingUrl**: `https://pika.art/pricing`
- **monitoredSurfaces**: pika.art (web), Discord integration, render queue, Pikadditions feature
- **knownFailurePatterns**: queue delays during peak, specific effect (Pikadditions) failures, audio sync issues
- **fallbackAlternatives**: For generic video generation, Runway, Luma, Kling can reduce downtime — **low** cost; Pikadditions-specific effects have no direct equivalent
- **operatorNotes**: Pika has unique effects (Pikadditions for inserting objects) with limited direct alternatives — outages on that feature are more impactful

---

## 31. Luma Dream Machine

- **slug**: `luma-dream-machine`
- **providerSummary**: Luma Labs' video generation product. Strong on camera movement and realism.
- **officialStatusUrl**: *undefined* (no dedicated Luma status page verified)
- **docsUrl**: `https://docs.lumalabs.ai`
- **pricingUrl**: `https://lumalabs.ai/dream-machine`
- **monitoredSurfaces**: lumalabs.ai/dream-machine (web), Dream Machine API, mobile apps
- **knownFailurePatterns**: queue during peak, iOS app auth issues, extend/reverse specific errors
- **fallbackAlternatives**: If Dream Machine is degraded, Runway, Kling, Pika can reduce downtime — **low** cost
- **operatorNotes**: Luma Labs also offers Genie (3D) as a separate product — don't conflate the two

---

## 32. ElevenLabs

- **slug**: `elevenlabs`
- **providerSummary**: High-throughput AI voice TTS API. Voice cloning, dubbing, audiobooks, conversational AI.
- **officialStatusUrl**: `https://status.elevenlabs.io`
- **docsUrl**: `https://elevenlabs.io/docs`
- **pricingUrl**: `https://elevenlabs.io/pricing`
- **communityLinks**: discord, x (`@elevenlabsio`), reddit (`r/ElevenLabs`)
- **monitoredSurfaces**: api.elevenlabs.io (TTS, STT, Dubbing, Voice Lab), web UI, mobile apps
- **knownFailurePatterns**: character quota depletion, voice cloning approval delays, specific voice unavailability
- **fallbackAlternatives**: If ElevenLabs is degraded, OpenAI TTS, Play.ht, Cartesia (low-latency) can reduce downtime for TTS workloads — **low** cost
- **operatorNotes**: Streaming TTS has strict latency requirements — p95 >500ms degrades product UX meaningfully; monitor closely

---

## 33. Suno

- **slug**: `suno`
- **providerSummary**: AI music generator producing full songs from text prompts. Also instrumentals and custom lyrics.
- **officialStatusUrl**: *undefined* (no public status page verified)
- **docsUrl**: `https://suno.com/docs` (API in beta)
- **pricingUrl**: `https://suno.com/pricing`
- **communityLinks**: discord (very active), reddit (`r/SunoAI`)
- **monitoredSurfaces**: suno.com (web), mobile app, generation queue
- **knownFailurePatterns**: queue during peak, credit depletion, copyright filter prompt rejections
- **fallbackAlternatives**: If Suno is degraded, Udio, Beatoven.ai, AIVA can reduce downtime for music generation — **low** cost (different style outputs)
- **operatorNotes**: Copyright-related filters cause some specific prompts to fail — not always an outage signal

---

## 34. Udio

- **slug**: `udio`
- **providerSummary**: Music AI generator. Slightly more technical controls than Suno; popular with musicians.
- **officialStatusUrl**: *undefined* (no public status page verified)
- **docsUrl**: `https://udio.com/help`
- **pricingUrl**: `https://www.udio.com/pricing`
- **monitoredSurfaces**: udio.com (web), generation API
- **knownFailurePatterns**: similar to Suno — copyright filter, queue times
- **fallbackAlternatives**: If Udio is degraded, Suno, Beatoven, local Riffusion can reduce downtime — **low** cost

---

## 35. HeyGen

- **slug**: `heygen`
- **providerSummary**: AI avatar video generation. Marketing, training, localization use cases.
- **officialStatusUrl**: `https://status.heygen.com`
- **docsUrl**: `https://docs.heygen.com`
- **pricingUrl**: `https://heygen.com/pricing`
- **monitoredSurfaces**: heygen.com (web), API, render pipeline, Avatar IV generator
- **knownFailurePatterns**: long renders (minutes), credit depletion, avatar-specific bugs, voice cloning approval delays
- **fallbackAlternatives**: If HeyGen is degraded, Synthesia, D-ID, Colossyan can reduce downtime for avatar video — **low** cost (different avatar libraries)
- **operatorNotes**: HeyGen API supports Zapier and similar integrations — monitor render queue depth for early signal

---

## 36. v0 by Vercel

- **slug**: `v0-vercel`
- **providerSummary**: UI generation from natural-language prompts. Integrated with Vercel deploy pipeline; strong React/shadcn/ui output.
- **officialStatusUrl**: `https://www.vercel-status.com` (overall Vercel, no dedicated v0 component confirmed)
- **docsUrl**: `https://v0.dev/docs`
- **pricingUrl**: `https://v0.dev/pricing`
- **monitoredSurfaces**: v0.dev (web), generation backend, Vercel deploy pipeline
- **knownFailurePatterns**: generation quota limits, specific component library errors, deploy pipeline failures
- **fallbackAlternatives**: If v0 is degraded, Bolt.new, Lovable can reduce downtime for UI generation — **low-medium** cost (different stacks); Claude + manual copy-paste is a lightweight fallback — **low** cost
- **operatorNotes**: v0 depends on Vercel infrastructure — monitor Vercel status for correlated outages

---

## 37. Bolt.new

- **slug**: `bolt-new`
- **providerSummary**: StackBlitz's AI full-stack app builder. In-browser Node.js via WebContainers, instant preview.
- **officialStatusUrl**: *undefined* (inherits from stackblitz.com status)
- **docsUrl**: `https://support.bolt.new`
- **pricingUrl**: `https://bolt.new/pricing`
- **monitoredSurfaces**: bolt.new (web), WebContainer backend, generation API
- **knownFailurePatterns**: WebContainer failures (unique dependency), token depletion, framework-specific errors (Next.js edge cases)
- **fallbackAlternatives**: If Bolt.new is degraded, v0, Lovable, Replit AI can reduce downtime for app generation — **low** cost
- **operatorNotes**: Bolt depends on StackBlitz WebContainer technology — a unique dependency not shared by competitors

---

## 38. Lovable

- **slug**: `lovable`
- **providerSummary**: Full-stack app generation via conversation. Popular with non-technical founders.
- **officialStatusUrl**: *undefined* (no dedicated public status page verified)
- **docsUrl**: `https://docs.lovable.dev`
- **pricingUrl**: `https://lovable.dev/pricing`
- **monitoredSurfaces**: lovable.dev (web), generation backend, Supabase integration
- **knownFailurePatterns**: credit depletion, Supabase connection issues (cascading), deployment failures
- **fallbackAlternatives**: If Lovable is degraded, Bolt.new, v0, Cursor can reduce downtime for app generation — **low-medium** cost
- **operatorNotes**: Lovable heavily depends on Supabase — a Supabase outage can cascade to Lovable

---

## 39. Codeium / Windsurf

- **slug**: `codeium`
- **providerSummary**: AI coding assistant (Codeium IDE plugin) and Windsurf (dedicated IDE with Cascade agent).
- **officialStatusUrl**: `https://status.codeium.com`
- **docsUrl**: `https://docs.codeium.com`
- **pricingUrl**: `https://codeium.com/pricing`
- **monitoredSurfaces**: codeium.com, Windsurf auth, completion API, Cascade agent backend
- **knownFailurePatterns**: auth sync issues, Cascade long-running tasks, model backend cascades (upstream providers)
- **fallbackAlternatives**: If Codeium is degraded, Cursor, GitHub Copilot, Continue.dev can reduce downtime for coding assistance — **low-medium** cost
- **operatorNotes**: Codeium's free tier is unlimited for individuals — rare positioning in this market

---

## 40. Replit AI

- **slug**: `replit-ai`
- **providerSummary**: In-browser IDE with AI assistant (Replit Agent). Education and rapid prototyping.
- **officialStatusUrl**: `https://status.replit.com`
- **docsUrl**: `https://docs.replit.com/replitai`
- **pricingUrl**: `https://replit.com/pricing`
- **monitoredSurfaces**: replit.com (web), Agent backend, code execution containers, deploy targets
- **knownFailurePatterns**: container start failures, deploy timeouts, Agent task stuck, auth sync issues
- **fallbackAlternatives**: If Replit AI is degraded, CodeSandbox, Gitpod Flex, Glitch can reduce downtime for browser-based dev — **low-medium** cost
- **operatorNotes**: Replit Agent consumes "cycles" quickly — quota exhaustion is a common "down" misdiagnosis

---

## 41. Devin

- **slug**: `devin`
- **providerSummary**: Cognition Labs' autonomous SWE agent. Completes tasks end-to-end via Slack or web.
- **officialStatusUrl**: `https://status.cognition.ai`
- **docsUrl**: `https://docs.devin.ai`
- **pricingUrl**: `https://devin.ai/pricing` (high entry price)
- **monitoredSurfaces**: app.devin.ai (web), Slack integration, task execution backend
- **knownFailurePatterns**: task stuck in "thinking", Slack integration lag, repo permission-related errors
- **fallbackAlternatives**: If Devin is degraded, Claude Code, Cursor Cloud Agents, Windsurf Cascade can reduce downtime for autonomous coding — **medium** cost
- **operatorNotes**: Devin has high per-seat cost; outages meaningfully impact Devin-dependent teams

---

## 42. Tabnine

- **slug**: `tabnine`
- **providerSummary**: One of the earliest AI coding assistants. Enterprise-focused; strong air-gapped/on-prem deployment.
- **officialStatusUrl**: `https://status.tabnine.com`
- **docsUrl**: `https://docs.tabnine.com`
- **pricingUrl**: `https://www.tabnine.com/pricing`
- **monitoredSurfaces**: tabnine.com, completion API, enterprise self-hosted instances
- **knownFailurePatterns**: auth token expiry, model selection issues, enterprise proxy configuration issues
- **fallbackAlternatives**: If Tabnine cloud is degraded, Cursor, Copilot, Continue.dev can reduce downtime — **low-medium** cost
- **operatorNotes**: Tabnine offers fully air-gapped on-prem deployment — relevant for regulated industries

---

## 43. JetBrains AI

- **slug**: `jetbrains-ai`
- **providerSummary**: JetBrains IDEs' native AI (IntelliJ, PyCharm, WebStorm, etc.). Competes with Copilot inside JetBrains ecosystem.
- **officialStatusUrl**: *undefined* (JetBrains has multiple status pages; no dedicated AI component verified)
- **docsUrl**: `https://www.jetbrains.com/help/ai-assistant`
- **pricingUrl**: `https://www.jetbrains.com/ai/`
- **monitoredSurfaces**: JetBrains AI backend, IDE plugin host, JetBrains account auth
- **knownFailurePatterns**: JetBrains account SSO issues, IDE plugin version mismatches, model routing errors
- **fallbackAlternatives**: If JetBrains AI is degraded, GitHub Copilot (JetBrains plugin), Cursor (separate IDE) can reduce downtime — **low-medium** cost
- **operatorNotes**: JetBrains AI integrates deeply with IDE features (refactoring, smart completion) — not just a chat sidebar

---

## 44. Pinecone

- **slug**: `pinecone`
- **providerSummary**: Managed vector database for RAG and semantic search. Serverless and pod-based options.
- **officialStatusUrl**: `https://status.pinecone.io`
- **docsUrl**: `https://docs.pinecone.io`
- **pricingUrl**: `https://www.pinecone.io/pricing`
- **monitoredSurfaces**:
  - **Control Plane** (index management, provisioning) — **high** — can fail while data plane works
  - **Data Plane** (vector queries, per-index) — **critical** — regional, per-environment
  - Serverless endpoints per region
- **statusSegmentation**: Control Plane / Data Plane / per-region
- **knownFailurePatterns**: Control Plane vs Data Plane divergence (creating indices may fail while querying existing ones works); region-specific outages; pod scaling delays; quota exceeded
- **fallbackAlternatives**: If Pinecone Data Plane is degraded, Weaviate, Qdrant, Turbopuffer can reduce downtime for vector queries — **medium** cost (data migration); pgvector self-hosted is a resilient fallback for prod — **high** setup cost
- **operatorNotes**: Pinecone Control Plane and Data Plane fail independently — a management API outage doesn't necessarily break live queries. Verify which plane is affected.

---

## 45. Weaviate

- **slug**: `weaviate`
- **providerSummary**: Open-source vector DB (cloud hosted or self-hosted). Hybrid search, multi-tenant support.
- **officialStatusUrl**: `https://status.weaviate.cloud`
- **docsUrl**: `https://weaviate.io/developers`
- **pricingUrl**: `https://weaviate.io/pricing`
- **monitoredSurfaces**:
  - **Weaviate Cloud Control Plane** (cluster management) — **high**
  - **Weaviate Cloud Data Plane** (queries) — **critical**
  - REST and gRPC APIs
- **statusSegmentation**: Control Plane / Data Plane
- **knownFailurePatterns**: cluster scaling delays, multi-tenant isolation issues, backup failures, Control vs Data plane divergence
- **fallbackAlternatives**: If Weaviate Cloud is degraded, self-hosting Weaviate (same open-source) is resilient — **high** setup cost; Pinecone, Qdrant are alternatives — **medium** cost (data migration)
- **operatorNotes**: Weaviate is open-source — self-hosting is a real resilience option, not a theoretical one

---

## 46. Qdrant

- **slug**: `qdrant`
- **providerSummary**: Rust-based vector DB. Open-source with cloud hosting option.
- **officialStatusUrl**: `https://status.qdrant.io`
- **docsUrl**: `https://qdrant.tech/documentation`
- **pricingUrl**: `https://qdrant.tech/pricing`
- **monitoredSurfaces**:
  - **Qdrant Cloud Control Plane** — **high**
  - **Qdrant Cloud Data Plane** — **critical**
- **statusSegmentation**: Control Plane / Data Plane
- **knownFailurePatterns**: collection scaling, quota limits on free tier, Control vs Data plane divergence
- **fallbackAlternatives**: If Qdrant Cloud is degraded, self-hosted Qdrant (Docker) is production-ready — **medium** setup cost; Pinecone, Weaviate are alternatives — **medium** cost
- **operatorNotes**: Qdrant's self-hosted Docker image is production-ready — strong resilience story

---

## 47. OpenRouter

- **slug**: `openrouter`
- **providerSummary**: Multi-provider LLM routing API. Access many models (OpenAI, Anthropic, Google, open-weight) via one OpenAI-compatible interface.
- **officialStatusUrl**: `https://status.openrouter.ai`
- **docsUrl**: `https://openrouter.ai/docs`
- **pricingUrl**: `https://openrouter.ai/pricing`
- **monitoredSurfaces**: openrouter.ai (web), API (`openrouter.ai/api/v1`)
- **knownFailurePatterns**: upstream provider cascades, specific model routing errors, credit top-up issues
- **fallbackAlternatives**: If OpenRouter is degraded, direct provider APIs (OpenAI, Anthropic, Google) can reduce downtime — **low** cost (requires per-provider keys)
- **operatorNotes**: OpenRouter is a routing layer — most failures trace back to specific upstream providers. Check individual model provider status before concluding OpenRouter-wide outage.

---

## 48. Fireworks AI

- **slug**: `fireworks-ai`
- **providerSummary**: Fast inference for open-source models (Llama, DeepSeek, Mixtral, etc.) with fine-tuning support.
- **officialStatusUrl**: `https://status.fireworks.ai`
- **docsUrl**: `https://docs.fireworks.ai`
- **pricingUrl**: `https://fireworks.ai/pricing`
- **monitoredSurfaces**: api.fireworks.ai (OpenAI-compatible API), fine-tuning jobs
- **knownFailurePatterns**: capacity-driven 429s, fine-tuning job queue delays, model cold start
- **fallbackAlternatives**: If Fireworks is degraded, Groq, Together AI, DeepInfra host similar models — **low** cost (base URL swap)
- **operatorNotes**: OpenAI-compatible API — client code swap is trivial

---

## 49. Notion AI

- **slug**: `notion-ai`
- **providerSummary**: AI integrated in Notion. Summarize, write, Q&A on docs, image generation.
- **officialStatusUrl**: `https://status.notion.so`
- **docsUrl**: `https://www.notion.so/help/notion-ai`
- **pricingUrl**: `https://www.notion.so/pricing`
- **monitoredSurfaces**: notion.so (web), AI backend, mobile apps
- **knownFailurePatterns**: Notion platform outages cascade to AI; AI rate limits during peak; specific AI block errors
- **fallbackAlternatives**: If Notion AI is degraded, ChatGPT + manual copy-paste, Claude Projects with Notion exports can reduce downtime — **low-medium** cost
- **operatorNotes**: Notion AI depends on Notion platform reliability — if Notion is down, Notion AI is down

---

## 50. Canva AI (Magic Studio)

- **slug**: `canva-ai`
- **providerSummary**: Canva's AI suite (Magic Write, Magic Design, Magic Edit, Magic Expand). Bundled within Canva platform.
- **officialStatusUrl**: `https://www.canva.com/status`
- **docsUrl**: `https://www.canva.com/help/`
- **pricingUrl**: `https://www.canva.com/pricing`
- **monitoredSurfaces**: canva.com (web), mobile apps, Magic Studio backends
- **knownFailurePatterns**: Canva platform outages cascade; specific Magic tool failures; credit depletion (Pro feature)
- **fallbackAlternatives**: If Canva AI is degraded, Figma AI, Adobe Express AI can reduce downtime for design AI; for specific tools (image gen), Midjourney/DALL-E — **low-medium** cost
- **operatorNotes**: Canva AI is bundled — an AI-tool outage affects specific Magic tools while Canva core editor remains usable

---
# ⭐ PERFORMERS GSC — Acquis à protéger (8 services)

> Pages qui convertissent déjà chez toi (CTR / position GSC supérieurs à la moyenne). Traitement léger mais dédié pour ne pas perdre ces acquis lors de la restructuration.

---

## 51. Voicemod

- **slug**: `voicemod`
- **providerSummary**: Real-time AI voice changer for gaming, streaming, meetings. Desktop-first with voice library and effects.
- **officialStatusUrl**: *undefined* (no public status page verified)
- **docsUrl**: `https://help.voicemod.net`
- **pricingUrl**: `https://www.voicemod.net/pricing`
- **monitoredSurfaces**: Voicemod desktop app, license server, voice library CDN
- **knownFailurePatterns**: license activation failures, voice library download failures, audio routing config issues (often mistaken for outage)
- **fallbackAlternatives**: If Voicemod is degraded, MorphVOX, Clownfish Voice Changer, native OBS audio filters can reduce downtime — **low** cost (reduced feature set)
- **operatorNotes**: Most "Voicemod is down" reports are local audio routing configuration rather than platform outages — real outages are license-server-side

---

## 52. Tripo3D

- **slug**: `tripo3d`
- **providerSummary**: Text/image-to-3D model generation. Used in game dev, AR/VR, product design workflows.
- **officialStatusUrl**: *undefined* (no public status page verified)
- **docsUrl**: `https://platform.tripo3d.ai/docs`
- **pricingUrl**: `https://www.tripo3d.ai/pricing`
- **monitoredSurfaces**: tripo3d.ai (web), Tripo API, generation backend
- **knownFailurePatterns**: generation queue delays, credit depletion, specific format export errors
- **fallbackAlternatives**: If Tripo3D is degraded, Meshy, Luma Genie, Rodin (Deemos) can reduce downtime for 3D generation — **low** cost (different quality profiles)
- **operatorNotes**: 3D generation takes minutes — distinguish queue delay from actual failure before reporting outage

---

## 53. Magnific

- **slug**: `magnific`
- **providerSummary**: AI image upscaler with creative reimagining (not just pixel upscaling — adds detail). Used by pro designers.
- **officialStatusUrl**: *undefined* (no public status page verified)
- **docsUrl**: `https://magnific.ai/documentation`
- **pricingUrl**: `https://magnific.ai/pricing`
- **monitoredSurfaces**: magnific.ai (web), upscale API
- **knownFailurePatterns**: credit depletion, large-image upload timeouts, specific style model errors
- **fallbackAlternatives**: If Magnific is degraded, Topaz Gigapixel (desktop), Upscayl (free open-source), SUPIR via Replicate can reduce downtime for upscaling — **low-medium** cost
- **operatorNotes**: Magnific's creative mode adds detail — pure upscalers (Topaz) have different output characteristics; not a pixel-perfect swap

---

## 54. MiniMax Hailuo

- **slug**: `minimax-hailuo`
- **providerSummary**: MiniMax's video AI (Hailuo). Chinese origin; strong realism and motion.
- **officialStatusUrl**: *undefined* (no English-facing status page verified)
- **docsUrl**: `https://www.minimaxi.com/en` / `https://hailuoai.com/help`
- **pricingUrl**: `https://hailuoai.video/pricing`
- **monitoredSurfaces**: hailuoai.video (web), MiniMax API, generation queue
- **knownFailurePatterns**: queue delays during peak (global demand), regional access patterns, content policy rejections
- **fallbackAlternatives**: If Hailuo is degraded, Kling AI, Runway, Pika can reduce downtime for video generation — **low** cost

---

## 55. OpenAI Whisper

- **slug**: `whisper-openai`
- **providerSummary**: OpenAI's speech-to-text model. Available via OpenAI API, as open-weight model, and on third-party hosts (Groq, etc.).
- **officialStatusUrl**: `https://status.openai.com` (Audio component)
- **docsUrl**: `https://platform.openai.com/docs/guides/speech-to-text`
- **pricingUrl**: `https://openai.com/api/pricing`
- **monitoredSurfaces**: api.openai.com Audio endpoint (Whisper and its successors)
- **knownFailurePatterns**: same as OpenAI API (rate limits, 5xx); audio file size/format limits
- **fallbackAlternatives**: If OpenAI Whisper API is degraded, AssemblyAI, Deepgram, Groq (Whisper-large-v3, fast + free tier), or local Whisper can reduce downtime for STT — **low** cost (local = **high** setup)
- **operatorNotes**: Whisper is open-weight — self-hosted via whisper.cpp or faster-whisper is a production-grade fallback. Groq hosts Whisper with very low latency and a free tier.

---

## 56. Tencent Hunyuan

- **slug**: `tencent-hunyuan`
- **providerSummary**: Tencent's LLM family. Strong multilingual (especially Chinese-native), available via Tencent Cloud.
- **officialStatusUrl**: `https://status.cloud.tencent.com` (overall Tencent Cloud)
- **docsUrl**: `https://cloud.tencent.com/document/product/1729`
- **pricingUrl**: `https://cloud.tencent.com/product/hunyuan`
- **monitoredSurfaces**: Tencent Cloud AI API, Hunyuan models
- **knownFailurePatterns**: Tencent Cloud regional outages cascade; cross-border latency issues; documentation primarily in Chinese
- **fallbackAlternatives**: If Hunyuan is degraded, DeepSeek (Chinese-native), Qwen (Alibaba), direct OpenAI can reduce downtime for Chinese workloads — **low** cost
- **operatorNotes**: Tencent Cloud is strongest in mainland China regions — cross-border users may experience higher latency as baseline

---

## 57. OpenArt

- **slug**: `openart`
- **providerSummary**: AI image platform aggregating multiple models (Stable Diffusion, Flux, custom) with workflows and LoRA support.
- **officialStatusUrl**: *undefined* (no public status page verified)
- **docsUrl**: `https://openart.ai/blog/guides`
- **pricingUrl**: `https://openart.ai/pricing`
- **monitoredSurfaces**: openart.ai (web), generation backend, model catalog
- **knownFailurePatterns**: credit depletion, specific model availability, LoRA loading errors
- **fallbackAlternatives**: If OpenArt is degraded, Civitai (model sharing focus), direct Flux on Replicate, Midjourney can reduce downtime for image generation — **low** cost

---

## 58. Luma AI (Genie 3D)

- **slug**: `luma-ai`
- **providerSummary**: Luma Labs' 3D capture (NeRF-based scene reconstruction) and Genie 3D object generation. Distinct from Dream Machine (video).
- **officialStatusUrl**: *undefined* (no public status page verified)
- **docsUrl**: `https://docs.lumalabs.ai` (covers multiple Luma products)
- **pricingUrl**: `https://lumalabs.ai` (per-product pricing)
- **monitoredSurfaces**: lumalabs.ai (web), Capture API, Genie API
- **knownFailurePatterns**: capture upload failures (large files), Genie generation queue, iOS app-specific bugs
- **fallbackAlternatives**: If Luma Genie is degraded, Polycam, Meshy, Tripo3D can reduce downtime for 3D capture/generation — **low** cost
- **operatorNotes**: Luma Labs ships multiple products under the Luma brand (Dream Machine for video, Genie for 3D, Capture for NeRF) — disambiguate which product users mean

---

# 🎯 Notes d'implémentation pour Claude Code

## Arborescence recommandée

```
src/content/top-services/
├── types.ts               ← TopServiceContent type
├── top50.ts               ← ce fichier converti en TS (toutes les fiches)
├── index.ts               ← export { TOP_SERVICE_CONTENT }
└── _rich/                 ← optionnel : un fichier par fiche ⭐⭐⭐ pour maintenance
    ├── chatgpt.ts
    ├── openai.ts
    ├── claude-chat.ts
    ├── anthropic.ts
    ├── github-copilot.ts
    ├── google-gemini.ts
    ├── deepseek.ts
    ├── perplexity.ts
    ├── ollama.ts
    └── cursor.ts
```

## Exemple de structure TypeScript

```typescript
// src/content/top-services/types.ts
export type CommunityLink = {
  type: "discord" | "reddit" | "github" | "forum" | "x";
  url: string;
  label: string;
  verified?: boolean;
};

export type MonitoredSurface = {
  name: string;
  description: string;
  criticality: "critical" | "high" | "medium" | "low";
};

export type KnownFailurePattern = {
  pattern: string;
  scope: "global" | "partial" | "local";
  signal: string;
  quickCheck: string;
};

export type FallbackAlternative = {
  scenario: string;
  alternative: string;
  switchingCost: "low" | "medium" | "high";
  note?: string;
};

export type TopServiceContent = {
  slug: string;
  providerSummary: string;
  officialStatusUrl?: string;
  docsUrl: string;
  pricingUrl?: string;
  communityLinks: CommunityLink[];
  monitoredSurfaces: MonitoredSurface[];
  statusSegmentation?: string[];
  modelFamilies?: string[];
  commonLimits?: string[];
  knownFailurePatterns: KnownFailurePattern[];
  fallbackAlternatives: FallbackAlternative[];
  ecosystemDependencies: string[];
  operatorNotes: string[];
  diagnosticHeaders?: string[];
  diagnosticCommands?: string[];
};

// src/content/top-services/top50.ts
export const TOP_SERVICE_CONTENT: Record<string, TopServiceContent> = {
  chatgpt: {
    slug: "chatgpt",
    providerSummary: "ChatGPT is OpenAI's consumer-facing AI assistant...",
    officialStatusUrl: "https://status.openai.com",
    // ... etc
  },
  // ... 57 autres entrées
};
```

## Usage dans la page service

```typescript
// src/app/[serviceSlug]/page.tsx
import { TOP_SERVICE_CONTENT } from "@/content/top-services";

const topContent = TOP_SERVICE_CONTENT[slug] ?? null;

// Passé au composant :
<ProviderSpecificPanel topContent={topContent} />

// Dans ProviderSpecificPanel :
// - Si topContent === null, return null (les 752 services sans contenu riche)
// - Sinon, render la fiche
```

## Validation des données

```typescript
// src/content/top-services/validate.test.ts
import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";
import { TOP_SERVICE_CONTENT } from "./top50";

describe("top service content", () => {
  it("all slugs match existing services in DB", async () => {
    const dbSlugs = await prisma.service.findMany({ select: { slug: true } });
    const dbSlugSet = new Set(dbSlugs.map((s) => s.slug));
    const contentSlugs = Object.keys(TOP_SERVICE_CONTENT);
    const orphans = contentSlugs.filter((s) => !dbSlugSet.has(s));
    expect(orphans).toEqual([]);
  });

  it("all entries have required fields", () => {
    for (const [slug, content] of Object.entries(TOP_SERVICE_CONTENT)) {
      expect(content.slug).toBe(slug);
      expect(content.providerSummary).toBeTruthy();
      expect(content.docsUrl).toBeTruthy();
      expect(content.monitoredSurfaces.length).toBeGreaterThan(0);
      expect(content.knownFailurePatterns.length).toBeGreaterThan(0);
      expect(content.fallbackAlternatives.length).toBeGreaterThan(0);
    }
  });

  it("no placeholder URLs", () => {
    for (const [slug, content] of Object.entries(TOP_SERVICE_CONTENT)) {
      const urlFields = [
        content.officialStatusUrl,
        content.docsUrl,
        content.pricingUrl,
      ].filter(Boolean) as string[];
      for (const url of urlFields) {
        expect(url).toMatch(/^https?:\/\//);
        expect(url).not.toContain("check ");
        expect(url).not.toContain("(when exists)");
      }
    }
  });
});
```

## Points de vigilance — rappel final

1. **URLs** : tout champ URL doit être soit vérifié, soit `undefined`. **Pas de placeholder** "check .../status".

2. **Chiffres** : aucun chiffre d'usage (MAU, WAU, ARR) non sourcé officiellement. Si pas de source officielle → reformulation qualitative ("widely used", "significant adoption").

3. **Tons à éviter** :
   - "dominant", "leading", "best-in-class", "most popular" sans source
   - Classements absolus ("#1", "#2 globally") sans ancrage vérifiable
   - Formulations condescendantes ("the user's end", "users often mistake")

4. **Formulations à privilégier** :
   - "If X is unavailable, Y can reduce downtime for [workload]" au lieu de "use competitor Y"
   - "often" plutôt que "usually" sans métrique
   - "can indicate" plutôt que "means"

5. **Slugs** : 1 fiche = 1 slug. Pour les produits multi-surface (Claude consumer vs Anthropic API, Le Chat vs Mistral API), créer 2 fiches distinctes.

6. **Status segmentation** : remplir uniquement si le provider segmente officiellement ses statuts en composants publics (ex: status.openai.com liste ChatGPT / APIs / Codex / Sora).

7. **Diagnostic commands** : préférer des commandes qui marchent sans auth (pour le visiteur sans compte) quand possible ; pour les commandes nécessitant une API key, utiliser `$NOM_DE_VARIABLE` pour indiquer la var d'env attendue.

8. **Fallbacks** : minimum 3, maximum 5 par fiche. Doit inclure au moins un fallback **low cost** pour ne pas laisser un dev sans option.

9. **Known failure patterns** : minimum 4, maximum 6 par fiche ⭐⭐⭐. Toujours avec les 4 champs (pattern, scope, signal, quickCheck).

10. **Operator notes** : maximum 5 par fiche. Chaque note doit ajouter de l'info actionable, pas du remplissage.

---

**Fin du fichier top50.md v2.**

Pour la conversion TypeScript, cette structure Markdown se convertit directement :
- Chaque section `## N. Nom` → une entrée dans `TOP_SERVICE_CONTENT`
- Les bullet points sous chaque champ → un array TypeScript
- Les blocs `### knownFailurePatterns` avec sous-bullets → array d'objets
- Les URLs `*undefined*` → `officialStatusUrl` non défini dans l'objet TS

Le brief Claude Code peut se baser sur ce fichier pour générer `top50.ts` directement.
