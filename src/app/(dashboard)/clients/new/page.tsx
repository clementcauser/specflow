import { redirect } from "next/navigation";
import { getActiveWorkspace } from "@/actions/tenant";
import { NewClientForm } from "@/components/clients/new-client-form";

export default async function NewClientPage() {
  const workspace = await getActiveWorkspace();
  if (!workspace) redirect("/onboarding");
  if (workspace.type !== "FREELANCE") redirect("/dashboard");

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouveau client</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ajoutez un client pour organiser ses projets et specs.
        </p>
      </div>
      <NewClientForm workspaceId={workspace.id} />
    </div>
  );
}
