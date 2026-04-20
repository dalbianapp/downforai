# DownForAI — Next 50 Service Content (services 59-108)

> Extension du contenu éditorial pour 50 services supplémentaires.
> Format identique à `top50_v2.md`. Conversion TS à ajouter dans `TOP_SERVICE_CONTENT`.
> Tous les slugs validés vs DB Neon (50/50 ✅).
>
> **Sources de sélection :**
> - 5 services avec trafic PostHog réel (civitai, krea-ai, lmarena, nvidia-nim, moonshot-kimi)
> - 15 services du a16z Top 100 Gen AI Consumer Apps (6th edition, mars 2026)
> - 10 services cloud/infra majeurs pour devs
> - 10 dev tools importants non encore couverts
> - 10 services complémentaires (Chinese AI, audio, productivity, vector DB)
>
> **Version** : 1.0 — 20 avril 2026

---

## 59. Civitai

- **slug**: `civitai`
- **providerSummary**: Community hub for sharing and discovering Stable Diffusion models, LoRAs, embeddings, and workflows. Popular with image gen enthusiasts and creators.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://wiki.civitai.com`
- **pricingUrl**: `https://civitai.com/pricing`
- **communityLinks**: discord (`discord.gg/civitai` — verified: true), reddit (`r/civitai`)
- **monitoredSurfaces**: civitai.com (web), model downloads (CDN), on-site generation, API
- **knownFailurePatterns**: CDN download slowness during peak, on-site generation queue, NSFW filter changes perceived as outage, model upload processing delays
- **fallbackAlternatives**: If Civitai is degraded, Hugging Face (model hub), Tensor.Art, or direct ComfyUI with local models can reduce downtime — **low** cost
- **operatorNotes**: Civitai is primarily a model sharing platform — generation is secondary. If downloads work but on-site gen is down, users can still pull models for local use.

---

## 60. Krea AI

- **slug**: `krea-ai`
- **providerSummary**: Real-time AI image generation and enhancement. Canvas-style editor with generative AI, upscaling, and design tools.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://www.krea.ai/docs`
- **pricingUrl**: `https://www.krea.ai/pricing`
- **monitoredSurfaces**: krea.ai (web), real-time generation backend, upscale API
- **knownFailurePatterns**: real-time canvas lag, credit depletion, specific model availability
- **fallbackAlternatives**: If Krea is degraded, Magnific (upscaling), Leonardo AI (generation), Ideogram can reduce downtime — **low** cost

---

## 61. LMArena (LMSYS Chatbot Arena)

- **slug**: `lmarena`
- **providerSummary**: LLM benchmarking platform via crowd-sourced blind comparisons (Elo ranking). Used by researchers and devs to evaluate model quality.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://lmarena.ai/docs`
- **pricingUrl**: free
- **communityLinks**: x (`@laborai_lmsys`)
- **monitoredSurfaces**: lmarena.ai (web), Arena battle backend, leaderboard API
- **knownFailurePatterns**: high traffic during model launches (DeepSeek, GPT-5), queue timeouts, specific model backend unavailable
- **fallbackAlternatives**: If LMArena is degraded, Artificial Analysis or open leaderboard data can provide benchmark comparisons — **low** cost
- **operatorNotes**: Traffic spikes massively around major model releases — queue delays are expected, not outages.

---

## 62. NVIDIA NIM

- **slug**: `nvidia-nim`
- **providerSummary**: NVIDIA's managed inference microservices. Deploy optimized models (Llama, Mistral, etc.) on NVIDIA hardware via containers.
- **officialStatusUrl**: `https://status.nvidia.com`
- **docsUrl**: `https://docs.nvidia.com/nim`
- **pricingUrl**: `https://build.nvidia.com/nim`
- **monitoredSurfaces**: build.nvidia.com (catalog), NIM containers, NVIDIA API endpoint
- **knownFailurePatterns**: container pull rate limits, GPU availability for specific models, API quota limits
- **fallbackAlternatives**: If NIM is degraded, Together AI, Groq, Fireworks AI host similar open models — **low** cost (OpenAI-compatible swap)
- **operatorNotes**: NIM runs on NVIDIA infra — separate from cloud provider managed services (Bedrock, Vertex).

---

## 63. Moonshot Kimi

- **slug**: `moonshot-kimi`
- **providerSummary**: Chinese AI lab Moonshot's assistant. Strong long-context capabilities. Popular in China and expanding internationally.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://platform.moonshot.cn/docs`
- **pricingUrl**: `https://platform.moonshot.cn/pricing`
- **monitoredSurfaces**: kimi.moonshot.cn (web), Moonshot API
- **knownFailurePatterns**: regional access variability, capacity constraints during Chinese business hours, long-context requests slower
- **fallbackAlternatives**: If Kimi is degraded, DeepSeek or Qwen are Chinese-native alternatives — **low** cost; for international users, Claude/Gemini for long-context — **low** cost

---

## 64. Synthesia

