"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function disconnectSlack(workspaceId: string): Promise<void> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId },
    },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await prisma.slackIntegration.deleteMany({ where: { workspaceId } });
}

export async function saveSlackChannel(
  workspaceId: string,
  channelId: string,
  channelName: string
): Promise<void> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId },
    },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await prisma.slackIntegration.update({
    where: { workspaceId },
    data: { defaultChannelId: channelId, defaultChannelName: channelName },
  });
}
