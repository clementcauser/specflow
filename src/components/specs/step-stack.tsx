import { useState, useRef, type KeyboardEvent } from "react";
import { STACK_OPTIONS } from "@/types/spec";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface StepStackProps {
  stack: string[];
  onToggle: (value: string) => void;
}

export function StepStack({ stack, onToggle }: StepStackProps) {
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAddCustomTag() {
    const tag = customTagInput.trim();
    if (!tag) return;

    const tagLower = tag.toLowerCase();
    const allTags = [...STACK_OPTIONS.map((o) => o.value), ...customTags];

    if (allTags.some((t) => t.toLowerCase() === tagLower)) {
      // Just select the existing one if not already selected
      const existing = allTags.find((t) => t.toLowerCase() === tagLower) ?? tag;
      if (!stack.includes(existing)) onToggle(existing);
      setCustomTagInput("");
      return;
    }

    setCustomTags((prev) => [...prev, tag]);
    onToggle(tag); // auto-select the new tag
    setCustomTagInput("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomTag();
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Stack technique</Label>
          <p className="text-xs text-muted-foreground">
            Sélectionnez une ou plusieurs technologies, ou ajoutez les vôtres.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {STACK_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onToggle(value)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-sm transition-colors",
                  stack.includes(value)
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/40",
                )}
              >
                {label}
              </button>
            ))}
            {customTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onToggle(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-sm transition-colors",
                  stack.includes(tag)
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/40",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Custom tag input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Ajouter une technologie…"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomTag}
            disabled={!customTagInput.trim()}
            className="shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Ajouter
          </Button>
        </div>

        {stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t">
            <span className="text-xs text-muted-foreground self-center">
              Sélection :
            </span>
            {stack.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {STACK_OPTIONS.find((o) => o.value === s)?.label ?? s}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