- **slug**: `synthesia`
- **providerSummary**: Enterprise AI avatar video creation. Training videos, marketing, localization. SOC 2 compliant.
- **officialStatusUrl**: `https://status.synthesia.io`
- **docsUrl**: `https://docs.synthesia.io`
- **pricingUrl**: `https://www.synthesia.io/pricing`
- **monitoredSurfaces**: synthesia.io (web), render pipeline, avatar library, API
- **knownFailurePatterns**: long render times (minutes), avatar-specific glitches, voice cloning delays, enterprise SSO issues
- **fallbackAlternatives**: If Synthesia is degraded, HeyGen, D-ID, Colossyan can reduce downtime for avatar video — **low** cost (different avatar libraries)

---

## 65. Gamma

- **slug**: `gamma`
- **providerSummary**: AI-powered presentation and document generator. Creates slides, docs, and webpages from prompts.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://gamma.app/help`
- **pricingUrl**: `https://gamma.app/pricing`
- **monitoredSurfaces**: gamma.app (web), generation backend, export pipeline
- **knownFailurePatterns**: credit depletion, export format issues (PPTX, PDF), template rendering glitches
- **fallbackAlternatives**: If Gamma is degraded, Beautiful.ai, Tome, or SlidesAI can reduce downtime for presentation generation — **low** cost

---

## 66. Descript

- **slug**: `descript`
- **providerSummary**: AI video and audio editor. Text-based editing (edit video by editing transcript), screen recording, podcast editing.
- **officialStatusUrl**: `https://status.descript.com`
- **docsUrl**: `https://help.descript.com`
- **pricingUrl**: `https://www.descript.com/pricing`
- **monitoredSurfaces**: descript.com (web), desktop app, transcription backend, rendering pipeline
- **knownFailurePatterns**: transcription backend delays, desktop app sync issues, rendering failures on long projects, collaboration session drops
- **fallbackAlternatives**: If Descript is degraded, Riverside (recording), Kapwing (editing), Otter.ai (transcription) can reduce downtime for specific workflows — **low-medium** cost

---

## 67. Manus

- **slug**: `manus`
- **providerSummary**: Autonomous AI agent. Handles open-ended tasks (research, analysis, slide generation) end-to-end. Acquired by Meta in Dec 2025 for ~$2B.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://manus.im/docs`
- **pricingUrl**: `https://manus.im/pricing`
- **monitoredSurfaces**: manus.im (web), task execution backend, output delivery
- **knownFailurePatterns**: long-running tasks stuck, output quality inconsistency, capacity limits
- **fallbackAlternatives**: If Manus is degraded, Genspark, Devin (for coding tasks), or Claude Projects (manual) can reduce downtime — **medium** cost

---

## 68. Genspark

- **slug**: `genspark`
- **providerSummary**: AI agent platform for open-ended research and tasks. $300M Series B, $100M ARR run rate.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://www.genspark.ai/help`
- **pricingUrl**: `https://www.genspark.ai/pricing`
- **monitoredSurfaces**: genspark.ai (web), agent execution backend
- **knownFailurePatterns**: agent task timeouts, research quality variability, capacity during peak
- **fallbackAlternatives**: If Genspark is degraded, Perplexity (research), Manus (tasks) can reduce downtime — **low** cost

---

## 69. Grammarly

- **slug**: `grammarly`
- **providerSummary**: AI writing assistant. Grammar, tone, clarity. Deeply integrated in browsers, Docs, email. Large enterprise footprint.
- **officialStatusUrl**: `https://status.grammarly.com`
- **docsUrl**: `https://support.grammarly.com`
- **pricingUrl**: `https://www.grammarly.com/plans`
- **monitoredSurfaces**: grammarly.com (web), browser extension, desktop app, API (enterprise)
- **knownFailurePatterns**: browser extension conflicts, document editor lag, enterprise SSO issues, AI rewrite feature delays
- **fallbackAlternatives**: If Grammarly is degraded, LanguageTool, Hemingway Editor, or ProWritingAid can reduce downtime for writing checks — **low** cost
- **operatorNotes**: Most "Grammarly is down" reports are browser extension issues — disabling and re-enabling the extension is the first troubleshoot step.

---

## 70. QuillBot

- **slug**: `quillbot`
- **providerSummary**: AI paraphrasing, grammar checking, summarization. Strong in academic and student use cases.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://help.quillbot.com`
- **pricingUrl**: `https://quillbot.com/premium`
- **monitoredSurfaces**: quillbot.com (web), Chrome extension, paraphraser API
- **knownFailurePatterns**: paraphraser quota limits (free tier), Chrome extension conflicts, slow processing on long texts
- **fallbackAlternatives**: If QuillBot is degraded, Grammarly, WordTune, or ChatGPT can reduce downtime for paraphrasing — **low** cost

---

## 71. Phind

- **slug**: `phind`
- **providerSummary**: AI-powered search engine for developers. Code-focused answers with sources.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://www.phind.com/about`
- **pricingUrl**: `https://www.phind.com/pricing`
- **monitoredSurfaces**: phind.com (web), search backend, code execution sandbox
- **knownFailurePatterns**: search backend timeouts, code execution sandbox failures, source retrieval issues
- **fallbackAlternatives**: If Phind is degraded, Perplexity (general AI search), or Stack Overflow + ChatGPT can reduce downtime for dev search — **low** cost

