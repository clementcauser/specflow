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

interface ExportMenuProps {
  specId: string;
}

export function ExportMenu({ specId }: ExportMenuProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
