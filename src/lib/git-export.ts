import { prisma } from "@/lib/prisma";
import { GitProvider } from "@/generated/prisma/client";
import type { SpecContent } from "@/types/spec";
import {
  createIssue as githubCreateIssue,
  ensureLabels as githubEnsureLabels,
  type GitIssuePayload,
} from "@/lib/github";
import {
  createIssue as gitlabCreateIssue,
  ensureLabels as gitlabEnsureLabels,
} from "@/lib/gitlab";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedStory {
  fullText: string; // ligne complète "En tant que… afin de…"
  persona: string;  // "Léa (collaboratrice)"
  action: string;   // "soumettre une demande de congés…"
  benefit: string;  // "déclencher automatiquement le workflow…"
  title: string;    // "En tant que [persona], je veux [action]" (pour le titre de l'issue)
  priority: "MUST" | "SHOULD" | "COULD" | "WONT";
}

interface AcceptanceBlock {
  storyTitle: string;  // contenu de "**Story : …**"
  gherkin: string;     // lignes Given / When / Then
}

// ─── MoSCoW ───────────────────────────────────────────────────────────────────

const MOSCOW_SECTION_MAP: Record<string, ParsedStory["priority"]> = {
  "MUST HAVE": "MUST",
  "SHOULD HAVE": "SHOULD",
  "COULD HAVE": "COULD",
  "WON'T HAVE": "WONT",
  "WONT HAVE": "WONT",
  "COULD HAVE (NICE TO HAVE)": "COULD",
};

const MOSCOW_LABEL_DISPLAY: Record<ParsedStory["priority"], string> = {
  MUST: "MUST HAVE",
  SHOULD: "SHOULD HAVE",
  COULD: "COULD HAVE",
  WONT: "WON'T HAVE",
};

// ─── Parsing user stories ─────────────────────────────────────────────────────

