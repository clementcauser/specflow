"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useLeaveConfirmation } from "@/hooks/use-leave-confirmation";
import { createSpec } from "@/actions/specs";
import { type SpecSection } from "@/types/spec";
import { StepProjectType } from "./step-project-type";
import { StepStack } from "./step-stack";
import { StepDescription } from "./step-description";

type Step = 1 | 2 | 3;

type FormData = {
  title: string;
  projectType: string;
  customProjectType: string;
  stack: string[];
  description: string;
  sections: SpecSection[];
};

const STEPS = [
  { step: 1, label: "Type de projet" },
  { step: 2, label: "Stack technique" },
  { step: 3, label: "Description" },
];

export function NewSpecForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormData>({
    title: "",
    projectType: "",
    customProjectType: "",
    stack: [],
    description: "",
    sections: [],
  });

  const isDirty =
    form.title !== "" ||
    form.projectType !== "" ||
    form.stack.length > 0 ||
    form.description !== "";

  useLeaveConfirmation(isDirty && !isPending);

  function canProceed() {
    if (step === 1) {
      if (form.title.length < 2 || form.projectType === "") return false;
      if (form.projectType === "autre" && form.customProjectType.trim() === "") return false;
      return true;
    }
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
          projectType: form.projectType === "autre" ? form.customProjectType.trim() : form.projectType,
          stack: form.stack.join(", "),
          description: form.description,
          workspaceId,
          sections: form.sections,
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

      {/* Steps */}
      {step === 1 && (
        <StepProjectType
          title={form.title}
          projectType={form.projectType}
          customProjectType={form.customProjectType}
          onTitleChange={(v) => setForm((f) => ({ ...f, title: v }))}
          onProjectTypeChange={(v) => setForm((f) => ({ ...f, projectType: v }))}
          onCustomProjectTypeChange={(v) => setForm((f) => ({ ...f, customProjectType: v }))}
          onEnter={() => {
            if (canProceed()) setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <StepStack stack={form.stack} onToggle={toggleStack} />
      )}
      {step === 3 && (
        <StepDescription
          description={form.description}
          onDescriptionChange={(v) => setForm((f) => ({ ...f, description: v }))}
          sections={form.sections}
          onSectionsChange={(v) => setForm((f) => ({ ...f, sections: v }))}
        />
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
