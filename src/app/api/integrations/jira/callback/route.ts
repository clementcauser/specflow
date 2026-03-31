import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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
      `${appUrl}/settings/integrations?error=jira_denied`
    );
  }

  let workspaceId: string;
  try {
    workspaceId = Buffer.from(state, "base64url").toString("utf-8");
  } catch {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=jira_invalid_state`
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

  const clientId = process.env.JIRA_CLIENT_ID ?? "";
  const clientSecret = process.env.JIRA_CLIENT_SECRET ?? "";
  const redirectUri =
    process.env.JIRA_REDIRECT_URI ??
    `${appUrl}/api/integrations/jira/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken: string = tokenData.access_token;
    const refreshToken: string = tokenData.refresh_token;
    const expiresAt = new Date(
      Date.now() + (tokenData.expires_in ?? 3600) * 1000
    );

    // Fetch accessible Jira sites
    const sitesRes = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      }
    );

    if (!sitesRes.ok) {
      throw new Error(`Sites fetch failed: ${sitesRes.status}`);
    }

    const sites: { id: string; name: string; url: string }[] =
      await sitesRes.json();

    if (sites.length === 0) {
      return Response.redirect(
        `${appUrl}/settings/integrations?error=jira_no_sites`
      );
    }

    if (sites.length === 1) {
      // Auto-select the only site
      const site = sites[0];
      await prisma.jiraIntegration.upsert({
        where: { workspaceId },
        create: {
          workspaceId,
          accessToken,
          refreshToken,
          expiresAt,
          cloudId: site.id,
          cloudName: site.name,
          cloudUrl: site.url,
        },
        update: {
          accessToken,
          refreshToken,
          expiresAt,
          cloudId: site.id,
          cloudName: site.name,
          cloudUrl: site.url,
        },
      });

      return Response.redirect(
        `${appUrl}/settings/integrations?jira=connected`
      );
    }

    // Multiple sites — save tokens temporarily in a cookie and redirect to site selection
    await prisma.jiraIntegration.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        accessToken,
        refreshToken,
        expiresAt,
      },
      update: {
        accessToken,
        refreshToken,
        expiresAt,
        // Clear previous site selection
        cloudId: null,
        cloudName: null,
        cloudUrl: null,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(
      `jira_sites_${workspaceId}`,
      JSON.stringify(sites),
      {
        httpOnly: true,
        maxAge: 600, // 10 minutes
        path: "/",
        sameSite: "lax",
      }
    );

    return Response.redirect(
      `${appUrl}/settings/integrations/jira/select-site`
    );
  } catch {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=jira_token_exchange`
    );
  }
}
