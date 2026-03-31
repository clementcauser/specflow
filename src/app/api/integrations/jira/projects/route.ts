import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getProjects } from "@/lib/jira";

export const runtime = "nodejs";

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

  const integration = await prisma.jiraIntegration.findUnique({
    where: { workspaceId: user.activeWorkspaceId },
    select: { cloudId: true },
  });

  if (!integration) return new Response("Not connected", { status: 404 });

  try {
    const projects = await getProjects(user.activeWorkspaceId);
    return Response.json(projects);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: "jira_projects_failed", detail: message },
      { status: 500 }
    );
  }
}
