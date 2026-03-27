"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Unplug, Plug, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { disconnectTrello, saveTrelloDefaults } from "@/actions/trello";

interface TrelloBoard {
  id: string;
  name: string;
}

interface TrelloList {
  id: string;
  name: string;
}

interface TrelloIntegrationCardProps {
  workspaceId: string;
  connected: boolean;
  username?: string;
  fullName?: string;
  defaultBoardId?: string | null;
  defaultBoardName?: string | null;
  defaultListId?: string | null;
  defaultListName?: string | null;
  connectedAt?: Date;
  canManage: boolean;
}

function TrelloIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" />
    </svg>
  );
}

export function TrelloIntegrationCard({
  workspaceId,
  connected,
  username,
  fullName,
  defaultBoardId,
  defaultBoardName,
  defaultListId,
  defaultListName,
  connectedAt,
  canManage,
}: TrelloIntegrationCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [disconnecting, setDisconnecting] = useState(false);

  const [boards, setBoards] = useState<TrelloBoard[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [boardsLoaded, setBoardsLoaded] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    defaultBoardId ?? ""
  );
  const [selectedBoardName, setSelectedBoardName] = useState<string>(
    defaultBoardName ?? ""
  );

  const [lists, setLists] = useState<TrelloList[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>(
    defaultListId ?? ""
  );
  const [selectedListName, setSelectedListName] = useState<string>(
    defaultListName ?? ""
  );

  const [saving, setSaving] = useState(false);

  function handleConnect() {
    window.location.href = "/api/integrations/trello/connect";
  }

  function handleDisconnect() {
    setDisconnecting(true);
    startTransition(async () => {
      try {
        await disconnectTrello(workspaceId);
        router.refresh();
      } finally {
        setDisconnecting(false);
      }
    });
  }

  async function loadBoards() {
    if (boardsLoaded) return;
    setLoadingBoards(true);
    try {
      const res = await fetch("/api/integrations/trello/boards");
      if (res.ok) {
        const data: TrelloBoard[] = await res.json();
        setBoards(data);
        setBoardsLoaded(true);
        // Auto-load lists if a board is already selected
        if (selectedBoardId) {
          loadListsForBoard(selectedBoardId);
        }
      }
    } finally {
      setLoadingBoards(false);
    }
  }

  async function loadListsForBoard(boardId: string) {
    setLoadingLists(true);
    setLists([]);
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

  function handleBoardChange(boardId: string) {
    const board = boards.find((b) => b.id === boardId);
    setSelectedBoardId(boardId);
    setSelectedBoardName(board?.name ?? "");
    setSelectedListId("");
    setSelectedListName("");
    loadListsForBoard(boardId);
  }

  function handleListChange(listId: string) {
    const list = lists.find((l) => l.id === listId);
    setSelectedListId(listId);
    setSelectedListName(list?.name ?? "");
  }

  async function handleSave() {
    if (!selectedBoardId || !selectedListId) return;
    setSaving(true);
    try {
      await saveTrelloDefaults(
        workspaceId,
        selectedBoardId,
        selectedBoardName,
        selectedListId,
        selectedListName
      );
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg border bg-white flex items-center justify-center shrink-0 text-[#0052CC]">
          <TrelloIcon />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Trello</span>
            {connected && (
              <Badge
                variant="secondary"
                className="text-xs text-green-700 bg-green-100"
              >
                Connecté
              </Badge>
            )}
          </div>

          {connected && username ? (
            <div className="space-y-1.5 mt-1">
              <p className="text-xs text-muted-foreground">
                Compte :{" "}
                <span className="font-medium">
                  {fullName} (@{username})
                </span>
                {connectedAt && (
                  <>
                    {" "}
                    · depuis le{" "}
                    {new Date(connectedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </>
                )}
              </p>

              {canManage && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Board selector */}
                  <Select
                    value={selectedBoardId}
                    onValueChange={handleBoardChange}
                    onOpenChange={(open) => open && loadBoards()}
                  >
                    <SelectTrigger className="h-7 text-xs w-44">
                      <SelectValue
                        placeholder={
                          loadingBoards ? "Chargement…" : "Board par défaut"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingBoards && (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {boards.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* List selector (cascaded) */}
                  <Select
                    value={selectedListId}
                    onValueChange={handleListChange}
                    disabled={!selectedBoardId || loadingLists}
                  >
                    <SelectTrigger className="h-7 text-xs w-40">
                      <SelectValue
                        placeholder={
                          loadingLists ? "Chargement…" : "Liste par défaut"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingLists && (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {lists.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Save button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={handleSave}
                    disabled={saving || !selectedBoardId || !selectedListId}
                  >
                    {saving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}

              {!canManage && (defaultBoardName || defaultListName) && (
                <p className="text-xs text-muted-foreground">
                  {defaultBoardName && (
                    <>
                      Board : <span className="font-medium">{defaultBoardName}</span>
                    </>
                  )}
                  {defaultBoardName && defaultListName && " · "}
                  {defaultListName && (
                    <>
                      Liste : <span className="font-medium">{defaultListName}</span>
                    </>
                  )}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Exportez vos user stories en cartes Trello.
            </p>
          )}
        </div>
      </div>

      {canManage && (
        <div className="shrink-0">
          {connected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={isPending || disconnecting}
            >
              {disconnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Unplug className="h-4 w-4 mr-2" />
              )}
              Déconnecter
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnect}>
              <Plug className="h-4 w-4 mr-2" />
              Connecter Trello
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
