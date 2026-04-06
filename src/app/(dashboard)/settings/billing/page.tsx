import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton, ManageSubscriptionButton } from "@/components/billing/billing-actions";
import { CheckoutSuccessToast } from "@/components/billing/checkout-success-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PLAN_LABELS: Record<string, string> = {
  FREE: "Gratuit",
  PRO: "Pro",
  MAX: "Max",
};

const PLAN_SPEC_LIMITS: Record<string, number | null> = {
  FREE: 3,
  PRO: 30,
  MAX: null,
};

export default async function BillingPage() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  const workspaceId = user.activeWorkspaceId;
  if (!workspaceId) redirect("/onboarding");

  const [workspace, member] = await Promise.all([
    prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: {
        plan: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
      },
    }),
    prisma.member.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
      select: { role: true },
    }),
  ]);

  const isPaidPlan = workspace.plan !== "FREE";
  const limit = PLAN_SPEC_LIMITS[workspace.plan];

  // Nombre de specs ce mois-ci
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const specsThisMonth = await prisma.spec.count({
    where: { workspaceId, createdAt: { gte: startOfMonth } },
  });

  const canManage = !!member && ["OWNER", "ADMIN"].includes(member.role);

  return (
    <div className="space-y-8 max-w-2xl">
      <CheckoutSuccessToast />
      <div>
        <h1 className="text-2xl font-semibold">Facturation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez votre abonnement et suivez votre utilisation.
        </p>
      </div>

      {/* Plan actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan actuel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">
                {PLAN_LABELS[workspace.plan] ?? workspace.plan}
              </span>
              {workspace.subscriptionStatus === "active" && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                >
                  Actif
                </Badge>
              )}
              {workspace.subscriptionStatus === "past_due" && (
                <Badge variant="destructive">Paiement en retard</Badge>
              )}
              {workspace.subscriptionStatus === "canceled" && (
                <Badge variant="secondary">Annulé</Badge>
              )}
            </div>

            {canManage && (
              <div>
                {isPaidPlan ? (
                  <ManageSubscriptionButton workspaceId={workspaceId} />
                ) : (
                  <UpgradeButton workspaceId={workspaceId} />
                )}
              </div>
            )}
          </div>

          {isPaidPlan && workspace.currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              Prochain renouvellement le{" "}
              <span className="text-foreground font-medium">
                {format(new Date(workspace.currentPeriodEnd), "d MMMM yyyy", { locale: fr })}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Utilisation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Utilisation ce mois-ci</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Specs générées</span>
            <span className="font-mono font-medium">
              {specsThisMonth}
              {limit !== null && (
                <span className="text-muted-foreground"> / {limit}</span>
              )}
            </span>
          </div>

          {limit !== null && (
            <div
              className="h-2 w-full rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={specsThisMonth}
              aria-valuemin={0}
              aria-valuemax={limit}
            >
              <div
                className={`h-full rounded-full transition-all ${
                  specsThisMonth >= limit
                    ? "bg-destructive"
                    : specsThisMonth >= limit - 1
                      ? "bg-amber-500"
                      : "bg-primary"
                }`}
                style={{ width: `${Math.min((specsThisMonth / limit) * 100, 100)}%` }}
              />
            </div>
          )}

          {limit !== null && specsThisMonth >= limit && canManage && (
            <p className="text-xs text-destructive">
              Limite atteinte — passez au Pro pour continuer à générer des specs.
            </p>
          )}

          {limit === null && (
            <p className="text-xs text-muted-foreground">
              Specs illimitées sur votre plan Max.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
