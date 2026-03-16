"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function switchActiveOrganization(orgId: string) {
  const session = await requireSession();

  // Vérifie que l'utilisateur est bien membre
  const member = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: orgId,
      },
    },
  });

  if (!member) throw new Error("Vous n'êtes pas membre de cette équipe");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeOrganizationId: orgId },
  });

  revalidatePath("/", "layout");
}

export async function getActiveOrganization() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeOrganizationId: true },
  });

  if (!user.activeOrganizationId) return null;

  return prisma.organization.findUnique({
    where: { id: user.activeOrganizationId },
    include: {
      members: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
  });
}
