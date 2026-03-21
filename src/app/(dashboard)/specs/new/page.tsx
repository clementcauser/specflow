import { getActiveWorkspace } from "@/actions/tenant";
import { getEpic } from "@/actions/epics";
import { redirect } from "next/navigation";
import { NewSpecForm } from "@/components/specs/new-spec-form";
import { NewEpicSpecForm } from "@/components/specs/new-epic-spec-form";

export default async function NewSpecPage({
  searchParams,
}: {
  searchParams: Promise<{ epicId?: string }>;
}) {
  const { epicId } = await searchParams;
  const activeWorkspace = await getActiveWorkspace();
  if (!activeWorkspace) redirect("/onboarding");

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
        <NewEpicSpecForm
          workspaceId={activeWorkspace.id}
          epicId={epicId}
          epicTitle={epic.title}
        />
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
      <NewSpecForm workspaceId={activeWorkspace.id} />
    </div>
  );
}
