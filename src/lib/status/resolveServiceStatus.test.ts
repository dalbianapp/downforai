// Rule tests for resolveServiceStatus. No test runner configured — run with:
//   npx tsx src/lib/status/resolveServiceStatus.test.ts
import assert from "node:assert";
import { resolveServiceStatus, type ResolveStatusInput, type CommunitySignal } from "./resolveServiceStatus";

const NOW = 1_750_000_000_000; // fixed clock for determinism
const fresh = new Date(NOW - 5 * 60 * 1000); // 5 min ago → fresh
const stale = new Date(NOW - 90 * 60 * 1000); // 90 min ago → stale (>60 min)

const community = (over: Partial<CommunitySignal> = {}): CommunitySignal => ({
  status: "OUTAGE",
  confidence: "PROBABLE",
  reportsWindow: 11,
  signalAt: fresh,
  ...over,
});

const run = (over: Partial<ResolveStatusInput>) =>
  resolveServiceStatus({ technicalStatus: "OPERATIONAL", monitoringCapability: "OFFICIAL_STATUS_API", community: null, nowMs: NOW, ...over });

let pass = 0;
function check(name: string, fn: () => void) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n      ${(e as Error).message}`); process.exitCode = 1; }
}

console.log("resolveServiceStatus — rule tests\n");

check("technical OUTAGE alone → OUTAGE / TECHNICAL / no confidence", () => {
  const r = run({ technicalStatus: "OUTAGE" });
  assert.equal(r.status, "OUTAGE");
  assert.equal(r.source, "TECHNICAL");
  assert.equal(r.confidence, null);
  assert.equal(r.label, "Outage");
  assert.equal(r.reportsInWindow, 0);
});

check("community-only fresh (tech OK), reports OUTAGE → CAPPED to DEGRADED / COMMUNITY / PROBABLE", () => {
  const r = run({ technicalStatus: "OPERATIONAL", community: community({ status: "OUTAGE", reportsWindow: 11 }) });
  assert.equal(r.status, "DEGRADED"); // never OUTAGE on reports alone
  assert.equal(r.source, "COMMUNITY");
  assert.equal(r.confidence, "PROBABLE");
  assert.equal(r.label, "Community-reported issues");
  assert.equal(r.reportsInWindow, 11);
});

check("technical OUTAGE + community elevated → OUTAGE / BOTH / CONFIRMED", () => {
  const r = run({ technicalStatus: "OUTAGE", community: community({ status: "OUTAGE", reportsWindow: 20 }) });
  assert.equal(r.status, "OUTAGE");
  assert.equal(r.source, "BOTH");
  assert.equal(r.confidence, "CONFIRMED");
  assert.equal(r.label, "Confirmed outage");
  assert.equal(r.reportsInWindow, 20);
});

check("stale community signal (>60 min) → ignored, fail-safe to technical", () => {
  const r = run({ technicalStatus: "OPERATIONAL", community: community({ status: "OUTAGE", signalAt: stale }) });
  assert.equal(r.status, "OPERATIONAL");
  assert.equal(r.source, "TECHNICAL");
  assert.equal(r.reportsInWindow, 0);
});

check("operational, no community → OPERATIONAL / TECHNICAL", () => {
  const r = run({ technicalStatus: "OPERATIONAL", community: null });
  assert.equal(r.status, "OPERATIONAL");
  assert.equal(r.source, "TECHNICAL");
  assert.equal(r.label, "Operational");
});

check("technical DEGRADED + community elevated → DEGRADED / BOTH / PROBABLE", () => {
  const r = run({ technicalStatus: "DEGRADED", community: community({ status: "DEGRADED", reportsWindow: 7 }) });
  assert.equal(r.status, "DEGRADED");
  assert.equal(r.source, "BOTH");
  assert.equal(r.confidence, "PROBABLE");
  assert.equal(r.reportsInWindow, 7);
});

check("community present but OPERATIONAL (not elevated) → ignored, technical wins", () => {
  const r = run({ technicalStatus: "OPERATIONAL", community: community({ status: "OPERATIONAL" }) });
  assert.equal(r.status, "OPERATIONAL");
  assert.equal(r.source, "TECHNICAL");
});

check("community fresh DEGRADED, tech OPERATIONAL → DEGRADED / COMMUNITY", () => {
  const r = run({ technicalStatus: "OPERATIONAL", community: community({ status: "DEGRADED", reportsWindow: 5 }) });
  assert.equal(r.status, "DEGRADED");
  assert.equal(r.source, "COMMUNITY");
  assert.equal(r.confidence, "PROBABLE");
});

check("community null status with signalAt → treated as no signal", () => {
  const r = run({ technicalStatus: "OPERATIONAL", community: community({ status: null }) });
  assert.equal(r.status, "OPERATIONAL");
  assert.equal(r.source, "TECHNICAL");
});

console.log(`\n${pass}/9 checks passed.`);
if (process.exitCode === 1) console.error("SOME TESTS FAILED");
