"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  SECTIONS_CONFIG,
  SECTIONS_ORDER,
  SECTION_LABELS,
  type SpecSection,
  type SpecContent,
} from "@/types/spec";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Circle,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type Props = {
  spec: {
    id: string;
    title: string;
    status: string;
    content: Record<string, unknown> | null;
  };
};

type SectionState = "pending" | "generating" | "done" | "error";

type SseEvent =
  | { type: "section_start"; section: SpecSection }
  | { type: "token"; section: SpecSection; token: string }
  | { type: "section_done"; section: SpecSection; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

const LOADING_MESSAGES = [
  "SpecFlow analyse votre demande…",
  "Rédaction des user stories en cours…",
  "On s'occupe de tout, ça arrive bientôt…",
  "Chaque section est rédigée avec soin…",
  "Votre spec prend forme…",
];

export function SpecGenerator({ spec }: Props) {
  const router = useRouter();

  const storedSections = Array.isArray(spec.content?.["_sections"])
    ? (spec.content["_sections"] as SpecSection[])
    : null;
  const activeSections: SpecSection[] = storedSections
    ? SECTIONS_CONFIG.filter(
        (s) => s.alwaysOn || storedSections.includes(s.key),
      ).map((s) => s.key)
    : SECTIONS_ORDER;

  const [sectionStates, setSectionStates] = useState<
    Record<SpecSection, SectionState>
  >(
    Object.fromEntries(activeSections.map((s) => [s, "pending"])) as Record<
      SpecSection,
      SectionState
    >,
  );
  const [, setContent] = useState<SpecContent>({});
  const [globalStatus, setGlobalStatus] = useState<
    "idle" | "generating" | "done" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (globalStatus !== "generating") return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [globalStatus]);

  const startGeneration = useCallback(async () => {
    setGlobalStatus("generating");

    try {
      const response = await fetch("/api/specs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specId: spec.id }),
      });

      if (!response.ok) throw new Error("Erreur serveur");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as SseEvent;
            handleEvent(event);
          } catch {}
        }
      }
    } catch {
      setGlobalStatus("error");
      setError("La génération a échoué. Veuillez réessayer.");
    }
  }, [spec.id]);

  useEffect(() => {
    startGeneration();
  }, [startGeneration]);

  function handleEvent(event: SseEvent) {
    switch (event.type) {
      case "section_start":
        setSectionStates((prev) => ({
          ...prev,
          [event.section]: "generating",
        }));
        break;

      case "token":
        setContent((prev) => ({
          ...prev,
          [event.section]:
            (prev[event.section as SpecSection] ?? "") + event.token,
        }));
        break;

      case "section_done":
        setSectionStates((prev) => ({ ...prev, [event.section]: "done" }));
        setContent((prev) => ({ ...prev, [event.section]: event.content }));
        break;

      case "done":
        setGlobalStatus("done");
        break;

      case "error":
        setGlobalStatus("error");
        setError(event.message);
        break;
    }
  }

  const sectionIcon = (section: SpecSection) => {
    const state = sectionStates[section];
    if (state === "done")
      return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
    if (state === "generating")
      return <Loader2 className="h-4 w-4 text-primary shrink-0 animate-spin" />;
    return <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {globalStatus === "generating" && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          {globalStatus === "done" && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {globalStatus === "error" && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <h1 className="text-xl font-semibold">{spec.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {globalStatus === "done" && "Spec générée avec succès."}
          {globalStatus === "error" && error}
        </p>
      </div>

      {/* Pastilles de progression */}
      <div className="flex gap-3 flex-wrap">
        {activeSections.map((section) => (
          <div
            key={section}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors",
              sectionStates[section] === "done"
                ? "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400"
                : sectionStates[section] === "generating"
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-border text-muted-foreground",
            )}
          >
            {sectionIcon(section)}
            {SECTION_LABELS[section]}
          </div>
        ))}
      </div>

      {/* Loader central */}
      {globalStatus === "generating" && (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-base font-medium text-foreground transition-all duration-500">
              {LOADING_MESSAGES[messageIndex]}
            </p>
            <p className="text-sm text-muted-foreground">
              Cette opération peut prendre quelques secondes.
            </p>
          </div>
        </div>
      )}

      {/* CTA final */}
      {globalStatus === "done" && (
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => router.push("/specs")}>
            Retour aux specs
          </Button>
          <Button onClick={() => router.push(`/specs/${spec.id}`)}>
            Voir la spec complète
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {globalStatus === "error" && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={startGeneration}>
            Réessayer
          </Button>
        </div>
      )}
    </div>
  );
}
