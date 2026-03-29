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
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ClickUpSpace {
  id: string;
  name: string;
}

interface ClickUpList {
  id: string;
  name: string;
}

interface ClickUpExportButtonProps {
  specId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type ExportState = "idle" | "loading" | "success" | "error";

function ClickUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M2.286 16.188L5.01 13.8a7.973 7.973 0 0 0 6.99 4.17 7.973 7.973 0 0 0 6.99-4.17l2.724 2.388C19.48 19.2 15.95 21.4 12 21.4s-7.48-2.2-9.714-5.212zM12 2.6l6.04 5.447-1.857 2.059L12 6.4l-4.183 3.706-1.857-2.06L12 2.6z" />
    </svg>
  );
}

export function ClickUpExportButton({ specId, open: controlledOpen, onOpenChange }: ClickUpExportButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const [spaces, setSpaces] = useState<ClickUpSpace[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);

  const [lists, setLists] = useState<ClickUpList[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [selectedListName, setSelectedListName] = useState<string>("");

  const [exportState, setExportState] = useState<ExportState>("idle");
  const [exportResult, setExportResult] = useState<{
    created: number;
    errors: string[];
    listName: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setExportState("idle");
      setExportResult(null);
      loadSpaces();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function loadSpaces() {
    setLoadingSpaces(true);
    setSpaces([]);
    setLists([]);
    setSelectedSpaceId("");
    setSelectedListId("");
    try {
      const res = await fetch("/api/integrations/clickup/spaces");
      if (res.ok) {
        const data: ClickUpSpace[] = await res.json();
        setSpaces(data);
      }
    } finally {
      setLoadingSpaces(false);
    }
  }

  async function loadLists(spaceId: string) {
    setLoadingLists(true);
    setLists([]);
    setSelectedListId("");
    try {
      const res = await fetch(
        `/api/integrations/clickup/lists?spaceId=${spaceId}`
      );
      if (res.ok) {
        const data: ClickUpList[] = await res.json();
        setLists(data);
      }
    } finally {
      setLoadingLists(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    setExportState("idle");
    setExportResult(null);
    loadSpaces();
  }

  function handleSpaceChange(spaceId: string) {
    setSelectedSpaceId(spaceId);
    loadLists(spaceId);
  }

  function handleListChange(listId: string) {
    const list = lists.find((l) => l.id === listId);
    setSelectedListId(listId);
    setSelectedListName(list?.name ?? "");
  }

  async function handleExport() {
    if (!selectedListId) return;
    setExportState("loading");

    try {
      const res = await fetch("/api/integrations/clickup/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specId, listId: selectedListId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setExportState("error");
        setExportResult({
          created: 0,
          errors: [data.detail ?? "Erreur inconnue"],
          listName: selectedListName,
        });
        return;
      }

      setExportState("success");
      setExportResult({
        created: data.created,
        errors: data.errors ?? [],
        listName: selectedListName,
      });
    } catch {
      setExportState("error");
      setExportResult({
        created: 0,
        errors: ["Erreur réseau."],
        listName: selectedListName,
      });
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <ClickUpIcon />
        Exporter en ClickUp
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporter les user stories vers ClickUp</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Space selector */}
            {exportState === "idle" && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Space ClickUp</p>
                {loadingSpaces ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des spaces…
                  </div>
                ) : (
                  <Select
                    value={selectedSpaceId}
                    onValueChange={handleSpaceChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un space" />
                    </SelectTrigger>
                    <SelectContent>
                      {spaces.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* List selector */}
            {exportState === "idle" && selectedSpaceId && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Liste de destination</p>
                {loadingLists ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des listes…
                  </div>
                ) : (
                  <Select
                    value={selectedListId}
                    onValueChange={handleListChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une liste" />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
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
                <p className="text-sm">Création des tâches en cours…</p>
              </div>
            )}

            {/* Success state */}
            {exportState === "success" && exportResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    {exportResult.created} tâche
                    {exportResult.created > 1 ? "s" : ""} créée
                    {exportResult.created > 1 ? "s" : ""} dans{" "}
                    <span className="font-semibold">{exportResult.listName}</span>
                  </p>
                </div>
                {exportResult.errors.length > 0 && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1">
                    <p className="text-xs font-medium text-destructive">
                      {exportResult.errors.length} erreur
                      {exportResult.errors.length > 1 ? "s" : ""}
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
                  disabled={
                    !selectedSpaceId ||
                    !selectedListId ||
                    loadingSpaces ||
                    loadingLists
                  }
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
