-- CreateTable
CREATE TABLE "NotionIntegration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "notionWorkspaceId" TEXT,
    "notionWorkspaceName" TEXT,
    "notionWorkspaceIcon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotionIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotionIntegration_workspaceId_key" ON "NotionIntegration"("workspaceId");

-- AddForeignKey
ALTER TABLE "NotionIntegration" ADD CONSTRAINT "NotionIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
