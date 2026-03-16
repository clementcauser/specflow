"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTeam } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plan } from "@/types/teams";

type Props = {
  team: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    plan: string;
  };
  canEdit: boolean;
};

export function TeamSettingsForm({ team, canEdit }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [plan, setPlan] = useState(team.plan);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateTeam(team.id, {
          name: form.get("name") as string,
          slug: form.get("slug") as string,
          description: (form.get("description") as string) || undefined,
          plan: plan as Plan,
        });
        setSuccess(true);
        router.refresh();
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Informations de l&apos;équipe
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              defaultValue={team.name}
              disabled={!canEdit}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={team.slug}
              disabled={!canEdit}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={team.description ?? ""}
              disabled={!canEdit}
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label>Plan</Label>
            <Select value={plan} onValueChange={setPlan} disabled={!canEdit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Entreprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">
              Modifications enregistrées.
            </p>
          )}
        </CardContent>
        {canEdit && (
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
