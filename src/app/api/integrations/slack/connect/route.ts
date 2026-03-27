import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  if (!user.activeWorkspaceId) {
    return new Response("No active workspace", { status: 400 });
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) {
    return new Response("Slack integration not configured", { status: 500 });
  }

  const redirectUri =
    process.env.SLACK_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`;

  const state = Buffer.from(
    JSON.stringify({ workspaceId: user.activeWorkspaceId })
  ).toString("base64url");

  const slackAuthUrl = new URL("https://slack.com/oauth/v2/authorize");
  slackAuthUrl.searchParams.set("client_id", clientId);
  slackAuthUrl.searchParams.set("scope", "chat:write,channels:read,incoming-webhook");
  slackAuthUrl.searchParams.set("redirect_uri", redirectUri);
  slackAuthUrl.searchParams.set("state", state);

  return Response.redirect(slackAuthUrl.toString());
}
