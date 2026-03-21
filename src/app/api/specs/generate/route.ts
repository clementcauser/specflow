import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import {
  SECTIONS_CONFIG,
  SECTIONS_ORDER,
  type SpecSection,
} from "@/types/spec";
import { SpecStatus, WorkspaceProductType, WorkspaceType } from "@prisma/client";
import {
  WORKSPACE_PRODUCT_TYPE_LABELS,
  WORKSPACE_TYPE_LABELS,
  WORKSPACE_TEAM_SIZE_LABELS,
  WORKSPACE_PRODUCT_STAGE_LABELS,
} from "@/types/workspaces";

export const runtime = "nodejs";
export const maxDuration = 120;

const client = new Anthropic();

// ─── Types internes ───────────────────────────────────────────────────────────

type PromptContext =
  | {
      mode: "project"; // AGENCY ou FREELANCE
      title: string;
      productType: string;
      stack: string;
      description: string;
      clientName?: string;
    }
  | {
      mode: "epic"; // PRODUCT
      title: string;
      description: string;
    };

// ─── Workspace context ────────────────────────────────────────────────────────

function buildWorkspaceContext(workspace: {
  name: string;
  type: WorkspaceType;
  specialties: WorkspaceProductType[];
  teamSize?: string | null;
  tagline?: string | null;
  productDescription?: string | null;
  techStack?: string | null;
  productStage?: string | null;
}): string {
  const typeLabel = WORKSPACE_TYPE_LABELS[workspace.type] ?? workspace.type;

  const lines: (string | null)[] = [
    `- Workspace : ${workspace.name}`,
    `- Type : ${typeLabel}`,
  ];

  if (workspace.type === WorkspaceType.AGENCY) {
    const specialtiesList = workspace.specialties
      .map((p) => WORKSPACE_PRODUCT_TYPE_LABELS[p] ?? p)
      .join(", ");
    if (specialtiesList) lines.push(`- Spécialités de l'agence : ${specialtiesList}`);
    if (workspace.teamSize)
      lines.push(`- Taille d'équipe : ${WORKSPACE_TEAM_SIZE_LABELS[workspace.teamSize as keyof typeof WORKSPACE_TEAM_SIZE_LABELS] ?? workspace.teamSize}`);
  } else if (workspace.type === WorkspaceType.PRODUCT) {
    if (workspace.tagline) lines.push(`- Tagline : ${workspace.tagline}`);
    if (workspace.productDescription) lines.push(`- Description du produit : ${workspace.productDescription}`);
    if (workspace.techStack) lines.push(`- Stack technique : ${workspace.techStack}`);
    if (workspace.productStage)
      lines.push(`- Stade : ${WORKSPACE_PRODUCT_STAGE_LABELS[workspace.productStage as keyof typeof WORKSPACE_PRODUCT_STAGE_LABELS] ?? workspace.productStage}`);
  }

  return `[CONTEXTE WORKSPACE]\n${lines.filter(Boolean).join("\n")}\n[/CONTEXTE WORKSPACE]`;
}

// ─── Persona Claude par type ──────────────────────────────────────────────────

