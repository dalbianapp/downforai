import type { TopServiceContent } from "@/content/top-services/types";

// SUPPORT — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start support-2.ts and register it in ./index.ts if it grows.
export const SUPPORT: Record<string, TopServiceContent> = {
  "gong-io": {
    slug: "gong-io",
    providerSummary:
      "Gong is a revenue-intelligence platform that records and transcribes sales calls from Zoom, Teams, Google Meet and dialers, then analyses them and syncs insights to the CRM. Its incidents are usually about calls not being captured or processed rather than the web app being unreachable.",
    officialStatusUrl: "https://status.gong.io/",
    docsUrl: "https://help.gong.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.gong.io", description: "Web application", criticality: "critical" },
      { name: "Call capture and transcription", description: "Recording pipeline from conferencing tools", criticality: "critical" },
      { name: "CRM sync", description: "Salesforce / HubSpot integration", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Calls missing or not recorded",
        scope: "partial",
        signal: "Meetings happened but never appear in Gong, or the recorder did not join",
        quickCheck: "Check status.gong.io for a capture incident and confirm the calendar/conferencing integration is still connected",
      },
      {
        pattern: "Transcripts and analysis delayed",
        scope: "partial",
        signal: "Calls appear but stay 'processing' for hours",
        quickCheck: "Wait — processing backlogs clear on their own; escalate only if calls from the previous day are still unprocessed",
      },
      {
        pattern: "CRM data out of date",
        scope: "partial",
        signal: "Deals or activities in Gong do not match Salesforce/HubSpot",
        quickCheck: "Check the integration page for sync errors; a stalled sync is separate from the app being up",
      },
      {
        pattern: "SSO login failing",
        scope: "local",
        signal: "The identity provider redirect completes but Gong shows an error",
        quickCheck: "Have an admin verify the SSO configuration; if all users are affected, check status.gong.io",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gong capture is down during important calls",
        alternative: "Read.ai or Sybill (monitored on DownForAI) can transcribe meetings in the meantime; record natively in the conferencing tool and upload later",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Zoom / Microsoft Teams / Google Meet APIs", "Salesforce / HubSpot"],
    operatorNotes: [],
  },
  "ada-support": {
    slug: "ada-support",
    providerSummary:
      "Ada is an AI customer-service automation platform whose agents resolve conversations across chat, email and voice, deployed per customer with integrations into helpdesks. Incidents show up as the customer-facing bot going silent or handoffs failing; ada.cx blocks direct probes.",
    docsUrl: "https://docs.ada.cx",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Ada AI agents (customer-facing)", description: "Chat, email, voice", criticality: "critical" },
      { name: "Ada dashboard", description: "Configuration", criticality: "medium" },
      { name: "Helpdesk integrations", description: "Handoffs and ticket creation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Bot not responding to customers",
        scope: "global",
        signal: "The web chat or messaging bot stays silent for every visitor",
        quickCheck: "Check Ada's status page and the dashboard; enable a fallback contact form",
      },
      {
        pattern: "Handoffs to agents failing",
        scope: "partial",
        signal: "Conversations do not reach the helpdesk",
        quickCheck: "Check the helpdesk integration's status and credentials",
      },
      {
        pattern: "Generative replies degraded",
        scope: "partial",
        signal: "The bot falls back to scripted answers",
        quickCheck: "The model layer is separate; check announcements",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Ada is down",
        alternative: "Intercom Fin, Zendesk AI or Decagon (monitored on DownForAI) run comparable AI agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Helpdesk and messaging platforms", "Model providers"],
    operatorNotes: [
      "ada.cx refuses automated requests (403); the technical signal is unreliable for this service.",
    ],
  },
  aisera: {
    slug: "aisera",
    providerSummary:
      "Aisera provides generative AI agents for IT, HR and customer service, integrated with ServiceNow, Zendesk, Slack and Teams under enterprise contracts. Incidents are seen by tenants as agents not resolving requests or integrations lagging.",
    docsUrl: "https://aisera.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Aisera agents (per tenant)", description: "Chat and ticket automation", criticality: "critical" },
      { name: "Integrations", description: "ServiceNow, Zendesk, Slack, Teams", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent not answering in Slack or Teams",
        scope: "partial",
        signal: "Requests get no reply while the admin console loads",
        quickCheck: "Check the messaging platform's status and the app installation",
      },
      {
        pattern: "Ticket automation stalled",
        scope: "partial",
        signal: "Tickets are no longer classified or resolved automatically",
        quickCheck: "Check the ITSM integration's connection",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Aisera is down",
        alternative: "Kore.ai or Yellow.ai (monitored on DownForAI) offer enterprise service agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["ServiceNow, Zendesk, Slack, Teams APIs", "Model providers"],
    operatorNotes: [],
  },
  asapp: {
    slug: "asapp",
    providerSummary:
      "ASAPP provides AI for contact centres (generative agent, agent assist, auto-summaries) integrated with telephony and CRM systems under enterprise contracts. Incidents affect live agent tooling and customer-facing automation for its tenants.",
    docsUrl: "https://www.asapp.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ASAPP platform (per tenant)", description: "Agent desk and automation", criticality: "critical" },
      { name: "Telephony / CRM integrations", description: "Contact-centre systems", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent assist suggestions stop",
        scope: "partial",
        signal: "Live agents see no AI suggestions while calls proceed",
        quickCheck: "Agents keep working manually; contact the ASAPP support channel",
      },
      {
        pattern: "Auto-summaries missing",
        scope: "partial",
        signal: "Call summaries do not appear after interactions",
        quickCheck: "Wait; summarisation queues asynchronously",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ASAPP is unavailable",
        alternative: "Cresta or Talkdesk AI (monitored on DownForAI) provide contact-centre AI",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Contact-centre telephony", "CRM systems"],
    operatorNotes: [],
  },
  chatbase: {
    slug: "chatbase",
    providerSummary:
      "Chatbase builds custom AI support agents trained on a business's content, deployed as website widgets and integrations, on credit-based plans. Its incidents are widgets not answering visitors and model-relay errors.",
    docsUrl: "https://www.chatbase.co/docs",
    pricingUrl: "https://www.chatbase.co/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Chatbase widget and API", description: "Customer-facing agents", criticality: "critical" },
      { name: "Dashboard", description: "Agent configuration and training", criticality: "medium" },
      { name: "Model providers", description: "Behind the agents", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Widget not answering visitors",
        scope: "global",
        signal: "Embedded chat returns errors on every site",
        quickCheck: "Check Chatbase's status page; switch the agent's model if the failure is provider-specific",
      },
      {
        pattern: "Message credits exhausted",
        scope: "local",
        signal: "The agent refuses with a limit message for your account",
        quickCheck: "Check the plan's credits",
      },
      {
        pattern: "Training on new sources stuck",
        scope: "partial",
        signal: "Source crawls never finish",
        quickCheck: "Retry a small source; a universal stall is the ingestion backend",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Chatbase is down",
        alternative: "Dante AI, Tidio AI or Botpress (monitored on DownForAI) host comparable website agents",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [],
  },
  conversica: {
    slug: "conversica",
    providerSummary:
      "Conversica runs AI 'digital assistants' that hold email and SMS conversations with leads and customers for sales and marketing teams, integrated with CRMs. Incidents mean assistants stop sending or replying.",
    docsUrl: "https://www.conversica.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Conversica assistants", description: "Email and SMS conversations", criticality: "critical" },
      { name: "CRM integrations", description: "Salesforce, HubSpot and others", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Assistants not sending or replying",
        scope: "partial",
        signal: "Lead conversations stall across campaigns",
        quickCheck: "Check the dashboard's send logs and email deliverability",
      },
      {
        pattern: "CRM sync failing",
        scope: "local",
        signal: "Lead statuses do not update in the CRM",
        quickCheck: "Re-authorise the CRM integration",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Conversica is down",
        alternative: "Drift AI or Lindy.ai (monitored on DownForAI) automate lead conversations",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Email and SMS delivery", "CRM systems"],
    operatorNotes: [],
  },
  cresta: {
    slug: "cresta",
    providerSummary:
      "Cresta provides real-time agent assist, coaching and AI agents for contact centres, integrated with telephony and chat platforms under enterprise contracts. Incidents affect live agent guidance and automation for its tenants.",
    docsUrl: "https://cresta.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Cresta platform (per tenant)", description: "Agent assist and AI agents", criticality: "critical" },
      { name: "Telephony / chat integrations", description: "Contact-centre systems", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Real-time suggestions stop",
        scope: "partial",
        signal: "Agents see no guidance during calls",
        quickCheck: "Agents keep working; contact the Cresta support channel",
      },
      {
        pattern: "Transcription lagging",
        scope: "partial",
        signal: "Live transcripts arrive late or stop",
        quickCheck: "Check the telephony integration's audio streaming",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Cresta is unavailable",
        alternative: "ASAPP or Talkdesk AI (monitored on DownForAI) provide contact-centre AI",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Contact-centre telephony"],
    operatorNotes: [],
  },
  "dante-ai": {
    slug: "dante-ai",
    providerSummary:
      "Dante AI is a no-code builder for website chatbots trained on your content, with voice agents, on credit-based plans. Its incidents are widgets not answering and training stuck; the site blocks direct probes.",
    docsUrl: "https://www.dante-ai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Dante widgets", description: "Customer-facing chat", criticality: "critical" },
      { name: "Dashboard and training", description: "Configuration", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Widget not answering",
        scope: "global",
        signal: "Embedded chat errors on every site",
        quickCheck: "Check announcements; switch the model if the failure is provider-specific",
      },
      {
        pattern: "Message credits exhausted",
        scope: "local",
        signal: "The bot refuses with a limit message for your account",
        quickCheck: "Check the plan's credits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dante AI is down",
        alternative: "Chatbase or Tidio AI (monitored on DownForAI) host comparable website chatbots",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Model providers"],
    operatorNotes: [
      "dante-ai.com refuses automated requests (403); the technical signal is unreliable for this service.",
    ],
  },
  decagon: {
    slug: "decagon",
    providerSummary:
      "Decagon deploys AI customer-support agents that resolve tickets across chat, email and voice using company knowledge and integrations, for enterprise customers. Incidents show up as customer-facing agents failing or escalations not reaching humans.",
    docsUrl: "https://decagon.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Decagon agents (per tenant)", description: "Customer-facing automation", criticality: "critical" },
      { name: "Integrations", description: "Helpdesk, CRM, order systems", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent not responding to customers",
        scope: "global",
        signal: "Chat or email replies stop for every customer",
        quickCheck: "Enable the human fallback; contact Decagon's support channel",
      },
      {
        pattern: "Escalations not reaching agents",
        scope: "partial",
        signal: "Handoffs fail to create tickets",
        quickCheck: "Check the helpdesk integration",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Decagon is down",
        alternative: "Sierra, Intercom Fin or Ada Support (monitored on DownForAI) run comparable AI agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Helpdesk and CRM systems", "Model providers"],
    operatorNotes: [],
  },
  "drift-ai": {
    slug: "drift-ai",
    providerSummary:
      "Drift is a conversational marketing and sales platform (website chat, AI chatbots, meeting booking), acquired by Salesloft in 2024. Its incidents mean website chat widgets stop engaging visitors or routing to reps.",
    docsUrl: "https://www.drift.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Drift widget", description: "Website chat", criticality: "critical" },
      { name: "Drift app", description: "Inbox and playbooks", criticality: "high" },
      { name: "Calendar / CRM integrations", description: "Booking and routing", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Widget not loading on sites",
        scope: "global",
        signal: "Chat is missing or errors for all visitors",
        quickCheck: "Check Drift's status page; nothing to fix on the site",
      },
      {
        pattern: "Meetings not booking",
        scope: "local",
        signal: "The calendar step fails in playbooks",
        quickCheck: "Reconnect the rep's calendar",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Drift is down",
        alternative: "HubSpot AI, Intercom Fin or Tidio AI (monitored on DownForAI) offer website chat with AI",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Salesloft platform", "Calendar and CRM systems"],
    operatorNotes: [],
  },
  forethought: {
    slug: "forethought",
    providerSummary:
      "Forethought provides AI for customer support: an autonomous agent, ticket triage and agent assist, integrated with Zendesk, Salesforce and other helpdesks for enterprise customers. Incidents are automation stalling and the agent failing to answer.",
    docsUrl: "https://forethought.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Forethought agent and triage", description: "Customer-facing and internal automation", criticality: "critical" },
      { name: "Helpdesk integrations", description: "Zendesk, Salesforce and others", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Ticket triage stalled",
        scope: "partial",
        signal: "New tickets are no longer tagged or routed",
        quickCheck: "Check the helpdesk integration's connection",
      },
      {
        pattern: "Agent not answering customers",
        scope: "global",
        signal: "The chat agent errors for all visitors",
        quickCheck: "Enable the human fallback; contact support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Forethought is down",
        alternative: "Zendesk AI, Ada Support or Decagon (monitored on DownForAI) automate support",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Helpdesk platforms", "Model providers"],
    operatorNotes: [],
  },
  "freshdesk-ai": {
    slug: "freshdesk-ai",
    providerSummary:
      "Freshdesk's AI features (Freddy AI agent, copilot, insights) run inside Freshworks' helpdesk platform per data centre. Incidents affect the helpdesk itself and its AI features, and are published on Freshworks' status page.",
    officialStatusUrl: "https://status.freshworks.com/",
    docsUrl: "https://support.freshdesk.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Freshdesk (per data centre)", description: "Helpdesk", criticality: "critical" },
      { name: "Freddy AI", description: "Agent and copilot", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Freddy AI replies failing while tickets work",
        scope: "partial",
        signal: "AI agent or copilot errors; ticketing works",
        quickCheck: "Check status.freshworks.com for an AI component incident",
      },
      {
        pattern: "Helpdesk degraded in a data centre",
        scope: "partial",
        signal: "Tickets load slowly for accounts in one region",
        quickCheck: "Check the status page for your data centre",
      },
      {
        pattern: "AI sessions quota exhausted",
        scope: "local",
        signal: "Freddy refuses with a usage message for your account",
        quickCheck: "Check the plan's AI session allowance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Freshdesk AI is unavailable",
        alternative: "Zendesk AI, HubSpot AI or Kustomer AI (monitored on DownForAI) offer AI inside helpdesks",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Freshworks platform", "Model providers"],
    operatorNotes: [],
  },
  "gladly-hero": {
    slug: "gladly-hero",
    providerSummary:
      "Gladly is a customer-service platform combining human agents and its AI agent (Sidekick), organised around customer profiles; gladly.com redirects to gladly.ai. Incidents affect agent desks and customer-facing channels for its tenants.",
    docsUrl: "https://help.gladly.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Gladly agent desk", description: "Human agents", criticality: "critical" },
      { name: "Sidekick AI", description: "Customer-facing automation", criticality: "high" },
      { name: "Channels", description: "Chat, email, voice, SMS", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Channel not delivering conversations",
        scope: "partial",
        signal: "Chats or emails stop arriving in the desk",
        quickCheck: "Check Gladly's status page for the channel component",
      },
      {
        pattern: "Sidekick not answering",
        scope: "partial",
        signal: "AI replies stop while agents can work",
        quickCheck: "Route to humans; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gladly is down",
        alternative: "Kustomer AI or Zendesk AI (monitored on DownForAI) offer comparable customer-service platforms",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Messaging and telephony channels"],
    operatorNotes: [
      "gladly.com redirects to gladly.ai; DownForAI's probe follows the redirect.",
    ],
  },
  haptik: {
    slug: "haptik",
    providerSummary:
      "Haptik (Jio Platforms) builds conversational AI for commerce and support on WhatsApp, web and voice, mainly for enterprises in India. Incidents are bots not answering on messaging channels for its tenants.",
    docsUrl: "https://www.haptik.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Haptik bots (per tenant)", description: "WhatsApp, web, voice", criticality: "critical" },
      { name: "Messaging channel integrations", description: "WhatsApp Business API and others", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "WhatsApp bot not responding",
        scope: "partial",
        signal: "Messages go unanswered on WhatsApp while the web bot works",
        quickCheck: "Check the WhatsApp Business API's status and the number's health",
      },
      {
        pattern: "Bot answers degraded",
        scope: "partial",
        signal: "Generative replies fall back to menus",
        quickCheck: "The model layer is separate; contact support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Haptik is down",
        alternative: "Yellow.ai or Kore.ai (monitored on DownForAI) offer comparable enterprise bots",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["WhatsApp Business API", "Model providers"],
    operatorNotes: [],
  },
  "hubspot-ai": {
    slug: "hubspot-ai",
    providerSummary:
      "HubSpot's AI (Breeze agents, copilot, content and prospecting tools) runs inside the HubSpot CRM platform, whose incidents are published on HubSpot's status page. AI features can fail while the CRM keeps working.",
    officialStatusUrl: "https://status.hubspot.com/",
    docsUrl: "https://knowledge.hubspot.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "HubSpot CRM platform", description: "Hubs", criticality: "critical" },
      { name: "Breeze AI", description: "Agents and copilot", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI features failing while the CRM works",
        scope: "partial",
        signal: "Copilot or Breeze agents error; contacts and deals load",
        quickCheck: "Check status.hubspot.com for an AI component incident",
      },
      {
        pattern: "Platform-wide incident",
        scope: "global",
        signal: "Hubs slow or down; the status page lists it",
        quickCheck: "Check the status page; nothing to fix locally",
      },
      {
        pattern: "AI credits exhausted",
        scope: "local",
        signal: "Breeze features refused with a credit message for your portal",
        quickCheck: "Check the portal's credit usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "HubSpot AI is unavailable",
        alternative: "Salesforce Einstein or Zendesk AI (monitored on DownForAI) offer AI inside CRM and support",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["HubSpot platform", "Model providers"],
    operatorNotes: [],
  },
  "intercom-fin": {
    slug: "intercom-fin",
    providerSummary:
      "Fin is Intercom's AI customer-service agent (now marketed at fin.ai) that resolves conversations across chat, email and voice, billed per resolution. It runs on Intercom's platform but has its own status page.",
    officialStatusUrl: "https://www.finstatus.com",
    docsUrl: "https://www.intercom.com/help",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Fin AI agent", description: "Customer-facing resolution", criticality: "critical" },
      { name: "Intercom platform", description: "Inbox and messenger", criticality: "critical" },
      { name: "Content sources", description: "Help centre and integrations", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Fin not answering while the messenger works",
        scope: "partial",
        signal: "Conversations reach the inbox but Fin gives no reply; finstatus.com lists an incident",
        quickCheck: "Check the status page; route to human agents meanwhile",
      },
      {
        pattern: "Fin answering from stale content",
        scope: "local",
        signal: "Answers ignore recently updated articles",
        quickCheck: "Check the content source's sync status",
      },
      {
        pattern: "Intercom-wide incident",
        scope: "global",
        signal: "The messenger or inbox is down; Fin fails with it",
        quickCheck: "Check Intercom's status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fin is unavailable",
        alternative: "Zendesk AI, Ada Support or Decagon (monitored on DownForAI) run comparable AI agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Intercom platform", "Model providers"],
    operatorNotes: [],
  },
  "kore-ai": {
    slug: "kore-ai",
    providerSummary:
      "Kore.ai is an enterprise platform for building conversational and agentic AI assistants (XO Platform, AI for Work, AI for Service), deployed in Kore's cloud or the customer's environment. Incidents affect tenants' bots across channels.",
    docsUrl: "https://docs.kore.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Kore.ai platform (per tenant)", description: "Bot runtime and builder", criticality: "critical" },
      { name: "Channel integrations", description: "Web, messaging, voice", criticality: "high" },
      { name: "Model providers", description: "Behind generative features", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Bots not responding on a channel",
        scope: "partial",
        signal: "One channel goes silent while others work",
        quickCheck: "Check the channel's integration status",
      },
      {
        pattern: "Generative answers failing",
        scope: "partial",
        signal: "LLM-backed responses error while scripted dialogs run",
        quickCheck: "Check the configured model provider's status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kore.ai is unavailable",
        alternative: "Yellow.ai, Aisera or Botpress (monitored on DownForAI) offer enterprise bot platforms",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Messaging and voice channels", "Model providers"],
    operatorNotes: [],
  },
  "kustomer-ai": {
    slug: "kustomer-ai",
    providerSummary:
      "Kustomer is a customer-service CRM with AI agents and agent assist, used by e-commerce and consumer brands. Incidents affect agent desks, customer channels and the AI features for its tenants.",
    docsUrl: "https://help.kustomer.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Kustomer platform", description: "Agent desk and timeline", criticality: "critical" },
      { name: "Channels", description: "Chat, email, SMS, social", criticality: "critical" },
      { name: "AI agents / assist", description: "Automation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Platform slow or down",
        scope: "global",
        signal: "Agents cannot load conversations; Kustomer's status page lists an incident",
        quickCheck: "Check the status page",
      },
      {
        pattern: "AI agent not answering while agents work",
        scope: "partial",
        signal: "Automated replies stop; the desk works",
        quickCheck: "Route to humans; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kustomer is down",
        alternative: "Gladly Hero, Zendesk AI or Freshdesk AI (monitored on DownForAI) are comparable platforms",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Messaging channels"],
    operatorNotes: [
      "Kustomer publishes its own status page; DownForAI probes kustomer.com only.",
    ],
  },
  liveperson: {
    slug: "liveperson",
    providerSummary:
      "LivePerson's Conversational Cloud powers messaging and AI agents for large enterprises across web, SMS and social channels. Incidents affect customer-facing messaging and agent desks for its tenants and are published on LivePerson's status page.",
    docsUrl: "https://www.liveperson.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Conversational Cloud", description: "Messaging platform", criticality: "critical" },
      { name: "AI agents / bots", description: "Automation", criticality: "high" },
      { name: "Channel integrations", description: "Web, SMS, WhatsApp, social", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Messaging unavailable for a region",
        scope: "partial",
        signal: "Web messaging fails to load for customers in one region",
        quickCheck: "Check LivePerson's status page for the region",
      },
      {
        pattern: "Bots not responding while agents can",
        scope: "partial",
        signal: "Automated conversations stall",
        quickCheck: "Route to humans; the bot layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LivePerson is down",
        alternative: "Kore.ai or Zendesk AI (monitored on DownForAI) offer enterprise messaging with AI",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Messaging channels"],
    operatorNotes: [
      "LivePerson publishes its own status page; DownForAI probes liveperson.com only.",
    ],
  },
  "maven-agi": {
    slug: "maven-agi",
    providerSummary:
      "Maven AGI provides AI customer-support agents that resolve complex inquiries across channels using company knowledge and actions, for enterprise customers. Incidents are agents failing to answer or escalate for its tenants.",
    docsUrl: "https://www.mavenagi.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Maven agents (per tenant)", description: "Customer-facing automation", criticality: "critical" },
      { name: "Knowledge and action integrations", description: "Helpdesk, CRM, APIs", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent not responding",
        scope: "global",
        signal: "Customer conversations get no reply",
        quickCheck: "Enable the human fallback; contact support",
      },
      {
        pattern: "Actions failing",
        scope: "local",
        signal: "The agent answers but cannot execute integrations (orders, refunds)",
        quickCheck: "Check the integration's credentials",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Maven AGI is down",
        alternative: "Decagon, Sierra or Intercom Fin (monitored on DownForAI) run comparable AI agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Helpdesk and CRM systems", "Model providers"],
    operatorNotes: [],
  },
  mendable: {
    slug: "mendable",
    providerSummary:
      "Mendable offered AI chat and search over developer documentation, embedded in docs sites; its team shifted focus to Firecrawl and the product has been wound down for new customers. Existing embeds should be considered legacy.",
    docsUrl: "https://www.mendable.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Mendable API and widget", description: "Docs chat", criticality: "critical" },
      { name: "mendable.ai", description: "Website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Docs chat widget not answering",
        scope: "global",
        signal: "Embedded chat errors on documentation sites",
        quickCheck: "Treat as legacy; migrate the docs assistant",
      },
      {
        pattern: "Index no longer refreshing",
        scope: "local",
        signal: "Answers ignore recent documentation",
        quickCheck: "Re-index if the dashboard still allows; otherwise migrate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Mendable",
        alternative: "Mintlify or Chatbase (monitored on DownForAI) provide AI chat over documentation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The Mendable team now focuses on Firecrawl; consider marking this service inactive if the widget stops.",
    ],
  },
  netomi: {
    slug: "netomi",
    providerSummary:
      "Netomi automates customer service across email, chat, voice and social with AI agents integrated into helpdesks, for enterprise customers. Incidents are automation stalling and agents failing to reply for its tenants.",
    docsUrl: "https://www.netomi.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Netomi agents (per tenant)", description: "Customer-facing automation", criticality: "critical" },
      { name: "Helpdesk integrations", description: "Zendesk, Salesforce and others", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Email automation stalled",
        scope: "partial",
        signal: "Tickets are no longer answered automatically",
        quickCheck: "Check the helpdesk integration",
      },
      {
        pattern: "Chat agent not responding",
        scope: "global",
        signal: "Web chat errors for all visitors",
        quickCheck: "Enable the human fallback; contact support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Netomi is down",
        alternative: "Ada Support, Forethought or Zendesk AI (monitored on DownForAI) automate support",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Helpdesk platforms", "Model providers"],
    operatorNotes: [],
  },
  parloa: {
    slug: "parloa",
    providerSummary:
      "Parloa is an AI contact-centre platform (phone and chat agents) for enterprises, integrated with telephony and CRM systems. Incidents mean customer calls not being answered by the AI or handoffs failing for its tenants.",
    docsUrl: "https://www.parloa.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Parloa agents (per tenant)", description: "Phone and chat automation", criticality: "critical" },
      { name: "Telephony integrations", description: "Carrier and contact-centre systems", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Calls not answered by the AI",
        scope: "partial",
        signal: "Inbound calls ring out or drop before the agent speaks",
        quickCheck: "Check the telephony integration; route calls to humans meanwhile",
      },
      {
        pattern: "High latency in conversations",
        scope: "partial",
        signal: "Long pauses before replies",
        quickCheck: "Contact support; the voice pipeline is saturated",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Parloa is down",
        alternative: "PolyAI, Talkdesk AI or Vapi (monitored on DownForAI) provide voice agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Telephony carriers", "Model and speech providers"],
    operatorNotes: [],
  },
  "polyai-voice": {
    slug: "polyai-voice",
    providerSummary:
      "PolyAI builds conversational voice assistants for enterprise call centres (hospitality, retail, banking), deployed per customer with telephony integrations. Incidents mean calls not being answered or the assistant misunderstanding at scale for its tenants.",
    docsUrl: "https://poly.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "PolyAI voice assistants (per tenant)", description: "Inbound call handling", criticality: "critical" },
      { name: "Telephony integrations", description: "Carriers and contact centres", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Calls not reaching the assistant",
        scope: "partial",
        signal: "Inbound calls fail or drop before the greeting",
        quickCheck: "Check the telephony route; fail over to human agents",
      },
      {
        pattern: "Recognition degraded",
        scope: "partial",
        signal: "The assistant misunderstands far more than usual",
        quickCheck: "Contact PolyAI support; speech services are separate from telephony",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "PolyAI is down",
        alternative: "Parloa, Talkdesk AI or Bland AI (monitored on DownForAI) provide voice automation",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Telephony carriers", "Speech providers"],
    operatorNotes: [
      "The poly.ai domain is shared with the Poly.AI character-chat app tracked under Roleplay; this entry is the enterprise product.",
    ],
  },
  "read-ai": {
    slug: "read-ai",
    providerSummary:
      "Read AI is a meeting copilot (summaries, transcripts, engagement analytics) with a notetaker bot for Zoom, Meet and Teams plus email and messaging integrations, on freemium plans. Incidents are bots not joining and summaries missing.",
    docsUrl: "https://support.read.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Read notetaker", description: "Joins and records calls", criticality: "critical" },
      { name: "Processing backend", description: "Summaries and analytics", criticality: "critical" },
      { name: "Integrations", description: "Email, Slack, CRM", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notetaker not joining",
        scope: "partial",
        signal: "The bot misses scheduled calls across users",
        quickCheck: "Check the calendar connection; a widespread no-show is the recording service",
      },
      {
        pattern: "Summaries delayed",
        scope: "partial",
        signal: "Recordings exist but summaries take hours",
        quickCheck: "Wait; processing queues clear",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Read AI is down",
        alternative: "Fathom, Fireflies.ai or Otter.ai (monitored on DownForAI) record and summarise meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams"],
    operatorNotes: [
      "Categorised under Support in DownForAI's database although it is a meeting assistant.",
    ],
  },
  "salesforce-einstein": {
    slug: "salesforce-einstein",
    providerSummary:
      "Salesforce Einstein (now under the Agentforce umbrella) is the AI layer across Sales, Service and Marketing Cloud, running inside Salesforce's multi-tenant instances. Incidents are per instance and published on Salesforce's trust/status site; AI features can fail while the CRM works.",
    officialStatusUrl: "https://status.salesforce.com/",
    docsUrl: "https://help.salesforce.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Salesforce instances", description: "Core CRM", criticality: "critical" },
      { name: "Einstein / Agentforce", description: "AI features and agents", criticality: "high" },
      { name: "Einstein Trust Layer", description: "Model gateway", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI features failing while the CRM works",
        scope: "partial",
        signal: "Einstein generative features or agents error; records load",
        quickCheck: "Check status.salesforce.com for your instance's AI services",
      },
      {
        pattern: "Instance-level incident",
        scope: "partial",
        signal: "Your instance (for example EU45) is degraded; others are fine",
        quickCheck: "Find your instance on the status site",
      },
      {
        pattern: "Einstein requests quota exhausted",
        scope: "local",
        signal: "Generative features refused with a credit message for your org",
        quickCheck: "Check the org's Einstein requests usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Einstein is unavailable",
        alternative: "HubSpot AI or Zendesk AI (monitored on DownForAI) offer AI inside CRM and service tools",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Salesforce platform", "Model providers behind the Trust Layer"],
    operatorNotes: [],
  },
  "siena-ai": {
    slug: "siena-ai",
    providerSummary:
      "Siena is an AI customer-service agent for e-commerce brands, integrated with Shopify, Gorgias, Zendesk and messaging channels. Incidents mean customer conversations not being answered or order actions failing for its tenants.",
    docsUrl: "https://www.siena.cx",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Siena agents (per tenant)", description: "Customer-facing automation", criticality: "critical" },
      { name: "E-commerce and helpdesk integrations", description: "Shopify, Gorgias, Zendesk", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent not replying to customers",
        scope: "global",
        signal: "Tickets stop receiving automated answers",
        quickCheck: "Route to humans; contact support",
      },
      {
        pattern: "Order actions failing",
        scope: "local",
        signal: "The agent answers but cannot look up or modify orders",
        quickCheck: "Check the Shopify integration's credentials",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Siena is down",
        alternative: "Yuma AI or Decagon (monitored on DownForAI) automate e-commerce support",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Shopify, Gorgias, Zendesk APIs", "Model providers"],
    operatorNotes: [],
  },
  sierra: {
    slug: "sierra",
    providerSummary:
      "Sierra builds branded AI customer-service agents (chat and voice) for large consumer companies, deployed per customer with deep integrations. Incidents mean agents failing to respond or take actions for its tenants.",
    docsUrl: "https://sierra.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Sierra agents (per tenant)", description: "Chat and voice automation", criticality: "critical" },
      { name: "Integrations", description: "CRM, order and account systems", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Agent not responding",
        scope: "global",
        signal: "Customer chats or calls get no reply",
        quickCheck: "Enable the human fallback; contact Sierra's support channel",
      },
      {
        pattern: "Actions failing",
        scope: "local",
        signal: "The agent cannot execute account or order changes",
        quickCheck: "Check the integration's credentials",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sierra is down",
        alternative: "Decagon, Maven AGI or Intercom Fin (monitored on DownForAI) run comparable AI agents",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Customer systems", "Model providers"],
    operatorNotes: [],
  },
  sybill: {
    slug: "sybill",
    providerSummary:
      "Sybill is an AI sales assistant that records calls, writes summaries and updates the CRM automatically, with a notetaker for Zoom, Meet and Teams. Incidents are bots not joining and CRM updates not arriving; the site blocks direct probes.",
    docsUrl: "https://www.sybill.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Sybill notetaker", description: "Joins and records calls", criticality: "critical" },
      { name: "Processing backend", description: "Summaries and CRM updates", criticality: "critical" },
      { name: "CRM integrations", description: "Salesforce, HubSpot", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notetaker not joining",
        scope: "partial",
        signal: "The bot misses scheduled calls across users",
        quickCheck: "Check the calendar connection; a widespread no-show is the recording service",
      },
      {
        pattern: "CRM not updated after calls",
        scope: "local",
        signal: "Summaries exist but fields do not update",
        quickCheck: "Re-authorise the CRM integration",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sybill is down",
        alternative: "Gong.io, Avoma or Fathom (monitored on DownForAI) record and summarise sales calls",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams", "CRMs"],
    operatorNotes: [
      "sybill.ai refuses automated requests, so DownForAI checks robots.txt reachability only.",
    ],
  },
  "talkdesk-ai": {
    slug: "talkdesk-ai",
    providerSummary:
      "Talkdesk is a cloud contact-centre platform with AI agents, agent assist and analytics, serving voice and digital channels per region. Incidents affect live call handling for its tenants and are published on Talkdesk's status page.",
    officialStatusUrl: "https://status.talkdesk.com/",
    docsUrl: "https://support.talkdesk.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Talkdesk voice platform (regional)", description: "Call handling", criticality: "critical" },
      { name: "Digital channels", description: "Chat, email, SMS", criticality: "high" },
      { name: "AI features", description: "Agents, assist, analytics", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Calls failing in a region",
        scope: "partial",
        signal: "Inbound or outbound calls drop or fail to connect; status.talkdesk.com lists it",
        quickCheck: "Check the status page; use the failover routing if configured",
      },
      {
        pattern: "AI assist or agents failing while calls work",
        scope: "partial",
        signal: "Suggestions or virtual agents error; humans can take calls",
        quickCheck: "Route to humans; the AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Talkdesk is down",
        alternative: "Parloa, PolyAI or Cresta (monitored on DownForAI) provide contact-centre AI",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Telephony carriers"],
    operatorNotes: [],
  },
  "tidio-ai": {
    slug: "tidio-ai",
    providerSummary:
      "Tidio is a live-chat and helpdesk platform for small businesses with Lyro, its AI agent, deployed as website widgets and integrated with Shopify and others, on freemium plans. Incidents are widgets not loading and Lyro not answering.",
    docsUrl: "https://help.tidio.com",
    pricingUrl: "https://www.tidio.com/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Tidio widget", description: "Website chat", criticality: "critical" },
      { name: "Lyro AI agent", description: "Automation", criticality: "high" },
      { name: "Tidio panel", description: "Inbox", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Widget not loading on sites",
        scope: "global",
        signal: "Chat is missing for all visitors; Tidio's status page lists an incident",
        quickCheck: "Check the status page; nothing to fix on the site",
      },
      {
        pattern: "Lyro not answering while live chat works",
        scope: "partial",
        signal: "AI replies stop; human agents can chat",
        quickCheck: "Route to humans; the AI layer is separate",
      },
      {
        pattern: "Lyro conversation quota exhausted",
        scope: "local",
        signal: "Lyro stops with a limit message for your account",
        quickCheck: "Check the plan's Lyro conversations",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Tidio is down",
        alternative: "Chatbase, Dante AI or Intercom Fin (monitored on DownForAI) offer website chat with AI",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Shopify and other integrations", "Model providers"],
    operatorNotes: [
      "Tidio publishes its own status page; DownForAI probes tidio.com only.",
    ],
  },
  ultimate: {
    slug: "ultimate",
    providerSummary:
      "Ultimate was a conversational AI platform for support automation; it was acquired by Zendesk in 2024 and ultimate.ai now redirects to Zendesk's AI agents pages. Existing Ultimate bots have been migrated into Zendesk AI agents.",
    docsUrl: "https://www.ultimate.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ultimate.ai → zendesk.com", description: "Redirect", criticality: "low" },
      { name: "Zendesk AI agents", description: "Successor product", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Legacy Ultimate dashboard gone",
        scope: "global",
        signal: "Old logins no longer work",
        quickCheck: "Expected after the acquisition; use Zendesk AI agents",
      },
      {
        pattern: "Zendesk AI agent incident",
        scope: "partial",
        signal: "Migrated bots stop answering",
        quickCheck: "Check the Zendesk AI page on DownForAI",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You still refer to Ultimate",
        alternative: "Zendesk AI (monitored on DownForAI) is the successor; Ada Support and Decagon are alternatives",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zendesk platform"],
    operatorNotes: [
      "ultimate.ai redirects to zendesk.com; consider re-pointing or retiring this entry.",
    ],
  },
  "yellow-ai": {
    slug: "yellow-ai",
    providerSummary:
      "Yellow.ai is an enterprise conversational AI platform for customer and employee service across chat, voice and messaging channels, deployed per customer. Incidents are bots going silent on channels or generative answers failing for its tenants.",
    docsUrl: "https://docs.yellow.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Yellow.ai bots (per tenant)", description: "Chat, voice, messaging", criticality: "critical" },
      { name: "Channel integrations", description: "WhatsApp, web, voice", criticality: "high" },
      { name: "Model providers", description: "Behind generative features", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Bot silent on one channel",
        scope: "partial",
        signal: "WhatsApp or voice stops while web chat works",
        quickCheck: "Check the channel's integration status",
      },
      {
        pattern: "Generative answers failing",
        scope: "partial",
        signal: "LLM-backed replies error while scripted flows run",
        quickCheck: "Check the model provider's status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Yellow.ai is down",
        alternative: "Kore.ai, Haptik or Aisera (monitored on DownForAI) offer enterprise bot platforms",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Messaging and voice channels", "Model providers"],
    operatorNotes: [],
  },
  "yuma-ai": {
    slug: "yuma-ai",
    providerSummary:
      "Yuma AI automates customer support for Shopify merchants inside Gorgias, Zendesk and other helpdesks, answering and acting on tickets. Incidents mean tickets stop being handled automatically for its merchants.",
    docsUrl: "https://yuma.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Yuma automation (per merchant)", description: "Ticket handling", criticality: "critical" },
      { name: "Helpdesk and Shopify integrations", description: "Gorgias, Zendesk, Shopify", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tickets no longer answered automatically",
        scope: "partial",
        signal: "Automation rate drops to zero",
        quickCheck: "Check the helpdesk integration; agents can handle tickets manually",
      },
      {
        pattern: "Order actions failing",
        scope: "local",
        signal: "Yuma answers but cannot modify orders",
        quickCheck: "Check the Shopify integration's permissions",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Yuma is down",
        alternative: "Siena AI or Decagon (monitored on DownForAI) automate e-commerce support",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Gorgias, Zendesk, Shopify APIs", "Model providers"],
    operatorNotes: [],
  },
  "zendesk-ai": {
    slug: "zendesk-ai",
    providerSummary:
      "Zendesk's AI (AI agents, copilot, intelligent triage) runs inside the Zendesk Suite, deployed per pod and region, with incidents published on Zendesk's status page. AI features can fail while ticketing works.",
    officialStatusUrl: "https://status.zendesk.com/",
    docsUrl: "https://support.zendesk.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Zendesk Suite (per pod)", description: "Ticketing and messaging", criticality: "critical" },
      { name: "AI agents / copilot", description: "Automation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI features failing while tickets work",
        scope: "partial",
        signal: "AI agents or copilot error; the agent workspace works",
        quickCheck: "Check status.zendesk.com for AI components",
      },
      {
        pattern: "Pod-level incident",
        scope: "partial",
        signal: "Your subdomain's pod is degraded",
        quickCheck: "Find your pod on the status page",
      },
      {
        pattern: "AI agent resolutions quota exhausted",
        scope: "local",
        signal: "Automated resolutions stop with a limit message for your account",
        quickCheck: "Check the plan's automated resolutions",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Zendesk AI is unavailable",
        alternative: "Freshdesk AI, Intercom Fin or HubSpot AI (monitored on DownForAI) offer AI inside helpdesks",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Zendesk platform", "Model providers"],
    operatorNotes: [],
  },
};
