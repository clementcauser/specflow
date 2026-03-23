/**
 * Constantes mirant les enums Prisma.
 * En Prisma v6+, les enums ne sont plus exportés comme des objets JavaScript
 * depuis @prisma/client — uniquement comme des types TypeScript.
 * Ce fichier regroupe les constantes runtime et les types associés.
 */

export const WorkspacePlan = {
  FREE: "FREE",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;
export type WorkspacePlan = (typeof WorkspacePlan)[keyof typeof WorkspacePlan];

export const WorkspaceRole = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
} as const;
export type WorkspaceRole = (typeof WorkspaceRole)[keyof typeof WorkspaceRole];

export const WorkspaceType = {
  AGENCY: "AGENCY",
  PRODUCT: "PRODUCT",
  FREELANCE: "FREELANCE",
} as const;
export type WorkspaceType = (typeof WorkspaceType)[keyof typeof WorkspaceType];

export const WorkspaceTeamSize = {
  SOLO: "SOLO",
  SMALL: "SMALL",
  MEDIUM: "MEDIUM",
  LARGE: "LARGE",
} as const;
export type WorkspaceTeamSize =
  (typeof WorkspaceTeamSize)[keyof typeof WorkspaceTeamSize];

export const WorkspaceProductStage = {
  PRE_MVP: "PRE_MVP",
  MVP: "MVP",
  LIVE: "LIVE",
  MATURE: "MATURE",
} as const;
export type WorkspaceProductStage =
  (typeof WorkspaceProductStage)[keyof typeof WorkspaceProductStage];

export const WorkspaceProductType = {
  ECOMMERCE: "ECOMMERCE",
  SAAS: "SAAS",
  MARKETPLACE: "MARKETPLACE",
  LANDING_PAGE: "LANDING_PAGE",
  MOBILE: "MOBILE",
  DESKTOP: "DESKTOP",
  API: "API",
  IOT: "IOT",
  AI: "AI",
  OTHER: "OTHER",
} as const;
export type WorkspaceProductType =
  (typeof WorkspaceProductType)[keyof typeof WorkspaceProductType];

export const InvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type InvitationStatus =
  (typeof InvitationStatus)[keyof typeof InvitationStatus];

export const SpecStatus = {
  DRAFT: "DRAFT",
  GENERATING: "GENERATING",
  DONE: "DONE",
  ERROR: "ERROR",
} as const;
export type SpecStatus = (typeof SpecStatus)[keyof typeof SpecStatus];

export const EpicStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  ARCHIVED: "ARCHIVED",
} as const;
export type EpicStatus = (typeof EpicStatus)[keyof typeof EpicStatus];

export const MoSCoW = {
  MUST: "MUST",
  SHOULD: "SHOULD",
  COULD: "COULD",
  WONT: "WONT",
} as const;
export type MoSCoW = (typeof MoSCoW)[keyof typeof MoSCoW];
