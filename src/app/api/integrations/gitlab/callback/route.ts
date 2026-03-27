import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { exchangeGitLabCode, getGitLabUser } from "@/lib/gitlab";

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
    return Response.redirect(
      `${appUrl}/settings/integrations?error=gitlab_denied`
    );
  }

  let workspaceId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    workspaceId = decoded.workspaceId;
  } catch {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=invalid_state`
    );
  }

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=forbidden`
    );
  }

  const redirectUri =
    process.env.GITLAB_REDIRECT_URI ??
    `${appUrl}/api/integrations/gitlab/callback`;

  try {
    const token = await exchangeGitLabCode(code, redirectUri);
    const glUser = await getGitLabUser(token.access_token);

    await prisma.gitIntegration.upsert({
      where: { workspaceId_provider: { workspaceId, provider: "GITLAB" } },
      create: {
        workspaceId,
        provider: "GITLAB",
        accessToken: token.access_token,
        refreshToken: token.refresh_token ?? null,
        providerAccountId: String(glUser.id),
        providerAccountName: glUser.username,
      },
      update: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token ?? null,
        providerAccountId: String(glUser.id),
        providerAccountName: glUser.username,
      },
    });

    return Response.redirect(
      `${appUrl}/settings/integrations?success=gitlab_connected`
    );
  } catch {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=gitlab_token_exchange`
    );
  }
}
