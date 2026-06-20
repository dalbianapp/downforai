-- PR 3: dual-signal architecture
-- Adds StatusSource enum + 5 nullable audit columns to Observation.
-- The existing `status` column is untouched (still the displayed value).

-- CreateEnum
CREATE TYPE "StatusSource" AS ENUM ('OFFICIAL_STATUS_PAGE', 'HTTP_CHECK', 'MIXED', 'FALLBACK');

-- AlterTable
ALTER TABLE "Observation"
  ADD COLUMN "officialStatus"    "ServiceStatus",
  ADD COLUMN "httpDerivedStatus" "ServiceStatus",
  ADD COLUMN "statusSource"      "StatusSource",
  ADD COLUMN "parseOk"           BOOLEAN,
  ADD COLUMN "parseError"        TEXT;
