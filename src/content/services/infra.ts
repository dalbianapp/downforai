import type { TopServiceContent } from "@/content/top-services/types";

// INFRA — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start infra-2.ts and register it in ./index.ts if it grows.
export const INFRA: Record<string, TopServiceContent> = {
  groq: {
    slug: "groq",
    providerSummary:
      "Ultra-fast inference via custom LPU hardware. Hosts open-source models (Llama, Mixtral, Qwen, DeepSeek, Whisper) with low latency.",
    officialStatusUrl: "https://groqstatus.com",
    docsUrl: "https://console.groq.com/docs",
    pricingUrl: "https://groq.com/pricing",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/groq", label: "Groq Discord" },
      { type: "x", url: "https://x.com/GroqInc", label: "@GroqInc" },
    ],
    monitoredSurfaces: [
      {
        name: "api.groq.com",
        description: "OpenAI-compatible API",
        criticality: "critical",
      },
    ],
    modelFamilies: [
      "Llama 3.3",
      "Llama 3.1",
      "Mixtral",
      "DeepSeek R1 Distill",
      "Qwen",
      "Whisper",
    ],
    knownFailurePatterns: [
      {
        pattern: "Capacity-driven 429s during peak",
        scope: "partial",
        signal: "429 rate limit errors during high demand periods",
        quickCheck: "Implement backoff; check groqstatus.com",
      },
      {
        pattern: "Model cold start",
        scope: "partial",
        signal: "First request slow after model inactivity",
        quickCheck: "Warm up with a ping request before prod traffic",
      },
      {
        pattern: "Specific model availability changes",
        scope: "partial",
        signal: "Model previously available now returns 404",
        quickCheck: "Check current model list at console.groq.com/docs/models",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Groq is degraded",
        alternative:
          "Together AI, Fireworks AI, DeepInfra host similar open models",
        switchingCost: "low",
        note: "Base URL swap",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Groq's API is OpenAI-compatible — swap base_url in client to fall back to/from other providers in seconds",
    ],
  },
  "together-ai": {
    slug: "together-ai",
    providerSummary:
      "Managed inference for open-source models at scale. Hosts DeepSeek, Llama, Qwen, Mixtral, etc.",
    officialStatusUrl: "https://status.together.ai",
    docsUrl: "https://docs.together.ai",
    pricingUrl: "https://www.together.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "api.together.xyz",
        description: "Inference, Fine-tuning, Code Sandbox",
        criticality: "critical",
      },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model cold start on less-used models",
        scope: "partial",
        signal: "First request to a less-used model is slow",
        quickCheck: "Retry; warm up model with a ping request",
      },
      {
        pattern: "Rate limits",
        scope: "local",
        signal: "429 responses based on account tier",
        quickCheck: "Check quota in Together dashboard",
      },
      {
        pattern: "Dedicated endpoint provisioning delays",
        scope: "partial",
        signal: "Newly provisioned dedicated endpoints slow to become active",
        quickCheck: "Check provisioning status in Together dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Together is degraded",
        alternative: "Fireworks AI, Groq, Replicate, DeepInfra host similar open models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Together is a key resilience layer for DeepSeek users when direct DeepSeek API is congested",
    ],
  },
  "hugging-face": {
    slug: "hugging-face",
    providerSummary:
      "Model hub, datasets, Spaces (demos), Inference API, Inference Endpoints. Central infrastructure for open-source AI.",
    officialStatusUrl: "https://status.huggingface.co",
    docsUrl: "https://huggingface.co/docs",
    pricingUrl: "https://huggingface.co/pricing",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/huggingface", label: "HuggingFace Discord" },
      {
        type: "forum",
        url: "https://discuss.huggingface.co",
        label: "HuggingFace Forum",
      },
    ],
    monitoredSurfaces: [
      { name: "huggingface.co", description: "", criticality: "critical" },
      { name: "Model downloads (CDN)", description: "", criticality: "high" },
      { name: "Inference API", description: "", criticality: "medium" },
      { name: "Spaces", description: "", criticality: "medium" },
      { name: "Datasets", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Gated-model download rate limits",
        scope: "local",
        signal: "429 or auth errors on gated model downloads",
        quickCheck: "Verify HF token and model access approval",
      },
      {
        pattern: "Inference API cold start",
        scope: "partial",
        signal: "First Inference API request slow after model inactivity",
        quickCheck: "Retry after a few seconds; model is loading",
      },
      {
        pattern: "Spaces free-tier sleep/wake cycles",
        scope: "partial",
        signal: "Space takes 20-30s to respond on first request",
        quickCheck: "Expected for free-tier Spaces; upgrade to paid for always-on",
      },
      {
        pattern: "CDN regional slowness",
        scope: "partial",
        signal: "Model downloads slow in specific regions",
        quickCheck: "Mirror to regional object storage for production use",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "HF CDN is slow",
        alternative: "Mirror popular models to S3/object storage",
        switchingCost: "medium",
      },
      {
        scenario: "HF Hub unavailable",
        alternative: "Modelscope is a Chinese alternative hub",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "HF CDN downloads are often the prod bottleneck — for reliability, mirror critical models to your own storage",
    ],
  },
  replicate: {
    slug: "replicate",
    providerSummary:
      "Run open-source models via API, pay-per-second. Popular for image/video/audio generation workloads.",
    officialStatusUrl: "https://www.replicatestatus.com",
    docsUrl: "https://replicate.com/docs",
    pricingUrl: "https://replicate.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.replicate.com", description: "", criticality: "critical" },
      { name: "Model run endpoints", description: "", criticality: "high" },
      { name: "Webhooks", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cold start delays on rarely-used models",
        scope: "partial",
        signal: "First prediction on an infrequently used model takes significantly longer",
        quickCheck: "Wait for cold start; consider a dedicated deployment for critical models",
      },
      {
        pattern: "GPU availability fluctuations",
        scope: "partial",
        signal: "Predictions queued or failing due to GPU shortage",
        quickCheck: "Check replicatestatus.com; retry with backoff",
      },
      {
        pattern: "Webhook delivery lag",
        scope: "partial",
        signal: "Prediction complete but webhook not received promptly",
        quickCheck: "Poll prediction status as backup; don't rely solely on webhooks",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Replicate is degraded",
        alternative: "Fal.ai and Modal are alternatives for image/video workloads",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Prediction webhooks can be delayed — don't assume webhook delivery is real-time; poll as backup",
    ],
  },
  "fireworks-ai": {
    slug: "fireworks-ai",
    providerSummary:
      "Fast inference for open-source models (Llama, DeepSeek, Mixtral, etc.) with fine-tuning support.",
    officialStatusUrl: "https://status.fireworks.ai",
    docsUrl: "https://docs.fireworks.ai",
    pricingUrl: "https://fireworks.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "api.fireworks.ai",
        description: "OpenAI-compatible API",
        criticality: "critical",
      },
      { name: "Fine-tuning jobs", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Capacity-driven 429s",
        scope: "partial",
        signal: "429 rate limit errors during peak demand",
        quickCheck: "Implement backoff; check groqstatus.com",
      },
      {
        pattern: "Fine-tuning job queue delays",
        scope: "partial",
        signal: "Fine-tuning jobs queued longer than expected",
        quickCheck: "Check job status in Fireworks dashboard",
      },
      {
        pattern: "Model cold start",
        scope: "partial",
        signal: "First request to model after inactivity is slow",
        quickCheck: "Warm up with a ping request before prod traffic",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fireworks is degraded",
        alternative: "Groq, Together AI, DeepInfra host similar models",
        switchingCost: "low",
        note: "Base URL swap",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: ["OpenAI-compatible API — client code swap is trivial"],
  },
  "nvidia-nim": {
    slug: "nvidia-nim",
    providerSummary:
      "NVIDIA's managed inference microservices. Deploy optimized models (Llama, Mistral, etc.) on NVIDIA hardware via containers.",
    officialStatusUrl: "https://status.nvidia.com",
    docsUrl: "https://docs.nvidia.com/nim",
    pricingUrl: "https://build.nvidia.com/nim",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "build.nvidia.com", description: "NIM catalog and console", criticality: "critical" },
      { name: "NIM Containers", description: "Container pull and run", criticality: "critical" },
      { name: "NVIDIA API Endpoint", description: "Hosted inference API", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Container pull rate limits",
        scope: "global",
        signal: "Docker pull from nvcr.io fails or is throttled",
        quickCheck: "Check NGC registry status; retry with authenticated pull",
      },
      {
        pattern: "GPU availability for specific models",
        scope: "partial",
        signal: "Some models unavailable due to GPU capacity",
        quickCheck: "Try a different model or region endpoint",
      },
      {
        pattern: "API quota limits",
        scope: "local",
        signal: "429 errors from hosted inference endpoint",
        quickCheck: "Check quota in NVIDIA developer console",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "NVIDIA NIM is degraded",
        alternative:
          "Together AI, Groq, or Fireworks AI host similar open models with an OpenAI-compatible API swap",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "NIM runs on NVIDIA infra — separate from cloud provider managed services like Bedrock or Vertex.",
    ],
  },
  "aws-bedrock": {
    slug: "aws-bedrock",
    providerSummary:
      "AWS managed AI service. Access Claude, Llama, Mistral, Stable Diffusion, etc. via unified API on AWS infrastructure.",
    officialStatusUrl: "https://health.aws.amazon.com/health/status",
    docsUrl: "https://docs.aws.amazon.com/bedrock",
    pricingUrl: "https://aws.amazon.com/bedrock/pricing/",
    communityLinks: [
      { type: "github", url: "https://github.com/aws-samples/amazon-bedrock-samples", label: "aws-samples/amazon-bedrock-samples", verified: false },
      { type: "reddit", url: "https://reddit.com/r/aws", label: "r/aws", verified: false },
    ],
    monitoredSurfaces: [
      { name: "Bedrock API", description: "Model invocation API (per-region)", criticality: "critical" },
      { name: "Bedrock Console", description: "AWS management console", criticality: "high" },
      { name: "Knowledge Bases", description: "Bedrock Knowledge Bases RAG service", criticality: "high" },
      { name: "Agents", description: "Bedrock Agents service", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Region-specific availability issues",
        scope: "partial",
        signal: "Failures in one AWS region while others work",
        quickCheck: "Test us-west-2 vs us-east-1; check AWS Health Dashboard per-region",
      },
      {
        pattern: "Model invocation throttling",
        scope: "local",
        signal: "ThrottlingException on API calls",
        quickCheck: "Check service quotas in AWS console; implement exponential backoff",
      },
      {
        pattern: "Knowledge Base indexing delays",
        scope: "global",
        signal: "New documents not appearing in KB queries",
        quickCheck: "Check sync job status in Bedrock console",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Bedrock is degraded in one region",
        alternative:
          "Try another AWS region — low cost; if Bedrock is fully down, direct Anthropic API or Google Vertex AI as fallback",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Bedrock is regional — an us-east-1 outage doesn't mean us-west-2 is down. Always check per-region health.",
      "Claude on Bedrock is a different infrastructure from the direct Anthropic API.",
    ],
  },
  "azure-openai": {
    slug: "azure-openai",
    providerSummary:
      "Microsoft's managed OpenAI models on Azure. Enterprise SLAs, data residency, private endpoints. Separate infrastructure from direct OpenAI.",
    officialStatusUrl: "https://azure.status.microsoft/en-us/status",
    docsUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/",
    pricingUrl: "https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Azure OpenAI API", description: "Model inference API (per-region)", criticality: "critical" },
      { name: "Azure OpenAI Studio", description: "Studio and playground", criticality: "high" },
      { name: "PTU Endpoints", description: "Provisioned throughput unit endpoints", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Regional capacity exhaustion",
        scope: "partial",
        signal: "Capacity errors in specific Azure region",
        quickCheck: "Switch to another region; check Azure Service Health per-region",
      },
      {
        pattern: "PTU provisioning delays",
        scope: "local",
        signal: "Provisioned capacity not available after purchase",
        quickCheck: "Contact Azure support; PTU provisioning can take time",
      },
      {
        pattern: "Content filter false positives",
        scope: "global",
        signal: "Legitimate requests rejected by content filter",
        quickCheck: "Adjust content filter settings in Azure OpenAI Studio",
      },
      {
        pattern: "Deployment quota limits",
        scope: "local",
        signal: "Cannot deploy new model version due to quota",
        quickCheck: "Request quota increase in Azure portal",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Azure OpenAI is degraded",
        alternative:
          "Direct OpenAI API can reduce downtime with a base URL swap; Anthropic API or Google Gemini for alternate models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Azure OpenAI is the key fallback for direct OpenAI users and vice versa — most production teams should have both provisioned.",
      "Regional — check specific region health before declaring a global outage.",
    ],
  },
  "google-vertex": {
    slug: "google-vertex",
    providerSummary:
      "Google Cloud's enterprise AI platform. Access Gemini, Claude, Llama, custom models. MLOps, RAG, fine-tuning.",
    officialStatusUrl: "https://status.cloud.google.com",
    docsUrl: "https://cloud.google.com/vertex-ai/docs",
    pricingUrl: "https://cloud.google.com/vertex-ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Vertex AI API", description: "Model inference and prediction API", criticality: "critical" },
      { name: "Model Garden", description: "Model catalog and deployment", criticality: "high" },
      { name: "Vertex AI Search", description: "Managed RAG and search service", criticality: "high" },
      { name: "Online Prediction Endpoints", description: "Custom model serving", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Quota exhaustion",
        scope: "local",
        signal: "RESOURCE_EXHAUSTED errors on API calls",
        quickCheck: "Check quotas in GCP console; request increase",
      },
      {
        pattern: "Specific model deployment delays",
        scope: "partial",
        signal: "New model versions slow to become available",
        quickCheck: "Check Vertex Model Garden for deployment status",
      },
      {
        pattern: "Regional outages",
        scope: "partial",
        signal: "Failures in one GCP region",
        quickCheck: "Check GCP status per-region; try us-central1 as fallback",
      },
      {
        pattern: "Vertex AI Search index build failures",
        scope: "global",
        signal: "Index updates fail or don't complete",
        quickCheck: "Check index sync status in Vertex AI console",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vertex AI is degraded",
        alternative:
          "Google AI Studio (different infra) can reduce downtime for Gemini; AWS Bedrock for managed model alternatives",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Vertex AI and AI Studio are separate infrastructures — Vertex can be down while AI Studio works.",
      "Vertex also hosts Claude via Anthropic partnership — check both Vertex and Anthropic status for Claude on Vertex.",
    ],
  },
  "cloudflare-ai": {
    slug: "cloudflare-ai",
    providerSummary:
      "Edge AI inference on Cloudflare Workers. Run open models at the edge (Llama, Mistral, Whisper, SD). Also AI Gateway for routing and caching.",
    officialStatusUrl: "https://www.cloudflarestatus.com",
    docsUrl: "https://developers.cloudflare.com/workers-ai/",
    pricingUrl: "https://developers.cloudflare.com/workers-ai/platform/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Workers AI API", description: "Edge inference API", criticality: "critical" },
      { name: "AI Gateway", description: "LLM routing and caching layer", criticality: "high" },
      { name: "Vectorize", description: "Edge vector database", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Edge location-specific availability",
        scope: "partial",
        signal: "Failures in specific Cloudflare PoPs",
        quickCheck: "Test from different geographic locations; check Cloudflare status",
      },
      {
        pattern: "Model cold start",
        scope: "local",
        signal: "First request after idle period is very slow",
        quickCheck: "Expected behavior — retry; use keep-warm patterns in production",
      },
      {
        pattern: "AI Gateway routing errors",
        scope: "global",
        signal: "Requests fail to route through AI Gateway",
        quickCheck: "Test direct provider endpoint to isolate Gateway vs. model issue",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Cloudflare AI is degraded",
        alternative:
          "Groq or Together AI for inference; Vercel AI SDK as an alternative routing layer",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  cerebras: {
    slug: "cerebras",
    providerSummary:
      "Ultra-fast AI inference on custom wafer-scale chips. Hosts open models (Llama, etc.) with extremely low latency.",
    docsUrl: "https://inference-docs.cerebras.ai",
    pricingUrl: "https://cerebras.ai/inference",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.cerebras.ai", description: "OpenAI-compatible inference API", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Capacity-driven rate limits",
        scope: "global",
        signal: "429 errors during peak demand",
        quickCheck: "Implement exponential backoff; check Cerebras status",
      },
      {
        pattern: "Specific model availability",
        scope: "partial",
        signal: "One model fails while others work",
        quickCheck: "Switch to available model; check model list via /v1/models",
      },
      {
        pattern: "Beta feature instability",
        scope: "partial",
        signal: "Newer or preview features fail",
        quickCheck: "Use stable model versions; check release notes for beta caveats",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Cerebras is degraded",
        alternative:
          "Groq (also ultra-fast), Together AI, or Fireworks AI can reduce downtime with an OpenAI-compatible API swap",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Cerebras API is OpenAI-compatible — switching to Groq or Together AI is a base_url swap.",
    ],
  },
  modal: {
    slug: "modal",
    providerSummary:
      "Modal is a serverless platform for running Python functions, GPU jobs and web endpoints, deployed from the CLI. Users experience it through container starts, scheduled runs and served endpoints, so incidents show up as cold starts that never finish or endpoints returning 5xx.",
    officialStatusUrl: "https://status.modal.com/",
    docsUrl: "https://modal.com/docs",
    pricingUrl: "https://modal.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Modal control plane", description: "Deploys, scheduling and the dashboard", criticality: "critical" },
      { name: "Container / GPU capacity", description: "Function execution", criticality: "critical" },
      { name: "Web endpoints", description: "Served HTTP functions", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Functions stuck in pending or cold start",
        scope: "partial",
        signal: "Calls wait far longer than the usual cold start, often for a specific GPU type",
        quickCheck: "Check status.modal.com and try a different GPU type; capacity incidents are usually per accelerator",
      },
      {
        pattern: "Deploy or image build failing",
        scope: "partial",
        signal: "modal deploy errors during the build step although the code is unchanged",
        quickCheck: "Retry the deploy; if builds fail for everyone, the build service is degraded",
      },
      {
        pattern: "Served endpoints returning 5xx",
        scope: "partial",
        signal: "Web endpoints error while the dashboard works",
        quickCheck: "Invoke the function directly from the CLI; if that works, the ingress layer is the problem",
      },
      {
        pattern: "Rate limits or quota errors",
        scope: "local",
        signal: "Requests rejected with limit messages for your workspace only",
        quickCheck: "Check workspace limits in the dashboard before treating it as an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Modal capacity or control plane is down",
        alternative: "RunPod, Replicate or Baseten (monitored on DownForAI) can host the same GPU workloads",
        switchingCost: "high",
        note: "Requires repackaging the function outside Modal's SDK",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "abacus-ai": {
    slug: "abacus-ai",
    providerSummary:
      "Abacus.AI is an enterprise AI platform (model training, deployment, agents) that also sells ChatLLM, a consumer multi-model assistant. Enterprise deployments and ChatLLM share Abacus's cloud but fail in different ways: pipelines and endpoints on one side, model relays on the other.",
    docsUrl: "https://abacus.ai/help",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "abacus.ai platform", description: "Console, pipelines, deployments", criticality: "critical" },
      { name: "ChatLLM", description: "Consumer assistant", criticality: "high" },
      { name: "Third-party models", description: "Relayed inside ChatLLM", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "ChatLLM errors on one model while others answer",
        scope: "partial",
        signal: "Switching the model restores replies",
        quickCheck: "Change model; the failure is the upstream provider",
      },
      {
        pattern: "Deployment endpoints returning 5xx",
        scope: "partial",
        signal: "Hosted model endpoints error while the console loads",
        quickCheck: "Redeploy once; if endpoints fail across projects, serving is degraded",
      },
      {
        pattern: "Pipeline runs stuck",
        scope: "partial",
        signal: "Training or refresh pipelines stay running far beyond the norm",
        quickCheck: "Wait; compute queues clear — check the run logs for a specific error first",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Abacus.AI is down",
        alternative: "Databricks or TrueFoundry (monitored on DownForAI) cover model deployment; Poe covers multi-model chat",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Third-party model providers"],
    operatorNotes: [],
  },
  "akash-network": {
    slug: "akash-network",
    providerSummary:
      "Akash is a decentralised compute marketplace where providers lease CPU and GPU capacity to deployments paid in AKT/USDC. Availability depends on the chain, individual providers and whether anyone bids on your deployment, not on a central service.",
    docsUrl: "https://akash.network/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Akash blockchain", description: "Deployment orders and leases", criticality: "critical" },
      { name: "Providers", description: "Independent operators hosting workloads", criticality: "critical" },
      { name: "Console and RPC endpoints", description: "Deployment tooling", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "No bids on a deployment",
        scope: "local",
        signal: "The order stays open without provider bids",
        quickCheck: "Raise the price or relax resource requirements; GPU capacity is scarce on the marketplace",
      },
      {
        pattern: "Provider goes offline",
        scope: "partial",
        signal: "A running deployment becomes unreachable while the chain works",
        quickCheck: "Close the lease and redeploy on another provider; providers are independent",
      },
      {
        pattern: "RPC or console errors",
        scope: "partial",
        signal: "The console cannot broadcast transactions",
        quickCheck: "Switch to another RPC endpoint in settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Akash cannot place your workload",
        alternative: "RunPod, Vast.ai or Salad (monitored on DownForAI) offer marketplace-style GPU capacity with a central operator",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Cosmos-based chain", "Independent providers"],
    operatorNotes: [],
  },
  "aws-sagemaker": {
    slug: "aws-sagemaker",
    providerSummary:
      "Amazon SageMaker is AWS's managed platform for training, tuning and hosting models (Studio, endpoints, JumpStart), billed per instance. Incidents are regional and appear on the AWS Health Dashboard; most user-facing failures are quotas and capacity for specific instance types.",
    officialStatusUrl: "https://health.aws.amazon.com/health/status",
    docsUrl: "https://docs.aws.amazon.com/sagemaker/",
    pricingUrl: "https://aws.amazon.com/sagemaker/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "SageMaker control plane (regional)", description: "Jobs, endpoints, Studio", criticality: "critical" },
      { name: "Instance capacity", description: "GPU instance availability", criticality: "high" },
      { name: "Account quotas", description: "Per-instance-type limits", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "ResourceLimitExceeded on training or endpoints",
        scope: "local",
        signal: "Jobs refused because the account's quota for an instance type is zero or reached",
        quickCheck: "Request a quota increase in Service Quotas; this is your account, not an outage",
      },
      {
        pattern: "InsufficientInstanceCapacity",
        scope: "partial",
        signal: "Jobs fail to start for a GPU type in a region",
        quickCheck: "Try another region or instance type; capacity is regional",
      },
      {
        pattern: "Regional service incident",
        scope: "partial",
        signal: "Endpoints error or Studio will not load in one region; the Health Dashboard lists it",
        quickCheck: "Fail over to another region if the deployment allows",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SageMaker is unavailable in your region",
        alternative: "Google Vertex AI or Azure AI Studio (monitored on DownForAI) offer managed training and hosting; RunPod covers raw GPUs",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["AWS regional infrastructure"],
    operatorNotes: [],
  },
  "azure-ai-studio": {
    slug: "azure-ai-studio",
    providerSummary:
      "Azure AI Studio, now Azure AI Foundry (ai.azure.com), is Microsoft's platform for building with Azure OpenAI and other models: deployments, agents, evaluation. Its health follows Azure's status page, and most failures are regional quotas and model deployment limits.",
    officialStatusUrl: "https://azure.status.microsoft/en-us/status/",
    docsUrl: "https://learn.microsoft.com/azure/ai-studio/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ai.azure.com portal", description: "Foundry portal", criticality: "high" },
      { name: "Model deployments (regional)", description: "Inference endpoints", criticality: "critical" },
      { name: "Azure subscription quotas", description: "Tokens-per-minute limits", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "429 on a deployment",
        scope: "local",
        signal: "Requests throttled against the deployment's tokens-per-minute quota",
        quickCheck: "Raise the deployment's TPM or add a deployment in another region; the status page will be green",
      },
      {
        pattern: "Model not available in the region",
        scope: "local",
        signal: "A model cannot be deployed or errors in a specific region",
        quickCheck: "Check the model availability table; deploy in a supported region",
      },
      {
        pattern: "Azure regional incident",
        scope: "partial",
        signal: "Deployments error in one region; the Azure status page lists it",
        quickCheck: "Fail over to a deployment in another region",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Azure AI Foundry is degraded",
        alternative: "OpenAI API or Anthropic API (monitored on DownForAI) serve comparable models on separate capacity",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Azure regional infrastructure", "Azure OpenAI"],
    operatorNotes: [],
  },
  "baidu-ai-cloud": {
    slug: "baidu-ai-cloud",
    providerSummary:
      "Baidu AI Cloud (international portal intl.cloud.baidu.com) offers GPU compute and the Qianfan model platform with ERNIE APIs, mainly to customers in China and Asia. Account verification and regional availability drive most reports from abroad.",
    docsUrl: "https://intl.cloud.baidu.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Baidu AI Cloud console", description: "Account and services", criticality: "critical" },
      { name: "Qianfan / ERNIE APIs", description: "Model serving", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Account or region restrictions",
        scope: "local",
        signal: "Services unavailable until verification or outside supported regions",
        quickCheck: "Complete real-name verification and check regional availability",
      },
      {
        pattern: "API quota or balance exhausted",
        scope: "local",
        signal: "Requests rejected with a balance message",
        quickCheck: "Check the console balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Baidu AI Cloud is unavailable",
        alternative: "Alibaba Qwen or Tencent Hunyuan (monitored on DownForAI) offer comparable Chinese cloud models",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "banana-dev": {
    slug: "banana-dev",
    providerSummary:
      "Banana was a serverless GPU platform for deploying ML models; the company wound down its hosted product in 2024. The website still answers, but no new workloads should depend on it.",
    docsUrl: "https://www.banana.dev",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "banana.dev", description: "Website", criticality: "low" },
      { name: "Serverless GPU platform", description: "Discontinued", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Deployments or API keys no longer working",
        scope: "global",
        signal: "Legacy endpoints return errors",
        quickCheck: "Expected after the shutdown; migrate",
      },
      {
        pattern: "Website online but no product",
        scope: "local",
        signal: "The site loads without a working dashboard",
        quickCheck: "Do not read the homepage as a service signal",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Banana",
        alternative: "Modal, Baseten or Beam Cloud (monitored on DownForAI) offer serverless GPU deployment",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Product discontinued; consider marking this service inactive in the DB.",
    ],
  },
  baseten: {
    slug: "baseten",
    providerSummary:
      "Baseten deploys and serves models (Truss packaging, dedicated and shared endpoints, Model APIs) with autoscaling on GPUs, billed per minute. Developers see incidents as deploys failing, cold starts stretching or endpoint 5xx; Baseten runs its own status page.",
    docsUrl: "https://docs.baseten.co",
    pricingUrl: "https://www.baseten.co/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Baseten control plane", description: "Deploys and dashboard", criticality: "critical" },
      { name: "Model endpoints", description: "Inference", criticality: "critical" },
      { name: "GPU capacity", description: "Autoscaling", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Endpoints returning 5xx or timing out",
        scope: "partial",
        signal: "Inference calls fail across models while the dashboard loads",
        quickCheck: "Check Baseten's status page; retry with backoff",
      },
      {
        pattern: "Cold starts far longer than usual",
        scope: "partial",
        signal: "Scaled-to-zero models take minutes to answer",
        quickCheck: "Keep a minimum replica for critical models; capacity for the GPU type may be constrained",
      },
      {
        pattern: "Deploy failing at build",
        scope: "local",
        signal: "The Truss build errors on dependencies",
        quickCheck: "Check the build logs; if builds fail for every model, the build service is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Baseten is down",
        alternative: "Modal, Replicate or RunPod (monitored on DownForAI) can serve the same models",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Baseten publishes its own status page; DownForAI probes baseten.co only.",
    ],
  },
  "beam-cloud": {
    slug: "beam-cloud",
    providerSummary:
      "Beam is a serverless GPU platform for running Python functions, endpoints and task queues with fast cold starts, billed per second. Incidents look like containers failing to start, queues backing up or GPU types unavailable.",
    docsUrl: "https://docs.beam.cloud",
    pricingUrl: "https://www.beam.cloud/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Beam control plane", description: "Deploys and dashboard", criticality: "critical" },
      { name: "Container runtime", description: "Function execution", criticality: "critical" },
      { name: "GPU capacity", description: "Per-type availability", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tasks stuck pending",
        scope: "partial",
        signal: "Invocations wait far longer than the usual cold start",
        quickCheck: "Try another GPU type; capacity incidents are per accelerator",
      },
      {
        pattern: "Deploy or image build failing",
        scope: "partial",
        signal: "Deploys error at build for unchanged code",
        quickCheck: "Retry; if builds fail for everyone, the build service is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Beam is down",
        alternative: "Modal or RunPod (monitored on DownForAI) run the same serverless GPU workloads",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  bentoml: {
    slug: "bentoml",
    providerSummary:
      "BentoML is an open-source framework for packaging and serving models, plus BentoCloud, a managed deployment platform. Framework users depend only on their own infrastructure; BentoCloud users on the hosted control plane and GPU capacity.",
    docsUrl: "https://docs.bentoml.com",
    communityLinks: [
      { type: "github", url: "https://github.com/bentoml/BentoML", label: "bentoml/BentoML", verified: true },
    ],
    monitoredSurfaces: [
      { name: "BentoCloud", description: "Managed deployments", criticality: "high" },
      { name: "Open-source framework", description: "Self-hosted serving", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "BentoCloud deployments failing to start",
        scope: "partial",
        signal: "Deployments stay pending or crash-loop across users",
        quickCheck: "Serve the Bento locally to confirm it works; a cloud-only failure isolates BentoCloud",
      },
      {
        pattern: "Build errors after upgrading the framework",
        scope: "local",
        signal: "bentofile or service APIs changed between versions",
        quickCheck: "Pin the version and follow the migration guide",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "BentoCloud is down",
        alternative: "Modal, RunPod or Baseten (monitored on DownForAI) can serve the same Bento container",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  coreweave: {
    slug: "coreweave",
    providerSummary:
      "CoreWeave is a GPU cloud built on Kubernetes for AI training and inference, mostly under reserved contracts with large customers. Its incidents are cluster or regional events, visible to customers through the console and CoreWeave's status page.",
    docsUrl: "https://docs.coreweave.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "CoreWeave Kubernetes clusters", description: "Workloads", criticality: "critical" },
      { name: "Console and API", description: "Management", criticality: "high" },
      { name: "Networking / storage", description: "Cluster services", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Pods failing to schedule on a GPU type",
        scope: "partial",
        signal: "Workloads stay pending for a specific accelerator in a region",
        quickCheck: "Check the status page and try another region or GPU class if your contract allows",
      },
      {
        pattern: "Storage or networking degradation",
        scope: "partial",
        signal: "Jobs run but I/O throughput drops or volumes detach",
        quickCheck: "Check the status page for storage components; retry mounts",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CoreWeave capacity is unavailable",
        alternative: "Lambda Labs, Crusoe or Nebius AI (monitored on DownForAI) offer large GPU clusters",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "CoreWeave publishes its own status page; DownForAI probes coreweave.com only.",
    ],
  },
  "crusoe-energy": {
    slug: "crusoe-energy",
    providerSummary:
      "Crusoe Cloud provides GPU compute (VMs, managed Kubernetes) powered by stranded and renewable energy, sold on demand and under reservations. Failures are regional capacity and control-plane issues seen from the console and API.",
    docsUrl: "https://docs.crusoecloud.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Crusoe Cloud console / API", description: "Management", criticality: "critical" },
      { name: "GPU instances (regional)", description: "Compute", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Instances unavailable for a GPU type",
        scope: "partial",
        signal: "Launches fail with capacity errors in a region",
        quickCheck: "Try another region or reserve capacity",
      },
      {
        pattern: "Console or API errors",
        scope: "partial",
        signal: "Management calls fail while running instances keep working",
        quickCheck: "Retry later; running workloads are unaffected",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Crusoe capacity is unavailable",
        alternative: "Lambda Labs, CoreWeave or Nebius AI (monitored on DownForAI) offer comparable GPU clouds",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  databricks: {
    slug: "databricks",
    providerSummary:
      "Databricks is a data and AI platform (Spark compute, Delta Lake, Mosaic AI model serving, notebooks) deployed per cloud region on AWS, Azure and GCP. Incidents are regional and per component, published on Databricks' status page.",
    officialStatusUrl: "https://status.databricks.com/",
    docsUrl: "https://docs.databricks.com",
    pricingUrl: "https://www.databricks.com/product/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Workspaces (regional)", description: "UI and API", criticality: "critical" },
      { name: "Compute / jobs", description: "Clusters and workflows", criticality: "critical" },
      { name: "Model serving", description: "Mosaic AI endpoints", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Clusters failing to start",
        scope: "partial",
        signal: "Cluster creation errors or hangs in a region; the status page lists a compute incident",
        quickCheck: "Check the region on status.databricks.com; try a different instance type",
      },
      {
        pattern: "Model serving endpoints degraded",
        scope: "partial",
        signal: "Serving endpoints return 5xx while notebooks work",
        quickCheck: "Check the Model Serving component; retry with backoff",
      },
      {
        pattern: "Cloud provider capacity",
        scope: "local",
        signal: "Jobs fail because the underlying cloud has no instances of the requested type",
        quickCheck: "Change the instance type or region; this is the cloud provider",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Databricks is down in your region",
        alternative: "AWS SageMaker or Google Vertex AI (monitored on DownForAI) cover managed ML on the same clouds",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["AWS / Azure / GCP infrastructure"],
    operatorNotes: [],
  },
  deepinfra: {
    slug: "deepinfra",
    providerSummary:
      "DeepInfra serves open-weight models (LLMs, embeddings, image) through an OpenAI-compatible API at low prices, with a status page. Developers see incidents as 429s, 5xx or latency on specific models.",
    officialStatusUrl: "https://status.deepinfra.com/",
    docsUrl: "https://deepinfra.com/docs",
    pricingUrl: "https://deepinfra.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.deepinfra.com", description: "Inference API", criticality: "critical" },
      { name: "Per-model capacity", description: "Models degrade individually", criticality: "high" },
      { name: "Dashboard", description: "Keys and usage", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "5xx or elevated latency on one model",
        scope: "partial",
        signal: "A specific model errors while others respond",
        quickCheck: "Check status.deepinfra.com; switch model or provider",
      },
      {
        pattern: "429 rate limits",
        scope: "local",
        signal: "Requests rejected with rate-limit responses for your account",
        quickCheck: "Check the account's concurrency limits",
      },
      {
        pattern: "Model retired",
        scope: "local",
        signal: "A model ID returns not-found after previously working",
        quickCheck: "Check the model catalogue; DeepInfra rotates hosted models",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "DeepInfra is degraded",
        alternative: "Together AI, Fireworks AI or Groq (monitored on DownForAI) serve the same open models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "fal-ai": {
    slug: "fal-ai",
    providerSummary:
      "fal.ai is a serverless inference platform for image, video and audio models (FLUX, Kling, Wan and hundreds more) with a queue-based API and playground, billed per generation. Incidents show as queue delays, per-model errors or 429s and are published on fal's status page.",
    officialStatusUrl: "https://status.fal.ai/",
    docsUrl: "https://docs.fal.ai",
    pricingUrl: "https://fal.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "fal.ai API and queue", description: "Model endpoints", criticality: "critical" },
      { name: "Per-model capacity", description: "Models degrade individually", criticality: "high" },
      { name: "Dashboard / playground", description: "Keys and testing", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue positions climbing on a model",
        scope: "partial",
        signal: "Requests wait far longer than usual for a specific model",
        quickCheck: "Check status.fal.ai; switch to an equivalent model",
      },
      {
        pattern: "429 concurrency limits",
        scope: "local",
        signal: "Requests rejected for your account only",
        quickCheck: "Check the account's limits; contact fal to raise them",
      },
      {
        pattern: "Balance exhausted",
        scope: "local",
        signal: "Requests refused with a payment message",
        quickCheck: "Add credit in the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "fal.ai is degraded",
        alternative: "Replicate or Together AI (monitored on DownForAI) host many of the same media models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Fal.ai Flux is tracked as a separate Image-category entry on DownForAI.",
    ],
  },
  fluidstack: {
    slug: "fluidstack",
    providerSummary:
      "FluidStack provides GPU clusters for AI training and inference, largely under reserved contracts, with a console and API for provisioning. Incidents are cluster-level events communicated to customers directly.",
    docsUrl: "https://docs.fluidstack.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "FluidStack console / API", description: "Provisioning", criticality: "high" },
      { name: "GPU clusters", description: "Compute", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Instances unavailable for a GPU type",
        scope: "partial",
        signal: "Provisioning fails with capacity errors",
        quickCheck: "Try another region or contact your account team for reserved capacity",
      },
      {
        pattern: "Node failures inside a cluster",
        scope: "local",
        signal: "Jobs die on specific nodes",
        quickCheck: "Cordon the node and reschedule; report through support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "FluidStack capacity is unavailable",
        alternative: "Lambda Labs, CoreWeave or Nebius AI (monitored on DownForAI) offer GPU clusters",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "google-ai-platform": {
    slug: "google-ai-platform",
    providerSummary:
      "Google AI Platform was the legacy name of Google Cloud's managed ML services, folded into Vertex AI; the old URL now redirects to Google Cloud's AI product pages. Availability follows the Google Cloud status dashboard, and most failures are quotas and regional model availability.",
    officialStatusUrl: "https://status.cloud.google.com/",
    docsUrl: "https://cloud.google.com/vertex-ai/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Vertex AI (regional)", description: "Training, endpoints, model garden", criticality: "critical" },
      { name: "Google Cloud console", description: "Management", criticality: "high" },
      { name: "Project quotas", description: "Per-model and per-region limits", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "429 RESOURCE_EXHAUSTED on a model",
        scope: "local",
        signal: "Requests throttled against the project's quota for a model in a region",
        quickCheck: "Request a quota increase or use another region; the status dashboard will be green",
      },
      {
        pattern: "Model not available in the region",
        scope: "local",
        signal: "Deployment or prediction fails for a model in a specific region",
        quickCheck: "Check the model's regional availability table",
      },
      {
        pattern: "Regional Vertex AI incident",
        scope: "partial",
        signal: "Elevated errors in one region on the status dashboard",
        quickCheck: "Fail over to another region",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vertex AI is degraded",
        alternative: "AWS SageMaker or Azure AI Studio (monitored on DownForAI) offer managed ML; Google AI Studio serves Gemini on separate capacity",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Google Cloud regional infrastructure"],
    operatorNotes: [
      "Legacy DB entry: Google Vertex AI is tracked separately on DownForAI.",
    ],
  },
  "gradient-ai": {
    slug: "gradient-ai",
    providerSummary:
      "Gradient AI offered fine-tuning and private model hosting for enterprises; the company has pivoted and gradient.ai now redirects to a new brand (hyperagent.com). Existing Gradient APIs should be considered discontinued.",
    docsUrl: "https://gradient.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "gradient.ai → hyperagent.com", description: "Website redirect", criticality: "low" },
      { name: "Gradient API", description: "Legacy", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Legacy API keys failing",
        scope: "global",
        signal: "Fine-tuning or inference endpoints return errors",
        quickCheck: "Expected after the pivot; migrate",
      },
      {
        pattern: "Redirected site unrelated to the old product",
        scope: "local",
        signal: "The homepage describes a different product",
        quickCheck: "Do not read the probe as a signal for the old service",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Gradient",
        alternative: "Together AI or Hugging Face (monitored on DownForAI) offer fine-tuning and hosting",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "gradient.ai redirects to hyperagent.com; consider marking this service inactive.",
    ],
  },
  hyperstack: {
    slug: "hyperstack",
    providerSummary:
      "Hyperstack (NexGen Cloud) offers on-demand and reserved GPU VMs with a console and API, priced per hour. Incidents are capacity for specific GPU types and control-plane errors.",
    docsUrl: "https://infrahub-doc.nexgencloud.com",
    pricingUrl: "https://www.hyperstack.cloud/gpu-pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Hyperstack console / API", description: "Provisioning", criticality: "critical" },
      { name: "GPU VMs (regional)", description: "Compute", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "No capacity for a GPU type",
        scope: "partial",
        signal: "VM launches fail with capacity errors in a region",
        quickCheck: "Try another region or GPU model; reserve capacity for critical jobs",
      },
      {
        pattern: "VM stuck in a transitional state",
        scope: "local",
        signal: "An instance stays 'creating' or 'stopping'",
        quickCheck: "Wait, then contact support; running VMs are unaffected",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Hyperstack capacity is unavailable",
        alternative: "RunPod, Lambda Labs or Vultr Cloud GPU (monitored on DownForAI) offer on-demand GPUs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The docs host (infrahub-doc.nexgencloud.com) redirects to docs.hyperstack.cloud.",
    ],
  },
  inferless: {
    slug: "inferless",
    providerSummary:
      "Inferless is a serverless GPU inference platform that deploys models from Hugging Face or Git with autoscaling and fast cold starts, billed per second. Incidents are deploys failing, cold starts stretching or endpoint errors.",
    docsUrl: "https://docs.inferless.com",
    pricingUrl: "https://www.inferless.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Inferless console / API", description: "Deploys", criticality: "critical" },
      { name: "Model endpoints", description: "Inference", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Endpoints erroring or slow to wake",
        scope: "partial",
        signal: "Inference calls time out across models",
        quickCheck: "Retry with backoff; keep a minimum replica for critical models",
      },
      {
        pattern: "Deploy failing at build",
        scope: "local",
        signal: "Builds error on dependencies",
        quickCheck: "Check the build logs; if all builds fail, the build service is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Inferless is down",
        alternative: "Modal, Baseten or Beam Cloud (monitored on DownForAI) offer serverless inference",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Hugging Face for model pulls"],
    operatorNotes: [],
  },
  "jina-ai": {
    slug: "jina-ai",
    providerSummary:
      "Jina AI provides search-foundation APIs — embeddings, rerankers, the Reader API for web content — plus open-source frameworks. Developers see incidents as API errors or rate limits on specific endpoints.",
    docsUrl: "https://jina.ai",
    communityLinks: [
      { type: "github", url: "https://github.com/jina-ai/jina", label: "jina-ai on GitHub", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Jina APIs", description: "Embeddings, reranker, reader", criticality: "critical" },
      { name: "jina.ai", description: "Website and dashboard", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One endpoint failing while others work",
        scope: "partial",
        signal: "Reader errors while embeddings succeed, or vice versa",
        quickCheck: "Test another endpoint; failures are per service",
      },
      {
        pattern: "429 or token balance exhausted",
        scope: "local",
        signal: "Requests rejected for your key",
        quickCheck: "Check the balance and rate limits in the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Jina APIs are down",
        alternative: "Cohere or OpenAI API (monitored on DownForAI) provide embeddings and reranking",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "lambda-labs": {
    slug: "lambda-labs",
    providerSummary:
      "Lambda (formerly Lambda Labs) is a GPU cloud with on-demand instances, 1-Click Clusters and an inference API; lambdalabs.com redirects to lambda.ai. Its classic failure is 'no capacity' for a GPU type, alongside control-plane incidents on its status page.",
    officialStatusUrl: "https://status.lambdalabs.com/",
    docsUrl: "https://docs.lambda.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Lambda Cloud console / API", description: "Provisioning", criticality: "critical" },
      { name: "GPU instances (regional)", description: "Compute", criticality: "critical" },
      { name: "Inference API", description: "Hosted models", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "No instances available for a GPU type",
        scope: "partial",
        signal: "Launch requests fail with capacity errors, often for H100/A100 in popular regions",
        quickCheck: "Try another region or GPU type; capacity fluctuates hourly and is not an outage",
      },
      {
        pattern: "Console or API errors",
        scope: "partial",
        signal: "Management calls fail while running instances keep working",
        quickCheck: "Check the status page; running workloads are unaffected",
      },
      {
        pattern: "Inference API 429 or 5xx",
        scope: "partial",
        signal: "Hosted model calls fail while instances work",
        quickCheck: "Retry with backoff; the inference API is a separate service",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Lambda has no capacity",
        alternative: "RunPod, Vast.ai or CoreWeave (monitored on DownForAI) offer alternative GPU capacity",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "status.lambdalabs.com redirects to status.lambda.ai; DownForAI's surface follows the redirect.",
    ],
  },
  "lepton-ai": {
    slug: "lepton-ai",
    providerSummary:
      "Lepton AI was a serverless AI inference and GPU platform; it was acquired by NVIDIA in 2025 and folded into DGX Cloud Lepton, and lepton.ai no longer answers. Existing Lepton endpoints should be treated as migrated or discontinued.",
    docsUrl: "https://www.lepton.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lepton.ai", description: "Former website (unreachable)", criticality: "low" },
      { name: "DGX Cloud Lepton", description: "Successor platform", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "lepton.ai does not resolve",
        quickCheck: "Expected after the acquisition; use NVIDIA's DGX Cloud Lepton",
      },
      {
        pattern: "Legacy endpoints failing",
        scope: "local",
        signal: "Old Lepton API keys or deployments error",
        quickCheck: "Migrate to the successor platform or another provider",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Lepton",
        alternative: "NVIDIA NIM, Modal or Baseten (monitored on DownForAI) offer inference hosting",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["NVIDIA DGX Cloud"],
    operatorNotes: [
      "The DB website URL is dead; consider marking this service inactive or re-pointing it to DGX Cloud Lepton.",
    ],
  },
  "lightning-ai": {
    slug: "lightning-ai",
    providerSummary:
      "Lightning AI is a cloud development platform (Studios with persistent GPU environments, training jobs, serving) from the PyTorch Lightning team, on credit-based plans. Incidents are Studios failing to start, GPU capacity and control-plane errors.",
    docsUrl: "https://lightning.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lightning.ai platform", description: "Studios and jobs", criticality: "critical" },
      { name: "GPU capacity", description: "Per-type availability", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Studio stuck starting or switching to GPU",
        scope: "partial",
        signal: "Environments never become ready across users",
        quickCheck: "Try a CPU Studio; if that starts, the GPU pool is constrained",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Compute refused with a credit message for your account",
        quickCheck: "Check the credit balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Lightning AI is down",
        alternative: "Paperspace, RunPod or Modal (monitored on DownForAI) offer hosted GPU environments",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "nebius-ai": {
    slug: "nebius-ai",
    providerSummary:
      "Nebius is a European AI cloud (GPU clusters, managed Kubernetes, AI Studio inference API); nebius.ai redirects to nebius.com. Incidents are regional capacity and control-plane events, plus inference API errors on AI Studio.",
    docsUrl: "https://docs.nebius.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Nebius console / API", description: "Provisioning", criticality: "critical" },
      { name: "GPU clusters (regional)", description: "Compute", criticality: "critical" },
      { name: "AI Studio", description: "Inference API", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "No capacity for a GPU platform",
        scope: "partial",
        signal: "VM or cluster creation fails with capacity errors in a region",
        quickCheck: "Try another region or reserve capacity",
      },
      {
        pattern: "AI Studio 429 or 5xx",
        scope: "partial",
        signal: "Inference calls fail while compute works",
        quickCheck: "Retry with backoff; the inference API is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Nebius is unavailable",
        alternative: "OVHcloud AI, Nscale or CoreWeave (monitored on DownForAI) offer GPU clouds, including in Europe",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "nebius.ai redirects to nebius.com; DownForAI's probe follows the redirect.",
    ],
  },
  nscale: {
    slug: "nscale",
    providerSummary:
      "Nscale is a UK-based AI cloud offering dedicated GPU compute, managed Kubernetes and a serverless inference API, largely under reserved contracts. Incidents are cluster or regional events and inference API errors.",
    docsUrl: "https://docs.nscale.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Nscale console / API", description: "Provisioning", criticality: "critical" },
      { name: "GPU clusters", description: "Compute", criticality: "critical" },
      { name: "Serverless inference", description: "Hosted models", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Capacity unavailable for a GPU type",
        scope: "partial",
        signal: "Provisioning fails with capacity errors",
        quickCheck: "Contact your account team for reserved capacity",
      },
      {
        pattern: "Inference API errors",
        scope: "partial",
        signal: "Hosted model calls fail while clusters work",
        quickCheck: "Retry with backoff; the inference service is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Nscale is unavailable",
        alternative: "Nebius AI, OVHcloud AI or CoreWeave (monitored on DownForAI) offer GPU clouds",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "ovh-ai": {
    slug: "ovh-ai",
    providerSummary:
      "OVHcloud AI covers GPU instances, AI Notebooks, AI Training, AI Deploy and AI Endpoints on OVHcloud's European public cloud. Incidents are regional and published on OVHcloud's status page; most user issues are quotas and regional GPU availability.",
    docsUrl: "https://help.ovhcloud.com/csm/en-public-cloud-ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "OVHcloud control panel / API", description: "Management", criticality: "critical" },
      { name: "AI services (regional)", description: "Notebooks, Training, Deploy, Endpoints", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "GPU quota or capacity in a region",
        scope: "local",
        signal: "Jobs or notebooks fail to start for a GPU flavour",
        quickCheck: "Request a quota increase or use another region",
      },
      {
        pattern: "AI Endpoints errors",
        scope: "partial",
        signal: "Hosted model calls fail while training jobs run",
        quickCheck: "Check OVHcloud's status page for the AI Endpoints component",
      },
      {
        pattern: "Regional incident",
        scope: "partial",
        signal: "Services degraded in one region on the status page",
        quickCheck: "Use another region if the data allows",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "OVHcloud AI is down",
        alternative: "Nebius AI or Nscale (monitored on DownForAI) offer European GPU clouds",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "OVHcloud publishes its own status page; DownForAI probes the AI product page only.",
    ],
  },
  paperspace: {
    slug: "paperspace",
    providerSummary:
      "Paperspace (now part of DigitalOcean) provides GPU notebooks, machines and deployments through Gradient and Core, with a status page. Incidents are GPU capacity for free and paid tiers and control-plane errors.",
    officialStatusUrl: "https://status.paperspace.com/",
    docsUrl: "https://docs.digitalocean.com/products/paperspace/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Paperspace console / API", description: "Management", criticality: "critical" },
      { name: "Notebooks and machines", description: "GPU compute", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "No free GPU available",
        scope: "local",
        signal: "Free-tier notebooks cannot start on a GPU",
        quickCheck: "Free GPUs are best-effort; retry later or use a paid instance",
      },
      {
        pattern: "Machines stuck provisioning",
        scope: "partial",
        signal: "Instances stay 'starting' across users; the status page lists an incident",
        quickCheck: "Check status.paperspace.com",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Paperspace is down",
        alternative: "RunPod, Lightning AI or Vast.ai (monitored on DownForAI) offer GPU notebooks and machines",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["DigitalOcean infrastructure"],
    operatorNotes: [],
  },
  runpod: {
    slug: "runpod",
    providerSummary:
      "RunPod offers GPU pods (community and secure cloud) and serverless endpoints, billed per second, popular for inference and fine-tuning. Its typical incidents are pods failing to start for a GPU type, serverless cold starts stretching and control-plane errors, tracked on its own uptime page.",
    docsUrl: "https://docs.runpod.io",
    pricingUrl: "https://www.runpod.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "RunPod console / API", description: "Management", criticality: "critical" },
      { name: "Pods (community and secure cloud)", description: "GPU compute", criticality: "critical" },
      { name: "Serverless endpoints", description: "Autoscaled inference", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Pod stuck starting or 'zero GPUs available'",
        scope: "partial",
        signal: "Deployments fail for a GPU type or region",
        quickCheck: "Pick another GPU type or data centre; community cloud capacity fluctuates",
      },
      {
        pattern: "Serverless workers cold-starting slowly",
        scope: "partial",
        signal: "Endpoint requests wait for minutes",
        quickCheck: "Set active workers for critical endpoints; check RunPod's uptime page",
      },
      {
        pattern: "Console or API errors",
        scope: "partial",
        signal: "Management calls fail while running pods keep working",
        quickCheck: "Retry later; running workloads are unaffected",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "RunPod is down",
        alternative: "Vast.ai, Lambda Labs or Modal (monitored on DownForAI) offer alternative GPU capacity",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "RunPod publishes its own uptime page; DownForAI probes runpod.io only.",
    ],
  },
  salad: {
    slug: "salad",
    providerSummary:
      "SaladCloud runs containers on a distributed network of consumer GPUs at low prices, suited to batch inference that tolerates node churn. Failures are inherent to the model: nodes leaving mid-job, slow allocation and variable performance.",
    docsUrl: "https://docs.salad.com",
    pricingUrl: "https://salad.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "SaladCloud portal / API", description: "Container groups", criticality: "critical" },
      { name: "Distributed GPU network", description: "Consumer nodes", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Replicas slow to allocate",
        scope: "partial",
        signal: "Container groups take a long time to reach the requested replica count",
        quickCheck: "Relax GPU requirements; allocation depends on node availability",
      },
      {
        pattern: "Nodes dropping mid-job",
        scope: "local",
        signal: "Individual replicas disappear and restart",
        quickCheck: "Design for retries; node churn is expected on a consumer network",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SaladCloud cannot allocate",
        alternative: "Vast.ai or RunPod (monitored on DownForAI) offer low-cost GPU capacity with more predictable nodes",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  sambanova: {
    slug: "sambanova",
    providerSummary:
      "SambaNova sells AI chips and systems and runs SambaNova Cloud, a fast inference API for open models on its hardware, with free and paid tiers. Developers see incidents as 429s or 5xx on specific models.",
    docsUrl: "https://docs.sambanova.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "SambaNova Cloud API", description: "Inference", criticality: "critical" },
      { name: "cloud.sambanova.ai", description: "Console", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "429 on the free tier",
        scope: "local",
        signal: "Requests throttled after a burst",
        quickCheck: "Free-tier limits are strict; upgrade or back off",
      },
      {
        pattern: "5xx on a specific model",
        scope: "partial",
        signal: "One model errors while others respond",
        quickCheck: "Switch model; check the console for announcements",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SambaNova Cloud is degraded",
        alternative: "Groq, Cerebras or Together AI (monitored on DownForAI) serve the same open models quickly",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "scale-ai": {
    slug: "scale-ai",
    providerSummary:
      "Scale AI provides data labelling, evaluation and fine-tuning services and platforms (Data Engine, GenAI Platform) for enterprises, with APIs for task submission. Incidents are API errors or task pipelines stalling rather than a consumer app going down.",
    docsUrl: "https://docs.scale.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Scale API and dashboard", description: "Task submission and results", criticality: "critical" },
      { name: "Labelling pipelines", description: "Human and automated work", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tasks stuck without progress",
        scope: "partial",
        signal: "Submitted tasks stay pending far beyond the SLA",
        quickCheck: "Check the dashboard and contact your account team; pipelines are project-specific",
      },
      {
        pattern: "API 5xx or auth errors",
        scope: "partial",
        signal: "Submissions fail across projects",
        quickCheck: "Retry with backoff; verify the key",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Scale is unavailable",
        alternative: "Cleanlab or Kolena (monitored on DownForAI) cover data quality and evaluation tooling",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "sf-compute": {
    slug: "sf-compute",
    providerSummary:
      "SF Compute runs a marketplace for short-term GPU cluster reservations (buy compute by the hour on a market), with a CLI and API. Failures are market-driven: no capacity at your price, or clusters not delivered on time.",
    docsUrl: "https://docs.sfcompute.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "SF Compute market / API", description: "Orders", criticality: "critical" },
      { name: "Delivered clusters", description: "Compute", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Order not filled",
        scope: "local",
        signal: "Bids expire without capacity at the requested price",
        quickCheck: "Raise the price or shorten the window; this is the market, not an outage",
      },
      {
        pattern: "Cluster not reachable after delivery",
        scope: "partial",
        signal: "Nodes are allocated but SSH or Kubernetes access fails",
        quickCheck: "Contact support; delivery issues are per cluster",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SF Compute cannot fill your order",
        alternative: "Lambda Labs, CoreWeave or FluidStack (monitored on DownForAI) offer reserved clusters",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "softbank-genai": {
    slug: "softbank-genai",
    providerSummary:
      "SoftBank's generative AI initiatives (SB Intuitions models, enterprise AI platforms, Cristal intelligence with OpenAI) serve Japanese enterprises and are not a self-serve public service. DownForAI tracks the corporate site; product surfaces are contractual.",
    docsUrl: "https://www.softbank.jp",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "softbank.jp", description: "Corporate site", criticality: "low" },
      { name: "Enterprise AI platforms", description: "Customer-specific", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Corporate site unreachable",
        scope: "global",
        signal: "softbank.jp times out",
        quickCheck: "No public AI product depends on it",
      },
      {
        pattern: "Enterprise platform issues",
        scope: "local",
        signal: "Customers see errors in their deployment",
        quickCheck: "Go through the enterprise support channel",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a Japanese-language model now",
        alternative: "OpenAI API or Google Gemini (monitored on DownForAI) handle Japanese well",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Enterprise-only: the probe of softbank.jp is informational.",
    ],
  },
  tensordock: {
    slug: "tensordock",
    providerSummary:
      "TensorDock is a marketplace-style GPU cloud offering cheap on-demand VMs from partner hosts, with a console and API. Failures are host-specific: a VM's underlying host going away, or no capacity for a GPU type.",
    docsUrl: "https://docs.tensordock.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "TensorDock console / API", description: "Provisioning", criticality: "critical" },
      { name: "Partner hosts", description: "Where VMs run", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "VM unreachable because its host went offline",
        scope: "local",
        signal: "A running VM stops responding while the console works",
        quickCheck: "Deploy a new VM on another host; hosts are independent partners",
      },
      {
        pattern: "No capacity for a GPU type",
        scope: "partial",
        signal: "Deployments fail for a specific GPU or location",
        quickCheck: "Pick another location or GPU model",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "TensorDock has no capacity",
        alternative: "Vast.ai, RunPod or Salad (monitored on DownForAI) offer comparable low-cost GPUs",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Partner hosts"],
    operatorNotes: [],
  },
  truefoundry: {
    slug: "truefoundry",
    providerSummary:
      "TrueFoundry is an ML platform (deployments, LLM gateway, workflows) that runs on your own cloud Kubernetes with a hosted control plane. Failures split between the control plane and the customer's cluster capacity.",
    docsUrl: "https://docs.truefoundry.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "TrueFoundry control plane", description: "Dashboard and API", criticality: "critical" },
      { name: "Customer clusters", description: "Where workloads run", criticality: "critical" },
      { name: "AI Gateway", description: "LLM routing", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Deployments failing to schedule on your cluster",
        scope: "local",
        signal: "Pods pending because of node capacity in your cloud account",
        quickCheck: "Check the cluster's node pools and quotas; this is your infrastructure",
      },
      {
        pattern: "Control plane unreachable",
        scope: "partial",
        signal: "The dashboard errors while deployed services keep serving",
        quickCheck: "Wait; workloads on your cluster keep running",
      },
      {
        pattern: "Gateway errors from a provider",
        scope: "local",
        signal: "LLM calls through the gateway fail with an upstream provider's error",
        quickCheck: "Check the provider's status; switch the route",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "TrueFoundry's control plane is down",
        alternative: "Portkey or LiteLLM (monitored on DownForAI) can replace the gateway temporarily; workloads keep running on your cluster",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Customer cloud accounts", "Model providers"],
    operatorNotes: [],
  },
  "vast-ai": {
    slug: "vast-ai",
    providerSummary:
      "Vast.ai is a marketplace for renting GPUs from independent hosts at low prices, with a console, CLI and templates. Reliability varies by host, so most problems are host-level: instances dying, slow downloads or a host going offline.",
    docsUrl: "https://docs.vast.ai",
    pricingUrl: "https://vast.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Vast.ai console / API", description: "Search and rentals", criticality: "critical" },
      { name: "Host machines", description: "Where instances run", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Instance unreachable or destroyed by the host",
        scope: "local",
        signal: "A rented instance stops responding or disappears",
        quickCheck: "Rent another machine with a higher reliability score; hosts are independent",
      },
      {
        pattern: "Very slow model downloads on some hosts",
        scope: "local",
        signal: "Bandwidth far below the listed value",
        quickCheck: "Filter by verified hosts and bandwidth; this is host-specific",
      },
      {
        pattern: "Console or search errors",
        scope: "partial",
        signal: "Searching or renting fails while running instances work",
        quickCheck: "Retry later; running instances are unaffected",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vast.ai is down or no suitable host is available",
        alternative: "RunPod, TensorDock or Salad (monitored on DownForAI) offer comparable low-cost GPUs",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Independent hosts"],
    operatorNotes: [],
  },
  "vercel-infra": {
    slug: "vercel-infra",
    providerSummary:
      "Vercel hosts front-end and full-stack apps (builds, serverless and edge functions, CDN) and provides the AI SDK and AI Gateway. Its incidents — builds, function invocations, edge network, a region — are published on an Atlassian status page and affect every site hosted there.",
    officialStatusUrl: "https://www.vercel-status.com",
    docsUrl: "https://vercel.com/docs",
    pricingUrl: "https://vercel.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Edge network / CDN", description: "Serving deployed sites", criticality: "critical" },
      { name: "Build and deploy pipeline", description: "Git-triggered builds", criticality: "critical" },
      { name: "Serverless / edge functions", description: "Dynamic routes", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Builds queued or failing platform-wide",
        scope: "partial",
        signal: "Deployments stay queued or fail at the same step across projects; the status page lists a build incident",
        quickCheck: "Wait; live deployments keep serving the last successful build",
      },
      {
        pattern: "Function invocations erroring in a region",
        scope: "partial",
        signal: "Dynamic routes return 5xx for users in one region while static pages serve",
        quickCheck: "Check the status page's regional components",
      },
      {
        pattern: "Usage limits or spend cap reached",
        scope: "local",
        signal: "Functions or bandwidth paused for your project only",
        quickCheck: "Check the usage page; a paused project is billing, not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vercel is down",
        alternative: "Railway AI or Render AI (monitored on DownForAI) can host the same Next.js app from the same repository",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub / GitLab / Bitbucket for deploys"],
    operatorNotes: [],
  },
  "vultr-cloud-gpu": {
    slug: "vultr-cloud-gpu",
    providerSummary:
      "Vultr Cloud GPU offers NVIDIA and AMD GPU instances and bare metal across Vultr's global regions, priced hourly, with a status page. Failures are regional capacity for GPU plans and control-plane incidents.",
    officialStatusUrl: "https://status.vultr.com/",
    docsUrl: "https://docs.vultr.com",
    pricingUrl: "https://www.vultr.com/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Vultr control panel / API", description: "Provisioning", criticality: "critical" },
      { name: "GPU instances (regional)", description: "Compute", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "GPU plan unavailable in a region",
        scope: "partial",
        signal: "Deployment fails for a GPU plan in a location",
        quickCheck: "Try another region; GPU capacity is per location",
      },
      {
        pattern: "Regional incident",
        scope: "partial",
        signal: "Instances or networking degraded in one location; status.vultr.com lists it",
        quickCheck: "Check the status page; running instances elsewhere are unaffected",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vultr GPUs are unavailable",
        alternative: "Hyperstack, RunPod or Lambda Labs (monitored on DownForAI) offer on-demand GPUs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Two DB entries exist (vultr-cloud-gpu, vultr-gpu) for the same product.",
    ],
  },
  "vultr-gpu": {
    slug: "vultr-gpu",
    providerSummary:
      "Vultr Cloud GPU (second DB entry for the same product) provides GPU virtual machines and bare metal for training and inference in Vultr's regions. Its availability follows Vultr's status page and per-region GPU stock.",
    officialStatusUrl: "https://status.vultr.com/",
    docsUrl: "https://docs.vultr.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Vultr platform", description: "Control panel and API", criticality: "critical" },
      { name: "GPU stock per region", description: "Capacity", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Instance stuck installing",
        scope: "local",
        signal: "A new GPU instance never finishes provisioning",
        quickCheck: "Destroy and redeploy, ideally in another region",
      },
      {
        pattern: "API rate limits",
        scope: "local",
        signal: "Automation scripts receive 429 from the Vultr API",
        quickCheck: "Back off; the API has per-key limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vultr GPUs are unavailable",
        alternative: "Hyperstack or RunPod (monitored on DownForAI) offer on-demand GPUs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Duplicate of the vultr-cloud-gpu entry.",
    ],
  },
};
