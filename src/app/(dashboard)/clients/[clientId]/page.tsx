import { redirect, notFound } from "next/navigation";
import { getActiveWorkspace } from "@/actions/tenant";
import { getClient } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Plus, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WORKSPACE_PRODUCT_TYPE_LABELS } from "@/types/workspaces";
import type { WorkspaceProductType } from "@/lib/enums";
import { WorkspaceType } from "@/lib/enums";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const workspace = await getActiveWorkspace();
  if (!workspace) redirect("/onboarding");
  if (workspace.type !== WorkspaceType.FREELANCE) redirect("/dashboard");

  let client;
  try {
    client = await getClient(clientId);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tous les clients
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {client.name[0]?.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-semibold">{client.name}</h1>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            Depuis {format(new Date(client.createdAt), "MMMM yyyy", { locale: fr })}
          </span>
        </div>
        {client.context && (
          <p className="text-sm text-muted-foreground leading-relaxed pl-13">
            {client.context}
          </p>
        )}
      </div>

      {/* Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Projets</h2>
          <Button asChild size="sm">
            <Link href={`/projects/new?clientId=${client.id}`}>
              <Plus className="h-4 w-4 mr-1" />
              Nouveau projet
            </Link>
          </Button>
        </div>

        {client.Project.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-muted/30">
            <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aucun projet pour ce client.</p>
            <Button asChild size="sm" className="mt-3">
              <Link href={`/projects/new?clientId=${client.id}`}>Créer le premier projet</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y rounded-lg border">
            {client.Project.map((project: Awaited<ReturnType<typeof getClient>>["Project"][number]) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {WORKSPACE_PRODUCT_TYPE_LABELS[project.productType as WorkspaceProductType] ?? project.productType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {project._count.Spec} spec{project._count.Spec !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
