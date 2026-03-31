"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

type ExportMode = "issues" | "epic+issues";
type ExportState = "idle" | "loading" | "success" | "error";

interface ExportResult {
  created: number;
  epicKey?: string;
  errors: string[];
  projectName: string;
  cloudUrl?: string;
}

interface JiraExportButtonProps {
  specId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function JiraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005zm5.723-5.756H5.757a5.218 5.218 0 0 0 5.233 5.214h2.13v2.058A5.215 5.215 0 0 0 18.297 18.3V6.762a1.005 1.005 0 0 0-1.003-1.005zm5.701-5.757H11.48a5.218 5.218 0 0 0 5.232 5.214h2.13V7.272A5.215 5.215 0 0 0 24 12.518V1.005A1.005 1.005 0 0 0 22.995 0z" />
    </svg>
  );
}

export function JiraExportButton({
  specId,
  open: controlledOpen,
  onOpenChange,
}: JiraExportButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [selectedProjectKey, setSelectedProjectKey] = useState<string>("");
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
  const [exportMode, setExportMode] = useState<ExportMode>("issues");

  const [exportState, setExportState] = useState<ExportState>("idle");
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [cloudUrl, setCloudUrl] = useState<string>("");

  useEffect(() => {
    if (open) {
      setExportState("idle");
      setExportResult(null);
      setSelectedProjectKey("");
      setSelectedProjectName("");
      setExportMode("issues");
      loadProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function loadProjects() {
    setLoadingProjects(true);
    setProjects([]);
    try {
      const res = await fetch("/api/integrations/jira/projects");
      if (res.ok) {
        const data: JiraProject[] = await res.json();
        setProjects(data);
      }
    } finally {
      setLoadingProjects(false);
    }
  }

  function handleProjectChange(key: string) {
    const project = projects.find((p) => p.key === key);
    setSelectedProjectKey(key);
    setSelectedProjectName(project?.name ?? "");
  }

  function handleOpen() {
    setOpen(true);
  }

  async function handleExport() {
    if (!selectedProjectKey) return;
    setExportState("loading");

    try {
      const res = await fetch("/api/integrations/jira/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specId,
          projectKey: selectedProjectKey,
          mode: exportMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setExportState("error");
        setExportResult({
          created: 0,
          errors: [data.detail ?? "Erreur inconnue"],
          projectName: selectedProjectName,
          cloudUrl,
        });
        return;
      }

      setExportState("success");
      setExportResult({
        created: data.created,
        epicKey: data.epicKey,
        errors: data.errors ?? [],
        projectName: selectedProjectName,
        cloudUrl,
      });
    } catch {
      setExportState("error");
      setExportResult({
        created: 0,
        errors: ["Erreur réseau."],
        projectName: selectedProjectName,
        cloudUrl,
      });
    }
  }

  // Fetch cloudUrl on open for building epic links
  useEffect(() => {
    if (!open) return;
    fetch("/api/integrations/jira/projects")
      .then(() => {
        // cloudUrl is fetched from integration status in the card
        // Here we use a lightweight approach: store it in state via a dedicated endpoint
        // For now, the epic link is built from the cloudUrl stored in the result
      })
      .catch(() => {});
  }, [open]);

  const epicJiraUrl =
    exportResult?.epicKey && exportResult.cloudUrl
      ? `${exportResult.cloudUrl}/browse/${exportResult.epicKey}`
      : null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <JiraIcon />
        Exporter vers Jira
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Exporter les user stories vers Jira</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Project selector */}
            {exportState === "idle" && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Projet Jira</p>
                {loadingProjects ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des projets…
                  </div>
                ) : (
                  <Select
                    value={selectedProjectKey}
                    onValueChange={handleProjectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un projet" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.key} value={p.key}>
                          [{p.key}] {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Export mode selector */}
            {exportState === "idle" && selectedProjectKey && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Mode d&apos;export</p>
                <RadioGroup
                  value={exportMode}
                  onValueChange={(v) => setExportMode(v as ExportMode)}
                  className="grid grid-cols-1 gap-3"
                >
                  {/* Issues simples */}
                  <Label
                    htmlFor="mode-issues"
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      exportMode === "issues"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <RadioGroupItem
                      value="issues"
                      id="mode-issues"
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium leading-none">
                        Issues simples
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chaque user story devient une Issue de type Story
                      </p>
                    </div>
                  </Label>

                  {/* Epic + Issues */}
                  <Label
                    htmlFor="mode-epic"
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      exportMode === "epic+issues"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <RadioGroupItem
                      value="epic+issues"
                      id="mode-epic"
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium leading-none">
                        Epic + Issues
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Une Epic est créée avec le titre de la spec, toutes les
                        Stories lui sont rattachées
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
            )}

            {/* Loading state */}
            {exportState === "loading" && (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm">Création des issues en cours…</p>
              </div>
            )}

            {/* Success state */}
            {exportState === "success" && exportResult && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    {exportResult.epicKey ? (
                      <p className="text-sm font-medium">
                        Epic{" "}
                        {epicJiraUrl ? (
                          <a
                            href={epicJiraUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 underline underline-offset-2"
                          >
                            {exportResult.epicKey}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="font-semibold">
                            {exportResult.epicKey}
                          </span>
                        )}{" "}
                        + {exportResult.created} issue
                        {exportResult.created > 1 ? "s" : ""} créée
                        {exportResult.created > 1 ? "s" : ""} dans{" "}
                        <span className="font-semibold">
                          {exportResult.projectName}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm font-medium">
                        {exportResult.created} issue
                        {exportResult.created > 1 ? "s" : ""} créée
                        {exportResult.created > 1 ? "s" : ""} dans{" "}
                        <span className="font-semibold">
                          {exportResult.projectName}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {exportResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="space-y-1">
                      <p className="font-medium">
                        {exportResult.errors.length} erreur
                        {exportResult.errors.length > 1 ? "s" : ""}
                      </p>
                      {exportResult.errors.map((e, i) => (
                        <p key={i} className="text-xs">
                          {e}
                        </p>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Error state */}
            {exportState === "error" && exportResult && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="space-y-1">
                  <p className="font-medium">Échec de l&apos;export</p>
                  {exportResult.errors.map((e, i) => (
                    <p key={i} className="text-xs">
                      {e}
                    </p>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            {exportState === "idle" && (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={!selectedProjectKey || loadingProjects}
                >
                  Exporter vers Jira
                </Button>
              </>
            )}
            {exportState === "loading" && (
              <Button disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Export en cours…
              </Button>
            )}
            {(exportState === "success" || exportState === "error") && (
              <Button onClick={() => setOpen(false)}>Fermer</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
