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
import { disconnectJira, saveJiraDefaults } from "@/actions/jira";

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

interface JiraIntegrationCardProps {
  workspaceId: string;
  connected: boolean;
  cloudName?: string;
  cloudUrl?: string;
  siteConfigured?: boolean;
  defaultProjectKey?: string | null;
  defaultProjectName?: string | null;
  connectedAt?: Date;
  canManage: boolean;
}

function JiraIcon({ size = 5 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-${size} h-${size}`}
      fill="currentColor"
    >
      <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005zm5.723-5.756H5.757a5.218 5.218 0 0 0 5.233 5.214h2.13v2.058A5.215 5.215 0 0 0 18.297 18.3V6.762a1.005 1.005 0 0 0-1.003-1.005zm5.701-5.757H11.48a5.218 5.218 0 0 0 5.232 5.214h2.13V7.272A5.215 5.215 0 0 0 24 12.518V1.005A1.005 1.005 0 0 0 22.995 0z" />
    </svg>
  );
}

export function JiraIntegrationCard({
  workspaceId,
  connected,
  cloudName,
  cloudUrl,
  siteConfigured,
  defaultProjectKey,
  defaultProjectName,
  connectedAt,
  canManage,
}: JiraIntegrationCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [disconnecting, setDisconnecting] = useState(false);

  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const [selectedProjectKey, setSelectedProjectKey] = useState<string>(
    defaultProjectKey ?? ""
  );
  const [selectedProjectName, setSelectedProjectName] = useState<string>(
    defaultProjectName ?? ""
  );
  const [saving, setSaving] = useState(false);

  function handleConnect() {
    window.location.href = "/api/integrations/jira/connect";
  }

  function handleDisconnect() {
    setDisconnecting(true);
    startTransition(async () => {
      try {
        await disconnectJira(workspaceId);
        router.refresh();
      } finally {
        setDisconnecting(false);
      }
    });
  }

  async function loadProjects() {
    if (projectsLoaded) return;
    setLoadingProjects(true);
    try {
      const res = await fetch("/api/integrations/jira/projects");
      if (res.ok) {
        const data: JiraProject[] = await res.json();
        setProjects(data);
        setProjectsLoaded(true);
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

  async function handleSave() {
    if (!selectedProjectKey || !selectedProjectName) return;
    setSaving(true);
    try {
      await saveJiraDefaults(workspaceId, selectedProjectKey, selectedProjectName);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg border bg-white flex items-center justify-center shrink-0 text-[#0052CC]">
          <JiraIcon />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Jira</span>
            {connected && (
              <Badge
                variant="secondary"
                className="text-xs text-green-700 bg-green-100"
              >
                Connecté
              </Badge>
            )}
            {connected && !siteConfigured && (
              <Badge
                variant="secondary"
                className="text-xs text-amber-700 bg-amber-100"
              >
                Site non configuré
              </Badge>
            )}
          </div>

          {connected && cloudName ? (
            <div className="space-y-1.5 mt-1">
              <p className="text-xs text-muted-foreground">
                Site :{" "}
                {cloudUrl ? (
                  <a
                    href={cloudUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-2"
                  >
                    {cloudName}
                  </a>
                ) : (
                  <span className="font-medium">{cloudName}</span>
                )}
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

              {canManage && siteConfigured && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={selectedProjectKey}
                    onValueChange={handleProjectChange}
                    onOpenChange={(open) => open && loadProjects()}
                  >
                    <SelectTrigger className="h-7 text-xs w-52">
                      <SelectValue
                        placeholder={
                          loadingProjects ? "Chargement…" : "Projet par défaut"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingProjects && (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {projects.map((p) => (
                        <SelectItem key={p.key} value={p.key}>
                          [{p.key}] {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={handleSave}
                    disabled={saving || !selectedProjectKey}
                  >
                    {saving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}

              {!canManage && defaultProjectName && (
                <p className="text-xs text-muted-foreground">
                  Projet :{" "}
                  <span className="font-medium">{defaultProjectName}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Exportez vos user stories en Issues Jira.
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
              Connecter Jira
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
