"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  WorkspaceType,
  WorkspaceTeamSize,
  WorkspaceProductStage,
  WorkspaceProductType,
} from "@/types/workspaces";
import { createWorkspace } from "@/actions/workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  WORKSPACE_TEAM_SIZE_LABELS,
  WORKSPACE_PRODUCT_STAGE_LABELS,
  WORKSPACE_PRODUCT_TYPE_LABELS,
} from "@/types/workspaces";

// ─── Helpers ──────────────────────────────────────────────────────────────

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ─── Step indicator ───────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full flex-1 transition-colors",
            i < current ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

// ─── Step 1 — Type selection ──────────────────────────────────────────────

const WORKSPACE_TYPES = [
  {
    type: WorkspaceType.AGENCY,
    emoji: "🏢",
    label: "Agence",
    tagline: "Je crée des specs pour des projets clients distincts",
    bullets: [
      "Stack définie par projet",
      "Export PDF client-ready",
      "Brief client à chaque spec",
    ],
  },
  {
    type: WorkspaceType.PRODUCT,
    emoji: "🚀",
    label: "Produit",
    tagline: "Je travaille sur un produit en évolution continue",
    bullets: [
      "Stack définie une fois au workspace",
      "Epics & features, pas des projets",
      "Contexte produit persistant",
    ],
  },
  {
    type: WorkspaceType.FREELANCE,
    emoji: "⚡",
    label: "Freelance",
    tagline: "Je gère plusieurs clients en parallèle",
    bullets: [
      "Un espace par client",
      "Templates personnels réutilisables",
      "Vue multi-client en un coup d'œil",
    ],
  },
];

