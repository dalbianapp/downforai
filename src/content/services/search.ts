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
};
