"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createCheckoutSession, createPortalSession } from "@/actions/billing";
import { Zap, Settings } from "lucide-react";

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "";

export function UpgradeButton({ workspaceId }: { workspaceId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const url = await createCheckoutSession(workspaceId, PRO_PRICE_ID);
      window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleUpgrade} disabled={loading}>
      <Zap className="h-4 w-4 mr-2" />
      {loading ? "Redirection…" : "Passer au Pro"}
    </Button>
  );
}

export function ManageSubscriptionButton({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const url = await createPortalSession(workspaceId);
      window.location.href = url;
    } catch {
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleManage} disabled={loading}>
      <Settings className="h-4 w-4 mr-2" />
      {loading ? "Redirection…" : "Gérer mon abonnement"}
    </Button>
  );
}
