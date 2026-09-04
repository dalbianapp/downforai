import type { TopServiceContent } from "@/content/top-services/types";

// MLOPS — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start mlops-2.ts and register it in ./index.ts if it grows.
export const MLOPS: Record<string, TopServiceContent> = {
  langsmith: {
    slug: "langsmith",
    providerSummary:
      "LangChain's observability and evaluation platform. Trace LLM calls, run evals, monitor prod.",
    officialStatusUrl: "https://status.smith.langchain.com",
    docsUrl: "https://docs.smith.langchain.com",
    pricingUrl: "https://www.langchain.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "smith.langchain.com", description: "Web dashboard", criticality: "critical" },
      { name: "Tracing API", description: "LLM call ingestion endpoint", criticality: "critical" },
      { name: "Eval Runner", description: "Dataset evaluation pipeline", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tracing ingestion lag",
        scope: "global",
        signal: "Traces appear delayed or missing in dashboard",
        quickCheck: "Check status.smith.langchain.com for ingestion pipeline health",
      },
      {
        pattern: "Eval timeout on large datasets",
        scope: "global",
        signal: "Evaluation runs time out before completing",
        quickCheck: "Run evals on smaller dataset splits; check eval runner status",
      },
      {
        pattern: "Dashboard loading delays",
        scope: "global",
        signal: "Dashboard slow to load or traces not rendering",
        quickCheck: "Hard refresh; filter to smaller time range to reduce data load",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LangSmith is degraded",
        alternative:
          "Helicone, Braintrust, or Arize Phoenix can reduce downtime for LLM observability",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "ai-gateway": {
    slug: "ai-gateway",
    providerSummary:
      "Cloudflare AI Gateway sits in front of model providers to log, cache, rate-limit and retry LLM traffic, configured from the Cloudflare dashboard. A gateway incident affects every provider call routed through it, while a provider outage shows up as errors passing through the gateway.",
    docsUrl: "https://developers.cloudflare.com/ai-gateway",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "gateway.ai.cloudflare.com", description: "Proxy endpoint", criticality: "critical" },
      { name: "Cloudflare dashboard", description: "Configuration and logs", criticality: "medium" },
      { name: "Upstream providers", description: "OpenAI, Anthropic and others behind the gateway", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Errors from the upstream provider passed through",
        scope: "partial",
        signal: "Responses carry the provider's 429 or 5xx while the gateway itself answers",
        quickCheck: "Call the provider directly; if it fails too, the gateway is only relaying",
      },
      {
        pattern: "Gateway-wide incident",
        scope: "global",
        signal: "All routed calls fail with gateway errors while providers respond directly",
        quickCheck: "Check Cloudflare's status page and bypass the gateway temporarily",
      },
      {
        pattern: "Cached or rate-limited responses mistaken for failures",
        scope: "local",
        signal: "Unexpected 429s or stale answers from gateway settings",
        quickCheck: "Review the gateway's rate-limit and cache configuration",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AI Gateway is down",
        alternative: "Portkey or LiteLLM (monitored on DownForAI) provide comparable gateways; calling providers directly is the immediate bypass",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Cloudflare network", "Model providers"],
    operatorNotes: [
      "Cloudflare publishes its own status page; DownForAI probes the documentation page for this entry.",
    ],
  },
  aporia: {
    slug: "aporia",
    providerSummary:
      "Aporia provided ML observability and LLM guardrails; the company was acquired by Coralogix and its standalone site no longer answers, with the product living on inside Coralogix's AI observability. Existing Aporia endpoints should be considered migrated.",
    docsUrl: "https://www.aporia.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "aporia.com", description: "Former website (unreachable)", criticality: "low" },
      { name: "Coralogix AI observability", description: "Successor product", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "aporia.com does not resolve",
        quickCheck: "Expected after the acquisition; use Coralogix",
      },
      {
        pattern: "Legacy guardrail endpoints failing",
        scope: "local",
        signal: "Old Aporia integrations error",
        quickCheck: "Migrate to the successor product or another guardrail provider",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Aporia guardrails",
        alternative: "Lakera or Galileo (monitored on DownForAI) offer LLM guardrails; Arize AI covers observability",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Coralogix"],
    operatorNotes: [
      "The DB website URL is dead; consider marking this service inactive.",
    ],
  },
  "arize-ai": {
    slug: "arize-ai",
    providerSummary:
      "Arize offers AX, a hosted observability and evaluation platform for ML and LLM apps, and Phoenix, its open-source tracing tool. AX users depend on Arize's ingestion and UI; Phoenix users only on their own deployment.",
    docsUrl: "https://docs.arize.com",
    pricingUrl: "https://arize.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Arize AX", description: "Hosted platform", criticality: "critical" },
      { name: "Trace ingestion", description: "OpenTelemetry endpoints", criticality: "critical" },
      { name: "Phoenix (self-hosted)", description: "Open-source tracing", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Traces not appearing in AX",
        scope: "partial",
        signal: "Applications export spans but the UI shows nothing new",
        quickCheck: "Check the exporter's error logs; if exports succeed and nothing appears, ingestion is delayed",
      },
      {
        pattern: "Evaluations queued",
        scope: "partial",
        signal: "Eval jobs stay pending far beyond the norm",
        quickCheck: "Wait; evaluation runs on a separate queue",
      },
      {
        pattern: "Dashboard slow or erroring",
        scope: "global",
        signal: "AX UI fails for everyone",
        quickCheck: "Retry later; ingestion may continue buffering",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Arize AX is down",
        alternative: "Langfuse, LangSmith or Braintrust (monitored on DownForAI) offer LLM tracing and evals; Phoenix runs locally",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "arthur-ai": {
    slug: "arthur-ai",
    providerSummary:
      "Arthur provides AI monitoring, evaluation and guardrails (Arthur Engine, Shield) for enterprises, deployed in Arthur's cloud or the customer's environment. Public exposure is limited; incidents are seen by enterprise customers through their deployments.",
    docsUrl: "https://www.arthur.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Arthur platform", description: "Hosted or on-prem", criticality: "critical" },
      { name: "Guardrail endpoints", description: "Shield inline checks", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Inline guardrail latency or errors",
        scope: "partial",
        signal: "Application requests slow down or fail at the guardrail step",
        quickCheck: "Bypass the guardrail with a feature flag if allowed; contact support",
      },
      {
        pattern: "Metrics not updating",
        scope: "partial",
        signal: "Dashboards show stale inference data",
        quickCheck: "Check the ingestion job; on-prem deployments depend on your infrastructure",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Arthur is unavailable",
        alternative: "Fiddler AI or WhyLabs (monitored on DownForAI) cover model monitoring; Lakera covers guardrails",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  braintrust: {
    slug: "braintrust",
    providerSummary:
      "Braintrust is an evaluation and logging platform for LLM apps (evals, prompt playground, tracing, an AI proxy), hosted with a self-hosted data-plane option; braintrustdata.com redirects to braintrust.dev. Failures are log ingestion delays, eval runs stalling or the proxy relaying provider errors.",
    docsUrl: "https://www.braintrust.dev/docs",
    pricingUrl: "https://www.braintrust.dev/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "braintrust.dev app and API", description: "Logs, evals, playground", criticality: "critical" },
      { name: "AI proxy", description: "Provider relay with caching", criticality: "high" },
      { name: "Data plane", description: "Hosted or self-hosted storage", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Logs delayed or missing",
        scope: "partial",
        signal: "Traced requests do not appear in the UI",
        quickCheck: "Check the SDK's flush and error output; if exports succeed and nothing shows, ingestion is delayed",
      },
      {
        pattern: "Eval runs stalling",
        scope: "partial",
        signal: "Experiments stay in progress for everyone",
        quickCheck: "Run a tiny eval; a universal stall is the platform",
      },
      {
        pattern: "Proxy relaying provider errors",
        scope: "local",
        signal: "Calls through the proxy return the provider's 429 or 5xx",
        quickCheck: "Call the provider directly; the proxy only relays",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Braintrust is down",
        alternative: "Langfuse, LangSmith or Arize AI (monitored on DownForAI) offer tracing and evals",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  censius: {
    slug: "censius",
    providerSummary:
      "Censius was an AI observability and model-monitoring platform; its main site no longer answers, although the documentation host is still online. The product appears to be wound down.",
    docsUrl: "https://docs.censius.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "censius.ai", description: "Website (unreachable)", criticality: "low" },
      { name: "docs.censius.ai", description: "Documentation (still online)", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website unreachable while docs remain",
        scope: "global",
        signal: "censius.ai does not resolve; docs load",
        quickCheck: "Treat the product as discontinued",
      },
      {
        pattern: "SDK uploads failing",
        scope: "local",
        signal: "Monitoring SDK cannot reach the ingestion endpoint",
        quickCheck: "Migrate to another observability platform",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Censius",
        alternative: "Evidently AI, WhyLabs or Fiddler AI (monitored on DownForAI) cover model monitoring",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI probes docs.censius.ai (the DB check URL); the main site is dead — consider marking the service inactive.",
    ],
  },
  cleanlab: {
    slug: "cleanlab",
    providerSummary:
      "Cleanlab provides data-quality tooling: the open-source cleanlab library, Cleanlab Studio for datasets and the Trustworthy Language Model (TLM) API for scoring LLM outputs. Library users depend on nothing hosted; Studio and TLM users on Cleanlab's cloud.",
    docsUrl: "https://help.cleanlab.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Cleanlab Studio", description: "Hosted data platform", criticality: "high" },
      { name: "TLM API", description: "Trust scoring", criticality: "critical" },
      { name: "Open-source library", description: "Local use", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "TLM API 429 or latency",
        scope: "partial",
        signal: "Trust-score calls throttle or slow across keys",
        quickCheck: "Back off; check the account's rate limits",
      },
      {
        pattern: "Studio dataset analysis stuck",
        scope: "partial",
        signal: "Uploads stay in analysis far beyond the norm",
        quickCheck: "Try a small dataset; a universal stall is the platform",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Cleanlab's hosted services are down",
        alternative: "Kolena or Scale AI (monitored on DownForAI) cover data quality workflows; the open-source library keeps working",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers behind TLM"],
    operatorNotes: [],
  },
  clearml: {
    slug: "clearml",
    providerSummary:
      "ClearML is an open-source MLOps platform (experiment tracking, orchestration, serving) available self-hosted or as a hosted service. Hosted users depend on ClearML's servers; self-hosters on their own deployment.",
    docsUrl: "https://clear.ml/docs",
    communityLinks: [
      { type: "github", url: "https://github.com/clearml/clearml", label: "clearml/clearml", verified: true },
    ],
    monitoredSurfaces: [
      { name: "app.clear.ml (hosted)", description: "Web UI and API", criticality: "high" },
      { name: "Self-hosted servers", description: "User-run", criticality: "medium" },
      { name: "Agents", description: "Workers pulling tasks", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Experiments not reporting to the hosted server",
        scope: "partial",
        signal: "The SDK logs connection errors and runs do not appear",
        quickCheck: "Check the server URL and credentials in clearml.conf; if correct and failing for everyone, the hosted service is degraded",
      },
      {
        pattern: "Agents idle while tasks queue",
        scope: "local",
        signal: "Queued tasks are never picked up",
        quickCheck: "Check that agents are running and listening to the right queue",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ClearML hosted is down",
        alternative: "MLflow or Weights & Biases (monitored on DownForAI) cover experiment tracking; ClearML can also be self-hosted",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "comet-ml": {
    slug: "comet-ml",
    providerSummary:
      "Comet provides experiment tracking, model management and Opik, its LLM evaluation and tracing tool, hosted or self-hosted, with a status page. Failures are SDK uploads not landing, UI errors and Opik trace ingestion delays.",
    officialStatusUrl: "https://status.comet.com/",
    docsUrl: "https://www.comet.com/docs",
    pricingUrl: "https://www.comet.com/site/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "comet.com platform", description: "Experiments and models", criticality: "critical" },
      { name: "Opik", description: "LLM tracing and evals", criticality: "high" },
      { name: "SDK ingestion", description: "Metrics and artifacts upload", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Experiments not appearing",
        scope: "partial",
        signal: "The SDK reports upload errors or runs never show",
        quickCheck: "Check status.comet.com; the SDK buffers offline and syncs later",
      },
      {
        pattern: "Opik traces delayed",
        scope: "partial",
        signal: "LLM traces arrive minutes late",
        quickCheck: "Wait; ingestion queues clear",
      },
      {
        pattern: "Artifact uploads failing",
        scope: "local",
        signal: "Large artifacts error while metrics log",
        quickCheck: "Check size limits and network; retry",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Comet is down",
        alternative: "Weights & Biases, MLflow or Langfuse (monitored on DownForAI) cover tracking and LLM tracing",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "confident-ai": {
    slug: "confident-ai",
    providerSummary:
      "Confident AI is the hosted evaluation platform built around DeepEval (open-source LLM testing), offering regression testing, datasets and monitoring. DeepEval runs locally; Confident AI's cloud stores results and runs monitoring.",
    docsUrl: "https://www.confident-ai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.confident-ai.com", description: "Hosted platform", criticality: "critical" },
      { name: "DeepEval (local)", description: "Test runner", criticality: "medium" },
      { name: "Model providers", description: "Used by LLM-as-judge metrics", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Test results not uploading",
        scope: "partial",
        signal: "DeepEval runs locally but results never reach the dashboard",
        quickCheck: "Check the API key and network; local results are kept",
      },
      {
        pattern: "Judge-model errors in evals",
        scope: "local",
        signal: "Metrics fail with OpenAI or other provider errors",
        quickCheck: "Check the provider's status; switch the judge model",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Confident AI is down",
        alternative: "Braintrust or Langfuse (monitored on DownForAI) store evals; DeepEval keeps running locally",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [
      "documentation.confident-ai.com was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  "context-ai": {
    slug: "context-ai",
    providerSummary:
      "Context.ai provided product analytics for LLM applications — conversation analysis, topic clustering, evaluations — through an SDK and dashboard. It is a small hosted service; ingestion and the dashboard are its two surfaces.",
    docsUrl: "https://context.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "context.ai dashboard", description: "Analytics UI", criticality: "critical" },
      { name: "Ingestion API", description: "Conversation logs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Conversations not appearing",
        scope: "partial",
        signal: "The SDK sends logs but the dashboard shows nothing new",
        quickCheck: "Check the SDK's error output; if sends succeed, ingestion is delayed",
      },
      {
        pattern: "Dashboard errors",
        scope: "global",
        signal: "The UI fails for everyone",
        quickCheck: "Retry later; logs buffer on the ingestion side",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Context.ai is down",
        alternative: "Langfuse or Helicone (monitored on DownForAI) capture and analyse LLM conversations",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "datadog-llm": {
    slug: "datadog-llm",
    providerSummary:
      "Datadog LLM Observability traces and evaluates LLM applications inside Datadog, alongside its APM and logs, using Datadog's agents and SDKs. It inherits Datadog's regional availability, published on Datadog's status page.",
    officialStatusUrl: "https://status.datadoghq.com",
    docsUrl: "https://docs.datadoghq.com/llm_observability/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Datadog platform (regional sites)", description: "UI and APIs", criticality: "critical" },
      { name: "LLM Observability ingestion", description: "Traces and evaluations", criticality: "critical" },
      { name: "Datadog agents / SDKs", description: "Client side", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "LLM traces delayed or missing",
        scope: "partial",
        signal: "Spans do not appear while APM traces do",
        quickCheck: "Check status.datadoghq.com for the LLM Observability component on your site (US1, EU1, etc.)",
      },
      {
        pattern: "Site-wide Datadog incident",
        scope: "global",
        signal: "Dashboards and ingestion degraded for your region",
        quickCheck: "Check the status page; agents buffer locally",
      },
      {
        pattern: "Evaluations not running",
        scope: "partial",
        signal: "Managed evaluations stay pending",
        quickCheck: "Check the LLM provider integration used for evaluations",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Datadog LLM Observability is down",
        alternative: "Langfuse, Arize AI or Helicone (monitored on DownForAI) trace LLM applications",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Datadog platform", "Model providers for evaluations"],
    operatorNotes: [],
  },
  deepeval: {
    slug: "deepeval",
    providerSummary:
      "DeepEval is an open-source LLM evaluation framework (metrics, unit tests, benchmarks) run locally with your judge-model keys; Confident AI is its optional hosted dashboard. Nothing essential is hosted, so failures are provider or environment related.",
    docsUrl: "https://github.com/confident-ai/deepeval",
    communityLinks: [
      { type: "github", url: "https://github.com/confident-ai/deepeval", label: "confident-ai/deepeval", verified: true },
    ],
    monitoredSurfaces: [
      { name: "deepeval.com", description: "Website", criticality: "low" },
      { name: "Judge-model providers", description: "Used by metrics", criticality: "critical" },
      { name: "Confident AI (optional)", description: "Hosted results", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Metrics fail on judge-model errors",
        scope: "local",
        signal: "Evals stop with OpenAI or other provider errors",
        quickCheck: "Check the provider's status; switch the judge model",
      },
      {
        pattern: "Version conflicts after upgrading",
        scope: "local",
        signal: "Metric APIs changed between releases",
        quickCheck: "Pin the version",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a hosted evaluation service",
        alternative: "Braintrust, Langfuse or Patronus AI (monitored on DownForAI) run evals as a service",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [
      "docs.deepeval.com was unreachable when this entry was written; the docs link points to the GitHub repository.",
    ],
  },
  dvc: {
    slug: "dvc",
    providerSummary:
      "DVC is an open-source data and model versioning tool that works alongside Git and pushes data to your own storage (S3, GCS, Azure, SSH). It has no hosted component to be down; failures come from the remote storage or credentials.",
    docsUrl: "https://dvc.org/doc",
    communityLinks: [
      { type: "github", url: "https://github.com/iterative/dvc", label: "iterative/dvc", verified: true },
    ],
    monitoredSurfaces: [
      { name: "dvc.org", description: "Website and docs", criticality: "low" },
      { name: "Your remote storage", description: "Where data lives", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "dvc push or pull failing",
        scope: "local",
        signal: "Errors from the storage backend (403, timeouts)",
        quickCheck: "Check the cloud storage's status and your credentials; DVC only relays",
      },
      {
        pattern: "Cache corruption or missing files",
        scope: "local",
        signal: "Files reported missing after a pull",
        quickCheck: "Run dvc status and re-push from a machine that has the data",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You want a hosted alternative",
        alternative: "Weights & Biases or MLflow (monitored on DownForAI) track artifacts with hosted storage options",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Cloud storage providers"],
    operatorNotes: [
      "DownForAI probes dvc.org, which says nothing about your storage remotes.",
    ],
  },
  "evidently-ai": {
    slug: "evidently-ai",
    providerSummary:
      "Evidently is an open-source library for ML and LLM evaluation and monitoring, plus Evidently Cloud for hosted dashboards and alerts. Library users depend only on their environment; cloud users on Evidently's ingestion and UI.",
    docsUrl: "https://docs.evidentlyai.com",
    communityLinks: [
      { type: "github", url: "https://github.com/evidentlyai/evidently", label: "evidentlyai/evidently", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Evidently Cloud", description: "Hosted dashboards", criticality: "high" },
      { name: "Open-source library", description: "Local reports", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Snapshots not uploading to the cloud",
        scope: "partial",
        signal: "The SDK errors on upload while local reports generate",
        quickCheck: "Check the token; if uploads fail for everyone, the cloud is degraded",
      },
      {
        pattern: "LLM judge metrics failing",
        scope: "local",
        signal: "Descriptor evaluations error with provider messages",
        quickCheck: "Check the provider's status and key",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Evidently Cloud is down",
        alternative: "WhyLabs or Arize AI (monitored on DownForAI) offer hosted monitoring; the library keeps working locally",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers for LLM judges"],
    operatorNotes: [],
  },
  "fiddler-ai": {
    slug: "fiddler-ai",
    providerSummary:
      "Fiddler is an AI observability platform (model monitoring, explainability, LLM guardrails) for enterprises, deployed in Fiddler's cloud or on-prem. Incidents are ingestion delays and guardrail latency, visible to customers rather than the public.",
    docsUrl: "https://docs.fiddler.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Fiddler platform", description: "Hosted or on-prem", criticality: "critical" },
      { name: "Event ingestion", description: "Monitoring data", criticality: "critical" },
      { name: "Guardrails", description: "Inline checks", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Events not appearing in monitoring",
        scope: "partial",
        signal: "Published events do not update charts",
        quickCheck: "Check the publish job's status; ingestion runs asynchronously",
      },
      {
        pattern: "Guardrail latency",
        scope: "partial",
        signal: "Inline checks add seconds to requests",
        quickCheck: "Bypass with a feature flag if allowed; contact support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fiddler is unavailable",
        alternative: "Arthur AI or WhyLabs (monitored on DownForAI) cover model monitoring; Lakera covers guardrails",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "galileo-ai": {
    slug: "galileo-ai",
    providerSummary:
      "Galileo provides evaluation, observability and guardrails (Luna models, Protect) for LLM applications; rungalileo.io redirects to galileo.ai. Hosted users depend on Galileo's ingestion and evaluation services; inline guardrails add a request-path dependency.",
    docsUrl: "https://docs.galileo.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Galileo platform", description: "Evaluate and observe", criticality: "critical" },
      { name: "Protect (guardrails)", description: "Inline checks", criticality: "high" },
      { name: "Trace ingestion", description: "Logs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Traces or evaluations delayed",
        scope: "partial",
        signal: "Logged runs do not appear or metrics stay pending",
        quickCheck: "Check the SDK's error output; if exports succeed, the backend is delayed",
      },
      {
        pattern: "Guardrail calls timing out",
        scope: "partial",
        signal: "Protect adds latency or fails across requests",
        quickCheck: "Fail open with a feature flag if allowed",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Galileo is down",
        alternative: "Arize AI, Braintrust or Patronus AI (monitored on DownForAI) offer evals; Lakera covers guardrails",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "rungalileo.io redirects to galileo.ai; DownForAI's probe follows the redirect.",
    ],
  },
  giskard: {
    slug: "giskard",
    providerSummary:
      "Giskard offers an open-source library for testing LLM and ML systems (vulnerability scans, bias) and an enterprise Hub for continuous red-teaming. Library users depend on model providers used in scans; Hub users on Giskard's hosted or on-prem deployment.",
    docsUrl: "https://docs.giskard.ai",
    communityLinks: [
      { type: "github", url: "https://github.com/Giskard-AI/giskard", label: "Giskard-AI/giskard", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Giskard Hub", description: "Enterprise platform", criticality: "high" },
      { name: "Open-source library", description: "Local scans", criticality: "medium" },
      { name: "Model providers", description: "Used during scans", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Scans failing on provider errors",
        scope: "local",
        signal: "The scan stops with rate-limit or key errors from the LLM used to generate tests",
        quickCheck: "Check the provider's status; lower the scan's concurrency",
      },
      {
        pattern: "Hub jobs stuck",
        scope: "partial",
        signal: "Red-teaming runs stay pending",
        quickCheck: "Contact support; Hub deployments are per customer",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Giskard Hub is unavailable",
        alternative: "Patronus AI or Lakera (monitored on DownForAI) offer red-teaming and security testing; the library keeps working",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  helicone: {
    slug: "helicone",
    providerSummary:
      "Helicone is an open-source LLM observability platform used as a proxy (or async logger) in front of model providers, with caching, rate limits and a dashboard, hosted or self-hosted. As a proxy it sits on the request path, so its incidents can block traffic.",
    officialStatusUrl: "https://status.helicone.ai/",
    docsUrl: "https://docs.helicone.ai",
    pricingUrl: "https://www.helicone.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Helicone proxy", description: "Request path", criticality: "critical" },
      { name: "Dashboard and API", description: "Logs and analytics", criticality: "high" },
      { name: "Upstream providers", description: "Behind the proxy", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Proxy errors blocking requests",
        scope: "global",
        signal: "Calls through the proxy fail while providers answer directly; status.helicone.ai lists an incident",
        quickCheck: "Bypass the proxy (call the provider directly) until it recovers",
      },
      {
        pattern: "Logs delayed",
        scope: "partial",
        signal: "Requests succeed but do not appear in the dashboard",
        quickCheck: "Wait; ingestion is asynchronous",
      },
      {
        pattern: "Provider errors relayed",
        scope: "local",
        signal: "Responses carry the provider's 429 or 5xx",
        quickCheck: "Check the provider's status; the proxy only relays",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Helicone is down",
        alternative: "Portkey or LiteLLM (monitored on DownForAI) are alternative gateways; direct provider calls are the immediate bypass",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  "honeyhive-ai": {
    slug: "honeyhive-ai",
    providerSummary:
      "HoneyHive is an evaluation and observability platform for LLM apps (tracing, evals, datasets, prompt management), hosted with SDK ingestion. Its incidents are trace ingestion delays, eval jobs stalling and dashboard errors.",
    docsUrl: "https://docs.honeyhive.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.honeyhive.ai", description: "Dashboard", criticality: "critical" },
      { name: "Trace ingestion", description: "SDK exports", criticality: "critical" },
      { name: "Evaluation runs", description: "Hosted evals", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Traces not appearing",
        scope: "partial",
        signal: "SDK exports succeed but the dashboard shows nothing new",
        quickCheck: "Wait; ingestion is asynchronous — check the SDK's error output first",
      },
      {
        pattern: "Evaluations stuck",
        scope: "partial",
        signal: "Eval runs stay pending for everyone",
        quickCheck: "Run a tiny eval; a universal stall is the platform",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "HoneyHive is down",
        alternative: "Langfuse, Braintrust or LangSmith (monitored on DownForAI) offer tracing and evals",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers for evals"],
    operatorNotes: [],
  },
  humanloop: {
    slug: "humanloop",
    providerSummary:
      "Humanloop was a platform for prompt management, evaluation and monitoring of LLM apps. Its team joined Anthropic in 2025 and the platform was sunset; its former status page now redirects to incident.io's marketing site. Existing integrations should be considered discontinued.",
    docsUrl: "https://humanloop.com/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "humanloop.com", description: "Website and docs (still online)", criticality: "low" },
      { name: "Humanloop API", description: "Sunset", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API or SDK calls failing",
        scope: "global",
        signal: "Prompt fetches and logging return errors",
        quickCheck: "Expected after the sunset; migrate",
      },
      {
        pattern: "Status page gone",
        scope: "local",
        signal: "status.humanloop.com redirects elsewhere",
        quickCheck: "Do not rely on it; the product is discontinued",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Humanloop",
        alternative: "Langfuse, PromptLayer or Braintrust (monitored on DownForAI) cover prompt management and evals",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The DB status surface (status.humanloop.com) no longer serves a status page; consider marking this service inactive.",
    ],
  },
  kolena: {
    slug: "kolena",
    providerSummary:
      "Kolena is an ML testing and data-quality platform for evaluating models on curated test cases, hosted with SDK uploads. Incidents are upload or evaluation jobs stalling and dashboard errors, seen by enterprise users.",
    docsUrl: "https://docs.kolena.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Kolena platform", description: "Dashboard and API", criticality: "critical" },
      { name: "Evaluation jobs", description: "Model testing", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Uploads or evaluations stuck",
        scope: "partial",
        signal: "Datasets or results stay processing far beyond the norm",
        quickCheck: "Try a tiny upload; a universal stall is the platform",
      },
      {
        pattern: "SDK auth errors",
        scope: "local",
        signal: "The SDK is rejected with 401",
        quickCheck: "Regenerate the API token",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kolena is down",
        alternative: "Cleanlab or Weights & Biases (monitored on DownForAI) cover dataset evaluation workflows",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  lakera: {
    slug: "lakera",
    providerSummary:
      "Lakera Guard is an API that screens prompts and outputs for injection, jailbreaks and data leakage, sitting inline in LLM applications; the company was acquired by Check Point in 2025. Because it is on the request path, its latency and availability directly affect protected apps.",
    docsUrl: "https://docs.lakera.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Lakera Guard API", description: "Inline screening", criticality: "critical" },
      { name: "Dashboard", description: "Policies and keys", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Guard calls timing out",
        scope: "partial",
        signal: "Screening requests slow down or fail across applications",
        quickCheck: "Fail open or closed per your policy; retry with a short timeout",
      },
      {
        pattern: "429 rate limits",
        scope: "local",
        signal: "Requests rejected for your key",
        quickCheck: "Check the plan's request limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Lakera Guard is down",
        alternative: "Galileo or Arthur AI (monitored on DownForAI) offer guardrail APIs; a local classifier is a stopgap",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "laminar-ai": {
    slug: "laminar-ai",
    providerSummary:
      "Laminar is an open-source LLM engineering platform (tracing, evals, labelling) available hosted or self-hosted; lmnr.ai redirects to laminar.sh. Hosted users depend on trace ingestion and the dashboard; self-hosters on their own deployment.",
    docsUrl: "https://docs.lmnr.ai",
    communityLinks: [
      { type: "github", url: "https://github.com/lmnr-ai/lmnr", label: "lmnr-ai/lmnr", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Laminar cloud", description: "Hosted platform", criticality: "high" },
      { name: "Trace ingestion", description: "SDK exports", criticality: "critical" },
      { name: "Self-hosted instances", description: "User-run", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Traces not appearing",
        scope: "partial",
        signal: "SDK exports succeed but the dashboard shows nothing",
        quickCheck: "Check the SDK's error output; ingestion is asynchronous",
      },
      {
        pattern: "Self-hosted stack failing after an update",
        scope: "local",
        signal: "Containers error on start",
        quickCheck: "Check the compose logs and migration notes",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Laminar cloud is down",
        alternative: "Langfuse or Helicone (monitored on DownForAI) offer hosted tracing; Laminar can also be self-hosted",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "lmnr.ai redirects to laminar.sh; DownForAI's probe follows the redirect.",
    ],
  },
  langfuse: {
    slug: "langfuse",
    providerSummary:
      "Langfuse is an open-source LLM engineering platform (tracing, evals, prompt management) offered as Langfuse Cloud in several regions or self-hosted, with a status page. Cloud incidents are ingestion delays and UI errors; SDKs buffer and retry.",
    officialStatusUrl: "https://status.langfuse.com/",
    docsUrl: "https://langfuse.com/docs",
    pricingUrl: "https://langfuse.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Langfuse Cloud (EU / US regions)", description: "Hosted platform", criticality: "critical" },
      { name: "Trace ingestion API", description: "SDK exports", criticality: "critical" },
      { name: "Self-hosted instances", description: "User-run", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Traces delayed in the cloud",
        scope: "partial",
        signal: "Exports succeed but traces appear minutes late; status.langfuse.com lists ingestion delays",
        quickCheck: "Wait; SDKs queue locally and nothing is lost",
      },
      {
        pattern: "Prompt fetches failing",
        scope: "partial",
        signal: "Applications fetching prompts from Langfuse get errors",
        quickCheck: "Use the SDK's cached prompts fallback; check the status page",
      },
      {
        pattern: "Region-specific incident",
        scope: "partial",
        signal: "Only EU or US cloud is affected",
        quickCheck: "Check the region component on the status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Langfuse Cloud is down",
        alternative: "LangSmith, Helicone or Braintrust (monitored on DownForAI) offer hosted tracing; Langfuse can also be self-hosted",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  litellm: {
    slug: "litellm",
    providerSummary:
      "LiteLLM is an open-source proxy and SDK that exposes 100+ model providers behind one OpenAI-compatible API, run self-hosted (with an optional enterprise cloud). Because it sits on the request path, its own errors and the providers' errors both surface as LiteLLM failures.",
    docsUrl: "https://docs.litellm.ai",
    communityLinks: [
      { type: "github", url: "https://github.com/BerriAI/litellm", label: "BerriAI/litellm", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Your LiteLLM proxy", description: "Self-hosted gateway", criticality: "critical" },
      { name: "Upstream providers", description: "Behind the proxy", criticality: "critical" },
      { name: "litellm.ai / docs", description: "Website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Provider errors relayed",
        scope: "local",
        signal: "Responses carry the provider's 429 or 5xx",
        quickCheck: "Check the provider's status; configure fallbacks and retries in the proxy",
      },
      {
        pattern: "Proxy failing after an upgrade",
        scope: "local",
        signal: "The proxy errors on start or on config",
        quickCheck: "Pin the version; releases are frequent and change config keys",
      },
      {
        pattern: "Database or Redis dependency down",
        scope: "local",
        signal: "Key management or spend tracking errors",
        quickCheck: "Check the proxy's Postgres and Redis",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your LiteLLM proxy is broken",
        alternative: "Portkey or AI Gateway (monitored on DownForAI) are hosted gateways; direct provider calls bypass the proxy",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers", "Postgres / Redis"],
    operatorNotes: [
      "DownForAI probes litellm.ai only; it says nothing about your proxy.",
    ],
  },
  "maxim-ai": {
    slug: "maxim-ai",
    providerSummary:
      "Maxim is an AI quality platform for simulating, evaluating and monitoring agents and LLM apps, hosted with SDK ingestion. Incidents are trace ingestion delays, evaluation runs stalling and dashboard errors.",
    docsUrl: "https://www.getmaxim.ai/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Maxim platform", description: "Dashboard and API", criticality: "critical" },
      { name: "Evaluation and simulation runs", description: "Hosted jobs", criticality: "high" },
      { name: "Trace ingestion", description: "SDK exports", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Runs stuck",
        scope: "partial",
        signal: "Simulations or evals stay pending for everyone",
        quickCheck: "Run a tiny eval; a universal stall is the platform",
      },
      {
        pattern: "Traces missing",
        scope: "partial",
        signal: "Exports succeed but nothing appears",
        quickCheck: "Wait; ingestion is asynchronous",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Maxim is down",
        alternative: "Braintrust, Langfuse or Galileo (monitored on DownForAI) offer evals and tracing",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers for evals"],
    operatorNotes: [],
  },
  mlflow: {
    slug: "mlflow",
    providerSummary:
      "MLflow is the open-source platform for experiment tracking, model registry and (since 3.x) LLM tracing and evals, self-hosted or managed by Databricks and others. The project itself has no service to be down; failures are in your tracking server or its backend store.",
    docsUrl: "https://mlflow.org/docs/latest/",
    communityLinks: [
      { type: "github", url: "https://github.com/mlflow/mlflow", label: "mlflow/mlflow", verified: true },
    ],
    monitoredSurfaces: [
      { name: "mlflow.org", description: "Website and docs", criticality: "low" },
      { name: "Your tracking server", description: "Self-hosted or managed", criticality: "critical" },
      { name: "Backend store / artifact store", description: "Database and object storage", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tracking server unreachable",
        scope: "local",
        signal: "Runs fail to log with connection errors",
        quickCheck: "Check the server process and URL; MLflow falls back to local files if configured",
      },
      {
        pattern: "Artifact uploads failing",
        scope: "local",
        signal: "Metrics log but artifacts error",
        quickCheck: "Check the artifact store's credentials and status",
      },
      {
        pattern: "Managed MLflow (Databricks) incident",
        scope: "partial",
        signal: "Tracking fails for workspace users",
        quickCheck: "Check the Databricks page on DownForAI",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your MLflow server is down",
        alternative: "Weights & Biases, Comet ML or Neptune.ai (monitored on DownForAI) offer hosted tracking",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Databases and object storage", "Databricks when managed"],
    operatorNotes: [
      "DownForAI probes mlflow.org, which says nothing about your tracking server.",
    ],
  },
  nannyml: {
    slug: "nannyml",
    providerSummary:
      "NannyML is an open-source library for estimating model performance without labels and detecting drift, plus NannyML Cloud for hosted monitoring. Library users have no hosted dependency; cloud users depend on NannyML's ingestion and UI.",
    docsUrl: "https://nannyml.readthedocs.io",
    communityLinks: [
      { type: "github", url: "https://github.com/NannyML/nannyml", label: "NannyML/nannyml", verified: true },
    ],
    monitoredSurfaces: [
      { name: "NannyML Cloud", description: "Hosted monitoring", criticality: "high" },
      { name: "Open-source library", description: "Local analysis", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Cloud dashboards not updating",
        scope: "partial",
        signal: "Uploaded data does not produce new results",
        quickCheck: "Check the SDK's upload result; runs are scheduled",
      },
      {
        pattern: "Library estimation errors",
        scope: "local",
        signal: "Calculations fail on data format",
        quickCheck: "Check the reference and analysis dataframes; this is not a service issue",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "NannyML Cloud is down",
        alternative: "Evidently AI or WhyLabs (monitored on DownForAI) offer hosted monitoring; the library keeps working",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "neptune-ai": {
    slug: "neptune-ai",
    providerSummary:
      "Neptune is an experiment tracker built for large-scale training runs, hosted (with a self-hosted option) and used through a Python client. Its main site was unreachable when this entry was written while the docs remained online; check the docs and community for the current state.",
    docsUrl: "https://docs.neptune.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "neptune.ai app", description: "Hosted tracker", criticality: "critical" },
      { name: "Client ingestion", description: "Metrics upload", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Runs not syncing",
        scope: "partial",
        signal: "The client queues metrics and reports connection errors",
        quickCheck: "The client buffers locally; sync with the CLI once the service is reachable",
      },
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "neptune.ai times out",
        quickCheck: "Use docs.neptune.ai and the app subdomain directly",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Neptune is unavailable",
        alternative: "Weights & Biases, Comet ML or MLflow (monitored on DownForAI) cover experiment tracking",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The DB website URL (neptune.ai) did not answer when this entry was written; the docs host did.",
    ],
  },
  "parea-ai": {
    slug: "parea-ai",
    providerSummary:
      "Parea AI provides prompt testing, evaluation and observability for LLM apps through SDKs and a hosted dashboard. It is a small hosted platform; ingestion and evaluation runs are its surfaces.",
    docsUrl: "https://docs.parea.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.parea.ai", description: "Dashboard", criticality: "critical" },
      { name: "Trace ingestion", description: "SDK exports", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Traces not appearing",
        scope: "partial",
        signal: "Exports succeed but the dashboard shows nothing",
        quickCheck: "Wait; ingestion is asynchronous",
      },
      {
        pattern: "Evaluations failing on judge-model errors",
        scope: "local",
        signal: "Evals stop with provider errors",
        quickCheck: "Check the provider's status and key",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Parea is down",
        alternative: "Langfuse, Braintrust or PromptLayer (monitored on DownForAI) cover prompt evals and tracing",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  "patronus-ai": {
    slug: "patronus-ai",
    providerSummary:
      "Patronus AI offers evaluation models (Lynx, Glider), automated testing and red-teaming for LLM applications through an API and platform. Its incidents are API errors on evaluators and experiment runs stalling.",
    docsUrl: "https://www.patronus.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Patronus API", description: "Evaluators", criticality: "critical" },
      { name: "Platform", description: "Experiments and datasets", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Evaluator calls failing or slow",
        scope: "partial",
        signal: "Evaluation requests time out across evaluators",
        quickCheck: "Retry with backoff; a universal failure is the evaluation service",
      },
      {
        pattern: "429 rate limits",
        scope: "local",
        signal: "Requests rejected for your key",
        quickCheck: "Check the plan's limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Patronus is down",
        alternative: "Galileo, Braintrust or DeepEval (monitored on DownForAI) offer LLM evaluation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "docs.patronus.ai answers the same page for any path (SPA), so the docs link points to the main site.",
    ],
  },
  portkey: {
    slug: "portkey",
    providerSummary:
      "Portkey is an AI gateway and observability platform: requests route through Portkey to 200+ providers with fallbacks, caching, guardrails and logs, hosted or self-hosted, with a status page. On the request path, its incidents can block traffic unless you fail over.",
    officialStatusUrl: "https://status.portkey.ai/",
    docsUrl: "https://portkey.ai/docs",
    pricingUrl: "https://portkey.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Portkey gateway", description: "Request path", criticality: "critical" },
      { name: "Dashboard and logs", description: "Observability", criticality: "high" },
      { name: "Upstream providers", description: "Behind the gateway", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Gateway errors blocking requests",
        scope: "global",
        signal: "Calls through Portkey fail while providers answer directly; status.portkey.ai lists an incident",
        quickCheck: "Bypass the gateway until it recovers",
      },
      {
        pattern: "Provider errors relayed",
        scope: "local",
        signal: "Responses carry the provider's 429 or 5xx",
        quickCheck: "Configure fallbacks in the config; the gateway only relays",
      },
      {
        pattern: "Logs delayed",
        scope: "partial",
        signal: "Requests succeed but logs appear late",
        quickCheck: "Wait; logging is asynchronous",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Portkey is down",
        alternative: "LiteLLM or AI Gateway (monitored on DownForAI) are alternative gateways; direct calls bypass it",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  promptflow: {
    slug: "promptflow",
    providerSummary:
      "Prompt flow is Microsoft's open-source toolkit for building, evaluating and deploying LLM flows, run locally or inside Azure AI Foundry. The toolkit itself has no service; failures are the model provider or the Azure deployment.",
    docsUrl: "https://microsoft.github.io/promptflow",
    communityLinks: [
      { type: "github", url: "https://github.com/microsoft/promptflow", label: "microsoft/promptflow", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Docs site", description: "microsoft.github.io/promptflow", criticality: "low" },
      { name: "Azure AI Foundry runtime", description: "When deployed there", criticality: "high" },
      { name: "Model providers", description: "Azure OpenAI and others", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Flow runs failing on provider errors",
        scope: "local",
        signal: "LLM nodes fail with Azure OpenAI or OpenAI errors",
        quickCheck: "Check the provider's status and connection settings",
      },
      {
        pattern: "Azure deployment errors",
        scope: "partial",
        signal: "Deployed flows return 5xx in Azure",
        quickCheck: "Check the Azure AI Studio page on DownForAI",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a comparable toolkit",
        alternative: "LangChain, Flowise or Dify (monitored on DownForAI) build and run LLM flows",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Azure AI Foundry", "Model providers"],
    operatorNotes: [],
  },
  promptlayer: {
    slug: "promptlayer",
    providerSummary:
      "PromptLayer is a prompt-management and observability platform: a prompt registry with versioning, request logging via SDK wrappers and evaluations. Applications that fetch prompts at runtime depend on its API; logging is asynchronous.",
    docsUrl: "https://docs.promptlayer.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "PromptLayer API", description: "Prompt registry and logging", criticality: "critical" },
      { name: "Dashboard", description: "Prompts and evals", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Prompt fetches failing at runtime",
        scope: "partial",
        signal: "Applications cannot load templates from the registry",
        quickCheck: "Cache prompts locally as a fallback; check the dashboard",
      },
      {
        pattern: "Request logs delayed",
        scope: "partial",
        signal: "Logged calls appear late",
        quickCheck: "Wait; logging is asynchronous",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "PromptLayer is down",
        alternative: "Langfuse or Braintrust (monitored on DownForAI) manage prompts and logs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "raga-ai": {
    slug: "raga-ai",
    providerSummary:
      "RagaAI provides testing and evaluation for LLM and RAG applications (Catalyst platform, open-source evaluation library), hosted with SDK ingestion. Its incidents are evaluation runs stalling and dashboard errors.",
    docsUrl: "https://docs.raga.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "RagaAI Catalyst", description: "Hosted platform", criticality: "critical" },
      { name: "Evaluation runs", description: "Hosted jobs", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Evaluations stuck",
        scope: "partial",
        signal: "Runs stay pending for everyone",
        quickCheck: "Run a tiny eval; a universal stall is the platform",
      },
      {
        pattern: "SDK uploads failing",
        scope: "local",
        signal: "Dataset uploads error",
        quickCheck: "Check the token and file format",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "RagaAI is down",
        alternative: "Galileo, Patronus AI or Giskard (monitored on DownForAI) offer LLM testing",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers for evals"],
    operatorNotes: [],
  },
  "smithery-ai": {
    slug: "smithery-ai",
    providerSummary:
      "Smithery is a registry and hosting platform for MCP servers that give agents tools, with a CLI and hosted server endpoints. Agents configured with Smithery-hosted servers depend on Smithery's runtime; the registry itself is informational.",
    docsUrl: "https://smithery.ai/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "smithery.ai registry", description: "Server catalogue", criticality: "medium" },
      { name: "Hosted MCP servers", description: "Runtime endpoints", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Hosted MCP server not responding",
        scope: "partial",
        signal: "Agents fail to call tools from a Smithery-hosted server",
        quickCheck: "Run the server locally from its source if available; hosted endpoints are per server",
      },
      {
        pattern: "Registry search failing",
        scope: "partial",
        signal: "The site or CLI cannot list servers",
        quickCheck: "Install from the server's repository directly",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Smithery is down",
        alternative: "Composio (monitored on DownForAI) provides hosted tool integrations; MCP servers can also run locally",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "smithery.ai refuses direct homepage probes, so DownForAI checks robots.txt reachability only.",
    ],
  },
  truera: {
    slug: "truera",
    providerSummary:
      "TruEra was an AI quality and observability platform (and creator of TruLens); it was acquired by Snowflake in 2024 and its capabilities now live in Snowflake's AI observability, while TruLens continues as open source. The truera.com site remains but the standalone product is discontinued.",
    docsUrl: "https://truera.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "truera.com", description: "Legacy website", criticality: "low" },
      { name: "Snowflake AI observability", description: "Successor", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Legacy platform unavailable",
        scope: "global",
        signal: "Old TruEra deployments or logins no longer work",
        quickCheck: "Expected after the acquisition; use Snowflake or TruLens",
      },
      {
        pattern: "TruLens errors",
        scope: "local",
        signal: "The open-source library fails on provider calls",
        quickCheck: "Check the provider's status; TruLens runs locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on TruEra",
        alternative: "Arize AI, Fiddler AI or WhyLabs (monitored on DownForAI) cover AI observability",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Snowflake"],
    operatorNotes: [
      "Product discontinued as a standalone; consider marking the service inactive.",
    ],
  },
  valohai: {
    slug: "valohai",
    providerSummary:
      "Valohai is an MLOps platform that orchestrates training pipelines on any cloud or on-prem hardware, with a hosted control plane and workers in the customer's environment. Failures split between the control plane and the customer's compute.",
    docsUrl: "https://docs.valohai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Valohai control plane", description: "UI and API", criticality: "critical" },
      { name: "Customer workers", description: "Where executions run", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Executions queued without workers",
        scope: "local",
        signal: "Jobs stay queued because no worker in your environment picks them up",
        quickCheck: "Check the worker pool and cloud quotas; this is your infrastructure",
      },
      {
        pattern: "Control plane errors",
        scope: "partial",
        signal: "The UI or API fails while running executions continue",
        quickCheck: "Wait; executions on workers finish and sync later",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Valohai is unavailable",
        alternative: "ClearML or MLflow (monitored on DownForAI) can orchestrate and track pipelines",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Customer cloud accounts"],
    operatorNotes: [],
  },
  "vellum-ai": {
    slug: "vellum-ai",
    providerSummary:
      "Vellum is a platform for building, evaluating and deploying LLM workflows and prompts, with deployments served from Vellum's API. Applications that call Vellum-deployed prompts at runtime depend on its API availability.",
    docsUrl: "https://docs.vellum.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Vellum API", description: "Deployed prompts and workflows", criticality: "critical" },
      { name: "Vellum app", description: "Builder and evals", criticality: "high" },
      { name: "Model providers", description: "Behind deployments", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Deployed prompt calls failing",
        scope: "partial",
        signal: "Runtime calls to deployments error across workflows",
        quickCheck: "Check the provider behind the deployment; if all deployments fail, Vellum's API is degraded",
      },
      {
        pattern: "Evaluations stuck",
        scope: "partial",
        signal: "Test suites stay running",
        quickCheck: "Run a small suite; a universal stall is the platform",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vellum is down",
        alternative: "Langfuse or PromptLayer (monitored on DownForAI) manage prompts; call providers directly with cached prompts",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  "weights-and-biases": {
    slug: "weights-and-biases",
    providerSummary:
      "Weights & Biases (part of CoreWeave since 2025) is the widely used experiment-tracking platform, with Weave for LLM tracing and evals, hosted or self-hosted. Its SDK buffers offline, so most incidents show as delayed syncs, UI errors or artifact upload failures; W&B runs a status page.",
    docsUrl: "https://docs.wandb.ai",
    pricingUrl: "https://wandb.ai/site/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "wandb.ai platform", description: "Runs, artifacts, Weave", criticality: "critical" },
      { name: "SDK ingestion", description: "Metrics upload", criticality: "critical" },
      { name: "Artifact storage", description: "Large files", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Runs not syncing",
        scope: "partial",
        signal: "The SDK reports network errors and runs lag in the UI",
        quickCheck: "Check W&B's status page; the SDK buffers and 'wandb sync' catches up",
      },
      {
        pattern: "Artifact uploads failing",
        scope: "local",
        signal: "Large uploads error while metrics log",
        quickCheck: "Retry; check size limits and network",
      },
      {
        pattern: "UI slow or erroring",
        scope: "global",
        signal: "Dashboards fail for everyone",
        quickCheck: "Check the status page; logging continues in the background",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "W&B is down",
        alternative: "MLflow, Comet ML or Neptune.ai (monitored on DownForAI) cover experiment tracking; Langfuse covers LLM tracing",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "W&B publishes its own status page; DownForAI probes wandb.ai only.",
    ],
  },
  whylabs: {
    slug: "whylabs",
    providerSummary:
      "WhyLabs provides AI observability (data and model monitoring, LLM security with LangKit) built on the open-source whylogs profiler, hosted with SDK uploads. Profiles are computed locally, so incidents mainly affect uploads and dashboards.",
    docsUrl: "https://docs.whylabs.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "WhyLabs platform", description: "Dashboards and API", criticality: "critical" },
      { name: "Profile ingestion", description: "whylogs uploads", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Profiles not appearing",
        scope: "partial",
        signal: "Uploads succeed but dashboards do not update",
        quickCheck: "Wait; ingestion batches profiles",
      },
      {
        pattern: "Upload authentication errors",
        scope: "local",
        signal: "The SDK is rejected with 401",
        quickCheck: "Regenerate the API key",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "WhyLabs is down",
        alternative: "Evidently AI, Arize AI or Fiddler AI (monitored on DownForAI) cover model monitoring; whylogs profiles stay local",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
};
