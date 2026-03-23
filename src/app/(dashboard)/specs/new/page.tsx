import { getActiveWorkspace } from "@/actions/tenant";
import { getEpic } from "@/actions/epics";
import { getProject } from "@/actions/projects";
import { getWorkspacePlanInfo } from "@/actions/specs";
import { redirect } from "next/navigation";
import { NewSpecForm } from "@/components/specs/new-spec-form";
import { NewEpicSpecForm } from "@/components/specs/new-epic-spec-form";
import { NewProjectSpecForm } from "@/components/specs/new-project-spec-form";
import { PlanLimitBanner } from "@/components/plans/plan-limit-banner";
import { WorkspacePlan } from "@/lib/enums";

export default async function NewSpecPage({
  searchParams,
}: {
  searchParams: Promise<{ epicId?: string; projectId?: string }>;
}) {
  const { epicId, projectId } = await searchParams;
  const activeWorkspace = await getActiveWorkspace();
  if (!activeWorkspace) redirect("/onboarding");

  const planInfo = await getWorkspacePlanInfo(activeWorkspace.id);
  const isAtLimit = planInfo.isAtLimit;

  if (epicId) {
    let epic;
    try {
      epic = await getEpic(epicId);
    } catch {
      redirect("/epics");
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Nouvelle spec</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Décrivez ce que vous souhaitez spécifier pour cette epic.
          </p>
        </div>
        {planInfo.plan === WorkspacePlan.FREE && planInfo.limit !== null && (
          <PlanLimitBanner
            specsCount={planInfo.specsCount}
            limit={planInfo.limit}
          />
        )}
        {!isAtLimit && (
          <NewEpicSpecForm
            workspaceId={activeWorkspace.id}
            epicId={epicId}
            epicTitle={epic.title}
          />
        )}
      </div>
    );
  }

  if (projectId) {
    let project;
    try {
      project = await getProject(projectId);
    } catch {
      redirect("/clients");
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Nouvelle spec</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Décrivez ce que vous souhaitez spécifier pour ce projet.
          </p>
        </div>
        {planInfo.plan === WorkspacePlan.FREE && planInfo.limit !== null && (
          <PlanLimitBanner
            specsCount={planInfo.specsCount}
            limit={planInfo.limit}
          />
        )}
        {!isAtLimit && (
          <NewProjectSpecForm
            workspaceId={activeWorkspace.id}
            projectId={projectId}
            projectName={project.name}
            productType={project.productType}
            stack={project.stack}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouvelle spec</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Décrivez votre projet et obtenez une spec complète en quelques secondes.
        </p>
      </div>
      {planInfo.plan === WorkspacePlan.FREE && planInfo.limit !== null && (
        <PlanLimitBanner
          specsCount={planInfo.specsCount}
          limit={planInfo.limit}
        />
      )}
      {!isAtLimit && <NewSpecForm workspaceId={activeWorkspace.id} />}
    </div>
  );
}
