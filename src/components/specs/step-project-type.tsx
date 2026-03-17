import { PROJECT_TYPES } from "@/types/spec";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface StepProjectTypeProps {
  title: string;
  projectType: string;
  customProjectType: string;
  onTitleChange: (value: string) => void;
  onProjectTypeChange: (value: string) => void;
  onCustomProjectTypeChange: (value: string) => void;
  onEnter: () => void;
}

export function StepProjectType({
  title,
  projectType,
  customProjectType,
  onTitleChange,
  onProjectTypeChange,
  onCustomProjectTypeChange,
  onEnter,
}: StepProjectTypeProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-1">
          <Label htmlFor="title">Titre du projet</Label>
          <Input
            id="title"
            placeholder="Refonte e-commerce Acme"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
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
                onClick={() => onProjectTypeChange(value)}
                className={cn(
                  "px-3 py-2.5 rounded-lg border text-sm text-left transition-colors",
                  projectType === value
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border hover:border-primary/40 hover:bg-accent/50",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {projectType === "autre" && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-1">
              <Input
                placeholder="Précisez le type de projet..."
                value={customProjectType}
                onChange={(e) => onCustomProjectTypeChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onEnter();
                  }
                }}
                className="w-full"
                autoFocus
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
