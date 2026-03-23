"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireSession } from "@/lib/session";
import { SpecStatus, WorkspacePlan } from "@/lib/enums";

const FREE_PLAN_LIMIT = 3;

const createSpecSchema = z.object({
  title: z.string().min(2).max(100),
  prompt: z.string().min(20, "Décrivez le projet en au moins 20 caractères"),
  workspaceId: z.string(),
  projectId: z.string().optional(),
  epicId: z.string().optional(),
  sections: z.array(z.string()).default([]),
});

export async function createSpec(data: z.infer<typeof createSpecSchema>) {
  const session = await requireSession();
  const parsed = createSpecSchema.parse(data);

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: parsed.workspaceId,
      },
    },
    include: { workspace: { select: { plan: true } } },
  });
  if (!member) throw new Error("Accès refusé");

  if (member.workspace.plan === WorkspacePlan.FREE) {
    // Vérification et création dans une transaction pour éviter la race condition
    const spec = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const count = await tx.spec.count({
        where: { workspaceId: parsed.workspaceId },
      });
      if (count >= FREE_PLAN_LIMIT) {
        throw new Error(
          "Limite du plan gratuit atteinte. Passez au plan Pro pour continuer.",
        );
      }
      return tx.spec.create({
        data: {
          title: parsed.title,
          prompt: parsed.prompt,
          workspaceId: parsed.workspaceId,
          projectId: parsed.projectId,
          epicId: parsed.epicId,
          creatorId: session.user.id,
          status: SpecStatus.DRAFT,
          content: { _sections: parsed.sections },
        },
      });
    });
    revalidatePath("/specs");
    return spec;
  }

  const spec = await prisma.spec.create({
    data: {
      title: parsed.title,
      prompt: parsed.prompt,
      workspaceId: parsed.workspaceId,
      projectId: parsed.projectId,
      epicId: parsed.epicId,
      creatorId: session.user.id,
      status: SpecStatus.DRAFT,
      content: { _sections: parsed.sections },
    },
  });

  revalidatePath("/specs");
  return spec;
}

export async function getSpecs(workspaceId: string, limit?: number) {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId,
      },
    },
  });
  if (!member) throw new Error("Accès refusé");

  return prisma.spec.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      prompt: true,
      Project: { select: { name: true, productType: true } },
      Epic: { select: { title: true } },
      creator: { select: { name: true, image: true } },
    },
  });
}

export async function getSpec(specId: string) {
  const session = await requireSession();

  const spec = await prisma.spec.findUniqueOrThrow({
    where: { id: specId },
    include: { workspace: true },
  });

  if (!spec.workspaceId) throw new Error("Spec sans workspace");

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: spec.workspaceId,
      },
    },
  });
  if (!member) throw new Error("Accès refusé");

  return spec;
}

export async function updateSpecContent(
  specId: string,
  content: Record<string, string>,
  status: typeof SpecStatus.DONE | typeof SpecStatus.ERROR,
) {
  const session = await requireSession();

  const spec = await prisma.spec.findUnique({
    where: { id: specId },
    select: { workspaceId: true },
  });
  if (!spec?.workspaceId) throw new Error("Spec introuvable");

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: spec.workspaceId,
      },
    },
  });
  if (!member) throw new Error("Accès refusé");

  return prisma.spec.update({
    where: { id: specId },
    data: { content, status },
  });
}

export async function getMonthlySpecsCount(workspaceId: string) {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId,
      },
    },
  });
  if (!member) return 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return prisma.spec.count({
    where: {
      workspaceId,
      createdAt: { gte: startOfMonth },
    },
  });
}

export async function getWorkspacePlanInfo(workspaceId: string) {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId,
      },
    },
    include: { workspace: { select: { plan: true } } },
  });

  if (!member) throw new Error("Accès refusé");

  const plan = member.workspace.plan;

  if (plan !== WorkspacePlan.FREE) {
    return { plan, specsCount: 0, limit: null, isAtLimit: false };
  }

  const specsCount = await prisma.spec.count({ where: { workspaceId } });

  return {
    plan,
    specsCount,
    limit: FREE_PLAN_LIMIT,
    isAtLimit: specsCount >= FREE_PLAN_LIMIT,
  };
}

const updateSpecSchema = z.object({
  specId: z.string(),
  title: z.string().min(2).max(100),
  prompt: z.string().optional(),
  content: z.any(),
});

export async function updateSpec(data: z.infer<typeof updateSpecSchema>) {
  const session = await requireSession();
  const parsed = updateSpecSchema.parse(data);

  const spec = await prisma.spec.findUnique({
    where: { id: parsed.specId },
  });
  if (!spec) throw new Error("Spec introuvable");
  if (!spec.workspaceId) throw new Error("Spec sans workspace");

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: spec.workspaceId,
      },
    },
  });
  if (!member) throw new Error("Accès refusé");

  const updatedSpec = await prisma.spec.update({
    where: { id: parsed.specId },
    data: {
      title: parsed.title,
      prompt: parsed.prompt,
      content: parsed.content,
    },
  });

  revalidatePath(`/specs/${parsed.specId}`);
  revalidatePath(`/specs/${parsed.specId}/edit`);
  revalidatePath("/specs");
  revalidatePath("/dashboard");

  return updatedSpec;
}
