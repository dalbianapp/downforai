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
  meshy: {
    slug: "meshy",
    providerSummary:
      "Meshy generates 3D models from text or images (with separate texturing and rigging stages) through a web app and an API, on a credit-based plan. Each stage is a queued GPU job, so a model can be created while its texturing or rigging step stalls.",
    docsUrl: "https://docs.meshy.ai",
    pricingUrl: "https://www.meshy.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "meshy.ai web app", description: "Generation workspace", criticality: "critical" },
      { name: "Generation pipeline", description: "Text/image-to-3D, texturing, rigging", criticality: "critical" },
      { name: "Meshy API", description: "Programmatic generation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Jobs stuck at a stage (texturing or refine)",
        scope: "partial",
        signal: "The base mesh appears but the texturing or refine step stays in progress or fails",
        quickCheck: "Retry the stage from the task; if every job stalls at the same stage, that pipeline is degraded",
      },
      {
        pattern: "Long queue times at peak",
        scope: "partial",
        signal: "Tasks wait far beyond the usual estimate before starting",
        quickCheck: "Check the task list for any progress; a universal wait is GPU capacity, not an account issue",
      },
      {
        pattern: "API returns 429 or credit errors",
        scope: "local",
        signal: "Programmatic calls rejected with rate-limit or insufficient-credit responses while the web app works",
        quickCheck: "Check plan limits and the credit balance in the dashboard before treating it as an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Meshy's pipeline is down",
        alternative: "Tripo AI, Rodin (Deemos) or Luma Genie (monitored on DownForAI) generate 3D assets from text or images",
        switchingCost: "medium",
        note: "Output formats and rigging conventions differ between tools",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
};
