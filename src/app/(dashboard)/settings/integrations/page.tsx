import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NotionConnect } from "@/components/integrations/notion-connect";
import { GitIntegrationCard } from "@/components/integrations/GitIntegrationCard";
import { TrelloIntegrationCard } from "@/components/integrations/TrelloIntegrationCard";
import { ClickUpIntegrationCard } from "@/components/integrations/ClickUpIntegrationCard";

export default async function IntegrationsPage() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  const workspaceId = user.activeWorkspaceId;

  const [
    notionIntegration,
    member,
    gitIntegrations,
    trelloIntegration,
    clickupIntegration,
  ] = workspaceId
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
          where: {
            userId_workspaceId: { userId: session.user.id, workspaceId },
          },
          select: { role: true },
        }),
        prisma.gitIntegration.findMany({
          where: { workspaceId },
          select: {
            provider: true,
            providerAccountName: true,
            defaultRepoOwner: true,
            defaultRepoName: true,
            createdAt: true,
          },
        }),
        prisma.trelloIntegration.findUnique({
          where: { workspaceId },
          select: {
            trelloUsername: true,
            trelloFullName: true,
            defaultBoardId: true,
            defaultBoardName: true,
            defaultListId: true,
            defaultListName: true,
            createdAt: true,
          },
        }),
        prisma.clickUpIntegration.findUnique({
          where: { workspaceId },
          select: {
            clickupUserName: true,
            clickupWorkspaceName: true,
            defaultSpaceId: true,
            defaultListId: true,
            defaultListName: true,
            createdAt: true,
          },
        }),
      ])
    : [null, null, [], null, null];

  const canManage = !!member && ["OWNER", "ADMIN"].includes(member.role);

  const githubIntegration = gitIntegrations.find(
    (g) => g.provider === "GITHUB",
  );
  const gitlabIntegration = gitIntegrations.find(
    (g) => g.provider === "GITLAB",
  );

  const showGitLab = !!process.env.GITLAB_CLIENT_ID;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Intégrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connectez des outils tiers pour enrichir vos exports.
        </p>
      </div>

      {/* Documentation tools */}
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
              connected={!!notionIntegration}
              notionWorkspaceName={notionIntegration?.notionWorkspaceName}
              notionWorkspaceIcon={notionIntegration?.notionWorkspaceIcon}
              connectedAt={notionIntegration?.createdAt}
              canManage={canManage}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun espace de travail actif.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Trello integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trello</CardTitle>
          <CardDescription>
            Exportez vos user stories directement en cartes Trello.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workspaceId ? (
            <TrelloIntegrationCard
              workspaceId={workspaceId}
              connected={!!trelloIntegration}
              username={trelloIntegration?.trelloUsername}
              fullName={trelloIntegration?.trelloFullName}
              defaultBoardId={trelloIntegration?.defaultBoardId}
              defaultBoardName={trelloIntegration?.defaultBoardName}
              defaultListId={trelloIntegration?.defaultListId}
              defaultListName={trelloIntegration?.defaultListName}
              connectedAt={trelloIntegration?.createdAt}
              canManage={canManage}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun espace de travail actif.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Git integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gestion de projet</CardTitle>
          <CardDescription>
            Exportez vos user stories directement en issues GitHub ou GitLab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspaceId ? (
            <>
              <GitIntegrationCard
                workspaceId={workspaceId}
                provider="GITHUB"
                connected={!!githubIntegration}
                accountName={githubIntegration?.providerAccountName}
                defaultRepoOwner={githubIntegration?.defaultRepoOwner}
                defaultRepoName={githubIntegration?.defaultRepoName}
                connectedAt={githubIntegration?.createdAt}
                canManage={canManage}
              />

              {showGitLab && (
                <>
                  <Separator />
                  <GitIntegrationCard
                    workspaceId={workspaceId}
                    provider="GITLAB"
                    connected={!!gitlabIntegration}
                    accountName={gitlabIntegration?.providerAccountName}
                    defaultRepoOwner={gitlabIntegration?.defaultRepoOwner}
                    defaultRepoName={gitlabIntegration?.defaultRepoName}
                    connectedAt={gitlabIntegration?.createdAt}
                    canManage={canManage}
                  />
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun espace de travail actif.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Task management integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gestion des tâches</CardTitle>
          <CardDescription>
            Exportez vos user stories en cartes ou tâches dans vos outils de
            gestion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspaceId ? (
            <>
              <TrelloIntegrationCard
                workspaceId={workspaceId}
                connected={!!trelloIntegration}
                username={trelloIntegration?.trelloUsername}
                fullName={trelloIntegration?.trelloFullName}
                defaultBoardId={trelloIntegration?.defaultBoardId}
                defaultBoardName={trelloIntegration?.defaultBoardName}
                defaultListId={trelloIntegration?.defaultListId}
                defaultListName={trelloIntegration?.defaultListName}
                connectedAt={trelloIntegration?.createdAt}
                canManage={canManage}
              />
              <Separator />
              <ClickUpIntegrationCard
                workspaceId={workspaceId}
                connected={!!clickupIntegration}
                clickupUserName={clickupIntegration?.clickupUserName}
                clickupWorkspaceName={clickupIntegration?.clickupWorkspaceName}
                defaultSpaceId={clickupIntegration?.defaultSpaceId}
                defaultListId={clickupIntegration?.defaultListId}
                defaultListName={clickupIntegration?.defaultListName}
                connectedAt={clickupIntegration?.createdAt}
                canManage={canManage}
              />
            </>
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
