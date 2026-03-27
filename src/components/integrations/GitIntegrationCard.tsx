"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Unplug, Plug, Save } from "lucide-react";
import { disconnectGit, saveDefaultRepo } from "@/actions/git";
import { useRouter } from "next/navigation";
import type { GitProvider } from "@/generated/prisma/client";

interface GitRepo {
  id: number;
  full_name: string;
  name: string;
  owner: string;
}

interface GitIntegrationCardProps {
  workspaceId: string;
  provider: GitProvider;
  connected: boolean;
  accountName?: string;
  defaultRepoOwner?: string | null;
  defaultRepoName?: string | null;
  connectedAt?: Date;
  canManage: boolean;
}

const PROVIDER_LABELS: Record<GitProvider, string> = {
  GITHUB: "GitHub",
  GITLAB: "GitLab",
};

const PROVIDER_CONNECT_URLS: Record<GitProvider, string> = {
  GITHUB: "/api/integrations/github/connect",
  GITLAB: "/api/integrations/gitlab/connect",
};

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function GitLabIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.386 9.449.044 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.625-8.443a.92.92 0 0 0 .33-1.024" />
    </svg>
  );
}

const PROVIDER_ICONS: Record<GitProvider, React.ReactNode> = {
  GITHUB: <GitHubIcon />,
  GITLAB: <GitLabIcon />,
};

export function GitIntegrationCard({
  workspaceId,
  provider,
  connected,
  accountName,
  defaultRepoOwner,
  defaultRepoName,
  connectedAt,
  canManage,
}: GitIntegrationCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [disconnecting, setDisconnecting] = useState(false);

  const [repos, setRepos] = useState<GitRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [reposLoaded, setReposLoaded] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>(
    defaultRepoOwner && defaultRepoName
      ? `${defaultRepoOwner}/${defaultRepoName}`
      : ""
  );
  const [savingRepo, setSavingRepo] = useState(false);

  function handleConnect() {
    window.location.href = PROVIDER_CONNECT_URLS[provider];
  }

  function handleDisconnect() {
    setDisconnecting(true);
    startTransition(async () => {
      try {
        await disconnectGit(workspaceId, provider);
        router.refresh();
      } finally {
        setDisconnecting(false);
      }
    });
  }

  async function loadRepos() {
    if (reposLoaded) return;
    setLoadingRepos(true);
    try {
      const res = await fetch(
        `/api/integrations/git/repos?provider=${provider}`
      );
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
        setReposLoaded(true);
      }
    } finally {
      setLoadingRepos(false);
    }
  }

  async function handleSaveRepo() {
    if (!selectedRepo) return;
    const [owner, name] = selectedRepo.split("/");
    setSavingRepo(true);
    try {
      await saveDefaultRepo(workspaceId, provider, owner, name);
      router.refresh();
    } finally {
      setSavingRepo(false);
    }
  }

  const label = PROVIDER_LABELS[provider];

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg border bg-white flex items-center justify-center shrink-0">
          {PROVIDER_ICONS[provider]}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{label}</span>
            {connected && (
              <Badge
                variant="secondary"
                className="text-xs text-green-700 bg-green-100"
              >
                Connecté
              </Badge>
            )}
          </div>

          {connected && accountName ? (
            <div className="space-y-1.5 mt-1">
              <p className="text-xs text-muted-foreground">
                Compte :{" "}
                <span className="font-medium">{accountName}</span>
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
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedRepo}
                    onValueChange={setSelectedRepo}
                    onOpenChange={(open) => open && loadRepos()}
                  >
                    <SelectTrigger className="h-7 text-xs w-56">
                      <SelectValue
                        placeholder={
                          loadingRepos ? "Chargement…" : "Repo par défaut"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingRepos && (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {repos.map((r) => (
                        <SelectItem key={r.id} value={r.full_name}>
                          {r.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={handleSaveRepo}
                    disabled={savingRepo || !selectedRepo}
                  >
                    {savingRepo ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Exportez vos user stories en issues {label}.
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
              Connecter {label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
