import { redirect } from "next/navigation";
import { getActiveWorkspace } from "@/actions/tenant";
import { WorkspaceType } from "@/lib/enums";
import { NewEpicForm } from "@/components/epics/new-epic-form";

export default async function NewEpicPage() {
  const workspace = await getActiveWorkspace();

  if (!workspace) redirect("/onboarding");
  if (workspace.type !== WorkspaceType.PRODUCT) redirect("/dashboard");

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouvelle epic</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Définissez une fonctionnalité majeure de votre produit.
        </p>
      </div>
      <NewEpicForm workspaceId={workspace.id} />
    </div>
  );
}
