import Link from "next/link";
import { getUserWorkspaces } from "@/actions/workspaces";
import { getActiveWorkspace } from "@/actions/tenant";
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { Button } from "@/components/ui/button";

export default async function WorkspacesPage() {
  const [workspaces, activeWorkspace] = await Promise.all([
    getUserWorkspaces(),
    getActiveWorkspace(),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes espaces de travail</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez vos espaces de travail et basculez de l&apos;un à l&apos;autre.
          </p>
        </div>
        <Button asChild>
          <Link href="/workspaces/new">Créer un espace de travail</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <WorkspaceCard
            key={workspace.id}
            workspace={workspace}
            isActive={workspace.id === activeWorkspace?.id}
          />
        ))}
      </div>
    </div>
  );
}
