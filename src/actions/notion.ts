"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export interface NotionIntegrationStatus {
  connected: boolean;
  workspaceName?: string | null;
  workspaceIcon?: string | null;
  connectedAt?: Date;
}

export async function getNotionIntegrationStatus(
  workspaceId: string
): Promise<NotionIntegrationStatus> {
  await requireSession();

  const integration = await prisma.notionIntegration.findUnique({
    where: { workspaceId },
    select: {
      notionWorkspaceName: true,
      notionWorkspaceIcon: true,
      createdAt: true,
    },
  });

  if (!integration) return { connected: false };

  return {
    connected: true,
    workspaceName: integration.notionWorkspaceName,
    workspaceIcon: integration.notionWorkspaceIcon,
    connectedAt: integration.createdAt,
  };
}

export async function disconnectNotion(workspaceId: string): Promise<void> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId },
    },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await prisma.notionIntegration.deleteMany({ where: { workspaceId } });
}
