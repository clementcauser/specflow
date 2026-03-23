"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkspace } from "@/actions/workspaces";
import { switchActiveWorkspace } from "@/actions/tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { WorkspaceType } from "@prisma/client";

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const PROFILES = [
  { value: "FREELANCE", label: "Freelance / indépendant" },
  { value: "AGENCY", label: "Agence web / digitale" },
  { value: "STARTUP", label: "Startup / éditeur SaaS" },
  { value: "INTERNAL", label: "Équipe interne / DSI" },
];

const PRODUCTS = [
  { value: "LANDING_PAGE", label: "Sites vitrines / institutionnels" },
  { value: "ECOMMERCE", label: "E-commerce" },
  { value: "SAAS", label: "SaaS / application web" },
  { value: "MOBILE", label: "Application mobile" },
  { value: "API", label: "API / back-end" },
];

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleNameChange(val: string) {
    setName(val);
    setSlug(slugify(val));
  }

  function toggleProduct(value: string) {
    setSpecialties((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    );
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      try {
        const workspace = await createWorkspace({
          name,
          slug,
          plan: "FREE",
          type: workspaceType ?? "AGENCY",
          specialties: [],
        });
        await switchActiveWorkspace(workspace.id);
        router.push("/dashboard");
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      }
    });
  }

  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "Espace" },
    { n: 2, label: "Profil" },
    { n: 3, label: "Produits" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Bienvenue sur SpecFlow</h1>
          <p className="text-muted-foreground text-sm">
            Créez votre premier espace de travail.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center w-full">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="flex items-center"
              style={{ flex: i < steps.length - 1 ? "1" : "none" }}
            >
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                    step > s.n && "bg-green-100 text-green-700",
                    step === s.n && "bg-blue-100 text-blue-700",
                    step < s.n &&
                      "bg-muted text-muted-foreground border border-border",
                  )}
                >
                  {step > s.n ? <Check className="w-3 h-3" /> : s.n}
                </div>
                <span
                  className={cn(
                    "text-xs",
                    step === s.n
                      ? "font-medium text-blue-700"
                      : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-border mx-3" />
              )}
            </div>
          ))}
        </div>

        <Card>
          {/* Étape 1 — Nom du workspace */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-base">Nommez votre espace</CardTitle>
                <CardDescription>
                  Un espace regroupe vos projets et membres. Vous pourrez en
                  créer d&apos;autres plus tard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Nom de l&apos;espace</Label>
                  <Input
                    id="name"
                    placeholder="Mon agence"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slug">Identifiant unique</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="mon-agence"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Lettres minuscules, chiffres et tirets uniquement.
                  </p>
                </div>
                <Button
                  className="w-full"
                  disabled={!name.trim() || !slug.trim()}
                  onClick={() => setStep(2)}
                >
                  Continuer
                </Button>
              </CardContent>
            </>
          )}

          {/* Étape 2 — Profil métier */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-base">Votre profil</CardTitle>
                <CardDescription>
                  Cela personnalise les specs générées pour votre contexte.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {PROFILES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setWorkspaceType(p.value as WorkspaceType)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
                        workspaceType === p.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-border hover:border-border/80 hover:bg-muted/50",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Retour
                  </Button>
                  <Button
                    className="flex-2"
                    disabled={!workspaceType}
                    onClick={() => setStep(3)}
                  >
                    Continuer
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Étape 3 — Type de produit */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-base">Type de produit</CardTitle>
                <CardDescription>Plusieurs choix possibles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {PRODUCTS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => toggleProduct(p.value)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
                        specialties.includes(p.value)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-border hover:border-border/80 hover:bg-muted/50",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    Retour
                  </Button>
                  <Button
                    className="flex-2"
                    type="submit"
                    disabled={isPending}
                    onClick={handleSubmit}
                  >
                    {isPending ? "Création…" : "Créer et continuer"}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
