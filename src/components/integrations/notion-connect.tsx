"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Unplug, Plug } from "lucide-react";
import { disconnectNotion } from "@/actions/notion";
import { useRouter } from "next/navigation";

interface NotionConnectProps {
  workspaceId: string;
  connected: boolean;
  notionWorkspaceName?: string | null;
  notionWorkspaceIcon?: string | null;
  connectedAt?: Date;
  canManage: boolean; // OWNER or ADMIN
}

export function NotionConnect({
  workspaceId,
  connected,
  notionWorkspaceName,
  notionWorkspaceIcon,
  connectedAt,
  canManage,
}: NotionConnectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [disconnecting, setDisconnecting] = useState(false);

  function handleConnect() {
    window.location.href = "/api/auth/notion/authorize";
  }

  function handleDisconnect() {
    setDisconnecting(true);
    startTransition(async () => {
      try {
        await disconnectNotion(workspaceId);
        router.refresh();
      } finally {
        setDisconnecting(false);
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Notion logo */}
        <div className="w-9 h-9 rounded-lg border bg-white flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Notion</span>
            {connected && (
              <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                Connecté
              </Badge>
            )}
          </div>
          {connected && notionWorkspaceName ? (
            <p className="text-xs text-muted-foreground">
              Workspace : <span className="font-medium">{notionWorkspaceName}</span>
              {connectedAt && (
                <> · depuis le{" "}
                  {new Date(connectedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </>
              )}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Exportez vos specs directement dans Notion.
            </p>
          )}
        </div>
      </div>

      {canManage && (
        <div>
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
