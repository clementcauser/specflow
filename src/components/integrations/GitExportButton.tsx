"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, GitBranch, CheckCircle2, XCircle } from "lucide-react";

interface GitRepo {
  id: number;
  full_name: string;
  name: string;
  owner: string;
}

interface ConnectedProvider {
  provider: "GITHUB" | "GITLAB";
  accountName: string;
  defaultRepoOwner?: string | null;
  defaultRepoName?: string | null;
}

interface GitExportButtonProps {
  specId: string;
  connectedProviders: ConnectedProvider[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type ExportState = "idle" | "loading" | "success" | "error";

export function GitExportButton({ specId, connectedProviders, open: controlledOpen, onOpenChange }: GitExportButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
  const [selectedProvider, setSelectedProvider] = useState<"GITHUB" | "GITLAB">(
    connectedProviders[0]?.provider ?? "GITHUB"
  );
  const [repos, setRepos] = useState<GitRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitRepo | null>(null);
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [exportResult, setExportResult] = useState<{
    created: number;
    errors: string[];
    repoLabel: string;
  } | null>(null);

  if (connectedProviders.length === 0) return null;

  async function loadRepos(provider: "GITHUB" | "GITLAB") {
    setLoadingRepos(true);
    setRepos([]);
    setSelectedRepo(null);
    try {
      const res = await fetch(`/api/integrations/git/repos?provider=${provider}`);
      if (res.ok) {
        const data: GitRepo[] = await res.json();
        setRepos(data);

        // Pre-select default repo if configured
        const prov = connectedProviders.find((p) => p.provider === provider);
        if (prov?.defaultRepoOwner && prov?.defaultRepoName) {
          const defaultRepo = data.find(
            (r) =>
              r.owner === prov.defaultRepoOwner && r.name === prov.defaultRepoName
          );
          if (defaultRepo) setSelectedRepo(defaultRepo);
        }
      }
    } finally {
      setLoadingRepos(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    setExportState("idle");
    setExportResult(null);
    loadRepos(selectedProvider);
  }

  function handleProviderChange(provider: "GITHUB" | "GITLAB") {
    setSelectedProvider(provider);
    loadRepos(provider);
  }

  async function handleExport() {
    if (!selectedRepo) return;
    setExportState("loading");

    try {
      const body: Record<string, unknown> = {
        specId,
        provider: selectedProvider,
        owner: selectedRepo.owner,
        repo: selectedRepo.name,
      };

      // GitLab requires numeric project id
      if (selectedProvider === "GITLAB") {
        body.repoId = selectedRepo.id;
      }

      const res = await fetch("/api/integrations/git/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setExportState("error");
        setExportResult({ created: 0, errors: [data.detail ?? "Erreur inconnue"], repoLabel: selectedRepo.full_name });
        return;
      }

      setExportState("success");
      setExportResult({
        created: data.created,
        errors: data.errors ?? [],
        repoLabel: selectedRepo.full_name,
      });
    } catch {
      setExportState("error");
      setExportResult({ created: 0, errors: ["Erreur réseau."], repoLabel: selectedRepo?.full_name ?? "" });
    }
  }

  const providerLabel = selectedProvider === "GITHUB" ? "GitHub" : "GitLab";

  return (
    <>
      {controlledOpen === undefined && (
        <Button variant="outline" size="sm" onClick={handleOpen}>
          <GitBranch className="h-4 w-4 mr-2" />
          Exporter en issues
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporter les user stories en issues</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Provider selector (only shown if both connected) */}
            {connectedProviders.length > 1 && exportState === "idle" && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Plateforme</p>
                <div className="flex gap-2">
                  {connectedProviders.map((p) => (
                    <Button
                      key={p.provider}
                      variant={selectedProvider === p.provider ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleProviderChange(p.provider)}
                    >
                      {p.provider === "GITHUB" ? "GitHub" : "GitLab"}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Repo selector */}
            {exportState === "idle" && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Dépôt {providerLabel}</p>
                {loadingRepos ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des dépôts…
                  </div>
                ) : (
                  <Select
                    value={selectedRepo?.full_name ?? ""}
                    onValueChange={(val) => {
                      const repo = repos.find((r) => r.full_name === val);
                      setSelectedRepo(repo ?? null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un dépôt" />
                    </SelectTrigger>
                    <SelectContent>
                      {repos.map((r) => (
                        <SelectItem key={r.id} value={r.full_name}>
                          {r.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    {exportResult.created} issue{exportResult.created > 1 ? "s" : ""} créée{exportResult.created > 1 ? "s" : ""} sur{" "}
                    <span className="font-semibold">{exportResult.repoLabel}</span>
                  </p>
                </div>
                {exportResult.errors.length > 0 && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1">
                    <p className="text-xs font-medium text-destructive">
                      {exportResult.errors.length} erreur{exportResult.errors.length > 1 ? "s" : ""}
                    </p>
                    {exportResult.errors.map((e, i) => (
                      <p key={i} className="text-xs text-destructive/80">
                        {e}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Error state */}
            {exportState === "error" && exportResult && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1">
                <div className="flex items-center gap-2 text-destructive mb-1">
                  <XCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">Échec de l&apos;export</p>
                </div>
                {exportResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-destructive/80">
                    {e}
                  </p>
                ))}
              </div>
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
                  disabled={!selectedRepo || loadingRepos}
                >
                  Exporter les stories
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
