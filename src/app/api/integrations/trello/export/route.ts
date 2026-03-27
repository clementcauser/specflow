import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { exportStoriesToTrello } from "@/lib/trello-export";
import { z } from "zod/v4";

export const runtime = "nodejs";

const bodySchema = z.object({
  specId: z.string().min(1),
  boardId: z.string().min(1),
  listId: z.string().min(1),
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

  const { specId, boardId, listId } = body;

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

  try {
    const result = await exportStoriesToTrello({
      teamId: spec.workspaceId,
      specId,
      boardId,
      listId,
    });

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Trello export error]", message);
    return Response.json(
      { error: "trello_export_failed", detail: message },
      { status: 500 }
    );
  }
}
