"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ExternalLink, Search, AlertCircle } from "lucide-react";
import type { NotionPage } from "@/lib/notion";

interface NotionExportModalProps {
  open: boolean;
  onClose: () => void;
  specId: string;
  specTitle: string;
}

type ModalState = "loading" | "not_connected" | "selecting" | "exporting" | "success" | "error";

export function NotionExportModal({
  open,
  onClose,
  specId,
  specTitle,
}: NotionExportModalProps) {
  const [state, setState] = useState<ModalState>("loading");
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [filteredPages, setFilteredPages] = useState<NotionPage[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [notionPageUrl, setNotionPageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchPages = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/integrations/notion/pages");

      if (res.status === 400) {
        setState("not_connected");
        return;
      }

      if (res.status === 401) {
        setErrorMessage("Votre connexion Notion a expiré. Reconnectez-la dans les paramètres.");
        setState("error");
        return;
      }

      if (!res.ok) {
        setErrorMessage("Impossible de charger vos pages Notion.");
        setState("error");
        return;
      }

      const data = await res.json();
      setPages(data.pages ?? []);
      setFilteredPages(data.pages ?? []);
      setState("selecting");
    } catch {
      setErrorMessage("Une erreur réseau est survenue.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedPageId(null);
      setNotionPageUrl(null);
      fetchPages();
    }
  }, [open, fetchPages]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredPages(pages);
    } else {
      const q = search.toLowerCase();
      setFilteredPages(pages.filter((p) => p.title.toLowerCase().includes(q)));
    }
  }, [search, pages]);

  async function handleExport() {
    if (!selectedPageId) return;

    setState("exporting");
    try {
      const res = await fetch(`/api/specs/${specId}/export/notion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: selectedPageId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "notion_unauthorized") {
          setErrorMessage("Votre connexion Notion a expiré. Reconnectez-la dans les paramètres.");
        } else {
          setErrorMessage("L'export vers Notion a échoué. Réessayez.");
        }
        setState("error");
        return;
      }

      const data = await res.json();
      setNotionPageUrl(data.url);
      setState("success");
    } catch {
      setErrorMessage("Une erreur réseau est survenue.");
      setState("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
            </svg>
            Exporter vers Notion
          </DialogTitle>
          <DialogDescription>
            Choisissez la page Notion parente où créer &ldquo;{specTitle}&rdquo;.
          </DialogDescription>
        </DialogHeader>

        {/* Loading */}
        {state === "loading" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Not connected */}
        {state === "not_connected" && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Notion n&apos;est pas connecté à cet espace de travail. Connectez-le depuis les paramètres.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/settings/integrations", "_blank")}
            >
              Ouvrir les paramètres
            </Button>
          </div>
        )}

        {/* Page selector */}
        {state === "selecting" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une page..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-56 overflow-y-auto rounded-md border divide-y">
              {filteredPages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {search ? "Aucun résultat" : "Aucune page accessible"}
                </p>
              )}
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setSelectedPageId(page.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                    selectedPageId === page.id ? "bg-accent font-medium" : ""
                  }`}
                >
                  {page.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exporting */}
        {state === "exporting" && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">Export en cours…</p>
          </div>
        )}

        {/* Success */}
        {state === "success" && notionPageUrl && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-green-700">
              La spec a été exportée avec succès vers Notion.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href={notionPageUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir dans Notion
              </a>
            </Button>
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="flex items-start gap-2 text-sm text-destructive py-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        <DialogFooter>
          {state === "selecting" && (
            <Button
              onClick={handleExport}
              disabled={!selectedPageId}
            >
              Exporter
            </Button>
          )}
          {(state === "success" || state === "error" || state === "not_connected") && (
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          )}
          {state === "selecting" && (
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
