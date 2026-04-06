import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  if (!process.env.JIRA_CLIENT_ID) {
    return new Response("Jira integration not configured", { status: 500 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  if (!user.activeWorkspaceId) {
    return new Response("No active workspace", { status: 400 });
  }

  const redirectUri =
    process.env.JIRA_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/jira/callback`;

  const state = Buffer.from(user.activeWorkspaceId).toString("base64url");

  const authorizeUrl = new URL("https://auth.atlassian.com/authorize");
  authorizeUrl.searchParams.set("audience", "api.atlassian.com");
  authorizeUrl.searchParams.set("client_id", process.env.JIRA_CLIENT_ID);
  authorizeUrl.searchParams.set(
    "scope",
    "read:jira-work write:jira-work read:jira-user offline_access"
  );
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("prompt", "consent");
  authorizeUrl.searchParams.set("state", state);

  return Response.redirect(authorizeUrl.toString());
}
