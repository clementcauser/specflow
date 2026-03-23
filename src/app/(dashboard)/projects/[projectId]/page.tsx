import { redirect, notFound } from "next/navigation";
import { getActiveWorkspace } from "@/actions/tenant";
import { getProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpecList } from "@/components/specs/spec-list";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { WORKSPACE_PRODUCT_TYPE_LABELS } from "@/types/workspaces";
import type { WorkspaceProductType } from "@prisma/client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const workspace = await getActiveWorkspace();
  if (!workspace) redirect("/onboarding");
  if (workspace.type !== "FREELANCE") redirect("/dashboard");

  let project;
  try {
    project = await getProject(projectId);
  } catch {
    notFound();
  }

  const backHref = project.Client
    ? `/clients/${project.Client.id}`
    : "/clients";

  return (
    <div className="space-y-8 max-w-3xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {project.Client ? project.Client.name : "Clients"}
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold leading-tight">{project.name}</h1>
          <Badge variant="secondary" className="shrink-0">
            {WORKSPACE_PRODUCT_TYPE_LABELS[project.productType as WorkspaceProductType] ?? project.productType}
          </Badge>
        </div>

        {project.stack && (
          <p className="text-xs text-muted-foreground">
            Stack : <span className="font-medium text-foreground">{project.stack}</span>
          </p>
        )}

        {project.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Specs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Specs</h2>
          <Button asChild size="sm">
            <Link href={`/specs/new?projectId=${project.id}`}>
              <Plus className="h-4 w-4 mr-1" />
              Créer une spec
            </Link>
          </Button>
        </div>

        <SpecList specs={project.Spec} />
      </div>
    </div>
  );
}
