-- CreateTable
CREATE TABLE "TrelloIntegration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accessTokenSecret" TEXT NOT NULL,
    "trelloMemberId" TEXT NOT NULL,
    "trelloFullName" TEXT NOT NULL,
    "trelloUsername" TEXT NOT NULL,
    "defaultBoardId" TEXT,
    "defaultBoardName" TEXT,
    "defaultListId" TEXT,
    "defaultListName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrelloIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrelloIntegration_workspaceId_key" ON "TrelloIntegration"("workspaceId");

-- AddForeignKey
ALTER TABLE "TrelloIntegration" ADD CONSTRAINT "TrelloIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
