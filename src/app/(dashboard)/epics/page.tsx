import { redirect } from "next/navigation";
import { getActiveWorkspace } from "@/actions/tenant";
import { getEpics } from "@/actions/epics";
import { EpicList } from "@/components/epics/epic-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function EpicsPage() {
  const workspace = await getActiveWorkspace();

  if (!workspace) redirect("/onboarding");
  if (workspace.type !== "PRODUCT") redirect("/dashboard");

  const epics = await getEpics(workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Epics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Les grandes fonctionnalités de {workspace.name}.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/epics/new">
            <Plus className="h-4 w-4 mr-1" />
            Nouvelle epic
          </Link>
        </Button>
      </div>

      <EpicList epics={epics} />
    </div>
  );
}
