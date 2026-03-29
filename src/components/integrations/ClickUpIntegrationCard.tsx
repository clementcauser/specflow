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
import { disconnectClickUp, saveClickUpDefaults } from "@/actions/clickup";

interface ClickUpSpace {
  id: string;
  name: string;
}

interface ClickUpList {
  id: string;
  name: string;
}

interface ClickUpIntegrationCardProps {
  workspaceId: string;
  connected: boolean;
  clickupUserName?: string;
  clickupWorkspaceName?: string;
  defaultSpaceId?: string | null;
  defaultListId?: string | null;
  defaultListName?: string | null;
  connectedAt?: Date;
  canManage: boolean;
}

function ClickUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M2.286 16.188L5.01 13.8a7.973 7.973 0 0 0 6.99 4.17 7.973 7.973 0 0 0 6.99-4.17l2.724 2.388C19.48 19.2 15.95 21.4 12 21.4s-7.48-2.2-9.714-5.212zM12 2.6l6.04 5.447-1.857 2.059L12 6.4l-4.183 3.706-1.857-2.06L12 2.6z" />
    </svg>
  );
}

export function ClickUpIntegrationCard({
  workspaceId,
  connected,
  clickupUserName,
  clickupWorkspaceName,
  defaultSpaceId,
  defaultListId,
  defaultListName,
  connectedAt,
  canManage,
}: ClickUpIntegrationCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [disconnecting, setDisconnecting] = useState(false);

  const [spaces, setSpaces] = useState<ClickUpSpace[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [spacesLoaded, setSpacesLoaded] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(
    defaultSpaceId ?? ""
  );

  const [lists, setLists] = useState<ClickUpList[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>(
    defaultListId ?? ""
  );
  const [selectedListName, setSelectedListName] = useState<string>(
    defaultListName ?? ""
  );

  const [saving, setSaving] = useState(false);

  function handleConnect() {
    window.location.href = "/api/integrations/clickup/connect";
  }

  function handleDisconnect() {
    setDisconnecting(true);
    startTransition(async () => {
      try {
        await disconnectClickUp(workspaceId);
        router.refresh();
      } finally {
        setDisconnecting(false);
      }
    });
  }

  async function loadSpaces() {
    if (spacesLoaded) return;
    setLoadingSpaces(true);
    try {
      const res = await fetch("/api/integrations/clickup/spaces");
      if (res.ok) {
        const data: ClickUpSpace[] = await res.json();
        setSpaces(data);
        setSpacesLoaded(true);
        if (selectedSpaceId) {
          loadListsForSpace(selectedSpaceId);
        }
      }
    } finally {
      setLoadingSpaces(false);
    }
  }

  async function loadListsForSpace(spaceId: string) {
    setLoadingLists(true);
    setLists([]);
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

  function handleSpaceChange(spaceId: string) {
    setSelectedSpaceId(spaceId);
    setSelectedListId("");
    setSelectedListName("");
    loadListsForSpace(spaceId);
  }

  function handleListChange(listId: string) {
    const list = lists.find((l) => l.id === listId);
    setSelectedListId(listId);
    setSelectedListName(list?.name ?? "");
  }

  async function handleSave() {
    if (!selectedSpaceId || !selectedListId) return;
    setSaving(true);
    try {
      await saveClickUpDefaults(
        workspaceId,
        selectedSpaceId,
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
        <div className="w-9 h-9 rounded-lg border bg-white flex items-center justify-center shrink-0 text-[#7B68EE]">
          <ClickUpIcon />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">ClickUp</span>
            {connected && (
              <Badge
                variant="secondary"
                className="text-xs text-green-700 bg-green-100"
              >
                Connecté
              </Badge>
            )}
          </div>

          {connected && clickupUserName ? (
            <div className="space-y-1.5 mt-1">
              <p className="text-xs text-muted-foreground">
                Workspace :{" "}
                <span className="font-medium">{clickupWorkspaceName}</span>
                {" · "}
                Compte :{" "}
                <span className="font-medium">{clickupUserName}</span>
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
                  {/* Space selector */}
                  <Select
                    value={selectedSpaceId}
                    onValueChange={handleSpaceChange}
                    onOpenChange={(open) => open && loadSpaces()}
                  >
                    <SelectTrigger className="h-7 text-xs w-44">
                      <SelectValue
                        placeholder={
                          loadingSpaces ? "Chargement…" : "Space par défaut"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSpaces && (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {spaces.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* List selector (cascaded) */}
                  <Select
                    value={selectedListId}
                    onValueChange={handleListChange}
                    disabled={!selectedSpaceId || loadingLists}
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
                    disabled={saving || !selectedSpaceId || !selectedListId}
                  >
                    {saving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}

              {!canManage && (defaultListName) && (
                <p className="text-xs text-muted-foreground">
                  Liste : <span className="font-medium">{defaultListName}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Exportez vos user stories en tâches ClickUp.
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
              Connecter ClickUp
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
