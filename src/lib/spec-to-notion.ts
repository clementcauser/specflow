import { SECTIONS_ORDER, SECTION_LABELS, type SpecContent, type SpecSection } from "@/types/spec";
import type { NotionBlock } from "./notion";

// ── Block builders ────────────────────────────────────────────────────────────

function heading1(text: string): NotionBlock {
  return {
    object: "block",
    type: "heading_1",
    heading_1: { rich_text: [{ type: "text", text: { content: text } }] },
  };
}

function heading2(text: string): NotionBlock {
  return {
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: [{ type: "text", text: { content: text } }] },
  };
}

function paragraph(text: string): NotionBlock {
  return {
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: [{ type: "text", text: { content: text } }] },
  };
}

function divider(): NotionBlock {
  return { object: "block", type: "divider", divider: {} };
}

function callout(text: string, emoji = "📝"): NotionBlock {
  return {
    object: "block",
    type: "callout",
    callout: {
      rich_text: [{ type: "text", text: { content: text } }],
      icon: { type: "emoji", emoji },
    },
  };
}

// ── Markdown parser → Notion blocks ──────────────────────────────────────────
// The spec sections are stored as Markdown strings. We do a lightweight parse
// to turn them into structured Notion blocks instead of dumping raw Markdown.

function markdownToBlocks(markdown: string, section: SpecSection): NotionBlock[] {
  const lines = markdown.split("\n");
  const blocks: NotionBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines (they separate blocks naturally)
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Heading 3 (###)
    if (line.startsWith("### ")) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: line.slice(4).trim() } }] },
      });
      i++;
      continue;
    }

    // Heading 2 (##) — treat as heading_3 since the section already has a heading_2
    if (line.startsWith("## ")) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: line.slice(3).trim() } }] },
      });
      i++;
      continue;
    }

    // Heading 1 (#)
    if (line.startsWith("# ")) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: line.slice(2).trim() } }] },
      });
      i++;
      continue;
    }

    // Bullet list item (- or *)
    if (line.match(/^[-*]\s+/)) {
      const content = line.replace(/^[-*]\s+/, "").trim();
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: buildRichText(content),
        },
      });
      i++;
      continue;
    }

    // Numbered list item
    if (line.match(/^\d+\.\s+/)) {
      const content = line.replace(/^\d+\.\s+/, "").trim();
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: buildRichText(content),
        },
      });
      i++;
      continue;
    }

    // Gherkin code blocks for acceptance criteria section
    if (section === "acceptance" && (line.startsWith("Given ") || line.startsWith("When ") || line.startsWith("Then "))) {
      // Collect contiguous Gherkin lines
      const gherkinLines: string[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("Given ") ||
          lines[i].startsWith("When ") ||
          lines[i].startsWith("Then ") ||
          lines[i].startsWith("And ") ||
          lines[i].startsWith("But "))
      ) {
        gherkinLines.push(lines[i]);
        i++;
      }
      blocks.push({
        object: "block",
        type: "code",
        code: {
          language: "plain text",
          rich_text: [{ type: "text", text: { content: gherkinLines.join("\n") } }],
        },
      });
      continue;
    }

    // Blockquote (>)
    if (line.startsWith("> ")) {
      blocks.push(callout(line.slice(2).trim(), "💡"));
      i++;
      continue;
    }

    // Bold-prefixed lines like **MUST HAVE** → heading_3
    if (line.match(/^\*\*[^*]+\*\*\s*$/)) {
      const text = line.replace(/\*\*/g, "").trim();
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: text } }] },
      });
      i++;
      continue;
    }

    // Indented sub-item (2-space or tab indent bullet)
    if (line.match(/^(\s{2,}|\t)[-*]\s+/)) {
      const content = line.replace(/^(\s{2,}|\t)[-*]\s+/, "").trim();
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: buildRichText(content),
        },
      });
      i++;
      continue;
    }

    // Indented text under a bullet — treat as paragraph
    if (line.match(/^(\s{2,}|\t)/)) {
      const content = line.trim();
      if (content) {
        blocks.push(paragraph(content));
      }
      i++;
      continue;
    }

    // Default: paragraph
    const trimmed = line.trim();
    if (trimmed) {
      blocks.push(paragraph(trimmed));
    }
    i++;
  }

  return blocks;
}

// Build rich text with bold/italic inline formatting support
interface RichTextItem {
  type: "text";
  text: { content: string };
  annotations?: { bold?: boolean; italic?: boolean; code?: boolean };
}

function buildRichText(text: string): RichTextItem[] {
  // Split on **bold**, *italic*, `code` markers
  const parts: RichTextItem[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", text: { content: text.slice(lastIndex, match.index) } });
    }

    const raw = match[0];
    if (raw.startsWith("**")) {
      parts.push({
        type: "text",
        text: { content: raw.slice(2, -2) },
        annotations: { bold: true },
      });
    } else if (raw.startsWith("*")) {
      parts.push({
        type: "text",
        text: { content: raw.slice(1, -1) },
        annotations: { italic: true },
      });
    } else if (raw.startsWith("`")) {
      parts.push({
        type: "text",
        text: { content: raw.slice(1, -1) },
        annotations: { code: true },
      });
    }

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", text: { content: text.slice(lastIndex) } });
  }

  return parts.length > 0 ? parts : [{ type: "text", text: { content: text } }];
}

// ── Main export ───────────────────────────────────────────────────────────────

export function specToNotionBlocks(
  title: string,
  prompt: string | null | undefined,
  createdAt: Date,
  content: SpecContent
): NotionBlock[] {
  const blocks: NotionBlock[] = [];

  // Page header
  blocks.push(heading1(title));

  const date = createdAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  blocks.push(paragraph(`Généré le ${date}`));

  if (prompt) {
    blocks.push(callout(prompt, "💬"));
  }

  blocks.push(divider());

  // Sections
  for (const section of SECTIONS_ORDER) {
    const sectionContent = content[section];
    if (!sectionContent) continue;

    blocks.push(heading2(SECTION_LABELS[section]));
    blocks.push(...markdownToBlocks(sectionContent, section));
    blocks.push(divider());
  }

  return blocks;
}