function parseUserStories(markdown: string): ParsedStory[] {
  const stories: ParsedStory[] = [];
  let currentPriority: ParsedStory["priority"] = "SHOULD";

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();

    // Détecte les sections MoSCoW : **MUST HAVE** ou ## MUST HAVE
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

    // Extrait persona (entre "En tant que " et ", je veux" / " je veux")
    const personaMatch = storyText.match(/en\s+tant\s+que\s+(.+?),?\s+je\s+veux\s+/i);
    const persona = personaMatch ? personaMatch[1].trim() : "";

    // Extrait action (entre "je veux " et " afin de" ou fin de ligne)
    const afinDeMatch = storyText.match(/\bafin\s+d[e']?\s+(.+)/i);
    const benefit = afinDeMatch ? afinDeMatch[1].trim() : "";

    const afterJeVeux = storyText.match(/je\s+veux\s+(.+)/i);
    let action = afterJeVeux ? afterJeVeux[1].trim() : storyText;
    if (afinDeMatch?.index !== undefined) {
      // Tronque l'action avant "afin de"
      const afinStart = storyText.indexOf(afinDeMatch[0]);
      if (afinStart > 0) {
        const afterJeVeuxStart = storyText.search(/je\s+veux\s+/i) + storyText.match(/je\s+veux\s+/i)![0].length;
        action = storyText.slice(afterJeVeuxStart, afinStart).trim().replace(/,?\s*$/, "");
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

// ─── Parsing acceptance criteria ──────────────────────────────────────────────

function parseAcceptanceCriteria(markdown: string): AcceptanceBlock[] {
  const blocks: AcceptanceBlock[] = [];
  let currentTitle = "";
  const currentLines: string[] = [];

  function flush() {
    if (currentTitle && currentLines.length > 0) {
      blocks.push({ storyTitle: currentTitle, gherkin: currentLines.join("\n") });
    }
  }

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();

    // Détecte **Story : Titre de la story**
    const storyMatch = line.match(/^\*\*Story\s*:\s*(.+?)\*\*\s*$/i);
    if (storyMatch) {
      flush();
      currentTitle = storyMatch[1].trim();
      currentLines.length = 0;
      continue;
    }

    if (currentTitle && (line.startsWith("Given") || line.startsWith("When") || line.startsWith("Then") || line.startsWith("And") || line.startsWith("But"))) {
      currentLines.push(line);
    }
  }

  flush();
  return blocks;
}

// ─── Matching acceptance criteria to a story ──────────────────────────────────

const STOP_WORDS = new Set([
  "en", "tant", "que", "je", "veux", "une", "un", "de", "du", "des", "le", "la", "les",
  "à", "au", "aux", "et", "ou", "pour", "par", "sur", "dans", "avec", "sans",
  "mon", "ma", "mes", "son", "sa", "ses", "afin", "pouvoir", "être", "avoir",
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
    // Score normalisé par la taille du plus petit set
    const score = overlap / Math.max(1, Math.min(storyTokens.size, blockTokens.size));
    if (score > bestScore) {
      bestScore = score;
      bestBlock = block;
    }
  }

  // Seuil minimum pour éviter les faux positifs
  return bestScore >= 0.25 ? bestBlock : null;
}

// ─── Construction du body de l'issue ─────────────────────────────────────────

function buildIssueBody(story: ParsedStory, acceptance: AcceptanceBlock | null): string {
  const lines: string[] = [];

  // Intro : story complète avec mise en forme
  if (story.persona && story.action) {
    const intro = story.benefit
      ? `En tant que **${story.persona}**, je veux **${story.action}**, afin de ${story.benefit}.`
      : `En tant que **${story.persona}**, je veux **${story.action}**.`;
    lines.push(intro, "");
  }

  // Objectif
  if (story.benefit) {
    // Capitalise la première lettre
    const objectif = story.benefit.charAt(0).toUpperCase() + story.benefit.slice(1);
    lines.push("## Objectif", objectif, "");
  }

  // Critères d'acceptance
  if (acceptance) {
    lines.push("## Critères d'acceptance", "```gherkin", acceptance.gherkin, "```", "");
  }

  // Footer
  lines.push("---");
  lines.push(`🏷️ Priorité : **${MOSCOW_LABEL_DISPLAY[story.priority]}**  `);
  lines.push("*Généré par [SpecFlow](https://specflow.fr)*");

  return lines.join("\n");
}

// ─── Export principal ─────────────────────────────────────────────────────────

export interface ExportStoriesToGitParams {
  teamId: string;
  specId: string;
  provider: GitProvider;
  owner: string;
  repo: string;
  repoId?: number; // GitLab uniquement
}

export interface ExportResult {
  created: number;
  errors: string[];
}

export async function exportStoriesToGit(
  params: ExportStoriesToGitParams
): Promise<ExportResult> {
  const { teamId, specId, provider, owner, repo, repoId } = params;

  const integration = await prisma.gitIntegration.findUnique({
    where: { workspaceId_provider: { workspaceId: teamId, provider } },
    select: { accessToken: true },
  });

  if (!integration) {
    throw new Error(`No ${provider} integration found for this workspace`);
  }

  const spec = await prisma.spec.findUnique({
    where: { id: specId },
    select: { content: true },
  });

  if (!spec) throw new Error("Spec not found");

  const content = (spec.content ?? {}) as SpecContent;
  const userStoriesMarkdown = content.userStories ?? "";

  if (!userStoriesMarkdown.trim()) {
    return { created: 0, errors: ["Aucune user story trouvée dans cette spec."] };
  }

  const stories = parseUserStories(userStoriesMarkdown);

  if (stories.length === 0) {
    return { created: 0, errors: ["Aucune user story n'a pu être extraite."] };
  }

  // Pré-parse les critères d'acceptance pour le matching
  const acceptanceBlocks = content.acceptance
    ? parseAcceptanceCriteria(content.acceptance)
    : [];

  const { accessToken } = integration;
  let created = 0;
  const errors: string[] = [];

  if (provider === "GITHUB") {
    try {
      await githubEnsureLabels(accessToken, owner, repo);
    } catch {
      // Non-fatal
    }

    for (const story of stories) {
      try {
        const matched = findMatchingAcceptance(story, acceptanceBlocks);
        const payload: GitIssuePayload = {
          title: story.title,
          body: buildIssueBody(story, matched),
          labels: [story.priority],
        };
        await githubCreateIssue(accessToken, owner, repo, payload);
        created++;
        await new Promise((r) => setTimeout(r, 100));
      } catch (err) {
        errors.push(
          `"${story.title}": ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }
  } else {
    if (!repoId) throw new Error("repoId is required for GitLab export");

    try {
      await gitlabEnsureLabels(accessToken, repoId);
    } catch {
      // Non-fatal
    }

    for (const story of stories) {
      try {
        const matched = findMatchingAcceptance(story, acceptanceBlocks);
        const payload: GitIssuePayload = {
          title: story.title,
          body: buildIssueBody(story, matched),
          labels: [story.priority],
        };
        await gitlabCreateIssue(accessToken, repoId, payload);
        created++;
        await new Promise((r) => setTimeout(r, 100));
      } catch (err) {
        errors.push(
          `"${story.title}": ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }
  }

  return { created, errors };
}
