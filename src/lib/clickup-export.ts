import { prisma } from "@/lib/prisma";
import type { SpecContent } from "@/types/spec";
import { createTask, MOSCOW_TO_CLICKUP_PRIORITY } from "@/lib/clickup";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedStory {
  fullText: string;
  persona: string;
  action: string;
  benefit: string;
  title: string;
  priority: "MUST" | "SHOULD" | "COULD" | "WONT";
}

interface AcceptanceBlock {
  storyTitle: string;
  gherkin: string;
}

// ─── MoSCoW section mapping ───────────────────────────────────────────────────

const MOSCOW_SECTION_MAP: Record<string, ParsedStory["priority"]> = {
  "MUST HAVE": "MUST",
  "SHOULD HAVE": "SHOULD",
  "COULD HAVE": "COULD",
  "WON'T HAVE": "WONT",
  "WONT HAVE": "WONT",
  "COULD HAVE (NICE TO HAVE)": "COULD",
};

// ─── Parsing ──────────────────────────────────────────────────────────────────

function parseUserStories(markdown: string): ParsedStory[] {
  const stories: ParsedStory[] = [];
  let currentPriority: ParsedStory["priority"] = "SHOULD";

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();

    const sectionMatch = line.match(
      /^\*{0,2}#+?\s*(.*?)\*{0,2}$|^\*\*(.+?)\*\*\s*$/
    );
    if (sectionMatch) {
      const sectionText = (sectionMatch[1] ?? sectionMatch[2] ?? "")
        .trim()
        .toUpperCase();
      if (MOSCOW_SECTION_MAP[sectionText]) {
        currentPriority = MOSCOW_SECTION_MAP[sectionText];
        continue;
      }
    }

    if (!line.startsWith("- ") && !line.startsWith("* ")) continue;

    const storyText = line.slice(2).trim();
    if (!storyText.toLowerCase().includes("je veux")) continue;

    const personaMatch = storyText.match(
      /en\s+tant\s+que\s+(.+?),?\s+je\s+veux\s+/i
    );
    const persona = personaMatch ? personaMatch[1].trim() : "";

    const afinDeMatch = storyText.match(/\bafin\s+d[e']?\s+(.+)/i);
    const benefit = afinDeMatch ? afinDeMatch[1].trim() : "";

    const afterJeVeux = storyText.match(/je\s+veux\s+(.+)/i);
    let action = afterJeVeux ? afterJeVeux[1].trim() : storyText;
    if (afinDeMatch?.index !== undefined) {
      const afinStart = storyText.indexOf(afinDeMatch[0]);
      if (afinStart > 0) {
        const jeVeuxMatch = storyText.match(/je\s+veux\s+/i)!;
        const afterJeVeuxStart =
          storyText.search(/je\s+veux\s+/i) + jeVeuxMatch[0].length;
        action = storyText
          .slice(afterJeVeuxStart, afinStart)
          .trim()
          .replace(/,?\s*$/, "");
      }
    }

    const title = persona
      ? `En tant que ${persona}, je veux ${action}`
      : storyText.replace(/,?\s*afin\s+d[e']?\s+.+/i, "").trim();

    stories.push({
      fullText: storyText,
      persona,
      action,
      benefit,
      title,
      priority: currentPriority,
    });
  }

  return stories;
}

function parseAcceptanceCriteria(markdown: string): AcceptanceBlock[] {
  const blocks: AcceptanceBlock[] = [];
  let currentTitle = "";
  const currentLines: string[] = [];

  function flush() {
    if (currentTitle && currentLines.length > 0) {
      blocks.push({
        storyTitle: currentTitle,
        gherkin: currentLines.join("\n"),
      });
    }
  }

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();

    const storyMatch = line.match(/^\*\*Story\s*:\s*(.+?)\*\*\s*$/i);
    if (storyMatch) {
      flush();
      currentTitle = storyMatch[1].trim();
      currentLines.length = 0;
      continue;
    }

    if (
      currentTitle &&
      (line.startsWith("Given") ||
        line.startsWith("When") ||
        line.startsWith("Then") ||
        line.startsWith("And") ||
        line.startsWith("But"))
    ) {
      currentLines.push(line);
    }
  }

  flush();
  return blocks;
}

const STOP_WORDS = new Set([
  "en", "tant", "que", "je", "veux", "une", "un", "de", "du", "des", "le",
  "la", "les", "à", "au", "aux", "et", "ou", "pour", "par", "sur", "dans",
  "avec", "sans", "mon", "ma", "mes", "son", "sa", "ses", "afin", "pouvoir",
  "être", "avoir",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-zàâçéèêëîïôùûüÿæœ\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  );
}

function findMatchingAcceptance(
  story: ParsedStory,
  blocks: AcceptanceBlock[]
): AcceptanceBlock | null {
  if (blocks.length === 0) return null;

  const storyTokens = tokenize(`${story.action} ${story.benefit}`);
  let bestScore = 0;
  let bestBlock: AcceptanceBlock | null = null;

  for (const block of blocks) {
    const blockTokens = tokenize(block.storyTitle);
    let overlap = 0;
    for (const token of blockTokens) {
      if (storyTokens.has(token)) overlap++;
    }
    const score =
      overlap / Math.max(1, Math.min(storyTokens.size, blockTokens.size));
    if (score > bestScore) {
      bestScore = score;
      bestBlock = block;
    }
  }

  return bestScore >= 0.25 ? bestBlock : null;
}

// ─── Task description builder ─────────────────────────────────────────────────

function buildTaskDescription(
  story: ParsedStory,
  acceptance: AcceptanceBlock | null
): string {
  const lines: string[] = [];

  if (story.benefit) {
    const objectif =
      story.benefit.charAt(0).toUpperCase() + story.benefit.slice(1);
    lines.push("## Objectif", objectif, "");
  }

  if (acceptance) {
    lines.push(
      "## Critères d'acceptance",
      "```gherkin",
      acceptance.gherkin,
      "```",
      ""
    );
  }

  lines.push("---", "*Généré par SpecFlow*");

  return lines.join("\n");
}

// ─── Export principal ─────────────────────────────────────────────────────────

export interface ExportStoriesToClickUpParams {
  teamId: string;
  specId: string;
  listId: string;
}

export interface ClickUpExportResult {
  created: number;
  errors: string[];
}

export async function exportStoriesToClickUp(
  params: ExportStoriesToClickUpParams
): Promise<ClickUpExportResult> {
  const { teamId, specId, listId } = params;

  const integration = await prisma.clickUpIntegration.findUnique({
    where: { workspaceId: teamId },
    select: { accessToken: true },
  });

  if (!integration) {
    throw new Error("No ClickUp integration found for this workspace");
  }

  const spec = await prisma.spec.findUnique({
    where: { id: specId },
    select: { content: true },
  });

  if (!spec) throw new Error("Spec not found");

  const content = (spec.content ?? {}) as SpecContent;
  const userStoriesMarkdown = content.userStories ?? "";

  if (!userStoriesMarkdown.trim()) {
    return {
      created: 0,
      errors: ["Aucune user story trouvée dans cette spec."],
    };
  }

  const stories = parseUserStories(userStoriesMarkdown);

  if (stories.length === 0) {
    return {
      created: 0,
      errors: ["Aucune user story n'a pu être extraite."],
    };
  }

  const acceptanceBlocks = content.acceptance
    ? parseAcceptanceCriteria(content.acceptance)
    : [];

  const { accessToken } = integration;

  let created = 0;
  const errors: string[] = [];

  for (const story of stories) {
    try {
      const matched = findMatchingAcceptance(story, acceptanceBlocks);
      await createTask(accessToken, listId, {
        name: story.title,
        description: buildTaskDescription(story, matched),
        priority: MOSCOW_TO_CLICKUP_PRIORITY[story.priority],
        tags: ["specflow", "user-story"],
      });
      created++;
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      errors.push(
        `"${story.title}": ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  return { created, errors };
}
