import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { getSessionWithWorkspace } from "@/lib/session";
import { getSpecs, getWorkspacePlanInfo } from "@/actions/specs";
import { SpecList } from "@/components/specs/spec-list";

export default async function SpecsPage() {
  const { user } = await getSessionWithWorkspace();
  const activeWorkspaceId =
    user.activeWorkspaceId ?? user.memberships[0].workspace.id;

  const [specs, planInfo] = await Promise.all([
    getSpecs(activeWorkspaceId),
    getWorkspacePlanInfo(activeWorkspaceId),
  ]);

  const isFreePlan = planInfo.plan === "FREE" && planInfo.limit !== null;
  const isAtLimit = planInfo.isAtLimit;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mes specs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez et consultez toutes les spécifications techniques générées.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isFreePlan && (
            <span
              className="font-mono text-xs text-muted-foreground"
              aria-label={`${planInfo.specsCount} specs utilisées sur ${planInfo.limit}`}
            >
              {planInfo.specsCount}/{planInfo.limit} specs
            </span>
          )}
          {isAtLimit ? (
            <Button asChild>
              <Link href="/plans">
                <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
                Passer au Pro
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/specs/new">
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Nouvelle spec
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isFreePlan && planInfo.limit !== null && (
        <div aria-label="Utilisation du plan">
          <div
            className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={planInfo.specsCount}
            aria-valuemin={0}
            aria-valuemax={planInfo.limit}
            aria-label={`${planInfo.specsCount} specs utilisées sur ${planInfo.limit}`}
          >
            <div
              className={`h-full rounded-full transition-all ${
                isAtLimit
                  ? "bg-destructive"
                  : planInfo.specsCount === planInfo.limit - 1
                    ? "bg-amber-500"
                    : "bg-primary"
              }`}
              style={{
                width: `${Math.min((planInfo.specsCount / planInfo.limit) * 100, 100)}%`,
              }}
            />
          </div>
          {isAtLimit && (
            <p className="text-xs text-destructive mt-1.5 font-mono">
              Limite atteinte —{" "}
              <Link href="/plans" className="underline underline-offset-2 hover:no-underline">
                voir les plans
              </Link>
            </p>
          )}
        </div>
      )}

      {specs.length > 0 ? (
        <SpecList specs={specs} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="font-semibold text-lg">Aucune spec générée</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Commencez par décrire votre projet en langage naturel pour obtenir
              une spec technique complète.
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
