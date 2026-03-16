"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Role } from "@/types/teams";

// ─── Schemas de validation ────────────────────────────────────────────────

const teamSchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères").max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Uniquement des lettres minuscules, chiffres et tirets",
    ),
  description: z.string().max(200).optional(),
  plan: z.enum(["free", "pro", "enterprise"]).default("free"),
});

// ─── Helpers ──────────────────────────────────────────────────────────────

async function getMemberRole(
  userId: string,
  orgId: string,
): Promise<Role | null> {
  const member = await prisma.member.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
    select: { role: true },
  });
  return (member?.role as Role) ?? null;
}

async function assertRole(userId: string, orgId: string, required: Role[]) {
  const role = await getMemberRole(userId, orgId);
  if (!role || !required.includes(role)) {
    throw new Error("Permission insuffisante");
  }
  return role;
}

// ─── Actions ──────────────────────────────────────────────────────────────

export async function createTeam(data: z.infer<typeof teamSchema>) {
  const session = await requireSession();
  const parsed = teamSchema.parse(data);

  const existing = await prisma.organization.findUnique({
    where: { slug: parsed.slug },
  });
  if (existing) throw new Error("Ce slug est déjà utilisé");

  const org = await prisma.organization.create({
    data: {
      ...parsed,
      members: {
        create: { userId: session.user.id, role: "owner" },
      },
    },
  });

  revalidatePath("/settings/teams");
  return org;
}

export async function updateTeam(
  orgId: string,
  data: Partial<z.infer<typeof teamSchema>>,
) {
  const session = await requireSession();
  await assertRole(session.user.id, orgId, ["owner", "admin"]);

  const parsed = teamSchema.partial().parse(data);

  if (parsed.slug) {
    const conflict = await prisma.organization.findFirst({
      where: { slug: parsed.slug, NOT: { id: orgId } },
    });
    if (conflict) throw new Error("Ce slug est déjà utilisé");
  }

  const org = await prisma.organization.update({
    where: { id: orgId },
    data: parsed,
  });

  revalidatePath("/settings/teams");
  return org;
}

export async function deleteTeam(orgId: string) {
  const session = await requireSession();
  await assertRole(session.user.id, orgId, ["owner"]);

  const memberCount = await prisma.member.count({
    where: { organizationId: orgId },
  });
  if (memberCount > 1) {
    throw new Error(
      "Transférez la propriété ou retirez tous les membres avant de supprimer",
    );
  }

  await prisma.organization.delete({ where: { id: orgId } });

  revalidatePath("/settings/teams");
  redirect("/settings/teams");
}

export async function getUserTeams() {
  const session = await requireSession();

  return prisma.organization.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: {
        where: { userId: session.user.id },
        select: { role: true },
      },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getTeamWithMembers(orgId: string) {
  const session = await requireSession();
  await assertRole(session.user.id, orgId, ["owner", "admin", "member"]);

  return prisma.organization.findUniqueOrThrow({
    where: { id: orgId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      invitations: {
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
