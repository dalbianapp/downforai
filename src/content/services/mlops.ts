import type { TopServiceContent } from "@/content/top-services/types";

// MLOPS — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start mlops-2.ts and register it in ./index.ts if it grows.
export const MLOPS: Record<string, TopServiceContent> = {
  langsmith: {
    slug: "langsmith",
    providerSummary:
      "LangChain's observability and evaluation platform. Trace LLM calls, run evals, monitor prod.",
    officialStatusUrl: "https://status.smith.langchain.com",
    docsUrl: "https://docs.smith.langchain.com",
    pricingUrl: "https://www.langchain.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "smith.langchain.com", description: "Web dashboard", criticality: "critical" },
      { name: "Tracing API", description: "LLM call ingestion endpoint", criticality: "critical" },
      { name: "Eval Runner", description: "Dataset evaluation pipeline", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tracing ingestion lag",
        scope: "global",
        signal: "Traces appear delayed or missing in dashboard",
        quickCheck: "Check status.smith.langchain.com for ingestion pipeline health",
      },
      {
        pattern: "Eval timeout on large datasets",
        scope: "global",
        signal: "Evaluation runs time out before completing",
        quickCheck: "Run evals on smaller dataset splits; check eval runner status",
      },
      {
        pattern: "Dashboard loading delays",
        scope: "global",
        signal: "Dashboard slow to load or traces not rendering",
        quickCheck: "Hard refresh; filter to smaller time range to reduce data load",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LangSmith is degraded",
        alternative:
          "Helicone, Braintrust, or Arize Phoenix can reduce downtime for LLM observability",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
};
