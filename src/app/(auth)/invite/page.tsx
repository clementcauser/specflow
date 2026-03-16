"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { acceptInvitation } from "@/actions/members";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [error, setError] = useState(token ? "" : "Lien invalide.");

  useEffect(() => {
    if (!token) return;

    acceptInvitation(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(err.message);
      });
  }, [token]);

  return (
    <Card>
      <CardContent className="pt-6 text-center space-y-3">
        {status === "loading" && (
          <p className="text-muted-foreground">
            Vérification de l&apos;invitation…
          </p>
        )}
        {status === "success" && (
          <>
            <p className="font-semibold">Invitation acceptée !</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Accéder au dashboard
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-destructive font-semibold">Erreur</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/sign-in")}
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
