import type {
  WorkspaceProductType,
  WorkspaceType,
  WorkspaceTeamSize,
  WorkspaceProductStage,
  WorkspaceRole,
  WorkspacePlan,
  InvitationStatus as PrismaInvitationStatus,
} from "@prisma/client";

export type Role = WorkspaceRole;
export type Plan = WorkspacePlan;
export type InvitationStatus = PrismaInvitationStatus;

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Propriétaire",
  ADMIN: "Administrateur",
  MEMBER: "Membre",
  VIEWER: "Observateur",
};

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Gratuit",
  PRO: "Pro",
  ENTERPRISE: "Entreprise",
};

// Hiérarchie des permissions
export const ROLE_RANK: Record<Role, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}

export const WORKSPACE_TYPE_LABELS: Record<WorkspaceType, string> = {
  AGENCY: "Agence",
  PRODUCT: "Produit",
  FREELANCE: "Freelance",
};

export const WORKSPACE_TYPE_DESCRIPTIONS: Record<WorkspaceType, string> = {
  AGENCY: "Je crée des specs pour des projets clients distincts",
  PRODUCT: "Je travaille sur un produit en évolution continue",
  FREELANCE: "Je gère plusieurs clients en parallèle",
};

export const WORKSPACE_TEAM_SIZE_LABELS: Record<WorkspaceTeamSize, string> = {
  SOLO: "Solo",
  SMALL: "2–5",
  MEDIUM: "6–20",
  LARGE: "20+",
};

export const WORKSPACE_PRODUCT_STAGE_LABELS: Record<WorkspaceProductStage, string> = {
  PRE_MVP: "Idée / pré-MVP",
  MVP: "MVP en cours",
  LIVE: "Produit live",
  MATURE: "Produit mature",
};

export const WORKSPACE_PRODUCT_TYPE_LABELS: Record<WorkspaceProductType, string> = {
  ECOMMERCE: "E-commerce",
  SAAS: "SaaS / application web",
  MARKETPLACE: "Marketplace",
  LANDING_PAGE: "Landing page",
  MOBILE: "Application mobile",
  DESKTOP: "Application desktop",
  API: "API / back-end",
  IOT: "IoT",
  AI: "IA",
  OTHER: "Autre",
};
