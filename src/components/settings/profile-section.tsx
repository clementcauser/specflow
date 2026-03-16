"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  user: { name: string; email: string; image?: string | null };
};

export function ProfileSection({ user }: Props) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      await authClient.updateUser({ name: form.get("name") as string });
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-medium">Profil</h2>
        <p className="text-sm text-muted-foreground">Votre nom et avatar.</p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="text-lg">
            {user.name[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <div className="space-y-1">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" name="name" defaultValue={user.name} required />
        </div>
        {success && (
          <p className="text-sm text-green-600">Profil mis à jour.</p>
        )}
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </section>
  );
}
