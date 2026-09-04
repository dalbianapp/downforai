import type { TopServiceContent } from "@/content/top-services/types";

// LEGAL_AI — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start legal-ai-2.ts and register it in ./index.ts if it grows.
export const LEGAL_AI: Record<string, TopServiceContent> = {
  "robin-ai": {
    slug: "robin-ai",
    providerSummary:
      "Robin AI reviews and drafts contracts with AI, used mainly through a Microsoft Word add-in and a web app, with enterprise SSO. Because the work happens inside Word and on uploaded documents, incidents look like an add-in that will not load or reviews that never complete.",
    docsUrl: "https://www.robinai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Robin web app", description: "Document upload and review", criticality: "critical" },
      { name: "Word add-in", description: "In-document review and drafting", criticality: "critical" },
      { name: "Review pipeline", description: "AI analysis jobs", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Word add-in fails to load or sign in",
        scope: "local",
        signal: "The task pane stays blank or loops on SSO while the web app works",
        quickCheck: "Sign out of the add-in, restart Word and sign in again; if the web app also rejects SSO, the auth service is down",
      },
      {
        pattern: "Reviews queued or never completing",
        scope: "partial",
        signal: "Uploaded contracts stay 'in progress' well beyond the usual turnaround",
        quickCheck: "Upload a small test document; if it also stalls, the analysis pipeline is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Robin AI is unavailable",
        alternative: "Spellbook, Luminance or Ironclad (monitored on DownForAI) offer AI contract review",
        switchingCost: "high",
        note: "Playbooks and clause libraries are not portable",
      },
    ],
    ecosystemDependencies: ["Microsoft 365 / Word add-in platform", "Enterprise identity providers (SSO)"],
    operatorNotes: [
      "robinai.com blocks DownForAI's probes, so the technical signal is unreliable for this service; community reports are the primary indicator.",
    ],
  },
  "casetext-cocounsel": {
    slug: "casetext-cocounsel",
    providerSummary:
      "CoCounsel is the AI legal assistant born at Casetext and now sold by Thomson Reuters after the 2023 acquisition, built on OpenAI models; casetext.com refuses automated probes. Incidents are generation failures and Thomson Reuters platform outages rather than Casetext-specific ones.",
    docsUrl: "https://casetext.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "CoCounsel in Thomson Reuters", description: "Web app", criticality: "critical" },
      { name: "Legacy casetext.com", description: "Login and marketing", criticality: "medium" },
      { name: "Model backend", description: "OpenAI via Thomson Reuters", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Skills failing to run",
        scope: "partial",
        signal: "Document review or research tasks error for everyone",
        quickCheck: "Retry a small task; a universal failure is the model backend",
      },
      {
        pattern: "Legacy Casetext logins redirected",
        scope: "local",
        signal: "Old accounts land on Thomson Reuters sign-in",
        quickCheck: "Expected after the migration; use the Thomson Reuters credentials",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CoCounsel is down",
        alternative: "Harvey, vLex or Spellbook (monitored on DownForAI) cover legal research and drafting",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["OpenAI models", "Thomson Reuters platform"],
    operatorNotes: [
      "casetext.com returns 403 to automated requests, so DownForAI's probe reads as blocked rather than down.",
    ],
  },
  "do-not-pay": {
    slug: "do-not-pay",
    providerSummary:
      "DoNotPay is a consumer subscription app that automates disputes, cancellations and legal paperwork with AI. It is a single hosted web app; incidents are workflows failing to complete and subscription problems.",
    docsUrl: "https://donotpay.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "donotpay.com app", description: "Consumer workflows", criticality: "critical" },
      { name: "Automation backend", description: "Letters, filings, requests", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Workflows stuck at submission",
        scope: "partial",
        signal: "Tasks never complete for anyone",
        quickCheck: "Try a simple task; a universal stall is the backend",
      },
      {
        pattern: "Subscription or cancellation issues",
        scope: "local",
        signal: "Billing steps fail for your account",
        quickCheck: "Contact support; this is account-side, not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "DoNotPay is down",
        alternative: "ChatGPT or Claude (monitored on DownForAI) can draft the letters, which you then send yourself",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "eve-legal": {
    slug: "eve-legal",
    providerSummary:
      "Eve is an AI platform for plaintiff-side law firms (case evaluation, drafting, discovery) sold on firm contracts, relaying to frontier language models. Incidents are generation failures and document processing stalls seen by firms.",
    docsUrl: "https://www.eve.legal",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Eve app", description: "Case workspace", criticality: "critical" },
      { name: "Document processing and generation", description: "Model backend", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Document processing stuck",
        scope: "partial",
        signal: "Uploads stay processing for everyone",
        quickCheck: "Try a small document; a universal stall is the backend",
      },
      {
        pattern: "Generation failing",
        scope: "partial",
        signal: "Drafts error while cases load",
        quickCheck: "Retry later; the model layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Eve is down",
        alternative: "Harvey or CoCounsel (monitored on DownForAI) cover legal drafting and analysis",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "harvey-ai": {
    slug: "harvey-ai",
    providerSummary:
      "Harvey is an enterprise AI platform for law firms and legal departments (research, drafting, document review, workflows) built on OpenAI models, sold on contracts with SSO and dedicated tenants. Incidents show as tenant-wide generation failures or slow document processing.",
    docsUrl: "https://www.harvey.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Harvey app", description: "Assistant and workflows", criticality: "critical" },
      { name: "Model backend", description: "OpenAI models", criticality: "critical" },
      { name: "Document processing", description: "Vault uploads and review", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Responses failing or timing out",
        scope: "partial",
        signal: "Every query errors across the firm",
        quickCheck: "Retry a short query; a universal failure is the platform or its model provider",
      },
      {
        pattern: "Vault processing slow",
        scope: "partial",
        signal: "Large uploads stay indexing for hours",
        quickCheck: "Small uploads that complete point to a backlog rather than an outage",
      },
      {
        pattern: "SSO login failing",
        scope: "local",
        signal: "Users loop back to the identity provider",
        quickCheck: "Check the firm's identity provider first",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Harvey is down",
        alternative: "CoCounsel, vLex or Spellbook (monitored on DownForAI) cover research and drafting",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["OpenAI models", "Customer identity providers"],
    operatorNotes: [],
  },
  "ironclad-ai": {
    slug: "ironclad-ai",
    providerSummary:
      "Ironclad is a contract lifecycle management platform (Workflow Designer, repository, e-signature, AI Assist for review) sold to enterprise legal teams, integrated with Salesforce and other systems. Incidents are workflows not advancing, signatures failing and AI review errors.",
    docsUrl: "https://support.ironcladapp.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Ironclad app", description: "Workflows and repository", criticality: "critical" },
      { name: "Signature", description: "Ironclad and DocuSign signing", criticality: "critical" },
      { name: "AI Assist", description: "Contract review generation", criticality: "high" },
      { name: "Integrations", description: "Salesforce, Slack, storage", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Workflows stuck at a step",
        scope: "partial",
        signal: "Approvals or generation steps do not advance for anyone",
        quickCheck: "Check a simple workflow; a universal stall is the platform",
      },
      {
        pattern: "Signature emails not arriving",
        scope: "partial",
        signal: "Signers receive nothing",
        quickCheck: "Check spam first; if every signer is affected, the signature service is degraded",
      },
      {
        pattern: "AI Assist failing while workflows run",
        scope: "partial",
        signal: "Review suggestions error",
        quickCheck: "The AI layer relies on a third-party model provider and fails independently",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Ironclad is down",
        alternative: "Juro or Robin AI (monitored on DownForAI) cover contract workflows and review",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["DocuSign", "Salesforce", "Third-party language-model providers"],
    operatorNotes: [
      "support.ironcladapp.com refuses automated requests (403) but is Ironclad's help centre.",
    ],
  },
  "juro-ai": {
    slug: "juro-ai",
    providerSummary:
      "Juro is a browser-native contract platform (templates, approvals, e-signature, AI assistant) for in-house legal teams, integrated with Salesforce and HubSpot. Incidents are contracts failing to load, signatures not completing and AI drafting errors.",
    docsUrl: "https://juro.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Juro app", description: "Editor and repository", criticality: "critical" },
      { name: "E-signature", description: "Signing links", criticality: "critical" },
      { name: "AI assistant", description: "Drafting and review", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Contracts not loading",
        scope: "partial",
        signal: "The editor errors for everyone",
        quickCheck: "Open a simple contract; a universal failure is the platform",
      },
      {
        pattern: "AI assistant failing while the editor works",
        scope: "partial",
        signal: "Drafting or summaries error",
        quickCheck: "The AI layer relies on a third-party model provider",
      },
      {
        pattern: "CRM sync stale",
        scope: "local",
        signal: "Salesforce or HubSpot records do not update",
        quickCheck: "Check the integration's connection in settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Juro is down",
        alternative: "Ironclad or Spellbook (monitored on DownForAI) cover contract drafting and workflows",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Salesforce / HubSpot", "Third-party language-model providers"],
    operatorNotes: [
      "help.juro.com was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  "luminance-ai": {
    slug: "luminance-ai",
    providerSummary:
      "Luminance is an AI platform for contract review, negotiation and due diligence sold to enterprises and law firms, with its own legal models, a Word add-in and a hosted or on-premise deployment. Incidents are document processing stalls and add-in failures.",
    docsUrl: "https://www.luminance.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Luminance platform", description: "Review and diligence workspace", criticality: "critical" },
      { name: "Document processing", description: "Ingestion and analysis", criticality: "critical" },
      { name: "Word add-in", description: "In-document negotiation", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Document processing stuck",
        scope: "partial",
        signal: "Uploaded data rooms stay analysing",
        quickCheck: "Try a small upload; a universal stall is the backend, big rooms take hours by design",
      },
      {
        pattern: "Word add-in not loading",
        scope: "local",
        signal: "The pane stays blank in Word",
        quickCheck: "Office add-in runtime problems; restart Word and check the add-in version",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Luminance is down",
        alternative: "Robin AI or Harvey (monitored on DownForAI) cover contract review",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Microsoft Word"],
    operatorNotes: [],
  },
  "spellbook-ai": {
    slug: "spellbook-ai",
    providerSummary:
      "Spellbook drafts and reviews contracts inside Microsoft Word as an add-in backed by frontier language models, on firm subscriptions; spellbook.legal now redirects to spellbook.com. Incidents show as the add-in failing to load or generations erroring in Word.",
    docsUrl: "https://help.spellbook.legal",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Spellbook Word add-in", description: "Client", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations failing in Word",
        scope: "partial",
        signal: "Every review or draft errors",
        quickCheck: "Retry a short request; a universal failure is the backend or its model provider",
      },
      {
        pattern: "Add-in pane blank or sign-in loop",
        scope: "local",
        signal: "Spellbook does not load for one user",
        quickCheck: "Office add-in cache issues; clear the Office cache and sign in again",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Spellbook is down",
        alternative: "Harvey, CoCounsel or Robin AI (monitored on DownForAI) cover contract drafting and review",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Microsoft Word / Office add-in runtime", "Third-party language-model providers"],
    operatorNotes: [
      "spellbook.legal redirects to spellbook.com; DownForAI's probe follows the redirect.",
    ],
  },
  "vlex-ai": {
    slug: "vlex-ai",
    providerSummary:
      "vLex is a global legal research platform with the Vincent AI assistant over case law and legislation from many jurisdictions, sold to firms and institutions. Incidents are search failing, Vincent generations erroring and institutional access (IP or SSO) breaking.",
    docsUrl: "https://support.vlex.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "vlex.com platform", description: "Research", criticality: "critical" },
      { name: "Vincent AI", description: "Assistant", criticality: "high" },
      { name: "Institutional access", description: "IP and SSO authentication", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Search failing",
        scope: "partial",
        signal: "Queries error or return nothing for everyone",
        quickCheck: "Try a simple citation lookup; a universal failure is the platform",
      },
      {
        pattern: "Vincent failing while search works",
        scope: "partial",
        signal: "AI answers error; documents open",
        quickCheck: "The AI layer is separate; use classic search meanwhile",
      },
      {
        pattern: "Institutional access lost",
        scope: "local",
        signal: "Users are prompted to subscribe",
        quickCheck: "Check the institution's IP range or SSO configuration",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "vLex is down",
        alternative: "CoCounsel or Harvey (monitored on DownForAI) cover legal research",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
};
