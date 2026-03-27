import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { exchangeGitHubCode, getGitHubUser } from "@/lib/github";

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
      `${appUrl}/settings/integrations?error=github_denied`
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
    process.env.GITHUB_REDIRECT_URI ??
    `${appUrl}/api/integrations/github/callback`;

  try {
    const token = await exchangeGitHubCode(code, redirectUri);
    const ghUser = await getGitHubUser(token.access_token);

    await prisma.gitIntegration.upsert({
      where: { workspaceId_provider: { workspaceId, provider: "GITHUB" } },
      create: {
        workspaceId,
        provider: "GITHUB",
        accessToken: token.access_token,
        providerAccountId: String(ghUser.id),
        providerAccountName: ghUser.login,
      },
      update: {
        accessToken: token.access_token,
        providerAccountId: String(ghUser.id),
        providerAccountName: ghUser.login,
      },
    });

    return Response.redirect(
      `${appUrl}/settings/integrations?success=github_connected`
    );
  } catch {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=github_token_exchange`
    );
  }
}