---

## 72. Photoroom

- **slug**: `photoroom`
- **providerSummary**: AI product photography. Background removal, scene generation, batch editing. Strong in e-commerce.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://help.photoroom.com`
- **pricingUrl**: `https://www.photoroom.com/pricing`
- **monitoredSurfaces**: photoroom.com (web), mobile apps, API, batch processing
- **knownFailurePatterns**: batch processing queue delays, background removal quality on edge cases, API rate limits
- **fallbackAlternatives**: If Photoroom is degraded, Remove.bg (background removal), Mokker AI, or Canva can reduce downtime — **low** cost

---

## 73. CapCut

- **slug**: `capcut`
- **providerSummary**: ByteDance's video editor with AI features (auto-captions, background removal, AI effects, text-to-video). Massive mobile user base.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://www.capcut.com/help`
- **pricingUrl**: `https://www.capcut.com/pricing`
- **monitoredSurfaces**: capcut.com (web editor), mobile apps (iOS/Android), desktop app, AI features backend
- **knownFailurePatterns**: export failures on large projects, AI caption sync issues, cloud save delays, mobile app crashes
- **fallbackAlternatives**: If CapCut is degraded, Descript, Canva Video, or InShot can reduce downtime for video editing — **low** cost

---

## 74. AWS Bedrock

- **slug**: `aws-bedrock`
- **providerSummary**: AWS managed AI service. Access Claude, Llama, Mistral, Stable Diffusion, etc. via unified API on AWS infrastructure.
- **officialStatusUrl**: `https://health.aws.amazon.com/health/status`
- **docsUrl**: `https://docs.aws.amazon.com/bedrock`
- **pricingUrl**: `https://aws.amazon.com/bedrock/pricing/`
- **communityLinks**: github (`aws-samples/amazon-bedrock-samples`), reddit (`r/aws`)
- **monitoredSurfaces**: Bedrock API (per-region), Bedrock Console, model invocation endpoints, Knowledge Bases, Agents
- **knownFailurePatterns**: region-specific availability issues, model invocation throttling, Knowledge Base indexing delays, cross-region failover needed
- **fallbackAlternatives**: If Bedrock is degraded in one region, try another AWS region — **low** cost; if Bedrock is fully down, direct Anthropic API or Google Vertex AI can reduce downtime — **medium** cost
- **operatorNotes**: Bedrock is regional — an us-east-1 outage doesn't mean us-west-2 is down. Always check per-region health. Claude on Bedrock is a different infrastructure from direct Anthropic API.

---

## 75. Azure OpenAI

- **slug**: `azure-openai`
- **providerSummary**: Microsoft's managed OpenAI models on Azure. Enterprise SLAs, data residency, private endpoints. Separate infrastructure from direct OpenAI.
- **officialStatusUrl**: `https://azure.status.microsoft/en-us/status`
- **docsUrl**: `https://learn.microsoft.com/en-us/azure/ai-services/openai/`
- **pricingUrl**: `https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/`
- **monitoredSurfaces**: Azure OpenAI API (per-region), Azure OpenAI Studio, provisioned throughput units (PTU)
- **knownFailurePatterns**: regional capacity exhaustion, PTU provisioning delays, content filter false positives, deployment quota limits
- **fallbackAlternatives**: If Azure OpenAI is degraded, direct OpenAI API can reduce downtime — **low** cost (base URL swap); Anthropic API or Google Gemini for alternate models — **medium** cost
- **operatorNotes**: Azure OpenAI is the key fallback for direct OpenAI users, and vice versa. Most production teams should have both provisioned. Regional — check specific region health.

---

## 76. Google Vertex AI

- **slug**: `google-vertex`
- **providerSummary**: Google Cloud's enterprise AI platform. Access Gemini, Claude, Llama, custom models. MLOps, RAG, fine-tuning.
- **officialStatusUrl**: `https://status.cloud.google.com`
- **docsUrl**: `https://cloud.google.com/vertex-ai/docs`
- **pricingUrl**: `https://cloud.google.com/vertex-ai/pricing`
- **monitoredSurfaces**: Vertex AI API, Model Garden, Vertex AI Search, online prediction endpoints
- **knownFailurePatterns**: quota exhaustion, specific model deployment delays, regional outages, index build failures for Vertex AI Search
- **fallbackAlternatives**: If Vertex is degraded, Google AI Studio (free tier, different infra) can reduce downtime for Gemini — **low** cost; AWS Bedrock for managed alternatives — **medium** cost
- **operatorNotes**: Vertex AI and AI Studio are separate infrastructures — Vertex can be down while AI Studio works. Vertex also hosts Claude via Anthropic partnership.

---

## 77. Google AI Studio

