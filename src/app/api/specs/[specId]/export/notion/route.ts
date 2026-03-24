import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createNotionPage } from "@/lib/notion";
import { specToNotionBlocks } from "@/lib/spec-to-notion";
import type { SpecContent } from "@/types/spec";
import { z } from "zod/v4";

export const runtime = "nodejs";

const bodySchema = z.object({
  pageId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ specId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { specId } = await params;

  // Parse + validate body
  let pageId: string;
  try {
    const body = await request.json();
    ({ pageId } = bodySchema.parse(body));
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  // Fetch spec
  const spec = await prisma.spec.findUnique({
    where: { id: specId },
    select: {
      id: true,
      title: true,
      prompt: true,
      content: true,
      createdAt: true,
      workspaceId: true,
    },
  });

  if (!spec) return new Response("Not found", { status: 404 });
  if (!spec.workspaceId) return new Response("Workspace missing", { status: 400 });

  // Check workspace membership
  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: spec.workspaceId,
      },
    },
  });
  if (!member) return new Response("Forbidden", { status: 403 });

  // Fetch Notion integration for this workspace
  const integration = await prisma.notionIntegration.findUnique({
    where: { workspaceId: spec.workspaceId },
    select: { accessToken: true },
  });

  if (!integration) {
    return Response.json({ error: "notion_not_connected" }, { status: 400 });
  }

  const content = (spec.content ?? {}) as SpecContent;
  const blocks = specToNotionBlocks(spec.title, spec.prompt, spec.createdAt, content);

  try {
    const page = await createNotionPage(
      integration.accessToken,
      pageId,
      spec.title,
      blocks
    );

    return Response.json({ url: page.url, pageId: page.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("401") || message.includes("unauthorized")) {
      return Response.json({ error: "notion_unauthorized" }, { status: 401 });
    }

    return Response.json({ error: "notion_export_failed", detail: message }, { status: 500 });
  }
}
