import type { TopServiceContent } from "@/content/top-services/types";

// AGENTS — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start agents-2.ts and register it in ./index.ts if it grows.
export const AGENTS: Record<string, TopServiceContent> = {
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
  manus: {
    slug: "manus",
    providerSummary:
      "Autonomous AI agent. Handles open-ended tasks (research, analysis, slide generation) end-to-end. Acquired by Meta in Dec 2025.",
    docsUrl: "https://manus.im/docs",
    pricingUrl: "https://manus.im/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "manus.im", description: "Web interface", criticality: "critical" },
      { name: "Task Execution Backend", description: "Autonomous task runner", criticality: "critical" },
      { name: "Output Delivery", description: "Task result delivery", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Long-running tasks stuck",
        scope: "global",
        signal: "Task execution hangs without completing",
        quickCheck: "Cancel and retry; check for capacity issues",
      },
      {
        pattern: "Output quality inconsistency",
        scope: "local",
        signal: "Task completed but output is low quality",
        quickCheck: "Refine the task prompt; retry with more specific instructions",
      },
      {
        pattern: "Capacity limits during peak",
        scope: "global",
        signal: "Task queue full — new tasks rejected",
        quickCheck: "Retry later; check Manus status or announcements",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Manus is degraded",
        alternative:
          "Genspark, Devin (for coding tasks), or Claude Projects (manual) can reduce downtime",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  langchain: {
    slug: "langchain",
    providerSummary:
      "Most popular AI application framework. Chains, agents, RAG, tool use. Python and TypeScript.",
    docsUrl: "https://python.langchain.com/docs/",
    communityLinks: [
      { type: "github", url: "https://github.com/langchain-ai/langchain", label: "langchain-ai/langchain", verified: true },
      { type: "discord", url: "https://discord.gg/langchain", label: "Discord", verified: false },
    ],
    monitoredSurfaces: [
      { name: "PyPI / npm Package", description: "Package registry availability", criticality: "critical" },
      { name: "LangChain Hub", description: "Prompt and chain sharing hub", criticality: "medium" },
      { name: "Documentation Site", description: "python.langchain.com", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Breaking changes between versions",
        scope: "global",
        signal: "Imports fail after pip/npm upgrade",
        quickCheck: "Pin to a specific version; check CHANGELOG for breaking changes",
      },
      {
        pattern: "Dependency conflicts",
        scope: "local",
        signal: "Installation fails due to conflicting transitive deps",
        quickCheck: "Use a fresh virtual environment; check GitHub issues for the version",
      },
      {
        pattern: "LangChain Hub fetch failures",
        scope: "global",
        signal: "hub.pull() fails or returns stale prompts",
        quickCheck: "Test direct API call without Hub; check Hub status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LangChain package is broken",
        alternative:
          "LlamaIndex is an alternative RAG framework at medium switching cost; direct Anthropic/OpenAI SDK calls bypass the framework at low cost",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "LangChain is a library, not a hosted service — 'down' usually means PyPI/npm issues or breaking API changes, not a server outage.",
    ],
  },
  llamaindex: {
    slug: "llamaindex",
    providerSummary:
      "AI framework for RAG and data-connected applications. Indexes, retrieval, agents. Python and TypeScript.",
    docsUrl: "https://docs.llamaindex.ai",
    communityLinks: [
      { type: "github", url: "https://github.com/run-llama/llama_index", label: "run-llama/llama_index", verified: true },
      { type: "discord", url: "https://discord.gg/dGcwcsnxhU", label: "Discord", verified: false },
    ],
    monitoredSurfaces: [
      { name: "PyPI / npm Package", description: "llama-index package on PyPI/npm", criticality: "critical" },
      { name: "LlamaCloud", description: "Managed RAG pipeline service", criticality: "high" },
      { name: "Documentation Site", description: "docs.llamaindex.ai", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Breaking changes between versions",
        scope: "global",
        signal: "Imports fail after pip/npm upgrade (similar to LangChain)",
        quickCheck: "Pin version; check CHANGELOG for migration guides",
      },
      {
        pattern: "LlamaCloud indexing delays",
        scope: "global",
        signal: "Managed pipeline slow to ingest new documents",
        quickCheck: "Check LlamaCloud dashboard for pipeline status",
      },
      {
        pattern: "Dependency conflicts",
        scope: "local",
        signal: "Installation fails with conflicting packages",
        quickCheck: "Use fresh virtual environment; check GitHub issues",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LlamaIndex is broken",
        alternative:
          "LangChain is the main alternative RAG framework at medium cost; direct Anthropic/OpenAI SDK calls bypass the framework at low cost",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  n8n: {
    slug: "n8n",
    providerSummary:
      "n8n is a workflow-automation platform with AI agent nodes, available as n8n Cloud (hosted) or self-hosted. Cloud users depend on their instance, the execution queue and webhook ingress; self-hosters depend on their own infrastructure plus the credentials of connected services.",
    officialStatusUrl: "https://status.n8n.io/",
    docsUrl: "https://docs.n8n.io",
    pricingUrl: "https://n8n.io/pricing",
    communityLinks: [
      { type: "forum", url: "https://community.n8n.io", label: "n8n Community forum", verified: true },
    ],
    monitoredSurfaces: [
      { name: "n8n Cloud instances", description: "Hosted editor and executions", criticality: "critical" },
      { name: "Webhook ingress", description: "Incoming triggers on cloud instances", criticality: "critical" },
      { name: "n8n.io / docs", description: "Website and documentation", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud instance slow or unreachable",
        scope: "partial",
        signal: "The editor times out or executions do not start on your instance while status.n8n.io reports an incident",
        quickCheck: "Check status.n8n.io; instances are affected per region, so other users may be fine",
      },
      {
        pattern: "Executions queued or stuck in 'running'",
        scope: "partial",
        signal: "Workflows pile up in the executions list without finishing",
        quickCheck: "Open one execution to see the blocked node; if it is an HTTP or AI node, the external service is the bottleneck, not n8n",
      },
      {
        pattern: "Webhooks returning 404 or timing out",
        scope: "partial",
        signal: "External systems report failed deliveries to your webhook URL",
        quickCheck: "Confirm the workflow is active and the production (not test) URL is used; if the instance is up and it still 404s, ingress is degraded",
      },
      {
        pattern: "Credential or OAuth failures in nodes",
        scope: "local",
        signal: "A node fails with 401/403 while the rest of the workflow runs",
        quickCheck: "Reconnect the credential; expired OAuth tokens are the usual cause",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "n8n Cloud is down for critical automations",
        alternative: "Make (ex-Integromat), Zapier AI or Activepieces (monitored on DownForAI) can run equivalent workflows",
        switchingCost: "high",
        note: "Self-hosting n8n avoids the cloud dependency entirely",
      },
    ],
    ecosystemDependencies: ["Every connected service (APIs, OAuth providers, AI model APIs) used by workflows"],
    operatorNotes: [
      "Self-hosted n8n is unaffected by n8n Cloud incidents; status.n8n.io covers the cloud offering.",
    ],
  },
  activepieces: {
    slug: "activepieces",
    providerSummary:
      "Activepieces is an open-source automation platform (an n8n/Zapier alternative) with AI steps, available as Activepieces Cloud or self-hosted. Cloud users depend on the hosted runners and webhook ingress; self-hosters only on their own deployment and connected services.",
    docsUrl: "https://www.activepieces.com/docs",
    pricingUrl: "https://www.activepieces.com/pricing",
    communityLinks: [
      { type: "github", url: "https://github.com/activepieces/activepieces", label: "activepieces/activepieces", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Activepieces Cloud", description: "Hosted flows and runners", criticality: "critical" },
      { name: "Webhook triggers", description: "Incoming events", criticality: "critical" },
      { name: "Self-hosted instances", description: "User-run deployments", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Flow runs queued or stuck on the cloud",
        scope: "partial",
        signal: "Runs pile up without completing across projects",
        quickCheck: "Open a stuck run to see the blocked step; an HTTP or AI step points at the external service",
      },
      {
        pattern: "Webhook triggers not firing",
        scope: "partial",
        signal: "External systems report delivery failures to the webhook URL",
        quickCheck: "Confirm the flow is published and the production URL is used; if ingress is down, all webhook flows stop",
      },
      {
        pattern: "Connection or OAuth failures in a piece",
        scope: "local",
        signal: "One step fails with 401/403 while the rest runs",
        quickCheck: "Reconnect the connection; expired tokens are the usual cause",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Activepieces Cloud is down",
        alternative: "n8n, Make (ex-Integromat) or Zapier AI (monitored on DownForAI) run equivalent automations; self-hosting Activepieces avoids the cloud dependency",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Every connected service used by flows"],
    operatorNotes: [],
  },
  agentgpt: {
    slug: "agentgpt",
    providerSummary:
      "AgentGPT (Reworkd) is a browser-based autonomous agent demo where you set a goal and watch the agent plan and execute, using Reworkd's hosted models or your own OpenAI key. It is a lightly maintained open-source project; failures are mostly model-provider or quota related.",
    docsUrl: "https://docs.reworkd.ai",
    communityLinks: [
      { type: "github", url: "https://github.com/reworkd/AgentGPT", label: "reworkd/AgentGPT", verified: true },
    ],
    monitoredSurfaces: [
      { name: "agentgpt.reworkd.ai", description: "Web app", criticality: "critical" },
      { name: "Model backend", description: "Hosted or user-key OpenAI calls", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent stops after a few steps with a limit message",
        scope: "local",
        signal: "Free runs end early for your session",
        quickCheck: "Free usage is capped per day; add your own API key in settings",
      },
      {
        pattern: "Errors from the model provider",
        scope: "partial",
        signal: "Runs fail with OpenAI errors for everyone",
        quickCheck: "Check the OpenAI page on DownForAI; AgentGPT relays the error",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AgentGPT is down",
        alternative: "AutoGPT or Manus (monitored on DownForAI) run goal-driven agents; Claude Code covers coding tasks",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI API"],
    operatorNotes: [],
  },
  autogen: {
    slug: "autogen",
    providerSummary:
      "AutoGen is Microsoft's open-source multi-agent framework (Python and .NET) with AutoGen Studio as a UI; it is a library you run, not a hosted service. Failures come from the model provider you configure or from breaking changes between major versions.",
    docsUrl: "https://microsoft.github.io/autogen/",
    communityLinks: [
      { type: "github", url: "https://github.com/microsoft/autogen", label: "microsoft/autogen", verified: true },
    ],
    monitoredSurfaces: [
      { name: "microsoft.github.io/autogen", description: "Documentation site", criticality: "low" },
      { name: "Configured model provider", description: "OpenAI, Azure OpenAI or others", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model provider errors in agent runs",
        scope: "local",
        signal: "Rate-limit or 5xx errors from the configured provider",
        quickCheck: "Check the provider's status and key; AutoGen relays the error",
      },
      {
        pattern: "Breaking API changes after upgrading",
        scope: "local",
        signal: "Imports or agent classes fail after moving between 0.2 and 0.4+",
        quickCheck: "Pin the version; the 0.4 rewrite changed the API substantially",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a comparable framework",
        alternative: "CrewAI, LangChain or Semantic Kernel (monitored on DownForAI) offer multi-agent orchestration",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [
      "DownForAI probes the docs site only; there is no hosted AutoGen to be down.",
    ],
  },
  autogpt: {
    slug: "autogpt",
    providerSummary:
      "AutoGPT is the open-source autonomous agent project that became the AutoGPT Platform: a self-hostable builder for agent workflows with a hosted cloud in progress. For most users it is software to run with their own model keys.",
    docsUrl: "https://docs.agpt.co",
    communityLinks: [
      { type: "github", url: "https://github.com/Significant-Gravitas/AutoGPT", label: "Significant-Gravitas/AutoGPT", verified: true },
    ],
    monitoredSurfaces: [
      { name: "agpt.co", description: "Website and docs", criticality: "low" },
      { name: "Self-hosted platform", description: "User-run builder", criticality: "high" },
      { name: "Configured model providers", description: "OpenAI, Anthropic and others", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model provider errors in runs",
        scope: "local",
        signal: "Blocks fail with rate-limit or key errors",
        quickCheck: "Check the provider's status and credentials; AutoGPT relays the error",
      },
      {
        pattern: "Self-hosted stack fails to start",
        scope: "local",
        signal: "Docker services error on startup",
        quickCheck: "Check the compose logs and the required environment variables",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a hosted agent builder instead",
        alternative: "Relevance AI, Dify or Lindy.ai (monitored on DownForAI) run agents as a service",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers", "Docker"],
    operatorNotes: [],
  },
  babyagi: {
    slug: "babyagi",
    providerSummary:
      "BabyAGI is Yohei Nakajima's minimal task-driven agent script (and later a self-building framework), published on GitHub as a research demo. There is no hosted service: it runs wherever you run it, with your own model keys.",
    docsUrl: "https://github.com/yoheinakajima/babyagi",
    communityLinks: [
      { type: "github", url: "https://github.com/yoheinakajima/babyagi", label: "yoheinakajima/babyagi", verified: true },
    ],
    monitoredSurfaces: [
      { name: "babyagi.org", description: "Project site", criticality: "low" },
      { name: "Local runs", description: "User-run script", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model or vector-store errors",
        scope: "local",
        signal: "The loop stops with OpenAI or database errors",
        quickCheck: "Check the API key and the vector store configuration",
      },
      {
        pattern: "Endless loop consuming credits",
        scope: "local",
        signal: "Tasks keep multiplying without completing",
        quickCheck: "Set iteration limits; this is the demo's known behaviour, not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a maintained agent framework",
        alternative: "CrewAI, LangChain or AutoGPT (monitored on DownForAI) are actively developed",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [
      "Research demo; DownForAI's probe of babyagi.org is informational.",
    ],
  },
  bardeen: {
    slug: "bardeen",
    providerSummary:
      "Bardeen is a browser-extension automation agent (Chrome) for scraping, CRM updates and workflow playbooks, with cloud runs on paid plans. Local playbooks run in the browser; scheduled and cloud runs depend on Bardeen's backend.",
    docsUrl: "https://support.bardeen.ai",
    pricingUrl: "https://www.bardeen.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Chrome extension", description: "Local playbook execution", criticality: "critical" },
      { name: "Bardeen cloud", description: "Scheduled and always-on runs", criticality: "high" },
      { name: "Integrations", description: "Connected apps", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Playbook breaks on a site change",
        scope: "local",
        signal: "A scraper stops finding elements after the target site updates",
        quickCheck: "Re-record the selector; this is the target site, not Bardeen",
      },
      {
        pattern: "Scheduled runs not executing",
        scope: "partial",
        signal: "Cloud-scheduled playbooks skip runs across users",
        quickCheck: "Run the playbook manually in the extension; if manual works, the scheduler is degraded",
      },
      {
        pattern: "Credits or plan limits reached",
        scope: "local",
        signal: "Runs refused with a credit message for your account",
        quickCheck: "Check usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Bardeen is down",
        alternative: "Zapier AI, Make (ex-Integromat) or Harpa AI (monitored on DownForAI) cover browser and app automation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Chrome", "Connected apps"],
    operatorNotes: [],
  },
  "bland-ai": {
    slug: "bland-ai",
    providerSummary:
      "Bland AI runs AI phone calls (inbound and outbound) through an API and a dashboard, with conversational pathways and a status page of its own. Failures show up as calls not connecting, latency in the conversation or webhooks not firing.",
    docsUrl: "https://docs.bland.ai",
    pricingUrl: "https://www.bland.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Bland API", description: "Call initiation and management", criticality: "critical" },
      { name: "Telephony and voice pipeline", description: "Live calls", criticality: "critical" },
      { name: "Dashboard", description: "Pathways and logs", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Calls fail to connect or drop",
        scope: "partial",
        signal: "Outbound calls error at dial time or end early across numbers",
        quickCheck: "Place a test call from the dashboard; if it fails too, telephony is degraded — Bland publishes its own status page",
      },
      {
        pattern: "High latency in conversations",
        scope: "partial",
        signal: "Long pauses before the agent replies",
        quickCheck: "Test with a simpler pathway; if all calls lag, the voice pipeline is saturated",
      },
      {
        pattern: "Webhooks not received",
        scope: "local",
        signal: "Call events never reach your endpoint",
        quickCheck: "Check the webhook URL and your endpoint's logs before assuming a Bland issue",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Bland AI is down",
        alternative: "Vapi or PolyAI (monitored on DownForAI) provide voice-agent calling",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Telephony carriers", "Speech and model providers"],
    operatorNotes: [
      "Bland has its own status page; DownForAI probes bland.ai only.",
    ],
  },
  botpress: {
    slug: "botpress",
    providerSummary:
      "Botpress is a platform for building and hosting AI chatbots and agents deployed to web chat, WhatsApp, Messenger and more, on usage-based plans. Bots run in Botpress Cloud, so a platform incident silences deployed bots everywhere.",
    docsUrl: "https://botpress.com/docs",
    pricingUrl: "https://botpress.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Botpress Cloud runtime", description: "Deployed bots", criticality: "critical" },
      { name: "Studio", description: "Bot builder", criticality: "high" },
      { name: "Channel integrations", description: "WhatsApp, Messenger, web chat", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Deployed bots not responding",
        scope: "global",
        signal: "Bots go silent on every channel while Studio may still load",
        quickCheck: "Check Botpress's status page; nothing to redeploy",
      },
      {
        pattern: "One channel down while web chat works",
        scope: "partial",
        signal: "WhatsApp or Messenger messages not delivered; the web widget replies",
        quickCheck: "Check the channel integration and the messaging platform's own status",
      },
      {
        pattern: "AI spend or message quota exhausted",
        scope: "local",
        signal: "Bots refuse with a quota message for your workspace",
        quickCheck: "Check the workspace's usage and spend limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Botpress is down",
        alternative: "Voiceflow, Dify or Coze (monitored on DownForAI) host comparable bots",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Messaging platforms", "Third-party model providers"],
    operatorNotes: [
      "Botpress publishes its own status page; DownForAI probes botpress.com only.",
    ],
  },
  "browser-use": {
    slug: "browser-use",
    providerSummary:
      "Browser Use is an open-source library that lets agents control web browsers, plus Browser Use Cloud for hosted browsers and tasks. Library users depend on their model provider and local browser; cloud users on the hosted API.",
    docsUrl: "https://docs.browser-use.com",
    communityLinks: [
      { type: "github", url: "https://github.com/browser-use/browser-use", label: "browser-use/browser-use", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Browser Use Cloud API", description: "Hosted browsers and tasks", criticality: "high" },
      { name: "Open-source library", description: "Local runs", criticality: "medium" },
      { name: "Configured model provider", description: "Drives the agent", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud tasks queued or failing",
        scope: "partial",
        signal: "Hosted tasks stay pending or error across users",
        quickCheck: "Run the same task locally with the library; a cloud-only failure isolates the hosted service",
      },
      {
        pattern: "Agent loops or fails on a site",
        scope: "local",
        signal: "The agent cannot complete a flow on a specific website",
        quickCheck: "Try a different model or add site-specific instructions; anti-bot measures on the target are common",
      },
      {
        pattern: "Model provider errors",
        scope: "local",
        signal: "Runs stop with rate-limit or 5xx from the configured provider",
        quickCheck: "Check the provider's status; the library relays the error",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Browser Use Cloud is down",
        alternative: "MultiOn or OpenAI Operator (monitored on DownForAI) offer hosted browsing agents; the library itself keeps working locally",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers", "Playwright / Chromium"],
    operatorNotes: [],
  },
  "camel-ai": {
    slug: "camel-ai",
    providerSummary:
      "CAMEL-AI is an open-source multi-agent framework (and research community) for role-playing agents and data generation; it is a library run with your own model keys. Its docs site is the only hosted surface.",
    docsUrl: "https://docs.camel-ai.org",
    communityLinks: [
      { type: "github", url: "https://github.com/camel-ai/camel", label: "camel-ai/camel", verified: true },
    ],
    monitoredSurfaces: [
      { name: "docs.camel-ai.org", description: "Documentation", criticality: "low" },
      { name: "Configured model providers", description: "Drive the agents", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model provider errors in runs",
        scope: "local",
        signal: "Agents stop with rate-limit or key errors",
        quickCheck: "Check the provider's status and credentials",
      },
      {
        pattern: "Dependency conflicts on install",
        scope: "local",
        signal: "pip install fails on optional extras",
        quickCheck: "Install in a clean environment with the pinned versions from the docs",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a comparable framework",
        alternative: "CrewAI, AutoGen (Microsoft) or LangChain (monitored on DownForAI) offer multi-agent orchestration",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [
      "DownForAI probes the docs site only; there is no hosted CAMEL service.",
    ],
  },
  chatdev: {
    slug: "chatdev",
    providerSummary:
      "ChatDev (OpenBMB) is an open-source multi-agent framework that simulates a software company to build small programs from a prompt, run locally with your own model keys. chatdev.ai is a landing page; nothing is hosted.",
    docsUrl: "https://github.com/OpenBMB/ChatDev",
    communityLinks: [
      { type: "github", url: "https://github.com/OpenBMB/ChatDev", label: "OpenBMB/ChatDev", verified: true },
    ],
    monitoredSurfaces: [
      { name: "chatdev.ai", description: "Landing page", criticality: "low" },
      { name: "Local runs", description: "User-run framework", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Runs fail on model errors",
        scope: "local",
        signal: "Phases stop with OpenAI errors",
        quickCheck: "Check the API key and provider status",
      },
      {
        pattern: "High token spend per project",
        scope: "local",
        signal: "A single run consumes far more credits than expected",
        quickCheck: "Use a cheaper model for early phases; expected behaviour, not a failure",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a hosted coding agent",
        alternative: "Claude Code or Devin (Cognition) (monitored on DownForAI) build software as a service",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  composio: {
    slug: "composio",
    providerSummary:
      "Composio provides hosted tool integrations (hundreds of apps with managed auth) for agents through SDKs and an API, on usage-based plans. Its incidents are integration calls failing or auth flows breaking for a specific app.",
    docsUrl: "https://docs.composio.dev",
    pricingUrl: "https://composio.dev/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Composio API", description: "Tool execution", criticality: "critical" },
      { name: "Managed auth", description: "Connected accounts", criticality: "critical" },
      { name: "Dashboard", description: "Keys and integrations", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tool calls failing for one integration",
        scope: "partial",
        signal: "Actions for a specific app error while others succeed",
        quickCheck: "Check that app's own status and the connected account; a single-app failure is upstream",
      },
      {
        pattern: "Connected account authorisation broken",
        scope: "local",
        signal: "Calls return auth errors after a token expired or was revoked",
        quickCheck: "Reconnect the account from the dashboard",
      },
      {
        pattern: "API 5xx or latency across tools",
        scope: "partial",
        signal: "Every action slows down or errors",
        quickCheck: "Retry with backoff; a universal failure is Composio's platform",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Composio is down",
        alternative: "Zapier AI or Make (ex-Integromat) (monitored on DownForAI) expose app actions to agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Every integrated third-party app"],
    operatorNotes: [],
  },
  crewai: {
    slug: "crewai",
    providerSummary:
      "CrewAI is a multi-agent framework (open-source Python library) plus CrewAI AMP, a hosted platform for deploying and monitoring crews. Library users depend on their model provider; platform users on CrewAI's cloud, which has its own status page.",
    officialStatusUrl: "https://status.crewai.com/",
    docsUrl: "https://docs.crewai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "CrewAI platform (AMP)", description: "Hosted deployments", criticality: "high" },
      { name: "Open-source library", description: "Local runs", criticality: "medium" },
      { name: "Configured model providers", description: "Drive the agents", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Hosted crews failing to deploy or run",
        scope: "partial",
        signal: "Deployments stay pending or executions error on the platform",
        quickCheck: "Check status.crewai.com; run the crew locally in the meantime",
      },
      {
        pattern: "Model provider errors in runs",
        scope: "local",
        signal: "Agents stop with rate-limit or 5xx from the configured provider",
        quickCheck: "Check the provider's status; CrewAI relays the error",
      },
      {
        pattern: "Breaking changes after upgrading the library",
        scope: "local",
        signal: "Imports or tool definitions fail after a version bump",
        quickCheck: "Pin the version and read the release notes",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CrewAI's platform is down",
        alternative: "LangChain or AutoGen (Microsoft) (monitored on DownForAI) are comparable frameworks; crews can also run locally",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  dify: {
    slug: "dify",
    providerSummary:
      "Dify is an open-source LLM app and agent builder, available as Dify Cloud or self-hosted, with a status page for the cloud. Cloud users depend on Dify's runtime and the model providers configured in their apps.",
    officialStatusUrl: "https://status.dify.ai/",
    docsUrl: "https://docs.dify.ai",
    pricingUrl: "https://dify.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Dify Cloud", description: "Hosted apps and API", criticality: "critical" },
      { name: "Self-hosted instances", description: "User-run deployments", criticality: "medium" },
      { name: "Configured model providers", description: "Called by apps", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud apps or API unreachable",
        scope: "partial",
        signal: "Published apps error or time out for all cloud users",
        quickCheck: "Check status.dify.ai; self-hosted users are unaffected",
      },
      {
        pattern: "Model node errors inside apps",
        scope: "local",
        signal: "Runs fail at the LLM node with provider errors",
        quickCheck: "Check the provider's status and the credential in Settings",
      },
      {
        pattern: "Message credits exhausted on the cloud",
        scope: "local",
        signal: "Apps refuse with a quota message for your workspace",
        quickCheck: "Check the plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dify Cloud is down",
        alternative: "Flowise or Langflow (monitored on DownForAI) are comparable builders; Dify can also be self-hosted",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  "dust-tt": {
    slug: "dust-tt",
    providerSummary:
      "Dust is a platform for building custom AI assistants for teams, connected to company data (Notion, Slack, Google Drive, GitHub), on seat-based plans. Assistants run in Dust's cloud and depend on data-source syncs and model providers.",
    docsUrl: "https://docs.dust.tt",
    pricingUrl: "https://dust.tt/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "dust.tt web app", description: "Assistants and conversations", criticality: "critical" },
      { name: "Data-source connectors", description: "Syncs from connected tools", criticality: "high" },
      { name: "Model providers", description: "Behind assistants", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Assistant replies failing on one model",
        scope: "partial",
        signal: "Assistants on a specific provider error while others answer",
        quickCheck: "Switch the assistant's model; the failure is upstream",
      },
      {
        pattern: "Connector sync stalled",
        scope: "partial",
        signal: "Recent documents are missing from answers; the connector shows an old sync time",
        quickCheck: "Check the connector's status in the admin; re-authorise if needed",
      },
      {
        pattern: "Slack integration not responding",
        scope: "partial",
        signal: "Mentions in Slack get no reply while the web app works",
        quickCheck: "Check Slack's own status and the app installation",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dust is down",
        alternative: "Relevance AI or Notion AI (monitored on DownForAI) can host custom assistants over company content",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Notion, Slack, Google Drive, GitHub APIs", "Model providers"],
    operatorNotes: [],
  },
  e2b: {
    slug: "e2b",
    providerSummary:
      "E2B provides secure cloud sandboxes where agents run generated code, through an SDK and API, on usage-based plans. Incidents are sandboxes failing to start, timing out or exceeding concurrency limits.",
    docsUrl: "https://e2b.dev/docs",
    pricingUrl: "https://e2b.dev/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "E2B API", description: "Sandbox lifecycle", criticality: "critical" },
      { name: "Sandbox runtime", description: "Code execution", criticality: "critical" },
      { name: "Dashboard", description: "Keys and usage", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Sandboxes fail to start or time out",
        scope: "partial",
        signal: "Sandbox creation errors or hangs across templates",
        quickCheck: "Create a sandbox with the default template; if that fails too, the platform is degraded — E2B publishes its own status page",
      },
      {
        pattern: "Concurrency limit reached",
        scope: "local",
        signal: "New sandboxes refused with a limit message for your account",
        quickCheck: "Close idle sandboxes or raise the plan's concurrency",
      },
      {
        pattern: "Custom template build failing",
        scope: "local",
        signal: "Template builds error while default sandboxes work",
        quickCheck: "Check the Dockerfile and build logs",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "E2B is down",
        alternative: "Modal (monitored on DownForAI) can run isolated code; local Docker sandboxes are a temporary fallback",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "fixie-ai": {
    slug: "fixie-ai",
    providerSummary:
      "Fixie was an agent-building platform that pivoted to Ultravox, a real-time voice model and API; fixie.ai now redirects to ultravox.ai. The old Fixie agent platform is discontinued.",
    docsUrl: "https://www.fixie.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "fixie.ai → ultravox.ai", description: "Website redirect", criticality: "low" },
      { name: "Ultravox API", description: "Successor product", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Old Fixie agents or SDK no longer work",
        scope: "local",
        signal: "Legacy endpoints return errors",
        quickCheck: "Expected; the platform was discontinued in favour of Ultravox",
      },
      {
        pattern: "Ultravox API errors",
        scope: "partial",
        signal: "Voice sessions fail for everyone",
        quickCheck: "Check Ultravox's documentation and status; DownForAI tracks only the redirect",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a voice-agent platform",
        alternative: "Vapi, Bland AI or Hume AI (monitored on DownForAI) provide real-time voice APIs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "fixie.ai redirects to ultravox.ai; DownForAI's probe follows the redirect.",
    ],
  },
  flowise: {
    slug: "flowise",
    providerSummary:
      "Flowise is an open-source drag-and-drop builder for LLM flows and agents (LangChain-based), available self-hosted or as Flowise Cloud. Cloud users depend on the hosted runtime; everyone depends on the model providers configured in flows.",
    docsUrl: "https://docs.flowiseai.com",
    communityLinks: [
      { type: "github", url: "https://github.com/FlowiseAI/Flowise", label: "FlowiseAI/Flowise", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Flowise Cloud", description: "Hosted flows", criticality: "high" },
      { name: "Self-hosted instances", description: "User-run deployments", criticality: "medium" },
      { name: "Configured model providers", description: "Called by flows", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud flows unreachable",
        scope: "partial",
        signal: "Published chatflows error or time out for cloud users",
        quickCheck: "Self-hosted users are unaffected; check the community channels for a cloud incident",
      },
      {
        pattern: "Node errors from a provider or vector store",
        scope: "local",
        signal: "A flow fails at a specific node with an external error",
        quickCheck: "Check that service's status and credentials",
      },
      {
        pattern: "Flow breaks after upgrading",
        scope: "local",
        signal: "Nodes show as deprecated or fail to load",
        quickCheck: "Re-add the affected nodes; node schemas change between releases",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Flowise Cloud is down",
        alternative: "Langflow or Dify (monitored on DownForAI) are comparable builders; Flowise can also be self-hosted",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers", "Vector stores"],
    operatorNotes: [],
  },
  glif: {
    slug: "glif",
    providerSummary:
      "Glif is a visual builder for small AI workflows ('glifs') that chain image, text and video models, shared as a community platform on credit-based plans. Runs execute on Glif's backend using third-party models.",
    docsUrl: "https://docs.glif.app",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "glif.app", description: "Builder and gallery", criticality: "critical" },
      { name: "Run backend", description: "Workflow execution", criticality: "critical" },
      { name: "Third-party models", description: "Image, text, video providers", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Glifs failing at a specific model block",
        scope: "partial",
        signal: "Runs error at one block type (for example an image model) across glifs",
        quickCheck: "Swap the block's model; the failure is the upstream provider",
      },
      {
        pattern: "Runs queued for a long time",
        scope: "partial",
        signal: "Executions wait far beyond the estimate for everyone",
        quickCheck: "Retry later; a universal wait is capacity",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Runs refused with a credit message for your account",
        quickCheck: "Check the balance before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Glif is down",
        alternative: "Gumloop or Flowise (monitored on DownForAI) chain AI steps; Krea AI covers creative generation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  gumloop: {
    slug: "gumloop",
    providerSummary:
      "Gumloop is a no-code AI workflow platform (scraping, enrichment, document processing) with scheduled and webhook-triggered flows, on credit-based plans. Flows run in Gumloop's cloud and call third-party models and apps.",
    docsUrl: "https://docs.gumloop.com",
    pricingUrl: "https://www.gumloop.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "gumloop.com app", description: "Builder", criticality: "critical" },
      { name: "Flow runtime", description: "Executions and schedules", criticality: "critical" },
      { name: "Integrations", description: "Connected apps and models", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Runs stuck or failing across flows",
        scope: "partial",
        signal: "Executions never complete for anyone",
        quickCheck: "Run a one-node flow; a universal stall is the runtime",
      },
      {
        pattern: "A node fails on an external service",
        scope: "local",
        signal: "One step errors with a provider or app message",
        quickCheck: "Check that service's status and the connection",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Runs refused with a credit message for your workspace",
        quickCheck: "Check usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gumloop is down",
        alternative: "n8n, Make (ex-Integromat) or Relevance AI (monitored on DownForAI) run comparable AI workflows",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Model providers", "Connected apps"],
    operatorNotes: [],
  },
  langflow: {
    slug: "langflow",
    providerSummary:
      "Langflow is an open-source visual builder for LLM and agent flows, run self-hosted or through DataStax's hosted Langflow. Flows call whichever model providers and vector stores you configure, so most failures are external services or local installs.",
    docsUrl: "https://docs.langflow.org",
    communityLinks: [
      { type: "github", url: "https://github.com/langflow-ai/langflow", label: "langflow-ai/langflow", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Hosted Langflow (DataStax)", description: "Cloud option", criticality: "high" },
      { name: "Self-hosted instances", description: "User-run deployments", criticality: "medium" },
      { name: "Configured providers", description: "Models and vector stores", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Component errors from a provider",
        scope: "local",
        signal: "A flow fails at a model or vector-store component with an external error",
        quickCheck: "Check that service's status and credentials",
      },
      {
        pattern: "Install or upgrade breaks components",
        scope: "local",
        signal: "Flows show missing or deprecated components after updating",
        quickCheck: "Pin the version; component schemas change between releases",
      },
      {
        pattern: "Hosted instance unreachable",
        scope: "partial",
        signal: "The cloud editor or API endpoints time out for all cloud users",
        quickCheck: "Run the flow locally in the meantime",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Langflow is unusable",
        alternative: "Flowise or Dify (monitored on DownForAI) are comparable visual builders",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers", "Vector stores"],
    operatorNotes: [],
  },
  "lindy-ai": {
    slug: "lindy-ai",
    providerSummary:
      "Lindy builds AI employees ('Lindies') that automate email, meetings, CRM updates and phone calls from triggers, on credit-based plans. Lindies run in Lindy's cloud on third-party models and connected apps.",
    docsUrl: "https://docs.lindy.ai",
    pricingUrl: "https://www.lindy.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lindy.ai app", description: "Builder", criticality: "critical" },
      { name: "Agent runtime", description: "Triggers and executions", criticality: "critical" },
      { name: "Integrations", description: "Gmail, calendars, CRMs, telephony", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Triggers not firing",
        scope: "partial",
        signal: "Emails or events no longer start Lindies across workspaces",
        quickCheck: "Test the Lindy manually; if manual runs work, the trigger service is degraded",
      },
      {
        pattern: "A step fails on a connected app",
        scope: "local",
        signal: "One action errors with the app's error message",
        quickCheck: "Reconnect the integration; expired tokens are the usual cause",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Runs refused with a credit message for your workspace",
        quickCheck: "Check usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Lindy is down",
        alternative: "Relay.app, Zapier AI or Relevance AI (monitored on DownForAI) run comparable AI automations",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Model providers", "Connected apps"],
    operatorNotes: [],
  },
  "make-ai": {
    slug: "make-ai",
    providerSummary:
      "Make (formerly Integromat) is a visual automation platform with AI modules and agents, running scenarios in Make's cloud on operation-based plans. Its incidents — scenario queues, webhook ingress, specific app modules — are published on an Atlassian status page.",
    officialStatusUrl: "https://status.make.com",
    docsUrl: "https://help.make.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Make scenario runtime", description: "Executions and schedules", criticality: "critical" },
      { name: "Webhooks", description: "Incoming triggers", criticality: "critical" },
      { name: "App modules", description: "Per-app connectors", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Scenarios queued or delayed",
        scope: "partial",
        signal: "Scheduled runs start late or executions pile up across organisations",
        quickCheck: "Check status.make.com; do not re-trigger — queued runs execute when the incident clears",
      },
      {
        pattern: "Webhooks returning errors",
        scope: "partial",
        signal: "External systems report failed deliveries to Make webhooks",
        quickCheck: "Confirm the scenario is on and the webhook active; if ingress is down, all webhook scenarios stop",
      },
      {
        pattern: "A specific app module failing",
        scope: "local",
        signal: "One module errors while the rest of the scenario runs",
        quickCheck: "Check that app's own status and the connection in Make",
      },
      {
        pattern: "Operations quota exhausted",
        scope: "local",
        signal: "Scenarios paused with an operations message for your organisation",
        quickCheck: "Check the plan's operations balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Make is down",
        alternative: "Zapier AI, n8n or Activepieces (monitored on DownForAI) run equivalent automations",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Every connected app"],
    operatorNotes: [],
  },
  metagpt: {
    slug: "metagpt",
    providerSummary:
      "MetaGPT is an open-source multi-agent framework that assigns software-company roles to agents to produce specs, designs and code from a one-line requirement; it runs locally with your model keys. The repository moved to the FoundationAgents organisation.",
    docsUrl: "https://docs.deepwisdom.ai",
    communityLinks: [
      { type: "github", url: "https://github.com/geekan/MetaGPT", label: "geekan/MetaGPT", verified: true },
    ],
    monitoredSurfaces: [
      { name: "GitHub repository", description: "Code and releases", criticality: "low" },
      { name: "Local runs", description: "User-run framework", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Runs fail on model errors",
        scope: "local",
        signal: "Roles stop with provider errors",
        quickCheck: "Check the API key and provider status",
      },
      {
        pattern: "Config format changes after upgrading",
        scope: "local",
        signal: "The config file is rejected on start",
        quickCheck: "Regenerate the config with the current version's init command",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a hosted coding agent",
        alternative: "Claude Code, Devin (Cognition) or Manus (monitored on DownForAI) run as services",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [
      "DownForAI probes the GitHub page (the DB website URL); there is no hosted MetaGPT.",
    ],
  },
  multion: {
    slug: "multion",
    providerSummary:
      "MultiOn was an AI web-browsing agent (browser extension and API) that let an assistant complete tasks on websites; the company has since pivoted and multion.ai now redirects to a new brand. Existing MultiOn integrations should be considered deprecated.",
    docsUrl: "https://docs.multion.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "multion.ai", description: "Redirects to the successor brand", criticality: "low" },
      { name: "MultiOn API", description: "Legacy agent API", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API keys or SDK calls failing",
        scope: "local",
        signal: "Legacy integrations return errors after the pivot",
        quickCheck: "Expect deprecation; migrate to another browsing agent",
      },
      {
        pattern: "Extension no longer available",
        scope: "global",
        signal: "The browser extension is unlisted or non-functional",
        quickCheck: "Expected after the product change",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on MultiOn",
        alternative: "Browser Use or OpenAI Operator (monitored on DownForAI) provide browsing agents",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Two DB entries exist (multion, multion-ai); multion.ai redirected to theagi.company when this entry was written.",
    ],
  },
  "multion-ai": {
    slug: "multion-ai",
    providerSummary:
      "MultiOn (second DB entry for the same product) offered an agent API for autonomous browsing sessions; the company pivoted and its domain now redirects elsewhere. Treat the API as discontinued.",
    docsUrl: "https://docs.multion.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "multion.ai", description: "Redirect", criticality: "low" },
      { name: "Agent API", description: "Legacy", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Browsing sessions fail to start",
        scope: "global",
        signal: "The API returns errors for everyone",
        quickCheck: "Expected after the pivot; migrate",
      },
      {
        pattern: "Documentation still online while the service is not",
        scope: "local",
        signal: "docs.multion.ai loads but the endpoints do not answer",
        quickCheck: "Do not rely on the docs' availability as a service signal",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a browsing agent",
        alternative: "Browser Use, OpenAI Operator or Harpa AI (monitored on DownForAI) automate the web",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Duplicate of the multion entry.",
    ],
  },
  "open-interpreter": {
    slug: "open-interpreter",
    providerSummary:
      "Open Interpreter is an open-source agent that runs code on your own machine from natural-language instructions, using a hosted model or a local one. Nothing is hosted by the project beyond docs; failures are local environment or provider issues.",
    docsUrl: "https://docs.openinterpreter.com",
    communityLinks: [
      { type: "github", url: "https://github.com/OpenInterpreter/open-interpreter", label: "OpenInterpreter/open-interpreter", verified: true },
    ],
    monitoredSurfaces: [
      { name: "openinterpreter.com / docs", description: "Website", criticality: "low" },
      { name: "Local install", description: "User-run agent", criticality: "critical" },
      { name: "Configured model", description: "Hosted or local", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model provider errors",
        scope: "local",
        signal: "Sessions stop with rate-limit or key errors",
        quickCheck: "Check the provider's status; switch to a local model via Ollama if needed",
      },
      {
        pattern: "Code execution failing in the local environment",
        scope: "local",
        signal: "Commands error because dependencies or permissions are missing",
        quickCheck: "This is the machine, not the agent; install the missing tools",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a hosted code agent",
        alternative: "Claude Code or Cursor (monitored on DownForAI) run agentic coding with hosted models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers", "Ollama for local models"],
    operatorNotes: [],
  },
  "openai-operator": {
    slug: "openai-operator",
    providerSummary:
      "Operator is OpenAI's browsing agent (a Computer-Using Agent) that completes web tasks in a hosted browser, first offered to Pro subscribers and now folded into ChatGPT agent mode. It runs on OpenAI's platform and follows the OpenAI status page.",
    officialStatusUrl: "https://status.openai.com",
    docsUrl: "https://help.openai.com/en/articles/10421097-operator",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ChatGPT agent mode / Operator", description: "Agent UI", criticality: "critical" },
      { name: "Hosted browser sandbox", description: "Where tasks execute", criticality: "critical" },
      { name: "OpenAI platform", description: "Shared infrastructure", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent tasks stall or the browser never loads",
        scope: "partial",
        signal: "Tasks hang at 'working' for everyone; status.openai.com lists an agent incident",
        quickCheck: "Check the status page and retry later",
      },
      {
        pattern: "Monthly task limit reached",
        scope: "local",
        signal: "Agent mode refuses new tasks with a limit message",
        quickCheck: "Plans cap agent tasks; wait for the reset",
      },
      {
        pattern: "Blocked on a website's anti-bot measures",
        scope: "local",
        signal: "The agent cannot proceed on a site with CAPTCHAs or bot protection",
        quickCheck: "Take over the browser manually for that step; this is the target site",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Operator is unavailable",
        alternative: "Manus, Browser Use or Harpa AI (monitored on DownForAI) run browsing agents",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["OpenAI platform"],
    operatorNotes: [
      "Availability depends on the ChatGPT plan and region; DownForAI relies on the OpenAI status page.",
    ],
  },
  "openai-swarm": {
    slug: "openai-swarm",
    providerSummary:
      "Swarm was OpenAI's experimental, educational multi-agent orchestration library on GitHub; it has been superseded by the OpenAI Agents SDK. It is code you run with your own API key, not a service.",
    docsUrl: "https://github.com/openai/swarm",
    communityLinks: [
      { type: "github", url: "https://github.com/openai/swarm", label: "openai/swarm", verified: true },
    ],
    monitoredSurfaces: [
      { name: "GitHub repository", description: "Archived example code", criticality: "low" },
      { name: "OpenAI API", description: "Called by the library", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "OpenAI API errors in runs",
        scope: "local",
        signal: "Handoffs stop with rate-limit or 5xx errors",
        quickCheck: "Check the OpenAI page on DownForAI",
      },
      {
        pattern: "Library unmaintained",
        scope: "local",
        signal: "Incompatibilities with newer OpenAI SDK versions",
        quickCheck: "Migrate to the OpenAI Agents SDK, the supported successor",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a maintained orchestration framework",
        alternative: "CrewAI, LangChain or Pydantic AI (monitored on DownForAI) are actively developed",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI API"],
    operatorNotes: [
      "DownForAI probes the GitHub page (the DB website URL); the library is experimental and superseded.",
    ],
  },
  "outset-ai": {
    slug: "outset-ai",
    providerSummary:
      "Outset runs AI-moderated research interviews at scale: participants talk to an AI interviewer (text, voice, video) and the platform synthesises findings, sold to research teams. Interview sessions and synthesis are separate services.",
    docsUrl: "https://www.outset.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "outset.ai platform", description: "Study setup and results", criticality: "critical" },
      { name: "Interview sessions", description: "Participant-facing AI interviewer", criticality: "critical" },
      { name: "Synthesis backend", description: "Analysis of transcripts", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Participants cannot start or complete interviews",
        scope: "partial",
        signal: "Session links error or the interviewer stops responding across studies",
        quickCheck: "Open a test session; if it fails too, the interview service is degraded",
      },
      {
        pattern: "Synthesis delayed",
        scope: "partial",
        signal: "Completed interviews do not produce findings for hours",
        quickCheck: "Wait; synthesis runs asynchronously",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Outset is down",
        alternative: "ChatGPT (monitored on DownForAI) can run scripted interviews meanwhile, with manual analysis",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  phidata: {
    slug: "phidata",
    providerSummary:
      "Phidata became Agno: an open-source framework for building agents with memory, tools and knowledge, plus an optional hosted platform; phidata.com now redirects to agno.com. Library users depend on their model providers.",
    docsUrl: "https://docs.agno.com",
    communityLinks: [
      { type: "github", url: "https://github.com/agno-agi/agno", label: "agno-agi/agno", verified: true },
    ],
    monitoredSurfaces: [
      { name: "phidata.com → agno.com", description: "Website redirect", criticality: "low" },
      { name: "Agno library", description: "Local runs", criticality: "medium" },
      { name: "Configured model providers", description: "Drive the agents", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model provider errors in runs",
        scope: "local",
        signal: "Agents stop with rate-limit or key errors",
        quickCheck: "Check the provider's status and credentials",
      },
      {
        pattern: "Imports broken after the rename",
        scope: "local",
        signal: "phidata imports fail in new environments",
        quickCheck: "Install agno and update imports; the package was renamed",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a comparable framework",
        alternative: "CrewAI, Pydantic AI or LangChain (monitored on DownForAI) offer agent frameworks",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [
      "phidata.com redirects to agno.com; DownForAI's probe follows the redirect.",
    ],
  },
  "pydantic-ai": {
    slug: "pydantic-ai",
    providerSummary:
      "Pydantic AI is the Pydantic team's Python framework for type-safe agents, published as a library with documentation; Pydantic Logfire is the optional hosted observability product. Agents call whichever model provider you configure.",
    docsUrl: "https://ai.pydantic.dev",
    communityLinks: [
      { type: "github", url: "https://github.com/pydantic/pydantic-ai", label: "pydantic/pydantic-ai", verified: true },
    ],
    monitoredSurfaces: [
      { name: "ai.pydantic.dev", description: "Documentation", criticality: "low" },
      { name: "Configured model providers", description: "Drive the agents", criticality: "critical" },
      { name: "Logfire (optional)", description: "Hosted tracing", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model provider errors",
        scope: "local",
        signal: "Agent runs stop with rate-limit or 5xx from the provider",
        quickCheck: "Check the provider's status; the framework relays the error",
      },
      {
        pattern: "Validation errors on model output",
        scope: "local",
        signal: "Runs fail because the model's output does not match the result type",
        quickCheck: "Loosen the schema or add retries; this is a prompt/model issue, not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a comparable framework",
        alternative: "LangChain, CrewAI or Semantic Kernel (monitored on DownForAI) offer agent frameworks",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  relay: {
    slug: "relay",
    providerSummary:
      "Relay.app is a workflow-automation platform with AI steps and human-in-the-loop approvals, running workflows in its cloud on usage-based plans. Failures are triggers not firing, steps stuck awaiting AI, or app connections expiring.",
    docsUrl: "https://docs.relay.app",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "relay.app", description: "Builder", criticality: "critical" },
      { name: "Workflow runtime", description: "Triggers and runs", criticality: "critical" },
      { name: "Integrations", description: "Connected apps and AI models", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Triggers not firing",
        scope: "partial",
        signal: "Events in connected apps no longer start workflows across accounts",
        quickCheck: "Run the workflow manually; if manual works, trigger polling is degraded",
      },
      {
        pattern: "AI steps failing",
        scope: "partial",
        signal: "Steps using an AI model error while other steps run",
        quickCheck: "Switch the step's model; the failure is the provider",
      },
      {
        pattern: "App connection expired",
        scope: "local",
        signal: "One app's steps fail with auth errors",
        quickCheck: "Reconnect the app",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Relay.app is down",
        alternative: "Zapier AI, Make (ex-Integromat) or Lindy.ai (monitored on DownForAI) run comparable automations",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Connected apps", "Model providers"],
    operatorNotes: [],
  },
  "relevance-ai": {
    slug: "relevance-ai",
    providerSummary:
      "Relevance AI is a platform for building AI agents and tools (an 'AI workforce') with a no-code builder, hosted runtime and integrations, on credit-based plans. Agents run in Relevance's cloud on third-party models.",
    docsUrl: "https://relevanceai.com/docs",
    pricingUrl: "https://relevanceai.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.relevanceai.com", description: "Builder", criticality: "critical" },
      { name: "Agent runtime", description: "Runs and triggers", criticality: "critical" },
      { name: "Model providers and integrations", description: "Called by agents", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent runs stuck or failing",
        scope: "partial",
        signal: "Tasks stay in progress or error for everyone",
        quickCheck: "Run a one-step tool; a universal failure is the runtime",
      },
      {
        pattern: "A tool step fails on a model or app",
        scope: "local",
        signal: "One step errors with an external message",
        quickCheck: "Check that service's status and the connection",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Runs refused with a credit message for your project",
        quickCheck: "Check usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Relevance AI is down",
        alternative: "Lindy.ai, Gumloop or Dify (monitored on DownForAI) build and run comparable agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Model providers", "Connected apps"],
    operatorNotes: [],
  },
  "retool-ai": {
    slug: "retool-ai",
    providerSummary:
      "Retool is a platform for building internal apps and workflows, with AI features (Retool AI, agents) that call model providers from apps. It runs on Retool Cloud or self-hosted, and publishes incidents on an Atlassian status page.",
    officialStatusUrl: "https://status.retool.com",
    docsUrl: "https://docs.retool.com",
    pricingUrl: "https://retool.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Retool Cloud", description: "Apps and editor", criticality: "critical" },
      { name: "Workflows", description: "Scheduled and webhook runs", criticality: "high" },
      { name: "AI actions / agents", description: "Model calls from apps", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud apps unreachable or slow",
        scope: "partial",
        signal: "Apps fail to load for all users of a region; status.retool.com lists an incident",
        quickCheck: "Check the status page; self-hosted instances are unaffected",
      },
      {
        pattern: "Workflows delayed or failing",
        scope: "partial",
        signal: "Scheduled runs skip or queue",
        quickCheck: "Check the Workflows component on the status page",
      },
      {
        pattern: "AI actions failing while apps work",
        scope: "partial",
        signal: "Queries using Retool AI error; other queries run",
        quickCheck: "Switch the AI action's provider if configured; the failure is the model layer",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Retool Cloud is down",
        alternative: "n8n or Zapier AI (monitored on DownForAI) can cover AI workflows; self-hosted Retool is unaffected by cloud incidents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Model providers", "Connected databases and APIs"],
    operatorNotes: [],
  },
  "semantic-kernel": {
    slug: "semantic-kernel",
    providerSummary:
      "Semantic Kernel is Microsoft's open-source SDK (C#, Python, Java) for building agents and plugins on top of model providers, documented on Microsoft Learn. It is a library you run; failures are provider or version related.",
    docsUrl: "https://learn.microsoft.com/semantic-kernel",
    communityLinks: [
      { type: "github", url: "https://github.com/microsoft/semantic-kernel", label: "microsoft/semantic-kernel", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Microsoft Learn docs", description: "Documentation", criticality: "low" },
      { name: "Configured model providers", description: "Azure OpenAI, OpenAI and others", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Provider errors in kernel calls",
        scope: "local",
        signal: "Functions fail with rate-limit or auth errors from Azure OpenAI or OpenAI",
        quickCheck: "Check the provider's status and deployment names",
      },
      {
        pattern: "Breaking changes between versions",
        scope: "local",
        signal: "Planner or agent APIs removed after upgrading",
        quickCheck: "Pin the version and follow the migration guide",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a comparable framework",
        alternative: "AutoGen (Microsoft), LangChain or Pydantic AI (monitored on DownForAI) offer agent frameworks",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [
      "DownForAI probes the Microsoft Learn page; there is no hosted Semantic Kernel service.",
    ],
  },
  superagent: {
    slug: "superagent",
    providerSummary:
      "Superagent is an open-source framework for building AI assistants and agents, with a hosted offering that has changed direction several times. For most users it is a library to self-host with their own model keys.",
    docsUrl: "https://www.superagent.sh",
    communityLinks: [
      { type: "github", url: "https://github.com/superagent-ai/superagent", label: "superagent-ai/superagent", verified: true },
    ],
    monitoredSurfaces: [
      { name: "superagent.sh", description: "Website", criticality: "low" },
      { name: "Self-hosted instances", description: "User-run", criticality: "medium" },
      { name: "Configured model providers", description: "Drive the agents", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Provider errors in agent runs",
        scope: "local",
        signal: "Runs stop with rate-limit or key errors",
        quickCheck: "Check the provider's status and credentials",
      },
      {
        pattern: "Hosted offering changed or unavailable",
        scope: "global",
        signal: "The cloud product differs from the docs or is gone",
        quickCheck: "Self-host from the repository",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a maintained agent platform",
        alternative: "Dify, CrewAI or Relevance AI (monitored on DownForAI) are actively developed",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  "vapi-ai": {
    slug: "vapi-ai",
    providerSummary:
      "Vapi is a developer platform for voice AI agents (phone and web calls) that orchestrates speech-to-text, LLM and text-to-speech providers, on usage-based plans, with its own status page. Incidents show as calls failing to connect, latency, or a specific provider failing inside calls.",
    docsUrl: "https://docs.vapi.ai",
    pricingUrl: "https://vapi.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Vapi API and dashboard", description: "Assistants and calls", criticality: "critical" },
      { name: "Call pipeline", description: "Telephony, STT, LLM, TTS", criticality: "critical" },
      { name: "Provider integrations", description: "Deepgram, OpenAI, ElevenLabs and others", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Calls not connecting",
        scope: "partial",
        signal: "Inbound or outbound calls fail at setup across assistants",
        quickCheck: "Start a web call from the dashboard; if it fails too, check Vapi's status page",
      },
      {
        pattern: "One provider failing inside calls",
        scope: "partial",
        signal: "Calls connect but the assistant is silent or transcription stops; logs name a provider",
        quickCheck: "Switch that provider in the assistant config (for example TTS or STT)",
      },
      {
        pattern: "High latency",
        scope: "partial",
        signal: "Long pauses before replies across calls",
        quickCheck: "Try a faster model or TTS; if all calls lag, the pipeline is saturated",
      },
      {
        pattern: "Billing balance exhausted",
        scope: "local",
        signal: "Calls refused with a balance message for your account",
        quickCheck: "Top up in the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vapi is down",
        alternative: "Bland AI or Hume AI (monitored on DownForAI) run voice agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Telephony carriers", "Deepgram, OpenAI, ElevenLabs and other providers"],
    operatorNotes: [
      "Vapi has its own status page; DownForAI probes vapi.ai only.",
    ],
  },
  voiceflow: {
    slug: "voiceflow",
    providerSummary:
      "Voiceflow is a conversational-agent builder for product teams (chat and voice) with a hosted runtime, Dialog API and knowledge base, on seat and usage-based plans. Deployed agents run in Voiceflow's cloud, and the company publishes a status page.",
    officialStatusUrl: "https://status.voiceflow.com/",
    docsUrl: "https://docs.voiceflow.com",
    pricingUrl: "https://www.voiceflow.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Voiceflow Creator", description: "Builder", criticality: "high" },
      { name: "Runtime / Dialog API", description: "Deployed agents", criticality: "critical" },
      { name: "Knowledge base", description: "Retrieval over uploaded content", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Deployed agents not responding",
        scope: "global",
        signal: "Web chat widgets and API calls fail for everyone; status.voiceflow.com lists a runtime incident",
        quickCheck: "Check the status page; nothing to redeploy",
      },
      {
        pattern: "Knowledge-base answers failing",
        scope: "partial",
        signal: "Agents reply without retrieved content or error on KB steps",
        quickCheck: "Test the KB in Creator; the retrieval service is separate from the runtime",
      },
      {
        pattern: "AI credits exhausted",
        scope: "local",
        signal: "Agents refuse AI steps with a credit message for your workspace",
        quickCheck: "Check usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Voiceflow is down",
        alternative: "Botpress, Dify or Coze (monitored on DownForAI) host comparable agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  "zapier-ai": {
    slug: "zapier-ai",
    providerSummary:
      "Zapier's AI features (AI actions, Zapier Agents, AI steps in Zaps) run on top of the Zapier platform, whose incidents — Zap delays, app integrations, webhooks — are published on an Atlassian status page. Most 'Zapier AI is down' reports are platform delays rather than AI-specific failures.",
    officialStatusUrl: "https://status.zapier.com",
    docsUrl: "https://help.zapier.com",
    pricingUrl: "https://zapier.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Zapier platform", description: "Zap execution", criticality: "critical" },
      { name: "Zapier Agents", description: "Agent runtime", criticality: "high" },
      { name: "App integrations", description: "Per-app connectors", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Zaps delayed",
        scope: "partial",
        signal: "Tasks run minutes or hours late across accounts; status.zapier.com shows a delay incident",
        quickCheck: "Check the status page; delayed tasks run when the backlog clears — do not replay them",
      },
      {
        pattern: "AI step or agent failing on the model",
        scope: "partial",
        signal: "AI steps error while other steps run",
        quickCheck: "Retry later; the model provider behind the step is the likely cause",
      },
      {
        pattern: "One app integration failing",
        scope: "local",
        signal: "Steps for a specific app error with that app's message",
        quickCheck: "Check the app's own status and reconnect the account",
      },
      {
        pattern: "Task quota exhausted",
        scope: "local",
        signal: "Zaps paused with a task limit message for your account",
        quickCheck: "Check the plan's task usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Zapier is down",
        alternative: "Make (ex-Integromat), n8n or Activepieces (monitored on DownForAI) run equivalent automations",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Every connected app", "Model providers"],
    operatorNotes: [],
  },
};
