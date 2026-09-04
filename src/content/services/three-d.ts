import type { TopServiceContent } from "@/content/top-services/types";

// THREE_D — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start three-d-2.ts and register it in ./index.ts if it grows.
export const THREE_D: Record<string, TopServiceContent> = {
  tripo3d: {
    slug: "tripo3d",
    providerSummary:
      "Text/image-to-3D model generation. Used in game dev, AR/VR, product design workflows.",
    docsUrl: "https://platform.tripo3d.ai/docs",
    pricingUrl: "https://www.tripo3d.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "tripo3d.ai", description: "", criticality: "critical" },
      { name: "Tripo API", description: "", criticality: "high" },
      { name: "Generation backend", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation queue delays",
        scope: "partial",
        signal: "3D generation takes much longer than typical",
        quickCheck: "Wait several minutes; 3D generation is inherently slow",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance in Tripo3D account",
      },
      {
        pattern: "Specific format export errors",
        scope: "partial",
        signal: "Specific output format fails to export",
        quickCheck: "Try a different output format (GLB, OBJ, FBX)",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Tripo3D is degraded",
        alternative:
          "Meshy, Luma Genie, Rodin (Deemos) can reduce downtime for 3D generation",
        switchingCost: "low",
        note: "Different quality profiles",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "3D generation takes minutes — distinguish queue delay from actual failure before reporting outage",
    ],
  },
};
