"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Role } from "@/types/workspaces";

// ─── Schemas de validation ────────────────────────────────────────────────

const workspaceSchema = z.object({
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
  workspaceId: string,
): Promise<Role | null> {
  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    select: { role: true },
  });
  return (member?.role as Role) ?? null;
}

async function assertRole(
  userId: string,
  workspaceId: string,
  required: Role[],
) {
  const role = await getMemberRole(userId, workspaceId);
  if (!role || !required.includes(role)) {
    throw new Error("Permission insuffisante");
  }
  return role;
}

// ─── Actions ──────────────────────────────────────────────────────────────

export async function createWorkspace(data: z.infer<typeof workspaceSchema>) {
  const session = await requireSession();
  const parsed = workspaceSchema.parse(data);

  const existing = await prisma.workspace.findUnique({
    where: { slug: parsed.slug },
  });
  if (existing) throw new Error("Ce slug est déjà utilisé");

  const workspace = await prisma.workspace.create({
    data: {
      ...parsed,
      members: {
        create: { userId: session.user.id, role: "owner" },
      },
    },
  });

  revalidatePath("/settings/workspaces");
  return workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  data: Partial<z.infer<typeof workspaceSchema>>,
) {
  const session = await requireSession();
  await assertRole(session.user.id, workspaceId, ["owner", "admin"]);

  const parsed = workspaceSchema.partial().parse(data);

  if (parsed.slug) {
    const conflict = await prisma.workspace.findFirst({
      where: { slug: parsed.slug, NOT: { id: workspaceId } },
    });
    if (conflict) throw new Error("Ce slug est déjà utilisé");
  }

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: parsed,
  });

  revalidatePath("/settings/workspaces");
  return workspace;
}

export async function deleteWorkspace(workspaceId: string) {
  const session = await requireSession();
  await assertRole(session.user.id, workspaceId, ["owner"]);

  const memberCount = await prisma.member.count({
    where: { workspaceId },
  });
  if (memberCount > 1) {
    throw new Error(
      "Transférez la propriété ou retirez tous les membres avant de supprimer",
    );
  }

  await prisma.workspace.delete({ where: { id: workspaceId } });

  revalidatePath("/settings/workspaces");
  redirect("/settings/workspaces");
}

export async function getUserWorkspaces() {
  const session = await requireSession();

  return prisma.workspace.findMany({
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

export async function getWorkspaceWithMembers(workspaceId: string) {
  const session = await requireSession();
  await assertRole(session.user.id, workspaceId, ["owner", "admin", "member"]);

  return prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
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
