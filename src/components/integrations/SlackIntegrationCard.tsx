"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Unplug, Plug } from "lucide-react";
import { disconnectSlack, saveSlackChannel } from "@/actions/slack";
import { useRouter } from "next/navigation";

interface SlackChannel {
  id: string;
  name: string;
}

interface SlackIntegrationCardProps {
  workspaceId: string;
  connected: boolean;
  teamSlackName?: string | null;
  defaultChannelId?: string | null;
  defaultChannelName?: string | null;
  connectedAt?: Date;
  canManage: boolean;
}

export function SlackIntegrationCard({
  workspaceId,
  connected,
  teamSlackName,
  defaultChannelId,
  defaultChannelName,
  canManage,
}: SlackIntegrationCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState(defaultChannelId ?? "");
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [channelError, setChannelError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!connected || !canManage) return;

    setLoadingChannels(true);
    setChannelError(null);

    fetch("/api/integrations/slack/channels")
      .then((r) => r.json())
      .then((data) => {
        if (data.channels) {
          setChannels(data.channels);
        } else if (data.error === "slack_unauthorized") {
          setChannelError("Token Slack révoqué. Reconnectez l'intégration.");
        } else {
          setChannelError("Impossible de charger les canaux Slack.");
        }
      })
      .catch(() => setChannelError("Impossible de charger les canaux Slack."))
      .finally(() => setLoadingChannels(false));
  }, [connected, canManage]);

  function handleConnect() {
    window.location.href = "/api/integrations/slack/connect";
  }

  function handleDisconnect() {
    setDisconnecting(true);
    startTransition(async () => {
      try {
        await disconnectSlack(workspaceId);
        router.refresh();
      } catch {
        setSaveError("Impossible de déconnecter Slack.");
        setDisconnecting(false);
      }
    });
  }

  function handleSave() {
    const channel = channels.find((c) => c.id === selectedChannelId);
    if (!channel) return;

    setSaving(true);
    setSaveError(null);
    setSaved(false);

    startTransition(async () => {
      try {
        await saveSlackChannel(workspaceId, channel.id, channel.name);
        setSaved(true);
        router.refresh();
      } catch {
        setSaveError("Impossible de sauvegarder le canal.");
      } finally {
        setSaving(false);
      }
    });
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 flex-1">
        {/* Slack logo */}
        <div className="w-9 h-9 rounded-lg border bg-white flex items-center justify-center shrink-0 mt-0.5">
          <svg viewBox="0 0 54 54" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386"
              fill="#36C5F0"
            />
            <path
              d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387"
              fill="#2EB67D"
            />
            <path
              d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386"
              fill="#ECB22E"
            />
            <path
              d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336-.001v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.386"
              fill="#E01E5A"
            />
          </svg>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Slack</span>
            {connected && (
              <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                Connecté
              </Badge>
            )}
          </div>

          {connected && teamSlackName ? (
            <>
              <p className="text-xs text-muted-foreground">
                Workspace : <span className="font-medium">{teamSlackName}</span>
              </p>
              {canManage && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={selectedChannelId}
                    onValueChange={setSelectedChannelId}
                    disabled={loadingChannels || !!channelError}
                  >
                    <SelectTrigger className="h-8 text-xs w-52">
                      <SelectValue
                        placeholder={
                          loadingChannels
                            ? "Chargement des canaux…"
                            : channelError
                            ? "Erreur de chargement"
                            : defaultChannelName
                            ? `#${defaultChannelName}`
                            : "Choisir un canal"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          #{ch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSave}
                    disabled={saving || isPending || !selectedChannelId || loadingChannels}
                    className="h-8 text-xs"
                  >
                    {saving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : saved ? (
                      "Sauvegardé ✓"
                    ) : (
                      "Sauvegarder"
                    )}
                  </Button>
                </div>
              )}
              {channelError && (
                <p className="text-xs text-red-500">{channelError}</p>
              )}
              {saveError && (
                <p className="text-xs text-red-500">{saveError}</p>
              )}
            </>
          ) : !connected ? (
            <p className="text-xs text-muted-foreground">
              Recevez une notification Slack dès qu&apos;une spec est générée ou exportée.
            </p>
          ) : null}
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
              Connecter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
