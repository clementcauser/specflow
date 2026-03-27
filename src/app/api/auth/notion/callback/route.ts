import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { exchangeNotionCode } from "@/lib/notion";

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
    return Response.redirect(`${appUrl}/settings/integrations?error=notion_denied`);
  }

  // Decode state to get workspaceId
  let workspaceId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    workspaceId = decoded.workspaceId;
  } catch {
    return Response.redirect(`${appUrl}/settings/integrations?error=invalid_state`);
  }

  // Verify user is a member of that workspace
  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId },
    },
  });
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return Response.redirect(`${appUrl}/settings/integrations?error=forbidden`);
  }

  const redirectUri = `${appUrl}/api/auth/notion/callback`;

  try {
    const token = await exchangeNotionCode(code, redirectUri);

    await prisma.notionIntegration.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        accessToken: token.access_token,
        notionWorkspaceId: token.workspace_id,
        notionWorkspaceName: token.workspace_name,
        notionWorkspaceIcon: token.workspace_icon ?? null,
      },
      update: {
        accessToken: token.access_token,
        notionWorkspaceId: token.workspace_id,
        notionWorkspaceName: token.workspace_name,
        notionWorkspaceIcon: token.workspace_icon ?? null,
      },
    });

    return Response.redirect(`${appUrl}/settings/integrations?success=notion_connected`);
  } catch {
    return Response.redirect(`${appUrl}/settings/integrations?error=notion_token_exchange`);
  }
}
