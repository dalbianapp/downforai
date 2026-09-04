import type { TopServiceContent } from "@/content/top-services/types";

// LLM (part 2) — enriched service content, continuation of llm.ts which reached the
// ~3000-line guideline. Keys are DB Service.slug values and MUST exist in the Service
// table. Registered in ./index.ts as "llm-2".
export const LLM_2: Record<string, TopServiceContent> = {
  "01-ai-yi": {
    slug: "01-ai-yi",
    providerSummary:
      "01.AI is Kai-Fu Lee's model company behind the Yi family of open-weight and API models. Since 2025 the company has focused on enterprise solutions, so most people use Yi through open weights on Hugging Face or third-party hosts rather than a consumer app that could be 'down'.",
    docsUrl: "https://github.com/01-ai/Yi",
    communityLinks: [
      { type: "github", url: "https://github.com/01-ai/Yi", label: "01-ai/Yi", verified: true },
    ],
    monitoredSurfaces: [
      { name: "01.ai", description: "Company website", criticality: "low" },
      { name: "Yi API platform", description: "Hosted access (region-dependent)", criticality: "medium" },
      { name: "Open weights on Hugging Face", description: "Where most usage comes from", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Hosted Yi endpoint returning errors or retired",
        scope: "local",
        signal: "API calls fail with 5xx or a deprecated-model message after previously working",
        quickCheck: "Check the model list on the platform you use; Yi model IDs have been rotated and some retired",
      },
      {
        pattern: "Weights download slow or gated",
        scope: "local",
        signal: "Hugging Face downloads stall or require accepting terms",
        quickCheck: "Log in to Hugging Face and accept the model terms; use a mirror if downloads stall",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a comparable open model with active hosting",
        alternative: "Alibaba Qwen, Meta Llama or Mistral AI (monitored on DownForAI) publish open weights served by most providers",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub", "Third-party inference providers"],
    operatorNotes: [
      "DownForAI probes 01.ai, the corporate site; it does not reflect any inference endpoint.",
    ],
  },
  "ai2-olmo": {
    slug: "ai2-olmo",
    providerSummary:
      "OLMo is the Allen Institute for AI's fully open language-model family (weights, data and training code), usable in the Ai2 Playground or downloaded from Hugging Face. There is no commercial API SLA; availability means the playground and the download sources.",
    docsUrl: "https://allenai.org/olmo",
    communityLinks: [
      { type: "github", url: "https://github.com/allenai/OLMo", label: "allenai/OLMo", verified: true },
    ],
    monitoredSurfaces: [
      { name: "allenai.org/olmo", description: "Model page", criticality: "low" },
      { name: "Ai2 Playground", description: "Hosted demo chat", criticality: "medium" },
      { name: "Hugging Face weights", description: "Downloads", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Playground slow or refusing new sessions",
        scope: "partial",
        signal: "playground.allenai.org queues or errors under demand",
        quickCheck: "It is a research demo without capacity guarantees; run the weights locally or via a provider instead",
      },
      {
        pattern: "Local run fails on hardware limits",
        scope: "local",
        signal: "Loading the larger OLMo checkpoints exhausts memory",
        quickCheck: "Use a smaller or quantised checkpoint; this is not a service issue",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a hosted open model instead",
        alternative: "Meta Llama or Mistral AI (monitored on DownForAI) are served by most inference providers; Ollama runs OLMo locally",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub"],
    operatorNotes: [],
  },
  ai21: {
    slug: "ai21",
    providerSummary:
      "AI21 Labs offers the Jamba model family and task-specific models through AI21 Studio (API and playground) and via AWS Bedrock, Google Vertex and Azure. Developers see incidents as API errors per model; the company publishes them on its status page.",
    officialStatusUrl: "https://status.ai21.com",
    docsUrl: "https://docs.ai21.com",
    pricingUrl: "https://www.ai21.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "AI21 Studio API", description: "api.ai21.com", criticality: "critical" },
      { name: "Studio playground and console", description: "Keys and usage", criticality: "high" },
      { name: "Cloud marketplaces", description: "Bedrock / Vertex / Azure deployments", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "5xx or timeouts on a specific Jamba model",
        scope: "partial",
        signal: "One model errors while others respond; status.ai21.com lists a component incident",
        quickCheck: "Retry with backoff and fall back to another Jamba size in code",
      },
      {
        pattern: "429 rate limits",
        scope: "local",
        signal: "Requests rejected with rate-limit responses while the status page is green",
        quickCheck: "Check your tier limits in Studio; rate limits are per organisation",
      },
      {
        pattern: "Deprecated model ID",
        scope: "local",
        signal: "Calls to an older model (Jurassic-2 or early Jamba IDs) return not-found errors",
        quickCheck: "Consult the model deprecation table in the docs and migrate the model name",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AI21 Studio is degraded",
        alternative: "Cohere, Mistral AI or Anthropic API (monitored on DownForAI) can absorb routed traffic; Jamba is also available on AWS Bedrock",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "aleph-alpha": {
    slug: "aleph-alpha",
    providerSummary:
      "Aleph Alpha is a German AI company providing sovereign, EU-hosted models and the PhariaAI platform for enterprises and public sector, accessed through an API and on-premise deployments. Public exposure is limited, so incidents are mostly seen by API customers.",
    docsUrl: "https://docs.aleph-alpha.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Aleph Alpha API", description: "api.aleph-alpha.com", criticality: "critical" },
      { name: "PhariaAI platform", description: "Enterprise deployments", criticality: "high" },
      { name: "aleph-alpha.com", description: "Website and docs", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API errors or elevated latency",
        scope: "partial",
        signal: "5xx responses or slow completions across models",
        quickCheck: "Retry with backoff; contact the support channel for enterprise accounts — there is no public status page",
      },
      {
        pattern: "Model retired or renamed",
        scope: "local",
        signal: "Older Luminous model IDs return not-found",
        quickCheck: "Check the current model list in the docs and migrate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Aleph Alpha's API is degraded and EU hosting matters",
        alternative: "Mistral AI (monitored on DownForAI) offers EU-hosted models; Aleph Alpha on-premise deployments are unaffected by the cloud API",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "amazon-nova": {
    slug: "amazon-nova",
    providerSummary:
      "Amazon Nova is Amazon's own foundation-model family (text, multimodal, image and video generation) served exclusively through Amazon Bedrock. Its availability therefore follows Bedrock's regional health, model-access settings and account quotas rather than a standalone service.",
    officialStatusUrl: "https://health.aws.amazon.com/health/status",
    docsUrl: "https://docs.aws.amazon.com/nova/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Amazon Bedrock (regional)", description: "Model serving", criticality: "critical" },
      { name: "Model access and quotas", description: "Per-account configuration", criticality: "high" },
      { name: "AWS console", description: "Playground and settings", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "ThrottlingException on Nova invocations",
        scope: "local",
        signal: "InvokeModel or Converse calls return throttling errors while the AWS Health Dashboard is clean",
        quickCheck: "Check the account's tokens-per-minute quota for the model in Service Quotas; request an increase or use cross-region inference",
      },
      {
        pattern: "AccessDeniedException for a Nova model",
        scope: "local",
        signal: "Calls fail with access denied although credentials are valid",
        quickCheck: "Enable model access for the Nova model in the Bedrock console for that region",
      },
      {
        pattern: "Regional Bedrock incident",
        scope: "partial",
        signal: "Elevated error rates in one region only, listed on the AWS Health Dashboard",
        quickCheck: "Fail over to another region where the model is available",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Nova is throttled or unavailable in your region",
        alternative: "Anthropic API or Meta Llama (monitored on DownForAI) are also served on Bedrock and can be swapped behind the same SDK",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Amazon Bedrock", "AWS regional infrastructure"],
    operatorNotes: [],
  },
  "apple-intelligence": {
    slug: "apple-intelligence",
    providerSummary:
      "Apple Intelligence is the set of AI features in iOS, iPadOS and macOS: Writing Tools, notification summaries, Image Playground, Siri improvements and an optional ChatGPT integration. Most features run on device; heavier requests go to Apple's Private Cloud Compute, and the ChatGPT hand-off depends on OpenAI.",
    docsUrl: "https://www.apple.com/apple-intelligence/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "On-device models", description: "Local features", criticality: "high" },
      { name: "Private Cloud Compute", description: "Server-side requests", criticality: "critical" },
      { name: "ChatGPT integration", description: "Hand-off to OpenAI", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Features report 'not available' or fail to respond",
        scope: "partial",
        signal: "Writing Tools or Image Playground error on requests that need Private Cloud Compute while purely local features work",
        quickCheck: "Check Apple's System Status page for Apple Intelligence; on-device features are unaffected",
      },
      {
        pattern: "ChatGPT hand-off failing",
        scope: "partial",
        signal: "Siri or Writing Tools cannot reach ChatGPT while other Apple Intelligence features work",
        quickCheck: "Check the ChatGPT page on DownForAI; the failure is OpenAI's side",
      },
      {
        pattern: "Model download stuck or feature missing on the device",
        scope: "local",
        signal: "Apple Intelligence shows as downloading or is absent from settings",
        quickCheck: "Confirm the device, region and language are supported and keep the device charged on Wi-Fi to finish the download",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Apple Intelligence cloud features are down",
        alternative: "ChatGPT, Google Gemini or Claude Chat (monitored on DownForAI) cover writing and summarising through their apps on the same devices",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple Private Cloud Compute", "OpenAI (ChatGPT integration)"],
    operatorNotes: [
      "DownForAI probes the marketing page; Apple publishes incidents on its own System Status page.",
    ],
  },
  baichuan: {
    slug: "baichuan",
    providerSummary:
      "Baichuan AI is a Chinese model company offering the Baichuan model series through an API platform and open weights for older versions. The hosted platform primarily serves customers in China, so access from elsewhere is the first thing to rule out.",
    docsUrl: "https://platform.baichuan-ai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "platform.baichuan-ai.com", description: "API platform and console", criticality: "critical" },
      { name: "baichuan-ai.com", description: "Website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Platform slow or unreachable from outside China",
        scope: "local",
        signal: "Timeouts on the console or API from international networks while Chinese users are fine",
        quickCheck: "Test from a network in mainland China or a nearby region; cross-border latency is expected",
      },
      {
        pattern: "API quota or balance exhausted",
        scope: "local",
        signal: "Requests rejected with a balance or quota message for your account",
        quickCheck: "Check the console balance before treating it as an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Baichuan's platform is unavailable",
        alternative: "Alibaba Qwen, Zhipu AI (ChatGLM) or DeepSeek (monitored on DownForAI) offer comparable Chinese-language models",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "bytedance-doubao": {
    slug: "bytedance-doubao",
    providerSummary:
      "Doubao is ByteDance's consumer AI assistant (web and mobile) for the Chinese market, built on the Doubao models also sold via Volcano Engine. Accounts require a Chinese phone number, so many 'Doubao is down' reports from abroad are actually access restrictions.",
    docsUrl: "https://www.doubao.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "doubao.com web app", description: "Chat", criticality: "critical" },
      { name: "Mobile app", description: "Primary client in China", criticality: "critical" },
      { name: "Doubao model backend", description: "Volcano Engine inference", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Sign-up or login blocked outside China",
        scope: "local",
        signal: "Verification codes never arrive for foreign numbers or the region is refused",
        quickCheck: "A Chinese phone number is required; this is not an outage",
      },
      {
        pattern: "Replies slow or failing at peak",
        scope: "partial",
        signal: "Messages send but answers stall for everyone",
        quickCheck: "Retry later; capacity peaks follow Chinese daytime hours",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Doubao is degraded",
        alternative: "Qwen Chat, DeepSeek or Moonshot AI (Kimi) (monitored on DownForAI) are the closest Chinese assistants",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Volcano Engine (ByteDance cloud)"],
    operatorNotes: [],
  },
  "corcel-io": {
    slug: "corcel-io",
    providerSummary:
      "Corcel exposes models served by the decentralised Bittensor network through a conventional API and app, so response quality and latency depend on which miners answer. It publishes a status page; its main website was returning 404 when this entry was written.",
    officialStatusUrl: "https://status.corcel.io",
    docsUrl: "https://docs.corcel.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Corcel API", description: "Model access", criticality: "critical" },
      { name: "Bittensor subnet miners", description: "Where inference actually runs", criticality: "critical" },
      { name: "corcel.io", description: "Website and app", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Highly variable latency or empty responses",
        scope: "partial",
        signal: "Some requests answer fast, others time out or return nothing, on the same model",
        quickCheck: "Expected with decentralised serving; retry and prefer models with more active miners",
      },
      {
        pattern: "Website 404 while the API works",
        scope: "partial",
        signal: "corcel.io returns 404 but API keys keep working",
        quickCheck: "Use the docs and status page directly; the site and the API are separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Corcel is unreliable",
        alternative: "OpenRouter or Together AI (monitored on DownForAI) serve the same open models on centralised infrastructure",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Bittensor network"],
    operatorNotes: [
      "The DB website URL (corcel.io) answered 404 when this entry was written; the service may be winding down.",
    ],
  },
  coze: {
    slug: "coze",
    providerSummary:
      "Coze is ByteDance's no-code platform for building AI bots and agents with plugins, workflows and knowledge bases, deployable to Discord, Telegram, Slack and web. The international site (coze.com) and the Chinese one (coze.cn) are separate deployments.",
    docsUrl: "https://www.coze.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "coze.com studio", description: "Bot builder", criticality: "critical" },
      { name: "Published bots and API", description: "Runtime for deployed bots", criticality: "critical" },
      { name: "Channel integrations", description: "Discord / Telegram / Slack connectors", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Published bots stop responding in a channel",
        scope: "partial",
        signal: "The bot answers in the Coze preview but not in Discord or Telegram",
        quickCheck: "Re-authorise the channel connector; a preview-only success isolates the integration",
      },
      {
        pattern: "Workflow runs stuck or model calls failing",
        scope: "partial",
        signal: "Nodes error with model or plugin timeouts across bots",
        quickCheck: "Switch the bot's model temporarily; if every model fails, the platform is degraded",
      },
      {
        pattern: "Credits or message quota exhausted",
        scope: "local",
        signal: "Bots refuse with a quota message for your workspace only",
        quickCheck: "Check the plan's credit balance in the studio",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Coze is down",
        alternative: "Dify, Botpress or Voiceflow (monitored on DownForAI) build comparable bots and agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Third-party model providers", "Discord / Telegram / Slack APIs"],
    operatorNotes: [],
  },
  "deepseek-coder": {
    slug: "deepseek-coder",
    providerSummary:
      "DeepSeek Coder began as a separate code-model product with its own site (coder.deepseek.com); its capabilities were folded into DeepSeek's main chat and API. The old subdomain no longer answers, so the relevant surfaces are DeepSeek's API and chat.",
    docsUrl: "https://api-docs.deepseek.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "coder.deepseek.com", description: "Legacy site (unreachable)", criticality: "low" },
      { name: "DeepSeek API", description: "Where coder models are served now", criticality: "critical" },
      { name: "DeepSeek chat", description: "Consumer surface", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "'Server busy' or 503 on the DeepSeek API",
        scope: "global",
        signal: "Requests fail with busy/503 responses during demand spikes, for every user",
        quickCheck: "Retry with backoff or route to a provider hosting the open DeepSeek weights",
      },
      {
        pattern: "Legacy coder subdomain unreachable",
        scope: "global",
        signal: "coder.deepseek.com does not resolve",
        quickCheck: "Expected: use chat.deepseek.com or the API instead",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "DeepSeek is overloaded",
        alternative: "Together AI or Fireworks AI (monitored on DownForAI) host the open DeepSeek models; Alibaba Qwen offers comparable coder models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["DeepSeek platform"],
    operatorNotes: [
      "The DB website URL (coder.deepseek.com) is dead; the deepseek entry tracks the live service.",
    ],
  },
  "duckduckgo-ai": {
    slug: "duckduckgo-ai",
    providerSummary:
      "Duck.ai (DuckDuckGo AI Chat) is an anonymous front-end to third-party models — OpenAI, Anthropic, Meta and Mistral models — proxied by DuckDuckGo so providers do not see the user. When one provider fails, only that model in the picker fails.",
    docsUrl: "https://duckduckgo.com/duckduckgo-help-pages/aichat/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "duck.ai / duckduckgo.com/chat", description: "Chat front-end", criticality: "critical" },
      { name: "Proxied model providers", description: "OpenAI, Anthropic, Meta, Mistral", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One model errors while others work",
        scope: "partial",
        signal: "Switching the model in the picker restores answers",
        quickCheck: "Change model; the failing provider's own status page will confirm",
      },
      {
        pattern: "'Too many requests' after heavy use",
        scope: "local",
        signal: "Duck.ai refuses new messages temporarily for your session",
        quickCheck: "Wait a few minutes; anonymous rate limits are per client",
      },
      {
        pattern: "Chat not loading in a hardened browser",
        scope: "local",
        signal: "The page stays blank with strict tracking protection or content blockers",
        quickCheck: "Allow duck.ai in the blocker; DuckDuckGo's own app works out of the box",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Duck.ai is down",
        alternative: "Le Chat (Mistral), ChatGPT or Claude Chat (monitored on DownForAI) offer the same models directly",
        switchingCost: "low",
        note: "Direct providers require an account and see your prompts",
      },
    ],
    ecosystemDependencies: ["OpenAI, Anthropic, Meta and Mistral model APIs"],
    operatorNotes: [],
  },
  falcon: {
    slug: "falcon",
    providerSummary:
      "Falcon is the open-weight model family from the Technology Innovation Institute (Abu Dhabi), distributed on Hugging Face and served by third-party providers; TII also runs a demo chat. There is no commercial TII API with an SLA, so availability is about downloads and hosts.",
    docsUrl: "https://falconllm.tii.ae",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "falconllm.tii.ae", description: "Official site and demo", criticality: "low" },
      { name: "Hugging Face (tiiuae)", description: "Model weights", criticality: "medium" },
      { name: "Third-party inference providers", description: "Hosted Falcon endpoints", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Demo chat unavailable",
        scope: "partial",
        signal: "The official demo errors or queues",
        quickCheck: "It is a showcase without capacity guarantees; use a provider or run the weights",
      },
      {
        pattern: "Provider endpoint deprecated",
        scope: "local",
        signal: "A hosted Falcon model disappears from a provider's catalogue",
        quickCheck: "Providers rotate open models; switch to a newer Falcon version or another host",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Falcon is unavailable from your provider",
        alternative: "Meta Llama, Mistral AI or Alibaba Qwen (monitored on DownForAI) are open models with broad hosting",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub", "Inference providers"],
    operatorNotes: [],
  },
  "google-gemma": {
    slug: "google-gemma",
    providerSummary:
      "Gemma is Google DeepMind's family of open-weight models, available through Google AI Studio, Vertex AI, Kaggle, Hugging Face and local runtimes such as Ollama. Google provides no dedicated Gemma service to be down; failures come from whichever platform serves the weights.",
    docsUrl: "https://ai.google.dev/gemma/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Google AI Studio / Gemini API", description: "Hosted Gemma endpoints", criticality: "high" },
      { name: "Hugging Face / Kaggle", description: "Gated weight downloads", criticality: "medium" },
      { name: "Local runtimes (Ollama, LM Studio)", description: "On-device serving", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Gated download refused (403)",
        scope: "local",
        signal: "Hugging Face or Kaggle refuses the download until the licence is accepted with a logged-in account",
        quickCheck: "Accept Gemma's terms on the model page while logged in, then retry with a token",
      },
      {
        pattern: "Rate limits on the Gemini API free tier",
        scope: "local",
        signal: "429 responses for Gemma through AI Studio",
        quickCheck: "Check the free-tier requests-per-minute limits; enable billing or run locally",
      },
      {
        pattern: "Local pull fails or model will not load",
        scope: "local",
        signal: "ollama pull stalls or the runtime rejects the model version",
        quickCheck: "Update the runtime; new Gemma generations require recent Ollama or llama.cpp builds",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gemma is unavailable on your platform",
        alternative: "Meta Llama, Mistral AI or Alibaba Qwen (monitored on DownForAI) are comparable open models on every major host",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Google AI Studio / Vertex AI", "Hugging Face and Kaggle hubs"],
    operatorNotes: [],
  },
  "h2o-ai": {
    slug: "h2o-ai",
    providerSummary:
      "H2O.ai provides open-source and enterprise AI tooling — h2oGPT, Enterprise h2oGPTe, Driverless AI and H2O AI Cloud — mostly deployed in customer environments or on H2O's managed cloud. Public-facing incidents are rare; most problems are deployment-specific.",
    docsUrl: "https://docs.h2o.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "H2O AI Cloud", description: "Managed platform", criticality: "high" },
      { name: "h2o.ai / docs", description: "Website and documentation", criticality: "low" },
      { name: "Customer deployments", description: "Self-hosted h2oGPTe / Driverless AI", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Managed cloud login or workspace unavailable",
        scope: "partial",
        signal: "H2O AI Cloud sign-in fails or apps do not start for all users of a tenant",
        quickCheck: "Contact the H2O support channel; self-hosted deployments are unaffected",
      },
      {
        pattern: "LLM backend errors inside h2oGPTe",
        scope: "local",
        signal: "Chats fail with provider errors when an external model is configured",
        quickCheck: "Check the configured provider's status and key; the platform relays the error",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "H2O's managed cloud is down",
        alternative: "Databricks or Hugging Face (monitored on DownForAI) host comparable enterprise ML platforms; h2oGPT can also run self-hosted",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["External model providers when configured"],
    operatorNotes: [],
  },
  "huawei-pangu": {
    slug: "huawei-pangu",
    providerSummary:
      "Pangu is Huawei's large-model family, offered to enterprises through Huawei Cloud (ModelArts and Pangu services) mainly in China and selected regions. Access requires a Huawei Cloud account and regional availability, which explains most reported failures.",
    docsUrl: "https://www.huaweicloud.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Huawei Cloud console", description: "Account and services", criticality: "critical" },
      { name: "Pangu / ModelArts endpoints", description: "Model serving per region", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Service not available in your region or account",
        scope: "local",
        signal: "Pangu options are missing from the console or requests are refused for the account",
        quickCheck: "Check regional availability and the account's real-name verification status",
      },
      {
        pattern: "Endpoint latency or errors from abroad",
        scope: "local",
        signal: "Timeouts from international networks while Chinese users are fine",
        quickCheck: "Test from a network closer to the region; cross-border latency is expected",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Pangu is unavailable",
        alternative: "Alibaba Qwen, Baidu ERNIE Bot or Tencent Hunyuan (monitored on DownForAI) offer comparable Chinese cloud models",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Huawei Cloud"],
    operatorNotes: [
      "DownForAI probes huaweicloud.com, the cloud portal; it does not reflect Pangu endpoints.",
    ],
  },
  huggingchat: {
    slug: "huggingchat",
    providerSummary:
      "HuggingChat is Hugging Face's open chat interface over open-weight models (Llama, Qwen, DeepSeek and others) served by Hugging Face's inference infrastructure, with tools and web search. It shares Hugging Face's platform status, and individual models can be overloaded independently.",
    officialStatusUrl: "https://status.huggingface.co",
    docsUrl: "https://huggingface.co/chat",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "huggingface.co/chat", description: "Chat front-end", criticality: "critical" },
      { name: "Model inference backends", description: "Per-model serving", criticality: "critical" },
      { name: "Hugging Face platform", description: "Auth and hub", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "'Model is overloaded' on one model",
        scope: "partial",
        signal: "A specific model errors or queues while others answer",
        quickCheck: "Switch model in the settings; overloads are per model",
      },
      {
        pattern: "Sign-in required after the anonymous quota",
        scope: "local",
        signal: "Chat asks to log in after a number of messages",
        quickCheck: "Log in with a free Hugging Face account; this is a limit, not an outage",
      },
      {
        pattern: "Tools or web search failing while chat works",
        scope: "partial",
        signal: "Messages that use tools error; plain messages succeed",
        quickCheck: "Disable tools for the conversation; the tool runtime is separate",
      },
      {
        pattern: "Hugging Face-wide incident",
        scope: "global",
        signal: "status.huggingface.co reports hub or inference degradation; chat fails with it",
        quickCheck: "Check the status page; nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "HuggingChat is down",
        alternative: "Le Chat (Mistral), Poe or Ollama (monitored on DownForAI) give access to the same open models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face inference infrastructure"],
    operatorNotes: [],
  },
  "ibm-granite": {
    slug: "ibm-granite",
    providerSummary:
      "Granite is IBM's family of open (Apache-2.0) enterprise models, published on Hugging Face and served through IBM watsonx.ai and third-party hosts. There is no consumer Granite app; availability is about the hub and the platform you run it on.",
    docsUrl: "https://www.ibm.com/granite",
    communityLinks: [
      { type: "github", url: "https://github.com/ibm-granite", label: "ibm-granite on GitHub", verified: true },
    ],
    monitoredSurfaces: [
      { name: "ibm.com/granite", description: "Model page", criticality: "low" },
      { name: "watsonx.ai", description: "IBM-hosted inference", criticality: "high" },
      { name: "Hugging Face / Ollama", description: "Open weights and local serving", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "watsonx.ai regional errors or quota",
        scope: "local",
        signal: "Inference calls fail in one IBM Cloud region or hit the plan's token limits",
        quickCheck: "Check IBM Cloud's status for the region and the watsonx plan limits",
      },
      {
        pattern: "Local model version incompatible with the runtime",
        scope: "local",
        signal: "Ollama or vLLM refuses a new Granite release",
        quickCheck: "Update the runtime; new Granite generations need recent builds",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Granite is unavailable on your platform",
        alternative: "Meta Llama or Mistral AI (monitored on DownForAI) offer permissively licensed open models with broad hosting",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["IBM Cloud / watsonx.ai", "Hugging Face hub"],
    operatorNotes: [],
  },
  "iflytek-spark": {
    slug: "iflytek-spark",
    providerSummary:
      "iFlytek Spark (Xinghuo) is iFlytek's Chinese-language AI assistant and model, offered as a consumer chat (web and app) and an API on the iFlytek open platform. Accounts and access are China-centric, which shapes most reports from abroad.",
    docsUrl: "https://xinghuo.xfyun.cn",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "xinghuo.xfyun.cn", description: "Web chat", criticality: "critical" },
      { name: "Spark API (xfyun open platform)", description: "Developer access", criticality: "high" },
      { name: "Mobile app", description: "Consumer client", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Login blocked without a Chinese phone number",
        scope: "local",
        signal: "Verification codes cannot be received from foreign numbers",
        quickCheck: "Access requires a mainland number; this is a restriction, not an outage",
      },
      {
        pattern: "API quota or token balance exhausted",
        scope: "local",
        signal: "Requests rejected with a balance message on the open platform",
        quickCheck: "Check the console balance before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Spark is unavailable",
        alternative: "Qwen Chat, DeepSeek or Baidu ERNIE Bot (monitored on DownForAI) offer comparable Chinese assistants",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "inflection-pi": {
    slug: "inflection-pi",
    providerSummary:
      "Pi is Inflection AI's personal assistant (web, iOS, Android, WhatsApp), known for its conversational, emotionally aware style. After Inflection's 2024 pivot to enterprise, Pi continues with a smaller team; its incidents are published on an incident.io status page.",
    officialStatusUrl: "https://statuspage.incident.io/inflection-ai",
    docsUrl: "https://pi.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "pi.ai web app", description: "Chat", criticality: "critical" },
      { name: "Mobile apps and messaging channels", description: "iOS, Android, WhatsApp", criticality: "high" },
      { name: "Inflection model backend", description: "Pi replies and voice", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Pi not replying or replying very slowly",
        scope: "partial",
        signal: "Messages send but responses stall on every channel",
        quickCheck: "Check the incident.io status page; retry rather than resend",
      },
      {
        pattern: "Voice playback silent",
        scope: "partial",
        signal: "Text arrives but the chosen voice does not play",
        quickCheck: "Test another voice; a universal silence is the speech service",
      },
      {
        pattern: "Sign-in or conversation history missing",
        scope: "local",
        signal: "History is empty after logging in on a new device",
        quickCheck: "Confirm the same phone number or email was used; history is tied to the account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Pi is down",
        alternative: "ChatGPT, Claude Chat or Character.AI (monitored on DownForAI) cover conversational companionship",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["WhatsApp for the messaging channel"],
    operatorNotes: [
      "pi.ai blocks automated requests (403), so DownForAI relies on the official status page and community reports.",
    ],
  },
  "jais-ai": {
    slug: "jais-ai",
    providerSummary:
      "Jais is the Arabic-English open model family from Inception (G42) with MBZUAI and Cerebras, published on Hugging Face and served through Inception's platform and Core42. Availability is mostly about model hosts; the corporate site has since moved to a new brand domain.",
    docsUrl: "https://inceptionai.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "inceptionai.ai", description: "Company website (redirects)", criticality: "low" },
      { name: "Hugging Face (inceptionai)", description: "Open weights", criticality: "medium" },
      { name: "Hosted Jais endpoints", description: "Core42 / partner platforms", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Hosted endpoint unavailable or region-restricted",
        scope: "local",
        signal: "API access fails outside the Gulf region or requires enterprise onboarding",
        quickCheck: "Run the open weights on your own infrastructure or a provider that hosts Jais",
      },
      {
        pattern: "Weights download slow or gated",
        scope: "local",
        signal: "Hugging Face requires accepting terms before downloading",
        quickCheck: "Accept the licence while logged in and use a token",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need Arabic-capable models now",
        alternative: "Alibaba Qwen or Google Gemini (monitored on DownForAI) handle Arabic well and are broadly hosted",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub", "Core42 / G42 infrastructure"],
    operatorNotes: [
      "inceptionai.ai now redirects to a rebranded domain and blocks probes; the technical signal is weak for this entry.",
    ],
  },
  "line-ai": {
    slug: "line-ai",
    providerSummary:
      "LINE AI covers the AI features inside the LINE messaging platform (Japan, Taiwan, Thailand) — assistant chats, summaries and the HyperCLOVA-based models from LY Corporation. Features depend on the LINE app and account region, so they are only observable inside LINE.",
    docsUrl: "https://line.me/en/ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "LINE app", description: "Where the AI features live", criticality: "critical" },
      { name: "LY Corporation model backend", description: "Assistant responses", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI features missing for your account",
        scope: "local",
        signal: "The assistant or summary options are absent from the app",
        quickCheck: "Features roll out by country and app version; update LINE and check regional availability",
      },
      {
        pattern: "Assistant replies failing while chats work",
        scope: "partial",
        signal: "Regular messaging works but the AI assistant times out",
        quickCheck: "Retry later; the AI backend is separate from messaging",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LINE's AI assistant is down",
        alternative: "ChatGPT or Google Gemini (monitored on DownForAI) mobile apps cover the same assistant use case",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["LINE messaging platform"],
    operatorNotes: [
      "line.me blocks direct probes, so DownForAI checks robots.txt reachability only.",
    ],
  },
  "meta-llama": {
    slug: "meta-llama",
    providerSummary:
      "Llama is Meta's open-weight model family, downloaded from Meta or Hugging Face and served by virtually every inference provider, cloud and local runtime. Meta AI (the consumer assistant) is a separate product; for Llama, 'down' means a download source or the provider you use.",
    docsUrl: "https://www.llama.com/docs/overview/",
    communityLinks: [
      { type: "github", url: "https://github.com/meta-llama/llama-models", label: "meta-llama/llama-models", verified: true },
    ],
    monitoredSurfaces: [
      { name: "llama.meta.com / llama.com", description: "Downloads and docs", criticality: "medium" },
      { name: "Hugging Face (meta-llama)", description: "Gated weights", criticality: "medium" },
      { name: "Inference providers", description: "Together, Groq, Bedrock, Vertex, local runtimes", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Gated access not yet approved",
        scope: "local",
        signal: "Hugging Face returns 403 for meta-llama repositories",
        quickCheck: "Request access on the model page with the same email as your Meta licence acceptance; approval can take hours",
      },
      {
        pattern: "Download link expired",
        scope: "local",
        signal: "The signed URL from Meta's download email returns an error",
        quickCheck: "Re-request the link; they expire after 24 hours and a limited number of downloads",
      },
      {
        pattern: "Provider hosting Llama is degraded",
        scope: "partial",
        signal: "Your API calls fail while other providers serve the same model fine",
        quickCheck: "Switch provider; the model is identical across hosts",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your Llama host is down",
        alternative: "Together AI, Groq or Fireworks AI (monitored on DownForAI) all serve current Llama models; Ollama runs them locally",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub", "Inference providers"],
    operatorNotes: [
      "llama.meta.com redirects to developer.meta.com, which refuses non-browser clients; DownForAI's probe for this entry is unreliable.",
    ],
  },
  "naver-clova": {
    slug: "naver-clova",
    providerSummary:
      "NAVER CLOVA is NAVER's AI platform (Korea) with the HyperCLOVA X models, CLOVA X assistant, CLOVA Note and enterprise APIs on NAVER Cloud. Most surfaces require a NAVER account and are optimised for Korean users.",
    docsUrl: "https://clova.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "clova.ai", description: "Platform site", criticality: "low" },
      { name: "CLOVA X / CLOVA apps", description: "Consumer assistants", criticality: "high" },
      { name: "NAVER Cloud CLOVA Studio", description: "Developer API", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "CLOVA X not answering while NAVER works",
        scope: "partial",
        signal: "The assistant times out although NAVER search and login work",
        quickCheck: "Retry later; the HyperCLOVA backend is separate from NAVER's core services",
      },
      {
        pattern: "API access limited by account or region",
        scope: "local",
        signal: "CLOVA Studio refuses requests for accounts outside supported regions",
        quickCheck: "Check the NAVER Cloud account's region and verification",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CLOVA is unavailable",
        alternative: "Upstage Solar (monitored on DownForAI) is another Korean-strong model; ChatGPT and Google Gemini cover general use",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["NAVER Cloud"],
    operatorNotes: [],
  },
  "nous-hermes": {
    slug: "nous-hermes",
    providerSummary:
      "Nous Research publishes the Hermes family of instruction-tuned open models on Hugging Face and runs a hosted chat and API (Nous Portal) for some of them. Most usage goes through third-party hosts or local runtimes, so availability is rarely about Nous itself.",
    docsUrl: "https://nousresearch.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "nousresearch.com", description: "Website and portal", criticality: "low" },
      { name: "Hugging Face (NousResearch)", description: "Model weights", criticality: "medium" },
      { name: "Third-party hosts", description: "Where Hermes is mostly served", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Hosted Hermes endpoint removed by a provider",
        scope: "local",
        signal: "A provider drops an older Hermes version from its catalogue",
        quickCheck: "Move to the newer Hermes release or another host",
      },
      {
        pattern: "Nous portal or API errors",
        scope: "partial",
        signal: "The hosted chat or API returns errors for all users",
        quickCheck: "Use the open weights via another provider; the portal has no public status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Hermes is unavailable from your host",
        alternative: "Meta Llama or Mistral AI (monitored on DownForAI) are the base families Hermes builds on and are hosted everywhere",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub", "Inference providers"],
    operatorNotes: [],
  },
  reka: {
    slug: "reka",
    providerSummary:
      "Reka AI builds multimodal models (Reka Core, Flash, Edge) offered through an API, a platform playground and enterprise deployments. Developers experience incidents as API errors or latency; there is no public status page.",
    docsUrl: "https://docs.reka.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Reka API", description: "Model access", criticality: "critical" },
      { name: "Reka platform", description: "Keys and playground", criticality: "high" },
      { name: "reka.ai", description: "Website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API 5xx or elevated latency",
        scope: "partial",
        signal: "Requests fail or slow down across models",
        quickCheck: "Retry with backoff; confirm from the platform playground",
      },
      {
        pattern: "Multimodal (video/image) requests failing while text works",
        scope: "partial",
        signal: "Text-only calls succeed but media inputs error",
        quickCheck: "Check media size and format limits in the docs before assuming an incident",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Reka's API is down",
        alternative: "Google Gemini or Anthropic API (monitored on DownForAI) handle multimodal inputs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  sensetime: {
    slug: "sensetime",
    providerSummary:
      "SenseTime's SenseChat (SenseNova models) is a Chinese assistant and API from a company best known for computer vision, offered mainly to enterprises and Chinese consumers. Access constraints (account, region) explain most reports from outside China.",
    docsUrl: "https://www.sensetime.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sensetime.com", description: "Corporate site", criticality: "low" },
      { name: "SenseChat / SenseNova platform", description: "Chat and API", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Access restricted by region or account",
        scope: "local",
        signal: "Registration or API requests refused for non-Chinese accounts",
        quickCheck: "A verified Chinese account is required; not an outage",
      },
      {
        pattern: "Platform slow from international networks",
        scope: "local",
        signal: "Timeouts from abroad while domestic users are fine",
        quickCheck: "Test from a network closer to China",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SenseChat is unavailable",
        alternative: "Alibaba Qwen, Zhipu AI (ChatGLM) or DeepSeek (monitored on DownForAI) offer comparable Chinese models",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI probes the corporate site only; it does not reflect the SenseNova platform.",
    ],
  },
  skywork: {
    slug: "skywork",
    providerSummary:
      "Skywork is Kunlun Tech's AI assistant and model family, with an international product focused on research, documents and agents (skywork.ai) alongside the Chinese Tiangong assistant. It is a hosted consumer app with generation credits.",
    docsUrl: "https://skywork.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "skywork.ai web app", description: "Assistant and document generation", criticality: "critical" },
      { name: "Generation backend", description: "Research and document agents", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Long agent tasks never finish",
        scope: "partial",
        signal: "Research or document generations stay in progress for every user",
        quickCheck: "Try a short prompt; a universal stall is backend capacity",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused with a credit message for your account",
        quickCheck: "Check the remaining credits before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Skywork is down",
        alternative: "Genspark, Perplexity or Manus (monitored on DownForAI) cover research and document agents",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "thinking-machines": {
    slug: "thinking-machines",
    providerSummary:
      "Thinking Machines Lab is Mira Murati's research company; its first product, Tinker, is a fine-tuning API in limited access. There is very little public surface, so DownForAI mainly tracks the website while the product is gated.",
    docsUrl: "https://thinkingmachines.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "thinkingmachines.ai", description: "Website", criticality: "low" },
      { name: "Tinker API", description: "Limited-access fine-tuning service", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "thinkingmachines.ai times out or errors",
        quickCheck: "No broadly available product depends on it",
      },
      {
        pattern: "Tinker jobs failing for early-access users",
        scope: "local",
        signal: "Fine-tuning runs error or queue",
        quickCheck: "Report through the early-access channel; there is no public status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a fine-tuning service now",
        alternative: "Together AI or Hugging Face (monitored on DownForAI) offer generally available fine-tuning",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Limited public product: the probe of thinkingmachines.ai is informational.",
    ],
  },
  "upstage-solar": {
    slug: "upstage-solar",
    providerSummary:
      "Upstage offers the Solar model family (strong in Korean and English) plus Document AI through its console and API, with deployments on AWS Bedrock as well. Developers see incidents as API errors; the console hosts keys and usage.",
    docsUrl: "https://console.upstage.ai/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Upstage API", description: "Solar and Document AI endpoints", criticality: "critical" },
      { name: "console.upstage.ai", description: "Keys, usage, docs", criticality: "high" },
      { name: "upstage.ai", description: "Website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API 5xx or timeouts",
        scope: "partial",
        signal: "Requests fail across Solar models",
        quickCheck: "Retry with backoff; test from the console playground",
      },
      {
        pattern: "Rate limit or credit exhaustion",
        scope: "local",
        signal: "429 or balance errors for your account only",
        quickCheck: "Check usage and credits in the console",
      },
      {
        pattern: "Document AI jobs slow",
        scope: "partial",
        signal: "OCR or parsing requests take far longer than text calls",
        quickCheck: "Document endpoints run on a separate pipeline; a slowdown there does not affect chat models",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Upstage's API is down",
        alternative: "NAVER CLOVA (monitored on DownForAI) for Korean; Solar is also available on AWS Bedrock with separate capacity",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  wizardlm: {
    slug: "wizardlm",
    providerSummary:
      "WizardLM is a research line of instruction-tuned open models (Evol-Instruct) originally from Microsoft researchers, published as weights rather than a service. Its project page is currently unavailable and the models live on Hugging Face and GitHub.",
    docsUrl: "https://github.com/nlpxucan/WizardLM",
    communityLinks: [
      { type: "github", url: "https://github.com/nlpxucan/WizardLM", label: "nlpxucan/WizardLM", verified: true },
    ],
    monitoredSurfaces: [
      { name: "wizardlm.github.io", description: "Project page (currently 404)", criticality: "low" },
      { name: "Hugging Face weights", description: "Model files", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Project page returns 404",
        scope: "global",
        signal: "wizardlm.github.io is gone",
        quickCheck: "Expected; use the GitHub repository and Hugging Face instead",
      },
      {
        pattern: "Weights removed or relocated",
        scope: "local",
        signal: "A WizardLM checkpoint disappears from its original Hugging Face repository",
        quickCheck: "Several WizardLM releases were pulled and re-uploaded by the community; search for mirrors",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a maintained instruction-tuned open model",
        alternative: "Meta Llama, Mistral AI or Alibaba Qwen (monitored on DownForAI) publish current instruction-tuned weights",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub"],
    operatorNotes: [
      "The DB website URL answers 404; this is a research project, not a service.",
    ],
  },
  writesmith: {
    slug: "writesmith",
    providerSummary:
      "Writesmith is an AI writing assistant (web, mobile and keyboard extension) for content creation, relaying prompts to third-party language models on credit-based plans. It is a small hosted product whose failures are relay or quota related.",
    docsUrl: "https://writesmith.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "writesmith.ai web app", description: "Editor", criticality: "critical" },
      { name: "Mobile app and keyboard", description: "Clients", criticality: "high" },
      { name: "Model relay", description: "Third-party language models", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations fail across templates",
        scope: "partial",
        signal: "Every prompt errors or returns nothing",
        quickCheck: "Retry a short prompt; a universal failure is the relay backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Requests refused with a plan message for your account",
        quickCheck: "Check the balance in account settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Writesmith is down",
        alternative: "Writesonic, Copy.ai or QuillBot (monitored on DownForAI) cover general writing assistance",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  writesonic: {
    slug: "writesonic",
    providerSummary:
      "Writesonic is an AI content platform for marketing (articles, ads, SEO tooling, Chatsonic) with credit-based plans, relaying to several third-party models. It publishes a status page, and its heavy features (long articles, SEO audits) run as background jobs.",
    officialStatusUrl: "https://status.writesonic.com/",
    docsUrl: "https://docs.writesonic.com",
    pricingUrl: "https://writesonic.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.writesonic.com", description: "Editor and tools", criticality: "critical" },
      { name: "Generation backend", description: "Article and Chatsonic generations", criticality: "critical" },
      { name: "SEO / research jobs", description: "Background tasks", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Article generations stuck or failing",
        scope: "partial",
        signal: "Long-form jobs never complete while short generations work",
        quickCheck: "Check status.writesonic.com; long-form runs on a separate queue",
      },
      {
        pattern: "Chatsonic errors on a specific model",
        scope: "partial",
        signal: "Switching the model restores answers",
        quickCheck: "Change model; a single-model failure is upstream",
      },
      {
        pattern: "Credits consumed but output missing",
        scope: "local",
        signal: "The balance drops after a failed generation",
        quickCheck: "Check the history first; contact support with the timestamp if the content is missing",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Writesonic is down",
        alternative: "Copy.ai, QuillBot or Rytr (monitored on DownForAI) cover marketing content generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  youchat: {
    slug: "youchat",
    providerSummary:
      "YouChat is You.com's AI chat and search assistant, offering several third-party models (OpenAI, Anthropic, Google, open models) plus web research and agents on a subscription. Model-specific failures are common because it relays to many providers.",
    docsUrl: "https://you.com",
    pricingUrl: "https://you.com/plans",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "you.com web app", description: "Chat and search", criticality: "critical" },
      { name: "Model relay", description: "Third-party providers", criticality: "critical" },
      { name: "Web research / agents", description: "Search-backed answers", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One model errors while others answer",
        scope: "partial",
        signal: "Switching the model in the picker restores responses",
        quickCheck: "Change model; check the provider's status page",
      },
      {
        pattern: "Research mode slow or failing",
        scope: "partial",
        signal: "Answers that need web search time out while plain chat works",
        quickCheck: "Disable research for the message; the search pipeline is separate",
      },
      {
        pattern: "Plan limits reached",
        scope: "local",
        signal: "Premium models refused with a quota message for your account",
        quickCheck: "Check usage on the plans page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "YouChat is down",
        alternative: "Perplexity or Poe (monitored on DownForAI) offer multi-model chat with web research",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI, Anthropic, Google and other model APIs"],
    operatorNotes: [],
  },
  "yuan-2": {
    slug: "yuan-2",
    providerSummary:
      "Yuan 2.0 is an open-source Chinese language-model series from IEIT Systems (Inspur), published on GitHub and model hubs. It is research software rather than a hosted service: availability concerns downloads and the hosts that run it.",
    docsUrl: "https://github.com/IEIT-Yuan/Yuan-2.0",
    communityLinks: [
      { type: "github", url: "https://github.com/IEIT-Yuan/Yuan-2.0", label: "IEIT-Yuan/Yuan-2.0", verified: true },
    ],
    monitoredSurfaces: [
      { name: "yuan.org", description: "Project site", criticality: "low" },
      { name: "GitHub / model hubs", description: "Weights and code", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Weights hosted on Chinese hubs slow to download abroad",
        scope: "local",
        signal: "ModelScope downloads stall from international networks",
        quickCheck: "Use the Hugging Face mirror when available",
      },
      {
        pattern: "Runtime incompatibility",
        scope: "local",
        signal: "The model fails to load in recent inference frameworks",
        quickCheck: "Follow the repository's pinned versions; this is not a service issue",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a hosted Chinese model instead",
        alternative: "Alibaba Qwen or DeepSeek (monitored on DownForAI) are open Chinese models with broad hosting",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["ModelScope / Hugging Face hubs"],
    operatorNotes: [],
  },
};