- **slug**: `google-ai-studio`
- **providerSummary**: Free developer access to Gemini models. Prototyping, API key generation, prompt testing.
- **officialStatusUrl**: `https://status.cloud.google.com`
- **docsUrl**: `https://ai.google.dev`
- **pricingUrl**: `https://ai.google.dev/pricing`
- **monitoredSurfaces**: aistudio.google.com (web), Gemini API via AI Studio keys
- **knownFailurePatterns**: rate limits on free tier, quota errors, model-specific unavailability
- **fallbackAlternatives**: If AI Studio is degraded, Vertex AI (enterprise path) can reduce downtime — **low-medium** cost; direct OpenAI API or Anthropic API as model alternative — **low** cost

---

## 78. Cloudflare AI

- **slug**: `cloudflare-ai`
- **providerSummary**: Edge AI inference on Cloudflare Workers. Run open models at the edge (Llama, Mistral, Whisper, SD). Also AI Gateway for routing/caching.
- **officialStatusUrl**: `https://www.cloudflarestatus.com`
- **docsUrl**: `https://developers.cloudflare.com/workers-ai/`
- **pricingUrl**: `https://developers.cloudflare.com/workers-ai/platform/pricing/`
- **monitoredSurfaces**: Workers AI API, AI Gateway, Vectorize (vector DB)
- **knownFailurePatterns**: edge location-specific availability, model cold start, AI Gateway routing errors
- **fallbackAlternatives**: If Cloudflare AI is degraded, Groq/Together AI for inference, or Vercel AI SDK as routing layer — **low** cost

---

## 79. LangChain

- **slug**: `langchain`
- **providerSummary**: Most popular AI application framework. Chains, agents, RAG, tool use. Python and TypeScript.
- **officialStatusUrl**: *undefined* (open source — GitHub issues)
- **docsUrl**: `https://python.langchain.com/docs/`
- **pricingUrl**: free (open source); LangSmith for observability is paid
- **communityLinks**: github (`langchain-ai/langchain` — verified: true), discord (`discord.gg/langchain`)
- **monitoredSurfaces**: PyPI/npm package registry, LangChain Hub, documentation site
- **knownFailurePatterns**: breaking changes between versions, dependency conflicts, LangChain Hub fetch failures
- **fallbackAlternatives**: If LangChain package is broken, LlamaIndex is an alternative RAG framework — **medium** cost; direct SDK calls (Anthropic/OpenAI SDKs) bypass the framework — **low** cost
- **operatorNotes**: LangChain is a library, not a hosted service — "down" usually means PyPI/npm issues or breaking API changes, not a server outage.

---

## 80. LangSmith

- **slug**: `langsmith`
- **providerSummary**: LangChain's observability and evaluation platform. Trace LLM calls, run evals, monitor prod.
- **officialStatusUrl**: `https://status.smith.langchain.com`
- **docsUrl**: `https://docs.smith.langchain.com`
- **pricingUrl**: `https://www.langchain.com/pricing`
- **monitoredSurfaces**: smith.langchain.com (web), tracing API, eval runner
- **knownFailurePatterns**: tracing ingestion lag, eval timeout on large datasets, dashboard loading delays
- **fallbackAlternatives**: If LangSmith is degraded, Helicone, Braintrust, or Arize Phoenix can reduce downtime for LLM observability — **medium** cost

---

## 81. Continue.dev

- **slug**: `continue-dev`
- **providerSummary**: Open-source AI coding assistant for VS Code and JetBrains. Connects to any model (local Ollama, Claude, GPT, etc.).
- **officialStatusUrl**: *undefined* (open source — GitHub issues)
- **docsUrl**: `https://docs.continue.dev`
- **pricingUrl**: free (open source)
- **communityLinks**: github (`continuedev/continue` — verified: true), discord (`discord.gg/continue`)
- **monitoredSurfaces**: VS Code extension, JetBrains plugin, model routing backend (for hosted features)
- **knownFailurePatterns**: extension version conflicts, model provider auth issues (user-configured), config file parsing errors
- **fallbackAlternatives**: If Continue.dev extension is broken, Cursor, GitHub Copilot, or Codeium can reduce downtime — **low-medium** cost
- **operatorNotes**: Continue routes to user-configured models — most "down" reports are provider-side (Ollama, OpenAI, etc.), not Continue itself.

---

## 82. Cline

- **slug**: `cline`
- **providerSummary**: Autonomous AI coding agent as a VS Code extension. Executes multi-step tasks, reads/writes files, runs terminal commands.
- **officialStatusUrl**: *undefined* (open source — GitHub issues)
- **docsUrl**: `https://github.com/cline/cline`
- **pricingUrl**: free (open source); uses your own API keys
- **communityLinks**: github (`cline/cline` — verified: true), discord
- **monitoredSurfaces**: VS Code extension, upstream model providers (Anthropic, OpenAI, etc.)
- **knownFailurePatterns**: extension update breaking changes, upstream provider rate limits, context window exceeded on large codebases
- **fallbackAlternatives**: If Cline is degraded, Claude Code CLI, Cursor Composer, or Aider can reduce downtime for autonomous coding — **low** cost
- **operatorNotes**: Cline uses your API keys — costs come from your Anthropic/OpenAI account, not Cline. "Cline is slow" usually means the upstream model is slow.

