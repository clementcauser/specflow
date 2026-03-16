import { getActiveOrganization } from "@/actions/tenant";
import { redirect } from "next/navigation";
import { NewSpecForm } from "@/components/specs/new-spec-form";

export default async function NewSpecPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) redirect("/onboarding");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouvelle spec</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Décrivez votre projet et obtenez une spec complète en quelques
          secondes.
        </p>
      </div>
      <NewSpecForm organizationId={activeOrg.id} />
    </div>
  );
}
