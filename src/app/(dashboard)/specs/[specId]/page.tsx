import { SECTIONS_ORDER, SECTION_LABELS, type SpecContent } from "@/types/spec";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getSpec } from "@/actions/specs";
import { SpecExportBar } from "@/components/specs/spec-export-bar";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export default async function SpecPage({
  params,
}: {
  params: Promise<{ specId: string }>;
}) {
  const { specId } = await params;
  const [spec, session] = await Promise.all([getSpec(specId), requireSession()]);
  const content = (spec.content ?? {}) as SpecContent;

  // Fetch connected git integrations for the active workspace
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  const [gitIntegrations, trelloIntegration, notionIntegration, clickupIntegration] = user?.activeWorkspaceId
    ? await Promise.all([
        prisma.gitIntegration.findMany({
          where: { workspaceId: user.activeWorkspaceId },
          select: {
            provider: true,
            providerAccountName: true,
            defaultRepoOwner: true,
            defaultRepoName: true,
          },
        }),
        prisma.trelloIntegration.findUnique({
          where: { workspaceId: user.activeWorkspaceId },
          select: { trelloMemberId: true },
        }),
        prisma.notionIntegration.findUnique({
          where: { workspaceId: user.activeWorkspaceId },
          select: { notionWorkspaceId: true },
        }),
        prisma.clickUpIntegration.findUnique({
          where: { workspaceId: user.activeWorkspaceId },
          select: { clickupUserId: true },
        }),
      ])
    : [[], null, null, null];

  const connectedProviders = gitIntegrations.map((g) => ({
    provider: g.provider as "GITHUB" | "GITLAB",
    accountName: g.providerAccountName,
    defaultRepoOwner: g.defaultRepoOwner,
    defaultRepoName: g.defaultRepoName,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/specs">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Mes specs
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {/* Mobile: dropdown export in top bar */}
          <div className="sm:hidden">
            <SpecExportBar
              specId={specId}
              specTitle={spec.title}
              notionConnected={!!notionIntegration}
              connectedProviders={connectedProviders}
              trelloConnected={!!trelloIntegration}
              clickupConnected={!!clickupIntegration}
            />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/specs/${specId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop: prominent export bar between nav and title */}
      <div className="hidden sm:block">
        <SpecExportBar
          specId={specId}
          specTitle={spec.title}
          notionConnected={!!notionIntegration}
          connectedProviders={connectedProviders}
          trelloConnected={!!trelloIntegration}
              clickupConnected={!!clickupIntegration}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-semibold">{spec.title}</h1>
          <Badge variant={spec.status === "DONE" ? "default" : "secondary"}>
            {spec.status === "DONE" ? "Générée" : spec.status}
          </Badge>
        </div>
        {spec.prompt && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {spec.prompt}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {SECTIONS_ORDER.map((section) => {
          const sectionContent = content[section];
          if (!sectionContent) return null;

          return (
            <Card key={section}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {SECTION_LABELS[section]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {section === "personas" || section === "acceptance" ? (
                    <ReactMarkdown
                      components={{
                        h2: ({ children }) => (
                          <p className="font-bold text-foreground not-prose mt-6 first:mt-0">
                            {children}
                          </p>
                        ),
                        h3: ({ children }) => (
                          <p className="font-bold text-foreground not-prose mt-6 first:mt-0">
                            {children}
                          </p>
                        ),
                        hr: () => (
                          <div className="my-6 border-t border-border" />
                        ),
                      }}
                    >
                      {sectionContent}
                    </ReactMarkdown>
                  ) : section === "userStories" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ node, children }) => {
                          const isMoscowHeading =
                            node?.children?.length === 1 &&
                            node.children[0].type === "element" &&
                            (node.children[0] as { tagName?: string }).tagName === "strong";
                          return (
                            <p className={isMoscowHeading ? "font-bold mt-6 first:mt-0" : undefined}>
                              {children}
                            </p>
                          );
                        },
                      }}
                    >
                      {sectionContent}
                    </ReactMarkdown>
                  ) : (
                    <ReactMarkdown>{sectionContent}</ReactMarkdown>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
