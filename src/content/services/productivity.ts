import type { TopServiceContent } from "@/content/top-services/types";

// PRODUCTIVITY — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start productivity-2.ts and register it in ./index.ts if it grows.
export const PRODUCTIVITY: Record<string, TopServiceContent> = {
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
  grammarly: {
    slug: "grammarly",
    providerSummary:
      "AI writing assistant. Grammar, tone, clarity. Deeply integrated in browsers, Docs, email. Large enterprise footprint.",
    officialStatusUrl: "https://status.grammarly.com",
    docsUrl: "https://support.grammarly.com",
    pricingUrl: "https://www.grammarly.com/plans",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "grammarly.com", description: "Web editor", criticality: "critical" },
      { name: "Browser Extension", description: "Chrome/Firefox/Safari extension", criticality: "critical" },
      { name: "Desktop App", description: "Mac and Windows app", criticality: "high" },
      { name: "Enterprise API", description: "API for enterprise integrations", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Browser extension not activating",
        scope: "local",
        signal: "Extension icon missing or suggestions not showing",
        quickCheck: "Disable and re-enable the extension; update to latest version",
      },
      {
        pattern: "Document editor lag",
        scope: "global",
        signal: "Suggestions slow to appear or editor unresponsive",
        quickCheck: "Check status.grammarly.com; try web app directly",
      },
      {
        pattern: "Enterprise SSO issues",
        scope: "local",
        signal: "Enterprise login fails",
        quickCheck: "Check with IT; try email login fallback",
      },
      {
        pattern: "AI rewrite feature delays",
        scope: "global",
        signal: "Rewrite and rephrase take unusually long",
        quickCheck: "Check status for AI features specifically",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Grammarly is degraded",
        alternative:
          "LanguageTool, Hemingway Editor, or ProWritingAid can reduce downtime for writing checks",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Most 'Grammarly is down' reports are browser extension issues — disabling and re-enabling the extension is the first troubleshoot step.",
    ],
  },
  jasper: {
    slug: "jasper",
    providerSummary:
      "AI content platform for marketing teams. Blog posts, social media, ad copy, brand voice.",
    officialStatusUrl: "https://status.jasper.ai",
    docsUrl: "https://support.jasper.ai",
    pricingUrl: "https://www.jasper.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "jasper.ai", description: "Web editor", criticality: "critical" },
      { name: "Chrome Extension", description: "Jasper browser extension", criticality: "high" },
      { name: "API", description: "Jasper content generation API", criticality: "high" },
      { name: "Brand Voice Engine", description: "Brand voice training and application", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Upstream model failures",
        scope: "global",
        signal: "Jasper generation fails (uses OpenAI/Anthropic underneath)",
        quickCheck: "Check status.jasper.ai; also check OpenAI and Anthropic status",
      },
      {
        pattern: "Brand voice inconsistency",
        scope: "local",
        signal: "Generated content doesn't match trained brand voice",
        quickCheck: "Retrain brand voice; may be a model update issue",
      },
      {
        pattern: "Chrome extension sync issues",
        scope: "local",
        signal: "Extension not loading or out of sync",
        quickCheck: "Reinstall extension; update to latest version",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Jasper is degraded",
        alternative:
          "Copy.ai, Writer.com, or ChatGPT can reduce downtime for content generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "airtable-ai": {
    slug: "airtable-ai",
    providerSummary:
      "Airtable's AI features (AI fields, Omni, app building) run inside the Airtable platform, so they inherit Airtable's availability and per-plan AI credit limits. Incidents are published on Airtable's Atlassian status page.",
    officialStatusUrl: "https://status.airtable.com",
    docsUrl: "https://support.airtable.com",
    pricingUrl: "https://airtable.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "airtable.com platform", description: "Bases and interfaces", criticality: "critical" },
      { name: "AI fields / Omni", description: "AI features", criticality: "high" },
      { name: "Automations", description: "Scheduled and triggered runs", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI fields stuck generating",
        scope: "partial",
        signal: "AI cells show 'generating' indefinitely while the base works",
        quickCheck: "Regenerate one cell; if none complete, the AI service is degraded — check status.airtable.com",
      },
      {
        pattern: "AI credits exhausted",
        scope: "local",
        signal: "AI features refused with a credit message for your workspace",
        quickCheck: "Check the workspace's AI credit usage",
      },
      {
        pattern: "Platform-wide degradation",
        scope: "global",
        signal: "Bases load slowly or automations delay; the status page lists an incident",
        quickCheck: "Check the status page; nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Airtable AI is unavailable",
        alternative: "Notion AI or Coda AI (monitored on DownForAI) offer AI inside collaborative databases",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Airtable platform", "Third-party model providers"],
    operatorNotes: [],
  },
  "any-do-ai": {
    slug: "any-do-ai",
    providerSummary:
      "Any.do is a task manager and planner (mobile, web, desktop) with AI features for task suggestions and planning, on freemium plans. Sync and AI features depend on Any.do's cloud; the apps keep working offline for basic tasks.",
    docsUrl: "https://support.any.do",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Any.do apps and web", description: "Clients", criticality: "critical" },
      { name: "Sync backend", description: "Task synchronisation", criticality: "critical" },
      { name: "AI features", description: "Suggestions and planning", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tasks not syncing between devices",
        scope: "partial",
        signal: "Changes on one device do not appear on others",
        quickCheck: "Force a sync from settings; if all devices lag, the sync backend is degraded",
      },
      {
        pattern: "AI features not responding while tasks work",
        scope: "partial",
        signal: "AI suggestions error; manual tasks save",
        quickCheck: "Keep working manually; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Any.do is down",
        alternative: "Motion, Taskade or Reclaim.ai (monitored on DownForAI) offer AI-assisted task management",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "atlassian-ai": {
    slug: "atlassian-ai",
    providerSummary:
      "Atlassian Intelligence (now largely branded Rovo) is the set of AI features across Jira, Confluence and other Atlassian Cloud products: summaries, natural-language search, agents. It depends on Atlassian Cloud and its AI platform, whose incidents are published on Atlassian's status page.",
    officialStatusUrl: "https://status.atlassian.com",
    docsUrl: "https://www.atlassian.com/platform/ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Atlassian Cloud (Jira, Confluence)", description: "Host products", criticality: "critical" },
      { name: "Atlassian Intelligence / Rovo", description: "AI features and agents", criticality: "high" },
      { name: "Atlassian identity", description: "Login and permissions", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI features missing or erroring in Jira or Confluence",
        scope: "partial",
        signal: "Summaries and Rovo chat fail while issues and pages load",
        quickCheck: "Confirm an admin has enabled Atlassian Intelligence for the site; if enabled and failing everywhere, the AI platform is degraded",
      },
      {
        pattern: "Product-wide incident",
        scope: "global",
        signal: "Jira or Confluence themselves are slow or down; AI fails with them",
        quickCheck: "Check status.atlassian.com; nothing to fix locally",
      },
      {
        pattern: "Feature not available on your plan or region",
        scope: "local",
        signal: "AI options absent for some sites",
        quickCheck: "Check plan eligibility and data-residency settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Atlassian Intelligence is unavailable",
        alternative: "Notion AI or ClickUp AI (monitored on DownForAI) offer AI summaries and search in comparable work tools",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Atlassian Cloud", "Third-party model providers"],
    operatorNotes: [
      "The DB website URL (atlassian.com/platform/ai) answered 404 when this entry was written; Atlassian moved the marketing pages under Rovo.",
    ],
  },
  avoma: {
    slug: "avoma",
    providerSummary:
      "Avoma is an AI meeting assistant for sales and customer teams: it records calls from Zoom, Meet and Teams, transcribes, summarises and syncs to CRMs. Its incidents are bots not joining and post-call processing delays.",
    docsUrl: "https://help.avoma.com",
    pricingUrl: "https://www.avoma.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Avoma notetaker", description: "Joins and records calls", criticality: "critical" },
      { name: "Processing backend", description: "Transcription and notes", criticality: "critical" },
      { name: "CRM integrations", description: "Salesforce, HubSpot sync", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notetaker does not join scheduled calls",
        scope: "partial",
        signal: "The bot misses meetings across users",
        quickCheck: "Check the calendar connection; a widespread no-show is the recording service",
      },
      {
        pattern: "Notes delayed after calls",
        scope: "partial",
        signal: "Recordings exist but summaries take hours",
        quickCheck: "Wait; processing queues clear on their own",
      },
      {
        pattern: "CRM sync failing",
        scope: "local",
        signal: "Notes do not reach the CRM",
        quickCheck: "Re-authorise the integration",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Avoma is down",
        alternative: "Fireflies.ai, Fathom or Grain AI (monitored on DownForAI) record and summarise meetings",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams", "CRMs"],
    operatorNotes: [],
  },
  chatpdf: {
    slug: "chatpdf",
    providerSummary:
      "ChatPDF lets users upload PDFs and ask questions about them, on a free tier with daily limits and a Plus plan, relaying to third-party language models. Upload processing and chat are the two failure points.",
    docsUrl: "https://www.chatpdf.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "chatpdf.com web app", description: "Upload and chat", criticality: "critical" },
      { name: "Processing and model relay", description: "Indexing and answers", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Uploads fail to process",
        scope: "partial",
        signal: "PDFs never become chattable, even small ones",
        quickCheck: "Try a one-page PDF; a universal failure is the indexing backend",
      },
      {
        pattern: "Daily free limit reached",
        scope: "local",
        signal: "Uploads or questions refused with a limit message",
        quickCheck: "Free accounts are capped per day; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ChatPDF is down",
        alternative: "Humata, NoteGPT or ChatGPT (monitored on DownForAI) answer questions about uploaded documents",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "clickup-ai": {
    slug: "clickup-ai",
    providerSummary:
      "ClickUp Brain is the AI layer inside ClickUp (writing, summaries, search, agents), sold as an add-on per seat. It runs on the ClickUp platform, whose incidents are published on ClickUp's status page.",
    officialStatusUrl: "https://status.clickup.com/",
    docsUrl: "https://help.clickup.com",
    pricingUrl: "https://clickup.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ClickUp platform", description: "Tasks, docs, chat", criticality: "critical" },
      { name: "ClickUp Brain", description: "AI features", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Brain answers failing while tasks work",
        scope: "partial",
        signal: "AI writing or summaries error; tasks and docs load",
        quickCheck: "Retry later; the AI layer is separate — check status.clickup.com",
      },
      {
        pattern: "Platform slowness",
        scope: "global",
        signal: "Lists and docs load slowly for everyone; the status page lists an incident",
        quickCheck: "Check the status page; nothing to fix locally",
      },
      {
        pattern: "Brain not enabled for your workspace",
        scope: "local",
        signal: "AI options absent or gated",
        quickCheck: "An owner must add the Brain add-on",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ClickUp AI is unavailable",
        alternative: "Notion AI, Monday AI or Taskade AI (monitored on DownForAI) offer AI inside work management",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["ClickUp platform", "Third-party model providers"],
    operatorNotes: [],
  },
  "clockwise-ai": {
    slug: "clockwise-ai",
    providerSummary:
      "Clockwise optimises team calendars with AI (focus time, meeting moves, Prism scheduling assistant) on top of Google Calendar and Microsoft 365. Its work happens through calendar APIs, so calendar-provider issues look like Clockwise failures.",
    docsUrl: "https://www.getclockwise.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "getclockwise.com app", description: "Web app", criticality: "critical" },
      { name: "Calendar sync", description: "Google / Microsoft calendar APIs", criticality: "critical" },
      { name: "Scheduling assistant", description: "AI planning", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Calendar changes not applied",
        scope: "partial",
        signal: "Optimisations or focus-time blocks stop appearing across users",
        quickCheck: "Check the calendar connection; if Google or Microsoft calendars are healthy and nothing applies, Clockwise's sync is degraded",
      },
      {
        pattern: "Scheduling assistant not answering",
        scope: "partial",
        signal: "Prism requests error while the calendar view works",
        quickCheck: "Retry later; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Clockwise is down",
        alternative: "Reclaim.ai or Motion (monitored on DownForAI) offer AI calendar scheduling",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Google Calendar / Microsoft 365 APIs"],
    operatorNotes: [],
  },
  "coda-ai": {
    slug: "coda-ai",
    providerSummary:
      "Coda is a collaborative docs and tables platform with Coda AI (writing, summaries, AI columns), now part of Grammarly/Superhuman. AI features run inside Coda's cloud and count against workspace AI credits.",
    docsUrl: "https://help.coda.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "coda.io", description: "Docs and tables", criticality: "critical" },
      { name: "Coda AI", description: "AI features", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI columns or assistant stuck",
        scope: "partial",
        signal: "AI outputs never populate while docs edit normally",
        quickCheck: "Retry one cell; if none complete, the AI service is degraded",
      },
      {
        pattern: "AI credits exhausted",
        scope: "local",
        signal: "AI features refused with a credit message for your workspace",
        quickCheck: "Check the workspace's AI usage",
      },
      {
        pattern: "Docs slow or failing to load",
        scope: "global",
        signal: "Pages and tables stall for everyone",
        quickCheck: "Check Coda's status page; nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Coda AI is unavailable",
        alternative: "Notion AI or Airtable AI (monitored on DownForAI) offer AI inside docs and databases",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [
      "coda.io/pricing now redirects to Superhuman's plans page after the acquisition.",
    ],
  },
  consensus: {
    slug: "consensus",
    providerSummary:
      "Consensus is an AI search engine over scientific papers with summaries and a 'consensus meter', on freemium plans. Search and AI synthesis are separate services, and the site sits behind bot protection.",
    docsUrl: "https://help.consensus.app",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "consensus.app", description: "Search UI", criticality: "critical" },
      { name: "Search index", description: "Paper retrieval", criticality: "critical" },
      { name: "AI synthesis", description: "Summaries and meter", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Results load but AI summaries fail",
        scope: "partial",
        signal: "Papers appear without the synthesis or meter",
        quickCheck: "Retry later; synthesis runs on a separate model service",
      },
      {
        pattern: "Search returns nothing",
        scope: "partial",
        signal: "Queries spin or error for everyone",
        quickCheck: "Try a simple query; a universal failure is the search backend",
      },
      {
        pattern: "AI credits exhausted on the free plan",
        scope: "local",
        signal: "AI features refused with a limit message for your account",
        quickCheck: "Free plans cap AI credits monthly",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Consensus is down",
        alternative: "SciSpace or Perplexity (monitored on DownForAI) search and summarise research",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [
      "consensus.app refuses automated requests, so DownForAI checks robots.txt reachability only.",
    ],
  },
  "craft-ai": {
    slug: "craft-ai",
    providerSummary:
      "Craft is a document and note-taking app (macOS, iOS, Windows, web) with an AI assistant for writing and summarising, on freemium plans. Documents sync through Craft's cloud; the AI assistant relays to third-party models.",
    docsUrl: "https://support.craft.do",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Craft apps and web", description: "Clients", criticality: "critical" },
      { name: "Sync backend", description: "Document synchronisation", criticality: "critical" },
      { name: "AI assistant", description: "Model relay", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Documents not syncing",
        scope: "partial",
        signal: "Edits on one device do not reach others",
        quickCheck: "Check the sync indicator; if all devices lag, the sync backend is degraded — local edits are preserved",
      },
      {
        pattern: "AI assistant failing while editing works",
        scope: "partial",
        signal: "AI requests error; documents edit and sync",
        quickCheck: "Retry later; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Craft AI is down",
        alternative: "Notion AI, Mem.ai or Tana (monitored on DownForAI) offer AI-assisted notes",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  "fathom-ai": {
    slug: "fathom-ai",
    providerSummary:
      "Fathom (this second DB entry tracks the same notetaker as the Audio-category one) joins video calls, records and summarises them, and pushes notes to CRMs; fathom.video redirects to fathom.ai. Failures are bots not joining and summaries not arriving.",
    docsUrl: "https://help.fathom.video",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Fathom notetaker", description: "Joins calls", criticality: "critical" },
      { name: "Summary backend", description: "Post-call processing", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notetaker missing from meetings",
        scope: "partial",
        signal: "Fathom does not join scheduled calls across users",
        quickCheck: "Check the calendar connection; a widespread no-show is the recording service",
      },
      {
        pattern: "Summaries not delivered",
        scope: "partial",
        signal: "Recordings exist but summaries never arrive",
        quickCheck: "Wait; summarisation queues behind transcription",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fathom is down",
        alternative: "Fireflies.ai, Otter.ai or Grain AI (monitored on DownForAI) record and summarise meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams"],
    operatorNotes: [
      "Duplicate of the fathom entry (Audio category); both follow the same service.",
    ],
  },
  "fellow-app-ai": {
    slug: "fellow-app-ai",
    providerSummary:
      "Fellow is a meeting-management platform (agendas, notes, action items) with an AI notetaker and recaps; fellow.app now redirects to fellow.ai. The notetaker joins video calls, so recording and post-call processing are the sensitive parts.",
    docsUrl: "https://help.fellow.app",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "fellow.ai web app", description: "Agendas and notes", criticality: "critical" },
      { name: "AI notetaker", description: "Joins and records calls", criticality: "critical" },
      { name: "Recap backend", description: "Summaries and action items", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notetaker not joining calls",
        scope: "partial",
        signal: "The bot misses scheduled meetings across users",
        quickCheck: "Check calendar and video-provider connections; a widespread no-show is the recording service",
      },
      {
        pattern: "Recaps delayed",
        scope: "partial",
        signal: "Recordings exist but recaps take hours",
        quickCheck: "Wait; processing queues clear on their own",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fellow is down",
        alternative: "Fathom, Fireflies.ai or MeetGeek (monitored on DownForAI) record and summarise meetings",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams", "Calendar providers"],
    operatorNotes: [
      "fellow.app redirects to fellow.ai; DownForAI's probe follows the redirect.",
    ],
  },
  "framer-ai": {
    slug: "framer-ai",
    providerSummary:
      "Framer is a website builder and design tool with AI features (site generation, copy, translation) and hosting on Framer's infrastructure. Two things can fail: the editor (and its AI) and the hosting of published sites, which affects visitors rather than designers.",
    docsUrl: "https://www.framer.com/help/",
    pricingUrl: "https://www.framer.com/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Framer editor", description: "Design and AI features", criticality: "high" },
      { name: "Framer hosting / CDN", description: "Published sites", criticality: "critical" },
      { name: "Publishing pipeline", description: "Deploys from the editor", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Published sites down or slow",
        scope: "global",
        signal: "Many Framer-hosted sites return errors at once",
        quickCheck: "Check Framer's status page; nothing to republish",
      },
      {
        pattern: "Publish stuck",
        scope: "partial",
        signal: "Publishing never completes across projects; live sites keep the last version",
        quickCheck: "Wait for the incident; the last successful publish stays online",
      },
      {
        pattern: "AI features failing while editing works",
        scope: "partial",
        signal: "AI generation errors; the canvas works",
        quickCheck: "Keep editing manually; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Framer is down",
        alternative: "Vercel (monitored on DownForAI) can host an exported site; Canva AI covers design-oriented pages",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Framer publishes its own status page; DownForAI probes framer.com only.",
    ],
  },
  "google-workspace-gemini": {
    slug: "google-workspace-gemini",
    providerSummary:
      "Gemini in Google Workspace adds AI to Gmail, Docs, Sheets, Meet and the Gemini side panel, subject to the Workspace edition and admin settings. It runs on Google's infrastructure and follows the Google Workspace status dashboard.",
    docsUrl: "https://workspace.google.com/solutions/ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Gemini side panel and features", description: "In Gmail, Docs, Sheets, Meet", criticality: "high" },
      { name: "Google Workspace", description: "Host applications", criticality: "critical" },
      { name: "Admin settings", description: "Feature availability", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Gemini features missing for some users",
        scope: "local",
        signal: "The side panel or 'Help me write' is absent",
        quickCheck: "An admin must enable Gemini features for the organisational unit; check the Workspace edition",
      },
      {
        pattern: "Gemini errors while Workspace apps work",
        scope: "partial",
        signal: "AI requests fail; email and docs work normally",
        quickCheck: "Check the Google Workspace status dashboard for a Gemini entry",
      },
      {
        pattern: "Workspace-wide incident",
        scope: "global",
        signal: "Gmail or Docs themselves degraded; Gemini fails with them",
        quickCheck: "Check the status dashboard; nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gemini in Workspace is unavailable",
        alternative: "Google Gemini or ChatGPT (monitored on DownForAI) cover drafting and summarising outside the apps",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Google Workspace", "Google Gemini platform"],
    operatorNotes: [],
  },
  "grain-ai": {
    slug: "grain-ai",
    providerSummary:
      "Grain records meetings, transcribes them and produces AI notes, highlights and CRM updates, on freemium plans. Its notetaker joins Zoom, Meet and Teams calls; recording and post-processing are separate services.",
    docsUrl: "https://support.grain.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Grain notetaker", description: "Joins and records calls", criticality: "critical" },
      { name: "Processing backend", description: "Transcripts, notes, highlights", criticality: "critical" },
      { name: "grain.com app", description: "Library and integrations", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notetaker does not join",
        scope: "partial",
        signal: "The bot misses scheduled calls across users",
        quickCheck: "Check the calendar connection; a widespread no-show is the recording service",
      },
      {
        pattern: "Notes delayed",
        scope: "partial",
        signal: "Recordings exist but notes take hours",
        quickCheck: "Wait; processing queues clear",
      },
      {
        pattern: "CRM sync failing",
        scope: "local",
        signal: "Notes do not reach HubSpot or Salesforce",
        quickCheck: "Re-authorise the integration",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Grain is down",
        alternative: "Fathom, Fireflies.ai or Avoma (monitored on DownForAI) record and summarise meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams", "CRMs"],
    operatorNotes: [],
  },
  granola: {
    slug: "granola",
    providerSummary:
      "Granola is an AI meeting notepad (macOS, Windows, iOS) that transcribes system audio without a bot and enhances your own notes afterwards, on freemium plans. Transcription is local capture plus cloud processing; enhancement uses third-party models.",
    docsUrl: "https://www.granola.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Granola desktop app", description: "Capture and notes", criticality: "critical" },
      { name: "Transcription / enhancement backend", description: "Cloud processing", criticality: "critical" },
      { name: "Sync", description: "Notes across devices", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Enhanced notes never generate",
        scope: "partial",
        signal: "Meetings end but the enhanced notes stay pending for everyone",
        quickCheck: "Your raw notes and transcript are kept; wait for the processing backend",
      },
      {
        pattern: "Audio not captured",
        scope: "local",
        signal: "No transcript for a meeting",
        quickCheck: "Check system audio and microphone permissions for Granola",
      },
      {
        pattern: "Free meetings quota reached",
        scope: "local",
        signal: "New meetings refused with a plan message",
        quickCheck: "Free plans cap meetings; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Granola is down",
        alternative: "Fathom, Otter.ai or Superwhisper (monitored on DownForAI) capture and transcribe meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  guidde: {
    slug: "guidde",
    providerSummary:
      "Guidde turns screen recordings into video documentation with AI voiceover and step descriptions, via a browser extension and web app on freemium plans. Capture happens in the browser; generation and rendering run in Guidde's cloud.",
    docsUrl: "https://help.guidde.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Browser extension", description: "Capture", criticality: "high" },
      { name: "guidde.com app", description: "Editor and library", criticality: "critical" },
      { name: "Generation backend", description: "Voiceover and video rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Recordings stuck processing",
        scope: "partial",
        signal: "Captures never turn into guides for anyone",
        quickCheck: "Record a 10-second guide; a universal stall is the generation backend",
      },
      {
        pattern: "Voiceover fails while steps generate",
        scope: "partial",
        signal: "Guides render silent or the voice step errors",
        quickCheck: "Switch voice; a single-voice failure is the speech provider",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Guidde is down",
        alternative: "Descript or Captions.ai (monitored on DownForAI) can produce narrated screen videos",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party speech providers"],
    operatorNotes: [],
  },
  "harpa-ai": {
    slug: "harpa-ai",
    providerSummary:
      "HARPA is a Chrome extension that brings AI (ChatGPT, Claude, Gemini and others) into any web page for summarising, monitoring and automation, with your own keys or HARPA's plans. It runs locally in the browser and relays to model providers.",
    docsUrl: "https://harpa.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Chrome extension", description: "Local automation", criticality: "critical" },
      { name: "HARPA cloud", description: "Account, plans, cloud monitoring", criticality: "high" },
      { name: "Model providers", description: "Relayed calls", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One model errors while others work",
        scope: "partial",
        signal: "Switching the model in HARPA restores answers",
        quickCheck: "Change model; the failure is the provider",
      },
      {
        pattern: "Automations break after a site changes",
        scope: "local",
        signal: "A page command stops finding elements",
        quickCheck: "Update the selectors; this is the target site",
      },
      {
        pattern: "Extension broken after a Chrome update",
        scope: "local",
        signal: "HARPA fails to load or loses settings",
        quickCheck: "Update the extension and re-login",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "HARPA is down",
        alternative: "Monica or Bardeen (monitored on DownForAI) offer AI browser extensions and automation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers", "Chrome"],
    operatorNotes: [
      "harpa.ai/docs answered 404 when this entry was written; the docs link points to the main site.",
    ],
  },
  humata: {
    slug: "humata",
    providerSummary:
      "Humata answers questions about uploaded documents (PDFs and more) with citations, on freemium plans, relaying to third-party models. Document indexing and chat are separate steps.",
    docsUrl: "https://www.humata.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.humata.ai", description: "Upload and chat", criticality: "critical" },
      { name: "Indexing and model relay", description: "Processing and answers", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Documents stuck processing",
        scope: "partial",
        signal: "Uploads never become queryable, even small files",
        quickCheck: "Try a one-page PDF; a universal stall is the indexing backend",
      },
      {
        pattern: "Free page or question limit reached",
        scope: "local",
        signal: "Uploads or questions refused with a limit message",
        quickCheck: "Free plans cap pages and questions; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Humata is down",
        alternative: "ChatPDF, NoteGPT or SciSpace (monitored on DownForAI) answer questions about documents",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "linear-ai": {
    slug: "linear-ai",
    providerSummary:
      "Linear is a project-management tool for software teams with AI features (issue triage, summaries, agents integration), on per-seat plans. It runs on Linear's cloud with real-time sync and publishes incidents on an Atlassian status page.",
    officialStatusUrl: "https://linearstatus.com",
    docsUrl: "https://linear.app/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "linear.app", description: "Web and desktop clients", criticality: "critical" },
      { name: "Real-time sync", description: "Issue updates", criticality: "critical" },
      { name: "Integrations and AI", description: "GitHub, Slack, agents", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Sync stalls or the app shows offline",
        scope: "global",
        signal: "Updates do not propagate; linearstatus.com lists an incident",
        quickCheck: "Check the status page; local changes queue and sync afterwards",
      },
      {
        pattern: "GitHub or Slack integration lagging",
        scope: "partial",
        signal: "PR links or Slack notifications arrive late",
        quickCheck: "Check the integration's status component and the other platform's health",
      },
      {
        pattern: "AI features failing while issues work",
        scope: "partial",
        signal: "Summaries or triage suggestions error",
        quickCheck: "Keep working manually; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Linear is down",
        alternative: "ClickUp AI or Monday AI (monitored on DownForAI) are comparable work-management tools",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab", "Slack"],
    operatorNotes: [],
  },
  macwhisper: {
    slug: "macwhisper",
    providerSummary:
      "MacWhisper is a native macOS app that transcribes audio locally with Whisper models (and optionally cloud models), sold on Gumroad. Nothing runs on a server except licence checks and optional cloud transcription, so failures are local.",
    docsUrl: "https://goodsnooze.gumroad.com/l/macwhisper",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "MacWhisper app", description: "Local transcription", criticality: "critical" },
      { name: "Gumroad", description: "Purchase and licence", criticality: "medium" },
      { name: "Optional cloud models", description: "Third-party APIs", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model download failing",
        scope: "local",
        signal: "Whisper models stall downloading on first use",
        quickCheck: "Check the connection and disk space; retry the download",
      },
      {
        pattern: "Licence not recognised",
        scope: "local",
        signal: "Pro features locked after purchase",
        quickCheck: "Re-enter the Gumroad licence key; check Gumroad's status if activation fails",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "MacWhisper is not working",
        alternative: "Superwhisper or Wispr Flow (monitored on DownForAI) offer local dictation; Otter.ai covers cloud transcription",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Gumroad for licensing"],
    operatorNotes: [
      "DownForAI probes the Gumroad product page (the DB website URL), not the app.",
    ],
  },
  "magical-ai": {
    slug: "magical-ai",
    providerSummary:
      "Magical is a browser extension for text expansion, form filling and AI-assisted data entry, with an AI agent product for teams, on freemium plans. Expansion runs locally; AI features and team sync use Magical's cloud.",
    docsUrl: "https://help.getmagical.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Chrome extension", description: "Local expansion and autofill", criticality: "critical" },
      { name: "Magical cloud", description: "AI features, sync, account", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI features failing while shortcuts work",
        scope: "partial",
        signal: "AI writing errors; text expansion works",
        quickCheck: "Keep using shortcuts; the AI layer is separate",
      },
      {
        pattern: "Extension not triggering on a site",
        scope: "local",
        signal: "Shortcuts do not expand in a specific web app",
        quickCheck: "Check site permissions for the extension; some apps block injected input",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Magical is down",
        alternative: "Monica or HARPA AI (monitored on DownForAI) provide AI in the browser",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Chrome"],
    operatorNotes: [
      "Two DB entries exist (magical-ai, magical-ai-prod) for the same product.",
    ],
  },
  "magical-ai-prod": {
    slug: "magical-ai-prod",
    providerSummary:
      "Magical (second DB entry for the same product) automates repetitive text, data entry and browser workflows, and offers AI agents for support and operations teams. Its browser extension is local; agents and sync depend on Magical's cloud.",
    docsUrl: "https://help.getmagical.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Browser extension", description: "Local automation", criticality: "critical" },
      { name: "Agents and cloud", description: "Team features", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agents not running",
        scope: "partial",
        signal: "Team agents stall while personal shortcuts work",
        quickCheck: "Retry later; agents run in Magical's cloud",
      },
      {
        pattern: "Sign-in loop in the extension",
        scope: "local",
        signal: "The extension keeps asking to log in",
        quickCheck: "Sign out and in; clear the extension's site data",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Magical is down",
        alternative: "Bardeen or Zapier AI (monitored on DownForAI) automate browser and app workflows",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Chrome"],
    operatorNotes: [
      "Duplicate of the magical-ai entry.",
    ],
  },
  meetgeek: {
    slug: "meetgeek",
    providerSummary:
      "MeetGeek is an AI meeting assistant that records, transcribes and summarises video calls and pushes highlights to CRMs and Slack, on freemium plans. Bot joining and post-call processing are the sensitive parts.",
    docsUrl: "https://meetgeek.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "MeetGeek notetaker", description: "Joins and records calls", criticality: "critical" },
      { name: "Processing backend", description: "Transcripts and summaries", criticality: "critical" },
      { name: "Integrations", description: "CRM, Slack, calendars", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notetaker not joining",
        scope: "partial",
        signal: "The bot misses scheduled calls across users",
        quickCheck: "Check the calendar connection; a widespread no-show is the recording service",
      },
      {
        pattern: "Summaries delayed",
        scope: "partial",
        signal: "Recordings exist but summaries take hours",
        quickCheck: "Wait; processing queues clear",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "MeetGeek is down",
        alternative: "Fireflies.ai, Fathom or tl;dv (monitored on DownForAI) record and summarise meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams", "CRMs"],
    operatorNotes: [
      "help.meetgeek.ai was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  "mem-ai": {
    slug: "mem-ai",
    providerSummary:
      "Mem is an AI note-taking app (web, macOS, iOS) that organises notes automatically and answers questions over them, on subscription plans. Notes sync through Mem's cloud and AI features relay to third-party models.",
    docsUrl: "https://mem.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Mem apps and web", description: "Clients", criticality: "critical" },
      { name: "Sync and AI backend", description: "Notes and answers", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI chat over notes failing",
        scope: "partial",
        signal: "Questions error while notes open and edit",
        quickCheck: "Retry later; the AI layer is separate from storage",
      },
      {
        pattern: "Notes not syncing",
        scope: "partial",
        signal: "Edits do not appear on other devices",
        quickCheck: "Check the sync status; local edits are kept",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Mem is down",
        alternative: "Notion AI, Tana or Craft AI (monitored on DownForAI) offer AI-assisted notes",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  "microsoft-365-copilot": {
    slug: "microsoft-365-copilot",
    providerSummary:
      "Microsoft 365 Copilot brings AI into Word, Excel, Outlook, Teams and the Copilot app, licensed per user on top of Microsoft 365. It runs on Microsoft's cloud (Azure OpenAI and Microsoft Graph), and incidents appear in the Microsoft 365 admin service health.",
    docsUrl: "https://support.microsoft.com/copilot",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Copilot in Microsoft 365 apps", description: "Word, Excel, Outlook, Teams", criticality: "critical" },
      { name: "Microsoft Graph", description: "Access to organisational data", criticality: "critical" },
      { name: "copilot.microsoft.com", description: "Web app", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Copilot unavailable in Office apps",
        scope: "partial",
        signal: "The Copilot button is greyed out or returns errors while the apps work",
        quickCheck: "Check the Microsoft 365 service health page (admin centre) for a Copilot incident",
      },
      {
        pattern: "Copilot missing for a user",
        scope: "local",
        signal: "No Copilot features although colleagues have them",
        quickCheck: "An admin must assign the Copilot licence; propagation can take hours",
      },
      {
        pattern: "Answers missing organisational context",
        scope: "partial",
        signal: "Copilot cannot find emails or files it normally sees",
        quickCheck: "Microsoft Graph or search indexing is degraded; check service health",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Microsoft 365 Copilot is down",
        alternative: "Microsoft Copilot or ChatGPT (monitored on DownForAI) cover general drafting without organisational data",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Microsoft 365", "Azure OpenAI", "Microsoft Graph"],
    operatorNotes: [
      "DownForAI probes copilot.microsoft.com; enterprise incidents are visible in the Microsoft 365 admin service health.",
    ],
  },
  "miro-ai": {
    slug: "miro-ai",
    providerSummary:
      "Miro AI adds generation, summaries and diagram creation to the Miro whiteboard, subject to per-plan AI credits. It runs on the Miro platform, whose incidents are published on an Atlassian status page.",
    officialStatusUrl: "https://status.miro.com",
    docsUrl: "https://help.miro.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "miro.com boards", description: "Whiteboard platform", criticality: "critical" },
      { name: "Miro AI", description: "AI features", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI actions failing while boards work",
        scope: "partial",
        signal: "AI generation or summaries error; boards edit normally",
        quickCheck: "Retry later; check status.miro.com for an AI component incident",
      },
      {
        pattern: "AI credits exhausted",
        scope: "local",
        signal: "AI features refused with a credit message for your team",
        quickCheck: "Check the team's AI credit usage",
      },
      {
        pattern: "Boards slow or not loading",
        scope: "global",
        signal: "Boards fail for everyone; the status page lists an incident",
        quickCheck: "Check the status page; nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Miro AI is unavailable",
        alternative: "Xmind AI or Canva AI (monitored on DownForAI) cover AI diagramming and visuals",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Miro platform", "Third-party model providers"],
    operatorNotes: [],
  },
  "monday-ai": {
    slug: "monday-ai",
    providerSummary:
      "monday AI adds AI blocks, automations and assistants to monday.com's work management platform, counted in AI credits per account. It runs on the monday.com platform, whose incidents are published on its status page.",
    officialStatusUrl: "https://status.monday.com/",
    docsUrl: "https://support.monday.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "monday.com platform", description: "Boards and automations", criticality: "critical" },
      { name: "monday AI", description: "AI blocks and assistant", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI blocks failing while boards work",
        scope: "partial",
        signal: "AI columns or the assistant error; boards load and edit",
        quickCheck: "Retry later; check status.monday.com for an AI component incident",
      },
      {
        pattern: "AI credits exhausted",
        scope: "local",
        signal: "AI features refused with a credit message for your account",
        quickCheck: "Check the account's AI credit usage",
      },
      {
        pattern: "Automations delayed",
        scope: "partial",
        signal: "Automations run late across accounts",
        quickCheck: "Check the status page; runs execute when the backlog clears",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "monday AI is unavailable",
        alternative: "ClickUp AI, Notion AI or Airtable AI (monitored on DownForAI) offer AI inside work management",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["monday.com platform", "Third-party model providers"],
    operatorNotes: [
      "The DB website URL (monday.com/product/ai) answered 404 when this entry was written.",
    ],
  },
  "monica-ai": {
    slug: "monica-ai",
    providerSummary:
      "Monica is an AI assistant browser extension and app bundling several models (ChatGPT, Claude, Gemini and others) with search, translation and writing tools, on freemium plans. It relays to model providers through Monica's backend.",
    docsUrl: "https://monica.im",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Monica extension and apps", description: "Clients", criticality: "critical" },
      { name: "Monica backend / model relay", description: "Answers", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One model errors while others answer",
        scope: "partial",
        signal: "Switching the model restores replies",
        quickCheck: "Change model; the failure is the upstream provider",
      },
      {
        pattern: "Daily free quota exhausted",
        scope: "local",
        signal: "Requests refused with a quota message for your account",
        quickCheck: "Free plans cap daily queries; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Monica is down",
        alternative: "HARPA AI or Poe (monitored on DownForAI) offer multi-model assistants",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  motion: {
    slug: "motion",
    providerSummary:
      "Motion is an AI task and calendar planner (web, desktop, mobile) that auto-schedules tasks around meetings via Google and Microsoft calendars, on subscription plans. Scheduling runs in Motion's cloud on calendar APIs.",
    docsUrl: "https://help.usemotion.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Motion apps and web", description: "Clients", criticality: "critical" },
      { name: "Scheduling engine", description: "Auto-scheduling", criticality: "critical" },
      { name: "Calendar sync", description: "Google / Microsoft calendars", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tasks not being scheduled",
        scope: "partial",
        signal: "New tasks stay unscheduled for everyone",
        quickCheck: "Trigger a reschedule; if nothing moves for anyone, the scheduling engine is degraded",
      },
      {
        pattern: "Calendar out of sync",
        scope: "local",
        signal: "Events missing or duplicated",
        quickCheck: "Reconnect the calendar account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Motion is down",
        alternative: "Reclaim.ai or Clockwise AI (monitored on DownForAI) auto-schedule tasks and focus time",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Google Calendar / Microsoft 365 APIs"],
    operatorNotes: [],
  },
  notegpt: {
    slug: "notegpt",
    providerSummary:
      "NoteGPT summarises YouTube videos, PDFs and web pages and generates notes and flashcards, via a web app and browser extension on freemium plans. It fetches the source content then relays to language models.",
    docsUrl: "https://notegpt.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "notegpt.io web app", description: "Summaries and notes", criticality: "critical" },
      { name: "Content fetching", description: "YouTube transcripts, pages, PDFs", criticality: "high" },
      { name: "Model relay", description: "Summaries", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "YouTube summaries failing while PDFs work",
        scope: "partial",
        signal: "Video links error at transcript fetch",
        quickCheck: "YouTube changes break transcript fetching periodically; try a PDF or wait",
      },
      {
        pattern: "Daily quota exhausted",
        scope: "local",
        signal: "Requests refused with a quota message for your account",
        quickCheck: "Free plans cap daily summaries",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "NoteGPT is down",
        alternative: "ChatPDF, Humata or ChatGPT (monitored on DownForAI) summarise documents and videos",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["YouTube", "Third-party model providers"],
    operatorNotes: [],
  },
  "otter-ai": {
    slug: "otter-ai",
    providerSummary:
      "Otter.ai transcribes meetings live and afterwards, with an OtterPilot bot for Zoom, Meet and Teams and AI summaries and chat, on freemium plans. It publishes a status page; its incidents are bots not joining and transcripts stuck.",
    officialStatusUrl: "https://status.otter.ai/",
    docsUrl: "https://help.otter.ai",
    pricingUrl: "https://otter.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "otter.ai web and apps", description: "Clients", criticality: "critical" },
      { name: "OtterPilot", description: "Meeting bot", criticality: "critical" },
      { name: "Transcription backend", description: "Live and post-call processing", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "OtterPilot not joining meetings",
        scope: "partial",
        signal: "The bot misses scheduled calls across users",
        quickCheck: "Check status.otter.ai and the calendar connection",
      },
      {
        pattern: "Transcripts stuck processing",
        scope: "partial",
        signal: "Recordings never produce text",
        quickCheck: "Wait; processing backlogs clear — do not re-upload",
      },
      {
        pattern: "Monthly minutes exhausted",
        scope: "local",
        signal: "New transcriptions refused for your account",
        quickCheck: "Check the remaining minutes; they reset monthly",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Otter is down",
        alternative: "Fireflies.ai, Fathom or Notta AI (monitored on DownForAI) record and transcribe meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams"],
    operatorNotes: [],
  },
  "photomath-ai": {
    slug: "photomath-ai",
    providerSummary:
      "Photomath (Google) is a mobile app that reads maths problems through the camera and shows step-by-step solutions, with a Plus subscription. Recognition and solving run on Photomath's servers, so the app needs connectivity.",
    docsUrl: "https://photomath.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Photomath mobile app", description: "Primary client", criticality: "critical" },
      { name: "Recognition and solver backend", description: "Server-side processing", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Scans not returning solutions",
        scope: "partial",
        signal: "Every scan spins or errors while the app opens",
        quickCheck: "Check connectivity, then retry; a universal failure is the backend",
      },
      {
        pattern: "Plus not recognised",
        scope: "local",
        signal: "Step explanations locked after purchase",
        quickCheck: "Use 'restore purchases' with the same store account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Photomath is down",
        alternative: "ChatGPT or Google Gemini (monitored on DownForAI) solve photographed problems",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [],
  },
  "pitch-ai": {
    slug: "pitch-ai",
    providerSummary:
      "Pitch is a collaborative presentation tool with AI generation and editing features, on freemium plans. Decks live in Pitch's cloud; AI generation relays to third-party models.",
    docsUrl: "https://help.pitch.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "pitch.com", description: "Editor and sharing", criticality: "critical" },
      { name: "AI generation", description: "Deck creation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI deck generation failing while editing works",
        scope: "partial",
        signal: "Generate errors; existing decks edit normally",
        quickCheck: "Retry later; the AI layer is separate",
      },
      {
        pattern: "Shared links not loading",
        scope: "partial",
        signal: "Public presentation links error for viewers",
        quickCheck: "Export a PDF as a stopgap; the sharing service is separate from the editor",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Pitch is down",
        alternative: "Gamma, Tome or SlidesAI (monitored on DownForAI) generate presentations with AI",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  "rakuten-ai": {
    slug: "rakuten-ai",
    providerSummary:
      "Rakuten AI is Rakuten's assistant and enterprise AI suite for its ecosystem (shopping, workflow automation), primarily for Japanese users and Rakuten members. The DB tracks rakuten.today, a corporate site; product surfaces live inside Rakuten's apps.",
    docsUrl: "https://rakuten.today",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "rakuten.today", description: "Corporate site", criticality: "low" },
      { name: "Rakuten AI in Rakuten apps", description: "Assistant features", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Assistant unavailable inside Rakuten apps",
        scope: "partial",
        signal: "AI features error while shopping and account work",
        quickCheck: "Retry later; the AI layer is separate from Rakuten's core services",
      },
      {
        pattern: "Feature not available for your account or region",
        scope: "local",
        signal: "AI options absent",
        quickCheck: "Availability is limited to Rakuten members in supported regions",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Rakuten AI is unavailable",
        alternative: "ChatGPT or Google Gemini (monitored on DownForAI) cover general assistant use",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Rakuten ecosystem"],
    operatorNotes: [
      "DownForAI probes rakuten.today, which does not reflect the assistant's health.",
    ],
  },
  "raycast-ai": {
    slug: "raycast-ai",
    providerSummary:
      "Raycast is a macOS (and now Windows and iOS) launcher whose Pro plan includes Raycast AI: chat, quick AI and commands across many models. The launcher works offline; AI features and sync depend on Raycast's cloud and the model providers behind it.",
    docsUrl: "https://manual.raycast.com",
    pricingUrl: "https://www.raycast.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Raycast app", description: "Local launcher", criticality: "high" },
      { name: "Raycast AI backend", description: "Model relay", criticality: "critical" },
      { name: "Account and sync", description: "Pro features", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI requests failing while the launcher works",
        scope: "partial",
        signal: "Quick AI or chat error; commands and search work",
        quickCheck: "Switch model in AI settings; if all fail, the AI backend is degraded",
      },
      {
        pattern: "Pro features locked",
        scope: "local",
        signal: "AI unavailable after a subscription change",
        quickCheck: "Sign out and in; check the subscription status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Raycast AI is down",
        alternative: "ChatGPT or Claude Chat (monitored on DownForAI) desktop apps cover the same quick-AI use",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  "reclaim-ai": {
    slug: "reclaim-ai",
    providerSummary:
      "Reclaim.ai schedules tasks, habits and focus time automatically in Google Calendar (and Outlook), on freemium plans. All its work goes through calendar APIs, so calendar-provider issues and sync delays are its main incidents.",
    docsUrl: "https://help.reclaim.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.reclaim.ai", description: "Web app", criticality: "critical" },
      { name: "Scheduling engine", description: "Auto-scheduling", criticality: "critical" },
      { name: "Calendar sync", description: "Google / Outlook APIs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Events not appearing in the calendar",
        scope: "partial",
        signal: "Scheduled tasks or habits missing for everyone",
        quickCheck: "Check the calendar connection; if Google Calendar is healthy and nothing appears, the sync is degraded",
      },
      {
        pattern: "Scheduling loops or constant reshuffles",
        scope: "local",
        signal: "Tasks move repeatedly during the day",
        quickCheck: "Review priorities and working hours; expected behaviour under conflicting constraints",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Reclaim is down",
        alternative: "Motion or Clockwise AI (monitored on DownForAI) auto-schedule tasks and focus time",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Google Calendar / Outlook APIs"],
    operatorNotes: [],
  },
  scispace: {
    slug: "scispace",
    providerSummary:
      "SciSpace is an AI research assistant for finding, reading and summarising papers, with a Copilot for PDFs and literature review tools, on freemium plans. Search, PDF processing and AI answers are separate services.",
    docsUrl: "https://scispace.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "scispace.com", description: "Search and reader", criticality: "critical" },
      { name: "PDF processing", description: "Uploads and Copilot", criticality: "high" },
      { name: "AI answers", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Copilot answers failing while search works",
        scope: "partial",
        signal: "Questions on papers error; search returns results",
        quickCheck: "Retry later; the AI layer is separate",
      },
      {
        pattern: "PDF uploads stuck",
        scope: "partial",
        signal: "Uploads never become readable",
        quickCheck: "Try a small PDF; a universal stall is the processing backend",
      },
      {
        pattern: "Free quota exhausted",
        scope: "local",
        signal: "AI features refused with a limit message for your account",
        quickCheck: "Free plans cap AI usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SciSpace is down",
        alternative: "Consensus or Perplexity (monitored on DownForAI) search and summarise research",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  "sembly-ai": {
    slug: "sembly-ai",
    providerSummary:
      "Sembly is an AI meeting assistant that records calls, transcribes them and produces notes, tasks and insights, on freemium plans. Its notetaker joins Zoom, Meet, Teams and Webex; processing runs afterwards in Sembly's cloud.",
    docsUrl: "https://help.sembly.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Sembly notetaker", description: "Joins and records calls", criticality: "critical" },
      { name: "Processing backend", description: "Notes and tasks", criticality: "critical" },
      { name: "app.sembly.ai", description: "Library and integrations", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notetaker not joining",
        scope: "partial",
        signal: "The bot misses scheduled calls across users",
        quickCheck: "Check the calendar connection; a widespread no-show is the recording service",
      },
      {
        pattern: "Notes delayed",
        scope: "partial",
        signal: "Recordings exist but notes take hours",
        quickCheck: "Wait; processing queues clear",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sembly is down",
        alternative: "Fireflies.ai, Otter.ai or MeetGeek (monitored on DownForAI) record and summarise meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams / Webex"],
    operatorNotes: [],
  },
  shortwave: {
    slug: "shortwave",
    providerSummary:
      "Shortwave is an AI email client for Gmail (web, desktop, mobile) with an assistant that searches, summarises and drafts, on subscription plans. It depends on Gmail's API for mail and on model providers for AI.",
    docsUrl: "https://www.shortwave.com/docs/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Shortwave apps", description: "Clients", criticality: "critical" },
      { name: "Gmail sync", description: "Mail access via Google APIs", criticality: "critical" },
      { name: "AI assistant", description: "Model relay", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Mail not syncing",
        scope: "partial",
        signal: "New emails do not appear while Gmail itself shows them",
        quickCheck: "Check Google's status; if Gmail is healthy and Shortwave lags for everyone, the sync backend is degraded",
      },
      {
        pattern: "AI assistant failing while mail works",
        scope: "partial",
        signal: "Assistant requests error; reading and sending work",
        quickCheck: "Retry later; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Shortwave is down",
        alternative: "Google Workspace Gemini (monitored on DownForAI) covers AI drafting inside Gmail, which keeps working directly",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Gmail / Google APIs", "Third-party model providers"],
    operatorNotes: [],
  },
  "slack-ai": {
    slug: "slack-ai",
    providerSummary:
      "Slack AI (summaries, search answers, huddle notes, agents) is an add-on inside Slack, running on Slack's platform and Salesforce's AI infrastructure. Slack's status page covers both the platform and the AI features.",
    officialStatusUrl: "https://status.slack.com/",
    docsUrl: "https://slack.com/help",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Slack platform", description: "Messaging", criticality: "critical" },
      { name: "Slack AI features", description: "Summaries, search, huddle notes", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI summaries or answers failing while messaging works",
        scope: "partial",
        signal: "Summarise or search answers error; channels load normally",
        quickCheck: "Check status.slack.com for an AI component incident",
      },
      {
        pattern: "Slack-wide incident",
        scope: "global",
        signal: "Messages delayed or Slack unreachable; AI fails with it",
        quickCheck: "Check the status page; nothing to fix locally",
      },
      {
        pattern: "AI not enabled for your workspace",
        scope: "local",
        signal: "AI options absent",
        quickCheck: "An admin must purchase and enable the Slack AI add-on",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Slack AI is unavailable",
        alternative: "ChatGPT or Claude Chat (monitored on DownForAI) can summarise pasted threads meanwhile",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Slack platform", "Salesforce AI infrastructure"],
    operatorNotes: [],
  },
  slidesai: {
    slug: "slidesai",
    providerSummary:
      "SlidesAI generates presentations from text inside Google Slides (add-on) and as a web app, on freemium plans, relaying to language models. It depends on Google Workspace for the add-on path.",
    docsUrl: "https://www.slidesai.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Google Slides add-on", description: "In-Slides generation", criticality: "critical" },
      { name: "slidesai.io web app", description: "Standalone generator", criticality: "high" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation fails inside Google Slides",
        scope: "partial",
        signal: "The add-on errors while the web app works",
        quickCheck: "Re-authorise the add-on; Google add-on permissions expire",
      },
      {
        pattern: "Monthly presentation quota reached",
        scope: "local",
        signal: "Generation refused with a plan message",
        quickCheck: "Free plans cap presentations per month",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SlidesAI is down",
        alternative: "Gamma, Pitch AI or Tome (monitored on DownForAI) generate presentations",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Google Workspace add-on platform", "Third-party model providers"],
    operatorNotes: [],
  },
  speechify: {
    slug: "speechify",
    providerSummary:
      "Speechify reads documents, web pages and books aloud with AI voices across web, mobile, desktop and browser extensions, on freemium plans. Premium voices stream from Speechify's servers; the site sits behind bot protection.",
    docsUrl: "https://help.speechify.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Speechify apps and extension", description: "Clients", criticality: "critical" },
      { name: "Voice streaming backend", description: "Premium voices", criticality: "critical" },
      { name: "Document sync", description: "Library across devices", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Premium voices silent or buffering",
        scope: "partial",
        signal: "Playback stalls on premium voices; device voices work",
        quickCheck: "Switch to a standard voice; if premium fails everywhere, the streaming backend is degraded",
      },
      {
        pattern: "Documents not syncing across devices",
        scope: "partial",
        signal: "Imports on one device do not appear elsewhere",
        quickCheck: "Check the sync status; re-import if needed",
      },
      {
        pattern: "Premium not recognised",
        scope: "local",
        signal: "Features locked after purchase",
        quickCheck: "Use 'restore purchases' with the same store account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Speechify is down",
        alternative: "ElevenLabs or Murf AI (monitored on DownForAI) read text aloud with AI voices",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [
      "speechify.com refuses automated requests, so DownForAI checks robots.txt reachability only.",
    ],
  },
  supernormal: {
    slug: "supernormal",
    providerSummary:
      "Supernormal is an AI meeting notes tool that joins video calls, transcribes and produces notes and action items, on freemium plans. Its notetaker and processing run in Supernormal's cloud; the site blocks direct probes.",
    docsUrl: "https://help.supernormal.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Supernormal notetaker", description: "Joins and records calls", criticality: "critical" },
      { name: "Processing backend", description: "Notes and actions", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notetaker not joining",
        scope: "partial",
        signal: "The bot misses scheduled calls across users",
        quickCheck: "Check the calendar connection; a widespread no-show is the recording service",
      },
      {
        pattern: "Notes delayed",
        scope: "partial",
        signal: "Recordings exist but notes take hours",
        quickCheck: "Wait; processing queues clear",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Supernormal is down",
        alternative: "Fathom, Fireflies.ai or Otter.ai (monitored on DownForAI) record and summarise meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams"],
    operatorNotes: [
      "supernormal.com refuses automated requests, so DownForAI checks robots.txt reachability only.",
    ],
  },
  superwhisper: {
    slug: "superwhisper",
    providerSummary:
      "Superwhisper is a macOS (and iOS) dictation app running Whisper-class models on device, with optional cloud models, sold by subscription or lifetime licence. Nothing essential runs on a server, so failures are local.",
    docsUrl: "https://superwhisper.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Superwhisper app", description: "Local dictation", criticality: "critical" },
      { name: "Model downloads / licence", description: "Server dependencies", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model download stalls",
        scope: "local",
        signal: "The chosen model never finishes downloading",
        quickCheck: "Retry on a stable connection; pick a smaller model",
      },
      {
        pattern: "Dictation not inserting text",
        scope: "local",
        signal: "Transcription works but nothing is typed into the app",
        quickCheck: "Grant Accessibility permissions to Superwhisper in macOS settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Superwhisper is not working",
        alternative: "Wispr Flow or MacWhisper (monitored on DownForAI) offer dictation and transcription on Mac",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  tana: {
    slug: "tana",
    providerSummary:
      "Tana is a structured note-taking workspace (outliner plus databases) with AI agents and voice capture, on subscription plans. Data syncs through Tana's cloud and AI features relay to third-party models.",
    docsUrl: "https://help.tana.inc",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.tana.inc", description: "Workspace", criticality: "critical" },
      { name: "Sync backend", description: "Real-time data", criticality: "critical" },
      { name: "AI features", description: "Agents and voice memos", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Workspace not loading or sync stalled",
        scope: "global",
        signal: "The app spins on load or changes do not persist for everyone",
        quickCheck: "Wait and reload; Tana announces incidents in its community channels",
      },
      {
        pattern: "AI features failing while notes work",
        scope: "partial",
        signal: "Agents or voice memo processing error",
        quickCheck: "Retry later; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Tana is down",
        alternative: "Notion AI, Mem.ai or Craft AI (monitored on DownForAI) offer AI-assisted notes",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  taskade: {
    slug: "taskade",
    providerSummary:
      "Taskade is a collaborative workspace (tasks, notes, mind maps) with AI agents and generators, on freemium plans. Workspaces sync through Taskade's cloud; AI features relay to model providers.",
    docsUrl: "https://help.taskade.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "taskade.com apps", description: "Clients", criticality: "critical" },
      { name: "Sync backend", description: "Workspaces", criticality: "critical" },
      { name: "AI agents", description: "Generation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI agents failing while projects work",
        scope: "partial",
        signal: "AI requests error; projects load and edit",
        quickCheck: "Retry later; the AI layer is separate",
      },
      {
        pattern: "Real-time sync lagging",
        scope: "partial",
        signal: "Collaborators see stale content",
        quickCheck: "Reload; if it persists for everyone, the sync backend is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Taskade is down",
        alternative: "Notion AI or ClickUp AI (monitored on DownForAI) offer AI inside collaborative workspaces",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [
      "Two DB entries exist (taskade, taskade-ai) for the same product.",
    ],
  },
  "taskade-ai": {
    slug: "taskade-ai",
    providerSummary:
      "Taskade AI (second DB entry for the same product) bundles AI agents, automations and generators into Taskade's workspace, counted in AI credits per plan. Agents run in Taskade's cloud on third-party models.",
    docsUrl: "https://help.taskade.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "AI agents and automations", description: "Generation and runs", criticality: "high" },
      { name: "Taskade workspace", description: "Host platform", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Automations not running",
        scope: "partial",
        signal: "Triggered flows stall across workspaces",
        quickCheck: "Run an automation manually; if manual works, the trigger service is degraded",
      },
      {
        pattern: "AI credits exhausted",
        scope: "local",
        signal: "AI features refused with a credit message for your workspace",
        quickCheck: "Check the plan's AI usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Taskade AI is unavailable",
        alternative: "Notion AI or Relevance AI (monitored on DownForAI) offer AI agents over work content",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [
      "Duplicate of the taskade entry.",
    ],
  },
  tldv: {
    slug: "tldv",
    providerSummary:
      "tl;dv records, transcribes and summarises Zoom, Meet and Teams meetings with AI, on freemium plans, and pushes notes to CRMs. Its notetaker and processing run in tl;dv's cloud.",
    docsUrl: "https://tldv.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "tl;dv notetaker", description: "Joins and records calls", criticality: "critical" },
      { name: "Processing backend", description: "Transcripts and summaries", criticality: "critical" },
      { name: "Integrations", description: "CRM and Slack", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notetaker not joining",
        scope: "partial",
        signal: "The bot misses scheduled calls across users",
        quickCheck: "Check the calendar connection; a widespread no-show is the recording service",
      },
      {
        pattern: "Summaries delayed",
        scope: "partial",
        signal: "Recordings exist but summaries take hours",
        quickCheck: "Wait; processing queues clear",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "tl;dv is down",
        alternative: "Fathom, Fireflies.ai or MeetGeek (monitored on DownForAI) record and summarise meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams"],
    operatorNotes: [
      "help.tldv.io was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  tome: {
    slug: "tome",
    providerSummary:
      "Tome was an AI presentation and storytelling tool; the company pivoted to a sales-intelligence product and the presentation app was wound down, and tome.app now returns 404. Existing presentation users should consider the product discontinued.",
    docsUrl: "https://tome.app",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "tome.app", description: "Former product site (404)", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Site returns 404",
        scope: "global",
        signal: "tome.app is gone",
        quickCheck: "Expected; the presentation product was discontinued",
      },
      {
        pattern: "Old presentations unreachable",
        scope: "local",
        signal: "Shared links no longer open",
        quickCheck: "Nothing to recover from the site; use exported copies",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need an AI presentation tool",
        alternative: "Gamma, Pitch AI or SlidesAI (monitored on DownForAI) generate presentations",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The DB website URL answers 404; consider marking this service discontinued.",
    ],
  },
  "vercel-ai": {
    slug: "vercel-ai",
    providerSummary:
      "The Vercel AI SDK is an open-source TypeScript toolkit for building AI apps (streaming, tool calling, provider adapters); sdk.vercel.ai redirects to ai-sdk.dev. It is a library, so the only things that fail are the model providers you call and Vercel hosting if you deploy there.",
    docsUrl: "https://sdk.vercel.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ai-sdk.dev", description: "Documentation", criticality: "low" },
      { name: "Model providers", description: "Called through the SDK", criticality: "critical" },
      { name: "Vercel hosting", description: "When apps deploy there", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Provider errors surfaced by the SDK",
        scope: "local",
        signal: "Streams end with rate-limit or 5xx errors from OpenAI, Anthropic or another provider",
        quickCheck: "Check the provider's status; switch provider via the adapter",
      },
      {
        pattern: "Breaking changes between major versions",
        scope: "local",
        signal: "Imports or hooks change after upgrading",
        quickCheck: "Pin the version and follow the migration guide",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your provider is down",
        alternative: "Anthropic API, OpenAI API or Google AI Studio (monitored on DownForAI) can be swapped in through the adapter — the SDK is provider-agnostic",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers", "Vercel"],
    operatorNotes: [
      "sdk.vercel.ai redirects to ai-sdk.dev; DownForAI's probe follows the redirect.",
    ],
  },
  "wispr-flow": {
    slug: "wispr-flow",
    providerSummary:
      "Wispr Flow is a voice-dictation app (macOS, Windows, iOS) that transcribes speech into any text field with AI cleanup, on freemium plans. Audio is processed on Wispr's servers, so connectivity and the backend matter.",
    docsUrl: "https://wisprflow.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Wispr Flow app", description: "Client", criticality: "critical" },
      { name: "Transcription backend", description: "Cloud processing", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Dictation returns nothing",
        scope: "partial",
        signal: "Recording ends without text for everyone",
        quickCheck: "Check connectivity, then retry; a universal failure is the backend",
      },
      {
        pattern: "Free word limit reached",
        scope: "local",
        signal: "Dictation refused with a limit message for your account",
        quickCheck: "Free plans cap weekly words",
      },
      {
        pattern: "Text not inserted into the app",
        scope: "local",
        signal: "Transcription shows but nothing is typed",
        quickCheck: "Grant Accessibility permissions",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Wispr Flow is down",
        alternative: "Superwhisper or MacWhisper (monitored on DownForAI) run dictation locally",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "xmind-ai": {
    slug: "xmind-ai",
    providerSummary:
      "Xmind AI is the web version of Xmind's mind-mapping tool with AI generation and Copilot, on freemium plans; xmind.ai redirects to app.xmind.com. Maps sync through Xmind's cloud and AI relays to model providers.",
    docsUrl: "https://xmind.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.xmind.com", description: "Web app", criticality: "critical" },
      { name: "AI generation", description: "Copilot and map generation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI generation failing while editing works",
        scope: "partial",
        signal: "Generate errors; maps edit and save",
        quickCheck: "Retry later; the AI layer is separate",
      },
      {
        pattern: "AI credits exhausted",
        scope: "local",
        signal: "AI refused with a credit message for your account",
        quickCheck: "Check the plan's AI credits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Xmind AI is down",
        alternative: "Miro AI or Napkin AI (monitored on DownForAI) generate diagrams and maps",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [
      "xmind.ai redirects to app.xmind.com; DownForAI's probe follows the redirect.",
    ],
  },
  "zoom-ai": {
    slug: "zoom-ai",
    providerSummary:
      "Zoom AI Companion provides meeting summaries, smart recordings and composition inside Zoom, included with paid Zoom plans. It runs on Zoom's platform (with third-party models behind it) and follows Zoom's status page.",
    officialStatusUrl: "https://status.zoom.us",
    docsUrl: "https://support.zoom.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Zoom platform", description: "Meetings", criticality: "critical" },
      { name: "AI Companion", description: "Summaries and composition", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Meeting summaries not generated",
        scope: "partial",
        signal: "Summaries missing after meetings across accounts",
        quickCheck: "Check status.zoom.us for an AI Companion component incident",
      },
      {
        pattern: "AI Companion missing in meetings",
        scope: "local",
        signal: "The AI button is absent for a user",
        quickCheck: "An admin must enable AI Companion for the account; it requires a paid plan",
      },
      {
        pattern: "Zoom-wide incident",
        scope: "global",
        signal: "Meetings fail to start or audio degrades; AI fails with it",
        quickCheck: "Check the status page; nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AI Companion is unavailable",
        alternative: "Fathom, Otter.ai or Fireflies.ai (monitored on DownForAI) can record and summarise the same meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom platform", "Third-party model providers"],
    operatorNotes: [
      "The DB website URL (zoom.us/ai-assistant) answered 404 when this entry was written.",
    ],
  },
};
