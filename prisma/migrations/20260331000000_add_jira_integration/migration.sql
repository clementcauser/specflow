-- CreateTable
CREATE TABLE "JiraIntegration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "cloudId" TEXT,
    "cloudName" TEXT,
    "cloudUrl" TEXT,
    "defaultProjectKey" TEXT,
    "defaultProjectName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JiraIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JiraIntegration_workspaceId_key" ON "JiraIntegration"("workspaceId");

-- AddForeignKey
ALTER TABLE "JiraIntegration" ADD CONSTRAINT "JiraIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
