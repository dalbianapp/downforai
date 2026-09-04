import type { TopServiceContent } from "@/content/top-services/types";

// SUPPORT — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start support-2.ts and register it in ./index.ts if it grows.
export const SUPPORT: Record<string, TopServiceContent> = {
  "gong-io": {
    slug: "gong-io",
    providerSummary:
      "Gong is a revenue-intelligence platform that records and transcribes sales calls from Zoom, Teams, Google Meet and dialers, then analyses them and syncs insights to the CRM. Its incidents are usually about calls not being captured or processed rather than the web app being unreachable.",
    officialStatusUrl: "https://status.gong.io/",
    docsUrl: "https://help.gong.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.gong.io", description: "Web application", criticality: "critical" },
      { name: "Call capture and transcription", description: "Recording pipeline from conferencing tools", criticality: "critical" },
      { name: "CRM sync", description: "Salesforce / HubSpot integration", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Calls missing or not recorded",
        scope: "partial",
        signal: "Meetings happened but never appear in Gong, or the recorder did not join",
        quickCheck: "Check status.gong.io for a capture incident and confirm the calendar/conferencing integration is still connected",
      },
      {
        pattern: "Transcripts and analysis delayed",
        scope: "partial",
        signal: "Calls appear but stay 'processing' for hours",
        quickCheck: "Wait — processing backlogs clear on their own; escalate only if calls from the previous day are still unprocessed",
      },
      {
        pattern: "CRM data out of date",
        scope: "partial",
        signal: "Deals or activities in Gong do not match Salesforce/HubSpot",
        quickCheck: "Check the integration page for sync errors; a stalled sync is separate from the app being up",
      },
      {
        pattern: "SSO login failing",
        scope: "local",
        signal: "The identity provider redirect completes but Gong shows an error",
        quickCheck: "Have an admin verify the SSO configuration; if all users are affected, check status.gong.io",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gong capture is down during important calls",
        alternative: "Read.ai or Sybill (monitored on DownForAI) can transcribe meetings in the meantime; record natively in the conferencing tool and upload later",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Zoom / Microsoft Teams / Google Meet APIs", "Salesforce / HubSpot"],
    operatorNotes: [],
  },
};
