"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import type { Role } from "@/types/workspaces";
import { canManageRole } from "@/types/workspaces";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

async function getMemberRole(
  userId: string,
  workspaceId: string,
): Promise<Role | null> {
  const m = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    select: { role: true },
  });
  return (m?.role as Role) ?? null;
}

async function assertRole(
  userId: string,
  workspaceId: string,
  required: Role[],
) {
  const role = await getMemberRole(userId, workspaceId);
  if (!role || !required.includes(role))
    throw new Error("Permission insuffisante");
  return role as Role;
}

// ─── Invitation ────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.email(),
  role: z.enum(["admin", "member"]).default("member"),
});

export async function inviteMember(
  workspaceId: string,
  data: z.infer<typeof inviteSchema>,
) {
  const session = await requireSession();
  const actorRole = await assertRole(session.user.id, workspaceId, [
    "owner",
    "admin",
  ]);
  const parsed = inviteSchema.parse(data);

  if (!canManageRole(actorRole, parsed.role as Role)) {
    throw new Error("Vous ne pouvez pas inviter à ce rôle");
  }

  const existing = await prisma.member.findFirst({
    where: { workspaceId, user: { email: parsed.email } },
  });
  if (existing) throw new Error("Cet utilisateur est déjà membre");

  // Upsert : réutilise une invitation annulée/rejetée si elle existe
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48h

  const invitation = await prisma.invitation.upsert({
    where: {
      workspaceId_email: { workspaceId, email: parsed.email },
    },
    update: {
      role: parsed.role,
      status: "pending",
      expiresAt,
      inviterId: session.user.id,
    },
    create: {
      workspaceId,
      email: parsed.email,
      role: parsed.role,
      status: "pending",
      expiresAt,
      inviterId: session.user.id,
    },
  });

  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: { name: true },
  });

  const inviteUrl = `${process.env.BETTER_AUTH_URL}/invite?token=${invitation.id}`;

  await resend.emails.send({
    from:
      // process.env.NODE_ENV === "production"
      //   ? process.env.EMAIL_FROM!
      //   :
      "Specflow <onboarding@resend.dev>",
    to:
      process.env.NODE_ENV === "development"
        ? process.env.DEV_EMAIL_TO!
        : parsed.email,
    subject: `Invitation à rejoindre ${workspace.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:16px">
          Vous avez été invité à rejoindre ${workspace.name}
        </h2>
        <p style="color:#555;margin-bottom:24px">
          Cliquez sur le bouton ci-dessous pour accepter l'invitation.
          Ce lien est valable 48h.
        </p>
        <a href="${inviteUrl}"
           style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500">
          Rejoindre l'espace de travail
        </a>
      </div>
    `,
  });

  revalidatePath("/settings/workspaces");
}

export async function cancelInvitation(
  workspaceId: string,
  invitationId: string,
) {
  const session = await requireSession();
  await assertRole(session.user.id, workspaceId, ["owner", "admin"]);

  await prisma.invitation.update({
    where: { id: invitationId, workspaceId },
    data: { status: "cancelled" },
  });

  revalidatePath("/settings/workspaces");
}

// ─── Rôles ─────────────────────────────────────────────────────────────────

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  newRole: Role,
) {
  const session = await requireSession();
  const actorRole = await assertRole(session.user.id, workspaceId, [
    "owner",
    "admin",
  ]);

  const target = await prisma.member.findUniqueOrThrow({
    where: { id: memberId },
    select: { role: true, userId: true },
  });

  if (target.userId === session.user.id)
    throw new Error("Vous ne pouvez pas modifier votre propre rôle");
  if (!canManageRole(actorRole, target.role as Role))
    throw new Error("Permission insuffisante");
  if (!canManageRole(actorRole, newRole))
    throw new Error("Vous ne pouvez pas attribuer ce rôle");

  await prisma.member.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  revalidatePath("/settings/workspaces");
}

// ─── Suppression ───────────────────────────────────────────────────────────

export async function removeMember(workspaceId: string, memberId: string) {
  const session = await requireSession();
  const actorRole = await assertRole(session.user.id, workspaceId, [
    "owner",
    "admin",
  ]);

  const target = await prisma.member.findUniqueOrThrow({
    where: { id: memberId },
    select: { role: true, userId: true },
  });

  if (target.userId === session.user.id)
    throw new Error("Utilisez 'Quitter l'espace de travail' à la place");
  if (!canManageRole(actorRole, target.role as Role))
    throw new Error("Permission insuffisante");
  if (target.role === "owner")
    throw new Error("Impossible de retirer le propriétaire");

  await prisma.member.delete({ where: { id: memberId } });

  revalidatePath("/settings/workspaces");
}

export async function leaveWorkspace(workspaceId: string) {
  const session = await requireSession();
  const role = await getMemberRole(session.user.id, workspaceId);
  if (!role) throw new Error("Vous n'êtes pas membre");
  if (role === "owner")
    throw new Error("Transférez la propriété avant de quitter");

  await prisma.member.delete({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId },
    },
  });

  revalidatePath("/settings/workspaces");
}

export async function acceptInvitation(token: string) {
  const session = await requireSession();

  const invitation = await prisma.invitation.findUniqueOrThrow({
    where: { id: token },
  });

  if (invitation.status !== "pending")
    throw new Error("Invitation déjà utilisée");
  if (invitation.expiresAt < new Date()) throw new Error("Invitation expirée");

  // Vérifie que l'email correspond bien à l'utilisateur connecté
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (user.email !== invitation.email) {
    throw new Error("Cette invitation ne vous est pas destinée");
  }

  await prisma.$transaction([
    prisma.member.create({
      data: {
        userId: session.user.id,
        workspaceId: invitation.workspaceId,
        role: invitation.role,
      },
    }),
    prisma.invitation.update({
      where: { id: token },
      data: { status: "accepted" },
    }),
  ]);
}
