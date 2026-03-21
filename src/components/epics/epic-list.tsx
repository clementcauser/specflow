import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Layers, Plus } from "lucide-react";

const PRIORITY_LABELS: Record<string, string> = {
  MUST: "Must have",
  SHOULD: "Should have",
  COULD: "Could have",
  WONT: "Won't have",
};

const PRIORITY_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  MUST: "default",
  SHOULD: "secondary",
  COULD: "outline",
  WONT: "outline",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Ouverte",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  ARCHIVED: "Archivée",
};

type Epic = {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  createdAt: Date;
  _count: { Spec: number };
};

type Props = {
  epics: Epic[];
};

export function EpicList({ epics }: Props) {
  if (epics.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-muted/30">
        <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-sm font-medium mb-1">Aucune epic</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Les epics représentent les grandes fonctionnalités de votre produit.
        </p>
        <Button asChild size="sm">
          <Link href="/epics/new">
            <Plus className="h-4 w-4 mr-1" />
            Créer votre première epic
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border">
      {epics.map((epic) => (
        <Link
          key={epic.id}
          href={`/epics/${epic.id}`}
          className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{epic.title}</p>
            {epic.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{epic.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={PRIORITY_VARIANTS[epic.priority]} className="text-xs">
              {PRIORITY_LABELS[epic.priority] ?? epic.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {STATUS_LABELS[epic.status] ?? epic.status}
            </Badge>
            <span className="text-xs text-muted-foreground w-14 text-right">
              {epic._count.Spec} spec{epic._count.Spec !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-muted-foreground w-20 text-right">
              {format(new Date(epic.createdAt), "d MMM yyyy", { locale: fr })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
