import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SECTIONS_CONFIG, type SpecSection } from "@/types/spec";

interface StepDescriptionProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  sections: SpecSection[];
  onSectionsChange: (sections: SpecSection[]) => void;
}

export function StepDescription({
  description,
  onDescriptionChange,
  sections,
  onSectionsChange,
}: StepDescriptionProps) {
  function toggleSection(key: SpecSection) {
    onSectionsChange(
      sections.includes(key)
        ? sections.filter((s) => s !== key)
        : [...sections, key],
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Description textarea */}
        <div className="space-y-2">
          <Label htmlFor="description">Description du besoin client</Label>
          <p className="text-xs text-muted-foreground">
            Décrivez librement le projet : contexte, objectifs, fonctionnalités
            souhaitées, contraintes… Plus vous êtes précis, meilleure sera la
            spec.
          </p>
          <Textarea
            id="description"
            placeholder="Notre client est une PME de 50 personnes qui vend des équipements sportifs. Ils souhaitent refondre leur site e-commerce actuel sous Prestashop pour migrer vers Shopify. Les enjeux principaux sont la migration des 2000 produits, l'intégration avec leur ERP SAP, et l'amélioration du tunnel de conversion..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={8}
            autoFocus
          />
          <p
            className={cn(
              "text-xs text-right",
              description.length < 20
                ? "text-muted-foreground"
                : "text-green-600",
            )}
          >
            {description.length} caractères
            {description.length < 20 && ` (minimum 20)`}
          </p>
        </div>

        {/* Section checkboxes */}
        <div className="space-y-3">
          <div>
            <Label>Sections à générer</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choisissez les sections à inclure dans votre spec.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {SECTIONS_CONFIG.map(({ key, label, alwaysOn }) => {
              const checked = alwaysOn || sections.includes(key);
              return (
                <label
                  key={key}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                    alwaysOn
                      ? "opacity-70 cursor-not-allowed bg-muted/30"
                      : checked
                        ? "border-primary/40 bg-primary/5 cursor-pointer"
                        : "border-border hover:border-primary/30 hover:bg-accent/40 cursor-pointer",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={alwaysOn}
                    onChange={() => !alwaysOn && toggleSection(key)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="text-sm font-medium">{label}</span>
                  {alwaysOn && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Toujours inclus
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
