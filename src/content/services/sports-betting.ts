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
};
