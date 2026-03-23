import Link from "next/link";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getActiveWorkspace } from "@/actions/tenant";
import { getWorkspacePlanInfo } from "@/actions/specs";
import { redirect } from "next/navigation";
import { WorkspacePlan } from "@/lib/enums";

const PLANS = [
  {
    id: WorkspacePlan.FREE,
    name: "Free",
    price: "0",
    period: "pour toujours",
    limit: "3 specs offertes — sans CB",
    features: [
      { ok: true, text: "3 specs (à vie)" },
      { ok: true, text: "Toutes les sections" },
      { ok: true, text: "Export PDF" },
      { ok: true, text: "1 workspace · 1 membre" },
      { ok: false, text: "Export Notion / Jira" },
      { ok: false, text: "Membres d'équipe" },
    ],
    cta: "Votre plan actuel",
    highlight: false,
  },
  {
    id: WorkspacePlan.PRO,
    name: "Pro",
    price: "29",
    period: "par mois · par workspace",
    limit: "30 specs / mois",
    badge: "Le plus populaire",
    features: [
      { ok: true, text: "30 specs par mois" },
      { ok: true, text: "Toutes les sections" },
      { ok: true, text: "Export PDF + Notion + Jira" },
      { ok: true, text: "Jusqu'à 5 membres" },
      { ok: true, text: "Workspaces illimités" },
      { ok: true, text: "Support prioritaire" },
    ],
    cta: "Passer au Pro",
    highlight: true,
  },
  {
    id: "MAX" as const,
    name: "Max",
    price: "79",
    period: "par mois · par workspace",
    limit: "Specs illimitées",
    features: [
      { ok: true, text: "Specs illimitées" },
      { ok: true, text: "Toutes les sections" },
      { ok: true, text: "Export PDF + Notion + Jira" },
      { ok: true, text: "Membres illimités" },
      { ok: true, text: "Templates personnalisés" },
      { ok: true, text: "Support dédié + onboarding" },
    ],
    cta: "Contacter l'équipe",
    highlight: false,
  },
];

export default async function PlansPage() {
  const activeWorkspace = await getActiveWorkspace();
  if (!activeWorkspace) redirect("/onboarding");

  const planInfo = await getWorkspacePlanInfo(activeWorkspace.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Choisissez votre plan
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Passez au Pro pour débloquer des générations illimitées et plus de
          fonctionnalités.
        </p>
      </div>

      {planInfo.plan === WorkspacePlan.FREE && planInfo.limit !== null && (
        <div
          className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
          role="status"
          aria-live="polite"
        >
          <span className="font-medium text-amber-600 dark:text-amber-400">
            Plan gratuit —
          </span>{" "}
          <span className="text-foreground">
            {planInfo.specsCount} spec{planInfo.specsCount > 1 ? "s" : ""} utilisée
            {planInfo.specsCount > 1 ? "s" : ""} sur {planInfo.limit}
          </span>
          {planInfo.isAtLimit && (
            <span className="ml-2 text-muted-foreground">
              · Limite atteinte, passez au Pro pour continuer.
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {PLANS.map((plan) => {
          const isCurrent = planInfo.plan === plan.id;
          return (
            <article
              key={plan.id}
              aria-label={`Plan ${plan.name}`}
              className={`relative rounded-xl border p-8 transition-all ${
                plan.highlight
                  ? "border-primary bg-card shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-border bg-card"
              } ${isCurrent ? "ring-2 ring-primary/40" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="font-mono text-[10px] whitespace-nowrap">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge
                    variant="secondary"
                    className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20"
                  >
                    Plan actuel
                  </Badge>
                </div>
              )}

              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-5">
                {plan.name}
              </p>

              <div className="mb-6">
                <div className="flex items-start gap-0.5 leading-none mb-1">
                  <span className="font-mono text-lg text-muted-foreground mt-2">
                    €
                  </span>
                  <span className="font-serif text-5xl font-bold text-foreground">
                    {plan.price}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {plan.period}
                </p>
              </div>

              <div className="rounded-lg bg-primary/8 border border-primary/15 px-3 py-2 font-mono text-xs text-primary mb-6">
                {plan.limit}
              </div>

              <ul className="space-y-0 mb-8 divide-y divide-border" role="list">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-2.5 py-2.5 text-sm"
                  >
                    {feature.ok ? (
                      <Check
                        className="h-4 w-4 shrink-0 text-green-600"
                        aria-hidden="true"
                      />
                    ) : (
                      <X
                        className="h-4 w-4 shrink-0 text-muted-foreground/40"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={
                        feature.ok
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled
                  aria-label="Votre plan actuel"
                >
                  {plan.cta}
                </Button>
              ) : plan.id === "MAX" ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="mailto:hello@specflow.io">{plan.cta}</Link>
                </Button>
              ) : (
                <Button
                  className={`w-full ${plan.highlight ? "" : "variant-outline"}`}
                  variant={plan.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href="/settings/billing">{plan.cta}</Link>
                </Button>
              )}
            </article>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground font-mono">
        Sans engagement · Annulation à tout moment · TVA non incluse
      </p>
    </div>
  );
}
