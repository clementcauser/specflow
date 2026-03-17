"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  SECTIONS_CONFIG,
  SECTIONS_ORDER,
  SECTION_LABELS,
  type SpecSection,
  type SpecContent,
} from "@/types/spec";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {
  CheckCircle,
  Circle,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

type Props = {
  spec: {
    id: string;
    title: string;
    projectType: string;
    stack: string;
    description: string;
    status: string;
    content: Record<string, unknown> | null;
  };
};

type SectionState = "pending" | "generating" | "done" | "error";

export function SpecGenerator({ spec }: Props) {
  const router = useRouter();

  // Derive active sections from stored _sections; fallback to all
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
  const [content, setContent] = useState<SpecContent>({});
  const [activeSection, setActiveSection] = useState<SpecSection | null>(null);
  const [globalStatus, setGlobalStatus] = useState<
    "idle" | "generating" | "done" | "error"
  >("idle");
  const [error, setError] = useState("");
  const activeSectionRef = useRef<HTMLDivElement>(null);

  // Scroll vers la section active
  useEffect(() => {
    if (activeSectionRef.current) {
      activeSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeSection]);

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
            const event = JSON.parse(line.slice(6));
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleEvent(event: any) {
    switch (event.type) {
      case "section_start":
        setActiveSection(event.section);
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
        setActiveSection(null);
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
          {globalStatus === "generating" && "Génération en cours…"}
          {globalStatus === "done" && "Spec générée avec succès."}
          {globalStatus === "error" && error}
        </p>
      </div>

      {/* Progression */}
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

      {/* Sections */}
      <div className="space-y-4">
        {activeSections.map((section) => {
          const state = sectionStates[section];
          const sectionContent = content[section];
          const isActive = activeSection === section;

          if (state === "pending") return null;

          return (
            <div key={section} ref={isActive ? activeSectionRef : null}>
              <Card
                className={cn(
                  "transition-all",
                  isActive && "border-primary/50 shadow-sm",
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {sectionIcon(section)}
                    {SECTION_LABELS[section]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sectionContent ? (
                    <div
                      className={cn(
                        "prose prose-sm dark:prose-invert max-w-none",
                        isActive &&
                          "after:content-['▋'] after:animate-pulse after:text-primary",
                      )}
                    >
                      <ReactMarkdown>{sectionContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Génération…
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

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
