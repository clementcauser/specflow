import { redirect, notFound } from "next/navigation";
import { getActiveWorkspace } from "@/actions/tenant";
import { getEpic } from "@/actions/epics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpecList } from "@/components/specs/spec-list";
import { EpicStatusSelect } from "@/components/epics/epic-status-select";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

const PRIORITY_LABELS: Record<string, string> = {
  MUST: "Must have",
  SHOULD: "Should have",
  COULD: "Could have",
  WONT: "Won't have",
};

const PRIORITY_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  MUST: "default",
  SHOULD: "secondary",
  COULD: "outline",
  WONT: "outline",
};

export default async function EpicDetailPage({
  params,
}: {
  params: Promise<{ epicId: string }>;
}) {
  const { epicId } = await params;
  const workspace = await getActiveWorkspace();

  if (!workspace) redirect("/onboarding");
  if (workspace.type !== "PRODUCT") redirect("/dashboard");

  let epic;
  try {
    epic = await getEpic(epicId);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Back */}
      <Link
        href="/epics"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Toutes les epics
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold leading-tight">{epic.title}</h1>
          <EpicStatusSelect epicId={epic.id} currentStatus={epic.status} />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={PRIORITY_VARIANTS[epic.priority]}>
            {PRIORITY_LABELS[epic.priority] ?? epic.priority}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {epic.Spec.length} spec{epic.Spec.length !== 1 ? "s" : ""}
          </span>
        </div>

        {epic.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {epic.description}
          </p>
        )}
      </div>

      {/* Specs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Specs</h2>
          <Button asChild size="sm">
            <Link href={`/specs/new?epicId=${epic.id}`}>
              <Plus className="h-4 w-4 mr-1" />
              Créer une spec
            </Link>
          </Button>
        </div>

        <SpecList specs={epic.Spec} />
      </div>
    </div>
  );
}
