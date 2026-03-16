import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function SpecsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes specs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Toutes les specs générées pour votre équipe.
          </p>
        </div>
        <Button asChild>
          <Link href="/specs/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle spec
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-4" />
          <p className="font-medium">Aucune spec générée</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Décrivez votre projet en langage naturel et obtenez une spec
            complète en 30 secondes.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/specs/new">Générer ma première spec</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
