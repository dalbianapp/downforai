import type { TopServiceContent } from "@/content/top-services/types";

// EDUCATION — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start education-2.ts and register it in ./index.ts if it grows.
export const EDUCATION: Record<string, TopServiceContent> = {
};