---

## 83. Augment Code

- **slug**: `augment-code`
- **providerSummary**: AI coding assistant with deep codebase understanding. Focuses on large enterprise codebases. VS Code and JetBrains.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://docs.augmentcode.com`
- **pricingUrl**: `https://www.augmentcode.com/pricing`
- **monitoredSurfaces**: augmentcode.com (web), IDE extension, codebase indexing backend
- **knownFailurePatterns**: codebase indexing delays on large repos, auth/license issues, IDE extension conflicts
- **fallbackAlternatives**: If Augment is degraded, Cursor, Copilot, or Sourcegraph Cody can reduce downtime — **low-medium** cost

---

## 84. Sourcegraph Cody

- **slug**: `sourcegraph-cody`
- **providerSummary**: AI coding assistant with Sourcegraph code intelligence. Code search + AI chat + autocomplete.
- **officialStatusUrl**: `https://sourcegraphstatus.com`
- **docsUrl**: `https://docs.sourcegraph.com/cody`
- **pricingUrl**: `https://sourcegraph.com/pricing`
- **monitoredSurfaces**: sourcegraph.com (web), Cody IDE extensions, code search API
- **knownFailurePatterns**: code index staleness, enterprise instance sync delays, model backend issues (routes to Claude/GPT)
- **fallbackAlternatives**: If Cody is degraded, GitHub Copilot Chat, Cursor, or Continue.dev can reduce downtime — **low** cost

---

## 85. Aider

- **slug**: `aider`
- **providerSummary**: CLI-based AI pair programmer. Open source. Works with any model (Claude, GPT, local). Git-native workflow.
- **officialStatusUrl**: *undefined* (open source — GitHub issues)
- **docsUrl**: `https://aider.chat`
- **pricingUrl**: free (open source); uses your own API keys
- **communityLinks**: github (`Aider-AI/aider` — verified: true), discord (`discord.gg/aider`)
- **monitoredSurfaces**: PyPI package, upstream model providers
- **knownFailurePatterns**: breaking changes between versions, upstream provider rate limits, git repo parsing issues on complex histories
- **fallbackAlternatives**: If Aider is broken, Claude Code CLI or Cline are alternatives for CLI/autonomous coding — **low** cost

---

## 86. Alibaba Qwen

- **slug**: `alibaba-qwen`
- **providerSummary**: Alibaba Cloud's open-weight LLM family. Qwen 2.5 is among the best open models (83% MMLU at 32B). Strong multilingual including Chinese.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://qwen.readthedocs.io`
- **pricingUrl**: free (open-weight); Alibaba Cloud DashScope for hosted inference
- **communityLinks**: github (`QwenLM/Qwen2.5` — verified: true), discord
- **monitoredSurfaces**: DashScope API (Alibaba Cloud), Qwen models on HuggingFace/Ollama
- **knownFailurePatterns**: DashScope regional availability, model download rate limits on HuggingFace, version compatibility issues
- **fallbackAlternatives**: If Qwen API (DashScope) is degraded, self-host via Ollama, or use Qwen on Together AI/Groq — **low** cost

---

## 87. Baidu ERNIE

- **slug**: `baidu-ernie`
- **providerSummary**: Baidu's LLM family (ERNIE Bot). Strong in Chinese language tasks. Available via Baidu AI Cloud.
- **officialStatusUrl**: `https://cloud.baidu.com/status`
- **docsUrl**: `https://cloud.baidu.com/doc/WENXINWORKSHOP`
- **pricingUrl**: `https://cloud.baidu.com/product/wenxinworkshop`
- **monitoredSurfaces**: yiyan.baidu.com (consumer chat), Baidu AI Cloud API
- **knownFailurePatterns**: regional access (China-focused), capacity issues, cross-border latency
- **fallbackAlternatives**: If ERNIE is degraded, DeepSeek, Qwen, or Tencent Hunyuan are Chinese-native alternatives — **low** cost

---

## 88. Zhipu ChatGLM

- **slug**: `zhipu-chatglm`
- **providerSummary**: Zhipu AI's open-weight LLM (GLM-4 family). Strong coding and reasoning. Available via API and self-hosted.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://open.bigmodel.cn/dev/api`
- **pricingUrl**: `https://open.bigmodel.cn/pricing`
- **monitoredSurfaces**: chatglm.cn (web), Zhipu API (open.bigmodel.cn)
- **knownFailurePatterns**: API rate limits, regional access variability, model version transitions
- **fallbackAlternatives**: If ChatGLM is degraded, DeepSeek, Qwen, or Moonshot Kimi are alternatives — **low** cost

---

## 89. StepFun

- **slug**: `stepfun`
- **providerSummary**: Chinese AI lab focused on multimodal and video generation (Step-1V, Step-Video). Rising player in AI video space.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://platform.stepfun.com/docs`
- **pricingUrl**: `https://platform.stepfun.com/pricing`
- **monitoredSurfaces**: stepfun.com (web), Step API
- **knownFailurePatterns**: queue delays on video generation, regional access
- **fallbackAlternatives**: If StepFun video is degraded, Kling AI, Runway, or Hailuo can reduce downtime — **low** cost

