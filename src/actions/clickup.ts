"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export interface ClickUpIntegrationStatus {
  connected: boolean;
  clickupUserName?: string;
  clickupWorkspaceName?: string;
  defaultSpaceId?: string | null;
  defaultListId?: string | null;
  defaultListName?: string | null;
  connectedAt?: Date;
}

export async function getClickUpIntegrationStatus(
  workspaceId: string
): Promise<ClickUpIntegrationStatus> {
  await requireSession();

  const integration = await prisma.clickUpIntegration.findUnique({
    where: { workspaceId },
    select: {
      clickupUserName: true,
      clickupWorkspaceName: true,
      defaultSpaceId: true,
      defaultListId: true,
      defaultListName: true,
      createdAt: true,
    },
  });

  if (!integration) return { connected: false };

  return {
    connected: true,
    clickupUserName: integration.clickupUserName,
    clickupWorkspaceName: integration.clickupWorkspaceName,
    defaultSpaceId: integration.defaultSpaceId,
    defaultListId: integration.defaultListId,
    defaultListName: integration.defaultListName,
    connectedAt: integration.createdAt,
  };
}

export async function disconnectClickUp(workspaceId: string): Promise<void> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await prisma.clickUpIntegration.deleteMany({ where: { workspaceId } });
}

export async function saveClickUpDefaults(
  workspaceId: string,
  spaceId: string,
  listId: string,
  listName: string
): Promise<void> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await prisma.clickUpIntegration.update({
    where: { workspaceId },
    data: {
      defaultSpaceId: spaceId,
      defaultListId: listId,
      defaultListName: listName,
    },
  });
}
