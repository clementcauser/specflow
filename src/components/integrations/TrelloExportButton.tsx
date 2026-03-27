"use client";

import { useState } from "react";
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

interface TrelloBoard {
  id: string;
  name: string;
}

interface TrelloList {
  id: string;
  name: string;
}

interface TrelloExportButtonProps {
  specId: string;
}

type ExportState = "idle" | "loading" | "success" | "error";

function TrelloIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" />
    </svg>
  );
}

export function TrelloExportButton({ specId }: TrelloExportButtonProps) {
  const [open, setOpen] = useState(false);

  const [boards, setBoards] = useState<TrelloBoard[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);

  const [lists, setLists] = useState<TrelloList[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedBoardName, setSelectedBoardName] = useState<string>("");
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [selectedListName, setSelectedListName] = useState<string>("");

  const [exportState, setExportState] = useState<ExportState>("idle");
  const [exportResult, setExportResult] = useState<{
    created: number;
    errors: string[];
    listName: string;
    boardName: string;
  } | null>(null);

  async function loadBoards() {
    setLoadingBoards(true);
    setBoards([]);
    setLists([]);
    setSelectedBoardId("");
    setSelectedListId("");
    try {
      const res = await fetch("/api/integrations/trello/boards");
      if (res.ok) {
        const data: TrelloBoard[] = await res.json();
        setBoards(data);
      }
    } finally {
      setLoadingBoards(false);
    }
  }

  async function loadLists(boardId: string) {
    setLoadingLists(true);
    setLists([]);
    setSelectedListId("");
    try {
      const res = await fetch(
        `/api/integrations/trello/lists?boardId=${boardId}`
      );
      if (res.ok) {
        const data: TrelloList[] = await res.json();
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
    loadBoards();
  }

  function handleBoardChange(boardId: string) {
    const board = boards.find((b) => b.id === boardId);
    setSelectedBoardId(boardId);
    setSelectedBoardName(board?.name ?? "");
    loadLists(boardId);
  }

  function handleListChange(listId: string) {
    const list = lists.find((l) => l.id === listId);
    setSelectedListId(listId);
    setSelectedListName(list?.name ?? "");
  }

  async function handleExport() {
    if (!selectedBoardId || !selectedListId) return;
    setExportState("loading");

    try {
      const res = await fetch("/api/integrations/trello/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specId, boardId: selectedBoardId, listId: selectedListId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setExportState("error");
        setExportResult({
          created: 0,
          errors: [data.detail ?? "Erreur inconnue"],
          listName: selectedListName,
          boardName: selectedBoardName,
        });
        return;
      }

      setExportState("success");
      setExportResult({
        created: data.created,
        errors: data.errors ?? [],
        listName: selectedListName,
        boardName: selectedBoardName,
      });
    } catch {
      setExportState("error");
      setExportResult({
        created: 0,
        errors: ["Erreur réseau."],
        listName: selectedListName,
        boardName: selectedBoardName,
      });
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <TrelloIcon />
        Exporter en Trello
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporter les user stories vers Trello</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Board selector */}
            {exportState === "idle" && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Board Trello</p>
                {loadingBoards ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des boards…
                  </div>
                ) : (
                  <Select value={selectedBoardId} onValueChange={handleBoardChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* List selector */}
            {exportState === "idle" && selectedBoardId && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Liste de destination</p>
                {loadingLists ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des listes…
                  </div>
                ) : (
                  <Select value={selectedListId} onValueChange={handleListChange}>
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
                <p className="text-sm">Création des cartes en cours…</p>
              </div>
            )}

            {/* Success state */}
            {exportState === "success" && exportResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    {exportResult.created} carte
                    {exportResult.created > 1 ? "s" : ""} créée
                    {exportResult.created > 1 ? "s" : ""} dans{" "}
                    <span className="font-semibold">{exportResult.listName}</span>{" "}
                    sur{" "}
                    <span className="font-semibold">{exportResult.boardName}</span>
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
                  disabled={!selectedBoardId || !selectedListId || loadingBoards || loadingLists}
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
