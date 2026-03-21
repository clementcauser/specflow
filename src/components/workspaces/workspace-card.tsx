// src/components/workspaces/workspace-card.tsx
"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchActiveWorkspace } from "@/actions/tenant";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ROLE_LABELS, PLAN_LABELS } from "@/types/workspaces";
import type { Role, Plan } from "@/types/workspaces";

type Props = {
  workspace: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    _count: { members: number };
    members: { role: string }[];
  };
  isActive?: boolean;
};

export function WorkspaceCard({ workspace, isActive }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const role = workspace.members[0]?.role as Role;

  function handleSwitch() {
    startTransition(async () => {
      await switchActiveWorkspace(workspace.id);
      router.refresh();
    });
  }

  return (
    <Card className={isActive ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            {workspace.name}
            {isActive && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-primary">
                <Check className="h-3 w-3" /> Actif
              </span>
            )}
          </CardTitle>
          <Badge variant="secondary">
            {PLAN_LABELS[workspace.plan as Plan] ?? workspace.plan}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        {workspace._count.members} membre{workspace._count.members > 1 ? "s" : ""} ·{" "}
        <span className="text-foreground font-medium">{ROLE_LABELS[role]}</span>
      </CardContent>

      <CardFooter className="gap-2">
        {!isActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitch}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? "…" : "Activer"}
          </Button>
        )}
        <Button
          asChild
          variant={isActive ? "outline" : "ghost"}
          size="sm"
          className="flex-1"
        >
          <Link href={`/settings/workspaces/${workspace.id}`}>Gérer</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
