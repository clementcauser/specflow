"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PROJECT_TYPES, STACK_OPTIONS } from "@/types/spec";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useLeaveConfirmation } from "@/hooks/use-leave-confirmation";
import { createSpec } from "@/actions/specs";

type Step = 1 | 2 | 3;

type FormData = {
  title: string;
  projectType: string;
  stack: string[];
  description: string;
};

const STEPS = [
  { step: 1, label: "Type de projet" },
  { step: 2, label: "Stack technique" },
  { step: 3, label: "Description" },
];

export function NewSpecForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormData>({
    title: "",
    projectType: "",
    stack: [],
    description: "",
  });

  const isDirty =
    form.title !== "" ||
    form.projectType !== "" ||
    form.stack.length > 0 ||
    form.description !== "";

  // Confirmation avant de quitter
  useLeaveConfirmation(isDirty && !isPending);

  function canProceed() {
// ...
    if (step === 1) return form.title.length >= 2 && form.projectType !== "";
    if (step === 2) return form.stack.length > 0;
    if (step === 3) return form.description.length >= 20;
    return false;
  }

  function toggleStack(value: string) {
    setForm((f) => ({
      ...f,
      stack: f.stack.includes(value)
        ? f.stack.filter((s) => s !== value)
        : [...f.stack, value],
    }));
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      try {
        const spec = await createSpec({
          title: form.title,
          projectType: form.projectType,
          stack: form.stack.join(", "),
          description: form.description,
          organizationId,
        });
        router.push(`/specs/${spec.id}/generate`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map(({ step: s, label }) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors",
                step === s
                  ? "bg-primary text-primary-foreground"
                  : step > s
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {step > s ? "✓" : s}
            </div>
            <span
              className={cn(
                "text-sm hidden sm:block",
                step === s ? "font-medium" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {s < 3 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      {/* Étape 1 — Type de projet */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-1">
              <Label htmlFor="title">Titre du projet</Label>
              <Input
                id="title"
                placeholder="Refonte e-commerce Acme"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Type de projet</Label>
              <div className="grid grid-cols-2 gap-2">
                {PROJECT_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, projectType: value }))
                    }
                    className={cn(
                      "px-3 py-2.5 rounded-lg border text-sm text-left transition-colors",
                      form.projectType === value
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border hover:border-primary/40 hover:bg-accent/50",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 2 — Stack */}
      {step === 2 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Stack technique</Label>
              <p className="text-xs text-muted-foreground">
                Sélectionnez une ou plusieurs technologies.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {STACK_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleStack(value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-sm transition-colors",
                      form.stack.includes(value)
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {form.stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                <span className="text-xs text-muted-foreground self-center">
                  Sélection :
                </span>
                {form.stack.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {STACK_OPTIONS.find((o) => o.value === s)?.label ?? s}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Étape 3 — Description */}
      {step === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description du besoin client</Label>
              <p className="text-xs text-muted-foreground">
                Décrivez librement le projet : contexte, objectifs,
                fonctionnalités souhaitées, contraintes… Plus vous êtes précis,
                meilleure sera la spec.
              </p>
              <Textarea
                id="description"
                placeholder="Notre client est une PME de 50 personnes qui vend des équipements sportifs. Ils souhaitent refondre leur site e-commerce actuel sous Prestashop pour migrer vers Shopify. Les enjeux principaux sont la migration des 2000 produits, l'intégration avec leur ERP SAP, et l'amélioration du tunnel de conversion..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={8}
                autoFocus
              />
              <p
                className={cn(
                  "text-xs text-right",
                  form.description.length < 20
                    ? "text-muted-foreground"
                    : "text-green-600",
                )}
              >
                {form.description.length} caractères
                {form.description.length < 20 && ` (minimum 20)`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() =>
            step > 1 ? setStep((s) => (s - 1) as Step) : router.back()
          }
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 1 ? "Annuler" : "Retour"}
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={!canProceed()}
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed() || isPending}>
            <Sparkles className="h-4 w-4 mr-2" />
            {isPending ? "Création…" : "Générer la spec"}
          </Button>
        )}
      </div>
    </div>
  );
}
