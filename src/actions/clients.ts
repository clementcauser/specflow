"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { randomUUID } from "crypto";

async function assertMember(userId: string, workspaceId: string) {
  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member) throw new Error("Accès refusé");
  return member;
}

// ─── Create ────────────────────────────────────────────────────────────────

const createClientSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(100),
  context: z.string().max(500).optional(),
});

export async function createClient(data: z.infer<typeof createClientSchema>) {
  const session = await requireSession();
  const parsed = createClientSchema.parse(data);
  await assertMember(session.user.id, parsed.workspaceId);

  const now = new Date();
  const client = await prisma.client.create({
    data: {
      id: randomUUID(),
      workspaceId: parsed.workspaceId,
      name: parsed.name,
      context: parsed.context,
      createdAt: now,
      updatedAt: now,
    },
  });

  revalidatePath("/clients");
  return client;
}

// ─── Read ──────────────────────────────────────────────────────────────────

export async function getClients(workspaceId: string) {
  const session = await requireSession();
  await assertMember(session.user.id, workspaceId);

  return prisma.client.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      context: true,
      createdAt: true,
      _count: { select: { Project: true } },
    },
  });
}

export async function getClient(clientId: string) {
  const session = await requireSession();

  // Vérification d'accès avant le chargement complet de la ressource
  const clientMeta = await prisma.client.findUnique({
    where: { id: clientId },
    select: { workspaceId: true },
  });
  if (!clientMeta) throw new Error("Client introuvable");
  await assertMember(session.user.id, clientMeta.workspaceId);

  return prisma.client.findUniqueOrThrow({
    where: { id: clientId },
    include: {
      Project: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          productType: true,
          stack: true,
          description: true,
          createdAt: true,
          _count: { select: { Spec: true } },
        },
      },
    },
  });
}

// ─── Update ────────────────────────────────────────────────────────────────

const updateClientSchema = z.object({
  clientId: z.string(),
  name: z.string().min(1).max(100).optional(),
  context: z.string().max(500).optional(),
});

export async function updateClient(data: z.infer<typeof updateClientSchema>) {
  const session = await requireSession();
  const parsed = updateClientSchema.parse(data);

  const client = await prisma.client.findUniqueOrThrow({
    where: { id: parsed.clientId },
    select: { workspaceId: true },
  });
  await assertMember(session.user.id, client.workspaceId);

  const updated = await prisma.client.update({
    where: { id: parsed.clientId },
    data: {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.context !== undefined && { context: parsed.context }),
      updatedAt: new Date(),
    },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${parsed.clientId}`);
  return updated;
}

// ─── Delete ────────────────────────────────────────────────────────────────

export async function deleteClient(clientId: string) {
  const session = await requireSession();

  const client = await prisma.client.findUniqueOrThrow({
    where: { id: clientId },
    select: { workspaceId: true },
  });
  await assertMember(session.user.id, client.workspaceId);

  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/clients");
}
