"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteSpec } from "@/actions/specs";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Spec {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  prompt?: string | null;
  Project?: { name: string; productType: string } | null;
  Epic?: { title: string } | null;
  creator: {
    name: string | null;
    image: string | null;
  };
}

interface SpecListProps {
  specs: Spec[];
}

export function SpecList({ specs }: SpecListProps) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Titre</TableHead>
            <TableHead>Contexte</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {specs.map((spec) => (
            <SpecRow key={spec.id} spec={spec} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SpecRow({ spec }: { spec: Spec }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer "${spec.title}" ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      await deleteSpec(spec.id);
      router.refresh();
    });
  }

  return (
    <TableRow className="group cursor-pointer" data-pending={isPending || undefined}>
      <TableCell className="py-4">
        <Link href={`/specs/${spec.id}`} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium text-foreground group-hover:underline">
              {spec.title}
            </div>
            <div className="text-xs text-muted-foreground">
              Par {spec.creator.name || "Utilisateur"}
            </div>
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {spec.Project?.name ?? spec.Epic?.title ?? "—"}
      </TableCell>
      <TableCell>
        <StatusBadge status={spec.status} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {format(new Date(spec.createdAt), "dd MMM yyyy")}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
              <span className="sr-only">Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/specs/${spec.id}`}>Voir les détails</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/specs/${spec.id}/edit`}>Modifier</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Suppression…" : "Supprimer"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status.toUpperCase()) {
    case "DONE":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"
        >
          Terminé
        </Badge>
      );
    case "GENERATING":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20"
        >
          Génération...
        </Badge>
      );
    case "ERROR":
      return <Badge variant="destructive">Erreur</Badge>;
    default:
      return (
        <Badge
          variant="secondary"
          className="bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20"
        >
          Brouillon
        </Badge>
      );
  }
}
