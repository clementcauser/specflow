"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkspace } from "@/actions/workspaces";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plan } from "@/types/workspaces";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function CreateWorkspaceDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState("free");
  const [isPending, startTransition] = useTransition();

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(slugify(e.target.value));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createWorkspace({
          name: form.get("name") as string,
          slug: form.get("slug") as string,
          description: (form.get("description") as string) || undefined,
          plan: plan as Plan,
        });
        setOpen(false);
        router.refresh();
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Créer un espace de travail</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel espace de travail</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label htmlFor="name">Nom de l&apos;espace de travail</Label>
            <Input
              id="name"
              name="name"
              placeholder="Mon entreprise"
              required
              onChange={handleNameChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="slug">Identifiant unique (slug)</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="mon-entreprise"
              required
            />
            <p className="text-xs text-muted-foreground">
              Uniquement des lettres minuscules, chiffres et tirets.
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Décrivez votre espace de travail…"
              rows={2}
            />
          </div>
          <div className="space-y-1">
            <Label>Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
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
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Création…" : "Créer l'espace de travail"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
