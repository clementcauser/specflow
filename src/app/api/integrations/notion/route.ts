import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/integrations/notion — status for the active workspace
export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  if (!user.activeWorkspaceId) {
    return Response.json({ connected: false });
  }

  const integration = await prisma.notionIntegration.findUnique({
    where: { workspaceId: user.activeWorkspaceId },
    select: {
      notionWorkspaceName: true,
      notionWorkspaceIcon: true,
      createdAt: true,
    },
  });

  if (!integration) {
    return Response.json({ connected: false });
  }

  return Response.json({
    connected: true,
    workspaceName: integration.notionWorkspaceName,
    workspaceIcon: integration.notionWorkspaceIcon,
    connectedAt: integration.createdAt,
  });
}

// DELETE /api/integrations/notion — disconnect
export async function DELETE(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  if (!user.activeWorkspaceId) {
    return new Response("No active workspace", { status: 400 });
  }

  // Only OWNER or ADMIN can disconnect
  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: user.activeWorkspaceId,
      },
    },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  await prisma.notionIntegration.deleteMany({
    where: { workspaceId: user.activeWorkspaceId },
  });

  return new Response(null, { status: 204 });
}
