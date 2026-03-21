import { redirect, notFound } from "next/navigation";
import { getActiveWorkspace } from "@/actions/tenant";
import { getClient } from "@/actions/clients";
import { NewProjectForm } from "@/components/projects/new-project-form";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const workspace = await getActiveWorkspace();
  if (!workspace) redirect("/onboarding");
  if (workspace.type !== "FREELANCE") redirect("/dashboard");

  if (!clientId) redirect("/clients");

  let client;
  try {
    client = await getClient(clientId);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouveau projet</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Créez un projet pour organiser les specs de ce client.
        </p>
      </div>
      <NewProjectForm
        workspaceId={workspace.id}
        clientId={client.id}
        clientName={client.name}
      />
    </div>
  );
}
