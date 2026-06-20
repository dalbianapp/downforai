-- PR 6: Add ProbeResult enum, ServiceLifecycleStatus enum, probeResult on Observation, lifecycleStatus on Service

CREATE TYPE "ProbeResult" AS ENUM (
  'REACHABLE',
  'BLOCKED',
  'RATE_LIMITED',
  'SERVER_ERROR',
  'TIMEOUT',
  'DNS_FAIL',
  'CONNECTION_FAIL',
  'TLS_ERROR',
  'PARSE_ERROR',
  'UNKNOWN_FAILURE'
);

CREATE TYPE "ServiceLifecycleStatus" AS ENUM (
  'ACTIVE',
  'MONITORING_LIMITED',
  'POSSIBLY_DISCONTINUED',
  'DISCONTINUED'
);

ALTER TABLE "Observation"
  ADD COLUMN "probeResult" "ProbeResult";

ALTER TABLE "Service"
  ADD COLUMN "lifecycleStatus" "ServiceLifecycleStatus" NOT NULL DEFAULT 'ACTIVE';
