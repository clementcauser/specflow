"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export interface TrelloIntegrationStatus {
  connected: boolean;
  username?: string;
  fullName?: string;
  defaultBoardId?: string | null;
  defaultBoardName?: string | null;
  defaultListId?: string | null;
  defaultListName?: string | null;
  connectedAt?: Date;
}

export async function getTrelloIntegrationStatus(
  workspaceId: string
): Promise<TrelloIntegrationStatus> {
  await requireSession();

  const integration = await prisma.trelloIntegration.findUnique({
    where: { workspaceId },
    select: {
      trelloUsername: true,
      trelloFullName: true,
      defaultBoardId: true,
      defaultBoardName: true,
      defaultListId: true,
      defaultListName: true,
      createdAt: true,
    },
  });

  if (!integration) return { connected: false };

  return {
    connected: true,
    username: integration.trelloUsername,
    fullName: integration.trelloFullName,
    defaultBoardId: integration.defaultBoardId,
    defaultBoardName: integration.defaultBoardName,
    defaultListId: integration.defaultListId,
    defaultListName: integration.defaultListName,
    connectedAt: integration.createdAt,
  };
}

export async function disconnectTrello(workspaceId: string): Promise<void> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await prisma.trelloIntegration.deleteMany({ where: { workspaceId } });
}

export async function saveTrelloDefaults(
  workspaceId: string,
  boardId: string,
  boardName: string,
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

  await prisma.trelloIntegration.update({
    where: { workspaceId },
    data: {
      defaultBoardId: boardId,
      defaultBoardName: boardName,
      defaultListId: listId,
      defaultListName: listName,
    },
  });
}
