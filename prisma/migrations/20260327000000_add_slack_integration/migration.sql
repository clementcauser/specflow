-- CreateTable
CREATE TABLE "SlackIntegration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "botUserId" TEXT,
    "teamSlackId" TEXT,
    "teamSlackName" TEXT,
    "defaultChannelId" TEXT,
    "defaultChannelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlackIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlackIntegration_workspaceId_key" ON "SlackIntegration"("workspaceId");

-- AddForeignKey
ALTER TABLE "SlackIntegration" ADD CONSTRAINT "SlackIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
