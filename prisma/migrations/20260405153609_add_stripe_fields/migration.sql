-- AlterEnum: rename ENTERPRISE to MAX
ALTER TYPE "WorkspacePlan" RENAME VALUE 'ENTERPRISE' TO 'MAX';

-- AlterTable: add Stripe fields to Workspace
ALTER TABLE "Workspace"
  ADD COLUMN "stripeCustomerId"   TEXT,
  ADD COLUMN "subscriptionStatus" TEXT,
  ADD COLUMN "stripePriceId"      TEXT,
  ADD COLUMN "subscriptionId"     TEXT,
  ADD COLUMN "currentPeriodEnd"   TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_stripeCustomerId_key" ON "Workspace"("stripeCustomerId");
CREATE UNIQUE INDEX "Workspace_subscriptionId_key"   ON "Workspace"("subscriptionId");
