"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEpic } from "@/actions/epics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const PRIORITIES = [
  { value: "MUST", label: "Must have", description: "Critique pour le lancement" },
  { value: "SHOULD", label: "Should have", description: "Important mais pas bloquant" },
  { value: "COULD", label: "Could have", description: "Utile si le temps le permet" },
  { value: "WONT", label: "Won't have", description: "Hors scope pour l'instant" },
] as const;

type Priority = (typeof PRIORITIES)[number]["value"];

export function NewEpicForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("SHOULD");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const epic = await createEpic({ workspaceId, title, description, priority });
        router.push(`/epics/${epic.id}`);
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Titre de l'epic</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex. Authentification utilisateur"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez l'objectif métier et les grandes lignes de cette epic…"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Priorité</Label>
        <div className="grid grid-cols-2 gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={cn(
                "text-left p-3 rounded-lg border text-sm transition-colors",
                priority === p.value
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30",
              )}
            >
              <p className="font-medium text-foreground">{p.label}</p>
              <p className="text-xs mt-0.5">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending || title.length < 2}>
          {isPending ? "Création…" : "Créer l'epic"}
        </Button>
      </div>
    </form>
  );
}
