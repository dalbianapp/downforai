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
};
