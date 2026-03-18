import {
  WorkspaceProductType,
  WorkspaceProfileType,
  WorkspaceRole,
  WorkspacePlan,
  InvitationStatus as PrismaInvitationStatus,
} from "@prisma/client";

export type Role = WorkspaceRole;
export type Plan = WorkspacePlan;
export type InvitationStatus = PrismaInvitationStatus;

export const ROLE_LABELS: Record<Role, string> = {
  [WorkspaceRole.OWNER]: "Propriétaire",
  [WorkspaceRole.ADMIN]: "Administrateur",
  [WorkspaceRole.MEMBER]: "Membre",
};

export const PLAN_LABELS: Record<Plan, string> = {
  [WorkspacePlan.FREE]: "Gratuit",
  [WorkspacePlan.PRO]: "Pro",
  [WorkspacePlan.ENTERPRISE]: "Entreprise",
};

// Hiérarchie des permissions
export const ROLE_RANK: Record<Role, number> = {
  [WorkspaceRole.OWNER]: 3,
  [WorkspaceRole.ADMIN]: 2,
  [WorkspaceRole.MEMBER]: 1,
};

export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}

export const WORKSPACE_PROFILE_TYPE_LABELS: Record<
  WorkspaceProfileType,
  string
> = {
  [WorkspaceProfileType.FREELANCE]: "Freelance / indépendant",
  [WorkspaceProfileType.AGENCY]: "Agence web / digitale",
  [WorkspaceProfileType.STARTUP]: "Startup / éditeur SaaS",
  [WorkspaceProfileType.INTERNAL]: "Équipe interne / DSI",
  [WorkspaceProfileType.PERSONAL]: "Personnel",
};

export const WORKSPACE_PRODUCT_TYPE_LABELS: Record<
  WorkspaceProductType,
  string
> = {
  [WorkspaceProductType.ECOMMERCE]: "e-commerce",
  [WorkspaceProductType.SAAS]: "SaaS / application web",
  [WorkspaceProductType.MARKETPLACE]: "Marketplace",
  [WorkspaceProductType.LANDING_PAGE]: "Landing page",
  [WorkspaceProductType.MOBILE]: "Application mobile",
  [WorkspaceProductType.DESKTOP]: "Application desktop",
  [WorkspaceProductType.API]: "API / back-end",
  [WorkspaceProductType.IOT]: "IoT",
  [WorkspaceProductType.AI]: "IA",
  [WorkspaceProductType.OTHER]: "Autre",
};
