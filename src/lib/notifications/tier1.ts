export const TIER1_SLUGS = new Set([
  "chatgpt",
  "openai",
  "claude-chat",
  "anthropic",
  "google-gemini",
  "github-copilot",
  "deepseek",
  "midjourney",
  "cursor",
  "perplexity",
]);

export function isTier1(slug: string): boolean {
  return TIER1_SLUGS.has(slug);
}
