import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { SECTIONS_ORDER, SECTION_LABELS, type SpecContent } from "@/types/spec";
import { sendSpecNotification } from "@/lib/slack";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ specId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { specId } = await params;

  const spec = await prisma.spec.findUnique({
    where: { id: specId },
    select: { id: true, title: true, prompt: true, content: true, createdAt: true, workspaceId: true },
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

  const content = (spec.content ?? {}) as SpecContent;
  const date = new Date(spec.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lines: string[] = [];

  lines.push(`# ${spec.title}`);
  lines.push("");
  lines.push(`*Généré le ${date}*`);

  if (spec.prompt) {
    lines.push("");
    lines.push(`> ${spec.prompt}`);
  }

  lines.push("");
  lines.push("---");
  lines.push("");

  for (const section of SECTIONS_ORDER) {
    const sectionContent = content[section];
    if (!sectionContent) continue;

    lines.push(`## ${SECTION_LABELS[section]}`);
    lines.push("");
    lines.push(sectionContent);
    lines.push("");
  }

  const markdown = lines.join("\n");
  const filename = `spec-${spec.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.md`;

  void sendSpecNotification(spec.workspaceId, {
    specTitle: spec.title,
    projectName: spec.title,
    specUrl: `${process.env.NEXT_PUBLIC_APP_URL}/specs/${specId}`,
    exportType: "Markdown",
  });

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
