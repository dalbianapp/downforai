import type { TopServiceContent } from "@/content/top-services/types";

// SEARCH — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start search-2.ts and register it in ./index.ts if it grows.
export const SEARCH: Record<string, TopServiceContent> = {
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
  "arc-search": {
    slug: "arc-search",
    providerSummary:
      "The Browser Company's AI-native browser and search. 'Browse for me' feature summarizes pages with AI.",
    docsUrl: "https://resources.arc.net",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "arc.net", description: "Arc browser and web interface", criticality: "critical" },
      { name: "Arc Search Mobile App", description: "iOS mobile search app", criticality: "critical" },
      { name: "AI Browsing Backend", description: "Browse for me AI summarization", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "'Browse for me' failures",
        scope: "global",
        signal: "AI summarization fails or returns empty",
        quickCheck: "Fall back to standard browser view; check Arc status",
      },
      {
        pattern: "AI summary inaccuracies",
        scope: "local",
        signal: "Summary doesn't reflect page content",
        quickCheck: "Not always an outage — view original page to verify",
      },
      {
        pattern: "Extension compatibility issues",
        scope: "local",
        signal: "Arc extensions conflict with AI features",
        quickCheck: "Disable extensions; test in clean Arc profile",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Arc Search AI is degraded",
        alternative:
          "Perplexity, Kagi, or Brave Search AI can reduce downtime for AI-powered search",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  kagi: {
    slug: "kagi",
    providerSummary:
      "Premium ad-free search engine with AI features. Summarizer, FastGPT, Universal Summarizer.",
    officialStatusUrl: "https://status.kagi.com",
    docsUrl: "https://help.kagi.com",
    pricingUrl: "https://kagi.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "kagi.com", description: "Web search interface", criticality: "critical" },
      { name: "Search Backend", description: "Search index and ranking", criticality: "critical" },
      { name: "AI Summarizer", description: "Kagi Summarizer and FastGPT", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Search index staleness",
        scope: "global",
        signal: "Search results missing recent content",
        quickCheck: "Check status.kagi.com; use Google as temporary fallback",
      },
      {
        pattern: "AI Summarizer timeouts",
        scope: "global",
        signal: "Summarizer hangs or fails to return results",
        quickCheck: "Check AI features status; use search results without summary",
      },
      {
        pattern: "Session/auth issues",
        scope: "local",
        signal: "Login or session unexpectedly expires",
        quickCheck: "Clear cookies; re-authenticate with Kagi account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kagi is degraded",
        alternative:
          "Perplexity, DuckDuckGo, or Brave Search can reduce downtime for private search",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  afforai: {
    slug: "afforai",
    providerSummary:
      "Afforai is an AI research assistant for searching, summarising and chatting with documents and papers; it rebranded and afforai.com now redirects to logically.app. Users of the old brand are on the successor platform and its credits.",
    docsUrl: "https://afforai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "afforai.com → logically.app", description: "Web app", criticality: "critical" },
      { name: "Document processing and model relay", description: "Indexing and answers", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Documents stuck processing",
        scope: "partial",
        signal: "Uploads never become queryable",
        quickCheck: "Try a small file; a universal stall is the backend",
      },
      {
        pattern: "Old links or logins broken after the rebrand",
        scope: "local",
        signal: "Bookmarks fail on the new domain",
        quickCheck: "Sign in on logically.app; account migration is expected",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Afforai / Logically is down",
        alternative: "Elicit, SciSpace or Humata (monitored on DownForAI) search and summarise documents",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [
      "afforai.com redirects to logically.app; DownForAI's probe follows the redirect.",
    ],
  },
  "algolia-ai": {
    slug: "algolia-ai",
    providerSummary:
      "Algolia is a hosted search API (with NeuralSearch and AI recommendations) serving queries from distributed clusters, with a status page. Incidents are cluster or regional events that affect customer search boxes directly.",
    officialStatusUrl: "https://status.algolia.com",
    docsUrl: "https://www.algolia.com/doc/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Algolia search API", description: "Query serving", criticality: "critical" },
      { name: "Indexing API", description: "Record updates", criticality: "high" },
      { name: "Dashboard", description: "Configuration", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Search queries failing on a cluster",
        scope: "partial",
        signal: "Customer search boxes error; status.algolia.com lists a cluster incident",
        quickCheck: "The client retries across replicas automatically; check the status page",
      },
      {
        pattern: "Indexing delayed",
        scope: "partial",
        signal: "Record updates take long to appear in results",
        quickCheck: "Check the indexing component on the status page",
      },
      {
        pattern: "Operations quota exceeded",
        scope: "local",
        signal: "Requests rejected for your application",
        quickCheck: "Check the plan's operations usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Algolia is down",
        alternative: "Elastic AI Search or Coveo AI (monitored on DownForAI) are hosted search alternatives",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "andi-search": {
    slug: "andi-search",
    providerSummary:
      "Andi is a conversational search engine that answers questions with generated summaries and links, free to use. It relays to language models and search indexes, so failures are answers not generating or results empty.",
    docsUrl: "https://andisearch.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "andisearch.com", description: "Search UI", criticality: "critical" },
      { name: "Answer generation", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Answers not generating while links appear",
        scope: "partial",
        signal: "Results list but the summary stays empty",
        quickCheck: "Retry later; the model layer is separate from search",
      },
      {
        pattern: "Site slow or unreachable",
        scope: "global",
        signal: "Queries time out for everyone",
        quickCheck: "Nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Andi is down",
        alternative: "Perplexity, You.com or Brave Search AI (monitored on DownForAI) offer AI answers with sources",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  anyscale: {
    slug: "anyscale",
    providerSummary:
      "Anyscale is the managed platform for Ray (distributed compute for training, serving and batch inference) running in the customer's cloud account with Anyscale's control plane. Failures split between the control plane and cloud capacity in your account.",
    docsUrl: "https://docs.anyscale.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Anyscale control plane", description: "Console, jobs, services", criticality: "critical" },
      { name: "Customer cloud clusters", description: "Ray clusters", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cluster launch failing on cloud capacity",
        scope: "local",
        signal: "Ray clusters cannot get GPU instances in your account's region",
        quickCheck: "Check the cloud quota and try another instance type; this is your cloud account",
      },
      {
        pattern: "Control plane errors",
        scope: "partial",
        signal: "The console or job submission fails while running clusters continue",
        quickCheck: "Wait; running Ray jobs keep going",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Anyscale is unavailable",
        alternative: "Modal or Databricks (monitored on DownForAI) cover distributed AI compute; Ray can also run on your own Kubernetes",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Customer cloud accounts"],
    operatorNotes: [
      "Categorised under Search in DownForAI's database although it is a compute platform.",
    ],
  },
  "brave-search-ai": {
    slug: "brave-search-ai",
    providerSummary:
      "Brave Search runs its own web index with 'Answer with AI' summaries, plus the Brave Search API used by many AI apps. Consumer answers and the API share the index but fail differently: answers can be withheld while results serve, and the API has strict plan limits.",
    docsUrl: "https://brave.com/search/api/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "search.brave.com", description: "Consumer search", criticality: "critical" },
      { name: "Brave Search API", description: "Developer access", criticality: "high" },
      { name: "AI answers", description: "Summaries on results", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI answer not shown while results load",
        scope: "partial",
        signal: "The summary box is missing or errors for everyone",
        quickCheck: "Results remain usable; the answer generator is separate",
      },
      {
        pattern: "API 429 on the plan's quota",
        scope: "local",
        signal: "Requests rejected for your key",
        quickCheck: "Check the plan's monthly and per-second limits",
      },
      {
        pattern: "Search unreachable",
        scope: "global",
        signal: "search.brave.com times out",
        quickCheck: "Check Brave's status page; nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Brave Search is down",
        alternative: "Kagi or You.com (monitored on DownForAI) for consumer search; Tavily or Exa for API use",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "coveo-ai": {
    slug: "coveo-ai",
    providerSummary:
      "Coveo is an enterprise search and relevance platform (AI ranking, generative answering) serving queries for commerce and support sites from Coveo's cloud regions. Incidents affect customer search results and are announced on Coveo's status page.",
    docsUrl: "https://docs.coveo.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Coveo search API (regional)", description: "Query serving", criticality: "critical" },
      { name: "Indexing and sources", description: "Content crawling", criticality: "high" },
      { name: "Administration console", description: "Configuration", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Search results failing on customer sites",
        scope: "partial",
        signal: "Search boxes error or return empty in a region",
        quickCheck: "Check Coveo's status page for the region",
      },
      {
        pattern: "Source indexing stalled",
        scope: "local",
        signal: "New content does not appear in results",
        quickCheck: "Check the source's last rebuild in the console",
      },
      {
        pattern: "Generative answering unavailable while search works",
        scope: "partial",
        signal: "Relevance Generative Answering errors; results serve",
        quickCheck: "The generative layer is separate; retry later",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Coveo is down",
        alternative: "Algolia AI or Elastic AI Search (monitored on DownForAI) are hosted search alternatives",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Third-party model providers for generative answering"],
    operatorNotes: [
      "Coveo publishes its own status page; DownForAI probes coveo.com only.",
    ],
  },
  dashworks: {
    slug: "dashworks",
    providerSummary:
      "Dashworks is an AI knowledge assistant that answers questions across a company's apps (Slack, Google Drive, Notion, Confluence) through connectors, in a web app and Slack bot. Answers depend on connector syncs and model providers.",
    docsUrl: "https://www.dashworks.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Dashworks app and Slack bot", description: "Clients", criticality: "critical" },
      { name: "Connectors", description: "Syncs from company apps", criticality: "high" },
      { name: "Answer generation", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Answers missing recent content",
        scope: "partial",
        signal: "Documents added today are not found",
        quickCheck: "Check the connector's last sync in settings",
      },
      {
        pattern: "Slack bot silent while the web app works",
        scope: "partial",
        signal: "Mentions get no reply",
        quickCheck: "Check Slack's status and the app installation",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dashworks is down",
        alternative: "Glean AI or Notion AI (monitored on DownForAI) answer over company knowledge",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Slack, Google Drive, Notion and other APIs", "Model providers"],
    operatorNotes: [],
  },
  "elastic-ai": {
    slug: "elastic-ai",
    providerSummary:
      "Elastic's AI search (Elasticsearch with vector search, ELSER and the Elastic AI Assistant) runs on Elastic Cloud or self-managed clusters. Elastic Cloud incidents are regional and published on an Atlassian status page; self-managed availability is your own.",
    officialStatusUrl: "https://status.elastic.co",
    docsUrl: "https://www.elastic.co/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Elastic Cloud deployments (regional)", description: "Managed clusters", criticality: "critical" },
      { name: "Self-managed clusters", description: "User-run", criticality: "medium" },
      { name: "ML nodes / ELSER", description: "Inference for semantic search", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Deployment degraded in a region",
        scope: "partial",
        signal: "Queries fail for deployments in one region; status.elastic.co lists it",
        quickCheck: "Check the status page",
      },
      {
        pattern: "Inference endpoints failing while keyword search works",
        scope: "partial",
        signal: "Semantic queries error on ML nodes; lexical queries succeed",
        quickCheck: "Check ML node capacity and the inference endpoint's status",
      },
      {
        pattern: "AI Assistant not answering",
        scope: "partial",
        signal: "The assistant errors while Kibana works",
        quickCheck: "Check the connector to the LLM provider",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Elastic Cloud is down",
        alternative: "OpenSearch kNN or Algolia AI (monitored on DownForAI) offer alternative search platforms",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Model providers for the AI Assistant"],
    operatorNotes: [],
  },
  elicit: {
    slug: "elicit",
    providerSummary:
      "Elicit is an AI research assistant that searches academic papers, extracts data into tables and writes reports, on freemium plans with credits. Search, extraction and report generation are separate steps that can fail independently.",
    docsUrl: "https://support.elicit.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "elicit.com web app", description: "Search and tables", criticality: "critical" },
      { name: "Extraction and report generation", description: "Model relay", criticality: "critical" },
      { name: "Paper index", description: "Search backend", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Extractions stuck",
        scope: "partial",
        signal: "Table columns stay loading for every paper",
        quickCheck: "Try one column on a few papers; a universal stall is the extraction backend",
      },
      {
        pattern: "Search returns nothing",
        scope: "partial",
        signal: "Queries error or come back empty",
        quickCheck: "Try a simple query; a universal failure is the index",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Actions refused with a credit message for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Elicit is down",
        alternative: "Consensus, SciSpace or Perplexity (monitored on DownForAI) search and summarise research",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  "exa-ai": {
    slug: "exa-ai",
    providerSummary:
      "Exa (formerly Metaphor) is a neural web-search API built for LLM apps, with search, content retrieval and research endpoints on usage-based plans. Developers see incidents as API errors, latency or rate limits.",
    docsUrl: "https://docs.exa.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Exa API", description: "Search and contents endpoints", criticality: "critical" },
      { name: "Dashboard", description: "Keys and usage", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API 5xx or elevated latency",
        scope: "partial",
        signal: "Searches fail or slow down across keys",
        quickCheck: "Retry with backoff; check Exa's status page",
      },
      {
        pattern: "429 rate limits or balance exhausted",
        scope: "local",
        signal: "Requests rejected for your key",
        quickCheck: "Check the plan's limits and balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Exa is down",
        alternative: "Tavily or Brave Search AI (monitored on DownForAI) offer search APIs for agents",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Metaphor Systems is tracked as a separate legacy entry on DownForAI.",
    ],
  },
  "glean-ai": {
    slug: "glean-ai",
    providerSummary:
      "Glean is an enterprise AI search and assistant platform indexing a company's apps through connectors, sold to enterprises with per-tenant deployments. Incidents are seen by tenants as search or assistant errors and connector sync gaps.",
    docsUrl: "https://docs.glean.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Glean tenant (web app, browser extension, Slack)", description: "Clients", criticality: "critical" },
      { name: "Connectors and indexing", description: "Data sources", criticality: "high" },
      { name: "Assistant / model providers", description: "Generative answers", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Search unavailable for the tenant",
        scope: "partial",
        signal: "Queries error for everyone in the company",
        quickCheck: "Check Glean's status page and the admin console",
      },
      {
        pattern: "Recent documents missing",
        scope: "local",
        signal: "New content is not found",
        quickCheck: "Check the data source's crawl status in the admin console",
      },
      {
        pattern: "Assistant answers failing while search works",
        scope: "partial",
        signal: "Generative answers error; results list",
        quickCheck: "The model layer is separate; retry later",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Glean is down",
        alternative: "Dashworks or Notion AI (monitored on DownForAI) answer over company knowledge",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Company app APIs", "Model providers"],
    operatorNotes: [
      "Glean publishes its own status page; DownForAI probes glean.com only.",
    ],
  },
  hebbia: {
    slug: "hebbia",
    providerSummary:
      "Hebbia (Matrix) is an AI platform for analysing large document sets, used mainly by financial and legal teams under enterprise contracts; hebbia.ai redirects to hebbia.com. Incidents are seen by enterprise users as document processing or analysis delays.",
    docsUrl: "https://www.hebbia.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Hebbia Matrix", description: "Web platform", criticality: "critical" },
      { name: "Document processing", description: "Ingestion and indexing", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Documents stuck processing",
        scope: "partial",
        signal: "Uploads never become queryable",
        quickCheck: "Try a small file; a universal stall is the pipeline",
      },
      {
        pattern: "Matrix columns failing to populate",
        scope: "partial",
        signal: "Analysis cells stay loading",
        quickCheck: "Retry a single cell; if all fail, the model layer is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Hebbia is unavailable",
        alternative: "Humata or Elicit (monitored on DownForAI) analyse documents at smaller scale",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [
      "hebbia.ai redirects to hebbia.com; DownForAI's probe follows the redirect.",
    ],
  },
  metaphor: {
    slug: "metaphor",
    providerSummary:
      "Metaphor Systems was the original name of Exa's neural search API; metaphor.systems redirects to exa.ai and the Metaphor API endpoints were retired in favour of Exa's. This entry is a legacy alias.",
    docsUrl: "https://metaphor.systems",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "metaphor.systems → exa.ai", description: "Redirect", criticality: "low" },
      { name: "Exa API", description: "Successor", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Legacy Metaphor endpoints failing",
        scope: "global",
        signal: "Old SDK calls return errors",
        quickCheck: "Migrate to the Exa SDK; the endpoints were retired",
      },
      {
        pattern: "Exa API incident",
        scope: "partial",
        signal: "Searches fail on the successor API",
        quickCheck: "Check the Exa page on DownForAI",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You still use Metaphor",
        alternative: "Exa or Tavily (monitored on DownForAI) provide search APIs for LLM apps",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Legacy DB entry: metaphor.systems redirects to exa.ai, which is tracked as Exa.",
    ],
  },
  nuclia: {
    slug: "nuclia",
    providerSummary:
      "Nuclia was a RAG-as-a-service platform for building semantic search into applications; it was acquired by Progress Software and nuclia.com now redirects to Progress's Agentic RAG pages, with docs under progress.cloud. Existing Nuclia knowledge boxes live on under the new brand.",
    docsUrl: "https://docs.nuclia.dev",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "nuclia.com → progress.com", description: "Website redirect", criticality: "low" },
      { name: "Nuclia / Progress RAG API", description: "Knowledge boxes", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Knowledge box queries failing",
        scope: "partial",
        signal: "Search or answer calls error across boxes",
        quickCheck: "Check the Progress cloud dashboard; migration-related changes are expected after the acquisition",
      },
      {
        pattern: "Ingestion delayed",
        scope: "partial",
        signal: "Uploaded resources stay pending",
        quickCheck: "Wait; processing is asynchronous",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Nuclia is unavailable",
        alternative: "Vectara or Marqo (monitored on DownForAI) offer hosted RAG and semantic search",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Progress Software cloud"],
    operatorNotes: [
      "nuclia.com redirects to progress.com; DownForAI's probe follows the redirect.",
    ],
  },
  searchgpt: {
    slug: "searchgpt",
    providerSummary:
      "SearchGPT is OpenAI's web search inside ChatGPT (chatgpt.com/search and the search toggle), available to all ChatGPT users. It shares ChatGPT's infrastructure and follows the OpenAI status page; searches can fail while plain chat works.",
    officialStatusUrl: "https://status.openai.com",
    docsUrl: "https://chatgpt.com/search",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ChatGPT search", description: "Search mode", criticality: "critical" },
      { name: "OpenAI platform", description: "Shared infrastructure", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Searches failing while chat works",
        scope: "partial",
        signal: "Search-enabled answers error or return without sources for everyone",
        quickCheck: "Check status.openai.com for a search component incident",
      },
      {
        pattern: "ChatGPT-wide incident",
        scope: "global",
        signal: "ChatGPT itself is degraded; search fails with it",
        quickCheck: "Check the status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SearchGPT is unavailable",
        alternative: "Perplexity, You.com or Google Gemini (monitored on DownForAI) offer AI search with sources",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI platform"],
    operatorNotes: [
      "chatgpt.com refuses automated probes (403); the OpenAI status page is the reliable signal.",
    ],
  },
  tavily: {
    slug: "tavily",
    providerSummary:
      "Tavily is a search and web-extraction API built for AI agents and RAG, on credit-based plans. Developers see incidents as API errors, latency or exhausted credits.",
    docsUrl: "https://docs.tavily.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Tavily API", description: "Search, extract, crawl", criticality: "critical" },
      { name: "Dashboard", description: "Keys and usage", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API 5xx or timeouts",
        scope: "partial",
        signal: "Searches fail across keys",
        quickCheck: "Retry with backoff; check Tavily's status page",
      },
      {
        pattern: "Credits exhausted or 429",
        scope: "local",
        signal: "Requests rejected for your key",
        quickCheck: "Check the plan's credits and rate limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Tavily is down",
        alternative: "Exa or Brave Search AI (monitored on DownForAI) offer search APIs for agents",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  vectara: {
    slug: "vectara",
    providerSummary:
      "Vectara is a RAG-as-a-service platform (ingestion, hybrid retrieval, grounded generation with hallucination detection) used through an API and console. Its incidents are query API errors, indexing delays and generation failures.",
    docsUrl: "https://docs.vectara.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Vectara API", description: "Query and indexing", criticality: "critical" },
      { name: "Grounded generation", description: "LLM summaries", criticality: "high" },
      { name: "Console", description: "Corpora and keys", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queries failing or slow",
        scope: "partial",
        signal: "Retrieval calls error across corpora",
        quickCheck: "Retry with backoff; check Vectara's status page",
      },
      {
        pattern: "Generation failing while retrieval works",
        scope: "partial",
        signal: "Results return but summaries error",
        quickCheck: "Disable generation for the query; the LLM layer is separate",
      },
      {
        pattern: "Indexing delayed",
        scope: "partial",
        signal: "New documents are not searchable",
        quickCheck: "Wait; indexing is asynchronous",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vectara is down",
        alternative: "Nuclia or Marqo (monitored on DownForAI) offer hosted RAG search; Pinecone plus an LLM API is the DIY route",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "voyage-ai": {
    slug: "voyage-ai",
    providerSummary:
      "Voyage AI provides embedding and reranking models through an API (also available inside MongoDB after the 2025 acquisition). Developers see incidents as API errors or rate limits on specific models.",
    docsUrl: "https://docs.voyageai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Voyage API", description: "Embeddings and rerankers", criticality: "critical" },
      { name: "Dashboard", description: "Keys and usage", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "5xx or latency on one model",
        scope: "partial",
        signal: "A specific embedding model errors while others respond",
        quickCheck: "Switch model; retry with backoff",
      },
      {
        pattern: "429 rate limits",
        scope: "local",
        signal: "Requests rejected for your key",
        quickCheck: "Check the account's tokens-per-minute limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Voyage is down",
        alternative: "Cohere, Jina AI or OpenAI API (monitored on DownForAI) provide embeddings and rerankers",
        switchingCost: "medium",
        note: "Changing embedding models requires re-indexing",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "you-com": {
    slug: "you-com",
    providerSummary:
      "You.com is an AI search engine and assistant with chat, research and agent modes over many third-party models, plus an API for developers. This entry tracks the search product; YouChat is tracked separately as the assistant.",
    docsUrl: "https://you.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "you.com", description: "Search and chat", criticality: "critical" },
      { name: "Model relay", description: "Third-party providers", criticality: "critical" },
      { name: "You.com API", description: "Developer search endpoints", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One model errors while others answer",
        scope: "partial",
        signal: "Switching the model restores replies",
        quickCheck: "Change model; the failure is upstream",
      },
      {
        pattern: "Research mode slow or failing",
        scope: "partial",
        signal: "Web-grounded answers time out while plain chat works",
        quickCheck: "Disable research for the query",
      },
      {
        pattern: "API 429",
        scope: "local",
        signal: "Developer requests rejected for your key",
        quickCheck: "Check the plan's limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You.com is down",
        alternative: "Perplexity or Brave Search AI (monitored on DownForAI) offer AI search with sources",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [
      "YouChat (LLM category) tracks the same platform's assistant on DownForAI.",
    ],
  },
};
