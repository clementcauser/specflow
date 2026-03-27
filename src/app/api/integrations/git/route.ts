import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { GitProvider } from "@/generated/prisma/client";
import { z } from "zod/v4";

export const runtime = "nodejs";

// GET /api/integrations/git?provider=GITHUB|GITLAB
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
    return Response.json({ connected: false });
  }

  const integration = await prisma.gitIntegration.findUnique({
    where: {
      workspaceId_provider: {
        workspaceId: user.activeWorkspaceId,
        provider,
      },
    },
    select: {
      providerAccountName: true,
      defaultRepoOwner: true,
      defaultRepoName: true,
      createdAt: true,
    },
  });

  if (!integration) {
    return Response.json({ connected: false });
  }

  return Response.json({
    connected: true,
    accountName: integration.providerAccountName,
    defaultRepoOwner: integration.defaultRepoOwner,
    defaultRepoName: integration.defaultRepoName,
    connectedAt: integration.createdAt,
  });
}

const patchSchema = z.object({
  provider: z.enum(["GITHUB", "GITLAB"]),
  defaultRepoOwner: z.string().nullable(),
  defaultRepoName: z.string().nullable(),
});

// PATCH /api/integrations/git — save default repo
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
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

  await prisma.gitIntegration.update({
    where: {
      workspaceId_provider: {
        workspaceId: user.activeWorkspaceId,
        provider: body.provider,
      },
    },
    data: {
      defaultRepoOwner: body.defaultRepoOwner,
      defaultRepoName: body.defaultRepoName,
    },
  });

  return new Response(null, { status: 204 });
}

// DELETE /api/integrations/git?provider=GITHUB|GITLAB
export async function DELETE(request: NextRequest) {
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

  await prisma.gitIntegration.deleteMany({
    where: {
      workspaceId: user.activeWorkspaceId,
      provider,
    },
  });

  return new Response(null, { status: 204 });
}
