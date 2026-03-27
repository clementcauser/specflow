import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const { searchParams } = request.nextUrl;

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=clickup_denied`
    );
  }

  let workspaceId: string;
  try {
    workspaceId = Buffer.from(state, "base64url").toString("utf-8");
  } catch {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=clickup_invalid_state`
    );
  }

  // Verify the user is OWNER or ADMIN in that workspace
  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=forbidden`
    );
  }

  const clientId = process.env.CLICKUP_CLIENT_ID ?? "";
  const clientSecret = process.env.CLICKUP_CLIENT_SECRET ?? "";
  const redirectUri =
    process.env.CLICKUP_REDIRECT_URI ??
    `${appUrl}/api/integrations/clickup/callback`;

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      "https://api.clickup.com/api/v2/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken: string = tokenData.access_token;

    // Fetch user profile
    const userRes = await fetch("https://api.clickup.com/api/v2/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      throw new Error(`User fetch failed: ${userRes.status}`);
    }

    const userData = await userRes.json();
    const clickupUser = userData.user;

    // Fetch first workspace (team)
    const teamsRes = await fetch("https://api.clickup.com/api/v2/team", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!teamsRes.ok) {
      throw new Error(`Teams fetch failed: ${teamsRes.status}`);
    }

    const teamsData = await teamsRes.json();
    const firstTeam = teamsData.teams?.[0];

    if (!firstTeam) {
      throw new Error("No ClickUp workspace found");
    }

    await prisma.clickUpIntegration.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        accessToken,
        clickupUserId: String(clickupUser.id),
        clickupUserName: clickupUser.username ?? clickupUser.email,
        clickupWorkspaceId: String(firstTeam.id),
        clickupWorkspaceName: firstTeam.name,
      },
      update: {
        accessToken,
        clickupUserId: String(clickupUser.id),
        clickupUserName: clickupUser.username ?? clickupUser.email,
        clickupWorkspaceId: String(firstTeam.id),
        clickupWorkspaceName: firstTeam.name,
      },
    });

    return Response.redirect(
      `${appUrl}/settings/integrations?clickup=connected`
    );
  } catch {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=clickup_token_exchange`
    );
  }
}
