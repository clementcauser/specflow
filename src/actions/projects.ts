"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { randomUUID } from "crypto";
import { WorkspaceProductType } from "@/lib/enums";

async function assertMember(userId: string, workspaceId: string) {
  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member) throw new Error("Accès refusé");
  return member;
}

// ─── Create ────────────────────────────────────────────────────────────────

const createProjectSchema = z.object({
  workspaceId: z.string(),
  clientId: z.string().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  productType: z.enum([WorkspaceProductType.ECOMMERCE, WorkspaceProductType.SAAS, WorkspaceProductType.MARKETPLACE, WorkspaceProductType.LANDING_PAGE, WorkspaceProductType.MOBILE, WorkspaceProductType.DESKTOP, WorkspaceProductType.API, WorkspaceProductType.IOT, WorkspaceProductType.AI, WorkspaceProductType.OTHER]),
  stack: z.string().max(200).optional(),
  clientName: z.string().max(100).optional(),
});

export async function createProject(data: z.infer<typeof createProjectSchema>) {
  const session = await requireSession();
  const parsed = createProjectSchema.parse(data);
  await assertMember(session.user.id, parsed.workspaceId);

  const now = new Date();
  const project = await prisma.project.create({
    data: {
      id: randomUUID(),
      workspaceId: parsed.workspaceId,
      clientId: parsed.clientId,
      name: parsed.name,
      description: parsed.description,
      productType: parsed.productType,
      stack: parsed.stack,
      clientName: parsed.clientName,
      createdAt: now,
      updatedAt: now,
    },
  });

  revalidatePath("/clients");
  if (parsed.clientId) revalidatePath(`/clients/${parsed.clientId}`);
  return project;
}

// ─── Read ──────────────────────────────────────────────────────────────────

export async function getProject(projectId: string) {
  const session = await requireSession();

  // Vérification d'accès avant le chargement complet de la ressource
  const projectMeta = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  if (!projectMeta) throw new Error("Projet introuvable");
  await assertMember(session.user.id, projectMeta.workspaceId);

  return prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      Client: { select: { id: true, name: true } },
      Spec: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          prompt: true,
          creator: { select: { name: true, image: true } },
        },
      },
    },
  });
}

// ─── Update ────────────────────────────────────────────────────────────────

const updateProjectSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  productType: z.enum([WorkspaceProductType.ECOMMERCE, WorkspaceProductType.SAAS, WorkspaceProductType.MARKETPLACE, WorkspaceProductType.LANDING_PAGE, WorkspaceProductType.MOBILE, WorkspaceProductType.DESKTOP, WorkspaceProductType.API, WorkspaceProductType.IOT, WorkspaceProductType.AI, WorkspaceProductType.OTHER]).optional(),
  stack: z.string().max(200).optional(),
});

export async function updateProject(data: z.infer<typeof updateProjectSchema>) {
  const session = await requireSession();
  const parsed = updateProjectSchema.parse(data);

  const project = await prisma.project.findUniqueOrThrow({
    where: { id: parsed.projectId },
    select: { workspaceId: true, clientId: true },
  });
  await assertMember(session.user.id, project.workspaceId);

  const updated = await prisma.project.update({
    where: { id: parsed.projectId },
    data: {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.description !== undefined && { description: parsed.description }),
      ...(parsed.productType !== undefined && { productType: parsed.productType }),
      ...(parsed.stack !== undefined && { stack: parsed.stack }),
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/projects/${parsed.projectId}`);
  if (project.clientId) revalidatePath(`/clients/${project.clientId}`);
  return updated;
}

// ─── Delete ────────────────────────────────────────────────────────────────

export async function deleteProject(projectId: string) {
  const session = await requireSession();

  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { workspaceId: true, clientId: true },
  });
  await assertMember(session.user.id, project.workspaceId);

  await prisma.project.delete({ where: { id: projectId } });

  if (project.clientId) revalidatePath(`/clients/${project.clientId}`);
  revalidatePath("/clients");
}
