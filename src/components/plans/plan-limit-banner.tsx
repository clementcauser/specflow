"use client";

import Link from "next/link";
import { AlertTriangle, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanLimitBannerProps {
  specsCount: number;
  limit: number;
}

export function PlanLimitBanner({ specsCount, limit }: PlanLimitBannerProps) {
  const isAtLimit = specsCount >= limit;
  const isNearLimit = !isAtLimit && specsCount === limit - 1;

  if (!isAtLimit && !isNearLimit) return null;

  if (isAtLimit) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col items-center text-center gap-4"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <Lock className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-base">
            Limite du plan gratuit atteinte
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Vous avez utilisé vos {limit} générations gratuites. Passez au plan
            Pro pour continuer à générer des specs sans limite.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button asChild>
            <Link href="/plans">
              <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
              Voir les plans
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/specs">Retour aux specs</Link>
          </Button>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {specsCount}/{limit} specs utilisées
        </p>
      </div>
    );
  }

  // Near limit warning (last free spec)
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-start gap-3"
    >
      <AlertTriangle
        className="h-4 w-4 shrink-0 text-amber-500 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex-1 text-sm">
        <span className="font-medium text-amber-600 dark:text-amber-400">
          Dernière génération gratuite —
        </span>{" "}
        <span className="text-foreground">
          Il vous reste 1 spec sur votre plan gratuit.
        </span>{" "}
        <Link
          href="/plans"
          className="font-medium text-primary underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
        >
          Découvrir le plan Pro
        </Link>
      </div>
    </div>
  );
}
