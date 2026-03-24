import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { listNotionPages } from "@/lib/notion";

export const runtime = "nodejs";

// GET /api/integrations/notion/pages — list pages for the page picker
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

  const integration = await prisma.notionIntegration.findUnique({
    where: { workspaceId: user.activeWorkspaceId },
    select: { accessToken: true },
  });

  if (!integration) {
    return new Response("Notion not connected", { status: 400 });
  }

  try {
    const pages = await listNotionPages(integration.accessToken);
    return Response.json({ pages });
  } catch (err) {
    // Token may have been revoked
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("401") || message.includes("unauthorized")) {
      return Response.json({ error: "notion_unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "notion_api_error" }, { status: 500 });
  }
}
