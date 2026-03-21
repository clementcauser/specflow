"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSpec } from "@/actions/specs";
import { SECTIONS_CONFIG } from "@/types/spec";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft } from "lucide-react";

type Props = {
  spec: {
    id: string;
    title: string;
    prompt?: string | null;
    content: Record<string, unknown> | null;
  };
};

export function EditSpecForm({ spec }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [title, setTitle] = useState(spec.title);
  const [prompt, setPrompt] = useState(spec.prompt ?? "");
  const [content, setContent] = useState<Record<string, unknown>>(
    spec.content || {}
  );

  const renderedSections = SECTIONS_CONFIG.filter(
    (s) => typeof content[s.key] === "string"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await updateSpec({
          specId: spec.id,
          title,
          prompt: prompt || undefined,
          content,
        });
        router.push(`/specs/${spec.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Paramètres du projet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du projet</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Description du besoin</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {renderedSections.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Contenu de la spec</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderedSections.map((s) => (
              <div key={s.key} className="space-y-2">
                <Label htmlFor={`section-${s.key}`}>{s.label}</Label>
                <Textarea
                  id={`section-${s.key}`}
                  value={(content[s.key] as string) || ""}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, [s.key]: e.target.value }))
                  }
                  rows={8}
                  className="font-mono text-sm leading-relaxed"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
