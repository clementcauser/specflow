import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Users, Plus } from "lucide-react";

type Client = {
  id: string;
  name: string;
  context?: string | null;
  createdAt: Date;
  _count: { Project: number };
};

export function ClientList({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-muted/30">
        <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-sm font-medium mb-1">Aucun client</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ajoutez vos clients pour organiser vos projets et specs.
        </p>
        <Button asChild size="sm">
          <Link href="/clients/new">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter un client
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border">
      {clients.map((client) => (
        <Link
          key={client.id}
          href={`/clients/${client.id}`}
          className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-primary">
              {client.name[0]?.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{client.name}</p>
            {client.context && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{client.context}</p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs text-muted-foreground">
              {client._count.Project} projet{client._count.Project !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(client.createdAt), "d MMM yyyy", { locale: fr })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
