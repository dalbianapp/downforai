import type { TopServiceContent } from "@/content/top-services/types";

// DEV — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start dev-2.ts and register it in ./index.ts if it grows.
export const DEV: Record<string, TopServiceContent> = {
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
  "google-ai-studio": {
    slug: "google-ai-studio",
    providerSummary:
      "Free developer access to Gemini models. Prototyping, API key generation, prompt testing.",
    officialStatusUrl: "https://status.cloud.google.com",
    docsUrl: "https://ai.google.dev",
    pricingUrl: "https://ai.google.dev/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "aistudio.google.com", description: "Web interface and prompt editor", criticality: "critical" },
      { name: "Gemini API (AI Studio keys)", description: "API access via AI Studio keys", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Rate limits on free tier",
        scope: "local",
        signal: "429 errors after exceeding requests per minute",
        quickCheck: "Implement exponential backoff; upgrade to paid tier for higher limits",
      },
      {
        pattern: "Quota errors",
        scope: "local",
        signal: "Daily or monthly quota exhausted",
        quickCheck: "Check quota usage in Google AI Studio dashboard",
      },
      {
        pattern: "Model-specific unavailability",
        scope: "partial",
        signal: "One Gemini model fails while others work",
        quickCheck: "Try Gemini Flash instead of Pro or vice versa",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Google AI Studio is degraded",
        alternative:
          "Vertex AI (enterprise path) can reduce downtime for Gemini; OpenAI or Anthropic API as model alternative",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "continue-dev": {
    slug: "continue-dev",
    providerSummary:
      "Open-source AI coding assistant for VS Code and JetBrains. Connects to any model (local Ollama, Claude, GPT, etc.).",
    docsUrl: "https://docs.continue.dev",
    communityLinks: [
      { type: "github", url: "https://github.com/continuedev/continue", label: "continuedev/continue", verified: true },
      { type: "discord", url: "https://discord.gg/continue", label: "Discord", verified: false },
    ],
    monitoredSurfaces: [
      { name: "VS Code Extension", description: "Continue VS Code extension", criticality: "critical" },
      { name: "JetBrains Plugin", description: "Continue JetBrains plugin", criticality: "high" },
      { name: "Model Routing Backend", description: "Hosted features routing (if used)", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Extension version conflicts",
        scope: "local",
        signal: "Extension fails after VS Code or Continue update",
        quickCheck: "Check GitHub releases for known issues; try rolling back extension version",
      },
      {
        pattern: "Model provider auth issues",
        scope: "local",
        signal: "Requests to configured model fail with auth errors",
        quickCheck: "Verify API key in Continue config; test key directly with provider",
      },
      {
        pattern: "Config file parsing errors",
        scope: "local",
        signal: "Continue fails to load with config error",
        quickCheck: "Validate config.json against the schema in docs",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Continue.dev extension is broken",
        alternative:
          "Cursor, GitHub Copilot, or Codeium can reduce downtime for AI-assisted coding",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Continue routes to user-configured models — most 'down' reports are provider-side (Ollama, OpenAI, etc.), not Continue itself.",
    ],
  },
  cline: {
    slug: "cline",
    providerSummary:
      "Autonomous AI coding agent as a VS Code extension. Executes multi-step tasks, reads/writes files, runs terminal commands.",
    docsUrl: "https://github.com/cline/cline",
    communityLinks: [
      { type: "github", url: "https://github.com/cline/cline", label: "cline/cline", verified: true },
    ],
    monitoredSurfaces: [
      { name: "VS Code Extension", description: "Cline VS Code extension", criticality: "critical" },
      { name: "Upstream Model Providers", description: "Anthropic, OpenAI, etc. (user-configured)", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Extension update breaking changes",
        scope: "global",
        signal: "Cline stops working after an extension update",
        quickCheck: "Check GitHub releases; roll back to previous version if needed",
      },
      {
        pattern: "Upstream provider rate limits",
        scope: "local",
        signal: "Tasks fail with rate limit errors from Anthropic or OpenAI",
        quickCheck: "Check your API usage in the provider dashboard; reduce task frequency",
      },
      {
        pattern: "Context window exceeded on large codebases",
        scope: "local",
        signal: "Task fails with context length error",
        quickCheck: "Reduce the scope of files included; use .clineignore to exclude irrelevant files",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Cline is degraded",
        alternative:
          "Claude Code CLI, Cursor Composer, or Aider can reduce downtime for autonomous coding",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Cline uses your API keys — costs come from your Anthropic/OpenAI account, not Cline. 'Cline is slow' usually means the upstream model is slow.",
    ],
  },
  "augment-code": {
    slug: "augment-code",
    providerSummary:
      "AI coding assistant with deep codebase understanding. Focuses on large enterprise codebases. VS Code and JetBrains.",
    docsUrl: "https://docs.augmentcode.com",
    pricingUrl: "https://www.augmentcode.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "augmentcode.com", description: "Web dashboard", criticality: "high" },
      { name: "IDE Extension", description: "VS Code and JetBrains extension", criticality: "critical" },
      { name: "Codebase Indexing Backend", description: "Codebase understanding engine", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Codebase indexing delays on large repos",
        scope: "local",
        signal: "Context-aware suggestions missing or stale",
        quickCheck: "Trigger manual re-index from extension settings",
      },
      {
        pattern: "Auth/license issues",
        scope: "local",
        signal: "Extension prompts for login or license validation fails",
        quickCheck: "Re-authenticate from extension; check license status in dashboard",
      },
      {
        pattern: "IDE extension conflicts",
        scope: "local",
        signal: "Extension crashes or causes IDE instability",
        quickCheck: "Disable other AI extensions; check Augment GitHub issues",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Augment Code is degraded",
        alternative:
          "Cursor, GitHub Copilot, or Sourcegraph Cody can reduce downtime for AI coding assistance",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "sourcegraph-cody": {
    slug: "sourcegraph-cody",
    providerSummary:
      "AI coding assistant with Sourcegraph code intelligence. Code search + AI chat + autocomplete.",
    officialStatusUrl: "https://sourcegraphstatus.com",
    docsUrl: "https://docs.sourcegraph.com/cody",
    pricingUrl: "https://sourcegraph.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sourcegraph.com", description: "Web interface", criticality: "critical" },
      { name: "Cody IDE Extensions", description: "VS Code and JetBrains extensions", criticality: "critical" },
      { name: "Code Search API", description: "Sourcegraph code search backend", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Code index staleness",
        scope: "global",
        signal: "Search results outdated or missing recent commits",
        quickCheck: "Trigger re-index from Sourcegraph admin; check indexing status",
      },
      {
        pattern: "Enterprise instance sync delays",
        scope: "local",
        signal: "Self-hosted instance behind on code updates",
        quickCheck: "Check repository sync status in site admin",
      },
      {
        pattern: "Model backend issues",
        scope: "global",
        signal: "Cody chat fails (routes to Claude or GPT)",
        quickCheck: "Check sourcegraphstatus.com; verify model provider status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sourcegraph Cody is degraded",
        alternative:
          "GitHub Copilot Chat, Cursor, or Continue.dev can reduce downtime for AI coding",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  aider: {
    slug: "aider",
    providerSummary:
      "CLI-based AI pair programmer. Open source. Works with any model (Claude, GPT, local). Git-native workflow.",
    docsUrl: "https://aider.chat",
    communityLinks: [
      { type: "github", url: "https://github.com/Aider-AI/aider", label: "Aider-AI/aider", verified: true },
      { type: "discord", url: "https://discord.gg/aider", label: "Discord", verified: false },
    ],
    monitoredSurfaces: [
      { name: "PyPI Package", description: "aider-chat package on PyPI", criticality: "critical" },
      { name: "Upstream Model Providers", description: "Anthropic, OpenAI, Ollama, etc.", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Breaking changes between versions",
        scope: "global",
        signal: "Aider behavior changes unexpectedly after update",
        quickCheck: "Pin version with pip install aider-chat==x.y.z; check CHANGELOG",
      },
      {
        pattern: "Upstream provider rate limits",
        scope: "local",
        signal: "API calls fail with rate limit errors mid-session",
        quickCheck: "Check API usage in provider dashboard; use --model to switch providers",
      },
      {
        pattern: "Git repo parsing issues on complex histories",
        scope: "local",
        signal: "Aider fails to parse repo context correctly",
        quickCheck: "Use --no-git flag to isolate; check GitHub issues for the repo structure",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Aider is broken",
        alternative:
          "Claude Code CLI or Cline are alternatives for CLI/autonomous coding",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
};
