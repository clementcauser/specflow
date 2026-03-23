"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { MoSCoW, EpicStatus } from "@/generated/prisma";
import { randomUUID } from "crypto";

async function assertMember(userId: string, workspaceId: string) {
  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member) throw new Error("Accès refusé");
  return member;
}

// ─── Create ────────────────────────────────────────────────────────────────

const createEpicSchema = z.object({
  workspaceId: z.string(),
  title: z.string().min(2).max(100),
  description: z.string().optional(),
  priority: z.nativeEnum(MoSCoW).default(MoSCoW.SHOULD),
});

export async function createEpic(data: z.infer<typeof createEpicSchema>) {
  const session = await requireSession();
  const parsed = createEpicSchema.parse(data);
  await assertMember(session.user.id, parsed.workspaceId);

  const now = new Date();
  const epic = await prisma.epic.create({
    data: {
      id: randomUUID(),
      workspaceId: parsed.workspaceId,
      title: parsed.title,
      description: parsed.description,
      priority: parsed.priority,
      status: EpicStatus.OPEN,
      createdAt: now,
      updatedAt: now,
    },
  });

  revalidatePath("/epics");
  return epic;
}

// ─── Read ──────────────────────────────────────────────────────────────────

export async function getEpics(workspaceId: string) {
  const session = await requireSession();
  await assertMember(session.user.id, workspaceId);

  return prisma.epic.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      createdAt: true,
      _count: { select: { Spec: true } },
    },
  });
}

export async function getEpic(epicId: string) {
  const session = await requireSession();

  // Vérification d'accès avant le chargement complet de la ressource
  const epicMeta = await prisma.epic.findUnique({
    where: { id: epicId },
    select: { workspaceId: true },
  });
  if (!epicMeta) throw new Error("Epic introuvable");
  await assertMember(session.user.id, epicMeta.workspaceId);

  return prisma.epic.findUniqueOrThrow({
    where: { id: epicId },
    include: {
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

const updateEpicSchema = z.object({
  epicId: z.string(),
  title: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(MoSCoW).optional(),
  status: z.nativeEnum(EpicStatus).optional(),
});

export async function updateEpic(data: z.infer<typeof updateEpicSchema>) {
  const session = await requireSession();
  const parsed = updateEpicSchema.parse(data);

  const epic = await prisma.epic.findUniqueOrThrow({
    where: { id: parsed.epicId },
    select: { workspaceId: true },
  });
  await assertMember(session.user.id, epic.workspaceId);

  const updated = await prisma.epic.update({
    where: { id: parsed.epicId },
    data: {
      ...(parsed.title !== undefined && { title: parsed.title }),
      ...(parsed.description !== undefined && { description: parsed.description }),
      ...(parsed.priority !== undefined && { priority: parsed.priority }),
      ...(parsed.status !== undefined && { status: parsed.status }),
    },
  });

  revalidatePath("/epics");
  revalidatePath(`/epics/${parsed.epicId}`);
  return updated;
}

// ─── Delete ────────────────────────────────────────────────────────────────

export async function deleteEpic(epicId: string) {
  const session = await requireSession();

  const epic = await prisma.epic.findUniqueOrThrow({
    where: { id: epicId },
    select: { workspaceId: true },
  });
  await assertMember(session.user.id, epic.workspaceId);

  await prisma.epic.delete({ where: { id: epicId } });

  revalidatePath("/epics");
}
