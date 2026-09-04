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
  activeloop: {
    slug: "activeloop",
    providerSummary:
      "Activeloop is the company behind Deep Lake, a database for AI data (tensors, embeddings, documents) with a managed cloud and an open-source core. Cloud users depend on Activeloop's storage and query services; open-source users on their own storage.",
    docsUrl: "https://docs.activeloop.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Activeloop cloud (app.activeloop.ai)", description: "Managed datasets and queries", criticality: "critical" },
      { name: "Open-source Deep Lake", description: "Self-managed storage", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Managed datasets unreachable",
        scope: "partial",
        signal: "Loads or queries against hub:// datasets time out while local datasets work",
        quickCheck: "Point to a local or S3 copy; the managed backend is degraded",
      },
      {
        pattern: "Token or quota errors",
        scope: "local",
        signal: "Requests rejected with auth or storage-limit messages",
        quickCheck: "Regenerate the token and check the plan's storage limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Activeloop cloud is down",
        alternative: "LanceDB or Chroma (monitored on DownForAI) store embeddings locally or in the cloud",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Deep Lake is also tracked as its own entry on DownForAI.",
    ],
  },
  "aerospike-vector": {
    slug: "aerospike-vector",
    providerSummary:
      "Aerospike Vector Search (AVS) adds vector indexing and search to the Aerospike database, deployed self-managed or in Aerospike Cloud. Availability is that of your Aerospike cluster; the vendor's site says nothing about it.",
    docsUrl: "https://aerospike.com/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Your Aerospike cluster / Aerospike Cloud", description: "Where AVS runs", criticality: "critical" },
      { name: "aerospike.com", description: "Website and docs", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Vector index building slowly or stuck",
        scope: "local",
        signal: "Search returns partial results while the index catches up",
        quickCheck: "Check the index status via the admin client; indexing is asynchronous",
      },
      {
        pattern: "Cluster or node unavailable",
        scope: "local",
        signal: "Client timeouts against AVS nodes",
        quickCheck: "Check the cluster health; this is your deployment",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AVS is unavailable",
        alternative: "Qdrant, Weaviate or Milvus (monitored on DownForAI) are dedicated vector databases",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI probes aerospike.com, which does not reflect any customer cluster.",
    ],
  },
  "couchbase-capella": {
    slug: "couchbase-capella",
    providerSummary:
      "Couchbase Capella is the managed Couchbase database with integrated vector search and Capella AI services, deployed per cloud region. Incidents are regional and published on Couchbase's Atlassian status page.",
    officialStatusUrl: "https://status.couchbase.com",
    docsUrl: "https://docs.couchbase.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Capella control plane", description: "UI and API", criticality: "critical" },
      { name: "Clusters (regional)", description: "Data and vector search", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cluster unreachable in a region",
        scope: "partial",
        signal: "Connections time out while other regions work; status.couchbase.com lists it",
        quickCheck: "Check the status page; running clusters elsewhere are unaffected",
      },
      {
        pattern: "Vector search index building",
        scope: "local",
        signal: "Queries return partial results after a large load",
        quickCheck: "Check the index status; building is asynchronous",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Capella is down",
        alternative: "MongoDB Atlas Vector or Supabase Vector (monitored on DownForAI) offer managed databases with vector search",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["AWS / Azure / GCP infrastructure"],
    operatorNotes: [
      "couchbase.com refuses direct probes (403); the status page is the reliable signal.",
    ],
  },
  datarobot: {
    slug: "datarobot",
    providerSummary:
      "DataRobot is an enterprise AI platform (AutoML, MLOps, generative AI apps) deployed as SaaS or in the customer's cloud. Incidents are seen by enterprise users through their deployments; the vendor site is informational.",
    docsUrl: "https://docs.datarobot.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "DataRobot SaaS / customer deployments", description: "Platform", criticality: "critical" },
      { name: "Deployed model endpoints", description: "Predictions", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Prediction endpoints returning 5xx",
        scope: "partial",
        signal: "Deployed models error while the UI loads",
        quickCheck: "Check the deployment's health in the UI; redeploy if needed",
      },
      {
        pattern: "Training jobs queued",
        scope: "partial",
        signal: "AutoML runs stay pending",
        quickCheck: "Check worker availability for the account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "DataRobot is unavailable",
        alternative: "Databricks or AWS SageMaker (monitored on DownForAI) cover managed ML",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Categorised under Vector DB in DownForAI's database although it is a general ML platform.",
    ],
  },
  "datastax-astra": {
    slug: "datastax-astra",
    providerSummary:
      "Astra DB is DataStax's serverless Cassandra-based database with vector search, now part of IBM after the 2025 acquisition (datastax.com redirects to IBM). Databases run per cloud region; the former DataStax status page has been retired.",
    docsUrl: "https://docs.datastax.com/en/astra-db-serverless/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Astra DB control plane", description: "Portal and Data API", criticality: "critical" },
      { name: "Databases (regional)", description: "Data and vector search", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Database hibernated after inactivity",
        scope: "local",
        signal: "The first request after idle fails or is slow on free databases",
        quickCheck: "Resume the database from the portal; free-tier databases hibernate",
      },
      {
        pattern: "Regional incident",
        scope: "partial",
        signal: "Connections fail in one region",
        quickCheck: "Check IBM's support channels; the old DataStax status page is inactive",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Astra DB is down",
        alternative: "MongoDB Atlas Vector or Couchbase Capella (monitored on DownForAI) offer managed databases with vector search",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["IBM / cloud provider infrastructure"],
    operatorNotes: [
      "datastax.com redirects to ibm.com; the former status.datastax.com page is marked inactive.",
    ],
  },
  "deep-lake": {
    slug: "deep-lake",
    providerSummary:
      "Deep Lake is Activeloop's database for AI data and vectors, open-source with a managed cloud (deeplake.ai). Self-managed users depend on their storage; cloud users on Activeloop's services.",
    docsUrl: "https://docs.deeplake.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Deep Lake cloud", description: "Managed service", criticality: "high" },
      { name: "Open-source library", description: "Self-managed", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Managed queries timing out",
        scope: "partial",
        signal: "Cloud-hosted datasets fail while local ones work",
        quickCheck: "Use a local or S3 copy; the managed backend is degraded",
      },
      {
        pattern: "Version incompatibility",
        scope: "local",
        signal: "Datasets created with a newer library fail to open",
        quickCheck: "Upgrade the client; Deep Lake 4 changed the format",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Deep Lake cloud is down",
        alternative: "LanceDB or Chroma (monitored on DownForAI) store embeddings locally or in the cloud",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Activeloop is tracked as its own entry on DownForAI.",
    ],
  },
  "elasticsearch-knn": {
    slug: "elasticsearch-knn",
    providerSummary:
      "Elasticsearch's kNN search adds dense-vector indexing and approximate nearest-neighbour queries to Elasticsearch, self-managed or on Elastic Cloud. Availability is that of your cluster; Elastic Cloud incidents appear on Elastic's status page.",
    officialStatusUrl: "https://status.elastic.co",
    docsUrl: "https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Your Elasticsearch cluster / Elastic Cloud", description: "Where kNN runs", criticality: "critical" },
      { name: "elastic.co", description: "Website and docs", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "kNN queries slow or rejected",
        scope: "local",
        signal: "Vector queries time out or hit circuit breakers",
        quickCheck: "Check heap and HNSW index settings; large indexes need memory",
      },
      {
        pattern: "Elastic Cloud regional incident",
        scope: "partial",
        signal: "Deployments in a region degrade; status.elastic.co lists it",
        quickCheck: "Check the status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your Elasticsearch is unavailable",
        alternative: "OpenSearch kNN or Qdrant (monitored on DownForAI) offer comparable vector search",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI probes elastic.co, which does not reflect any customer cluster.",
    ],
  },
  epsilla: {
    slug: "epsilla",
    providerSummary:
      "Epsilla is a vector database (open-source and cloud) that has repositioned toward an agent-building platform, with documentation on GitBook. Cloud users depend on Epsilla's hosted service; open-source users on their own deployment.",
    docsUrl: "https://epsilla-inc.gitbook.io/epsilladb",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Epsilla cloud", description: "Hosted service", criticality: "high" },
      { name: "Open-source database", description: "Self-managed", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud endpoints unreachable",
        scope: "partial",
        signal: "Hosted databases time out while self-hosted instances work",
        quickCheck: "Run the open-source image locally in the meantime",
      },
      {
        pattern: "Client and server version mismatch",
        scope: "local",
        signal: "Requests rejected after an upgrade",
        quickCheck: "Align client and server versions",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Epsilla is down",
        alternative: "Qdrant, Chroma or Milvus (monitored on DownForAI) are alternative vector databases",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  faiss: {
    slug: "faiss",
    providerSummary:
      "Faiss is Meta's open-source library for similarity search over dense vectors, used in-process from Python or C++. It is a library, not a service: nothing hosted can go down, and failures are memory, index configuration or build issues.",
    docsUrl: "https://github.com/facebookresearch/faiss",
    communityLinks: [
      { type: "github", url: "https://github.com/facebookresearch/faiss", label: "facebookresearch/faiss", verified: true },
    ],
    monitoredSurfaces: [
      { name: "faiss.ai", description: "Project site", criticality: "low" },
      { name: "Your application", description: "Where the index lives", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Out of memory loading a large index",
        scope: "local",
        signal: "The process is killed when loading or searching",
        quickCheck: "Use an IVF or PQ index, or memory-map the index",
      },
      {
        pattern: "GPU build or wheel incompatibility",
        scope: "local",
        signal: "faiss-gpu fails to import on the current CUDA version",
        quickCheck: "Install the wheel matching your CUDA, or use faiss-cpu",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a managed vector store instead",
        alternative: "Pinecone, Qdrant or LanceDB (monitored on DownForAI) offer hosted or embedded vector search",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI probes faiss.ai, an informational page.",
    ],
  },
  "kdb-ai": {
    slug: "kdb-ai",
    providerSummary:
      "KDB.AI is KX's vector database built on kdb+, available as a cloud service and a self-managed server, aimed at time-series and real-time AI workloads. Cloud users depend on KX's hosted endpoints; server users on their own deployment.",
    docsUrl: "https://code.kx.com/kdbai/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "KDB.AI Cloud", description: "Hosted endpoints", criticality: "high" },
      { name: "KDB.AI Server", description: "Self-managed", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud session endpoint unreachable",
        scope: "partial",
        signal: "Client connections time out to the hosted endpoint",
        quickCheck: "Check the session in the KDB.AI portal; recreate it if expired",
      },
      {
        pattern: "Free-tier limits",
        scope: "local",
        signal: "Inserts refused once the free database's limits are reached",
        quickCheck: "Check the plan's size limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "KDB.AI is down",
        alternative: "Timescale Vector or Qdrant (monitored on DownForAI) handle vectors with time-series or general workloads",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  lancedb: {
    slug: "lancedb",
    providerSummary:
      "LanceDB is an open-source, embedded vector database built on the Lance format, running in-process or against object storage. The open-source library has no hosted dependency; LanceDB Cloud is tracked separately.",
    docsUrl: "https://lancedb.github.io/lancedb/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Your application / storage", description: "Embedded database", criticality: "critical" },
      { name: "lancedb.com", description: "Website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Object storage errors",
        scope: "local",
        signal: "Reads or writes to S3/GCS fail",
        quickCheck: "Check the bucket's credentials and the cloud provider's status",
      },
      {
        pattern: "Format version mismatch",
        scope: "local",
        signal: "Tables written by a newer version fail to open",
        quickCheck: "Align library versions across writers and readers",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a hosted vector store",
        alternative: "LanceDB Cloud, Qdrant or Turbopuffer (monitored on DownForAI) offer managed options",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Object storage providers"],
    operatorNotes: [],
  },
  "lancedb-cloud": {
    slug: "lancedb-cloud",
    providerSummary:
      "LanceDB Cloud is the managed, serverless version of LanceDB with an API and console at cloud.lancedb.com, billed on usage. Its incidents are API errors, ingestion delays and index builds stalling.",
    docsUrl: "https://docs.lancedb.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "cloud.lancedb.com", description: "Console and API", criticality: "critical" },
      { name: "Index builds", description: "Asynchronous indexing", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API 5xx or timeouts",
        scope: "partial",
        signal: "Queries and inserts fail across tables",
        quickCheck: "Retry with backoff; the open-source library can read a local copy meanwhile",
      },
      {
        pattern: "Index build stuck",
        scope: "local",
        signal: "Vector search stays slow after a large load",
        quickCheck: "Check the index status; builds are asynchronous",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LanceDB Cloud is down",
        alternative: "Qdrant or Turbopuffer (monitored on DownForAI) are managed alternatives; LanceDB can also run embedded",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  marqo: {
    slug: "marqo",
    providerSummary:
      "Marqo is an end-to-end vector search engine that embeds and indexes documents itself, open-source or as Marqo Cloud. Cloud users depend on Marqo's inference and index services; self-hosters on their own containers.",
    docsUrl: "https://docs.marqo.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Marqo Cloud", description: "Managed indexes", criticality: "high" },
      { name: "Self-hosted Marqo", description: "Docker deployment", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Indexing slow because of embedding inference",
        scope: "local",
        signal: "Adds take long on CPU-only deployments",
        quickCheck: "Use GPU inference or a smaller model; this is capacity, not an outage",
      },
      {
        pattern: "Cloud index unreachable",
        scope: "partial",
        signal: "Requests to the managed endpoint time out",
        quickCheck: "Check the Marqo Cloud console; self-host in the meantime",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Marqo Cloud is down",
        alternative: "Weaviate or Vectara (monitored on DownForAI) also embed and index documents end to end",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "mongodb-atlas-vector": {
    slug: "mongodb-atlas-vector",
    providerSummary:
      "MongoDB Atlas Vector Search adds vector indexes and $vectorSearch to Atlas clusters, deployed per cloud region. Incidents are regional Atlas or Search-node events, published on MongoDB's Atlassian status page.",
    officialStatusUrl: "https://status.mongodb.com",
    docsUrl: "https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Atlas clusters (regional)", description: "Data", criticality: "critical" },
      { name: "Atlas Search / Vector Search nodes", description: "Indexes", criticality: "critical" },
      { name: "Atlas control plane", description: "UI and API", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Vector index building or stale",
        scope: "local",
        signal: "Queries return partial results after bulk loads",
        quickCheck: "Check the index status in Atlas; builds are asynchronous",
      },
      {
        pattern: "Search nodes degraded in a region",
        scope: "partial",
        signal: "$vectorSearch errors while CRUD works; status.mongodb.com lists it",
        quickCheck: "Check the status page",
      },
      {
        pattern: "Free-tier limits",
        scope: "local",
        signal: "Index creation refused on M0 clusters beyond the allowed count",
        quickCheck: "Check the tier's search index limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Atlas Vector Search is down",
        alternative: "Pinecone, Qdrant or Supabase Vector (monitored on DownForAI) can hold a mirror of the vectors",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["AWS / Azure / GCP infrastructure"],
    operatorNotes: [],
  },
  myscale: {
    slug: "myscale",
    providerSummary:
      "MyScale is a SQL vector database built on ClickHouse, offered as a managed cloud with a free tier and as an open-source edition. Cloud users depend on MyScale's clusters; open-source users on their own deployment.",
    docsUrl: "https://myscale.com/docs/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "MyScale Cloud", description: "Managed clusters", criticality: "high" },
      { name: "Open-source MyScaleDB", description: "Self-managed", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cluster paused or unreachable",
        scope: "partial",
        signal: "Connections time out to the cloud cluster",
        quickCheck: "Check the cluster state in the console; free clusters can be paused",
      },
      {
        pattern: "Vector index still building",
        scope: "local",
        signal: "Queries fall back to brute force after a large insert",
        quickCheck: "Check the index build status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "MyScale is down",
        alternative: "SingleStore or pgvector (monitored on DownForAI) offer SQL with vector search",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "neon-pgvector": {
    slug: "neon-pgvector",
    providerSummary:
      "Neon is serverless Postgres (now part of Databricks; neon.tech redirects to neon.com) with the pgvector extension available on every project. Vector workloads inherit Neon's regional availability and its compute autosuspend behaviour, and incidents appear on neonstatus.com.",
    officialStatusUrl: "https://neonstatus.com/",
    docsUrl: "https://neon.tech/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Neon control plane", description: "Console and API", criticality: "high" },
      { name: "Project computes (regional)", description: "Postgres with pgvector", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "First query slow after autosuspend",
        scope: "local",
        signal: "Connections take seconds when the compute wakes",
        quickCheck: "Expected on serverless computes; raise the suspend timeout if needed",
      },
      {
        pattern: "Regional incident",
        scope: "partial",
        signal: "Projects in one region fail to connect; neonstatus.com lists it",
        quickCheck: "Check the status page",
      },
      {
        pattern: "pgvector index memory limits",
        scope: "local",
        signal: "HNSW index builds fail on small computes",
        quickCheck: "Raise the compute size temporarily for the build",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Neon is down",
        alternative: "Supabase Vector or Timescale Vector (monitored on DownForAI) run Postgres with pgvector",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["AWS / Azure regional infrastructure"],
    operatorNotes: [
      "neon.tech redirects to neon.com; DownForAI's probe follows the redirect.",
    ],
  },
  "opensearch-knn": {
    slug: "opensearch-knn",
    providerSummary:
      "OpenSearch's k-NN plugin provides vector indexing and search in OpenSearch, self-managed or on Amazon OpenSearch Service. Availability is that of your cluster; the project site is informational.",
    docsUrl: "https://opensearch.org/docs/latest/vector-search/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Your OpenSearch cluster", description: "Where k-NN runs", criticality: "critical" },
      { name: "opensearch.org", description: "Website and docs", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "k-NN queries slow or rejected",
        scope: "local",
        signal: "Vector queries time out or hit circuit breakers",
        quickCheck: "Check the k-NN memory circuit breaker and index settings",
      },
      {
        pattern: "Amazon OpenSearch Service domain issues",
        scope: "local",
        signal: "The managed domain shows red or yellow status",
        quickCheck: "Check the AWS Health Dashboard and domain metrics",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your OpenSearch is unavailable",
        alternative: "Elasticsearch kNN or Qdrant (monitored on DownForAI) offer comparable vector search",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["AWS when using the managed service"],
    operatorNotes: [
      "DownForAI probes opensearch.org, which does not reflect any cluster.",
    ],
  },
  "oracle-ai-vector-search": {
    slug: "oracle-ai-vector-search",
    providerSummary:
      "Oracle AI Vector Search is the native vector capability of Oracle Database 23ai and later, used in Autonomous Database and on-prem. Availability is that of your Oracle database; the marketing page tracked in the DB currently returns 404.",
    docsUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/23/vecse/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Your Oracle Database / Autonomous Database", description: "Where vectors live", criticality: "critical" },
      { name: "Oracle Cloud (OCI)", description: "For Autonomous Database", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Vector index creation failing",
        scope: "local",
        signal: "CREATE VECTOR INDEX errors on memory or version",
        quickCheck: "Check the vector memory pool and database version",
      },
      {
        pattern: "OCI regional incident",
        scope: "partial",
        signal: "Autonomous Database unreachable in a region",
        quickCheck: "Check the OCI status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Oracle Database is unavailable",
        alternative: "pgvector or SingleStore (monitored on DownForAI) offer SQL vector search",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Oracle Cloud Infrastructure"],
    operatorNotes: [
      "The DB website URL answered 404 when this entry was written.",
    ],
  },
  pgvector: {
    slug: "pgvector",
    providerSummary:
      "pgvector is the open-source Postgres extension for vector similarity search, available on nearly every managed Postgres. It is code inside your database: availability is that of the Postgres instance, and failures are index memory and version issues.",
    docsUrl: "https://github.com/pgvector/pgvector",
    communityLinks: [
      { type: "github", url: "https://github.com/pgvector/pgvector", label: "pgvector/pgvector", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Your Postgres instance", description: "Where the extension runs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "HNSW index build fails or is very slow",
        scope: "local",
        signal: "Index creation errors on maintenance_work_mem or takes hours",
        quickCheck: "Raise maintenance_work_mem and build with parallel workers",
      },
      {
        pattern: "Extension version mismatch after a Postgres upgrade",
        scope: "local",
        signal: "Queries error until the extension is updated",
        quickCheck: "Run ALTER EXTENSION vector UPDATE",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your Postgres is unavailable",
        alternative: "Supabase Vector or Neon pgvector (monitored on DownForAI) offer managed Postgres with pgvector",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI probes the GitHub page (the DB website URL); it says nothing about any database.",
    ],
  },
  "redis-vector": {
    slug: "redis-vector",
    providerSummary:
      "Redis vector search (the Redis Query Engine, formerly RediSearch) indexes vectors in Redis, self-managed, in Redis Software or on Redis Cloud. Availability is that of your Redis deployment; Redis Cloud incidents appear on Redis's status page.",
    docsUrl: "https://redis.io/docs/latest/develop/interact/search-and-query/query/vector-search/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Your Redis / Redis Cloud database", description: "Where indexes live", criticality: "critical" },
      { name: "redis.io", description: "Website and docs", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Vector index not loading in memory",
        scope: "local",
        signal: "FT.SEARCH errors or the database runs out of memory",
        quickCheck: "Check memory limits; vectors live in RAM",
      },
      {
        pattern: "Redis Cloud subscription incident",
        scope: "partial",
        signal: "The database is unreachable in a region",
        quickCheck: "Check Redis's status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your Redis is unavailable",
        alternative: "Qdrant or Milvus (monitored on DownForAI) are dedicated vector databases",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI probes redis.io, which does not reflect any deployment.",
    ],
  },
  scann: {
    slug: "scann",
    providerSummary:
      "ScaNN is Google Research's open-source library for efficient vector similarity search, used in-process from Python (and inside Vertex AI Vector Search). It is a library with no hosted service; failures are build and memory issues.",
    docsUrl: "https://github.com/google-research/google-research/tree/master/scann",
    communityLinks: [
      { type: "github", url: "https://github.com/google-research/google-research/tree/master/scann", label: "google-research/scann", verified: true },
    ],
    monitoredSurfaces: [
      { name: "GitHub repository", description: "Code", criticality: "low" },
      { name: "Your application", description: "Where the index lives", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Wheel incompatible with the Python or TensorFlow version",
        scope: "local",
        signal: "pip install fails or import errors",
        quickCheck: "Use a supported Python version; prebuilt wheels target specific versions",
      },
      {
        pattern: "Index build memory",
        scope: "local",
        signal: "Building large indexes exhausts RAM",
        quickCheck: "Reduce dimensions or partition the dataset",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a managed alternative",
        alternative: "Google Vertex AI (monitored on DownForAI) offers Vector Search built on ScaNN; Faiss is a comparable library",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The DB website URL points at the google-research monorepo; it is informational.",
    ],
  },
  singlestore: {
    slug: "singlestore",
    providerSummary:
      "SingleStore is a distributed SQL database with vector search and real-time analytics, offered as SingleStore Helios (cloud) or self-managed. Cloud incidents are regional workspace events published on SingleStore's status page.",
    docsUrl: "https://docs.singlestore.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "SingleStore Helios", description: "Managed workspaces", criticality: "critical" },
      { name: "Self-managed clusters", description: "User-run", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Workspace suspended or unreachable",
        scope: "partial",
        signal: "Connections fail to a cloud workspace",
        quickCheck: "Check the workspace state in the portal; free workspaces suspend when idle",
      },
      {
        pattern: "Vector index memory pressure",
        scope: "local",
        signal: "Queries slow or fail on large vector tables",
        quickCheck: "Scale the workspace or use an appropriate index type",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SingleStore is down",
        alternative: "MyScale or pgvector (monitored on DownForAI) offer SQL with vector search",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "SingleStore publishes its own status page; DownForAI probes singlestore.com only.",
    ],
  },
  "snowflake-cortex": {
    slug: "snowflake-cortex",
    providerSummary:
      "Snowflake Cortex brings LLM functions, Cortex Search and vector types into Snowflake, running inside the customer's Snowflake account per region. Availability follows Snowflake's Atlassian status page and the region's model availability.",
    officialStatusUrl: "https://status.snowflake.com",
    docsUrl: "https://docs.snowflake.com/en/guides-overview-ai-features",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Snowflake accounts (regional)", description: "Warehouses and Cortex", criticality: "critical" },
      { name: "Cortex LLM functions", description: "Model calls", criticality: "high" },
      { name: "Cortex Search", description: "Hybrid search service", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model not available in the region",
        scope: "local",
        signal: "COMPLETE or other functions error for a model in your region",
        quickCheck: "Enable cross-region inference or pick an available model",
      },
      {
        pattern: "Cortex functions throttled",
        scope: "local",
        signal: "Calls fail with throughput limits during heavy use",
        quickCheck: "Batch requests and check account limits",
      },
      {
        pattern: "Snowflake regional incident",
        scope: "partial",
        signal: "Queries fail in one region; status.snowflake.com lists it",
        quickCheck: "Check the status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Cortex is unavailable",
        alternative: "Databricks (monitored on DownForAI) offers comparable in-platform AI; call model APIs directly from external functions",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Snowflake platform", "Cloud provider regions"],
    operatorNotes: [],
  },
  "supabase-vector": {
    slug: "supabase-vector",
    providerSummary:
      "Supabase Vector is pgvector inside Supabase's managed Postgres, with an embeddings toolkit and edge functions. It inherits Supabase's regional availability, published on an Atlassian status page.",
    officialStatusUrl: "https://status.supabase.com",
    docsUrl: "https://supabase.com/docs/guides/ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Project databases (regional)", description: "Postgres with pgvector", criticality: "critical" },
      { name: "Supabase APIs", description: "PostgREST and functions", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Index build limits on small compute",
        scope: "local",
        signal: "HNSW builds fail or time out on the free tier",
        quickCheck: "Upgrade compute temporarily for the build",
      },
      {
        pattern: "Regional incident",
        scope: "partial",
        signal: "Projects in a region fail to connect; status.supabase.com lists it",
        quickCheck: "Check the status page",
      },
      {
        pattern: "Project paused",
        scope: "local",
        signal: "A free project is paused after inactivity",
        quickCheck: "Restore it from the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Supabase is down",
        alternative: "Neon pgvector or Timescale Vector (monitored on DownForAI) run Postgres with pgvector",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["AWS regional infrastructure"],
    operatorNotes: [
      "Supabase is also tracked as a Dev-category entry on DownForAI.",
    ],
  },
  "timescale-vector": {
    slug: "timescale-vector",
    providerSummary:
      "Timescale's vector offering (pgvector plus pgvectorscale and pgai) runs on Timescale Cloud, which rebranded to Tiger Data in 2025 (timescale.com redirects to tigerdata.com). Availability is that of your Timescale/Tiger Cloud service.",
    docsUrl: "https://docs.timescale.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Tiger Cloud services (regional)", description: "Postgres with vector extensions", criticality: "critical" },
      { name: "Console", description: "Management", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Service unreachable in a region",
        scope: "partial",
        signal: "Connections time out to a cloud service",
        quickCheck: "Check the console and Tiger Data's status page",
      },
      {
        pattern: "Extension version mismatch",
        scope: "local",
        signal: "pgvectorscale or pgai functions missing after an upgrade",
        quickCheck: "Update the extensions in the database",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Timescale is down",
        alternative: "Supabase Vector or Neon pgvector (monitored on DownForAI) run Postgres with pgvector",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "timescale.com redirects to tigerdata.com; DownForAI's probe follows the redirect.",
    ],
  },
  turbopuffer: {
    slug: "turbopuffer",
    providerSummary:
      "turbopuffer is a serverless vector and full-text search database built on object storage, used through an API and billed on usage. Its incidents are API errors and elevated query latency, seen by developers.",
    docsUrl: "https://turbopuffer.com/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "turbopuffer API", description: "Namespaces and queries", criticality: "critical" },
      { name: "Object storage backend", description: "Underlying storage", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Query latency rising",
        scope: "partial",
        signal: "Cold namespaces take longer than usual to answer",
        quickCheck: "Expected on cold caches; sustained latency across namespaces is an incident",
      },
      {
        pattern: "API 5xx or write failures",
        scope: "partial",
        signal: "Upserts fail across namespaces",
        quickCheck: "Retry with backoff; turbopuffer publishes incidents on its status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "turbopuffer is down",
        alternative: "Pinecone, Qdrant or LanceDB Cloud (monitored on DownForAI) are managed vector databases",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Cloud object storage"],
    operatorNotes: [],
  },
  "txtai-neuml": {
    slug: "txtai-neuml",
    providerSummary:
      "txtai is NeuML's open-source framework for semantic search, embeddings databases and LLM pipelines, run in your own environment. There is no hosted service; failures are model downloads, memory and dependency issues.",
    docsUrl: "https://neuml.github.io/txtai",
    communityLinks: [
      { type: "github", url: "https://github.com/neuml/txtai", label: "neuml/txtai", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Documentation site", description: "neuml.github.io/txtai", criticality: "low" },
      { name: "Your application", description: "Where txtai runs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model download failing",
        scope: "local",
        signal: "Embeddings models cannot be fetched from Hugging Face",
        quickCheck: "Check Hugging Face's status and cache the models",
      },
      {
        pattern: "Dependency conflicts",
        scope: "local",
        signal: "Optional extras fail to install",
        quickCheck: "Install the pinned versions in a clean environment",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a hosted semantic search",
        alternative: "Weaviate, Vectara or Marqo (monitored on DownForAI) offer end-to-end search services",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub"],
    operatorNotes: [],
  },
  vald: {
    slug: "vald",
    providerSummary:
      "Vald is an open-source, distributed approximate nearest-neighbour search engine (from Yahoo Japan) deployed on Kubernetes. There is no hosted Vald; availability is that of your cluster.",
    docsUrl: "https://vald.vdaas.org/docs/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Your Vald cluster", description: "Kubernetes deployment", criticality: "critical" },
      { name: "vald.vdaas.org", description: "Website and docs", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agents restarting and losing indexes",
        scope: "local",
        signal: "Search results drop after pod restarts without persistent volumes",
        quickCheck: "Enable index backup to persistent storage",
      },
      {
        pattern: "Index not yet saved",
        scope: "local",
        signal: "Recently inserted vectors are missing from search",
        quickCheck: "Wait for the auto-index interval or trigger CreateIndex",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your Vald cluster is unavailable",
        alternative: "Milvus or Qdrant (monitored on DownForAI) are distributed vector databases with managed options",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Kubernetes"],
    operatorNotes: [],
  },
  vespa: {
    slug: "vespa",
    providerSummary:
      "Vespa is an open-source serving engine for search, recommendation and vector workloads, self-managed or on Vespa Cloud. Cloud users depend on Vespa's hosted zones; self-managed users on their own cluster.",
    docsUrl: "https://docs.vespa.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Vespa Cloud", description: "Managed zones", criticality: "high" },
      { name: "Self-managed clusters", description: "User-run", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Deployment stuck or failing on Vespa Cloud",
        scope: "partial",
        signal: "Application deployments do not converge",
        quickCheck: "Check the console's deployment logs; zone incidents are announced there",
      },
      {
        pattern: "Content nodes out of memory",
        scope: "local",
        signal: "Feeding blocked or queries degraded",
        quickCheck: "Check resource limits and node sizing; this is capacity",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vespa Cloud is down",
        alternative: "Elasticsearch kNN or Weaviate (monitored on DownForAI) cover hybrid search",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  zilliz: {
    slug: "zilliz",
    providerSummary:
      "Zilliz Cloud is the managed Milvus service, deployed per cloud region with serverless and dedicated clusters, and it runs its own status page. Incidents are regional cluster events, index builds stalling and API errors.",
    docsUrl: "https://docs.zilliz.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Zilliz Cloud control plane", description: "Console and API", criticality: "critical" },
      { name: "Clusters (regional)", description: "Milvus deployments", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cluster unreachable in a region",
        scope: "partial",
        signal: "Connections time out; Zilliz's status page lists a regional incident",
        quickCheck: "Check the status page; clusters elsewhere are unaffected",
      },
      {
        pattern: "Index build stuck",
        scope: "local",
        signal: "Searches stay slow after a bulk load",
        quickCheck: "Check the index status in the console",
      },
      {
        pattern: "Free cluster limits",
        scope: "local",
        signal: "Inserts refused once the free tier's capacity is reached",
        quickCheck: "Check the plan's limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Zilliz Cloud is down",
        alternative: "Milvus, Qdrant or Pinecone (monitored on DownForAI) are alternatives, including self-hosted Milvus",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["AWS / Azure / GCP infrastructure"],
    operatorNotes: [
      "Zilliz publishes its own status page; Milvus is tracked separately on DownForAI.",
    ],
  },
};
