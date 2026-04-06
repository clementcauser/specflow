-- CreateEnum
CREATE TYPE "GitProvider" AS ENUM ('GITHUB', 'GITLAB');

-- CreateTable
CREATE TABLE "GitIntegration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" "GitProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "providerAccountId" TEXT NOT NULL,
    "providerAccountName" TEXT NOT NULL,
    "defaultRepoOwner" TEXT,
    "defaultRepoName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitIntegration_workspaceId_provider_key" ON "GitIntegration"("workspaceId", "provider");

-- AddForeignKey
ALTER TABLE "GitIntegration" ADD CONSTRAINT "GitIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
