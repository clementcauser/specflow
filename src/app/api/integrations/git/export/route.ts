import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { exportStoriesToGit } from "@/lib/git-export";
import { z } from "zod/v4";

export const runtime = "nodejs";

const bodySchema = z.object({
  specId: z.string().min(1),
  provider: z.enum(["GITHUB", "GITLAB"]),
  owner: z.string().min(1),
  repo: z.string().min(1),
  repoId: z.number().optional(), // required for GitLab
});

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const { specId, provider, owner, repo, repoId } = body;

  // Verify spec exists and user has access
  const spec = await prisma.spec.findUnique({
    where: { id: specId },
    select: { workspaceId: true },
  });

  if (!spec) return new Response("Not found", { status: 404 });
  if (!spec.workspaceId) return new Response("Workspace missing", { status: 400 });

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: spec.workspaceId,
      },
    },
  });

  if (!member) return new Response("Forbidden", { status: 403 });

  if (provider === "GITLAB" && !repoId) {
    return new Response("repoId is required for GitLab", { status: 400 });
  }

  try {
    const result = await exportStoriesToGit({
      teamId: spec.workspaceId,
      specId,
      provider,
      owner,
      repo,
      repoId,
    });

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Git export error]", message);
    return Response.json({ error: "git_export_failed", detail: message }, { status: 500 });
  }
}
