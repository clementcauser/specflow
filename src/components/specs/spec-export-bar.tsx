"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileDown, Loader2, GitBranch } from "lucide-react";
import { NotionExportModal } from "./notion-export-modal";
import { GitExportButton } from "@/components/integrations/GitExportButton";
import { TrelloExportButton } from "@/components/integrations/TrelloExportButton";
import { ClickUpExportButton } from "@/components/integrations/ClickUpExportButton";
import { JiraExportButton } from "@/components/integrations/JiraExportButton";

interface ConnectedProvider {
  provider: "GITHUB" | "GITLAB";
  accountName: string;
  defaultRepoOwner?: string | null;
  defaultRepoName?: string | null;
}

interface SpecExportBarProps {
  specId: string;
  specTitle: string;
  notionConnected: boolean;
  connectedProviders: ConnectedProvider[];
  trelloConnected: boolean;
  clickupConnected: boolean;
  jiraConnected: boolean;
}

function NotionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
    </svg>
  );
}

function TrelloIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
      <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" />
    </svg>
  );
}

function JiraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
      <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005zm5.723-5.756H5.757a5.218 5.218 0 0 0 5.233 5.214h2.13v2.058A5.215 5.215 0 0 0 18.297 18.3V6.762a1.005 1.005 0 0 0-1.003-1.005zm5.701-5.757H11.48a5.218 5.218 0 0 0 5.232 5.214h2.13V7.272A5.215 5.215 0 0 0 24 12.518V1.005A1.005 1.005 0 0 0 22.995 0z" />
    </svg>
  );
}

function ClickUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
      <path d="M2.37 17.2 5.63 14.6c1.74 2.3 3.59 3.35 5.73 3.35 2.13 0 3.95-1.03 5.65-3.29l3.3 2.52C17.77 20.5 15.03 22 11.36 22 7.72 22 4.97 20.52 2.37 17.2ZM11.37 2l5.6 5.01-2.26 2.53c-1-1.02-2.14-1.62-3.34-1.62-1.21 0-2.38.62-3.4 1.67L5.71 7.1 11.37 2Z" />
    </svg>
  );
}

export function SpecExportBar({
  specId,
  specTitle,
  notionConnected,
  connectedProviders,
  trelloConnected,
  clickupConnected,
  jiraConnected,
}: SpecExportBarProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [notionOpen, setNotionOpen] = useState(false);
  const [gitOpen, setGitOpen] = useState(false);
  const [trelloOpen, setTrelloOpen] = useState(false);
  const [clickupOpen, setClickupOpen] = useState(false);
  const [jiraOpen, setJiraOpen] = useState(false);

  async function handleDownload(format: "markdown" | "pdf") {
    if (format === "pdf") setLoadingPdf(true);
    try {
      const res = await fetch(`/api/specs/${specId}/export/${format}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const cd = res.headers.get("Content-Disposition");
      const match = cd?.match(/filename="([^"]+)"/);
      a.href = url;
      a.download = match?.[1] ?? `spec.${format === "markdown" ? "md" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      if (format === "pdf") setLoadingPdf(false);
    }
  }

  const gitLabel = connectedProviders.length === 1
    ? connectedProviders[0].provider === "GITHUB" ? "GitHub" : "GitLab"
    : "Git";

  return (
    <>
      {/* ── Desktop ── */}
      <div data-testid="export-bar-desktop" className="hidden sm:flex items-center justify-between gap-4 bg-card ring-1 ring-foreground/10 rounded-xl px-4 py-3">
        <span className="text-sm font-semibold">Exporter</span>
        <div className="flex items-center gap-2 flex-wrap">

        {jiraConnected && (
          <Button variant="outline" size="sm" onClick={() => setJiraOpen(true)}>
            <JiraIcon />
            Jira
          </Button>
        )}

        {trelloConnected && (
          <Button variant="outline" size="sm" onClick={() => setTrelloOpen(true)}>
            <TrelloIcon />
            Trello
          </Button>
        )}

        {clickupConnected && (
          <Button variant="outline" size="sm" onClick={() => setClickupOpen(true)}>
            <ClickUpIcon />
            ClickUp
          </Button>
        )}

        {notionConnected && (
          <Button variant="outline" size="sm" onClick={() => setNotionOpen(true)}>
            <NotionIcon />
            Notion
          </Button>
        )}

        {connectedProviders.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setGitOpen(true)}>
            <GitBranch className="h-4 w-4" />
            {gitLabel}
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={() => handleDownload("markdown")}>
          <FileText className="h-4 w-4" />
          Markdown
        </Button>

        <Button variant="outline" size="sm" onClick={() => handleDownload("pdf")} disabled={loadingPdf}>
          {loadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          PDF
        </Button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      <div data-testid="export-bar-mobile" className="flex sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {loadingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exporter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Format d&apos;export</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {jiraConnected && (
              <DropdownMenuItem onClick={() => setJiraOpen(true)}>
                <JiraIcon />
                Jira
              </DropdownMenuItem>
            )}
            {trelloConnected && (
              <DropdownMenuItem onClick={() => setTrelloOpen(true)}>
                <TrelloIcon />
                Trello
              </DropdownMenuItem>
            )}
            {clickupConnected && (
              <DropdownMenuItem onClick={() => setClickupOpen(true)}>
                <ClickUpIcon />
                ClickUp
              </DropdownMenuItem>
            )}
            {notionConnected && (
              <DropdownMenuItem onClick={() => setNotionOpen(true)}>
                <NotionIcon />
                Notion
              </DropdownMenuItem>
            )}
            {connectedProviders.length > 0 && (
              <DropdownMenuItem onClick={() => setGitOpen(true)}>
                <GitBranch className="h-4 w-4" />
                {gitLabel}
              </DropdownMenuItem>
            )}
            {(notionConnected || connectedProviders.length > 0 || trelloConnected || clickupConnected || jiraConnected) && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem onClick={() => handleDownload("markdown")}>
              <FileText className="h-4 w-4" />
              Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("pdf")} disabled={loadingPdf}>
              <FileDown className="h-4 w-4" />
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Dialogs (shared between desktop and mobile) ── */}
      <NotionExportModal
        open={notionOpen}
        onClose={() => setNotionOpen(false)}
        specId={specId}
        specTitle={specTitle}
      />

      {connectedProviders.length > 0 && (
        <GitExportButton
          specId={specId}
          connectedProviders={connectedProviders}
          open={gitOpen}
          onOpenChange={setGitOpen}
        />
      )}

      {trelloConnected && (
        <TrelloExportButton
          specId={specId}
          open={trelloOpen}
          onOpenChange={setTrelloOpen}
        />
      )}

      {clickupConnected && (
        <ClickUpExportButton
          specId={specId}
          open={clickupOpen}
          onOpenChange={setClickupOpen}
        />
      )}

      {jiraConnected && (
        <JiraExportButton
          specId={specId}
          open={jiraOpen}
          onOpenChange={setJiraOpen}
        />
      )}
    </>
  );
}
