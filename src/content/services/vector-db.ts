import type { TopServiceContent } from "@/content/top-services/types";

// VECTOR_DB — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start vector-db-2.ts and register it in ./index.ts if it grows.
export const VECTOR_DB: Record<string, TopServiceContent> = {
  chroma: {
    slug: "chroma",
    providerSummary:
      "Open-source embedding database. Popular for RAG applications. Simple API, Python-first.",
    docsUrl: "https://docs.trychroma.com",
    communityLinks: [
      { type: "github", url: "https://github.com/chroma-core/chroma", label: "chroma-core/chroma", verified: true },
      { type: "discord", url: "https://discord.gg/MMeYNTmh3x", label: "Discord", verified: false },
    ],
    monitoredSurfaces: [
      { name: "Chroma Cloud", description: "Managed cloud instance", criticality: "critical" },
      { name: "PyPI Package", description: "chromadb package on PyPI", criticality: "critical" },
      { name: "Documentation Site", description: "docs.trychroma.com", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Local instance memory issues on large collections",
        scope: "local",
        signal: "Chroma crashes or OOM on large vector sets",
        quickCheck: "Reduce batch size; increase system memory; use persistent client mode",
      },
      {
        pattern: "Chroma Cloud scaling delays",
        scope: "global",
        signal: "Managed cloud instance slow during high load",
        quickCheck: "Check Chroma status; implement retry logic",
      },
      {
        pattern: "Version upgrade breaking changes",
        scope: "global",
        signal: "Behavior or API changes after pip upgrade",
        quickCheck: "Pin version; check MIGRATION.md for upgrade guide",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Chroma is degraded",
        alternative:
          "Qdrant, Pinecone, or pgvector can reduce downtime for vector storage (data migration required)",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  milvus: {
    slug: "milvus",
    providerSummary:
      "Open-source vector database. Managed cloud version via Zilliz. Strong at scale with billions of vectors.",
    officialStatusUrl: "https://status.zilliz.com",
    docsUrl: "https://milvus.io/docs",
    pricingUrl: "https://zilliz.com/pricing",
    communityLinks: [
      { type: "github", url: "https://github.com/milvus-io/milvus", label: "milvus-io/milvus", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Zilliz Cloud", description: "Managed Milvus cloud service", criticality: "critical" },
      { name: "Milvus Self-Hosted", description: "Open-source self-hosted deployment", criticality: "critical" },
      { name: "Attu GUI", description: "Milvus management UI", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Zilliz Cloud cluster scaling issues",
        scope: "global",
        signal: "Cloud instance unavailable or slow during scale events",
        quickCheck: "Check status.zilliz.com; contact Zilliz support for cluster issues",
      },
      {
        pattern: "Self-hosted etcd dependency issues",
        scope: "local",
        signal: "Milvus fails to start or loses metadata",
        quickCheck: "Check etcd health first — it's a critical Milvus dependency",
      },
      {
        pattern: "Collection loading on restart",
        scope: "local",
        signal: "Collections need manual load after restart",
        quickCheck: "Run collection.load() after restart; use auto-load in config",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Zilliz Cloud is degraded",
        alternative:
          "Self-host Milvus or switch to Qdrant/Pinecone (data migration required)",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Milvus self-hosted has etcd as a critical dependency — etcd issues often manifest as Milvus failures. Check etcd first.",
    ],
  },
};
