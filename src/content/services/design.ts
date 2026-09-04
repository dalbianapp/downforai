import type { TopServiceContent } from "@/content/top-services/types";

// DESIGN — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start design-2.ts and register it in ./index.ts if it grows.
export const DESIGN: Record<string, TopServiceContent> = {
  gamma: {
    slug: "gamma",
    providerSummary:
      "AI-powered presentation and document generator. Creates slides, docs, and webpages from prompts.",
    docsUrl: "https://gamma.app/help",
    pricingUrl: "https://gamma.app/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "gamma.app", description: "Web editor and generator", criticality: "critical" },
      { name: "Generation Backend", description: "AI presentation generation", criticality: "critical" },
      { name: "Export Pipeline", description: "PPTX, PDF, and link export", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "User runs out of AI generation credits",
        quickCheck: "Check credit balance; upgrade plan or wait for monthly reset",
      },
      {
        pattern: "Export format issues (PPTX, PDF)",
        scope: "global",
        signal: "Exported file is corrupted or missing slides",
        quickCheck: "Try a different export format; check status for export pipeline",
      },
      {
        pattern: "Template rendering glitches",
        scope: "partial",
        signal: "Layout breaks on specific templates",
        quickCheck: "Switch template; reload the presentation",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gamma is degraded",
        alternative:
          "Beautiful.ai, Tome, or SlidesAI can reduce downtime for AI presentation generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
};
