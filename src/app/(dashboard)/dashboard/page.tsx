import { getSessionWithOrg } from "@/lib/session";
import { getActiveOrganization } from "@/actions/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMonthlySpecsCount } from "@/actions/specs";
import { FileText, Users, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const { session, user } = await getSessionWithOrg();
  const activeOrg = await getActiveOrganization();

  const monthlyCount = activeOrg ? await getMonthlySpecsCount(activeOrg.id) : 0;

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Bonjour, {firstName} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {activeOrg
            ? `Vous travaillez dans l'équipe "${activeOrg.name}".`
            : "Sélectionnez une équipe pour commencer."}
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Specs ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{monthlyCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyCount > 0
                ? `${monthlyCount} spec${monthlyCount > 1 ? "s" : ""} générée${monthlyCount > 1 ? "s" : ""}`
                : "Aucune spec générée"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Membres de l&apos;équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {activeOrg?.members.length ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeOrg ? `Plan ${activeOrg.plan}` : "Aucune équipe active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mes équipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{user.memberships.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {user.memberships.length > 1
                ? "Espaces de travail"
                : "Espace de travail"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Actions rapides
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="group hover:border-primary/50 transition-colors cursor-pointer">
            <Link href="/specs/new">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Nouvelle spec</p>
                  <p className="text-xs text-muted-foreground">
                    Générer une spec technique
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:border-primary/50 transition-colors cursor-pointer">
            <Link href="/teams">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Gérer l&apos;équipe</p>
                  <p className="text-xs text-muted-foreground">
                    Membres, rôles, paramètres
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>

      {/* Dernières specs — placeholder */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Dernières specs
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/specs">Voir tout</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium">
              Aucune spec pour l&apos;instant
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Générez votre première spec en quelques secondes.
            </p>
            <Button size="sm" className="mt-4" asChild>
              <Link href="/specs/new">Créer une spec</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
