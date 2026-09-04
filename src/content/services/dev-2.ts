import type { TopServiceContent } from "@/content/top-services/types";

// DEV (part 2) — enriched service content, continuation of dev.ts which reached the
// ~3000-line guideline. Same rules: keys are DB Service.slug values and MUST exist in
// the Service table. Registered in ./index.ts as "dev-2".
export const DEV_2: Record<string, TopServiceContent> = {
  "amazon-q": {
    slug: "amazon-q",
    providerSummary:
      "Amazon Q Developer is AWS's coding assistant: inline completions, chat and agents inside VS Code, JetBrains, the AWS console and the CLI. It authenticates through AWS Builder ID or IAM Identity Center and runs on AWS regions, so its health follows the AWS service health dashboard rather than a standalone status page.",
    officialStatusUrl: "https://health.aws.amazon.com/health/status",
    docsUrl: "https://docs.aws.amazon.com/amazonq/",
    pricingUrl: "https://aws.amazon.com/q/developer/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "IDE extensions", description: "VS Code and JetBrains plugins", criticality: "critical" },
      { name: "Authentication", description: "AWS Builder ID / IAM Identity Center", criticality: "critical" },
      { name: "Q Developer service endpoints", description: "Regional inference and agent backend", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Completions stop while the IDE keeps working",
        scope: "partial",
        signal: "Inline suggestions disappear and chat returns a service error in the extension panel",
        quickCheck: "Open the AWS Health Dashboard and filter on Amazon Q; regional incidents affect users of that region only",
      },
      {
        pattern: "Sign-in loop with Builder ID or Identity Center",
        scope: "local",
        signal: "The browser flow completes but the extension reverts to 'sign in'; agent calls fail with an auth error",
        quickCheck: "Sign out in the extension, clear the SSO cache and sign in again; expired Identity Center sessions are the usual cause",
      },
      {
        pattern: "Free-tier monthly limit reached",
        scope: "local",
        signal: "Agent or chat requests refused with a quota message for your account",
        quickCheck: "Check usage in the AWS console; limits reset monthly and are not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Amazon Q Developer is unavailable in your region",
        alternative: "GitHub Copilot, Cursor or Cline (monitored on DownForAI) provide in-editor assistance on independent backends",
        switchingCost: "low",
        note: "Loses Q's AWS-specific context (CloudFormation, IAM, console integration)",
      },
    ],
    ecosystemDependencies: ["AWS regional infrastructure", "AWS Builder ID / IAM Identity Center"],
    operatorNotes: [
      "Two DB entries exist for this product (amazon-q and amazon-q-developer); both monitor the same AWS Health surface.",
    ],
  },
  "amazon-q-developer": {
    slug: "amazon-q-developer",
    providerSummary:
      "Amazon Q Developer (this second entry tracks the same AWS product) brings agentic coding, code transformation and chat to IDEs and the command line, backed by AWS-hosted models. Incidents are regional and show up through the AWS Health Dashboard.",
    officialStatusUrl: "https://health.aws.amazon.com/health/status",
    docsUrl: "https://docs.aws.amazon.com/amazonq/",
    pricingUrl: "https://aws.amazon.com/q/developer/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Q Developer CLI and IDE plugins", description: "Client surfaces", criticality: "critical" },
      { name: "AWS regional endpoints", description: "Model and agent backend", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent tasks (code transformation, /dev) stall",
        scope: "partial",
        signal: "The agent accepts the task but never returns a diff, while inline completions still work",
        quickCheck: "Cancel and rerun on a smaller scope; if every agent task hangs, check the AWS Health Dashboard for Amazon Q",
      },
      {
        pattern: "CLI commands fail with credential errors",
        scope: "local",
        signal: "q chat or q translate return 'not authenticated' after previously working",
        quickCheck: "Run the login command again; Builder ID tokens expire and must be refreshed",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Q Developer agents are down",
        alternative: "Claude Code or Cursor (monitored on DownForAI) can run comparable agentic coding tasks",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["AWS regional infrastructure", "AWS Builder ID / IAM Identity Center"],
    operatorNotes: [
      "Duplicate of amazon-q in the DB; the same AWS Health surface feeds both pages.",
    ],
  },
  "anthropic-api": {
    slug: "anthropic-api",
    providerSummary:
      "The Anthropic API (console.anthropic.com / platform.claude.com) gives programmatic access to Claude models, with the Console for keys, usage and billing. Failures are seen as HTTP error codes in client code — 429 rate limits, 529 overloaded and 5xx — and are published on Anthropic's status page.",
    officialStatusUrl: "https://status.anthropic.com",
    docsUrl: "https://docs.anthropic.com",
    pricingUrl: "https://www.anthropic.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.anthropic.com", description: "Messages API", criticality: "critical" },
      { name: "Console", description: "Keys, usage, billing", criticality: "high" },
      { name: "Per-model availability", description: "Individual Claude models can degrade separately", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "529 overloaded_error",
        scope: "partial",
        signal: "Requests fail with HTTP 529 on a specific model during demand spikes; other models respond",
        quickCheck: "Retry with exponential backoff and fall back to a smaller Claude model; check status.anthropic.com for a model-specific incident",
      },
      {
        pattern: "429 rate_limit_error",
        scope: "local",
        signal: "Requests rejected with 429 and rate-limit headers while the status page is green",
        quickCheck: "Read the retry-after header and your tier limits in the Console; this is your quota, not an outage",
      },
      {
        pattern: "Elevated latency or timeouts",
        scope: "partial",
        signal: "Time-to-first-token climbs to many seconds, long generations time out client-side",
        quickCheck: "Enable streaming and raise client timeouts; confirm on the status page whether latency is elevated",
      },
      {
        pattern: "Console unavailable while the API works",
        scope: "partial",
        signal: "console.anthropic.com errors or fails to log in; API calls succeed",
        quickCheck: "Keep using existing keys; the Console and the API are separate systems",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Claude API is overloaded",
        alternative: "OpenAI API, Google AI Studio or Mistral (monitored on DownForAI) can take routed traffic behind a provider abstraction",
        switchingCost: "medium",
        note: "Claude is also served through AWS Bedrock and Google Vertex AI with separate capacity",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The 'anthropic' and 'claude-chat' pages on DownForAI cover the same status page; this entry is the developer-facing view.",
    ],
  },
  applitools: {
    slug: "applitools",
    providerSummary:
      "Applitools is a visual-testing platform (Eyes) that compares screenshots with AI across browsers and devices, driven from CI through SDKs and the Ultrafast Grid. Failures surface as test runs stuck or failing in CI rather than a dashboard being down.",
    docsUrl: "https://applitools.com/docs/",
    pricingUrl: "https://applitools.com/platform-pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Eyes server", description: "Screenshot comparison and results", criticality: "critical" },
      { name: "Ultrafast Grid", description: "Cross-browser rendering", criticality: "high" },
      { name: "Dashboard", description: "Test review UI", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Test runs hang at 'waiting for results'",
        scope: "partial",
        signal: "CI jobs time out while the Eyes SDK waits for comparisons to finish",
        quickCheck: "Check the dashboard for the batch; if results never arrive for any batch, the comparison backend is degraded",
      },
      {
        pattern: "Ultrafast Grid renders failing",
        scope: "partial",
        signal: "Only cross-browser (Grid) checks fail; classic single-browser checks pass",
        quickCheck: "Run one test without the Grid; a Grid-only failure isolates the rendering service",
      },
      {
        pattern: "API key or quota errors from the SDK",
        scope: "local",
        signal: "SDK reports an invalid key or exceeded checkpoints for your account only",
        quickCheck: "Verify the API key and plan usage in the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Applitools is down during a release",
        alternative: "Mabl or Katalon AI (monitored on DownForAI) offer visual and functional testing; pixel-diff libraries can cover the gap temporarily",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["CI providers running the test suites"],
    operatorNotes: [],
  },
  askcodi: {
    slug: "askcodi",
    providerSummary:
      "AskCodi is an AI coding assistant offered as a web workbook and IDE extensions (VS Code, JetBrains), with credits-based plans and a choice of underlying models. It is a small hosted service that relays to third-party model providers.",
    docsUrl: "https://www.askcodi.com",
    pricingUrl: "https://www.askcodi.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "askcodi.com web app", description: "Workbook and account", criticality: "critical" },
      { name: "IDE extensions", description: "In-editor assistant", criticality: "high" },
      { name: "Model relay", description: "Third-party model backends", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Requests fail on one model but work on another",
        scope: "partial",
        signal: "Switching the model in settings restores answers",
        quickCheck: "Change model; a single-model failure is the upstream provider relayed by AskCodi",
      },
      {
        pattern: "Credits exhausted mistaken for an outage",
        scope: "local",
        signal: "Requests refused with a credit message for your account",
        quickCheck: "Check the credit balance on the account page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AskCodi is down",
        alternative: "GitHub Copilot, CodeGPT or Bito AI (monitored on DownForAI) provide comparable IDE assistance",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers behind the model picker"],
    operatorNotes: [
      "docs.askcodi.com was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  "bitbucket-ai": {
    slug: "bitbucket-ai",
    providerSummary:
      "Bitbucket's AI features (Atlassian Intelligence: pull-request summaries, code explanations, Rovo agents) live inside Bitbucket Cloud. They depend on Bitbucket itself and on Atlassian's AI platform, so an incident on either side removes the AI features while repositories keep working, or the other way round.",
    docsUrl: "https://support.atlassian.com/bitbucket-cloud/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "bitbucket.org", description: "Repositories and pull requests", criticality: "critical" },
      { name: "Atlassian Intelligence", description: "AI summaries and agents", criticality: "high" },
      { name: "Atlassian identity", description: "Login and permissions", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI summaries missing on pull requests",
        scope: "partial",
        signal: "The AI summary button errors or produces nothing while PRs, diffs and pipelines work",
        quickCheck: "Confirm Atlassian Intelligence is enabled for the workspace by an admin; if enabled and still failing, the AI platform is degraded",
      },
      {
        pattern: "Bitbucket Cloud itself degraded",
        scope: "global",
        signal: "Pushes, PR pages or Pipelines fail — AI features fail with them",
        quickCheck: "Check Atlassian's Bitbucket status page; nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Bitbucket AI features are unavailable",
        alternative: "CodeRabbit or Qodo (monitored on DownForAI) can review and summarise pull requests via integrations",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Atlassian Intelligence platform", "Atlassian account / identity"],
    operatorNotes: [
      "Bitbucket publishes its own Atlassian Statuspage; DownForAI currently probes bitbucket.org only.",
    ],
  },
  "bito-ai": {
    slug: "bito-ai",
    providerSummary:
      "Bito provides an AI code-review agent for pull requests plus IDE extensions for chat and explanations, connected to GitHub, GitLab and Bitbucket. Its reviews run asynchronously on Bito's cloud, so a stalled review is the classic failure mode.",
    docsUrl: "https://docs.bito.ai",
    pricingUrl: "https://bito.ai/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "AI Code Review Agent", description: "Automated PR reviews", criticality: "critical" },
      { name: "IDE extensions", description: "Chat and explain in the editor", criticality: "high" },
      { name: "Git provider integrations", description: "GitHub / GitLab / Bitbucket webhooks", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "PR review never posted",
        scope: "partial",
        signal: "A pull request stays without Bito's review comment beyond the usual minutes",
        quickCheck: "Trigger the review manually with the /review command; if it still does not post for any PR, the review service is degraded",
      },
      {
        pattern: "Extension chat errors on some models",
        scope: "partial",
        signal: "Switching the model in the extension restores answers",
        quickCheck: "Change model; a single-model failure is upstream",
      },
      {
        pattern: "Integration lost its permissions",
        scope: "local",
        signal: "Bito stops receiving PR events after a repository or org permission change",
        quickCheck: "Reinstall or re-authorise the Bito app on the Git provider",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Bito reviews are down",
        alternative: "CodeRabbit or Qodo (monitored on DownForAI) can take over automated PR reviews",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab / Bitbucket APIs", "Third-party model providers"],
    operatorNotes: [],
  },
  "blinq-io": {
    slug: "blinq-io",
    providerSummary:
      "BlinqIO is an AI test-automation service: virtual testers generate and maintain Playwright-style scripts from recorded user actions, then run them in BlinqIO's cloud. Incidents surface as recordings not converting or runs stuck, not as a website outage.",
    docsUrl: "https://blinq.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "BlinqIO cloud", description: "Test generation and execution", criticality: "critical" },
      { name: "Recorder", description: "Browser action capture", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Recorded flow never turns into a test",
        scope: "partial",
        signal: "Generation stays pending for every recording",
        quickCheck: "Retry with a short flow; if it also stalls, the generation backend is degraded",
      },
      {
        pattern: "Cloud runs queued or failing across projects",
        scope: "partial",
        signal: "Runs sit in queue or fail before starting, unrelated to the tested app",
        quickCheck: "Run one test locally if your plan allows; a cloud-only failure isolates BlinqIO's runners",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "BlinqIO is down",
        alternative: "Mabl, Katalon AI or Testers.ai (monitored on DownForAI) offer AI-assisted test automation",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "docs.blinq.io was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  "bloop-ai": {
    slug: "bloop-ai",
    providerSummary:
      "bloop was an AI code-search tool that indexed repositories and answered questions about them, available as a desktop app and open-source project. The company pivoted to legacy-code modernisation and the original bloop.ai service is effectively discontinued; the open-source app remains on GitHub.",
    docsUrl: "https://github.com/BloopAI/bloop",
    communityLinks: [
      { type: "github", url: "https://github.com/BloopAI/bloop", label: "BloopAI/bloop", verified: true },
    ],
    monitoredSurfaces: [
      { name: "bloop.ai", description: "Website (currently unreachable)", criticality: "low" },
      { name: "Open-source app", description: "Self-run code search", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "bloop.ai does not resolve or times out",
        quickCheck: "Expect this: the hosted product is no longer offered; use the GitHub release if you need the app",
      },
      {
        pattern: "Cloud features in old builds failing",
        scope: "local",
        signal: "Sign-in or remote indexing fails in an older desktop build",
        quickCheck: "Use local-only mode; the cloud backend behind those features is gone",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on bloop for code search",
        alternative: "Sourcegraph Cody or Cursor (monitored on DownForAI) provide codebase-aware search and chat",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Marked POSSIBLY_INACTIVE in DownForAI's database; the technical signal here is UNVERIFIABLE.",
    ],
  },
  buildt: {
    slug: "buildt",
    providerSummary:
      "Buildt started as an AI codebase-search tool and became Cosine (cosine.sh), the company behind the Genie software-engineering agent; buildt.ai now redirects there. What remains to monitor is the Cosine platform rather than a separate Buildt product.",
    docsUrl: "https://www.buildt.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "buildt.ai → cosine.sh", description: "Website redirect", criticality: "low" },
      { name: "Cosine platform", description: "Where the product now lives", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Old Buildt extension or links no longer work",
        scope: "local",
        signal: "Legacy VS Code extension features error or the old dashboard is gone",
        quickCheck: "Expect this after the rebrand; use Cosine's current product instead",
      },
      {
        pattern: "cosine.sh unreachable",
        scope: "global",
        signal: "The redirected site times out or errors",
        quickCheck: "Check DownForAI's Cosine Genie page and probe result",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need codebase search now",
        alternative: "Sourcegraph Cody or Cursor (monitored on DownForAI) offer repository-aware search and chat",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "buildt.ai redirects to cosine.sh; Cosine Genie is tracked as its own service on DownForAI.",
    ],
  },
  "codacy-ai": {
    slug: "codacy-ai",
    providerSummary:
      "Codacy is a code-quality and security platform that analyses pull requests and repositories, with AI-generated fixes and reviews on top. It hooks into GitHub, GitLab and Bitbucket, so its incidents are usually analyses that never complete or status checks stuck pending.",
    docsUrl: "https://docs.codacy.com",
    pricingUrl: "https://www.codacy.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.codacy.com", description: "Dashboard", criticality: "high" },
      { name: "Analysis pipeline", description: "PR and commit analysis", criticality: "critical" },
      { name: "Git provider integrations", description: "Webhooks and status checks", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "PR status check stuck on pending",
        scope: "partial",
        signal: "Codacy's check never reports on new pull requests across repositories",
        quickCheck: "Open the PR in the Codacy dashboard; if analysis is queued for every repo, the pipeline is backed up — check Codacy's status page",
      },
      {
        pattern: "AI fixes or reviews not generated",
        scope: "partial",
        signal: "Classic analysis works but AI suggestions are empty or error",
        quickCheck: "Retry on one issue; an AI-only failure is the model layer, not the analysers",
      },
      {
        pattern: "Repository lost its connection",
        scope: "local",
        signal: "One repository stops receiving analyses after a permission or token change",
        quickCheck: "Re-authorise the integration for that repository",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Codacy analysis is down",
        alternative: "CodeRabbit, Qodo or Snyk Code AI (monitored on DownForAI) can review PRs for quality and security",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab / Bitbucket APIs"],
    operatorNotes: [
      "Codacy publishes its own status page; DownForAI currently probes codacy.com only.",
    ],
  },
  codegeex: {
    slug: "codegeex",
    providerSummary:
      "CodeGeeX is a code-generation model family from Zhipu / Tsinghua with free IDE plugins (VS Code, JetBrains) and an online service hosted in China. The hosted endpoints are the main dependency; the open-weight models can also be run locally.",
    docsUrl: "https://github.com/THUDM/CodeGeeX",
    communityLinks: [
      { type: "github", url: "https://github.com/THUDM/CodeGeeX", label: "THUDM/CodeGeeX", verified: true },
    ],
    monitoredSurfaces: [
      { name: "codegeex.cn", description: "Website and online service", criticality: "high" },
      { name: "Plugin inference endpoints", description: "Hosted completion backend", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Completions slow or timing out outside China",
        scope: "partial",
        signal: "Plugin suggestions arrive seconds late or not at all; users in China report normal latency",
        quickCheck: "Test from another network; cross-border latency to the hosted endpoint is expected and is not an outage",
      },
      {
        pattern: "Website path returns 404 while the plugin works",
        scope: "local",
        signal: "codegeex.cn pages 404 after site changes",
        quickCheck: "Use the GitHub repository for docs and downloads; the inference backend is separate from the site",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CodeGeeX endpoints are unreachable",
        alternative: "Tabby or Continue (monitored on DownForAI) run open code models locally; GitHub Copilot is the hosted alternative",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The DB website URL (codegeex.cn/en-US) answered 404 when this entry was written; the probe result should be read with that in mind.",
    ],
  },
  codegpt: {
    slug: "codegpt",
    providerSummary:
      "CodeGPT is a VS Code (and JetBrains) extension plus a web platform for AI agents that connect to many model providers with your own keys or CodeGPT's plans. Because it relays to providers, a failure on one model rarely means CodeGPT itself is down.",
    docsUrl: "https://docs.codegpt.co",
    pricingUrl: "https://www.codegpt.co/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "codegpt.co platform", description: "Agents, account and marketplace", criticality: "high" },
      { name: "IDE extension", description: "In-editor chat and completions", criticality: "critical" },
      { name: "Provider relay", description: "Calls to OpenAI, Anthropic, Google and others", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One provider errors, others work",
        scope: "partial",
        signal: "Requests fail only for a specific provider or model in the picker",
        quickCheck: "Switch provider; check that provider's status — CodeGPT only relays the error",
      },
      {
        pattern: "Sign-in or plan not recognised in the extension",
        scope: "local",
        signal: "The extension shows a free/limited state although the web account is paid",
        quickCheck: "Sign out and back in from the extension; confirm the same email is used on the web platform",
      },
      {
        pattern: "Agents or marketplace unavailable",
        scope: "partial",
        signal: "The web platform errors while the extension with your own keys keeps working",
        quickCheck: "Use the extension in bring-your-own-key mode until the platform recovers",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CodeGPT is down",
        alternative: "Continue or Cline (monitored on DownForAI) also bring your own keys into the editor",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI, Anthropic, Google and other model providers"],
    operatorNotes: [],
  },
  codellama: {
    slug: "codellama",
    providerSummary:
      "Code Llama is Meta's family of open-weight code models. There is no hosted Meta service to be 'down': the models are downloaded and run by users or served by third-party providers, so availability questions are really about the provider or the download source.",
    docsUrl: "https://github.com/meta-llama/codellama",
    communityLinks: [
      { type: "github", url: "https://github.com/meta-llama/codellama", label: "meta-llama/codellama", verified: true },
    ],
    monitoredSurfaces: [
      { name: "codellama.dev", description: "Informational site", criticality: "low" },
      { name: "Model downloads", description: "Hugging Face and Meta download links", criticality: "medium" },
      { name: "Third-party inference providers", description: "Where most users actually run it", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Provider serving Code Llama is down",
        scope: "partial",
        signal: "Your API calls to a hosting provider fail while the model itself is unaffected",
        quickCheck: "Check the provider's status page (Together AI, Replicate, Hugging Face); switch provider if needed",
      },
      {
        pattern: "Model download slow or failing",
        scope: "local",
        signal: "Weights download stalls from Hugging Face or the Meta link expires",
        quickCheck: "Re-request the download link or use a mirror; expired signed URLs are the usual cause",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your Code Llama provider is unavailable",
        alternative: "Together AI, Replicate or Hugging Face (monitored on DownForAI) all serve open code models; StarCoder is a comparable open model",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub for downloads", "Inference providers"],
    operatorNotes: [
      "DownForAI probes codellama.dev, an informational page; it does not reflect any inference capacity.",
    ],
  },
  codemate: {
    slug: "codemate",
    providerSummary:
      "CodeMate is an AI pair-programmer offered as a web app and IDE extension that reviews, explains and fixes code, with credit-based plans. It is a small hosted service relaying to third-party models, so most failures are relay or quota related.",
    docsUrl: "https://codemate.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "codemate.ai web app", description: "Chat and review UI", criticality: "critical" },
      { name: "IDE extension", description: "In-editor assistant", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Requests fail or time out for every prompt",
        scope: "partial",
        signal: "The UI loads but no answer arrives, in web and extension alike",
        quickCheck: "Retry a trivial prompt; a universal failure is the relay backend, not your code",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Requests refused with a plan message for your account",
        quickCheck: "Check the balance on the account page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CodeMate is down",
        alternative: "GitHub Copilot, CodeGPT or AskCodi (monitored on DownForAI) offer comparable code chat and fixes",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  coderabbit: {
    slug: "coderabbit",
    providerSummary:
      "CodeRabbit is an AI code-review service that comments on pull requests in GitHub, GitLab, Azure DevOps and Bitbucket, with a chat you can address in PR comments. Reviews run asynchronously after webhook events, so its incidents look like silent PRs.",
    docsUrl: "https://docs.coderabbit.ai",
    pricingUrl: "https://www.coderabbit.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Review pipeline", description: "PR analysis and comments", criticality: "critical" },
      { name: "Git provider integrations", description: "Webhook ingestion", criticality: "critical" },
      { name: "app.coderabbit.ai", description: "Dashboard and settings", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "No review posted on new pull requests",
        scope: "partial",
        signal: "PRs opened minutes ago have no CodeRabbit summary or comments, across repositories",
        quickCheck: "Comment '@coderabbitai review' on the PR; if it stays silent everywhere, the review service is backed up",
      },
      {
        pattern: "Reviews posted with a long delay",
        scope: "partial",
        signal: "Comments arrive tens of minutes late during busy periods",
        quickCheck: "Wait; the queue drains on its own — do not re-trigger on every PR",
      },
      {
        pattern: "Integration stopped after a permission change",
        scope: "local",
        signal: "One organisation or repository no longer gets reviews",
        quickCheck: "Check the app installation and repository access in the provider settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CodeRabbit reviews are down",
        alternative: "Qodo, Bito AI or Codacy AI (monitored on DownForAI) provide automated PR reviews",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab / Bitbucket / Azure DevOps APIs", "Third-party model providers"],
    operatorNotes: [],
  },
  codesandbox: {
    slug: "codesandbox",
    providerSummary:
      "CodeSandbox provides cloud development environments (Devboxes and the classic browser sandboxes) with AI assistance, running on hosted VMs. Its failures are about VMs not starting, previews not loading or the editor disconnecting rather than a static site being down.",
    docsUrl: "https://codesandbox.io/docs",
    pricingUrl: "https://codesandbox.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "codesandbox.io editor", description: "Browser editor", criticality: "critical" },
      { name: "Devbox VMs", description: "Cloud environments", criticality: "critical" },
      { name: "Preview / sandbox hosting", description: "csb.app previews", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Devbox stuck on 'starting'",
        scope: "partial",
        signal: "Environments never boot or disconnect repeatedly while the dashboard loads",
        quickCheck: "Restart the Devbox once; if boots fail for every project, VM capacity is degraded — check CodeSandbox's status page",
      },
      {
        pattern: "Previews not loading",
        scope: "partial",
        signal: "The editor works but preview URLs time out or show an error",
        quickCheck: "Open the preview in a new tab; a preview-only failure is the hosting layer",
      },
      {
        pattern: "AI features unavailable",
        scope: "partial",
        signal: "AI chat or completions error inside an otherwise working editor",
        quickCheck: "Keep working without AI; the model layer is independent of the VMs",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CodeSandbox environments will not start",
        alternative: "StackBlitz (Bolt) or Gitpod Flex (monitored on DownForAI) offer browser-based development environments",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "CodeSandbox publishes its own status page; DownForAI currently probes codesandbox.io only.",
    ],
  },
  "codium-ai": {
    slug: "codium-ai",
    providerSummary:
      "CodiumAI, now Qodo, provides AI test generation (Qodo Gen), code review (Qodo Merge) and a CLI, through IDE extensions and Git integrations. This entry follows the original codium.ai brand; the product and its backend are Qodo's.",
    docsUrl: "https://docs.qodo.ai",
    pricingUrl: "https://www.qodo.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "IDE extensions (Qodo Gen)", description: "Test generation in the editor", criticality: "critical" },
      { name: "Qodo Merge", description: "PR review integration", criticality: "high" },
      { name: "codium.ai / qodo.ai", description: "Websites", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Test generation hangs in the extension",
        scope: "partial",
        signal: "The 'generate tests' action spins without output for any file",
        quickCheck: "Try a tiny function; a universal hang is the generation backend, not the codebase size",
      },
      {
        pattern: "PR review not posted",
        scope: "partial",
        signal: "Qodo Merge does not comment on new pull requests",
        quickCheck: "Invoke the review command in a PR comment; if it stays silent, the review service is degraded",
      },
      {
        pattern: "Extension logged out or plan not recognised",
        scope: "local",
        signal: "Features gated as free although the account is paid",
        quickCheck: "Sign out and in again from the extension",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Qodo generation is down",
        alternative: "GitHub Copilot or Cursor (monitored on DownForAI) can draft unit tests from a prompt",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab / Bitbucket APIs", "Third-party model providers"],
    operatorNotes: [
      "Two DB entries (codium-ai, codiumai) and the qodo entry all describe the same product line.",
    ],
  },
  codiumai: {
    slug: "codiumai",
    providerSummary:
      "CodiumAI (second entry for the same product, now marketed as Qodo) focuses on code integrity: behaviour analysis, test suggestions and PR review agents. Its backend is Qodo's cloud; the IDE extension and Git app are the surfaces users experience.",
    docsUrl: "https://docs.qodo.ai",
    pricingUrl: "https://www.qodo.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Qodo cloud backend", description: "Analysis and generation", criticality: "critical" },
      { name: "IDE extension", description: "In-editor features", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Behaviour analysis never completes",
        scope: "partial",
        signal: "The analysis panel stays loading for every file",
        quickCheck: "Retry on a small file; a universal stall is backend-side",
      },
      {
        pattern: "Extension cannot reach the service",
        scope: "local",
        signal: "Network or proxy errors in the extension output while the website loads",
        quickCheck: "Check corporate proxy or firewall rules for the extension's endpoints",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "The CodiumAI/Qodo extension is unusable",
        alternative: "Cursor or GitHub Copilot (monitored on DownForAI) cover test drafting and code explanations",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [
      "Duplicate of codium-ai in the DB; see the qodo entry for the current brand.",
    ],
  },
  "cognition-labs": {
    slug: "cognition-labs",
    providerSummary:
      "Cognition Labs is the company behind Devin, the autonomous software-engineering agent (and, since 2025, the owner of Windsurf). This entry tracks the company site (cognition.ai, now cognition.com); the product itself is monitored as Devin.",
    docsUrl: "https://docs.devin.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "cognition.com", description: "Company website", criticality: "low" },
      { name: "Devin (app.devin.ai)", description: "The product, tracked separately", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Devin sessions stalling",
        scope: "partial",
        signal: "Tasks stay in 'working' without progress across sessions",
        quickCheck: "Check the Devin page on DownForAI and Cognition's status page; the company site says nothing about the agent",
      },
      {
        pattern: "Company site unreachable",
        scope: "global",
        signal: "cognition.com times out or errors",
        quickCheck: "Irrelevant to Devin users; the app runs on separate infrastructure",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Devin is unavailable",
        alternative: "Claude Code, Cursor or Factory AI (monitored on DownForAI) run autonomous coding tasks",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "cognition.ai redirects to cognition.com; use the devin entry for the actual service status.",
    ],
  },
  "cosine-genie": {
    slug: "cosine-genie",
    providerSummary:
      "Cosine's Genie is an autonomous software-engineering agent that works from issues and pull requests on large codebases, delivered through a web app and Git integrations. Runs are long and stateful, so incidents look like agents that never finish rather than a site being down.",
    docsUrl: "https://cosine.sh",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "cosine.sh web app", description: "Task creation and review", criticality: "critical" },
      { name: "Agent execution backend", description: "Long-running Genie sessions", criticality: "critical" },
      { name: "Git integrations", description: "Repository access and PR creation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent runs stuck without progress",
        scope: "partial",
        signal: "Tasks remain 'in progress' for far longer than usual with no new steps in the log",
        quickCheck: "Start a trivial task; if it also stalls, execution capacity is degraded rather than your task being hard",
      },
      {
        pattern: "Pull request not created at the end of a run",
        scope: "local",
        signal: "The run reports success but no PR appears in the repository",
        quickCheck: "Check the Git integration permissions for the repository; re-authorise if the token expired",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Genie is unavailable",
        alternative: "Devin (Cognition), Claude Code or Factory AI (monitored on DownForAI) run comparable autonomous coding tasks",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab APIs"],
    operatorNotes: [],
  },
  "factory-ai": {
    slug: "factory-ai",
    providerSummary:
      "Factory provides 'Droids': AI agents for coding, review, documentation and incident work, delivered via a web platform, a CLI and Git/Slack integrations for enterprise teams. Failures typically hit one Droid type or one integration rather than the whole platform.",
    docsUrl: "https://docs.factory.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.factory.ai", description: "Web platform", criticality: "critical" },
      { name: "Droid execution", description: "Agent runs", criticality: "critical" },
      { name: "Integrations", description: "GitHub, Slack, Jira connectors", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Droid runs queue or time out",
        scope: "partial",
        signal: "Agent sessions wait to start or stop mid-run across projects",
        quickCheck: "Run a small task from the CLI; if it also waits, execution capacity is the issue",
      },
      {
        pattern: "Integration events not processed",
        scope: "local",
        signal: "PR or issue events no longer trigger the expected Droid",
        quickCheck: "Check the integration's health in settings and re-authorise if needed",
      },
      {
        pattern: "Model provider errors surfaced in runs",
        scope: "partial",
        signal: "Runs fail with upstream 429/5xx messages in the log",
        quickCheck: "Switch the configured model for the Droid if your plan allows; the failure is the provider's",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Factory is down",
        alternative: "Claude Code, Devin (Cognition) or Cosine Genie (monitored on DownForAI) can execute agentic coding tasks",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab APIs", "Slack and Jira APIs", "Third-party model providers"],
    operatorNotes: [],
  },
  "github-models": {
    slug: "github-models",
    providerSummary:
      "GitHub Models is GitHub's catalogue and playground for AI models with a free-tier inference API keyed by a GitHub token. It runs on GitHub's platform (and Azure-hosted models behind it), so it follows GitHub's status page and per-model rate limits.",
    officialStatusUrl: "https://www.githubstatus.com",
    docsUrl: "https://docs.github.com/en/github-models",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "github.com/marketplace/models", description: "Catalogue and playground", criticality: "high" },
      { name: "Models inference endpoint", description: "API used with a GitHub token", criticality: "critical" },
      { name: "GitHub authentication", description: "Token validity and scopes", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "429 on the free-tier inference API",
        scope: "local",
        signal: "Requests rejected with rate-limit errors after a burst; the playground still works",
        quickCheck: "Free-tier limits are per model and per minute/day; wait or move production traffic to a paid provider",
      },
      {
        pattern: "A specific model unavailable",
        scope: "partial",
        signal: "One model errors or is missing from the catalogue while others respond",
        quickCheck: "Pick another model; single-model gaps come from the upstream provider (Azure, OpenAI, Meta)",
      },
      {
        pattern: "GitHub-wide incident",
        scope: "global",
        signal: "githubstatus.com reports degraded API or Actions — Models fails with it",
        quickCheck: "Check githubstatus.com; nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "GitHub Models is rate-limited or down",
        alternative: "OpenAI API, Anthropic API or Together AI (monitored on DownForAI) serve the same or comparable models with production quotas",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["GitHub platform", "Azure AI model hosting"],
    operatorNotes: [],
  },
  "gitlab-duo": {
    slug: "gitlab-duo",
    providerSummary:
      "GitLab Duo is the set of AI features inside GitLab (code suggestions, chat, merge-request summaries, agents), served for GitLab.com by GitLab's AI gateway and for self-managed instances via the same gateway or self-hosted models. Duo can fail while GitLab itself is healthy.",
    officialStatusUrl: "https://status.gitlab.com/",
    docsUrl: "https://docs.gitlab.com/ee/user/gitlab_duo/",
    pricingUrl: "https://about.gitlab.com/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "GitLab AI gateway", description: "Backend for Duo features", criticality: "critical" },
      { name: "GitLab.com", description: "Platform hosting the features", criticality: "critical" },
      { name: "IDE extensions", description: "Code suggestions in VS Code / JetBrains", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Code suggestions stop in the IDE",
        scope: "partial",
        signal: "The extension shows Duo as unavailable or suggestions never appear, while git operations work",
        quickCheck: "Check status.gitlab.com for an AI-gateway incident; confirm the extension is authenticated to the right instance",
      },
      {
        pattern: "Duo Chat returns errors",
        scope: "partial",
        signal: "Chat in the GitLab UI fails with a generic error although merge requests load",
        quickCheck: "Retry later; an AI-only failure is the gateway or an upstream model provider",
      },
      {
        pattern: "Features missing for your group",
        scope: "local",
        signal: "Duo options are absent for some users or projects",
        quickCheck: "Have an owner verify Duo seat assignment and group-level AI settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "GitLab Duo is unavailable",
        alternative: "GitHub Copilot, Cursor or Sourcegraph Cody (monitored on DownForAI) work inside the editor independently of GitLab",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers behind the AI gateway"],
    operatorNotes: [],
  },
  "gitpod-flex": {
    slug: "gitpod-flex",
    providerSummary:
      "Gitpod (rebranded Ona in 2025) provides cloud development environments that can run on Gitpod's infrastructure or in your own cloud with the Flex architecture, plus AI agents. Environment start-up and the control plane are the surfaces that fail.",
    docsUrl: "https://www.gitpod.io/docs",
    pricingUrl: "https://www.gitpod.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Control plane (app.gitpod.io / ona.com)", description: "Dashboard and orchestration", criticality: "critical" },
      { name: "Environment runners", description: "Where workspaces execute", criticality: "critical" },
      { name: "Editor connections", description: "VS Code / JetBrains remote sessions", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Environments stuck starting",
        scope: "partial",
        signal: "Workspaces never reach 'running' or fail during image pull",
        quickCheck: "Check Gitpod's status page; if your organisation uses self-hosted runners, check that cloud account first",
      },
      {
        pattern: "Editor disconnects from a running environment",
        scope: "partial",
        signal: "VS Code loses the remote connection repeatedly while the dashboard shows the environment running",
        quickCheck: "Reconnect from the dashboard; repeated drops for everyone point at the control plane's tunnelling",
      },
      {
        pattern: "Runner in your own cloud offline",
        scope: "local",
        signal: "Only environments on a specific runner fail",
        quickCheck: "Inspect the runner's status in the dashboard and the cloud account quotas",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gitpod environments will not start",
        alternative: "CodeSandbox or StackBlitz (Bolt) (monitored on DownForAI) provide browser-based dev environments",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Customer cloud accounts for self-hosted runners"],
    operatorNotes: [
      "gitpod.io docs and pricing now redirect to ona.com; DownForAI still probes gitpod.io.",
    ],
  },
  "groq-api": {
    slug: "groq-api",
    providerSummary:
      "The Groq API (console.groq.com) serves open-weight models on Groq's LPU hardware with very low latency and strict per-model rate limits. Developers see failures as 429s and 503s per model, published on Groq's status page.",
    officialStatusUrl: "https://status.groq.com/",
    docsUrl: "https://console.groq.com/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.groq.com", description: "Inference API", criticality: "critical" },
      { name: "console.groq.com", description: "Keys, usage, playground", criticality: "high" },
      { name: "Per-model capacity", description: "Models can be degraded individually", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "429 rate limits per model",
        scope: "local",
        signal: "Requests rejected with rate-limit errors on one model while the status page is green",
        quickCheck: "Check the tokens-per-minute and requests-per-day limits for that model in the console; switch model or upgrade tier",
      },
      {
        pattern: "503 or elevated latency on a specific model",
        scope: "partial",
        signal: "A single model (often the largest) returns 503 or slows down while others stay fast",
        quickCheck: "Check status.groq.com; route to another model in the meantime",
      },
      {
        pattern: "Model deprecated or renamed",
        scope: "local",
        signal: "Requests fail with a 'model not found' error after previously working",
        quickCheck: "Consult the models list in the docs; Groq retires model IDs on a schedule",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Groq is rate-limited or degraded",
        alternative: "Together AI, Fireworks AI or Cerebras (monitored on DownForAI) serve the same open models with different capacity",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The groq entry on DownForAI covers the company site; this entry is the developer console and API.",
    ],
  },
  "hume-ai": {
    slug: "hume-ai",
    providerSummary:
      "Hume AI offers an Empathic Voice Interface (EVI) and expression-measurement APIs for voice and vision, used through WebSocket and REST endpoints plus a web platform. Real-time voice sessions are the sensitive part: latency or disconnects show up before any outright outage.",
    docsUrl: "https://dev.hume.ai",
    pricingUrl: "https://www.hume.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "EVI WebSocket API", description: "Real-time voice conversations", criticality: "critical" },
      { name: "Expression measurement API", description: "Batch and streaming analysis", criticality: "high" },
      { name: "platform.hume.ai", description: "Keys, configs and playground", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "EVI sessions disconnect or lag",
        scope: "partial",
        signal: "WebSocket sessions drop or responses arrive late while REST calls succeed",
        quickCheck: "Start a session from the platform playground; if it also lags, the voice service is degraded",
      },
      {
        pattern: "Batch jobs stuck in queue",
        scope: "partial",
        signal: "Expression measurement jobs stay queued far longer than usual",
        quickCheck: "Submit a tiny file; a universal wait is backend capacity",
      },
      {
        pattern: "Credit or plan limits reached",
        scope: "local",
        signal: "Requests refused with a usage message for your account",
        quickCheck: "Check usage on the platform before assuming an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Hume EVI is down",
        alternative: "Vapi or Bland AI (monitored on DownForAI) can carry voice conversations; ElevenLabs covers speech synthesis",
        switchingCost: "high",
        note: "Emotion measurement has no direct substitute",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "katalon-ai": {
    slug: "katalon-ai",
    providerSummary:
      "Katalon is a test-automation platform (Studio, TestOps, TestCloud) with AI features for test creation and self-healing, combining a desktop IDE with cloud execution and reporting. Incidents usually concern TestCloud runs or TestOps dashboards, not the Studio app itself.",
    docsUrl: "https://docs.katalon.com",
    pricingUrl: "https://katalon.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "TestOps", description: "Cloud reporting and orchestration", criticality: "critical" },
      { name: "TestCloud", description: "Cloud test execution", criticality: "critical" },
      { name: "Katalon Studio", description: "Desktop IDE with AI assistants", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "TestCloud executions queued or failing to start",
        scope: "partial",
        signal: "Runs sit in queue or fail before the first step, unrelated to the application under test",
        quickCheck: "Run the same suite locally in Studio; a cloud-only failure isolates TestCloud",
      },
      {
        pattern: "Results not appearing in TestOps",
        scope: "partial",
        signal: "Local or CI runs finish but reports never upload",
        quickCheck: "Check the upload logs; if uploads fail for all projects, TestOps ingestion is degraded",
      },
      {
        pattern: "Studio licence activation failing",
        scope: "local",
        signal: "Studio cannot activate or refresh its licence online",
        quickCheck: "Confirm the account and licence in TestOps; offline activation is available for enterprise plans",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Katalon cloud services are down",
        alternative: "Mabl, Applitools or LambdaTest KaneAI (monitored on DownForAI) offer cloud test execution",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "lambdatest-kane": {
    slug: "lambdatest-kane",
    providerSummary:
      "KaneAI is LambdaTest's AI test agent: tests are described in natural language, generated and executed on LambdaTest's cloud grid across browsers and devices. It depends on the wider LambdaTest platform, so grid incidents affect KaneAI runs.",
    docsUrl: "https://www.lambdatest.com/kane-ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "KaneAI web app", description: "Test authoring", criticality: "critical" },
      { name: "LambdaTest cloud grid", description: "Execution on real browsers and devices", criticality: "critical" },
      { name: "HyperExecute / CI integrations", description: "Orchestrated runs", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Test generation from natural language stalls",
        scope: "partial",
        signal: "The agent accepts the instruction but produces no steps for any test",
        quickCheck: "Try a one-step instruction; a universal stall is the generation backend",
      },
      {
        pattern: "Executions waiting for a grid slot",
        scope: "partial",
        signal: "Runs stay queued because browsers or devices are unavailable",
        quickCheck: "Check LambdaTest's status page for grid capacity; queueing is platform-wide, not KaneAI-specific",
      },
      {
        pattern: "Concurrency limit reached",
        scope: "local",
        signal: "New runs queue only for your organisation",
        quickCheck: "Check the plan's parallel-session limit in the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "KaneAI or the LambdaTest grid is down",
        alternative: "Mabl, Katalon AI or Testers.ai (monitored on DownForAI) offer AI-assisted cloud testing",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["LambdaTest platform"],
    operatorNotes: [
      "LambdaTest publishes its own status page; DownForAI probes the KaneAI product page only.",
    ],
  },
  mabl: {
    slug: "mabl",
    providerSummary:
      "mabl is a low-code, AI-assisted test-automation platform for web, mobile and API testing, with a desktop Trainer app and cloud execution plus CI integrations. Its incidents concentrate on cloud runs and result processing.",
    docsUrl: "https://help.mabl.com",
    pricingUrl: "https://www.mabl.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "mabl cloud execution", description: "Test runs", criticality: "critical" },
      { name: "app.mabl.com", description: "Workspace and results", criticality: "high" },
      { name: "mabl Trainer", description: "Desktop authoring app", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud runs queued or failing at start",
        scope: "partial",
        signal: "Plans stay queued or fail before reaching the application under test",
        quickCheck: "Run the same test with the local runner; a cloud-only failure isolates mabl's execution fleet",
      },
      {
        pattern: "Results delayed or missing in the workspace",
        scope: "partial",
        signal: "Runs complete but outputs, screenshots or insights arrive late",
        quickCheck: "Wait; processing backlogs clear on their own — escalate if results from hours ago are still missing",
      },
      {
        pattern: "Trainer cannot sign in",
        scope: "local",
        signal: "The desktop app loops on login while the web workspace works",
        quickCheck: "Sign out, update the Trainer and sign in again; check SSO settings with your admin",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "mabl cloud is down",
        alternative: "Katalon AI, Applitools or LambdaTest KaneAI (monitored on DownForAI) can run automated tests in the cloud",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["CI providers", "Jira / Slack integrations"],
    operatorNotes: [],
  },
  "magic-dev": {
    slug: "magic-dev",
    providerSummary:
      "Magic is an AI research company building long-context code models and an AI software engineer, with limited public product access to date. There is little user-facing surface to fail; the website and any early-access endpoints are what can be observed.",
    docsUrl: "https://magic.dev",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "magic.dev", description: "Website", criticality: "low" },
      { name: "Early-access product", description: "Where available", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "magic.dev times out or errors",
        quickCheck: "Nothing to do for most users; there is no broadly available product depending on it",
      },
      {
        pattern: "Early-access endpoint errors",
        scope: "local",
        signal: "Invited users see API or app errors",
        quickCheck: "Report through the early-access channel; no public status page exists",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need an AI coding agent today",
        alternative: "Claude Code, Cursor or Devin (Cognition) (monitored on DownForAI) are generally available",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Limited public product: DownForAI's probe of magic.dev is mostly informational.",
    ],
  },
  marscode: {
    slug: "marscode",
    providerSummary:
      "MarsCode was ByteDance's AI coding assistant and cloud IDE; it has been folded into Trae (the IDE) and the Trae plugin, and its documentation now redirects to Trae's. Users of the old brand are effectively using Trae's backend.",
    docsUrl: "https://docs.marscode.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "marscode.com", description: "Legacy website", criticality: "low" },
      { name: "Trae plugin / IDE backend", description: "Where completions now run", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Old MarsCode extension no longer completes",
        scope: "local",
        signal: "The legacy extension errors or shows deprecation notices",
        quickCheck: "Install the Trae plugin or IDE; the MarsCode backend has been migrated",
      },
      {
        pattern: "Cloud IDE workspaces unavailable",
        scope: "global",
        signal: "The former MarsCode cloud IDE cannot be opened",
        quickCheck: "Expected after the product change; use Trae or another cloud IDE",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "MarsCode features are gone",
        alternative: "Trae (monitored on DownForAI) is the successor; GitHub Copilot or Cursor cover the same assistant use case",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Trae (ByteDance)"],
    operatorNotes: [
      "docs.marscode.com redirects to docs.trae.ai; the trae-ide entry tracks the live product.",
    ],
  },
  mindsdb: {
    slug: "mindsdb",
    providerSummary:
      "MindsDB is an open-source AI data layer that connects models to databases through SQL, available self-hosted (Docker) or as MindsDB Cloud. Self-hosted users are affected only by model-provider outages; cloud users also depend on MindsDB's hosted service.",
    docsUrl: "https://docs.mindsdb.com",
    communityLinks: [
      { type: "github", url: "https://github.com/mindsdb/mindsdb", label: "mindsdb/mindsdb", verified: true },
    ],
    monitoredSurfaces: [
      { name: "MindsDB Cloud", description: "Hosted instances", criticality: "high" },
      { name: "Self-hosted server", description: "Runs on the user's infrastructure", criticality: "medium" },
      { name: "Connected model providers", description: "OpenAI, Anthropic and others called from SQL", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model queries fail with provider errors",
        scope: "local",
        signal: "SELECT statements against a model return 401/429/5xx from the underlying provider",
        quickCheck: "Check the provider's status and the API key stored in the integration; MindsDB relays the error",
      },
      {
        pattern: "Cloud instance unreachable",
        scope: "partial",
        signal: "The cloud editor or API endpoint times out while self-hosted users are fine",
        quickCheck: "Confirm from the GitHub issues or community; self-hosting is the immediate workaround",
      },
      {
        pattern: "Data source connection failing",
        scope: "local",
        signal: "Queries to a connected database error while models respond",
        quickCheck: "Test the database credentials outside MindsDB; network or firewall changes are the usual cause",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "MindsDB Cloud is down",
        alternative: "LangChain or LlamaIndex (monitored on DownForAI) cover model-to-data orchestration in code; MindsDB itself can be self-hosted from the GitHub repository",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers called from SQL", "Connected databases"],
    operatorNotes: [],
  },
  mintlify: {
    slug: "mintlify",
    providerSummary:
      "Mintlify hosts developer documentation sites generated from Markdown/MDX, with AI chat over the docs, deployed from Git pushes. When it fails, customer docs sites stop deploying or go down together, which is why it has its own status page.",
    officialStatusUrl: "https://status.mintlify.com/",
    docsUrl: "https://mintlify.com/docs",
    pricingUrl: "https://mintlify.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Hosted docs sites", description: "Customer documentation domains", criticality: "critical" },
      { name: "Deployment pipeline", description: "Builds from Git pushes", criticality: "high" },
      { name: "Dashboard", description: "Project management", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Docs deploys stuck or failing",
        scope: "partial",
        signal: "Pushes do not update the live site; the dashboard shows builds queued or errored for every project",
        quickCheck: "Check status.mintlify.com; the live site keeps serving the last successful build",
      },
      {
        pattern: "Hosted docs sites returning errors",
        scope: "global",
        signal: "Multiple customer docs domains return 5xx at once",
        quickCheck: "Confirm on the status page; nothing to fix in your repository",
      },
      {
        pattern: "AI chat over docs not answering",
        scope: "partial",
        signal: "The docs site loads but the AI assistant errors",
        quickCheck: "An AI-only failure is the model layer; the documentation itself is unaffected",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Mintlify hosting is down",
        alternative: "Vercel (monitored on DownForAI) can host a static export of the Markdown in minutes while Mintlify recovers",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub for source pushes"],
    operatorNotes: [],
  },
  "openai-api": {
    slug: "openai-api",
    providerSummary:
      "The OpenAI API (platform.openai.com) is the developer surface for GPT, embeddings, audio and image models, with the Platform console for keys, usage and billing. Developers experience incidents as HTTP errors — 429 rate limits, 500/503 and elevated latency — reported per model on OpenAI's status page.",
    officialStatusUrl: "https://status.openai.com",
    docsUrl: "https://platform.openai.com/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.openai.com", description: "Chat, responses, embeddings, audio, images", criticality: "critical" },
      { name: "Platform console", description: "Keys, usage, billing", criticality: "high" },
      { name: "Per-model availability", description: "Models degrade individually", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "5xx or timeouts on one model family",
        scope: "partial",
        signal: "Errors concentrate on a specific model while others respond; status.openai.com lists a component incident",
        quickCheck: "Fall back to another model in code and retry with backoff",
      },
      {
        pattern: "429 rate limit or quota exceeded",
        scope: "local",
        signal: "Requests rejected with 429 and rate-limit headers, or 'insufficient_quota' when prepaid credits run out",
        quickCheck: "Check usage and limits in the Platform console; top up or request a higher tier",
      },
      {
        pattern: "Elevated latency without errors",
        scope: "partial",
        signal: "Time-to-first-token rises to many seconds; long completions time out client-side",
        quickCheck: "Stream responses and raise timeouts; confirm latency is flagged on the status page",
      },
      {
        pattern: "Console login or billing page failing while the API works",
        scope: "partial",
        signal: "platform.openai.com errors on sign-in; existing keys keep working",
        quickCheck: "Continue with existing keys; the console and the API are separate systems",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "OpenAI API is degraded",
        alternative: "Anthropic API, Google AI Studio or Mistral (monitored on DownForAI) can absorb routed traffic behind a provider abstraction",
        switchingCost: "medium",
        note: "Azure OpenAI serves the same models on separate capacity",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The openai and chatgpt pages on DownForAI cover the same status page; this entry is the developer-facing view.",
    ],
  },
  pearai: {
    slug: "pearai",
    providerSummary:
      "PearAI is an open-source AI code editor built on VS Code that bundles tools like Continue and Cline behind a single subscription and its own model router. Failures come from the router/backend or from the extensions it wraps, not from the editor binary.",
    docsUrl: "https://trypear.ai",
    communityLinks: [
      { type: "github", url: "https://github.com/trypear/pearai-app", label: "trypear/pearai-app", verified: true },
    ],
    monitoredSurfaces: [
      { name: "PearAI server / router", description: "Model access for subscribers", criticality: "critical" },
      { name: "trypear.ai", description: "Website and account", criticality: "medium" },
      { name: "Bundled extensions", description: "Chat, agent and search features", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Chat errors on the PearAI model router",
        scope: "partial",
        signal: "Requests through the PearAI subscription fail while a personal API key in the same editor works",
        quickCheck: "Switch the provider to your own key temporarily; the router backend is degraded",
      },
      {
        pattern: "Sign-in or subscription not recognised",
        scope: "local",
        signal: "The editor shows a free state after paying, or login redirects fail",
        quickCheck: "Log out and in from the editor; confirm the account email matches",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "PearAI's backend is down",
        alternative: "Cursor or Continue (monitored on DownForAI) with your own API key provide the same editor workflow",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers behind the router"],
    operatorNotes: [
      "trypear.ai/docs answered 402 (hosting paused) when this entry was written; the docs link points to the main site.",
    ],
  },
  pieces: {
    slug: "pieces",
    providerSummary:
      "Pieces for Developers is a desktop app with IDE and browser plugins that captures snippets and workflow context and offers an on-device or cloud copilot over it. Because the core runs locally (PiecesOS), most failures are local-service problems rather than an outage.",
    docsUrl: "https://docs.pieces.app",
    pricingUrl: "https://pieces.app/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "PiecesOS (local)", description: "Background service on the user's machine", criticality: "critical" },
      { name: "Cloud models / sync", description: "Optional hosted features", criticality: "medium" },
      { name: "pieces.app", description: "Website and downloads", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Plugins cannot connect to PiecesOS",
        scope: "local",
        signal: "IDE or browser extensions report the local service as unreachable",
        quickCheck: "Restart PiecesOS from the desktop app; check that another process is not blocking its port",
      },
      {
        pattern: "Cloud model responses failing while local models work",
        scope: "partial",
        signal: "Copilot answers only when an on-device model is selected",
        quickCheck: "Switch to a local model; the cloud path is degraded",
      },
      {
        pattern: "Long-term memory capture stalls",
        scope: "local",
        signal: "Workstream activity stops being captured after an update",
        quickCheck: "Update PiecesOS and the app to matching versions",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Pieces cloud features are down",
        alternative: "Cursor or GitHub Copilot (monitored on DownForAI) cover the code-chat use case; Pieces' on-device models keep working meanwhile",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers for cloud models"],
    operatorNotes: [],
  },
  "poolside-ai": {
    slug: "poolside-ai",
    providerSummary:
      "Poolside builds foundation models for software engineering and sells them primarily to enterprises and governments for deployment in their own environments. There is little public-facing surface: incidents are contractual and internal rather than visible on a status page.",
    docsUrl: "https://www.poolside.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "poolside.ai", description: "Website", criticality: "low" },
      { name: "Customer deployments", description: "Private, per-customer", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "poolside.ai times out or errors",
        quickCheck: "No user-facing product depends on it; nothing to do",
      },
      {
        pattern: "Private deployment issues",
        scope: "local",
        signal: "Enterprise users see errors in their own environment",
        quickCheck: "Go through the customer support channel; no public status exists",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a generally available coding model",
        alternative: "Anthropic API, OpenAI API or Mistral (monitored on DownForAI) offer public code-capable models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Enterprise-only product: DownForAI's probe of poolside.ai is informational.",
    ],
  },
  qodo: {
    slug: "qodo",
    providerSummary:
      "Qodo (formerly CodiumAI) is a code-integrity platform: Qodo Gen in the IDE for tests and chat, Qodo Merge for pull-request review, and a CLI for agents. Its failures land on the review pipeline (silent PRs) or the extension backend.",
    docsUrl: "https://docs.qodo.ai",
    pricingUrl: "https://www.qodo.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Qodo Merge", description: "PR review comments", criticality: "critical" },
      { name: "Qodo Gen (IDE)", description: "Tests and chat in the editor", criticality: "critical" },
      { name: "Qodo cloud backend", description: "Shared inference and analysis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "PR reviews not posted",
        scope: "partial",
        signal: "New pull requests receive no Qodo Merge comments across repositories",
        quickCheck: "Invoke /review in a PR comment; if nothing happens anywhere, the review service is degraded",
      },
      {
        pattern: "Test generation hangs in the IDE",
        scope: "partial",
        signal: "Generate-tests spins for any file",
        quickCheck: "Try a tiny function; a universal hang is backend-side",
      },
      {
        pattern: "Seat or plan not recognised",
        scope: "local",
        signal: "Features gated as free for a paid organisation member",
        quickCheck: "Sign out and in; ask the admin to verify seat assignment",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Qodo is down",
        alternative: "CodeRabbit or Bito AI (monitored on DownForAI) can review PRs; GitHub Copilot drafts tests in the editor",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab / Bitbucket APIs", "Third-party model providers"],
    operatorNotes: [
      "codium-ai and codiumai are older DB entries for the same product.",
    ],
  },
  "railway-ai": {
    slug: "railway-ai",
    providerSummary:
      "Railway is a deployment platform (services, databases, cron) with AI-assisted features, running on Railway's own infrastructure across regions. Incidents are typically deploys failing to build or start, or regional networking problems, and are published on its status page.",
    officialStatusUrl: "https://railway.instatus.com/",
    docsUrl: "https://docs.railway.com",
    pricingUrl: "https://railway.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Railway dashboard / API", description: "Control plane", criticality: "critical" },
      { name: "Build pipeline", description: "Nixpacks / Docker builds", criticality: "critical" },
      { name: "Regional runtime", description: "Deployed services and databases", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Builds failing or queued platform-wide",
        scope: "partial",
        signal: "Deploys stay 'building' or fail at the same step across projects",
        quickCheck: "Check the status page; redeploying the last good build usually works once the incident clears",
      },
      {
        pattern: "Services unreachable in one region",
        scope: "partial",
        signal: "Deployed apps time out for users in a region while the dashboard works",
        quickCheck: "Check the status page for the region; consider a temporary region change for the service",
      },
      {
        pattern: "Usage limit or billing hold",
        scope: "local",
        signal: "Deploys blocked or services paused for your account only",
        quickCheck: "Check the billing page; a resource limit is not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Railway is down",
        alternative: "Render AI or Vercel (monitored on DownForAI) can host the same containers or web services",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub for source deploys"],
    operatorNotes: [],
  },
  "refact-ai": {
    slug: "refact-ai",
    providerSummary:
      "Refact.ai is an open-source AI coding agent and assistant with a cloud plan and a self-hosted server option, delivered as IDE plugins. Cloud users depend on Refact's inference; self-hosters depend on their own GPU server.",
    docsUrl: "https://docs.refact.ai",
    communityLinks: [
      { type: "github", url: "https://github.com/smallcloudai/refact", label: "smallcloudai/refact", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Refact cloud inference", description: "Hosted completions and agent", criticality: "critical" },
      { name: "IDE plugins", description: "VS Code and JetBrains", criticality: "high" },
      { name: "Self-hosted server", description: "User-run inference", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud completions stop while self-hosted users are fine",
        scope: "partial",
        signal: "The plugin shows connection errors to the cloud endpoint",
        quickCheck: "Point the plugin at a self-hosted server if you have one; otherwise wait for the cloud to recover",
      },
      {
        pattern: "Agent tool calls failing",
        scope: "partial",
        signal: "Chat works but agent actions (file edits, commands) error",
        quickCheck: "Update the plugin; agent features evolve quickly and mismatched versions break tool calls",
      },
      {
        pattern: "Self-hosted server out of GPU memory",
        scope: "local",
        signal: "Completions fail only for users of your own server",
        quickCheck: "Check the server logs and load a smaller model",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Refact cloud is down",
        alternative: "Tabby or Continue (monitored on DownForAI) run open models locally; GitHub Copilot is the hosted fallback",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "docs.refact.ai currently redirects to the project's GitHub wiki.",
    ],
  },
  "render-ai": {
    slug: "render-ai",
    providerSummary:
      "Render is a cloud hosting platform for web services, workers, databases and static sites, deployed from Git, with AI features around deployment assistance. Its incidents concern builds, deploys and regional runtime and are published on an Atlassian status page.",
    officialStatusUrl: "https://status.render.com",
    docsUrl: "https://render.com/docs",
    pricingUrl: "https://render.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Render dashboard / API", description: "Control plane", criticality: "critical" },
      { name: "Build and deploy pipeline", description: "Git-triggered builds", criticality: "critical" },
      { name: "Regional runtime", description: "Hosted services and databases", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Deploys stuck in progress or failing platform-wide",
        scope: "partial",
        signal: "Builds hang or fail at the same stage across services; status.render.com shows a deploy incident",
        quickCheck: "Wait for the incident, then trigger a manual deploy; live services keep serving the previous version",
      },
      {
        pattern: "Services unreachable in one region",
        scope: "partial",
        signal: "Apps in a region return errors or time out while the dashboard works",
        quickCheck: "Check the region component on the status page",
      },
      {
        pattern: "Free-tier service spun down",
        scope: "local",
        signal: "The first request after idle takes tens of seconds",
        quickCheck: "Expected on free instances; upgrade the instance type to avoid spin-down",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Render is down",
        alternative: "Railway AI or Vercel (monitored on DownForAI) can host the same services from the same repository",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab for source deploys"],
    operatorNotes: [],
  },
  rytr: {
    slug: "rytr",
    providerSummary:
      "Rytr is an AI writing assistant (web app and browser extension) for marketing copy, emails and short-form content, with character-based plans. It relays to third-party language models, so most generation failures originate upstream.",
    docsUrl: "https://rytr.me",
    pricingUrl: "https://rytr.me/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.rytr.me", description: "Editor and templates", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
      { name: "Browser extension", description: "In-page writing", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations fail or return empty text",
        scope: "partial",
        signal: "Every template errors or produces nothing while the editor loads",
        quickCheck: "Try a short template; a universal failure is the model relay",
      },
      {
        pattern: "Monthly character limit reached",
        scope: "local",
        signal: "Generation refused with a plan message for your account",
        quickCheck: "Check usage in account settings; limits reset monthly",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Rytr is down",
        alternative: "Copy.ai or Writesonic (monitored on DownForAI) cover the same marketing-copy use case",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "Categorised under Dev in DownForAI's database although it is a general writing tool.",
    ],
  },
  sindarin: {
    slug: "sindarin",
    providerSummary:
      "Sindarin provides a voice-AI SDK (Persona) for adding real-time conversational agents to apps and websites, with a dashboard to configure personas. Failures show up as sessions that will not connect or speech that lags, inside the customer's own product.",
    docsUrl: "https://docs.sindarin.tech",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Persona real-time API", description: "Voice sessions", criticality: "critical" },
      { name: "Dashboard", description: "Persona configuration and keys", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Voice sessions fail to start",
        scope: "partial",
        signal: "The SDK cannot open a session for any persona while the dashboard loads",
        quickCheck: "Test from the dashboard's demo; if it fails there too, the real-time backend is down",
      },
      {
        pattern: "High latency or choppy speech",
        scope: "partial",
        signal: "Responses lag several seconds or audio stutters across sessions",
        quickCheck: "Check the user's network first; if all users lag, the speech pipeline is saturated",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sindarin is down",
        alternative: "Vapi, Bland AI or Hume AI (monitored on DownForAI) provide real-time voice agent APIs",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Speech-to-text, LLM and TTS providers behind the pipeline"],
    operatorNotes: [],
  },
  "snyk-code-ai": {
    slug: "snyk-code-ai",
    providerSummary:
      "Snyk Code is Snyk's static analysis engine with AI-generated fixes (DeepCode AI), used through the Snyk web app, CLI, IDE plugins and Git integrations. Scans run in Snyk's cloud, so incidents look like scans that never finish or PR checks stuck pending.",
    officialStatusUrl: "https://status.snyk.io",
    docsUrl: "https://docs.snyk.io",
    pricingUrl: "https://snyk.io/plans/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.snyk.io", description: "Web app and API", criticality: "critical" },
      { name: "Scan engine", description: "Code analysis and AI fixes", criticality: "critical" },
      { name: "Git and CI integrations", description: "PR checks and pipeline steps", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "PR checks stuck pending",
        scope: "partial",
        signal: "Snyk status checks never report on new pull requests across repositories",
        quickCheck: "Check status.snyk.io; retest the project from the web app once the incident is resolved",
      },
      {
        pattern: "CLI or IDE scans failing to upload",
        scope: "partial",
        signal: "snyk code test errors with server messages although the code is unchanged",
        quickCheck: "Retry with --debug; a server-side error for everyone is an incident, a 401 is your token",
      },
      {
        pattern: "AI fix suggestions unavailable",
        scope: "partial",
        signal: "Issues are found but the fix button errors",
        quickCheck: "The fix generator is a separate component; the scan results remain valid",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Snyk Code is down",
        alternative: "Codacy AI or Sourcery (monitored on DownForAI) can run code-quality scans; keep dependency scanning in your CI with local tools",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab / Bitbucket / Azure DevOps APIs"],
    operatorNotes: [],
  },
  sourcery: {
    slug: "sourcery",
    providerSummary:
      "Sourcery is an AI code reviewer and refactoring assistant for GitHub and GitLab pull requests, with IDE plugins for in-editor suggestions. Reviews run in Sourcery's cloud on webhook events, so its incidents are quiet PRs.",
    docsUrl: "https://docs.sourcery.ai",
    pricingUrl: "https://sourcery.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Review service", description: "PR reviews and summaries", criticality: "critical" },
      { name: "Git integrations", description: "GitHub / GitLab apps", criticality: "critical" },
      { name: "IDE plugins", description: "In-editor refactoring", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "No review on new pull requests",
        scope: "partial",
        signal: "PRs opened minutes ago have no Sourcery comments, across repositories",
        quickCheck: "Trigger a review with the @sourcery-ai command; if it stays silent everywhere, the service is degraded",
      },
      {
        pattern: "Reviews delayed",
        scope: "partial",
        signal: "Comments arrive much later than usual during busy periods",
        quickCheck: "Wait; re-triggering adds to the queue",
      },
      {
        pattern: "Repository not covered after a permission change",
        scope: "local",
        signal: "One repository stopped receiving reviews",
        quickCheck: "Check the app installation and repository access on the Git provider",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sourcery is down",
        alternative: "CodeRabbit, Qodo or Codacy AI (monitored on DownForAI) can review pull requests",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab APIs", "Third-party model providers"],
    operatorNotes: [],
  },
  stackblitz: {
    slug: "stackblitz",
    providerSummary:
      "StackBlitz runs full-stack development environments in the browser with WebContainers, and is the company behind Bolt.new. This entry covers the StackBlitz editor and project hosting; Bolt is tracked separately.",
    docsUrl: "https://developer.stackblitz.com",
    pricingUrl: "https://stackblitz.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "stackblitz.com editor", description: "Browser IDE", criticality: "critical" },
      { name: "WebContainers runtime", description: "In-browser Node runtime", criticality: "critical" },
      { name: "Project hosting / previews", description: "Shared project URLs", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Projects fail to boot in the browser",
        scope: "partial",
        signal: "The editor loads but the dev server never starts or install steps hang",
        quickCheck: "Try in a private window without extensions; if projects fail everywhere, check StackBlitz's status page",
      },
      {
        pattern: "Preview not loading",
        scope: "partial",
        signal: "The editor works but the preview pane errors",
        quickCheck: "Open the preview in a new tab; a preview-only failure is the hosting layer",
      },
      {
        pattern: "Browser incompatibility mistaken for an outage",
        scope: "local",
        signal: "Projects work in Chrome but not in another browser",
        quickCheck: "WebContainers need modern browser features; use Chrome/Edge or check the compatibility list",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "StackBlitz is down",
        alternative: "CodeSandbox or Gitpod Flex (monitored on DownForAI) provide browser-based environments",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Bolt.new is monitored separately on DownForAI; a StackBlitz incident can affect both.",
    ],
  },
  starcoder: {
    slug: "starcoder",
    providerSummary:
      "StarCoder is the BigCode project's family of open code models hosted on Hugging Face. Like Code Llama, there is no single provider to be down: availability means the Hugging Face hub for downloads and whichever inference provider serves the model.",
    docsUrl: "https://github.com/bigcode-project/starcoder",
    communityLinks: [
      { type: "github", url: "https://github.com/bigcode-project/starcoder", label: "bigcode-project/starcoder", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Hugging Face model page", description: "Weights and model card", criticality: "medium" },
      { name: "Inference providers", description: "Hosted StarCoder endpoints", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Hugging Face hub slow or down",
        scope: "partial",
        signal: "Downloads stall and the model page errors",
        quickCheck: "Check Hugging Face's status; use a local cache or mirror",
      },
      {
        pattern: "Hosted endpoint errors",
        scope: "local",
        signal: "Your provider's StarCoder endpoint returns 5xx or is cold",
        quickCheck: "Check the provider's status; switch to another host serving the model",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "StarCoder is unavailable from your provider",
        alternative: "Hugging Face, Together AI or Replicate (monitored on DownForAI) host open code models; CodeLlama is a comparable model",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub", "Inference providers"],
    operatorNotes: [
      "DownForAI probes the Hugging Face model page, which reflects the hub rather than any inference capacity.",
    ],
  },
  sudowrite: {
    slug: "sudowrite",
    providerSummary:
      "Sudowrite is an AI writing tool for fiction authors with features like Write, Rewrite and Story Bible, sold on credit-based plans. It relays prompts to several third-party models, so a single model failing usually leaves other features working.",
    docsUrl: "https://docs.sudowrite.com",
    pricingUrl: "https://www.sudowrite.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.sudowrite.com", description: "Editor and Story Bible", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations fail on one model or feature",
        scope: "partial",
        signal: "Write works but a specific feature or model selection errors",
        quickCheck: "Switch the model in settings; a single-model failure is the upstream provider",
      },
      {
        pattern: "Credits consumed but no output",
        scope: "local",
        signal: "The balance drops while the generation errored",
        quickCheck: "Refresh and check the history; contact support with the timestamp if the text is missing",
      },
      {
        pattern: "Editor slow or not saving",
        scope: "partial",
        signal: "Autosave indicator stuck; documents lag for everyone",
        quickCheck: "Copy your current text locally, then wait; a universal save stall is backend-side",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sudowrite is down",
        alternative: "NovelAI or DreamGen (monitored on DownForAI) offer AI-assisted fiction writing",
        switchingCost: "medium",
        note: "Story Bible data must be exported manually",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "Categorised under Dev in DownForAI's database although it targets fiction authors.",
    ],
  },
  "supabase-ai": {
    slug: "supabase-ai",
    providerSummary:
      "Supabase is a hosted Postgres platform with auth, storage, edge functions and an AI SQL assistant in the dashboard. Projects run per region on shared infrastructure, so incidents are regional or component-specific and are reported on an Atlassian status page.",
    officialStatusUrl: "https://status.supabase.com",
    docsUrl: "https://supabase.com/docs",
    pricingUrl: "https://supabase.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Project databases (regional)", description: "Postgres and PostgREST APIs", criticality: "critical" },
      { name: "Auth", description: "GoTrue authentication", criticality: "critical" },
      { name: "Dashboard / AI assistant", description: "Management UI", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Database or API unreachable in one region",
        scope: "partial",
        signal: "Projects in a region time out or error while others are fine",
        quickCheck: "Check status.supabase.com for the region component",
      },
      {
        pattern: "Auth failing while the database works",
        scope: "partial",
        signal: "Sign-ins fail across apps but direct queries succeed",
        quickCheck: "Check the Auth component on the status page; nothing to fix in your app",
      },
      {
        pattern: "Project paused or over quota",
        scope: "local",
        signal: "A free project is paused after inactivity or a limit is hit",
        quickCheck: "Restore the project from the dashboard; this is not an outage",
      },
      {
        pattern: "Dashboard AI assistant not answering",
        scope: "partial",
        signal: "The SQL assistant errors while the dashboard and database work",
        quickCheck: "Keep working without it; the AI layer is independent of your project",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Supabase is down in your region",
        alternative: "Railway AI or Render AI (monitored on DownForAI) can host a Postgres instance; restore from a backup if needed",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  supermaven: {
    slug: "supermaven",
    providerSummary:
      "Supermaven is a fast AI code-completion extension with a very large context window, available for VS Code, JetBrains and Neovim; the team joined Cursor in late 2024 but the product remains available. Completions come from Supermaven's servers, so latency and auth are the failure points.",
    docsUrl: "https://supermaven.com",
    pricingUrl: "https://supermaven.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Completion servers", description: "Inline suggestion backend", criticality: "critical" },
      { name: "IDE extensions", description: "VS Code, JetBrains, Neovim", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Suggestions stop appearing",
        scope: "partial",
        signal: "No completions across files; the extension log shows connection errors",
        quickCheck: "Restart the extension; if the log keeps showing server errors, the backend is down",
      },
      {
        pattern: "Free tier limited or account state wrong",
        scope: "local",
        signal: "The extension reports a free/limited state for a paid user",
        quickCheck: "Sign out and in from the extension",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Supermaven is down",
        alternative: "Cursor, GitHub Copilot or Tabnine (monitored on DownForAI) provide inline completions",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "swe-agent": {
    slug: "swe-agent",
    providerSummary:
      "SWE-agent is an open-source research agent (Princeton) that lets a language model fix GitHub issues autonomously inside a sandbox. It is software you run, not a hosted service: its 'availability' is the model API you configure and the container runtime on your machine.",
    docsUrl: "https://swe-agent.com/latest/",
    communityLinks: [
      { type: "github", url: "https://github.com/SWE-agent/SWE-agent", label: "SWE-agent/SWE-agent", verified: true },
    ],
    monitoredSurfaces: [
      { name: "swe-agent.com", description: "Documentation site", criticality: "low" },
      { name: "Configured model API", description: "OpenAI, Anthropic or others", criticality: "critical" },
      { name: "Local container runtime", description: "Docker sandbox", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Runs fail with model API errors",
        scope: "local",
        signal: "Rate-limit or 5xx errors from the configured provider in the run log",
        quickCheck: "Check the provider's status and your key; SWE-agent only relays",
      },
      {
        pattern: "Sandbox container fails to start",
        scope: "local",
        signal: "Errors about Docker or the image before the agent acts",
        quickCheck: "Verify Docker is running and pull the image again",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a hosted autonomous agent instead",
        alternative: "Claude Code, Devin (Cognition) or Sweep.dev (monitored on DownForAI) run issue-to-PR workflows as a service",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers", "Docker"],
    operatorNotes: [
      "DownForAI probes the documentation site only; there is no hosted SWE-agent service to be down.",
    ],
  },
  "sweep-dev": {
    slug: "sweep-dev",
    providerSummary:
      "Sweep is an AI developer tool that turns GitHub issues into pull requests and, more recently, a JetBrains plugin for agentic edits. The GitHub app runs in Sweep's cloud on issue events, so incidents look like issues that never get a PR.",
    docsUrl: "https://sweep.dev",
    communityLinks: [
      { type: "github", url: "https://github.com/sweepai/sweep", label: "sweepai/sweep", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Sweep GitHub app", description: "Issue-to-PR pipeline", criticality: "critical" },
      { name: "JetBrains plugin backend", description: "Agent edits in the IDE", criticality: "high" },
      { name: "sweep.dev", description: "Website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Issue labelled 'sweep' gets no response",
        scope: "partial",
        signal: "No comment or PR appears after the usual minutes, across repositories",
        quickCheck: "Re-add the label on a small issue; if Sweep stays silent everywhere, the app backend is down",
      },
      {
        pattern: "PR created but checks or edits incomplete",
        scope: "partial",
        signal: "The PR opens with partial changes or Sweep stops mid-task",
        quickCheck: "Reply to Sweep in the PR to continue; repeated stops are backend capacity",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sweep is down",
        alternative: "Claude Code or Devin (Cognition) (monitored on DownForAI) can take an issue to a pull request",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub API", "Third-party model providers"],
    operatorNotes: [
      "docs.sweep.dev answered 402 (hosting paused) when this entry was written; the docs link points to the main site.",
    ],
  },
  tabby: {
    slug: "tabby",
    providerSummary:
      "Tabby (TabbyML) is a self-hosted, open-source coding assistant: you run the Tabby server on your own GPU or CPU and connect IDE extensions to it. tabby.tabbyml.com only hosts the docs, so any outage is your own server or its hardware.",
    docsUrl: "https://tabby.tabbyml.com/docs/",
    communityLinks: [
      { type: "github", url: "https://github.com/TabbyML/tabby", label: "TabbyML/tabby", verified: true },
    ],
    monitoredSurfaces: [
      { name: "tabby.tabbyml.com", description: "Documentation site", criticality: "low" },
      { name: "Your Tabby server", description: "Self-hosted inference", criticality: "critical" },
      { name: "IDE extensions", description: "Connect to the server", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Extension cannot reach the server",
        scope: "local",
        signal: "Connection refused or timeouts in the extension while the server URL is correct",
        quickCheck: "Check the server process and firewall; hit the server's /v1/health endpoint",
      },
      {
        pattern: "Slow completions on CPU or a small GPU",
        scope: "local",
        signal: "Suggestions arrive seconds late",
        quickCheck: "Use a smaller model or enable GPU acceleration; this is capacity on your side",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your Tabby server is down",
        alternative: "Continue or Ollama (monitored on DownForAI) offer another local setup; GitHub Copilot is the hosted fallback",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Two DB entries exist (tabby and tabby-ml); both refer to TabbyML's self-hosted assistant. DownForAI probes the docs site only.",
    ],
  },
  "tabby-ml": {
    slug: "tabby-ml",
    providerSummary:
      "TabbyML's Tabby (second entry, tabby.ml) is the open-source, self-hosted alternative to Copilot with code completion, chat and repository context, run as a server you control. There is no hosted inference from TabbyML, so incidents are local.",
    docsUrl: "https://tabby.tabbyml.com/docs/",
    communityLinks: [
      { type: "github", url: "https://github.com/TabbyML/tabby", label: "TabbyML/tabby", verified: true },
    ],
    monitoredSurfaces: [
      { name: "tabby.ml", description: "Product website", criticality: "low" },
      { name: "Self-hosted server", description: "Completion and chat backend you run", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Server fails after an upgrade",
        scope: "local",
        signal: "The Tabby container or binary exits on start after updating",
        quickCheck: "Read the startup log; model cache or config format changes between versions are the usual cause",
      },
      {
        pattern: "Repository context not indexed",
        scope: "local",
        signal: "Chat ignores your codebase although the repository is configured",
        quickCheck: "Check the indexing job status in the admin UI and re-run it",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your Tabby deployment is broken",
        alternative: "Refact.ai or Continue (monitored on DownForAI) support self-hosted or local models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Duplicate of the tabby entry; both describe TabbyML's self-hosted assistant.",
    ],
  },
  "testers-ai": {
    slug: "testers-ai",
    providerSummary:
      "Testers.ai is an AI QA service that crawls a web application, generates and runs tests and reports defects continuously from its cloud. Incidents surface as test runs that stop or reports that stop arriving rather than a dashboard being down.",
    docsUrl: "https://testers.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "testers.ai platform", description: "Projects and reports", criticality: "critical" },
      { name: "Test execution cloud", description: "Crawling and test runs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Scheduled runs not executing",
        scope: "partial",
        signal: "No new reports since the last schedule, across projects",
        quickCheck: "Start a manual run; if it also stays queued, the execution backend is down",
      },
      {
        pattern: "Runs failing on the target site rather than Testers.ai",
        scope: "local",
        signal: "Only one project fails, with navigation or login errors",
        quickCheck: "Check the tested application and its test credentials first",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Testers.ai is down",
        alternative: "Mabl, Katalon AI or BlinqIO (monitored on DownForAI) provide AI-assisted test automation",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "trae-ide": {
    slug: "trae-ide",
    providerSummary:
      "Trae is ByteDance's AI-native IDE (and a plugin for VS Code/JetBrains) with chat, a Builder agent and bundled access to frontier models on ByteDance-hosted infrastructure. Its failures are model capacity or sign-in, and they can be region-dependent.",
    docsUrl: "https://docs.trae.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Trae IDE / plugin", description: "Client", criticality: "high" },
      { name: "Model backend", description: "Bundled model access", criticality: "critical" },
      { name: "Sign-in", description: "Account authentication", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model responses throttled or unavailable at peak",
        scope: "partial",
        signal: "Chat and Builder return capacity or queue messages; a different bundled model may still answer",
        quickCheck: "Switch model in the picker; if all models fail, the backend is saturated",
      },
      {
        pattern: "Sign-in failing or region not supported",
        scope: "local",
        signal: "Login loops or the app reports the region is unavailable",
        quickCheck: "Confirm regional availability for your account; try a different sign-in provider",
      },
      {
        pattern: "Builder agent stalls mid-task",
        scope: "partial",
        signal: "Autonomous tasks stop producing edits while chat works",
        quickCheck: "Cancel and rerun on a smaller scope; persistent stalls are backend-side",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Trae's backend is unavailable",
        alternative: "Cursor, Kiro or GitHub Copilot (monitored on DownForAI) run on independent infrastructure",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers bundled by ByteDance"],
    operatorNotes: [
      "MarsCode, ByteDance's previous product, redirects to Trae and has its own entry.",
    ],
  },
  "val-town": {
    slug: "val-town",
    providerSummary:
      "Val Town is a social platform for writing and deploying small TypeScript functions ('vals') as HTTP endpoints, crons and email handlers, with an AI assistant (Townie). Deployed vals run on Val Town's runtime, so an incident takes down customer endpoints along with the editor.",
    officialStatusUrl: "https://status.val.town/",
    docsUrl: "https://docs.val.town",
    pricingUrl: "https://www.val.town/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "val.town editor and API", description: "Authoring and management", criticality: "high" },
      { name: "Val runtime", description: "HTTP, cron and email vals", criticality: "critical" },
      { name: "Townie", description: "AI assistant", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "HTTP vals returning 5xx or timing out",
        scope: "global",
        signal: "Deployed endpoints fail for every user; status.val.town shows a runtime incident",
        quickCheck: "Check the status page; nothing to redeploy",
      },
      {
        pattern: "Cron vals not firing",
        scope: "partial",
        signal: "Scheduled vals skip runs while HTTP vals work",
        quickCheck: "Check the val's run log; missed schedules during an incident are not retried automatically",
      },
      {
        pattern: "Townie not answering",
        scope: "partial",
        signal: "The AI assistant errors while editing and running vals works",
        quickCheck: "Keep editing manually; the AI layer is independent of the runtime",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Val Town's runtime is down",
        alternative: "Vercel or Railway AI (monitored on DownForAI) can host the same TypeScript function as a serverless endpoint",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "warp-ai": {
    slug: "warp-ai",
    providerSummary:
      "Warp is a terminal (macOS, Linux, Windows) with built-in AI: command suggestions, an agent mode and natural-language input. The terminal works offline; only the AI features depend on Warp's cloud, so a Warp AI incident never stops shell commands from running.",
    docsUrl: "https://docs.warp.dev",
    pricingUrl: "https://www.warp.dev/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Warp AI backend", description: "Agent mode and suggestions", criticality: "critical" },
      { name: "Warp app", description: "Terminal client", criticality: "medium" },
      { name: "Warp Drive sync", description: "Shared workflows and notebooks", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI requests fail while the terminal works",
        scope: "partial",
        signal: "Agent mode or suggestions return an error; commands execute normally",
        quickCheck: "Retry later; the AI backend is separate from the shell",
      },
      {
        pattern: "AI request limit reached",
        scope: "local",
        signal: "AI features refused with a quota message for your account",
        quickCheck: "Check the plan's monthly AI request limit in settings",
      },
      {
        pattern: "Sign-in required loop",
        scope: "local",
        signal: "Warp keeps asking to log in after an update",
        quickCheck: "Sign out and in again; check that the browser hand-off completed",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Warp AI is down",
        alternative: "Claude Code or GitHub Copilot (monitored on DownForAI) can assist with commands from the editor or CLI",
        switchingCost: "low",
        note: "The Warp terminal itself keeps working",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  zed: {
    slug: "zed",
    providerSummary:
      "Zed is a high-performance open-source code editor with built-in AI assistance and agentic editing, using Zed's hosted models (subscription) or your own API keys, plus real-time collaboration. The editor is local; only AI and collaboration touch Zed's servers.",
    docsUrl: "https://zed.dev/docs",
    pricingUrl: "https://zed.dev/pricing",
    communityLinks: [
      { type: "github", url: "https://github.com/zed-industries/zed", label: "zed-industries/zed", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Zed AI / model relay", description: "Hosted model access", criticality: "critical" },
      { name: "Collaboration servers", description: "Channels and shared projects", criticality: "medium" },
      { name: "zed.dev", description: "Website and releases", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI requests fail on Zed's hosted models",
        scope: "partial",
        signal: "The assistant errors while a personal API key configured in settings works",
        quickCheck: "Switch the provider to your own key; the relay backend is degraded",
      },
      {
        pattern: "Collaboration disconnected",
        scope: "partial",
        signal: "Channels and shared projects show offline while editing locally works",
        quickCheck: "Wait and reconnect; collaboration is independent of the editor",
      },
      {
        pattern: "Plan limits reached",
        scope: "local",
        signal: "AI usage refused with a quota message for your account",
        quickCheck: "Check usage on the account page or add your own API key",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Zed AI is down",
        alternative: "Cursor or Continue (monitored on DownForAI) provide editor-integrated AI; Zed itself keeps working for editing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers behind the relay"],
    operatorNotes: [],
  },
};
