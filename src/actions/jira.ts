"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export interface JiraIntegrationStatus {
  connected: boolean;
  cloudName?: string;
  cloudUrl?: string;
  defaultProjectKey?: string | null;
  defaultProjectName?: string | null;
  siteConfigured?: boolean;
  connectedAt?: Date;
}

export async function getJiraIntegrationStatus(
  workspaceId: string
): Promise<JiraIntegrationStatus> {
  await requireSession();

  const integration = await prisma.jiraIntegration.findUnique({
    where: { workspaceId },
    select: {
      cloudName: true,
      cloudUrl: true,
      cloudId: true,
      defaultProjectKey: true,
      defaultProjectName: true,
      createdAt: true,
    },
  });

  if (!integration) return { connected: false };

  return {
    connected: true,
    cloudName: integration.cloudName ?? undefined,
    cloudUrl: integration.cloudUrl ?? undefined,
    siteConfigured: !!integration.cloudId,
    defaultProjectKey: integration.defaultProjectKey,
    defaultProjectName: integration.defaultProjectName,
    connectedAt: integration.createdAt,
  };
}

export async function disconnectJira(workspaceId: string): Promise<void> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await prisma.jiraIntegration.deleteMany({ where: { workspaceId } });
}

export async function saveJiraDefaults(
  workspaceId: string,
  projectKey: string,
  projectName: string
): Promise<void> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await prisma.jiraIntegration.update({
    where: { workspaceId },
    data: {
      defaultProjectKey: projectKey,
      defaultProjectName: projectName,
    },
  });
}
