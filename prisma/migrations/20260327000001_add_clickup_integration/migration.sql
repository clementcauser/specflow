-- CreateTable
CREATE TABLE "ClickUpIntegration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "clickupUserId" TEXT NOT NULL,
    "clickupUserName" TEXT NOT NULL,
    "clickupWorkspaceId" TEXT NOT NULL,
    "clickupWorkspaceName" TEXT NOT NULL,
    "defaultSpaceId" TEXT,
    "defaultListId" TEXT,
    "defaultListName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClickUpIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClickUpIntegration_workspaceId_key" ON "ClickUpIntegration"("workspaceId");

-- AddForeignKey
ALTER TABLE "ClickUpIntegration" ADD CONSTRAINT "ClickUpIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
