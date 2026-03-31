import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";

export const runtime = "nodejs";

const bodySchema = z.object({
  cloudId: z.string().min(1),
  cloudName: z.string().min(1),
  cloudUrl: z.string().min(1),
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

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  if (!user.activeWorkspaceId) {
    return new Response("No active workspace", { status: 400 });
  }

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

  await prisma.jiraIntegration.update({
    where: { workspaceId: user.activeWorkspaceId },
    data: {
      cloudId: body.cloudId,
      cloudName: body.cloudName,
      cloudUrl: body.cloudUrl,
    },
  });

  return Response.json({ success: true });
}