function StepType({
  selected,
  onSelect,
}: {
  selected: WorkspaceType | null;
  onSelect: (t: WorkspaceType) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Quel type de workspace ?</h1>
        <p className="text-muted-foreground mt-1">
          Choisissez la situation qui vous correspond le mieux.
        </p>
      </div>
      <div className="grid gap-3">
        {WORKSPACE_TYPES.map(({ type, emoji, label, tagline, bullets }) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={cn(
              "text-left rounded-xl border p-5 transition-all",
              "hover:border-primary hover:bg-muted/40",
              selected === type
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border",
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{emoji}</span>
              <span className="font-semibold text-base">{label}</span>
            </div>
            <p className="text-sm text-muted-foreground italic mb-3">
              &ldquo;{tagline}&rdquo;
            </p>
            <ul className="space-y-1">
              {bullets.map((b) => (
                <li
                  key={b}
                  className="text-sm text-muted-foreground flex gap-2"
                >
                  <span className="text-primary">→</span>
                  {b}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2 — Workspace info ──────────────────────────────────────────────

const TEAM_SIZES = Object.values(WorkspaceTeamSize);

function StepInfo({
  type,
  name,
  slug,
  teamSize,
  onNameChange,
  onSlugChange,
  onTeamSizeChange,
}: {
  type: WorkspaceType;
  name: string;
  slug: string;
  teamSize: WorkspaceTeamSize | null;
  onNameChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onTeamSizeChange: (v: WorkspaceTeamSize) => void;
}) {
  const nameLabel =
    type === WorkspaceType.AGENCY
      ? "Nom de l'agence"
      : type === WorkspaceType.PRODUCT
        ? "Nom du produit"
        : "Ton nom ou marque";

  const namePlaceholder =
    type === WorkspaceType.AGENCY
      ? "Agence Dupont"
      : type === WorkspaceType.PRODUCT
        ? "MonSaaS"
        : "Thomas Roux Dev";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Informations du workspace</h1>
        <p className="text-muted-foreground mt-1">
          Quelques informations de base pour configurer votre espace.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{nameLabel}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={namePlaceholder}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Identifiant unique (slug)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => onSlugChange(slugify(e.target.value))}
            placeholder="mon-workspace"
            required
          />
          <p className="text-xs text-muted-foreground">
            Uniquement des lettres minuscules, chiffres et tirets.
          </p>
        </div>

        {type === WorkspaceType.AGENCY && (
          <div className="space-y-2">
            <Label>Taille de l&apos;équipe</Label>
            <div className="flex gap-2 flex-wrap">
              {TEAM_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onTeamSizeChange(size)}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm transition-colors",
                    teamSize === size
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border hover:border-primary",
                  )}
                >
                  {WORKSPACE_TEAM_SIZE_LABELS[size]}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Sert à calibrer les templates par défaut.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 3 — Business context ────────────────────────────────────────────

const SPECIALTIES = Object.values(WorkspaceProductType);
const PRODUCT_STAGES = Object.values(WorkspaceProductStage);

function StepContext({
  type,
  specialties,
  tagline,
  productDescription,
  techStack,
  productStage,
  onSpecialtiesChange,
  onTaglineChange,
  onProductDescriptionChange,
  onTechStackChange,
  onProductStageChange,
}: {
  type: WorkspaceType;
  specialties: WorkspaceProductType[];
  tagline: string;
  productDescription: string;
  techStack: string;
  productStage: WorkspaceProductStage | null;
  onSpecialtiesChange: (v: WorkspaceProductType[]) => void;
  onTaglineChange: (v: string) => void;
  onProductDescriptionChange: (v: string) => void;
  onTechStackChange: (v: string) => void;
  onProductStageChange: (v: WorkspaceProductStage) => void;
}) {
  function toggleSpecialty(s: WorkspaceProductType) {
    onSpecialtiesChange(
      specialties.includes(s)
        ? specialties.filter((x) => x !== s)
        : [...specialties, s],
    );
  }

  if (type === WorkspaceType.AGENCY) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Spécialités de l&apos;agence
          </h1>
          <p className="text-muted-foreground mt-1">
            Quels types de projets traitez-vous le plus souvent ? Ces choix
            pré-rempliront vos templates de génération.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialty(s)}
              className={cn(
                "text-left px-4 py-3 rounded-lg border text-sm transition-colors",
                specialties.includes(s)
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-border hover:border-primary",
              )}
            >
              {WORKSPACE_PRODUCT_TYPE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (type === WorkspaceType.PRODUCT) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Contexte produit</h1>
          <p className="text-muted-foreground mt-1">
            Ce contexte sera injecté dans tous vos prompts de génération.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tagline">
              Tagline{" "}
              <span className="text-muted-foreground font-normal">
                (optionnel)
              </span>
            </Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => onTaglineChange(e.target.value)}
              placeholder="L'outil qui fait X pour Y"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="productDescription">Description du produit</Label>
            <Textarea
              id="productDescription"
              value={productDescription}
              onChange={(e) => onProductDescriptionChange(e.target.value)}
              placeholder="Ex : SpecFlow est un générateur de specs techniques pour agences web. Les utilisateurs sont des chefs de projet et des leads dev."
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="techStack">Stack technique</Label>
            <Input
              id="techStack"
              value={techStack}
              onChange={(e) => onTechStackChange(e.target.value)}
              placeholder="Ex : Next.js 14, PostgreSQL, API Claude, Vercel"
            />
          </div>

          <div className="space-y-2">
            <Label>Stade du produit</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCT_STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => onProductStageChange(stage)}
                  className={cn(
                    "text-left px-4 py-3 rounded-lg border text-sm transition-colors",
                    productStage === stage
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border hover:border-primary",
                  )}
                >
                  {WORKSPACE_PRODUCT_STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FREELANCE
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Premier client</h1>
        <p className="text-muted-foreground mt-1">
          Votre workspace est prêt. Vous pourrez configurer vos clients après la
          création.
        </p>
      </div>
      <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
        Les clients se configurent depuis votre workspace, après création.
      </div>
    </div>
  );
}

// ─── Main flow ────────────────────────────────────────────────────────────

export function CreateWorkspaceFlow() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // Step 1
  const [type, setType] = useState<WorkspaceType | null>(null);

  // Step 2
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [teamSize, setTeamSize] = useState<WorkspaceTeamSize | null>(null);

  // Step 3
  const [specialties, setSpecialties] = useState<WorkspaceProductType[]>([]);
  const [tagline, setTagline] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [productStage, setProductStage] =
    useState<WorkspaceProductStage | null>(null);

  function handleNameChange(v: string) {
    setName(v);
    setSlug(slugify(v));
  }

  function canProceed() {
    if (step === 1) return type !== null;
    if (step === 2) return name.trim().length >= 2 && slug.length >= 2;
    return true;
  }

  function handleNext() {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  function handleSubmit() {
    if (!type) return;
    setError("");

    startTransition(async () => {
      try {
        await createWorkspace({
          name,
          slug,
          type,
          plan: "FREE",
          teamSize: teamSize ?? undefined,
          specialties,
          tagline: tagline || undefined,
          productDescription: productDescription || undefined,
          techStack: techStack || undefined,
          productStage: productStage ?? undefined,
        });
        router.push(
          type === WorkspaceType.PRODUCT
            ? `/epics/new`
            : type === WorkspaceType.FREELANCE
              ? `/clients/new`
              : `/workspaces`,
        );
        router.refresh();
      } catch (err: unknown) {
        setError((err as Error).message);
        setStep(2);
      }
    });
  }

  const submitLabel =
    type === WorkspaceType.AGENCY
      ? "Créer et aller aux projets"
      : type === WorkspaceType.PRODUCT
        ? "Créer et aller aux epics"
        : "Créer et ajouter un client";

  return (
    <div>
      <StepIndicator current={step} total={3} />

      {step === 1 && (
        <StepType
          selected={type}
          onSelect={(t) => {
            setType(t);
            setStep(2);
          }}
        />
      )}

      {step === 2 && type && (
        <StepInfo
          type={type}
          name={name}
          slug={slug}
          teamSize={teamSize}
          onNameChange={handleNameChange}
          onSlugChange={setSlug}
          onTeamSizeChange={setTeamSize}
        />
      )}

      {step === 3 && type && (
        <StepContext
          type={type}
          specialties={specialties}
          tagline={tagline}
          productDescription={productDescription}
          techStack={techStack}
          productStage={productStage}
          onSpecialtiesChange={setSpecialties}
          onTaglineChange={setTagline}
          onProductDescriptionChange={setProductDescription}
          onTechStackChange={setTechStack}
          onProductStageChange={setProductStage}
        />
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {step > 1 && (
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={isPending}
          >
            Retour
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed() || isPending}
          >
            {isPending ? "Création…" : step < 3 ? "Continuer" : submitLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
