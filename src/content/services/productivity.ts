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
};