---

## 90. Qwen Chat

- **slug**: `qwen-chat`
- **providerSummary**: Alibaba's consumer chat interface for Qwen models. Web-based, free tier available.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://qwen.readthedocs.io`
- **pricingUrl**: free
- **monitoredSurfaces**: qwen.ai or tongyi.aliyun.com (web)
- **knownFailurePatterns**: capacity during peak Chinese hours, regional access variability
- **fallbackAlternatives**: If Qwen Chat is degraded, self-host Qwen via Ollama, or use DashScope API — **low** cost

---

## 91. PixVerse

- **slug**: `pixverse`
- **providerSummary**: Chinese video AI. Text/image-to-video generation. Mentioned in a16z top 100.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://www.pixverse.ai/help`
- **pricingUrl**: `https://www.pixverse.ai/pricing`
- **monitoredSurfaces**: pixverse.ai (web), generation queue
- **knownFailurePatterns**: queue delays, content filter, regional access
- **fallbackAlternatives**: If PixVerse is degraded, Kling AI, Runway, Pika can reduce downtime — **low** cost

---

## 92. Haiper

- **slug**: `haiper`
- **providerSummary**: Video AI from former DeepMind researchers. High quality, fast generation.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://haiper.ai/docs`
- **pricingUrl**: `https://haiper.ai/pricing`
- **monitoredSurfaces**: haiper.ai (web), generation queue, API
- **knownFailurePatterns**: generation queue during peak, credit depletion
- **fallbackAlternatives**: If Haiper is degraded, Runway, Kling, Pika can reduce downtime — **low** cost

---

## 93. VEED

- **slug**: `veed`
- **providerSummary**: Online video editor with AI features (auto-subtitles, background removal, AI avatars, eye contact correction).
- **officialStatusUrl**: `https://status.veed.io`
- **docsUrl**: `https://help.veed.io`
- **pricingUrl**: `https://www.veed.io/pricing`
- **monitoredSurfaces**: veed.io (web), render pipeline, subtitle engine, AI feature backends
- **knownFailurePatterns**: render timeouts on long videos, subtitle accuracy issues, export failures
- **fallbackAlternatives**: If VEED is degraded, Descript, Kapwing, or CapCut can reduce downtime for video editing — **low** cost

---

## 94. Recraft

- **slug**: `recraft`
- **providerSummary**: AI design tool generating both vector and raster images. Strong for brand-consistent design output.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://www.recraft.ai/docs`
- **pricingUrl**: `https://www.recraft.ai/pricing`
- **monitoredSurfaces**: recraft.ai (web), generation API
- **knownFailurePatterns**: generation queue delays, vector export issues, style consistency on complex prompts
- **fallbackAlternatives**: If Recraft is degraded, Figma AI, Canva AI, or Ideogram can reduce downtime for design workflows — **low** cost

---

## 95. Freepik AI

- **slug**: `freepik-ai`
- **providerSummary**: Freepik's AI image generator and design resource platform. Integrated AI tools for stock assets.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://www.freepik.com/ai/help`
- **pricingUrl**: `https://www.freepik.com/pricing`
- **monitoredSurfaces**: freepik.com (web), AI image generator, Pikaso (real-time gen)
- **knownFailurePatterns**: generation quota (free tier), Pikaso real-time canvas lag, download CDN issues
- **fallbackAlternatives**: If Freepik AI is degraded, Leonardo AI, Playground AI, or Canva AI can reduce downtime — **low** cost

---

## 96. Adobe Firefly

- **slug**: `adobe-firefly`
- **providerSummary**: Adobe's AI image generator. Integrated in Photoshop, Illustrator, Express. Commercially safe (trained on licensed content).
- **officialStatusUrl**: `https://status.adobe.com`
- **docsUrl**: `https://helpx.adobe.com/firefly`
- **pricingUrl**: `https://www.adobe.com/products/firefly/plans.html`
- **monitoredSurfaces**: firefly.adobe.com (web), Firefly in Photoshop/Illustrator, Firefly API
- **knownFailurePatterns**: credit depletion (generative credits per tier), content filter rejections, Creative Cloud sync issues
- **fallbackAlternatives**: If Firefly is degraded, Midjourney (web), Ideogram, or Stability AI can reduce downtime for image gen — **low** cost
- **operatorNotes**: Firefly's commercial safety (licensed training data) is its differentiator — alternatives may not offer the same IP indemnification.

---

## 97. Figma AI

- **slug**: `figma-ai`
- **providerSummary**: Figma's native AI features. Auto-layout suggestions, component generation, text editing, prototype generation.
- **officialStatusUrl**: `https://status.figma.com`
- **docsUrl**: `https://help.figma.com/hc/en-us/categories/360002051613-AI`
- **pricingUrl**: `https://www.figma.com/pricing/`
- **monitoredSurfaces**: figma.com (web), AI features backend, FigJam AI
- **knownFailurePatterns**: Figma platform outages cascade, AI feature-specific failures while editor works, FigJam AI separate from Design AI
- **fallbackAlternatives**: If Figma AI is degraded, Figma core editor still works without AI; Canva AI or Framer AI for specific workflows — **low** cost

