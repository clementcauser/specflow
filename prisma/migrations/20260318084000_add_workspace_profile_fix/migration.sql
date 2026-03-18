/*
  Warnings:

  - The values [ENTERPRISE] on the enum `WorkspaceProfileType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WorkspaceProfileType_new" AS ENUM ('INTERNAL', 'FREELANCE', 'STARTUP', 'AGENCY', 'PERSONAL');
ALTER TABLE "Workspace" ALTER COLUMN "profileType" TYPE "WorkspaceProfileType_new" USING ("profileType"::text::"WorkspaceProfileType_new");
ALTER TYPE "WorkspaceProfileType" RENAME TO "WorkspaceProfileType_old";
ALTER TYPE "WorkspaceProfileType_new" RENAME TO "WorkspaceProfileType";
DROP TYPE "public"."WorkspaceProfileType_old";
COMMIT;
