-- PR8 ÉTAPE A : MonitoringCapability + fix ServiceLifecycleStatus
-- Séparation des 2 dimensions : état service vs capacité de monitoring

-- 1. Nouveau enum MonitoringCapability
CREATE TYPE "MonitoringCapability" AS ENUM (
  'OFFICIAL_STATUS_API',
  'OFFICIAL_STATUS_PAGE',
  'BASIC_PUBLIC_SURFACE',
  'BLOCKED_FROM_PROBES',
  'UNVERIFIABLE'
);

-- 2. Nouveaux champs sur Service
ALTER TABLE "Service"
  ADD COLUMN "monitoringCapability"        "MonitoringCapability" NOT NULL DEFAULT 'BASIC_PUBLIC_SURFACE',
  ADD COLUMN "monitoringNote"              TEXT,
  ADD COLUMN "lastManualVerificationAt"    TIMESTAMP(3);

-- 3. Remplacer ServiceLifecycleStatus (toutes les lignes sont ACTIVE — safe)
--    MONITORING_LIMITED supprimé (remplacé par monitoringCapability)
--    POSSIBLY_DISCONTINUED renommé POSSIBLY_INACTIVE (affirmation plus neutre)
ALTER TABLE "Service" ALTER COLUMN "lifecycleStatus" DROP DEFAULT;
ALTER TABLE "Service" ALTER COLUMN "lifecycleStatus" TYPE TEXT;
DROP TYPE "ServiceLifecycleStatus";
CREATE TYPE "ServiceLifecycleStatus" AS ENUM ('ACTIVE', 'POSSIBLY_INACTIVE', 'DISCONTINUED');
ALTER TABLE "Service" ALTER COLUMN "lifecycleStatus" TYPE "ServiceLifecycleStatus"
  USING (CASE "lifecycleStatus"
    WHEN 'ACTIVE'                THEN 'ACTIVE'
    WHEN 'MONITORING_LIMITED'    THEN 'ACTIVE'
    WHEN 'POSSIBLY_DISCONTINUED' THEN 'POSSIBLY_INACTIVE'
    WHEN 'DISCONTINUED'          THEN 'DISCONTINUED'
    ELSE                              'ACTIVE'
  END)::"ServiceLifecycleStatus";
ALTER TABLE "Service" ALTER COLUMN "lifecycleStatus" SET DEFAULT 'ACTIVE';