---

## 98. Play.ht

- **slug**: `play-ht`
- **providerSummary**: Voice AI platform. Text-to-speech, voice cloning, streaming TTS API.
- **officialStatusUrl**: `https://status.play.ht`
- **docsUrl**: `https://docs.play.ht`
- **pricingUrl**: `https://play.ht/pricing`
- **monitoredSurfaces**: play.ht (web), streaming TTS API, voice cloning backend
- **knownFailurePatterns**: voice cloning queue delays, TTS latency spikes, specific voice unavailability
- **fallbackAlternatives**: If Play.ht is degraded, ElevenLabs, Cartesia (low-latency), or OpenAI TTS can reduce downtime — **low** cost

---

## 99. Cartesia AI

- **slug**: `cartesia-ai`
- **providerSummary**: Ultra-low latency voice AI. Sub-100ms streaming TTS. Strong for real-time conversational AI applications.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://docs.cartesia.ai`
- **pricingUrl**: `https://cartesia.ai/pricing`
- **monitoredSurfaces**: api.cartesia.ai, streaming TTS endpoint
- **knownFailurePatterns**: latency spikes (defeats the purpose), capacity during peak, voice model availability
- **fallbackAlternatives**: If Cartesia is degraded, ElevenLabs (slightly higher latency), Play.ht, or OpenAI TTS can reduce downtime — **low** cost
- **operatorNotes**: Cartesia's value prop is sub-100ms latency — if p95 > 200ms, it's a meaningful degradation even without hard errors.

---

## 100. Jasper

- **slug**: `jasper`
- **providerSummary**: AI content platform for marketing teams. Blog posts, social media, ad copy, brand voice.
- **officialStatusUrl**: `https://status.jasper.ai`
- **docsUrl**: `https://support.jasper.ai`
- **pricingUrl**: `https://www.jasper.ai/pricing`
- **monitoredSurfaces**: jasper.ai (web), Chrome extension, API, brand voice engine
- **knownFailurePatterns**: upstream model failures (uses OpenAI/Anthropic), brand voice inconsistency, Chrome extension sync
- **fallbackAlternatives**: If Jasper is degraded, Copy.ai, Writer.com, or ChatGPT can reduce downtime for content generation — **low** cost

---

## 101. Copy.ai

- **slug**: `copy-ai`
- **providerSummary**: AI marketing content generator. Sales copy, email, social media, workflow automation.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://www.copy.ai/support`
- **pricingUrl**: `https://www.copy.ai/pricing`
- **monitoredSurfaces**: copy.ai (web), workflow automation backend, Chrome extension
- **knownFailurePatterns**: workflow execution failures, upstream model issues, credit depletion
- **fallbackAlternatives**: If Copy.ai is degraded, Jasper, ChatGPT, or Writer.com can reduce downtime — **low** cost

---

## 102. Arc Search

- **slug**: `arc-search`
- **providerSummary**: The Browser Company's AI-native browser/search. "Browse for me" feature summarizes pages with AI.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://resources.arc.net`
- **pricingUrl**: free
- **monitoredSurfaces**: arc.net (web), Arc Search mobile app, AI browsing backend
- **knownFailurePatterns**: "Browse for me" failures, AI summary inaccuracies, extension compatibility issues
- **fallbackAlternatives**: If Arc Search AI is degraded, Perplexity, Kagi, or Brave Search AI can reduce downtime for AI search — **low** cost

---

## 103. Kagi

- **slug**: `kagi`
- **providerSummary**: Premium ad-free search engine with AI features. Summarizer, FastGPT, Universal Summarizer.
- **officialStatusUrl**: `https://status.kagi.com`
- **docsUrl**: `https://help.kagi.com`
- **pricingUrl**: `https://kagi.com/pricing`
- **monitoredSurfaces**: kagi.com (web), search backend, AI Summarizer, FastGPT
- **knownFailurePatterns**: search index staleness, AI Summarizer timeouts, session/auth issues
- **fallbackAlternatives**: If Kagi is degraded, Perplexity, DuckDuckGo, or Brave Search can reduce downtime — **low** cost

---

## 104. Chroma

- **slug**: `chroma`
- **providerSummary**: Open-source embedding database. Popular for RAG applications. Simple API, Python-first.
- **officialStatusUrl**: *undefined* (open source; Chroma Cloud status TBD)
- **docsUrl**: `https://docs.trychroma.com`
- **pricingUrl**: free (open source); Chroma Cloud for managed hosting
- **communityLinks**: github (`chroma-core/chroma` — verified: true), discord (`discord.gg/chroma`)
- **monitoredSurfaces**: Chroma Cloud (managed), PyPI package, documentation site
- **knownFailurePatterns**: local instance memory issues on large collections, Chroma Cloud scaling delays, version upgrade breaking changes
- **fallbackAlternatives**: If Chroma is degraded, Qdrant, Pinecone, or pgvector can reduce downtime for vector storage — **medium** cost (data migration)

