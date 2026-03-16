"use client";

import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SecuritySection() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const form = new FormData(e.currentTarget);
    const newPassword = form.get("new") as string;
    const confirm = form.get("confirm") as string;

    if (newPassword !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.changePassword({
        currentPassword: form.get("current") as string,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) setError("Mot de passe actuel incorrect.");
      else setSuccess(true);
    });
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-medium">Sécurité</h2>
        <p className="text-sm text-muted-foreground">
          Modifiez votre mot de passe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <div className="space-y-1">
          <Label htmlFor="current">Mot de passe actuel</Label>
          <Input id="current" name="current" type="password" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new">Nouveau mot de passe</Label>
          <Input id="new" name="new" type="password" minLength={8} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm">Confirmer</Label>
          <Input id="confirm" name="confirm" type="password" required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">Mot de passe mis à jour.</p>
        )}
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Mise à jour…" : "Changer le mot de passe"}
        </Button>
      </form>
    </section>
  );
}
