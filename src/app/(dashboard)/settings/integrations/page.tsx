import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NotionConnect } from "@/components/integrations/notion-connect";

export default async function IntegrationsPage() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  const workspaceId = user.activeWorkspaceId;

  // Fetch integration status + member role in one go
  const [integration, member] = workspaceId
    ? await Promise.all([
        prisma.notionIntegration.findUnique({
          where: { workspaceId },
          select: {
            notionWorkspaceName: true,
            notionWorkspaceIcon: true,
            createdAt: true,
          },
        }),
        prisma.member.findUnique({
          where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
          select: { role: true },
        }),
      ])
    : [null, null];

  const canManage = !!member && ["OWNER", "ADMIN"].includes(member.role);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Intégrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connectez des outils tiers pour enrichir vos exports.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Outils d&apos;export</CardTitle>
          <CardDescription>
            Exportez vos specs directement dans vos outils de documentation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspaceId ? (
            <NotionConnect
              workspaceId={workspaceId}
              connected={!!integration}
              notionWorkspaceName={integration?.notionWorkspaceName}
              notionWorkspaceIcon={integration?.notionWorkspaceIcon}
              connectedAt={integration?.createdAt}
              canManage={canManage}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun espace de travail actif.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
