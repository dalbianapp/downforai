import type { TopServiceContent } from "@/content/top-services/types";

// MARKETING — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start marketing-2.ts and register it in ./index.ts if it grows.
export const MARKETING: Record<string, TopServiceContent> = {
  "agility-writer": {
    slug: "agility-writer",
    providerSummary:
      "Agility Writer generates long-form SEO articles in one click, with a WordPress publisher, on credit-based plans. It relays to language models and fetches SERP data, so generation can stall on either dependency.",
    docsUrl: "https://agilitywriter.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "agilitywriter.ai web app", description: "Article generator", criticality: "critical" },
      { name: "Generation backend", description: "Model relay and SERP fetching", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Articles stuck generating",
        scope: "partial",
        signal: "Jobs stay in progress for every user",
        quickCheck: "Try a short article; a universal stall is the backend or its model provider",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused with a credit message for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Agility Writer is down",
        alternative: "Koala.sh, Writesonic or Copy.ai (monitored on DownForAI) generate SEO articles",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  anyword: {
    slug: "anyword",
    providerSummary:
      "Anyword is an AI copywriting platform with performance prediction for ads, emails and landing pages, on subscription plans. Generation relays to language models; the help centre was unreachable when this entry was written.",
    docsUrl: "https://anyword.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.anyword.com", description: "Editor", criticality: "critical" },
      { name: "Generation and scoring backend", description: "Model relay and predictions", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations failing across templates",
        scope: "partial",
        signal: "Every prompt errors",
        quickCheck: "Retry a short prompt; a universal failure is the backend",
      },
      {
        pattern: "Word quota exhausted",
        scope: "local",
        signal: "Generation refused with a plan message for your account",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Anyword is down",
        alternative: "Copy.ai, Jasper AI or Writesonic (monitored on DownForAI) cover marketing copy",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "autoblogging-ai": {
    slug: "autoblogging-ai",
    providerSummary:
      "Autoblogging.ai generates and bulk-publishes blog posts to WordPress with AI, on credit-based plans. Generation relays to language models; publishing depends on the WordPress connection.",
    docsUrl: "https://autoblogging.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "autoblogging.ai web app", description: "Generator", criticality: "critical" },
      { name: "WordPress publishing", description: "Site integration", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Bulk jobs stuck",
        scope: "partial",
        signal: "Article batches stay in progress for everyone",
        quickCheck: "Try a single article; a universal stall is the backend",
      },
      {
        pattern: "Publishing to WordPress failing",
        scope: "local",
        signal: "Articles generate but do not appear on the site",
        quickCheck: "Check the WordPress connection and plugin",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Autoblogging.ai is down",
        alternative: "Koala.sh or Agility Writer (monitored on DownForAI) generate SEO articles",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers", "WordPress sites"],
    operatorNotes: [],
  },
  clearscope: {
    slug: "clearscope",
    providerSummary:
      "Clearscope is a content-optimisation platform that grades drafts against top-ranking pages for a keyword, with Google Docs and WordPress integrations, on subscription plans. Reports depend on SERP data fetching.",
    docsUrl: "https://www.clearscope.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "clearscope.io app", description: "Reports and editor", criticality: "critical" },
      { name: "Report generation", description: "SERP analysis", criticality: "critical" },
      { name: "Integrations", description: "Google Docs, WordPress", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Reports stuck generating",
        scope: "partial",
        signal: "New reports stay pending",
        quickCheck: "Try a simple keyword; a universal stall is the analysis backend",
      },
      {
        pattern: "Report credits exhausted",
        scope: "local",
        signal: "New reports refused for your account",
        quickCheck: "Check the plan's report allowance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Clearscope is down",
        alternative: "Surfer SEO, MarketMuse or NeuronWriter (monitored on DownForAI) optimise content for SEO",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "help.clearscope.io was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  contentatscale: {
    slug: "contentatscale",
    providerSummary:
      "Content at Scale (BrandWell) generates long-form articles from keywords with its own multi-model pipeline, on subscription plans. The site blocks direct probes; generation is a queued job.",
    docsUrl: "https://contentatscale.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "contentatscale.ai app", description: "Generator", criticality: "critical" },
      { name: "Generation pipeline", description: "Long-form articles", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Articles stuck generating",
        scope: "partial",
        signal: "Jobs stay in progress for everyone",
        quickCheck: "Try one article; a universal stall is the pipeline",
      },
      {
        pattern: "Post credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the plan's post allowance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Content at Scale is down",
        alternative: "Koala.sh, Writesonic or Agility Writer (monitored on DownForAI) generate long-form content",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "contentatscale.ai refuses automated requests, so DownForAI checks robots.txt reachability only.",
    ],
  },
  "copy-matic": {
    slug: "copy-matic",
    providerSummary:
      "Copymatic is an AI copywriting tool for website copy, blog posts and ads, on word-based plans, relaying to language models. It is a small hosted app with one generation backend.",
    docsUrl: "https://copymatic.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "copymatic.ai web app", description: "Editor", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations failing",
        scope: "partial",
        signal: "Every template errors",
        quickCheck: "Retry a short prompt; a universal failure is the backend",
      },
      {
        pattern: "Word quota exhausted",
        scope: "local",
        signal: "Generation refused with a plan message",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Copymatic is down",
        alternative: "Copy.ai, Rytr or Writesonic (monitored on DownForAI) cover marketing copy",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  copysmith: {
    slug: "copysmith",
    providerSummary:
      "Copysmith is an AI copywriting platform for e-commerce product descriptions and marketing content, with bulk generation and integrations, on subscription plans. Generation relays to language models.",
    docsUrl: "https://copysmith.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "copysmith.ai app", description: "Editor and bulk tools", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Bulk generation stuck",
        scope: "partial",
        signal: "Batches stay in progress",
        quickCheck: "Try a single item; a universal stall is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Copysmith is down",
        alternative: "Hypotenuse AI or Copy.ai (monitored on DownForAI) generate product descriptions",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "frase-io": {
    slug: "frase-io",
    providerSummary:
      "Frase researches SERPs, builds content briefs and writes SEO content with AI, on subscription plans. Research depends on SERP fetching; writing relays to language models.",
    docsUrl: "https://help.frase.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.frase.io", description: "Editor and briefs", criticality: "critical" },
      { name: "SERP research", description: "Search data fetching", criticality: "high" },
      { name: "AI writer", description: "Model relay", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Research not loading",
        scope: "partial",
        signal: "New documents stay 'processing' without SERP results",
        quickCheck: "Try a simple query; a universal stall is the research backend",
      },
      {
        pattern: "AI writer failing while research works",
        scope: "partial",
        signal: "Generation errors; briefs load",
        quickCheck: "Retry later; the model layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Frase is down",
        alternative: "Surfer SEO, Scalenut or MarketMuse (monitored on DownForAI) cover SEO research and writing",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  growthbar: {
    slug: "growthbar",
    providerSummary:
      "GrowthBar was an AI SEO writing and keyword tool; it was acquired by SEOptimer and growthbarseo.com now redirects to SEOptimer's site. Existing users are on the successor product.",
    docsUrl: "https://www.growthbarseo.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "growthbarseo.com → seoptimer.com", description: "Redirect", criticality: "low" },
      { name: "SEOptimer", description: "Successor", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Old GrowthBar app unavailable",
        scope: "global",
        signal: "Bookmarks redirect elsewhere",
        quickCheck: "Expected after the acquisition",
      },
      {
        pattern: "Successor tool errors",
        scope: "partial",
        signal: "SEOptimer's writer fails",
        quickCheck: "Contact SEOptimer support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on GrowthBar",
        alternative: "Surfer SEO, NeuronWriter or Scalenut (monitored on DownForAI) cover AI SEO writing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "growthbarseo.com redirects to seoptimer.com; DownForAI's probe follows the redirect.",
    ],
  },
  headlime: {
    slug: "headlime",
    providerSummary:
      "Headlime generated landing-page copy and headlines with AI; it was acquired by Jasper in 2021 and folded into Jasper's product, and the DB marks it as possibly inactive. The site still answers but the standalone tool is discontinued.",
    docsUrl: "https://headlime.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "headlime.com", description: "Legacy website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Standalone product discontinued",
        scope: "global",
        signal: "No working app behind the site",
        quickCheck: "Use Jasper, which absorbed the product",
      },
      {
        pattern: "Old logins failing",
        scope: "local",
        signal: "Accounts no longer exist",
        quickCheck: "Expected after the acquisition",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Headlime",
        alternative: "Jasper AI, Copy.ai or Anyword (monitored on DownForAI) generate landing-page copy",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Marked POSSIBLY_INACTIVE in the DB; the technical signal is UNVERIFIABLE.",
    ],
  },
  "hoppy-copy": {
    slug: "hoppy-copy",
    providerSummary:
      "Hoppy Copy generates email marketing copy, sequences and newsletters with AI, on subscription plans, relaying to language models. It is a small hosted app with one generation backend.",
    docsUrl: "https://www.hoppycopy.co",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "hoppycopy.co web app", description: "Editor", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations failing",
        scope: "partial",
        signal: "Every template errors",
        quickCheck: "Retry a short prompt; a universal failure is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Hoppy Copy is down",
        alternative: "Copy.ai, Writecream or Jasper AI (monitored on DownForAI) write marketing emails",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "hypotenuse-ai": {
    slug: "hypotenuse-ai",
    providerSummary:
      "Hypotenuse AI generates product descriptions, blog posts and images for e-commerce and marketing teams, with bulk workflows and integrations (Shopify, WordPress), on subscription plans. Generation relays to models; bulk jobs are queued.",
    docsUrl: "https://www.hypotenuse.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.hypotenuse.ai", description: "Editor and bulk tools", criticality: "critical" },
      { name: "Generation backend", description: "Text and image models", criticality: "critical" },
      { name: "Integrations", description: "Shopify, WordPress", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Bulk jobs stuck",
        scope: "partial",
        signal: "Batches stay in progress for everyone",
        quickCheck: "Try a single item; a universal stall is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Hypotenuse is down",
        alternative: "Copysmith or Copy.ai (monitored on DownForAI) generate product content",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  "instantly-ai": {
    slug: "instantly-ai",
    providerSummary:
      "Instantly is a cold-email outreach platform with AI writing, lead database and deliverability tools, sending through connected mailboxes on subscription plans. Its incidents are campaigns not sending and mailbox connections failing.",
    docsUrl: "https://help.instantly.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.instantly.ai", description: "Campaigns and inbox", criticality: "critical" },
      { name: "Sending engine", description: "Email dispatch through connected accounts", criticality: "critical" },
      { name: "AI features and lead finder", description: "Generation and data", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Campaigns not sending",
        scope: "partial",
        signal: "Scheduled emails stay queued across accounts",
        quickCheck: "Check Instantly's status page; sends resume when the engine recovers",
      },
      {
        pattern: "Mailbox disconnected",
        scope: "local",
        signal: "One sending account shows an error",
        quickCheck: "Reconnect the mailbox; provider password or OAuth changes cause this",
      },
      {
        pattern: "AI writer failing while campaigns run",
        scope: "partial",
        signal: "AI generation errors; sending works",
        quickCheck: "Write manually; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Instantly is down",
        alternative: "Smartwriter or Lavender AI (monitored on DownForAI) cover outreach writing; sending can continue from the mailboxes directly",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Google Workspace / Microsoft 365 mailboxes"],
    operatorNotes: [],
  },
  "koala-sh": {
    slug: "koala-sh",
    providerSummary:
      "Koala (koala.sh) writes SEO articles with real-time SERP research and Amazon product data, plus a chat, on credit-based plans. Generation relays to language models; the docs host was unreachable when this entry was written.",
    docsUrl: "https://koala.sh",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "koala.sh web app", description: "Writer and chat", criticality: "critical" },
      { name: "Generation backend", description: "Model relay and SERP data", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Articles stuck generating",
        scope: "partial",
        signal: "Jobs stay in progress for everyone",
        quickCheck: "Try a short article; a universal stall is the backend or its model provider",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Koala is down",
        alternative: "Agility Writer, Writesonic or Copy.ai (monitored on DownForAI) generate SEO articles",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "docs.koala.sh was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  "lavender-ai": {
    slug: "lavender-ai",
    providerSummary:
      "Lavender is an AI email coach that scores and improves sales emails inside Gmail, Outlook and sales tools, on subscription plans. It is a browser extension backed by Lavender's scoring API.",
    docsUrl: "https://www.lavender.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Lavender extension", description: "Inside email clients", criticality: "critical" },
      { name: "Scoring and generation backend", description: "API", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Scores not loading in the email client",
        scope: "partial",
        signal: "The sidebar stays blank for everyone",
        quickCheck: "Reload the mail client; if it stays blank, the backend is degraded",
      },
      {
        pattern: "Extension broken after a client update",
        scope: "local",
        signal: "Lavender no longer appears in Gmail or Outlook",
        quickCheck: "Update the extension and re-login",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Lavender is down",
        alternative: "Smartwriter or Grammarly AI (monitored on DownForAI) help draft and polish sales emails",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Gmail / Outlook"],
    operatorNotes: [],
  },
  marketmuse: {
    slug: "marketmuse",
    providerSummary:
      "MarketMuse plans and optimises content with topic modelling, briefs and competitive analysis, on subscription plans. Its analyses are queued jobs that crawl and model large sets of pages.",
    docsUrl: "https://www.marketmuse.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.marketmuse.com", description: "Research and briefs", criticality: "critical" },
      { name: "Analysis jobs", description: "Crawling and modelling", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Analyses stuck",
        scope: "partial",
        signal: "Briefs or inventories stay pending",
        quickCheck: "Try a small query; a universal stall is the analysis backend",
      },
      {
        pattern: "Query credits exhausted",
        scope: "local",
        signal: "New analyses refused for your account",
        quickCheck: "Check the plan's query allowance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "MarketMuse is down",
        alternative: "Clearscope, Surfer SEO or Frase.io (monitored on DownForAI) cover content optimisation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "mutiny-ai": {
    slug: "mutiny-ai",
    providerSummary:
      "Mutiny personalises B2B websites per visitor and account with AI, through a JavaScript snippet and integrations with CRMs and ad platforms. Incidents can affect the customer's live site rendering, so it fails safe to the default page.",
    docsUrl: "https://www.mutinyhq.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Mutiny snippet / edge", description: "On-site personalisation", criticality: "critical" },
      { name: "Mutiny app", description: "Experiences and analytics", criticality: "high" },
      { name: "Data integrations", description: "CRM, enrichment, ads", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Personalisation not rendering",
        scope: "partial",
        signal: "Visitors see the default page for every experience",
        quickCheck: "Check the snippet loads in the browser; the platform fails safe to defaults",
      },
      {
        pattern: "Account data stale",
        scope: "local",
        signal: "Audiences do not update from the CRM",
        quickCheck: "Check the CRM integration's sync",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Mutiny is down",
        alternative: "HubSpot AI (monitored on DownForAI) offers basic personalisation; your site keeps serving default pages meanwhile",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["CRM and enrichment providers"],
    operatorNotes: [],
  },
  narrato: {
    slug: "narrato",
    providerSummary:
      "Narrato was an AI content workflow platform for marketing teams; narrato.io now redirects to typeface.ai after the company joined Typeface. Existing workspaces are on the successor platform.",
    docsUrl: "https://narrato.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "narrato.io → typeface.ai", description: "Redirect", criticality: "low" },
      { name: "Typeface platform", description: "Successor", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Old Narrato workspace unavailable",
        scope: "global",
        signal: "Logins redirect to Typeface",
        quickCheck: "Expected after the acquisition",
      },
      {
        pattern: "Successor generation failing",
        scope: "partial",
        signal: "Typeface content generation errors",
        quickCheck: "Contact Typeface support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Narrato",
        alternative: "Jasper AI, Writer.com or Copy.ai (monitored on DownForAI) cover content workflows",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "narrato.io redirects to typeface.ai; DownForAI's probe follows the redirect.",
    ],
  },
  neuronwriter: {
    slug: "neuronwriter",
    providerSummary:
      "NeuronWriter is an SEO writing assistant with NLP-based content scoring, competitor analysis and AI drafting, on subscription plans. Analyses fetch SERP data; drafting relays to language models.",
    docsUrl: "https://neuronwriter.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.neuronwriter.com", description: "Editor and analyses", criticality: "critical" },
      { name: "Analysis backend", description: "SERP and NLP processing", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Analyses stuck",
        scope: "partial",
        signal: "New queries stay processing for everyone",
        quickCheck: "Try a simple keyword; a universal stall is the backend",
      },
      {
        pattern: "AI drafting failing while scoring works",
        scope: "partial",
        signal: "Generation errors; scores update",
        quickCheck: "Retry later; the model layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "NeuronWriter is down",
        alternative: "Surfer SEO, Clearscope or Outranking (monitored on DownForAI) cover SEO content scoring",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  outranking: {
    slug: "outranking",
    providerSummary:
      "Outranking plans, writes and optimises SEO content with AI briefs and scoring, on subscription plans; the site blocks direct probes. Research fetches SERP data and writing relays to language models.",
    docsUrl: "https://www.outranking.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.outranking.io", description: "Editor and briefs", criticality: "critical" },
      { name: "Research and generation backend", description: "SERP data and model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Documents stuck in research",
        scope: "partial",
        signal: "New documents never finish loading SERP data",
        quickCheck: "Try a simple keyword; a universal stall is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Outranking is down",
        alternative: "Scalenut, Frase.io or Surfer SEO (monitored on DownForAI) cover SEO content planning",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "outranking.io refuses automated requests, so DownForAI checks robots.txt reachability only.",
    ],
  },
  "peppertype-ai": {
    slug: "peppertype-ai",
    providerSummary:
      "Peppertype is Pepper Content's AI writing tool for marketing teams; peppercontent.io now redirects to pepper.inc, where the product lives inside Pepper's content platform. Generation relays to language models.",
    docsUrl: "https://www.peppercontent.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "pepper.inc platform", description: "Content marketplace and AI tools", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI generation failing",
        scope: "partial",
        signal: "Templates error for everyone",
        quickCheck: "Retry a short prompt; a universal failure is the backend",
      },
      {
        pattern: "Old Peppertype links broken",
        scope: "local",
        signal: "Bookmarks redirect to pepper.inc",
        quickCheck: "Sign in on the new domain",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Peppertype is down",
        alternative: "Copy.ai, Jasper AI or Writesonic (monitored on DownForAI) cover marketing writing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "peppercontent.io redirects to pepper.inc; DownForAI's probe follows the redirect.",
    ],
  },
  phrasee: {
    slug: "phrasee",
    providerSummary:
      "Phrasee optimised marketing language (subject lines, push, ads) with AI for enterprise brands; it rebranded as Jacquard and phrasee.co now redirects to jacquard.com. Customers are on the successor platform.",
    docsUrl: "https://phrasee.co",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "phrasee.co → jacquard.com", description: "Redirect", criticality: "low" },
      { name: "Jacquard platform", description: "Successor", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Old Phrasee integrations failing",
        scope: "local",
        signal: "Legacy API keys or connectors error",
        quickCheck: "Migrate to Jacquard's endpoints",
      },
      {
        pattern: "Jacquard platform incident",
        scope: "partial",
        signal: "Copy generation or experiments fail",
        quickCheck: "Contact Jacquard support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Phrasee",
        alternative: "Anyword or Jasper AI (monitored on DownForAI) generate optimised marketing copy",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "phrasee.co redirects to jacquard.com; DownForAI's probe follows the redirect.",
    ],
  },
  "predis-ai": {
    slug: "predis-ai",
    providerSummary:
      "Predis.ai generates social media posts, reels and ad creatives from prompts and product links, with scheduling, on credit-based plans. Generation combines text and image models; publishing depends on social platform connections.",
    docsUrl: "https://predis.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "predis.ai web app", description: "Generator and scheduler", criticality: "critical" },
      { name: "Generation backend", description: "Text and image models", criticality: "critical" },
      { name: "Social integrations", description: "Publishing", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Posts stuck generating",
        scope: "partial",
        signal: "Creatives stay pending for everyone",
        quickCheck: "Try a simple prompt; a universal stall is the backend",
      },
      {
        pattern: "Publishing to a network failing",
        scope: "local",
        signal: "Scheduled posts do not go out on one platform",
        quickCheck: "Reconnect the social account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Predis is down",
        alternative: "Simplified or Canva AI (monitored on DownForAI) create and schedule social content",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Social platform APIs", "Third-party model providers"],
    operatorNotes: [],
  },
  scalenut: {
    slug: "scalenut",
    providerSummary:
      "Scalenut is an SEO and content-marketing platform (keyword planning, briefs, AI writing, optimisation), on subscription plans. Research fetches SERP data; writing relays to language models.",
    docsUrl: "https://www.scalenut.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.scalenut.com", description: "Planner and editor", criticality: "critical" },
      { name: "Research and generation backend", description: "SERP data and model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Research or generation stuck",
        scope: "partial",
        signal: "Briefs or articles stay processing for everyone",
        quickCheck: "Try a simple keyword; a universal stall is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Scalenut is down",
        alternative: "Frase.io, Surfer SEO or Outranking (monitored on DownForAI) cover SEO content workflows",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "seamless-ai": {
    slug: "seamless-ai",
    providerSummary:
      "Seamless.AI is a sales-intelligence platform that finds and verifies B2B contact data with AI, via a web app and browser extension, on credit-based plans. Its incidents are searches failing and data credits not applying.",
    docsUrl: "https://seamless.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Seamless.AI app and extension", description: "Search and enrichment", criticality: "critical" },
      { name: "Data backend", description: "Contact lookup and verification", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Searches failing or returning no results",
        scope: "partial",
        signal: "Lookups error for everyone",
        quickCheck: "Retry later; a universal failure is the data backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Lookups refused with a credit message for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Seamless.AI is down",
        alternative: "Instantly AI (monitored on DownForAI) includes a lead database; export existing lists meanwhile",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "seo-ai": {
    slug: "seo-ai",
    providerSummary:
      "SEO.ai writes and optimises SEO content with keyword research and scoring, on subscription plans. Research fetches SERP data; writing relays to language models.",
    docsUrl: "https://seo.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "seo.ai web app", description: "Editor", criticality: "critical" },
      { name: "Research and generation backend", description: "SERP data and model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation stuck",
        scope: "partial",
        signal: "Articles stay processing for everyone",
        quickCheck: "Try a short article; a universal stall is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SEO.ai is down",
        alternative: "Surfer SEO, NeuronWriter or Koala.sh (monitored on DownForAI) cover SEO writing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  simplified: {
    slug: "simplified",
    providerSummary:
      "Simplified is an all-in-one marketing platform (AI writer, design, video, social scheduling), on freemium plans. Its many tools share one backend; each generator can fail independently.",
    docsUrl: "https://simplified.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.simplified.com", description: "Tools", criticality: "critical" },
      { name: "Generation backends", description: "Text, image, video", criticality: "critical" },
      { name: "Social scheduling", description: "Publishing", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One tool failing while others work",
        scope: "partial",
        signal: "For example the video generator stalls but the writer works",
        quickCheck: "Try another tool; a single-tool failure is that backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "AI features refused for your account",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Simplified is down",
        alternative: "Canva AI or Predis.ai (monitored on DownForAI) cover design and social content",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers", "Social platform APIs"],
    operatorNotes: [],
  },
  smartwriter: {
    slug: "smartwriter",
    providerSummary:
      "Smartwriter generates personalised cold emails and LinkedIn messages by researching each prospect with AI, on credit-based plans. Research scrapes public data; writing relays to language models.",
    docsUrl: "https://smartwriter.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "smartwriter.ai web app", description: "Campaigns", criticality: "critical" },
      { name: "Research and generation backend", description: "Scraping and model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Personalisation jobs stuck",
        scope: "partial",
        signal: "Prospect lists stay processing for everyone",
        quickCheck: "Try a small list; a universal stall is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Smartwriter is down",
        alternative: "Instantly AI, Lavender AI or Writecream (monitored on DownForAI) help with outreach copy",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers", "LinkedIn and web data"],
    operatorNotes: [],
  },
  "surfer-seo": {
    slug: "surfer-seo",
    providerSummary:
      "Surfer SEO optimises content against SERP data with its content editor, audits and AI writer, on subscription plans. Its analyses fetch search data; the AI writer relays to language models.",
    docsUrl: "https://surferseo.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.surferseo.com", description: "Editor and audits", criticality: "critical" },
      { name: "SERP analysis backend", description: "Search data", criticality: "critical" },
      { name: "Surfer AI", description: "Model relay", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Content editor not loading guidelines",
        scope: "partial",
        signal: "New editors stay analysing for everyone",
        quickCheck: "Try a simple keyword; a universal stall is the analysis backend",
      },
      {
        pattern: "Surfer AI articles failing while the editor works",
        scope: "partial",
        signal: "AI generation errors; guidelines load",
        quickCheck: "Retry later; the model layer is separate",
      },
      {
        pattern: "Editor credits exhausted",
        scope: "local",
        signal: "New editors refused for your account",
        quickCheck: "Check the plan's editor allowance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Surfer is down",
        alternative: "Clearscope, NeuronWriter or Frase.io (monitored on DownForAI) cover content optimisation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "help.surferseo.com was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  wordtune: {
    slug: "wordtune",
    providerSummary:
      "Wordtune (AI21 Labs) rewrites, summarises and expands text through a web editor, browser extension and mobile keyboard, on freemium plans. Rewrites relay to AI21's models.",
    docsUrl: "https://support.wordtune.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Wordtune editor and extension", description: "Clients", criticality: "critical" },
      { name: "Rewrite backend", description: "AI21 models", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Rewrites not loading",
        scope: "partial",
        signal: "Suggestions stay empty for everyone",
        quickCheck: "Retry later; the model backend is degraded",
      },
      {
        pattern: "Daily rewrite limit reached",
        scope: "local",
        signal: "Suggestions refused with a limit message for your account",
        quickCheck: "Free plans cap daily rewrites",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Wordtune is down",
        alternative: "QuillBot or Grammarly AI (monitored on DownForAI) rewrite and polish text",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["AI21 Labs models"],
    operatorNotes: [],
  },
  writecream: {
    slug: "writecream",
    providerSummary:
      "Writecream generates marketing content, personalised outreach and voiceovers with AI, on credit-based plans, relaying to language and speech models. It is a small hosted app with several generators.",
    docsUrl: "https://www.writecream.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "writecream.com web app", description: "Generators", criticality: "critical" },
      { name: "Generation backends", description: "Text and speech relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations failing",
        scope: "partial",
        signal: "Every tool errors",
        quickCheck: "Retry a short prompt; a universal failure is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Writecream is down",
        alternative: "Copy.ai, Rytr or Smartwriter (monitored on DownForAI) cover marketing and outreach copy",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  "writer-com": {
    slug: "writer-com",
    providerSummary:
      "Writer is an enterprise generative AI platform (Palmyra models, agents, brand-governed writing) with a web app, extensions and an API, on enterprise contracts. Incidents are app or API errors seen by enterprise tenants.",
    docsUrl: "https://dev.writer.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.writer.com", description: "Workspace", criticality: "critical" },
      { name: "Writer API", description: "Palmyra models and agents", criticality: "critical" },
      { name: "Extensions", description: "Browser and Office", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation failing in the app or API",
        scope: "partial",
        signal: "Requests error across apps and workspaces",
        quickCheck: "Check Writer's status page; retry with backoff",
      },
      {
        pattern: "Extension not authenticating",
        scope: "local",
        signal: "The browser extension loops on login",
        quickCheck: "Sign out and in; check SSO settings with your admin",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Writer is down",
        alternative: "Jasper AI or Grammarly AI (monitored on DownForAI) offer governed enterprise writing",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  zimmwriter: {
    slug: "zimmwriter",
    providerSummary:
      "ZimmWriter is a Windows desktop app for bulk SEO article generation that uses your own OpenAI (and other) API keys, sold as a lifetime licence. The app runs locally; failures are provider errors, licence checks or scraping blocks, and its site blocks probes.",
    docsUrl: "https://zimmwriter.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ZimmWriter desktop app", description: "Local generation", criticality: "critical" },
      { name: "Your model providers", description: "OpenAI and others", criticality: "critical" },
      { name: "Licence server", description: "Activation", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Provider errors in bulk runs",
        scope: "local",
        signal: "Articles fail with OpenAI rate-limit or key errors",
        quickCheck: "Check the provider's status and your key's limits",
      },
      {
        pattern: "Licence activation failing",
        scope: "local",
        signal: "The app cannot validate the licence",
        quickCheck: "Check connectivity to the licence server; contact support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ZimmWriter cannot run",
        alternative: "Koala.sh or Autoblogging.ai (monitored on DownForAI) generate bulk articles as hosted services",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI API and other providers"],
    operatorNotes: [
      "zimmwriter.com blocks DownForAI's probes; the app is local, so the technical signal is not meaningful for this service.",
    ],
  },
};
