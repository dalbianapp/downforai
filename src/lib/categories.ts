export const CATEGORIES = [
  { slug: "llm", label: "LLM" },
  { slug: "image", label: "Image Generation" },
  { slug: "video", label: "Video" },
  { slug: "audio", label: "Audio" },
  { slug: "dev", label: "Dev Tools" },
  { slug: "infra", label: "Infrastructure" },
  { slug: "search", label: "Search" },
  { slug: "productivity", label: "Productivity" },
  { slug: "agents", label: "Agents" },
  { slug: "three-d", label: "3D & Avatars" },
  { slug: "design", label: "Design" },
  { slug: "mlops", label: "MLOps" },
  { slug: "vector-db", label: "Vector DB" },
  { slug: "roleplay", label: "Roleplay AI" },
  { slug: "marketing", label: "Marketing AI" },
  { slug: "support", label: "Support AI" },
  { slug: "education", label: "Education AI" },
  { slug: "hr-ai", label: "HR AI" },
  { slug: "legal-ai", label: "Legal AI" },
  { slug: "sports-betting", label: "Sports Betting AI" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
