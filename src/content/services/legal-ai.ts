import type { TopServiceContent } from "@/content/top-services/types";

// LEGAL_AI — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start legal-ai-2.ts and register it in ./index.ts if it grows.
export const LEGAL_AI: Record<string, TopServiceContent> = {
  "robin-ai": {
    slug: "robin-ai",
    providerSummary:
      "Robin AI reviews and drafts contracts with AI, used mainly through a Microsoft Word add-in and a web app, with enterprise SSO. Because the work happens inside Word and on uploaded documents, incidents look like an add-in that will not load or reviews that never complete.",
    docsUrl: "https://www.robinai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Robin web app", description: "Document upload and review", criticality: "critical" },
      { name: "Word add-in", description: "In-document review and drafting", criticality: "critical" },
      { name: "Review pipeline", description: "AI analysis jobs", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Word add-in fails to load or sign in",
        scope: "local",
        signal: "The task pane stays blank or loops on SSO while the web app works",
        quickCheck: "Sign out of the add-in, restart Word and sign in again; if the web app also rejects SSO, the auth service is down",
      },
      {
        pattern: "Reviews queued or never completing",
        scope: "partial",
        signal: "Uploaded contracts stay 'in progress' well beyond the usual turnaround",
        quickCheck: "Upload a small test document; if it also stalls, the analysis pipeline is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Robin AI is unavailable",
        alternative: "Spellbook, Luminance or Ironclad (monitored on DownForAI) offer AI contract review",
        switchingCost: "high",
        note: "Playbooks and clause libraries are not portable",
      },
    ],
    ecosystemDependencies: ["Microsoft 365 / Word add-in platform", "Enterprise identity providers (SSO)"],
    operatorNotes: [
      "robinai.com blocks DownForAI's probes, so the technical signal is unreliable for this service; community reports are the primary indicator.",
    ],
  },
};
