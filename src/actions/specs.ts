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
  sections: z.array(z.string()).default([]),
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
      title: parsed.title,
      projectType: parsed.projectType,
      stack: parsed.stack,
      description: parsed.description,
      organizationId: parsed.organizationId,
      creatorId: session.user.id,
      status: "draft",
      content: { _sections: parsed.sections },
    },
  });

  revalidatePath("/specs");
  return spec;
}

export async function getSpecs(organizationId: string, limit?: number) {
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
    ...(limit ? { take: limit } : {}),
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

export async function getMonthlySpecsCount(organizationId: string) {
  const session = await requireSession();

  // Vérifie l'accès
  const member = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  });
  if (!member) return 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return prisma.spec.count({
    where: {
      organizationId,
      createdAt: {
        gte: startOfMonth,
      },
    },
  });
}

const updateSpecSchema = z.object({
  specId: z.string(),
  title: z.string().min(2).max(100),
  projectType: z.string().min(1),
  stack: z.string().min(1),
  content: z.any(), // content can include arbitrary sections + _sections array
});

export async function updateSpec(data: z.infer<typeof updateSpecSchema>) {
  const session = await requireSession();
  const parsed = updateSpecSchema.parse(data);

  // Get the spec and verify user has access via their organization
  const spec = await prisma.spec.findUnique({
    where: { id: parsed.specId },
  });

  if (!spec) throw new Error("Spec introuvable");

  const member = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: spec.organizationId,
      },
    },
  });
  
  if (!member) throw new Error("Accès refusé");

  const updatedSpec = await prisma.spec.update({
    where: { id: parsed.specId },
    data: {
      title: parsed.title,
      projectType: parsed.projectType,
      stack: parsed.stack,
      content: parsed.content,
    },
  });

  revalidatePath(`/specs/${parsed.specId}`);
  revalidatePath(`/specs/${parsed.specId}/edit`);
  revalidatePath("/specs");
  revalidatePath("/dashboard");
  
  return updatedSpec;
}
