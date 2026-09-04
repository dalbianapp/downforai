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
};
