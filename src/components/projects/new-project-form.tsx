"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/actions/projects";
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
import { WORKSPACE_PRODUCT_TYPE_LABELS } from "@/types/workspaces";
import { WorkspaceProductType } from "@prisma/client";

type Props = {
  workspaceId: string;
  clientId: string;
  clientName: string;
};

export function NewProjectForm({ workspaceId, clientId, clientName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState<WorkspaceProductType | "">("");
  const [stack, setStack] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productType) return;
    setError("");
    startTransition(async () => {
      try {
        const project = await createProject({
          workspaceId,
          clientId,
          clientName,
          name,
          description: description || undefined,
          productType,
          stack: stack || undefined,
        });
        router.push(`/projects/${project.id}`);
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        Client : <span className="font-medium text-foreground">{clientName}</span>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nom du projet</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex. Refonte site vitrine, App mobile v2…"
          required
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Type de projet</Label>
        <Select value={productType} onValueChange={(v) => setProductType(v as WorkspaceProductType)}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un type…" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(WORKSPACE_PRODUCT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="stack">
          Stack technique <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <Input
          id="stack"
          value={stack}
          onChange={(e) => setStack(e.target.value)}
          placeholder="ex. React, Node.js, PostgreSQL…"
          maxLength={200}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contexte du projet, contraintes particulières…"
          rows={3}
          maxLength={500}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending || !name.trim() || !productType}>
          {isPending ? "Création…" : "Créer le projet"}
        </Button>
      </div>
    </form>
  );
}
