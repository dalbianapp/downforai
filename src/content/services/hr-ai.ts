import type { TopServiceContent } from "@/content/top-services/types";

// HR_AI — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start hr-ai-2.ts and register it in ./index.ts if it grows.
export const HR_AI: Record<string, TopServiceContent> = {
  "beamery-ai": {
    slug: "beamery-ai",
    providerSummary:
      "Beamery is an enterprise talent platform (CRM, skills intelligence, career sites) sold on contracts, integrated with ATS and HRIS systems such as Workday and SAP SuccessFactors. Incidents are tenant-wide outages, integration syncs falling behind and SSO issues.",
    docsUrl: "https://support.beamery.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Beamery app", description: "Recruiter workspace", criticality: "critical" },
      { name: "Integrations", description: "ATS / HRIS sync", criticality: "high" },
      { name: "Career sites and forms", description: "Candidate-facing pages", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "ATS sync falling behind",
        scope: "partial",
        signal: "Candidates created in the ATS do not appear in Beamery for hours",
        quickCheck: "Check the integration's last sync time in the admin panel; open a ticket if it stalls",
      },
      {
        pattern: "Recruiter app unreachable while career sites still serve",
        scope: "partial",
        signal: "Recruiters get errors; candidates can still apply",
        quickCheck: "The two surfaces are separate; a workspace outage does not stop applications",
      },
      {
        pattern: "SSO login failing",
        scope: "local",
        signal: "Users loop back to the identity provider",
        quickCheck: "Check the identity provider first; it is usually the customer side",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Beamery is down",
        alternative: "Gem or Eightfold AI (monitored on DownForAI) cover talent CRM; otherwise work directly in the ATS",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Workday / SAP SuccessFactors and other ATS", "Customer identity providers"],
    operatorNotes: [],
  },
  "eightfold-ai": {
    slug: "eightfold-ai",
    providerSummary:
      "Eightfold AI is a talent-intelligence platform (matching, career sites, internal mobility, talent management) sold to large enterprises, integrated with their ATS and HRIS. Its career sites are embedded on customer domains, so an outage is visible to candidates.",
    docsUrl: "https://eightfold.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Eightfold app", description: "Recruiter and employee workspace", criticality: "critical" },
      { name: "Hosted career sites", description: "Candidate-facing pages on customer domains", criticality: "critical" },
      { name: "Matching backend", description: "AI ranking and recommendations", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Career site down or not listing jobs",
        scope: "partial",
        signal: "Customer careers pages show errors or empty listings",
        quickCheck: "Check the job feed from the ATS; a platform outage affects every customer at once",
      },
      {
        pattern: "Matching scores missing",
        scope: "partial",
        signal: "Candidates load but AI rankings do not",
        quickCheck: "The matching layer is separate; lists still work without scores",
      },
      {
        pattern: "Applications not reaching the ATS",
        scope: "local",
        signal: "Candidates submit but the ATS shows nothing",
        quickCheck: "Check the ATS integration credentials and logs",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Eightfold is down",
        alternative: "Phenom or Beamery (monitored on DownForAI) cover career sites and talent CRM; the ATS keeps its own apply flow",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Customer ATS / HRIS"],
    operatorNotes: [],
  },
  "fetcher-ai": {
    slug: "fetcher-ai",
    providerSummary:
      "Fetcher automates candidate sourcing with AI plus human curation and sends outreach sequences from the recruiter's connected mailbox, on subscription plans. Its incidents are sourcing batches not delivered and mailbox connections failing.",
    docsUrl: "https://fetcher.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.fetcher.ai", description: "Search and campaigns", criticality: "critical" },
      { name: "Sourcing pipeline", description: "Candidate batch delivery", criticality: "high" },
      { name: "Email sending", description: "Through connected Gmail / Outlook", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Candidate batches late",
        scope: "partial",
        signal: "Searches deliver no new profiles for a day or more",
        quickCheck: "Batches involve human curation; delays are usually pipeline backlog, not an outage",
      },
      {
        pattern: "Outreach not sending",
        scope: "local",
        signal: "Sequences stay queued for one recruiter",
        quickCheck: "Reconnect the mailbox; OAuth tokens expire after password changes",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fetcher is down",
        alternative: "Gem or SeekOut (monitored on DownForAI) cover sourcing and outreach",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Gmail / Microsoft 365 mailboxes", "LinkedIn profile data"],
    operatorNotes: [],
  },
  "gem-ai": {
    slug: "gem-ai",
    providerSummary:
      "Gem is a recruiting CRM and analytics platform with AI sourcing, a Chrome extension for LinkedIn, email sequences sent through connected mailboxes and two-way ATS sync (Greenhouse, Lever, Workday). Incidents show up as sequences not sending, the extension failing on LinkedIn or ATS data going stale.",
    docsUrl: "https://help.gem.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.gem.com", description: "CRM and analytics", criticality: "critical" },
      { name: "Gem Chrome extension", description: "Sourcing on LinkedIn", criticality: "high" },
      { name: "Sequences", description: "Email sending through Gmail / Outlook", criticality: "high" },
      { name: "ATS sync", description: "Two-way integration", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Sequences not sending",
        scope: "partial",
        signal: "Scheduled emails stay pending across the team",
        quickCheck: "If every recruiter is affected it is Gem's sending pipeline; one recruiter usually means a disconnected mailbox",
      },
      {
        pattern: "Extension not loading on LinkedIn",
        scope: "partial",
        signal: "The Gem sidebar does not appear or errors on profiles",
        quickCheck: "LinkedIn page changes break the extension periodically; update it and check Gem's release notes",
      },
      {
        pattern: "ATS data stale",
        scope: "local",
        signal: "Stages in Gem lag the ATS",
        quickCheck: "Check the integration status page in Gem's settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gem is down",
        alternative: "Fetcher, SeekOut or Beamery (monitored on DownForAI) cover sourcing and CRM; otherwise work in the ATS directly",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Greenhouse / Lever / Workday ATS", "Gmail / Microsoft 365", "LinkedIn"],
    operatorNotes: [],
  },
  "harver-ai": {
    slug: "harver-ai",
    providerSummary:
      "Harver runs pre-employment assessments and video interviews for high-volume hiring, delivered to candidates through hosted assessment flows and integrated with the customer's ATS. Outages are candidate-facing: assessments not loading or results not flowing back.",
    docsUrl: "https://support.harver.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Candidate assessment flows", description: "Hosted tests", criticality: "critical" },
      { name: "Harver admin", description: "Recruiter dashboard", criticality: "high" },
      { name: "ATS integrations", description: "Results sync", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Candidates cannot start or finish assessments",
        scope: "partial",
        signal: "Assessment links error or freeze mid-test",
        quickCheck: "Test a link yourself; a universal failure is the platform, one candidate is usually their browser or network",
      },
      {
        pattern: "Results not reaching the ATS",
        scope: "local",
        signal: "Scores exist in Harver but not in the ATS",
        quickCheck: "Check the integration mapping and the ATS's webhook logs",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Harver is down",
        alternative: "HireVue (monitored on DownForAI) covers assessments and video interviews; pause invitations meanwhile",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Customer ATS"],
    operatorNotes: [
      "support.harver.com refuses automated requests (403) but is Harver's help centre.",
    ],
  },
  "hirevue-ai": {
    slug: "hirevue-ai",
    providerSummary:
      "HireVue runs on-demand video interviews, assessments and interview scheduling for enterprise hiring, with candidates recording in the browser or mobile app. Its incidents are candidate-side recording failures and platform outages during interview windows.",
    docsUrl: "https://www.hirevue.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Candidate interview experience", description: "Browser and mobile recording", criticality: "critical" },
      { name: "HireVue platform", description: "Recruiter portal and evaluations", criticality: "critical" },
      { name: "Scheduling and ATS integrations", description: "Workday, SuccessFactors and others", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Recordings failing to upload",
        scope: "partial",
        signal: "Candidates finish but answers do not save",
        quickCheck: "Have one candidate retry on another network; universal failures are the media backend",
      },
      {
        pattern: "Camera or microphone blocked",
        scope: "local",
        signal: "The pre-check fails for one candidate",
        quickCheck: "Browser permissions or corporate devices; the mobile app avoids most of these",
      },
      {
        pattern: "Interviews not appearing in the ATS",
        scope: "local",
        signal: "Completed interviews stay missing from candidate records",
        quickCheck: "Check the integration's status in HireVue's admin",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "HireVue is down",
        alternative: "Harver (monitored on DownForAI) covers assessments; live interviews can move to a video-call tool",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Customer ATS", "Browser media APIs"],
    operatorNotes: [
      "help.hirevue.com was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  "paradox-ai": {
    slug: "paradox-ai",
    providerSummary:
      "Paradox runs Olivia, a conversational recruiting assistant that screens, schedules and onboards candidates over SMS, WhatsApp and web chat, integrated with ATS systems such as Workday and SAP and with interviewer calendars. Incidents are candidates getting no reply and interviews not being booked.",
    docsUrl: "https://support.paradox.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Olivia conversations", description: "SMS, WhatsApp, web chat", criticality: "critical" },
      { name: "Scheduling engine", description: "Calendar booking", criticality: "critical" },
      { name: "ATS integrations", description: "Candidate and job sync", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Olivia not replying",
        scope: "partial",
        signal: "Candidates send messages and get nothing back on every channel",
        quickCheck: "Test the web chat on a careers page; a universal silence is the platform, one channel alone is usually the messaging provider",
      },
      {
        pattern: "Interviews double-booked or not booked",
        scope: "local",
        signal: "Calendar slots offered are wrong",
        quickCheck: "Check the interviewer's calendar connection (Google or Microsoft 365)",
      },
      {
        pattern: "New requisitions not appearing",
        scope: "local",
        signal: "Jobs posted in the ATS are unknown to Olivia",
        quickCheck: "Check the ATS sync schedule and mapping",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Paradox is down",
        alternative: "Phenom (monitored on DownForAI) offers a comparable chatbot; otherwise fall back to the ATS's own apply and scheduling flow",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["SMS / WhatsApp providers", "Google / Microsoft 365 calendars", "Customer ATS"],
    operatorNotes: [
      "support.paradox.ai redirects to paradox.helpjuice.com, Paradox's help centre.",
    ],
  },
  "phenom-ai": {
    slug: "phenom-ai",
    providerSummary:
      "Phenom is a talent-experience platform (career sites, chatbot, CRM, internal mobility) sold to large enterprises, hosting candidate-facing career sites on customer domains and integrating with their ATS. An outage is visible to candidates and recruiters at once.",
    docsUrl: "https://www.phenom.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Hosted career sites", description: "Candidate-facing pages", criticality: "critical" },
      { name: "Phenom chatbot", description: "Candidate conversations", criticality: "high" },
      { name: "Recruiter CRM", description: "Workspace", criticality: "high" },
      { name: "ATS integrations", description: "Job and candidate sync", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Career site errors or missing jobs",
        scope: "partial",
        signal: "Customer careers pages fail or show empty listings",
        quickCheck: "Check whether the ATS job feed updated; a platform outage affects every customer at once",
      },
      {
        pattern: "Chatbot not responding",
        scope: "partial",
        signal: "The widget loads but replies never arrive",
        quickCheck: "The conversational layer is separate from the site; applications can still go through",
      },
      {
        pattern: "Applications not syncing to the ATS",
        scope: "local",
        signal: "Candidates submit but records do not appear",
        quickCheck: "Check the integration credentials and logs",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Phenom is down",
        alternative: "Eightfold AI or Beamery (monitored on DownForAI) cover career sites and CRM; the ATS keeps its own apply flow",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Customer ATS / HRIS"],
    operatorNotes: [],
  },
  "seekout-ai": {
    slug: "seekout-ai",
    providerSummary:
      "SeekOut is a talent search and analytics platform aggregating public profiles, GitHub and other sources with AI ranking, plus messaging through connected mailboxes, on subscription plans. Its incidents are searches failing and outreach not sending.",
    docsUrl: "https://seekout.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.seekout.com", description: "Search and projects", criticality: "critical" },
      { name: "Search index", description: "Profile data", criticality: "critical" },
      { name: "Messaging", description: "Through connected mailboxes", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Searches erroring or timing out",
        scope: "partial",
        signal: "Every query fails",
        quickCheck: "Retry a simple query; a universal failure is the search backend",
      },
      {
        pattern: "Contact info missing",
        scope: "partial",
        signal: "Profiles load but emails do not resolve",
        quickCheck: "Contact enrichment is a separate provider layer",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Contact reveals refused for your account",
        quickCheck: "Check the plan's credit balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SeekOut is down",
        alternative: "Gem or Fetcher (monitored on DownForAI) cover sourcing",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Gmail / Microsoft 365 mailboxes", "Public profile sources"],
    operatorNotes: [
      "help.seekout.com refused automated requests when this entry was written; the docs link points to the main site.",
    ],
  },
  textio: {
    slug: "textio",
    providerSummary:
      "Textio scores and rewrites job posts and performance feedback for bias and clarity, through its web editor, browser extension and ATS integrations, on enterprise contracts. Its incidents are scores not loading and the extension failing inside the ATS.",
    docsUrl: "https://support.textio.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Textio web app", description: "Editor", criticality: "critical" },
      { name: "Scoring backend", description: "Language analysis", criticality: "critical" },
      { name: "Extension and ATS integrations", description: "In-context guidance", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Scores not updating",
        scope: "partial",
        signal: "Documents load but guidance stays blank for everyone",
        quickCheck: "Retry a short document; a universal blank is the scoring backend",
      },
      {
        pattern: "Extension not appearing in the ATS",
        scope: "local",
        signal: "No Textio panel on job-post pages",
        quickCheck: "Update the extension and re-login; ATS layout changes can break it",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Textio is down",
        alternative: "Grammarly AI (monitored on DownForAI) polishes job posts; bias guidance is Textio-specific",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Customer ATS"],
    operatorNotes: [],
  },
};
