-- CreateEnum
CREATE TYPE "CheckType" AS ENUM ('HOMEPAGE', 'STATUS_HTML', 'ATLASSIAN_JSON', 'GCP_JSON', 'AWS_HEALTH', 'AZURE_STATUS', 'ROBOTS_TXT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SignalConfidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "ServiceSurface" ADD COLUMN     "checkType" "CheckType" NOT NULL DEFAULT 'HOMEPAGE',
ADD COLUMN     "signalConfidence" "SignalConfidence" NOT NULL DEFAULT 'LOW';
