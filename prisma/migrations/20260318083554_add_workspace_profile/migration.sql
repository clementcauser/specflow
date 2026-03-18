/*
  Warnings:

  - The `role` column on the `Invitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Invitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Spec` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan` column on the `Workspace` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `profileType` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkspacePlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "WorkspaceProfileType" AS ENUM ('INTERNAL', 'FREELANCE', 'STARTUP', 'AGENCY', 'ENTERPRISE', 'PERSONAL');

-- CreateEnum
CREATE TYPE "WorkspaceProductType" AS ENUM ('ECOMMERCE', 'SAAS', 'MARKETPLACE', 'LANDING_PAGE', 'MOBILE', 'DESKTOP', 'API', 'IOT', 'AI', 'OTHER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SpecStatus" AS ENUM ('DRAFT', 'GENERATING', 'DONE', 'ERROR');

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "role",
ADD COLUMN     "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
DROP COLUMN "status",
ADD COLUMN     "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "role",
ADD COLUMN     "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "Spec" DROP COLUMN "status",
ADD COLUMN     "status" "SpecStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "productType" "WorkspaceProductType"[],
ADD COLUMN     "profileType" "WorkspaceProfileType" NOT NULL,
DROP COLUMN "plan",
ADD COLUMN     "plan" "WorkspacePlan" NOT NULL DEFAULT 'FREE';
