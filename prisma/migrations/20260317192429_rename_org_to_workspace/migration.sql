-- Rename Organization Table to Workspace
ALTER TABLE "Organization" RENAME TO "Workspace";

-- Rename the primary key constraint
ALTER TABLE "Workspace" RENAME CONSTRAINT "Organization_pkey" TO "Workspace_pkey";

-- Rename the unique index on slug
ALTER INDEX "Organization_slug_key" RENAME TO "Workspace_slug_key";

-- Rename Columns in other tables
ALTER TABLE "Invitation" RENAME COLUMN "organizationId" TO "workspaceId";
ALTER TABLE "Member" RENAME COLUMN "organizationId" TO "workspaceId";
ALTER TABLE "Session" RENAME COLUMN "activeOrganizationId" TO "activeWorkspaceId";
ALTER TABLE "Spec" RENAME COLUMN "organizationId" TO "workspaceId";
ALTER TABLE "User" RENAME COLUMN "activeOrganizationId" TO "activeWorkspaceId";

-- Rename Foreign Key Constraints
ALTER TABLE "Invitation" RENAME CONSTRAINT "Invitation_organizationId_fkey" TO "Invitation_workspaceId_fkey";
ALTER TABLE "Member" RENAME CONSTRAINT "Member_organizationId_fkey" TO "Member_workspaceId_fkey";
ALTER TABLE "Spec" RENAME CONSTRAINT "Spec_organizationId_fkey" TO "Spec_workspaceId_fkey";

-- Rename Unique Indices
ALTER INDEX "Invitation_organizationId_email_key" RENAME TO "Invitation_workspaceId_email_key";
ALTER INDEX "Member_userId_organizationId_key" RENAME TO "Member_userId_workspaceId_key";

