import {
  WorkspaceProductType,
  WorkspaceType,
  WorkspaceTeamSize,
  WorkspaceProductStage,
  WorkspaceRole,
  WorkspacePlan,
  InvitationStatus as PrismaInvitationStatus,
} from "@/generated/prisma";

export type Role = WorkspaceRole;
export type Plan = WorkspacePlan;
export type InvitationStatus = PrismaInvitationStatus;

export const ROLE_LABELS: Record<Role, string> = {
  [WorkspaceRole.OWNER]: "Propriétaire",
  [WorkspaceRole.ADMIN]: "Administrateur",
  [WorkspaceRole.MEMBER]: "Membre",
  [WorkspaceRole.VIEWER]: "Observateur",
};

export const PLAN_LABELS: Record<Plan, string> = {
  [WorkspacePlan.FREE]: "Gratuit",
  [WorkspacePlan.PRO]: "Pro",
  [WorkspacePlan.ENTERPRISE]: "Entreprise",
};

// Hiérarchie des permissions
export const ROLE_RANK: Record<Role, number> = {
  [WorkspaceRole.OWNER]: 4,
  [WorkspaceRole.ADMIN]: 3,
  [WorkspaceRole.MEMBER]: 2,
  [WorkspaceRole.VIEWER]: 1,
};

export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}

export const WORKSPACE_TYPE_LABELS: Record<WorkspaceType, string> = {
  [WorkspaceType.AGENCY]: "Agence",
  [WorkspaceType.PRODUCT]: "Produit",
  [WorkspaceType.FREELANCE]: "Freelance",
};

export const WORKSPACE_TYPE_DESCRIPTIONS: Record<WorkspaceType, string> = {
  [WorkspaceType.AGENCY]: "Je crée des specs pour des projets clients distincts",
  [WorkspaceType.PRODUCT]: "Je travaille sur un produit en évolution continue",
  [WorkspaceType.FREELANCE]: "Je gère plusieurs clients en parallèle",
};

export const WORKSPACE_TEAM_SIZE_LABELS: Record<WorkspaceTeamSize, string> = {
  [WorkspaceTeamSize.SOLO]: "Solo",
  [WorkspaceTeamSize.SMALL]: "2–5",
  [WorkspaceTeamSize.MEDIUM]: "6–20",
  [WorkspaceTeamSize.LARGE]: "20+",
};

export const WORKSPACE_PRODUCT_STAGE_LABELS: Record<WorkspaceProductStage, string> = {
  [WorkspaceProductStage.PRE_MVP]: "Idée / pré-MVP",
  [WorkspaceProductStage.MVP]: "MVP en cours",
  [WorkspaceProductStage.LIVE]: "Produit live",
  [WorkspaceProductStage.MATURE]: "Produit mature",
};

export const WORKSPACE_PRODUCT_TYPE_LABELS: Record<WorkspaceProductType, string> = {
  [WorkspaceProductType.ECOMMERCE]: "E-commerce",
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
