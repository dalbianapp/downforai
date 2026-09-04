import type { TopServiceContent } from "@/content/top-services/types";

// SPORTS_BETTING — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start sports-betting-2.ts and register it in ./index.ts if it grows.
export const SPORTS_BETTING: Record<string, TopServiceContent> = {
  oddsjam: {
    slug: "oddsjam",
    providerSummary:
      "OddsJam aggregates odds from dozens of sportsbooks in near real time to surface positive-EV bets, arbitrage and an odds screen, on the web and in mobile apps. Its value depends entirely on live pricing feeds from each sportsbook.",
    docsUrl: "https://help.oddsjam.com",
    pricingUrl: "https://oddsjam.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "oddsjam.com web app", description: "Odds screen, +EV and arbitrage tools", criticality: "critical" },
      { name: "Sportsbook odds feeds", description: "Per-book pricing pulled continuously", criticality: "critical" },
      { name: "iOS / Android apps", description: "Same feeds as the web app", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Stale or lagging lines for one sportsbook",
        scope: "partial",
        signal: "Odds for a specific book stop updating while other books move; +EV or arbitrage opportunities appear that are gone at the book",
        quickCheck: "Compare the timestamp on the odds screen with the book's own site; if only one book lags, it is a feed issue, not an OddsJam outage",
      },
      {
        pattern: "A sportsbook disappears from the screen",
        scope: "partial",
        signal: "A book you had filtered is missing or shows no markets, usually after that book changed its site or blocked scraping",
        quickCheck: "Check whether the book is still listed in the sportsbook filter; temporary removals are normally announced in the help center",
      },
      {
        pattern: "Slow odds screen during high-volume windows",
        scope: "global",
        signal: "Pages take many seconds to load or filters time out around NFL Sundays, big fight nights or playoff slates",
        quickCheck: "Narrow the filter to one league and one market; if it stays slow for every user, wait for the peak to pass",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "OddsJam feeds are stale or the app is down before a big slate",
        alternative: "BetQL, Dimers or Action Network (all monitored on DownForAI) publish odds comparison and picks you can cross-check",
        switchingCost: "medium",
        note: "Arbitrage and +EV scanning are OddsJam-specific; competitors mostly cover odds comparison",
      },
    ],
    ecosystemDependencies: ["Sportsbook pricing feeds (per-book scraping and APIs)"],
    operatorNotes: [
      "Most 'OddsJam is wrong' reports are a single book's feed lagging. Treat a screen-wide stall across all books as the real outage signal.",
    ],
  },
  accuscore: {
    slug: "accuscore",
    providerSummary:
      "AccuScore runs simulation-based projections for major leagues, sold to consumers by subscription and to businesses as data. Its site is content-heavy; failures are projections not updating before games and login problems.",
    docsUrl: "https://accuscore.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "accuscore.com", description: "Projections and picks", criticality: "critical" },
      { name: "Simulation pipeline", description: "Pre-game projections", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Projections not published",
        scope: "partial",
        signal: "Today's games show stale or missing numbers",
        quickCheck: "Compare with yesterday's slate; a missing slate is the pipeline, not the site",
      },
      {
        pattern: "Subscriber content locked",
        scope: "local",
        signal: "Paid picks show as locked for your account",
        quickCheck: "Sign out and in; check the subscription status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AccuScore is down",
        alternative: "Dimers or SportsLine (monitored on DownForAI) publish simulation-based projections",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Sports data feeds"],
    operatorNotes: [],
  },
  "action-network": {
    slug: "action-network",
    providerSummary:
      "Action Network is a sports-betting media platform with live odds, public betting data, bet tracking and the Playbook AI insights, through its site and apps with a PRO subscription. Incidents are live odds not updating, bet sync failing and paid content locked.",
    docsUrl: "https://actionnetwork.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "actionnetwork.com and apps", description: "Odds, picks, tracking", criticality: "critical" },
      { name: "Odds and betting-data feeds", description: "Live markets", criticality: "critical" },
      { name: "Sportsbook sync", description: "Bet tracking", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Odds frozen",
        scope: "partial",
        signal: "Lines do not move while books are moving",
        quickCheck: "Compare with a sportsbook; frozen lines are a feed problem",
      },
      {
        pattern: "Bet sync failing for one sportsbook",
        scope: "local",
        signal: "Tracked bets stop importing from one book",
        quickCheck: "Reconnect the book; sync depends on the book's login flow",
      },
      {
        pattern: "PRO content locked for subscribers",
        scope: "local",
        signal: "Picks show a paywall despite an active plan",
        quickCheck: "Restore purchases in the app or sign in again on the web",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Action Network is down",
        alternative: "OddsJam, BetQL or Dimers (monitored on DownForAI) cover odds and picks",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds data providers", "Sportsbook accounts for sync"],
    operatorNotes: [
      "help.actionnetwork.com was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  betideas: {
    slug: "betideas",
    providerSummary:
      "BetIdeas publishes free AI predictions and value bets for football and US sports as a content site. Failures are predictions missing for a slate or the site being unreachable.",
    docsUrl: "https://betideas.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "betideas.com", description: "Predictions", criticality: "critical" },
      { name: "Prediction pipeline", description: "Daily generation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Predictions missing for today",
        scope: "partial",
        signal: "The slate is empty while fixtures exist",
        quickCheck: "A missing slate is the pipeline, not the website",
      },
      {
        pattern: "Site unreachable",
        scope: "global",
        signal: "Pages time out",
        quickCheck: "Check DownForAI's probe; a content site has no other surface",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "BetIdeas is down",
        alternative: "Forebet or SportBot AI (monitored on DownForAI) publish free predictions",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds and fixtures feeds"],
    operatorNotes: [],
  },
  betql: {
    slug: "betql",
    providerSummary:
      "BetQL grades bets with computer models across US sports through its site and apps, on subscription tiers. Incidents are model grades not updating with the lines and paid features locked.",
    docsUrl: "https://betql.co",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "betql.co and apps", description: "Model grades and picks", criticality: "critical" },
      { name: "Odds and model pipeline", description: "Live grades", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Grades stale",
        scope: "partial",
        signal: "Line values do not change while books move",
        quickCheck: "Compare with a sportsbook; stale grades are the odds feed",
      },
      {
        pattern: "Premium picks locked",
        scope: "local",
        signal: "Subscribers see the paywall",
        quickCheck: "Restore purchases or re-login",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "BetQL is down",
        alternative: "Action Network, Dimers or Rithmm (monitored on DownForAI) offer model-based picks",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds data providers"],
    operatorNotes: [],
  },
  "bettingpros-sharp-ai": {
    slug: "bettingpros-sharp-ai",
    providerSummary:
      "BettingPros (a FantasyPros property) aggregates odds, expert picks and projections, with the Sharp AI assistant answering betting questions, on a premium subscription. Incidents are odds not refreshing and the assistant not answering.",
    docsUrl: "https://bettingpros.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "bettingpros.com", description: "Odds, picks, tools", criticality: "critical" },
      { name: "Sharp AI", description: "Assistant", criticality: "high" },
      { name: "Odds feeds", description: "Live markets", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Sharp AI not answering",
        scope: "partial",
        signal: "The assistant hangs or errors while the site works",
        quickCheck: "The AI layer relies on a language-model provider and fails on its own",
      },
      {
        pattern: "Odds stale",
        scope: "partial",
        signal: "Lines lag the books",
        quickCheck: "Compare with a sportsbook; lag is the feed",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "BettingPros is down",
        alternative: "Action Network or OddsJam (monitored on DownForAI) cover odds and picks",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds data providers", "Third-party language-model providers"],
    operatorNotes: [],
  },
  deepbetting: {
    slug: "deepbetting",
    providerSummary:
      "DeepBetting sells machine-learning predictions and value bets for football and major sports by subscription. It is a single web app; failures are predictions missing for a slate and account access problems.",
    docsUrl: "https://deepbetting.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "deepbetting.io", description: "Predictions", criticality: "critical" },
      { name: "Model pipeline", description: "Daily predictions", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Predictions not published",
        scope: "partial",
        signal: "Today's fixtures show no numbers",
        quickCheck: "A missing slate is the pipeline",
      },
      {
        pattern: "Subscriber access lost",
        scope: "local",
        signal: "Paid predictions locked for your account",
        quickCheck: "Check the subscription; contact support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "DeepBetting is down",
        alternative: "Sports-AI, Forebet or BetIdeas (monitored on DownForAI) publish football predictions",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds and results feeds"],
    operatorNotes: [],
  },
  dimers: {
    slug: "dimers",
    providerSummary:
      "Dimers (Cipher Sports) publishes simulation-based predictions, best bets and odds comparison for US sports as a free ad-supported site with a Pro tier. Incidents are simulations missing for a slate and odds not refreshing.",
    docsUrl: "https://dimers.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "dimers.com", description: "Predictions and best bets", criticality: "critical" },
      { name: "Simulation pipeline", description: "Per-game simulations", criticality: "critical" },
      { name: "Odds feeds", description: "Comparison", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Simulations missing",
        scope: "partial",
        signal: "Games show no win probabilities",
        quickCheck: "A missing slate is the pipeline",
      },
      {
        pattern: "Odds stale",
        scope: "partial",
        signal: "Best-bet edges do not update while books move",
        quickCheck: "Compare with a sportsbook",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dimers is down",
        alternative: "AccuScore, SportsLine or BetQL (monitored on DownForAI) publish model picks",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds data providers"],
    operatorNotes: [],
  },
  forebet: {
    slug: "forebet",
    providerSummary:
      "Forebet publishes mathematical football predictions for hundreds of leagues on its site and apps, supported by ads; the site blocks direct probes. Failures are predictions missing and the site or app being unreachable.",
    docsUrl: "https://forebet.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "forebet.com and apps", description: "Predictions", criticality: "critical" },
      { name: "Prediction pipeline", description: "Daily fixtures", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Predictions missing for a competition",
        scope: "partial",
        signal: "Fixtures show without probabilities",
        quickCheck: "Check another league; one league missing is data, all missing is the pipeline",
      },
      {
        pattern: "Site unreachable or blocking",
        scope: "global",
        signal: "Pages error or show anti-bot challenges",
        quickCheck: "Try the app; the site's anti-bot layer sometimes blocks real users",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Forebet is down",
        alternative: "BetIdeas, Sports-AI or DeepBetting (monitored on DownForAI) publish football predictions",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Fixtures and odds feeds"],
    operatorNotes: [
      "forebet.com returns 403 to automated requests, so DownForAI's probe reads as blocked rather than down.",
    ],
  },
  "juice-reel": {
    slug: "juice-reel",
    providerSummary:
      "Juice Reel is a bet-tracking app that syncs wagers from sportsbook accounts and sells AI-ranked picks from tracked bettors, on freemium plans. Its main dependency is sportsbook sync, which breaks whenever a book changes its login or site.",
    docsUrl: "https://juicereel.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Juice Reel app", description: "Tracking and picks", criticality: "critical" },
      { name: "Sportsbook sync", description: "Bet import", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Sync failing for one sportsbook",
        scope: "partial",
        signal: "Bets from one book stop importing for everyone",
        quickCheck: "Book-side changes; wait for an app update rather than reconnecting repeatedly",
      },
      {
        pattern: "Account link broken",
        scope: "local",
        signal: "One book shows disconnected",
        quickCheck: "Reconnect; two-factor prompts from the book cause this",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Juice Reel is down",
        alternative: "Action Network (monitored on DownForAI) also tracks bets with sportsbook sync",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Sportsbook account access"],
    operatorNotes: [],
  },
  "leans-ai": {
    slug: "leans-ai",
    providerSummary:
      "Leans.AI sells daily AI picks for US sports by subscription through its site and app. It is a single hosted service; failures are picks not published and subscriber access problems.",
    docsUrl: "https://leans.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "leans.ai and app", description: "Picks", criticality: "critical" },
      { name: "Pick pipeline", description: "Daily generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Picks not published",
        scope: "partial",
        signal: "The day's card is empty",
        quickCheck: "A missing card is the pipeline",
      },
      {
        pattern: "Subscriber access lost",
        scope: "local",
        signal: "Paid picks locked for your account",
        quickCheck: "Restore purchases or re-login",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Leans.AI is down",
        alternative: "Rithmm, BetQL or Dimers (monitored on DownForAI) offer model picks",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds and results feeds"],
    operatorNotes: [],
  },
  pandascore: {
    slug: "pandascore",
    providerSummary:
      "PandaScore provides esports data and odds through a B2B REST API and websockets, used by bookmakers and media on contracts. Incidents are API errors, live data delays and rate limits, all visible in customer integrations rather than on a website.",
    docsUrl: "https://developers.pandascore.co",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.pandascore.co", description: "REST API", criticality: "critical" },
      { name: "Live data feeds", description: "Websockets and live endpoints", criticality: "critical" },
      { name: "pandascore.co", description: "Marketing site", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API 5xx or timeouts",
        scope: "partial",
        signal: "Requests fail across endpoints",
        quickCheck: "Retry with backoff; contact support if it persists",
      },
      {
        pattern: "Live data lagging",
        scope: "partial",
        signal: "Match states update late while the API answers",
        quickCheck: "Live pipelines fail independently of the REST API",
      },
      {
        pattern: "429 rate limits",
        scope: "local",
        signal: "Requests refused with 429",
        quickCheck: "Check your plan's request limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "PandaScore is down",
        alternative: "No monitored equivalent for esports data; keep a cache of the last known state and degrade gracefully",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI monitors the marketing site only; API incidents may not appear there.",
    ],
  },
  "parlay-savant": {
    slug: "parlay-savant",
    providerSummary:
      "Parlay Savant is an AI research assistant that writes and runs predictive analyses on US sports odds and props, relaying to language models, on subscription; the site blocks direct probes. Incidents are analyses failing to run and odds data missing.",
    docsUrl: "https://parlaysavant.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "parlaysavant.com app", description: "Assistant", criticality: "critical" },
      { name: "Analysis backend", description: "Model relay and data", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Analyses failing",
        scope: "partial",
        signal: "Every question errors or hangs",
        quickCheck: "Retry a simple question; a universal failure is the backend or its model provider",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Queries refused for your account",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Parlay Savant is down",
        alternative: "BettingPros Sharp AI or Sharp App (monitored on DownForAI) cover props analysis",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party language-model providers", "Odds data providers"],
    operatorNotes: [
      "parlaysavant.com is marked as blocking probes in the DB; the technical signal may read as blocked rather than down.",
    ],
  },
  rebelbetting: {
    slug: "rebelbetting",
    providerSummary:
      "RebelBetting scans bookmakers for value bets and sure bets with its web app and desktop tools, by subscription. Its core dependency is odds collection from many bookmakers, so coverage drops when a book blocks or changes.",
    docsUrl: "https://rebelbetting.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "RebelBetting web app", description: "Scanner", criticality: "critical" },
      { name: "Odds collection", description: "Per-bookmaker feeds", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One bookmaker missing from results",
        scope: "partial",
        signal: "Bets from a specific book disappear for everyone",
        quickCheck: "Book-side blocking; check RebelBetting's bookmaker list for a notice",
      },
      {
        pattern: "Scanner empty",
        scope: "partial",
        signal: "No value bets at all across books",
        quickCheck: "A total absence is the collection backend, not the market",
      },
      {
        pattern: "Login failing",
        scope: "local",
        signal: "Credentials rejected",
        quickCheck: "Check the subscription status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "RebelBetting is down",
        alternative: "OddsJam or Sports-AI (monitored on DownForAI) scan for value bets",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Bookmaker sites and odds feeds"],
    operatorNotes: [
      "support.rebelbetting.com was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  rithmm: {
    slug: "rithmm",
    providerSummary:
      "Rithmm is a mobile app with predictive models, Smart Signals and a custom model builder for NFL, NBA and MLB, by subscription. Incidents are picks not generating before games and the app failing to load models.",
    docsUrl: "https://rithmm.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Rithmm app", description: "iOS and Android", criticality: "critical" },
      { name: "Model backend", description: "Predictions and custom models", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Picks not generated",
        scope: "partial",
        signal: "Today's games show no predictions",
        quickCheck: "A missing slate is the backend",
      },
      {
        pattern: "Custom model build failing",
        scope: "local",
        signal: "Model creation errors for your account",
        quickCheck: "Retry with fewer factors; contact support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Rithmm is down",
        alternative: "BetQL, Leans.AI or Dimers (monitored on DownForAI) offer model picks",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds and stats feeds", "App stores"],
    operatorNotes: [],
  },
  "sharp-app": {
    slug: "sharp-app",
    providerSummary:
      "Sharp App provides +EV tools, props simulations and the Proptimizer for US sports through its web app, by subscription. Its incidents are odds not refreshing and simulations failing.",
    docsUrl: "https://sharp.app",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sharp.app", description: "Tools", criticality: "critical" },
      { name: "Odds feeds", description: "Live markets", criticality: "critical" },
      { name: "Simulation backend", description: "Props and +EV", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Odds stale",
        scope: "partial",
        signal: "Edges do not move while books move",
        quickCheck: "Compare with a sportsbook; lag is the feed",
      },
      {
        pattern: "Simulations not running",
        scope: "partial",
        signal: "Props tools show no numbers",
        quickCheck: "The simulation layer fails independently of the odds",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sharp App is down",
        alternative: "OddsJam or BettingPros Sharp AI (monitored on DownForAI) cover +EV and props",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds data providers"],
    operatorNotes: [],
  },
  "sportbot-ai": {
    slug: "sportbot-ai",
    providerSummary:
      "SportBot AI publishes free AI picks with public ROI tracking and value-bet detection across soccer and US leagues, with a paid tier. Failures are picks missing for a slate and the site being unreachable.",
    docsUrl: "https://sportbotai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sportbotai.com", description: "Picks", criticality: "critical" },
      { name: "Pick pipeline", description: "Daily generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Picks not published",
        scope: "partial",
        signal: "The day's card is empty",
        quickCheck: "A missing card is the pipeline",
      },
      {
        pattern: "Site unreachable",
        scope: "global",
        signal: "Pages time out",
        quickCheck: "Check DownForAI's probe",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SportBot AI is down",
        alternative: "BetIdeas, Forebet or Sports-AI (monitored on DownForAI) publish free predictions",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds and results feeds"],
    operatorNotes: [],
  },
  "sports-ai": {
    slug: "sports-ai",
    providerSummary:
      "Sports-AI computes true odds and compares dozens of bookmakers to surface value bets across many sports, by subscription. Its incidents are bookmaker odds missing and the model output stale.",
    docsUrl: "https://sports-ai.dev",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sports-ai.dev app", description: "Value bets", criticality: "critical" },
      { name: "Odds collection", description: "Bookmaker comparison", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Bookmaker missing from comparison",
        scope: "partial",
        signal: "One book's odds disappear for everyone",
        quickCheck: "Feed problem for that book; others keep working",
      },
      {
        pattern: "Value bets not refreshing",
        scope: "partial",
        signal: "The same bets stay listed after odds moved",
        quickCheck: "Compare with a book; stale lists are the pipeline",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sports-AI is down",
        alternative: "RebelBetting or OddsJam (monitored on DownForAI) scan for value bets",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds data providers"],
    operatorNotes: [],
  },
  sportsline: {
    slug: "sportsline",
    providerSummary:
      "SportsLine is CBS Sports' prediction service with simulation-based projections, expert picks and the SportsLine AI tools, behind a Paramount-managed subscription. Incidents are projections missing for a slate and subscriber sign-in failing.",
    docsUrl: "https://sportsline.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sportsline.com", description: "Projections and picks", criticality: "critical" },
      { name: "Simulation pipeline", description: "Per-game projections", criticality: "critical" },
      { name: "Paramount sign-in", description: "Subscriber authentication", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Projections missing",
        scope: "partial",
        signal: "Games show no simulated scores",
        quickCheck: "A missing slate is the pipeline",
      },
      {
        pattern: "Subscriber sign-in failing",
        scope: "partial",
        signal: "Logins error for everyone",
        quickCheck: "The Paramount identity service is shared with other CBS properties",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SportsLine is down",
        alternative: "Dimers, AccuScore or Action Network (monitored on DownForAI) publish projections",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Paramount / CBS identity services"],
    operatorNotes: [],
  },
  "zcode-system": {
    slug: "zcode-system",
    providerSummary:
      "ZCode System is a long-running subscription prediction service combining machine models with expert handicappers, with a member area and tools. The DB points at zcodesystem.co, which returned 404 when this entry was written; the live site is zcodesystem.com.",
    docsUrl: "https://zcodesystem.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "zcodesystem.com", description: "Members area and tools", criticality: "critical" },
      { name: "Prediction pipeline", description: "Daily picks", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Members area unreachable",
        scope: "global",
        signal: "Login page errors",
        quickCheck: "Check zcodesystem.com directly; the .co domain is not the live site",
      },
      {
        pattern: "Picks not published",
        scope: "partial",
        signal: "The day's card is empty",
        quickCheck: "A missing card is the pipeline",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ZCode is down",
        alternative: "AccuScore, SportsLine or Dimers (monitored on DownForAI) publish model picks",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Odds and results feeds"],
    operatorNotes: [
      "The DB's website (zcodesystem.co) returned 404 when this entry was written, so the probe may read as down; zcodesystem.com answers 200.",
    ],
  },
};