---

## 105. Milvus (Zilliz)

- **slug**: `milvus`
- **providerSummary**: Open-source vector database. Managed cloud version via Zilliz. Strong at scale with billions of vectors.
- **officialStatusUrl**: `https://status.zilliz.com`
- **docsUrl**: `https://milvus.io/docs`
- **pricingUrl**: `https://zilliz.com/pricing`
- **communityLinks**: github (`milvus-io/milvus` — verified: true), discord
- **monitoredSurfaces**: Zilliz Cloud (managed), Milvus self-hosted, Attu (GUI)
- **knownFailurePatterns**: Zilliz Cloud cluster scaling, self-hosted etcd dependency issues, collection loading on restart
- **fallbackAlternatives**: If Zilliz Cloud is degraded, self-host Milvus or use Qdrant/Pinecone — **medium** cost (data migration)
- **operatorNotes**: Milvus self-hosted has etcd as a critical dependency — etcd issues often manifest as Milvus failures.

---

## 106. LlamaIndex

- **slug**: `llamaindex`
- **providerSummary**: AI framework for RAG and data-connected applications. Indexes, retrieval, agents. Python and TypeScript.
- **officialStatusUrl**: *undefined* (open source — GitHub issues)
- **docsUrl**: `https://docs.llamaindex.ai`
- **pricingUrl**: free (open source); LlamaCloud for managed RAG is paid
- **communityLinks**: github (`run-llama/llama_index` — verified: true), discord (`discord.gg/llamaindex`)
- **monitoredSurfaces**: PyPI/npm package, LlamaCloud (managed), documentation site
- **knownFailurePatterns**: breaking changes between versions (similar to LangChain), LlamaCloud indexing delays, dependency conflicts
- **fallbackAlternatives**: If LlamaIndex is broken, LangChain is the main alternative RAG framework — **medium** cost; direct Anthropic/OpenAI SDK calls bypass both — **low** cost

---

## 107. Cerebras

- **slug**: `cerebras`
- **providerSummary**: Ultra-fast AI inference on custom wafer-scale chips. Hosts open models (Llama, etc.) with extremely low latency.
- **officialStatusUrl**: *undefined*
- **docsUrl**: `https://inference-docs.cerebras.ai`
- **pricingUrl**: `https://cerebras.ai/inference`
- **monitoredSurfaces**: api.cerebras.ai (OpenAI-compatible API)
- **knownFailurePatterns**: capacity-driven rate limits, specific model availability, beta feature instability
- **fallbackAlternatives**: If Cerebras is degraded, Groq (also ultra-fast), Together AI, or Fireworks AI can reduce downtime — **low** cost (OpenAI-compatible API swap)
- **operatorNotes**: Cerebras API is OpenAI-compatible — base_url swap is trivial.

---

## 108. Descript Video

- **slug**: `descript-video`
- **providerSummary**: Descript's video-specific features. Screen recording, AI editing, clip generation. May share infrastructure with main Descript.
- **officialStatusUrl**: `https://status.descript.com`
- **docsUrl**: `https://help.descript.com`
- **monitoredSurfaces**: same as Descript main — shared infrastructure
- **knownFailurePatterns**: same as Descript main
- **fallbackAlternatives**: If Descript Video is degraded, Loom (screen recording), Kapwing (editing), or CapCut can reduce downtime — **low** cost
- **operatorNotes**: Descript and Descript Video likely share the same backend — check status.descript.com for both.

---

# 🎯 Notes d'implémentation

## Ajout au fichier `top50.ts` existant

Ces 50 fiches s'ajoutent au `TOP_SERVICE_CONTENT` existant. Le fichier final contiendra 108 entrées au total.

```typescript
// Dans src/content/top-services/top50.ts (renommer en top-services.ts si tu préfères)
export const TOP_SERVICE_CONTENT: Record<string, TopServiceContent> = {
  // ... 58 entrées existantes ...
  civitai: { ... },
  "krea-ai": { ... },
  // ... 50 nouvelles entrées ...
};
```

## Validation des slugs

Les 50 nouveaux slugs sont **tous confirmés** dans la DB Neon. Le test de validation existant (`validate.test.ts`) couvrira automatiquement ces nouvelles entrées.

## Priorité de conversion TS

Si le temps est limité, convertir par ordre de priorité :
1. **Services avec trafic PostHog** : civitai, krea-ai, lmarena, nvidia-nim, moonshot-kimi (5)
2. **Cloud infra majeur** : aws-bedrock, azure-openai, google-vertex, google-ai-studio, cloudflare-ai (5)
3. **Dev tools** : langchain, continue-dev, cline, aider, sourcegraph-cody (5)
4. **a16z top 100** : synthesia, gamma, grammarly, adobe-firefly, capcut (5)
5. **Le reste** (30) : par batch de 10
