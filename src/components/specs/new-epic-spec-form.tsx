"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSpec } from "@/actions/specs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles } from "lucide-react";
import { SECTIONS_CONFIG, type SpecSection } from "@/types/spec";

type Props = {
  workspaceId: string;
  epicId: string;
  epicTitle: string;
};

const OPTIONAL_SECTIONS = SECTIONS_CONFIG.filter((s) => !s.alwaysOn);

export function NewEpicSpecForm({ workspaceId, epicId, epicTitle }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSections, setSelectedSections] = useState<SpecSection[]>([
    "userStories",
    "acceptance",
  ]);

  function toggleSection(key: SpecSection) {
    setSelectedSections((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const spec = await createSpec({
          title,
          prompt: description,
          workspaceId,
          epicId,
          sections: selectedSections,
        });
        router.push(`/specs/${spec.id}/generate`);
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        Epic : <span className="font-medium text-foreground">{epicTitle}</span>
      </div>

      {step === 1 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="title">Titre de la spec</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Flux d'inscription avec email + Google"
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
              placeholder="Décrivez précisément ce que vous souhaitez spécifier pour cette feature. La stack et le contexte produit seront automatiquement pris en compte depuis votre workspace."
              rows={5}
              required
              minLength={20}
            />
            <p className="text-xs text-muted-foreground">
              La stack technique et le contexte produit sont automatiquement inclus depuis votre workspace.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={title.length < 2 || description.length < 20}
            >
              Suivant
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="space-y-3">
            <Label>Sections à générer</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Le résumé exécutif est toujours inclus. Choisissez les sections supplémentaires.
            </p>

            <div className="space-y-2">
              {OPTIONAL_SECTIONS.map((section) => (
                <div key={section.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={section.key}
                    checked={selectedSections.includes(section.key)}
                    onChange={() => toggleSection(section.key)}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <Label htmlFor={section.key} className="font-normal cursor-pointer">
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button type="submit" disabled={isPending}>
              <Sparkles className="h-4 w-4 mr-2" />
              {isPending ? "Création…" : "Générer la spec"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
