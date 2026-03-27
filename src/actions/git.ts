"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { GitProvider } from "@/generated/prisma/client";

export interface GitIntegrationStatus {
  connected: boolean;
  accountName?: string;
  defaultRepoOwner?: string | null;
  defaultRepoName?: string | null;
  connectedAt?: Date;
}

export async function getGitIntegrationStatus(
  workspaceId: string,
  provider: GitProvider
): Promise<GitIntegrationStatus> {
  await requireSession();

  const integration = await prisma.gitIntegration.findUnique({
    where: { workspaceId_provider: { workspaceId, provider } },
    select: {
      providerAccountName: true,
      defaultRepoOwner: true,
      defaultRepoName: true,
      createdAt: true,
    },
  });

  if (!integration) return { connected: false };

  return {
    connected: true,
    accountName: integration.providerAccountName,
    defaultRepoOwner: integration.defaultRepoOwner,
    defaultRepoName: integration.defaultRepoName,
    connectedAt: integration.createdAt,
  };
}

export async function disconnectGit(
  workspaceId: string,
  provider: GitProvider
): Promise<void> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await prisma.gitIntegration.deleteMany({ where: { workspaceId, provider } });
}

export async function saveDefaultRepo(
  workspaceId: string,
  provider: GitProvider,
  defaultRepoOwner: string,
  defaultRepoName: string
): Promise<void> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await prisma.gitIntegration.update({
    where: { workspaceId_provider: { workspaceId, provider } },
    data: { defaultRepoOwner, defaultRepoName },
  });
}
