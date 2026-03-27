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
import { Download, FileText, FileDown, Loader2 } from "lucide-react";
import { NotionExportModal } from "./notion-export-modal";

interface ExportMenuProps {
  specId: string;
  specTitle: string;
}

export function ExportMenu({ specId, specTitle }: ExportMenuProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [notionModalOpen, setNotionModalOpen] = useState(false);

  async function handleExport(format: "markdown" | "pdf") {
    if (format === "pdf") {
      setLoadingPdf(true);
    }

    try {
      const url = `/api/specs/${specId}/export/${format}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Export échoué");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
      a.href = objectUrl;
      a.download = filenameMatch?.[1] ?? `spec.${format === "markdown" ? "md" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } finally {
      if (format === "pdf") {
        setLoadingPdf(false);
      }
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {loadingPdf ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exporter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Format d&apos;export</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport("markdown")}>
            <FileText className="h-4 w-4" />
            Markdown (.md)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={loadingPdf}>
            <FileDown className="h-4 w-4" />
            PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setNotionModalOpen(true)}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
            </svg>
            Notion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotionExportModal
        open={notionModalOpen}
        onClose={() => setNotionModalOpen(false)}
        specId={specId}
        specTitle={specTitle}
      />
    </>
  );
}
