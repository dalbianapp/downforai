export type CommunityLink = {
  type: "discord" | "reddit" | "github" | "forum" | "x";
  url: string;
  label: string;
  verified?: boolean;
};

export type MonitoredSurface = {
  name: string;
  description: string;
  criticality: "critical" | "high" | "medium" | "low";
};

export type KnownFailurePattern = {
  pattern: string;
  scope: "global" | "partial" | "local";
  signal: string;
  quickCheck: string;
};

export type FallbackAlternative = {
  scenario: string;
  alternative: string;
  switchingCost: "low" | "medium" | "high";
  note?: string;
};

export type TopServiceContent = {
  slug: string;
  providerSummary: string;
  officialStatusUrl?: string;
  docsUrl: string;
  pricingUrl?: string;
  communityLinks: CommunityLink[];
  monitoredSurfaces: MonitoredSurface[];
  statusSegmentation?: string[];
  modelFamilies?: string[];
  commonLimits?: string[];
  knownFailurePatterns: KnownFailurePattern[];
  fallbackAlternatives: FallbackAlternative[];
  ecosystemDependencies: string[];
  operatorNotes: string[];
  diagnosticHeaders?: string[];
  diagnosticCommands?: string[];
};
