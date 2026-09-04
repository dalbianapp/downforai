import type { TopServiceContent } from "@/content/top-services/types";

// EDUCATION — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start education-2.ts and register it in ./index.ts if it grows.
export const EDUCATION: Record<string, TopServiceContent> = {
  "babbel-ai": {
    slug: "babbel-ai",
    providerSummary:
      "Babbel is a subscription language-learning app with speech recognition and AI conversation practice on web, iOS and Android; the site blocks direct probes. Incidents are lessons not loading, speech exercises failing and progress not syncing between devices.",
    docsUrl: "https://support.babbel.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Babbel apps and web", description: "Lessons", criticality: "critical" },
      { name: "Speech recognition", description: "Pronunciation exercises", criticality: "high" },
      { name: "Account and sync", description: "Progress and subscriptions", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Lessons not loading",
        scope: "partial",
        signal: "Content fails to download on every device",
        quickCheck: "Try the web app; a universal failure is the backend",
      },
      {
        pattern: "Speech exercises failing",
        scope: "local",
        signal: "The microphone step never validates",
        quickCheck: "Check microphone permissions; skip speech exercises meanwhile",
      },
      {
        pattern: "Progress not syncing",
        scope: "local",
        signal: "Different devices show different lessons",
        quickCheck: "Sign out and in on the lagging device",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Babbel is down",
        alternative: "Duolingo Max, Memrise or Speak (monitored on DownForAI) cover language practice",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["App stores"],
    operatorNotes: [
      "babbel.com is marked as blocking probes in the DB; the technical signal may read as blocked rather than down.",
    ],
  },
  "brainly-ai": {
    slug: "brainly-ai",
    providerSummary:
      "Brainly is a homework-help community with AI-generated explanations on web and mobile, on freemium plans, and publishes an Atlassian Statuspage that DownForAI reads. The site itself refuses automated probes, so the status page is the reliable signal.",
    officialStatusUrl: "https://status.brainly.com",
    docsUrl: "https://brainly.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "brainly.com and apps", description: "Questions and answers", criticality: "critical" },
      { name: "AI explanations", description: "Generated answers", criticality: "high" },
      { name: "status.brainly.com", description: "Official status page", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Site errors or slow",
        scope: "global",
        signal: "Pages fail to load for everyone",
        quickCheck: "Check status.brainly.com; the page lists platform incidents",
      },
      {
        pattern: "AI answers failing while community answers load",
        scope: "partial",
        signal: "The AI explanation step errors",
        quickCheck: "The AI layer relies on a model provider and fails separately",
      },
      {
        pattern: "Plus features locked",
        scope: "local",
        signal: "Subscriber content shows a paywall",
        quickCheck: "Re-login or restore purchases",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Brainly is down",
        alternative: "Question AI, StudyX or Gauth (monitored on DownForAI) answer homework questions",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "brainly.com returns 403 to automated requests; DownForAI relies on the Statuspage JSON surface.",
    ],
  },
  "caktus-ai": {
    slug: "caktus-ai",
    providerSummary:
      "Caktus AI generates essays, code and study content for students through a web app, on subscription plans, relaying to language models. It is a small hosted app with one generation backend.",
    docsUrl: "https://www.caktus.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "caktus.ai web app", description: "Tools", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations failing",
        scope: "partial",
        signal: "Every tool errors",
        quickCheck: "Retry a short prompt; a universal failure is the backend",
      },
      {
        pattern: "Subscription access lost",
        scope: "local",
        signal: "Tools locked for your account",
        quickCheck: "Check the plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Caktus is down",
        alternative: "ChatGPT or Claude (monitored on DownForAI) cover student writing help",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "century-tech": {
    slug: "century-tech",
    providerSummary:
      "CENTURY Tech is an adaptive learning platform for schools with teacher dashboards and student paths, sold to schools and integrated with school information systems for rosters and single sign-on. Incidents are class-wide: students cannot log in or content does not load during lessons.",
    docsUrl: "https://www.century.tech",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.century.tech", description: "Student and teacher app", criticality: "critical" },
      { name: "Sign-in", description: "School SSO and rosters", criticality: "critical" },
      { name: "Content delivery", description: "Nuggets and assessments", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Class cannot log in",
        scope: "partial",
        signal: "SSO fails for a whole school",
        quickCheck: "Check the school's identity provider or MIS sync first",
      },
      {
        pattern: "Content not loading mid-lesson",
        scope: "partial",
        signal: "Nuggets hang for everyone",
        quickCheck: "Try another nugget; a universal hang is the platform",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CENTURY is down",
        alternative: "Khanmigo or Quizizz (monitored on DownForAI) cover in-lesson practice",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["School MIS / identity providers"],
    operatorNotes: [],
  },
  cognii: {
    slug: "cognii",
    providerSummary:
      "Cognii sold a conversational AI tutoring and assessment engine to institutions. cognii.com did not answer when this entry was written, so the company's current status is unclear and the DownForAI probe will read as down.",
    docsUrl: "https://cognii.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "cognii.com", description: "Website (unreachable when written)", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "Connections fail",
        quickCheck: "Treat the service as unavailable until the site answers",
      },
      {
        pattern: "Institution integrations failing",
        scope: "local",
        signal: "LMS tools that call Cognii error",
        quickCheck: "Contact your institution's vendor manager",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Cognii",
        alternative: "Khanmigo or Squirrel AI (monitored on DownForAI) offer AI tutoring",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "cognii.com was unreachable when this entry was written; possibly inactive.",
    ],
  },
  coursebox: {
    slug: "coursebox",
    providerSummary:
      "Coursebox generates online courses from documents and prompts, with an LMS, assessments and an AI tutor, on subscription plans. Generation is a queued job relaying to language models; failures are stuck course builds and learner access problems.",
    docsUrl: "https://www.coursebox.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "coursebox.ai app", description: "Course builder and LMS", criticality: "critical" },
      { name: "Generation backend", description: "Course and quiz generation", criticality: "critical" },
      { name: "Learner portal", description: "Course delivery", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Course generation stuck",
        scope: "partial",
        signal: "Builds stay in progress for everyone",
        quickCheck: "Try a small outline; a universal stall is the backend",
      },
      {
        pattern: "Learners cannot access courses",
        scope: "partial",
        signal: "The learner portal errors while the builder works",
        quickCheck: "The two surfaces are separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Coursebox is down",
        alternative: "Nolej or TutorAI (monitored on DownForAI) generate course content",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "duolingo-max": {
    slug: "duolingo-max",
    providerSummary:
      "Duolingo Max is Duolingo's top subscription tier adding AI features (Explain My Answer, Roleplay, Video Call) built on OpenAI models, inside the regular apps. Max features can fail while normal lessons work, and they are only available for some courses and regions.",
    docsUrl: "https://www.duolingo.com/help",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Duolingo apps and web", description: "Lessons", criticality: "critical" },
      { name: "Max AI features", description: "Explain, Roleplay, Video Call", criticality: "high" },
      { name: "Subscriptions", description: "Store billing", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Max features failing while lessons work",
        scope: "partial",
        signal: "Roleplay or Explain My Answer error or hang",
        quickCheck: "The AI layer depends on OpenAI and fails on its own; lessons are unaffected",
      },
      {
        pattern: "Max not offered",
        scope: "local",
        signal: "The tier does not appear in your app",
        quickCheck: "Availability depends on the course language and country, not an outage",
      },
      {
        pattern: "App outage",
        scope: "global",
        signal: "Lessons fail to load for everyone",
        quickCheck: "Check DownForAI's probe of duolingo.com",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Duolingo is down",
        alternative: "Babbel, Memrise or Speak (monitored on DownForAI) cover language practice",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI models", "App stores"],
    operatorNotes: [],
  },
  "elsa-speak": {
    slug: "elsa-speak",
    providerSummary:
      "ELSA Speak coaches English pronunciation with real-time speech scoring in its mobile app, on freemium plans. Its core dependency is the speech-scoring backend, so failures show as exercises not scoring.",
    docsUrl: "https://elsaspeak.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ELSA app", description: "Lessons", criticality: "critical" },
      { name: "Speech scoring backend", description: "Pronunciation analysis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Exercises not scoring",
        scope: "partial",
        signal: "Recordings submit but no feedback appears for anyone",
        quickCheck: "A universal silence is the scoring backend",
      },
      {
        pattern: "Microphone not captured",
        scope: "local",
        signal: "Recordings are empty on one device",
        quickCheck: "Check app permissions",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ELSA is down",
        alternative: "Speak, Loora or Talkpal (monitored on DownForAI) offer spoken English practice",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["App stores"],
    operatorNotes: [],
  },
  fetchy: {
    slug: "fetchy",
    providerSummary:
      "Fetchy is an AI assistant for teachers (lesson plans, communications, rubrics) through a web app, on freemium plans, relaying to language models. It is a small hosted app with one generation backend.",
    docsUrl: "https://www.fetchy.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "fetchy.com web app", description: "Tools", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations failing",
        scope: "partial",
        signal: "Every tool errors",
        quickCheck: "Retry a short prompt; a universal failure is the backend",
      },
      {
        pattern: "Usage limit reached",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fetchy is down",
        alternative: "MagicSchool AI or Twee (monitored on DownForAI) cover teacher tools",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  gauth: {
    slug: "gauth",
    providerSummary:
      "Gauth (ByteDance) solves math and other homework from photos with AI in its mobile app and web, on freemium plans; the site blocks direct probes. Incidents are solutions not generating and the app failing to load.",
    docsUrl: "https://www.gauthmath.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Gauth app and web", description: "Solver", criticality: "critical" },
      { name: "Solution backend", description: "OCR and model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Solutions not generating",
        scope: "partial",
        signal: "Photos upload but answers never appear for anyone",
        quickCheck: "Try a typed question; a universal stall is the backend",
      },
      {
        pattern: "Plus features locked",
        scope: "local",
        signal: "Step-by-step content paywalled for your account",
        quickCheck: "Restore purchases",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gauth is down",
        alternative: "Question AI, Brainly AI or StudyX (monitored on DownForAI) solve homework questions",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["App stores"],
    operatorNotes: [
      "gauthmath.com returns 403 to automated requests, so DownForAI's probe reads as blocked rather than down.",
    ],
  },
  "gradescope-ai": {
    slug: "gradescope-ai",
    providerSummary:
      "Gradescope (Turnitin) is a grading platform with AI-assisted answer grouping and programming autograders, used by universities and integrated with LMSs such as Canvas. Its incidents cluster around deadlines: submissions failing, autograders queued and grades not syncing.",
    docsUrl: "https://help.gradescope.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "gradescope.com", description: "Submissions and grading", criticality: "critical" },
      { name: "Autograder workers", description: "Programming assignments", criticality: "high" },
      { name: "LMS integrations", description: "Canvas, Moodle, Blackboard", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Submissions failing near a deadline",
        scope: "partial",
        signal: "Uploads time out for a whole class",
        quickCheck: "Peak load; instructors can extend deadlines from the assignment settings",
      },
      {
        pattern: "Autograders stuck in queue",
        scope: "partial",
        signal: "Programming submissions stay pending",
        quickCheck: "The worker pool is separate from the site; grades appear once it drains",
      },
      {
        pattern: "Grades not syncing to the LMS",
        scope: "local",
        signal: "Gradescope shows grades the LMS lacks",
        quickCheck: "Re-link the course and push grades again",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gradescope is down",
        alternative: "Turnitin AI (monitored on DownForAI) shares the same parent company and may be affected too; collect submissions through the LMS meanwhile",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Turnitin infrastructure", "Canvas / Moodle / Blackboard"],
    operatorNotes: [
      "help.gradescope.com redirects to guides.gradescope.com, which refuses automated requests (403).",
    ],
  },
  jungle: {
    slug: "jungle",
    providerSummary:
      "Jungle (jungleai.com) generates flashcards, quizzes and study guides from PDFs and lecture notes with AI, on freemium plans; it is the successor of Wisdolia. Generation relays to language models; uploads are processed as jobs.",
    docsUrl: "https://jungleai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "jungleai.com app", description: "Uploads and study sets", criticality: "critical" },
      { name: "Generation backend", description: "Document processing and model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Uploads stuck processing",
        scope: "partial",
        signal: "Documents never turn into study sets for anyone",
        quickCheck: "Try a small PDF; a universal stall is the backend",
      },
      {
        pattern: "Usage limit reached",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Jungle is down",
        alternative: "Knowt, StudyFetch or Mindgrasp (monitored on DownForAI) build study material from notes",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "wisdolia.com redirects to jungleai.com; the two DB entries point at the same product.",
    ],
  },
  khanmigo: {
    slug: "khanmigo",
    providerSummary:
      "Khanmigo is Khan Academy's AI tutor and teacher assistant built on OpenAI models, offered inside khanacademy.org for learners, teachers and districts. It can fail while Khan Academy itself works, and district sign-in through Clever or ClassLink is a separate dependency.",
    docsUrl: "https://support.khanacademy.org",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "khanacademy.org", description: "Learning platform", criticality: "critical" },
      { name: "Khanmigo", description: "AI tutor", criticality: "high" },
      { name: "District sign-in", description: "Clever / ClassLink / Google", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Khanmigo not responding while lessons work",
        scope: "partial",
        signal: "The chat hangs or errors",
        quickCheck: "OpenAI-side or Khanmigo backend problem; the rest of Khan Academy is unaffected",
      },
      {
        pattern: "District students cannot sign in",
        scope: "partial",
        signal: "Clever or ClassLink login fails for a district",
        quickCheck: "Check the identity provider first",
      },
      {
        pattern: "Khanmigo not available for an account",
        scope: "local",
        signal: "The feature does not appear",
        quickCheck: "Access depends on district licensing or a donor plan, not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Khanmigo is down",
        alternative: "ChatGPT or Claude (monitored on DownForAI) for tutoring-style help; Khan Academy exercises keep working",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI models", "Clever / ClassLink"],
    operatorNotes: [
      "DownForAI probes khanacademy.org/khanmigo, which is served by the main site's catch-all router.",
    ],
  },
  "knewton-alta": {
    slug: "knewton-alta",
    providerSummary:
      "Knewton Alta is Wiley's adaptive courseware for college math and science; knewton.com now redirects to Wiley's product page. It is used through LMS integrations, so incidents are assignments not loading or grades not passing back.",
    docsUrl: "https://www.knewton.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Alta platform", description: "Assignments", criticality: "critical" },
      { name: "LMS integration", description: "LTI launches and grade passback", criticality: "high" },
      { name: "knewton.com → wiley.com", description: "Redirect", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Assignments not loading from the LMS",
        scope: "partial",
        signal: "LTI launches error for a course",
        quickCheck: "Check the LMS tool configuration; a universal failure is Wiley's platform",
      },
      {
        pattern: "Grades not passing back",
        scope: "local",
        signal: "Completed work missing in the LMS gradebook",
        quickCheck: "Instructor-side sync from Alta",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Alta is down",
        alternative: "Khanmigo (monitored on DownForAI) covers practice; graded work has to wait",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Wiley platform", "LMS (Canvas, Blackboard, Moodle)"],
    operatorNotes: [
      "knewton.com redirects to a wiley.com product page; DownForAI's probe follows the redirect.",
    ],
  },
  knowji: {
    slug: "knowji",
    providerSummary:
      "Knowji is a vocabulary-learning app family with spaced repetition and audio, sold on the app stores. Content is bundled in the apps, so the only online dependencies are the app stores and sync.",
    docsUrl: "https://www.knowji.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Knowji apps", description: "iOS and Android", criticality: "critical" },
      { name: "knowji.com", description: "Website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "App download or update failing",
        scope: "local",
        signal: "Store errors",
        quickCheck: "App store issue, not Knowji",
      },
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "The site errors",
        quickCheck: "Installed apps keep working offline",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Knowji is unavailable",
        alternative: "Memrise (monitored on DownForAI) covers vocabulary with spaced repetition",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["App stores"],
    operatorNotes: [],
  },
  knowt: {
    slug: "knowt",
    providerSummary:
      "Knowt turns notes, slides and videos into flashcards and practice tests with AI, and imports Quizlet sets, on freemium plans. Generation relays to language models; failures are uploads stuck and imports failing.",
    docsUrl: "https://knowt.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "knowt.com app", description: "Notes and flashcards", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
      { name: "Imports", description: "Quizlet and file uploads", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI generation stuck",
        scope: "partial",
        signal: "Flashcards never generate for anyone",
        quickCheck: "Try a short note; a universal stall is the backend",
      },
      {
        pattern: "Quizlet import failing",
        scope: "partial",
        signal: "Imports error for every set",
        quickCheck: "Quizlet-side changes break the importer periodically",
      },
      {
        pattern: "Usage limit reached",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Knowt is down",
        alternative: "Jungle, StudyFetch or Quizlet Q-Chat (monitored on DownForAI) cover flashcards and study sets",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "loora-ai": {
    slug: "loora-ai",
    providerSummary:
      "Loora is an AI English-speaking tutor app with voice conversations, on subscription plans; loora.ai now redirects to loora.com. Its core dependency is the speech and language-model backend, so failures show as conversations not responding.",
    docsUrl: "https://loora.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Loora app", description: "Conversations", criticality: "critical" },
      { name: "Speech and model backend", description: "Recognition, generation, synthesis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tutor not responding",
        scope: "partial",
        signal: "Conversations hang for everyone",
        quickCheck: "A universal hang is the backend or its model provider",
      },
      {
        pattern: "Subscription not recognised",
        scope: "local",
        signal: "Lessons locked for your account",
        quickCheck: "Restore purchases",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Loora is down",
        alternative: "Speak, ELSA Speak or Praktika (monitored on DownForAI) offer spoken practice",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party speech and language-model providers", "App stores"],
    operatorNotes: [
      "loora.ai redirects to loora.com; DownForAI's probe follows the redirect.",
    ],
  },
  "magicschool-ai": {
    slug: "magicschool-ai",
    providerSummary:
      "MagicSchool AI gives teachers dozens of generation tools and a student-facing side, on free and district plans with Google, Microsoft and Clever sign-in, relaying to language models. Incidents are tools failing school-wide and sign-in problems for districts.",
    docsUrl: "https://help.magicschool.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.magicschool.ai", description: "Teacher and student tools", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
      { name: "Sign-in", description: "Google, Microsoft, Clever", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tools failing across the board",
        scope: "partial",
        signal: "Every tool errors for everyone",
        quickCheck: "Retry a short prompt; a universal failure is the backend or its model provider",
      },
      {
        pattern: "District sign-in failing",
        scope: "partial",
        signal: "Clever or Google login errors for a district",
        quickCheck: "Check the identity provider first",
      },
      {
        pattern: "Student rooms not loading",
        scope: "local",
        signal: "Students cannot join a teacher's room",
        quickCheck: "Check the room code and that the tool is enabled for students",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "MagicSchool is down",
        alternative: "Fetchy, Twee or ChatGPT (monitored on DownForAI) cover teacher generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers", "Google / Microsoft / Clever sign-in"],
    operatorNotes: [],
  },
  "memrise-ai": {
    slug: "memrise-ai",
    providerSummary:
      "Memrise is a language app with spaced repetition, native-speaker videos and the MemBot AI conversation partner, on freemium plans. Incidents are courses not loading, MemBot not responding and progress not syncing.",
    docsUrl: "https://memrise.zendesk.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Memrise apps and web", description: "Courses", criticality: "critical" },
      { name: "MemBot", description: "AI conversations", criticality: "medium" },
      { name: "Sync", description: "Progress", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Courses not loading",
        scope: "partial",
        signal: "Content fails on every device",
        quickCheck: "Try the web app; a universal failure is the backend",
      },
      {
        pattern: "MemBot not responding while courses work",
        scope: "partial",
        signal: "AI conversations hang",
        quickCheck: "The AI layer relies on a model provider and fails separately",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Memrise is down",
        alternative: "Duolingo Max, Babbel or Knowji (monitored on DownForAI) cover vocabulary and language practice",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers", "App stores"],
    operatorNotes: [
      "memrise.zendesk.com refuses automated requests (403) but is Memrise's help centre.",
    ],
  },
  mindgrasp: {
    slug: "mindgrasp",
    providerSummary:
      "Mindgrasp summarises documents, videos and lectures into notes, flashcards and quizzes with AI, on subscription plans; mindgrasp.ai redirects to www.mindgrasp.ai. Uploads are processed as jobs relaying to language models.",
    docsUrl: "https://mindgrasp.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "mindgrasp.ai app", description: "Uploads and notes", criticality: "critical" },
      { name: "Processing backend", description: "Transcription and model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Uploads stuck processing",
        scope: "partial",
        signal: "Files never produce notes for anyone",
        quickCheck: "Try a short PDF; video processing is the slowest path",
      },
      {
        pattern: "Usage limit reached",
        scope: "local",
        signal: "Uploads refused for your account",
        quickCheck: "Check the plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Mindgrasp is down",
        alternative: "Jungle, Knowt or StudyFetch (monitored on DownForAI) build notes from uploads",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  nolej: {
    slug: "nolej",
    providerSummary:
      "Nolej generates interactive microlearning (H5P, quizzes, summaries) from documents and videos for LMS export, on credit-based plans; nolej.io redirects to www.nolej.io. Generation is a queued job relaying to language models.",
    docsUrl: "https://nolej.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "nolej.io app", description: "Generator", criticality: "critical" },
      { name: "Generation backend", description: "Transcription and model relay", criticality: "critical" },
      { name: "LMS exports", description: "H5P, SCORM, LTI", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations stuck",
        scope: "partial",
        signal: "Packages never finish for anyone",
        quickCheck: "Try a short document; a universal stall is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Nolej is down",
        alternative: "Coursebox or Quizgecko (monitored on DownForAI) generate course content and quizzes",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  praktika: {
    slug: "praktika",
    providerSummary:
      "Praktika is an English-learning app with AI avatar tutors in voice conversations, on subscription plans. Its core dependency is the speech and language-model backend, so failures show as avatars not responding.",
    docsUrl: "https://praktika.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Praktika app", description: "Lessons", criticality: "critical" },
      { name: "Speech and model backend", description: "Recognition, generation, synthesis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Avatars not responding",
        scope: "partial",
        signal: "Conversations hang for everyone",
        quickCheck: "A universal hang is the backend or its model provider",
      },
      {
        pattern: "Subscription not recognised",
        scope: "local",
        signal: "Lessons locked for your account",
        quickCheck: "Restore purchases",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Praktika is down",
        alternative: "Loora, Speak or Univerbal (monitored on DownForAI) offer spoken practice",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party speech and language-model providers", "App stores"],
    operatorNotes: [],
  },
  "question-ai": {
    slug: "question-ai",
    providerSummary:
      "Question AI answers homework questions from photos and text in its app and web, on freemium plans; questionai.com redirects to www.questionai.com. Answers relay to language models; failures are answers not generating.",
    docsUrl: "https://questionai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Question AI app and web", description: "Solver", criticality: "critical" },
      { name: "Answer backend", description: "OCR and model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Answers not generating",
        scope: "partial",
        signal: "Questions submit but nothing comes back for anyone",
        quickCheck: "Try a typed question; a universal stall is the backend",
      },
      {
        pattern: "Free limit reached",
        scope: "local",
        signal: "Questions refused for your account",
        quickCheck: "Daily free quota",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Question AI is down",
        alternative: "Gauth, Brainly AI or StudyX (monitored on DownForAI) answer homework questions",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers", "App stores"],
    operatorNotes: [],
  },
  quizgecko: {
    slug: "quizgecko",
    providerSummary:
      "Quizgecko generates quizzes and tests from text, documents and URLs with AI, on freemium plans; the site refuses automated probes. Generation relays to language models.",
    docsUrl: "https://quizgecko.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "quizgecko.com app", description: "Generator", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Quizzes not generating",
        scope: "partial",
        signal: "Jobs never finish for anyone",
        quickCheck: "Try a short text; a universal stall is the backend",
      },
      {
        pattern: "Usage limit reached",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Quizgecko is down",
        alternative: "Yippity, Quizizz or Knowt (monitored on DownForAI) generate quizzes",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "quizgecko.com returns 403 to automated requests, so DownForAI's probe reads as blocked rather than down.",
    ],
  },
  "quizizz-ai": {
    slug: "quizizz-ai",
    providerSummary:
      "Quizizz, rebranded Wayground, runs live and assigned quizzes with AI generation for teachers, on freemium and school plans; quizizz.com now redirects to wayground.com. Incidents are live games failing to join and AI generation errors.",
    docsUrl: "https://support.quizizz.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "wayground.com", description: "Teacher and student app", criticality: "critical" },
      { name: "Live game servers", description: "Real-time sessions", criticality: "critical" },
      { name: "AI generation", description: "Quiz creation", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Students cannot join live games",
        scope: "partial",
        signal: "Join codes fail for whole classes",
        quickCheck: "Real-time servers are separate from the site; assigned quizzes may still work",
      },
      {
        pattern: "AI generation failing while quizzes run",
        scope: "partial",
        signal: "The AI creator errors",
        quickCheck: "The AI layer fails separately",
      },
      {
        pattern: "Old quizizz.com links",
        scope: "local",
        signal: "Bookmarks redirect to wayground.com",
        quickCheck: "Expected after the rebrand",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Quizizz is down",
        alternative: "Quizgecko or Yippity (monitored on DownForAI) generate quizzes; live play has no monitored equivalent",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Google Classroom and LMS integrations"],
    operatorNotes: [
      "quizizz.com redirects to wayground.com and support.quizizz.com to help.wayground.com; DownForAI's probe follows the redirect.",
    ],
  },
  "quizlet-qchat": {
    slug: "quizlet-qchat",
    providerSummary:
      "Q-Chat is Quizlet's AI tutor built on OpenAI models, offered inside Quizlet's apps for study sets; quizlet.com refuses automated probes. Q-Chat can fail while flashcards work, and it is limited to some regions and plans.",
    docsUrl: "https://help.quizlet.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "quizlet.com and apps", description: "Study sets", criticality: "critical" },
      { name: "Q-Chat", description: "AI tutor", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Q-Chat not responding while sets work",
        scope: "partial",
        signal: "The chat hangs or errors",
        quickCheck: "OpenAI-side or Q-Chat backend; flashcards are unaffected",
      },
      {
        pattern: "Q-Chat not available",
        scope: "local",
        signal: "The feature is missing for your account",
        quickCheck: "Region and plan availability, not an outage",
      },
      {
        pattern: "Site outage",
        scope: "global",
        signal: "Study sets fail to load",
        quickCheck: "Check DownForAI's probe",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Quizlet is down",
        alternative: "Knowt (monitored on DownForAI) imports Quizlet sets; Jungle or StudyFetch cover study material",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI models"],
    operatorNotes: [
      "quizlet.com returns 403 to automated requests, so DownForAI's probe reads as blocked rather than down.",
    ],
  },
  sizzle: {
    slug: "sizzle",
    providerSummary:
      "Sizzle is a free AI tutoring app that walks students through problems step by step. sizzleai.com returned an SSL handshake error (525) when this entry was written, so the website may be down; the app is distributed through the stores.",
    docsUrl: "https://sizzleai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sizzleai.com", description: "Website (robots.txt probe)", criticality: "low" },
      { name: "Sizzle app", description: "Tutoring", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "SSL or connection errors",
        quickCheck: "The app may still work; the site is not the product",
      },
      {
        pattern: "Tutor not responding in the app",
        scope: "partial",
        signal: "Steps never generate",
        quickCheck: "Backend or model provider; retry later",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sizzle is down",
        alternative: "Khanmigo, Gauth or Question AI (monitored on DownForAI) offer step-by-step help",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers", "App stores"],
    operatorNotes: [
      "sizzleai.com returned HTTP 525 when this entry was written; the probe may read as down.",
    ],
  },
  "socratic-by-google": {
    slug: "socratic-by-google",
    providerSummary:
      "Socratic was Google's homework-help app; socratic.org now redirects to Google Lens' homework feature and the app has been retired in favour of Lens and Gemini. Old links resolve to Google, so the probe follows a redirect rather than reaching a product page.",
    docsUrl: "https://socratic.org",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "socratic.org → lens.google", description: "Redirect", criticality: "low" },
      { name: "Google Lens homework", description: "Successor", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Socratic app no longer available",
        scope: "global",
        signal: "The app is gone from stores or stops working",
        quickCheck: "Use Google Lens or Gemini instead",
      },
      {
        pattern: "Lens homework not answering",
        scope: "partial",
        signal: "Google Lens returns no explanation",
        quickCheck: "Google-side; retry in the Google app",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Socratic",
        alternative: "Gemini, Gauth or Question AI (monitored on DownForAI) explain homework from photos",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Google"],
    operatorNotes: [
      "socratic.org redirects to lens.google; DownForAI's probe follows the redirect.",
    ],
  },
  "speak-ai": {
    slug: "speak-ai",
    providerSummary:
      "Speak is a language app focused on speaking practice with real-time feedback, built on OpenAI models, on subscription plans. Its core dependency is the speech and language-model backend, so failures show as conversations not responding.",
    docsUrl: "https://www.speak.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Speak app", description: "Lessons and conversations", criticality: "critical" },
      { name: "Speech and model backend", description: "Recognition, generation, synthesis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Conversations not responding",
        scope: "partial",
        signal: "The tutor hangs for everyone",
        quickCheck: "A universal hang is the backend or OpenAI",
      },
      {
        pattern: "Speech not recognised",
        scope: "local",
        signal: "Recordings are empty on one device",
        quickCheck: "Check microphone permissions",
      },
      {
        pattern: "Subscription not recognised",
        scope: "local",
        signal: "Lessons locked for your account",
        quickCheck: "Restore purchases",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Speak is down",
        alternative: "ELSA Speak, Loora or Praktika (monitored on DownForAI) offer spoken practice",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI models", "App stores"],
    operatorNotes: [],
  },
  "squirrel-ai": {
    slug: "squirrel-ai",
    providerSummary:
      "Squirrel AI is a Chinese adaptive tutoring system for K-12 with learning centres and a tablet-based app, sold to families and schools. Its international site is a marketing surface; the product runs in China on separate infrastructure.",
    docsUrl: "https://squirrelai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "squirrelai.com", description: "International website", criticality: "low" },
      { name: "Learning platform", description: "Student app in China", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "The site errors",
        quickCheck: "Does not mean the learning platform is down",
      },
      {
        pattern: "Student app not loading",
        scope: "partial",
        signal: "Lessons fail in the app",
        quickCheck: "Contact the learning centre; there is no public status surface",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need adaptive tutoring elsewhere",
        alternative: "Khanmigo or Century Tech (monitored on DownForAI) offer adaptive learning",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI monitors the international website only.",
    ],
  },
  studyfetch: {
    slug: "studyfetch",
    providerSummary:
      "StudyFetch generates flashcards, quizzes, summaries and an AI tutor (Spark.E) from uploaded notes and lectures, on freemium plans, and publishes an Atlassian Statuspage that DownForAI reads. The site refuses automated probes, so the status page is the reliable signal.",
    officialStatusUrl: "https://status.studyfetch.com",
    docsUrl: "https://www.studyfetch.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "studyfetch.com app", description: "Uploads and study sets", criticality: "critical" },
      { name: "Processing backend", description: "Transcription and model relay", criticality: "critical" },
      { name: "status.studyfetch.com", description: "Official status page", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Uploads stuck processing",
        scope: "partial",
        signal: "Files never produce study sets for anyone",
        quickCheck: "Check status.studyfetch.com; try a short PDF",
      },
      {
        pattern: "Spark.E not responding while sets work",
        scope: "partial",
        signal: "The tutor chat hangs",
        quickCheck: "The AI layer fails separately from the library",
      },
      {
        pattern: "Usage limit reached",
        scope: "local",
        signal: "Uploads refused for your account",
        quickCheck: "Check the plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "StudyFetch is down",
        alternative: "Knowt, Jungle or Mindgrasp (monitored on DownForAI) build study material from notes",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "studyfetch.com returns 403 to automated requests; DownForAI relies on the Statuspage JSON surface.",
    ],
  },
  studyx: {
    slug: "studyx",
    providerSummary:
      "StudyX answers homework questions with AI explanations and a tutor chat in its app and web, on freemium plans. Answers relay to language models; failures are answers not generating and daily limits.",
    docsUrl: "https://studyx.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "studyx.ai app and web", description: "Solver", criticality: "critical" },
      { name: "Answer backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Answers not generating",
        scope: "partial",
        signal: "Questions hang for everyone",
        quickCheck: "Try a typed question; a universal stall is the backend",
      },
      {
        pattern: "Free limit reached",
        scope: "local",
        signal: "Questions refused for your account",
        quickCheck: "Daily free quota",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "StudyX is down",
        alternative: "Question AI, Brainly AI or Gauth (monitored on DownForAI) answer homework questions",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  talkpal: {
    slug: "talkpal",
    providerSummary:
      "Talkpal is an AI language tutor with text and voice conversations in many languages, built on language models, on freemium plans. Failures are conversations not responding and voice features failing.",
    docsUrl: "https://talkpal.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "talkpal.ai app and web", description: "Conversations", criticality: "critical" },
      { name: "Model and speech backend", description: "Generation and synthesis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tutor not responding",
        scope: "partial",
        signal: "Messages hang for everyone",
        quickCheck: "A universal hang is the backend or its model provider",
      },
      {
        pattern: "Voice not playing while text works",
        scope: "partial",
        signal: "Replies arrive silently",
        quickCheck: "The speech-synthesis layer fails separately",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Talkpal is down",
        alternative: "Univerbal, Praktika or Speak (monitored on DownForAI) offer conversation practice",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model and speech providers"],
    operatorNotes: [],
  },
  "turnitin-ai": {
    slug: "turnitin-ai",
    providerSummary:
      "Turnitin provides similarity and AI-writing detection inside its Feedback Studio and LMS integrations, used by institutions; the AI detector is a separate model layer from similarity reports. Incidents cluster at assignment deadlines and show as reports pending or LMS launches failing.",
    docsUrl: "https://supportcenter.turnitin.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "turnitin.com", description: "Feedback Studio", criticality: "critical" },
      { name: "Report generation", description: "Similarity and AI detection", criticality: "critical" },
      { name: "LMS integrations", description: "Canvas, Moodle, Blackboard", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Reports stuck pending",
        scope: "partial",
        signal: "Submissions accepted but no report for hours",
        quickCheck: "Deadline load; Turnitin publishes incidents on turnitin.statuspage.io",
      },
      {
        pattern: "AI detection missing while similarity works",
        scope: "partial",
        signal: "The AI indicator shows unavailable",
        quickCheck: "The AI detector is a separate layer and is not offered for all languages or file types",
      },
      {
        pattern: "LMS launch failing",
        scope: "local",
        signal: "The Turnitin tool errors from the LMS",
        quickCheck: "Check the LMS integration keys and clock skew",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Turnitin is down",
        alternative: "Gradescope (monitored on DownForAI) belongs to the same company and may be affected too; accept submissions in the LMS and run reports later",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Canvas / Moodle / Blackboard"],
    operatorNotes: [
      "supportcenter.turnitin.com redirects to helpcenter.turnitin.com, which refuses automated requests (403).",
    ],
  },
  tutorai: {
    slug: "tutorai",
    providerSummary:
      "TutorAI generates personalised courses on any topic from a prompt, on subscription plans; www.tutorai.me redirects to tutorai.me. Generation relays to language models; it is a small hosted app.",
    docsUrl: "https://www.tutorai.me",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "tutorai.me app", description: "Course generator", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Courses not generating",
        scope: "partial",
        signal: "Requests hang for everyone",
        quickCheck: "Try a simple topic; a universal stall is the backend",
      },
      {
        pattern: "Usage limit reached",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "TutorAI is down",
        alternative: "Coursebox or ChatGPT (monitored on DownForAI) generate learning content",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
  "twee-ai": {
    slug: "twee-ai",
    providerSummary:
      "Twee generates lessons, questions and activities for English teachers from texts and YouTube videos with AI, on freemium plans. Generation relays to language models; video-based tools depend on YouTube transcripts.",
    docsUrl: "https://twee.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "twee.com app", description: "Tools", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
      { name: "YouTube transcript fetching", description: "Video tools", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations failing",
        scope: "partial",
        signal: "Every tool errors",
        quickCheck: "Retry a short text; a universal failure is the backend",
      },
      {
        pattern: "Video tools failing while text tools work",
        scope: "partial",
        signal: "YouTube-based activities error",
        quickCheck: "Transcript fetching breaks when YouTube changes; text tools are unaffected",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Twee is down",
        alternative: "MagicSchool AI or Fetchy (monitored on DownForAI) cover teacher generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers", "YouTube"],
    operatorNotes: [],
  },
  univerbal: {
    slug: "univerbal",
    providerSummary:
      "Univerbal is a language conversation-partner app with instant feedback, built on language models, on subscription plans. Failures are conversations not responding and voice features failing.",
    docsUrl: "https://www.univerbal.app",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Univerbal app", description: "Conversations", criticality: "critical" },
      { name: "Model and speech backend", description: "Generation and synthesis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Partner not responding",
        scope: "partial",
        signal: "Messages hang for everyone",
        quickCheck: "A universal hang is the backend or its model provider",
      },
      {
        pattern: "Subscription not recognised",
        scope: "local",
        signal: "Features locked for your account",
        quickCheck: "Restore purchases",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Univerbal is down",
        alternative: "Talkpal, Praktika or Loora (monitored on DownForAI) offer conversation practice",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model and speech providers", "App stores"],
    operatorNotes: [],
  },
  wisdolia: {
    slug: "wisdolia",
    providerSummary:
      "Wisdolia generated flashcards from PDFs and lecture notes; it has been rebranded as Jungle and wisdolia.com now redirects to jungleai.com. Existing users are on the successor product, which shares its backend.",
    docsUrl: "https://wisdolia.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "wisdolia.com → jungleai.com", description: "Redirect", criticality: "low" },
      { name: "Jungle app", description: "Successor", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Old Wisdolia extension or links broken",
        scope: "local",
        signal: "Bookmarks land on jungleai.com",
        quickCheck: "Expected after the rebrand; sign in on the new domain",
      },
      {
        pattern: "Successor generation stuck",
        scope: "partial",
        signal: "Jungle uploads never produce cards",
        quickCheck: "See the Jungle entry; same backend",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Wisdolia",
        alternative: "Jungle, Knowt or StudyFetch (monitored on DownForAI) build flashcards from notes",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [
      "wisdolia.com redirects to jungleai.com; DownForAI's probe follows the redirect.",
    ],
  },
  yippity: {
    slug: "yippity",
    providerSummary:
      "Yippity converts text and URLs into quiz question sets with AI, on freemium plans, relaying to language models. It is a small hosted app with one generation backend.",
    docsUrl: "https://yippity.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "yippity.io app", description: "Generator", criticality: "critical" },
      { name: "Generation backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Quizzes not generating",
        scope: "partial",
        signal: "Requests hang for everyone",
        quickCheck: "Try a short text; a universal stall is the backend",
      },
      {
        pattern: "Usage limit reached",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Yippity is down",
        alternative: "Quizgecko or Quizizz (monitored on DownForAI) generate quizzes",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers"],
    operatorNotes: [],
  },
};
