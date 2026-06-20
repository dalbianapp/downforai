-- PR 7 ÉTAPE A : champs de masquage sur Incident (sans hard-delete, pour audit)
ALTER TABLE "Incident"
  ADD COLUMN "isFalsePositive" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN "hiddenReason"    TEXT,
  ADD COLUMN "reviewedAt"      TIMESTAMP(3);

CREATE INDEX "Incident_isFalsePositive_startedAt_idx" ON "Incident" ("isFalsePositive", "startedAt" DESC);
