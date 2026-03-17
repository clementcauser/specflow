"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function switchActiveWorkspace(workspaceId: string) {
  const session = await requireSession();

  // Vérifie que l'utilisateur est bien membre
  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: workspaceId,
      },
    },
  });

  if (!member) throw new Error("Vous n'êtes pas membre de cet espace de travail");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeWorkspaceId: workspaceId },
  });

  revalidatePath("/", "layout");
}

export async function getActiveWorkspace() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  if (!user.activeWorkspaceId) return null;

  return prisma.workspace.findUnique({
    where: { id: user.activeWorkspaceId },
    include: {
      members: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
  });
}
