import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { getSessionWithOrg } from "@/lib/session";
import { getSpecs } from "@/actions/specs";
import { SpecList } from "@/components/specs/spec-list";

export default async function SpecsPage() {
  const { user } = await getSessionWithOrg();
  const activeOrgId = user.activeOrganizationId ?? user.memberships[0].organization.id;
  
  const specs = await getSpecs(activeOrgId);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mes specs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez et consultez toutes les spécifications techniques générées.
          </p>
        </div>
        <Button asChild>
          <Link href="/specs/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle spec
          </Link>
        </Button>
      </div>

      {specs.length > 0 ? (
        <SpecList specs={specs} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-lg">Aucune spec générée</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Commencez par décrire votre projet en langage naturel pour obtenir une spec technique complète.
            </p>
            <Button className="mt-8" asChild>
              <Link href="/specs/new">Générer ma première spec</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