function buildPersona(type: WorkspaceType): string {
  switch (type) {
    case WorkspaceType.AGENCY:
      return `Tu es un expert en rédaction de spécifications fonctionnelles pour agences web.
Tu rédiges des specs destinées à être présentées à un client externe et utilisées par une équipe de développement.
Le ton est professionnel, orienté livrable, précis sur les critères d'acceptance.
Chaque user story doit être immédiatement exploitable pour un sprint planning.`;

    case WorkspaceType.PRODUCT:
      return `Tu es un expert en Product Management et rédaction de specs pour équipes produit.
Tu rédiges des specs de features ou d'epics pour un produit existant, utilisées par une équipe interne.
Le ton est orienté équipe produit : pragmatique, contextuel, avec une attention particulière
aux impacts sur les fonctionnalités existantes et à la cohérence avec la vision produit.
Le contexte technique et produit du workspace est déjà connu de l'équipe — ne le réexplique pas.`;

    case WorkspaceType.FREELANCE:
      return `Tu es un expert en rédaction de spécifications fonctionnelles pour développeurs freelance.
Tu rédiges des specs claires et autonomes, utilisées à la fois pour cadrer le projet avec le client
et comme référence de développement.
Le ton est direct, sans jargon inutile, avec une attention particulière à la clarté des critères
de validation — car il n'y a pas toujours d'équipe pour clarifier les ambiguïtés.`;
  }
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(
  context: PromptContext,
  requestedSections: SpecSection[],
  workspaceContext: string,
): string {
  const sectionsToGenerate = SECTIONS_CONFIG.filter(
    (s) => s.alwaysOn || requestedSections.includes(s.key),
  );
  const sectionList = sectionsToGenerate.map((s) => s.prompt).join("\n\n");
  const sectionCount = sectionsToGenerate.length;

  const subjectBlock =
    context.mode === "project"
      ? `**Titre :** ${context.title}
**Type de projet :** ${context.productType}
**Stack technique :** ${context.stack}
**Description du besoin :** ${context.description}
${context.clientName ? `**Client :** ${context.clientName}` : ""}`
      : `**Titre de l'epic :** ${context.title}
**Description :** ${context.description}
La stack technique et le contexte produit sont définis dans le contexte workspace ci-dessus.
Génère la spec en cohérence avec ce contexte — pas besoin de le rappeler dans la spec.`;

  return `${workspaceContext}

Génère une spécification complète pour le sujet suivant :

${subjectBlock}

Génère EXACTEMENT les ${sectionCount} sections suivantes, dans cet ordre, en utilisant EXACTEMENT ces balises de séparation :

${sectionList}

Réponds uniquement avec le contenu des sections, sans introduction ni conclusion. Commence directement par [SECTION:summary].`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { specId } = await request.json();
  if (!specId) return new Response("specId required", { status: 400 });

  const spec = await prisma.spec.findUnique({
    where: { id: specId },
    include: {
      workspace: true,
      Project: {
        include: { Client: true },
      },
      Epic: true,
    },
  });
  if (!spec) return new Response("Spec not found", { status: 404 });
  if (!spec.workspaceId) return new Response("Workspace missing", { status: 400 });
  if (!spec.workspace) return new Response("Workspace not found", { status: 404 });

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: spec.workspaceId,
      },
    },
  });
  if (!member) return new Response("Forbidden", { status: 403 });

  // Sections demandées
  const storedContent = spec.content as Record<string, unknown> | null;
  const requestedSections: SpecSection[] = Array.isArray(storedContent?.["_sections"])
    ? (storedContent["_sections"] as SpecSection[])
    : SECTIONS_ORDER.filter((s) => s !== "summary");

  await prisma.spec.update({
    where: { id: specId },
    data: { status: SpecStatus.GENERATING },
  });

  // Construit le contexte selon le type de spec :
  // une spec a soit un Project, soit un Epic — jamais les deux.
  const promptContext: PromptContext = spec.Project
    ? {
        mode: "project",
        title: spec.title,
        productType:
          WORKSPACE_PRODUCT_TYPE_LABELS[spec.Project.productType as WorkspaceProductType] ??
          spec.Project.productType,
        stack: spec.Project.stack ?? "Non spécifiée",
        description: spec.Project.description ?? spec.prompt ?? "Pas de description",
        clientName:
          spec.Project.Client?.name ??
          spec.Project.clientName ??
          undefined,
      }
    : {
        mode: "epic",
        title: spec.title,
        description: spec.Epic?.description ?? spec.prompt ?? "Pas de description",
      };

  const workspaceContext = buildWorkspaceContext(spec.workspace);
  const persona = buildPersona(spec.workspace.type);

  // Stream SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        const anthropicStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          system: persona,
          messages: [
            {
              role: "user",
              content: buildPrompt(promptContext, requestedSections, workspaceContext),
            },
          ],
        });

        let fullText = "";
        let currentSection: SpecSection | null = null;
        const sections: Partial<Record<SpecSection, string>> = {};

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const token = chunk.delta.text;
            fullText += token;

            const sectionRegex = /\[SECTION:(\w+)\]/g;
            let match;
            let lastIndex = 0;
            const tempText = fullText;

            while ((match = sectionRegex.exec(tempText)) !== null) {
              const sectionKey = match[1] as SpecSection;
              if (!SECTIONS_ORDER.includes(sectionKey)) continue;

              if (currentSection) {
                const content = tempText
                  .slice(lastIndex, match.index)
                  .replace(/^\n+/, "")
                  .trimEnd();
                sections[currentSection] = content;
                send({ type: "section_done", section: currentSection, content });
              }

              currentSection = sectionKey;
              lastIndex = match.index + match[0].length;
              send({ type: "section_start", section: sectionKey });
            }

            if (currentSection) {
              send({ type: "token", section: currentSection, token });
            }
          }
        }

        // Dernière section
        if (currentSection && fullText) {
          const lastTagEnd =
            fullText.lastIndexOf(`[SECTION:${currentSection}]`) +
            `[SECTION:${currentSection}]`.length;
          const finalContent = fullText
            .slice(lastTagEnd)
            .replace(/^\n+/, "")
            .trimEnd();
          sections[currentSection] = finalContent;
          send({ type: "section_done", section: currentSection, content: finalContent });
        }

        await prisma.spec.update({
          where: { id: specId },
          data: { content: sections, status: SpecStatus.DONE },
        });

        send({ type: "done" });
      } catch {
        await prisma.spec.update({
          where: { id: specId },
          data: { status: SpecStatus.ERROR },
        });
        send({ type: "error", message: "Erreur lors de la génération" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
