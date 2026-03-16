// src/components/teams/team-card.tsx
"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchActiveOrganization } from "@/actions/tenant";
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
import { ROLE_LABELS, PLAN_LABELS } from "@/types/teams";
import type { Role, Plan } from "@/types/teams";

type Props = {
  team: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    plan: string;
    _count: { members: number };
    members: { role: string }[];
  };
  isActive?: boolean;
};

export function TeamCard({ team, isActive }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const role = team.members[0]?.role as Role;

  function handleSwitch() {
    startTransition(async () => {
      await switchActiveOrganization(team.id);
      router.refresh();
    });
  }

  return (
    <Card className={isActive ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            {team.name}
            {isActive && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-primary">
                <Check className="h-3 w-3" /> Active
              </span>
            )}
          </CardTitle>
          <Badge variant="secondary">
            {PLAN_LABELS[team.plan as Plan] ?? team.plan}
          </Badge>
        </div>
        {team.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {team.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        {team._count.members} membre{team._count.members > 1 ? "s" : ""} ·{" "}
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
          <Link href={`/settings/teams/${team.id}`}>Gérer</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
