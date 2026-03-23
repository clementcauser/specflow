"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSpec } from "@/actions/specs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { WORKSPACE_PRODUCT_TYPE_LABELS } from "@/types/workspaces";
import { WorkspaceProductType } from "@/types/workspaces";

type Props = {
  workspaceId: string;
  projectId: string;
  projectName: string;
  productType: WorkspaceProductType;
  stack?: string | null;
};

export function NewProjectSpecForm({ workspaceId, projectId, projectName, productType, stack }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const spec = await createSpec({
          title,
          prompt: description,
          workspaceId,
          projectId,
          sections: [],
        });
        router.push(`/specs/${spec.id}/generate`);
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
        <p className="text-muted-foreground">
          Projet : <span className="font-medium text-foreground">{projectName}</span>
        </p>
        <p className="text-muted-foreground">
          Type : <span className="font-medium text-foreground">
            {WORKSPACE_PRODUCT_TYPE_LABELS[productType] ?? productType}
          </span>
        </p>
        {stack && (
          <p className="text-muted-foreground">
            Stack : <span className="font-medium text-foreground">{stack}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Titre de la spec</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex. Formulaire de commande avec paiement Stripe"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description du besoin</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez ce que vous souhaitez spécifier pour ce projet…"
          rows={5}
          required
          minLength={20}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending || title.length < 2 || description.length < 20}>
          <Sparkles className="h-4 w-4 mr-2" />
          {isPending ? "Création…" : "Générer la spec"}
        </Button>
      </div>
    </form>
  );
}
