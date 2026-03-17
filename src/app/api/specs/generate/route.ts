import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { SECTIONS_CONFIG, SECTIONS_ORDER, type SpecSection } from "@/types/spec";

export const runtime = "nodejs";
export const maxDuration = 120;

const client = new Anthropic();

function buildPrompt(
  spec: {
    title: string;
    projectType: string;
    stack: string;
    description: string;
  },
  requestedSections: SpecSection[],
): string {
  const sectionsToGenerate = SECTIONS_CONFIG.filter(
    (s) => s.alwaysOn || requestedSections.includes(s.key),
  );

  const sectionCount = sectionsToGenerate.length;
  const sectionList = sectionsToGenerate.map((s) => s.prompt).join("\n\n");

  return `Tu es un expert en rédaction de spécifications fonctionnelles pour agences web.

Génère une spécification technique complète et professionnelle pour le projet suivant :

**Titre :** ${spec.title}
**Type de projet :** ${spec.projectType}
**Stack technique :** ${spec.stack}
**Description du besoin :** ${spec.description}

Génère EXACTEMENT les ${sectionCount} sections suivantes, dans cet ordre, en utilisant EXACTEMENT ces balises de séparation :

${sectionList}

Réponds uniquement avec le contenu des sections, sans introduction ni conclusion. Commence directement par [SECTION:summary].`;
}

export async function POST(request: NextRequest) {
  // Auth
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { specId } = await request.json();
  if (!specId) return new Response("specId required", { status: 400 });

  // Récupère la spec
  const spec = await prisma.spec.findUnique({ where: { id: specId } });
  if (!spec) return new Response("Spec not found", { status: 404 });

  // Détermine les sections demandées (stockées dans content._sections)
  const storedContent = spec.content as Record<string, unknown> | null;
  const requestedSections: SpecSection[] = Array.isArray(
    storedContent?.["_sections"],
  )
    ? (storedContent["_sections"] as SpecSection[])
    : []; // Si undefined, par défaut on n'a que le summary (qui est alwaysOn de toute façon) ou on peut faire un fallback if needed.
  
  // Actually, if _sections is totally undefined, it might be an old spec.
  if (!storedContent || !Array.isArray(storedContent["_sections"])) {
    // Fallback for older specs
    requestedSections.push(...SECTIONS_ORDER.filter((s) => s !== "summary"));
  }

  // Vérifie accès
  const member = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: spec.organizationId,
      },
    },
  });
  if (!member) return new Response("Forbidden", { status: 403 });

  // Passe en statut "generating"
  await prisma.spec.update({
    where: { id: specId },
    data: { status: "generating" },
  });

  // Stream SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const anthropicStream = await client.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 8000,
          messages: [{ role: "user", content: buildPrompt(spec, requestedSections) }],
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

            // Détecte les balises de section
            const sectionRegex = /\[SECTION:(\w+)\]/g;
            let match;
            let lastIndex = 0;
            const tempText = fullText;

            // Cherche si on a une nouvelle balise complète
            while ((match = sectionRegex.exec(tempText)) !== null) {
              const sectionKey = match[1] as SpecSection;
              if (!SECTIONS_ORDER.includes(sectionKey)) continue;

              // Sauvegarde la section précédente
              if (currentSection) {
                const content = tempText
                  .slice(lastIndex, match.index)
                  .replace(/^\n+/, "")
                  .trimEnd();
                sections[currentSection] = content;
                send({
                  type: "section_done",
                  section: currentSection,
                  content,
                });
              }

              currentSection = sectionKey;
              lastIndex = match.index + match[0].length;

              send({ type: "section_start", section: sectionKey });
            }

            // Envoie le token en cours si on est dans une section
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
          send({
            type: "section_done",
            section: currentSection,
            content: finalContent,
          });
        }

        // Sauvegarde en BDD
        await prisma.spec.update({
          where: { id: specId },
          data: { content: sections, status: "done" },
        });

        send({ type: "done" });
      } catch {
        await prisma.spec.update({
          where: { id: specId },
          data: { status: "error" },
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
