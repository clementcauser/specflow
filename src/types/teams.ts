export type Role = "owner" | "admin" | "member";
export type Plan = "free" | "pro" | "enterprise";
export type InvitationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  member: "Membre",
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Gratuit",
  pro: "Pro",
  enterprise: "Entreprise",
};

// Hiérarchie des permissions
export const ROLE_RANK: Record<Role, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}
