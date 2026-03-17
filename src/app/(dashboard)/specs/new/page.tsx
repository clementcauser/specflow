import { getActiveWorkspace } from "@/actions/tenant";
import { redirect } from "next/navigation";
import { NewSpecForm } from "@/components/specs/new-spec-form";

export default async function NewSpecPage() {
  const activeWorkspace = await getActiveWorkspace();
  if (!activeWorkspace) redirect("/onboarding");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouvelle spec</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Décrivez votre projet et obtenez une spec complète en quelques
          secondes.
        </p>
      </div>
      <NewSpecForm workspaceId={activeWorkspace.id} />
    </div>
  );
}
