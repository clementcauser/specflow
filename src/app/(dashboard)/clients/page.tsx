import { redirect } from "next/navigation";
import { getActiveWorkspace } from "@/actions/tenant";
import { WorkspaceType } from "@/lib/enums";
import { getClients } from "@/actions/clients";
import { ClientList } from "@/components/clients/client-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ClientsPage() {
  const workspace = await getActiveWorkspace();
  if (!workspace) redirect("/onboarding");
  if (workspace.type !== WorkspaceType.FREELANCE) redirect("/dashboard");

  const clients = await getClients(workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez vos clients et leurs projets.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/clients/new">
            <Plus className="h-4 w-4 mr-1" />
            Nouveau client
          </Link>
        </Button>
      </div>

      <ClientList clients={clients} />
    </div>
  );
}
