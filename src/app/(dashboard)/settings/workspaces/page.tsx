import Link from "next/link";
import { getUserWorkspaces } from "@/actions/workspaces";
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { Button } from "@/components/ui/button";

export default async function WorkspacesSettingsPage() {
  const workspaces = await getUserWorkspaces();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes espaces de travail</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos espaces de travail et les membres associés.
          </p>
        </div>
        <Button asChild>
          <Link href="/workspaces/new">Créer un espace de travail</Link>
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            Vous n&apos;appartenez à aucun espace de travail.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Créez votre premier espace de travail pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </div>
  );
}
