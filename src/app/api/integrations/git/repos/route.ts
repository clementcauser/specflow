import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { listRepos as listGitHubRepos } from "@/lib/github";
import { listRepos as listGitLabRepos } from "@/lib/gitlab";
import { GitProvider } from "@/generated/prisma/client";

export const runtime = "nodejs";

// GET /api/integrations/git/repos?provider=GITHUB|GITLAB
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const provider = request.nextUrl.searchParams.get("provider") as GitProvider | null;
  if (!provider || !["GITHUB", "GITLAB"].includes(provider)) {
    return new Response("Invalid provider", { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  if (!user.activeWorkspaceId) {
    return Response.json([]);
  }

  const integration = await prisma.gitIntegration.findUnique({
    where: {
      workspaceId_provider: {
        workspaceId: user.activeWorkspaceId,
        provider,
      },
    },
    select: { accessToken: true },
  });

  if (!integration) {
    return new Response("Not connected", { status: 400 });
  }

  try {
    const repos =
      provider === "GITHUB"
        ? await listGitHubRepos(integration.accessToken)
        : await listGitLabRepos(integration.accessToken);

    return Response.json(repos);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
