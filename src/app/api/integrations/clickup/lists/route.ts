import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getLists } from "@/lib/clickup";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const spaceId = request.nextUrl.searchParams.get("spaceId");
  if (!spaceId) return new Response("spaceId is required", { status: 400 });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  if (!user.activeWorkspaceId) {
    return new Response("No active workspace", { status: 400 });
  }

  const integration = await prisma.clickUpIntegration.findUnique({
    where: { workspaceId: user.activeWorkspaceId },
    select: { accessToken: true },
  });

  if (!integration) return new Response("Not connected", { status: 404 });

  try {
    const lists = await getLists(integration.accessToken, spaceId);
    return Response.json(lists);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: "clickup_lists_failed", detail: message },
      { status: 500 }
    );
  }
}
