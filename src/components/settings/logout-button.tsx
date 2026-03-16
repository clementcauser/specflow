"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await authClient.signOut();
      router.push("/sign-in");
      router.refresh();
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
      className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isPending ? "Déconnexion…" : "Se déconnecter"}
    </Button>
  );
}
