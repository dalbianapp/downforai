import type { TopServiceContent } from "@/content/top-services/types";
import { LLM } from "./llm";
import { IMAGE } from "./image";
import { VIDEO } from "./video";
import { AUDIO } from "./audio";
import { DEV } from "./dev";
import { DEV_2 } from "./dev-2";
import { INFRA } from "./infra";
import { SEARCH } from "./search";
import { PRODUCTIVITY } from "./productivity";
import { AGENTS } from "./agents";
import { THREE_D } from "./three-d";
import { DESIGN } from "./design";
import { MLOPS } from "./mlops";
import { VECTOR_DB } from "./vector-db";
import { ROLEPLAY } from "./roleplay";
import { MARKETING } from "./marketing";
import { SUPPORT } from "./support";
import { EDUCATION } from "./education";
import { HR_AI } from "./hr-ai";
import { LEGAL_AI } from "./legal-ai";
import { SPORTS_BETTING } from "./sports-betting";

// One module per ServiceCategory (see prisma/schema.prisma). Add a "<category>-2"
// module here when a category file grows past ~3000 lines.
const MODULES: Array<[string, Record<string, TopServiceContent>]> = [
  ["llm", LLM],
  ["image", IMAGE],
  ["video", VIDEO],
  ["audio", AUDIO],
  ["dev", DEV],
  ["dev-2", DEV_2],
  ["infra", INFRA],
  ["search", SEARCH],
  ["productivity", PRODUCTIVITY],
  ["agents", AGENTS],
  ["three-d", THREE_D],
  ["design", DESIGN],
  ["mlops", MLOPS],
  ["vector-db", VECTOR_DB],
  ["roleplay", ROLEPLAY],
  ["marketing", MARKETING],
  ["support", SUPPORT],
  ["education", EDUCATION],
  ["hr-ai", HR_AI],
  ["legal-ai", LEGAL_AI],
  ["sports-betting", SPORTS_BETTING],
];

function mergeModules(): Record<string, TopServiceContent> {
  const merged: Record<string, TopServiceContent> = {};
  const seenIn = new Map<string, string>();
  for (const [name, entries] of MODULES) {
    for (const [slug, content] of Object.entries(entries)) {
      const previous = seenIn.get(slug);
      if (previous) {
        // Fails the build (modules are evaluated at prerender) rather than silently
        // letting one category's entry shadow another's.
        throw new Error(`[content/services] duplicate slug "${slug}" in ${name} (already in ${previous})`);
      }
      seenIn.set(slug, name);
      merged[slug] = content;
    }
  }
  return merged;
}

// Same shape as the former top50.ts map: getServiceDashboard reads TOP_SERVICE_CONTENT[slug].
export const TOP_SERVICE_CONTENT: Record<string, TopServiceContent> = mergeModules();
