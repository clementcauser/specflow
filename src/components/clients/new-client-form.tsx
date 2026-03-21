"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewClientForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [context, setContext] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const client = await createClient({ workspaceId, name, context: context || undefined });
        router.push(`/clients/${client.id}`);
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom du client</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex. Boutique Léa, Startup XYZ…"
          required
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="context">
          Contexte <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <Textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Secteur d'activité, besoins récurrents, tonalité attendue…"
          rows={3}
          maxLength={500}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending || name.trim().length === 0}>
          {isPending ? "Création…" : "Créer le client"}
        </Button>
      </div>
    </form>
  );
}
