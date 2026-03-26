import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { SECTIONS_ORDER, SECTION_LABELS, type SpecContent } from "@/types/spec";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import React from "react";

export const runtime = "nodejs";

// ─── Theme colors (approximated from oklch CSS variables) ─────────────────────
const COLORS = {
  primary: "#6B5CE7",
  primaryLight: "#EDE9FE",
  primaryDark: "#4C3EC5",
  background: "#F8F7FF",
  foreground: "#2C2C42",
  muted: "#6B6B8A",
  mutedBg: "#F3F2FB",
  border: "#D4D1EF",
  white: "#FFFFFF",
  accent: "#9B8CF5",
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    fontFamily: "Helvetica",
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 0,
  },

  // Header band
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 48,
    paddingTop: 40,
    paddingBottom: 32,
    marginBottom: 0,
  },
  headerLabel: {
    fontSize: 9,
    color: COLORS.accent,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    lineHeight: 1.3,
    marginBottom: 12,
  },
  headerMeta: {
    fontSize: 10,
    color: "#C4B8FF",
    lineHeight: 1.4,
  },
  headerPrompt: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#9B8CF5",
    fontSize: 10,
    color: "#DDD8FF",
    lineHeight: 1.6,
    fontStyle: "italic",
  },

  // Body
  body: {
    paddingHorizontal: 48,
    paddingTop: 32,
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primaryLight,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  sectionContent: {
    paddingLeft: 16,
  },

  // Text elements
  paragraph: {
    fontSize: 10,
    color: COLORS.foreground,
    lineHeight: 1.7,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 10,
    color: COLORS.foreground,
    lineHeight: 1.7,
    marginBottom: 4,
    paddingLeft: 8,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: COLORS.foreground,
    marginTop: 8,
    marginBottom: 4,
  },
  code: {
    fontFamily: "Courier",
    fontSize: 9,
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    padding: 2,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerLeft: {
    fontSize: 8,
    color: COLORS.muted,
  },
  footerRight: {
    fontSize: 8,
    color: COLORS.muted,
  },

  // Decorative side bar on sections
  sectionCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 12,
    marginBottom: 6,
    backgroundColor: COLORS.mutedBg,
    padding: 10,
    borderRadius: 4,
  },
});

// ─── Markdown-to-PDF renderer ─────────────────────────────────────────────────
// We do a lightweight parse of markdown to PDF primitives.

function renderMarkdownToPDF(text: string): React.ReactElement[] {
  const elements: React.ReactElement[] = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // H1-H3 headings
    if (line.startsWith("### ")) {
      elements.push(
        <Text key={i} style={[styles.bold, { fontSize: 11, color: COLORS.primaryDark, marginTop: 12 }]}>
          {line.slice(4)}
        </Text>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <Text key={i} style={[styles.bold, { fontSize: 12, color: COLORS.primary, marginTop: 14 }]}>
          {line.slice(3)}
        </Text>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <Text key={i} style={[styles.bold, { fontSize: 14, color: COLORS.primary, marginTop: 16 }]}>
          {line.slice(2)}
        </Text>
      );
      i++;
      continue;
    }

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.slice(2);
      elements.push(
        <View key={i} style={{ flexDirection: "row", marginBottom: 4, paddingLeft: 8 }}>
          <Text style={{ fontSize: 10, color: COLORS.primary, marginRight: 6, marginTop: 1 }}>•</Text>
          <Text style={{ fontSize: 10, color: COLORS.foreground, lineHeight: 1.7, flex: 1 }}>
            {renderInlineMarkdown(content)}
          </Text>
        </View>
      );
      i++;
      continue;
    }

    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      elements.push(
        <View key={i} style={{ flexDirection: "row", marginBottom: 4, paddingLeft: 8 }}>
          <Text style={{ fontSize: 10, color: COLORS.primary, marginRight: 6, minWidth: 16 }}>{numberedMatch[1]}.</Text>
          <Text style={{ fontSize: 10, color: COLORS.foreground, lineHeight: 1.7, flex: 1 }}>
            {renderInlineMarkdown(numberedMatch[2])}
          </Text>
        </View>
      );
      i++;
      continue;
    }

    // Bold line (standalone **text**)
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(
        <Text key={i} style={styles.bold}>
          {line.slice(2, -2)}
        </Text>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "___") {
      elements.push(
        <View key={i} style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border, marginVertical: 8 }} />
      );
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <Text key={i} style={styles.paragraph}>
        {renderInlineMarkdown(line)}
      </Text>
    );
    i++;
  }

  return elements;
}

// Inline markdown: bold (**text**) and italic (*text*)
function renderInlineMarkdown(text: string): string {
  // For @react-pdf/renderer, we can't easily do mixed inline bold/italic
  // So we strip the markers and keep the text
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1");
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

function SpecPDF({
  title,
  prompt,
  date,
  content,
}: {
  title: string;
  prompt?: string | null;
  date: string;
  content: SpecContent;
}) {
  const availableSections = SECTIONS_ORDER.filter((s) => !!content[s]);

  return (
    <Document
      title={title}
      author="SpecFlow"
      subject="Spécification fonctionnelle"
      creator="SpecFlow"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Spécification fonctionnelle</Text>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerMeta}>Généré le {date} · SpecFlow</Text>
          {prompt && (
            <Text style={styles.headerPrompt}>{prompt}</Text>
          )}
        </View>

        {/* ── Content ── */}
        <View style={styles.body}>
          {availableSections.map((section) => {
            const sectionContent = content[section]!;
            return (
              <View key={section} style={styles.section}>
                <View style={styles.sectionHeader} wrap={false}>
                  <View style={styles.sectionDot} />
                  <Text style={styles.sectionTitle}>{SECTION_LABELS[section]}</Text>
                </View>
                <View style={styles.sectionContent}>
                  {renderMarkdownToPDF(sectionContent)}
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>{title}</Text>
          <Text
            style={styles.footerRight}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

// ─── Route handler ─────────────────────────────────────────────────────────────

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

  const pdfBuffer = await renderToBuffer(
    React.createElement(SpecPDF, {
      title: spec.title,
      prompt: spec.prompt,
      date,
      content,
    })
  );

  const filename = `spec-${spec.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
