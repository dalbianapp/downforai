// Blob pathnames for the hourly status snapshot. Kept deterministic
// (addRandomSuffix: false, allowOverwrite: true in blob.ts) so the same
// pathname is read at render time and overwritten by the next cron run.
export function servicePath(slug: string): string {
  return `snapshots/services/${slug}.json`;
}

export function indexPath(): string {
  return "snapshots/index.json";
}
