import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { listSlackChannels } from "@/lib/slack";

export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  if (!user.activeWorkspaceId) {
    return Response.json({ error: "no_workspace" }, { status: 400 });
  }

  const integration = await prisma.slackIntegration.findUnique({
    where: { workspaceId: user.activeWorkspaceId },
    select: { accessToken: true },
  });

  if (!integration) {
    return Response.json({ error: "slack_not_connected" }, { status: 400 });
  }

  try {
    const channels = await listSlackChannels(integration.accessToken);
    return Response.json({ channels });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Slack channels error]", message);

    if (message.includes("token_revoked") || message.includes("invalid_auth")) {
      return Response.json({ error: "slack_unauthorized" }, { status: 401 });
    }

    return Response.json({ error: "slack_channels_failed" }, { status: 500 });
  }
}
