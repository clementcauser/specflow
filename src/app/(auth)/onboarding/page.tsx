"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkspace } from "@/actions/workspaces";
import { switchActiveWorkspace } from "@/actions/tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function OnboardingPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const workspace = await createWorkspace({
          name: form.get("name") as string,
          slug: form.get("slug") as string,
          plan: "free",
        });
        await switchActiveWorkspace(workspace.id);
        router.push("/dashboard");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Bienvenue sur SpecFlow</h1>
          <p className="text-muted-foreground text-sm">
            Commencez par créer votre premier espace de travail.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Créer un espace de travail</CardTitle>
            <CardDescription>
              Un espace de travail regroupe vos projets et membres. Vous pourrez en créer
              d&apos;autres plus tard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Nom de l&apos;espace de travail</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Mon espace"
                  required
                  onChange={(e) => setSlug(slugify(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="slug">Identifiant unique</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="mon-agence"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Lettres minuscules, chiffres et tirets uniquement.
                </p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Création…" : "Créer et continuer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
