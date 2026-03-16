"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const createSpecSchema = z.object({
  title: z.string().min(2).max(100),
  projectType: z.string().min(1),
  stack: z.string().min(1),
  description: z
    .string()
    .min(20, "Décrivez le projet en au moins 20 caractères"),
  organizationId: z.string(),
});

export async function createSpec(data: z.infer<typeof createSpecSchema>) {
  const session = await requireSession();
  const parsed = createSpecSchema.parse(data);

  // Vérifie que l'user est bien membre de l'org
  const member = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: parsed.organizationId,
      },
    },
  });
  if (!member) throw new Error("Accès refusé");

  const spec = await prisma.spec.create({
    data: {
      ...parsed,
      creatorId: session.user.id,
      status: "draft",
    },
  });

  revalidatePath("/specs");
  return spec;
}

export async function getSpecs(organizationId: string) {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  });
  if (!member) throw new Error("Accès refusé");

  return prisma.spec.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      projectType: true,
      stack: true,
      status: true,
      createdAt: true,
      creator: { select: { name: true, image: true } },
    },
  });
}

export async function getSpec(specId: string) {
  const session = await requireSession();

  const spec = await prisma.spec.findUniqueOrThrow({
    where: { id: specId },
    include: { organization: true },
  });

  const member = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: spec.organizationId,
      },
    },
  });
  if (!member) throw new Error("Accès refusé");

  return spec;
}

export async function updateSpecContent(
  specId: string,
  content: Record<string, string>,
  status: "done" | "error",
) {
  return prisma.spec.update({
    where: { id: specId },
    data: { content, status },
  });
}
