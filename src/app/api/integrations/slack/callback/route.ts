import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { exchangeSlackCode } from "@/lib/slack";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (error || !code || !state) {
    return Response.redirect(`${appUrl}/settings/integrations?error=slack_denied`);
  }

  let workspaceId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    workspaceId = decoded.workspaceId;
  } catch {
    return Response.redirect(`${appUrl}/settings/integrations?error=invalid_state`);
  }

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId },
    },
  });
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return Response.redirect(`${appUrl}/settings/integrations?error=forbidden`);
  }

  const redirectUri =
    process.env.SLACK_REDIRECT_URI ??
    `${appUrl}/api/integrations/slack/callback`;

  try {
    const token = await exchangeSlackCode(code, redirectUri);

    await prisma.slackIntegration.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        accessToken: token.access_token,
        botUserId: token.bot_user_id ?? null,
        teamSlackId: token.team?.id ?? null,
        teamSlackName: token.team?.name ?? null,
      },
      update: {
        accessToken: token.access_token,
        botUserId: token.bot_user_id ?? null,
        teamSlackId: token.team?.id ?? null,
        teamSlackName: token.team?.name ?? null,
      },
    });

    return Response.redirect(`${appUrl}/settings/integrations?slack=connected`);
  } catch (err) {
    console.error("[Slack callback error]", err);
    return Response.redirect(`${appUrl}/settings/integrations?error=slack_token_exchange`);
  }
}
