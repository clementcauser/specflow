"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function handleEmailPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const { error } = await authClient.signIn.email({
      email: form.get("email") as string,
      password: form.get("password") as string,
      callbackURL: "/dashboard",
    });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const { error } = await authClient.signIn.magicLink({
      email: form.get("email") as string,
      callbackURL: "/dashboard",
    });

    setLoading(false);
    if (error) setError("Impossible d'envoyer le lien.");
    else setMagicSent(true);
  }

  async function handleGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Choisissez votre méthode de connexion</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Google */}
        <Button variant="outline" className="w-full" onClick={handleGoogle}>
          <GoogleIcon /> Continuer avec Google
        </Button>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            ou
          </span>
        </div>

        <Tabs defaultValue="password">
          <TabsList className="w-full">
            <TabsTrigger value="password" className="flex-1">
              Mot de passe
            </TabsTrigger>
            <TabsTrigger value="magic" className="flex-1">
              Magic link
            </TabsTrigger>
          </TabsList>

          {/* Email + password */}
          <TabsContent value="password">
            <form onSubmit={handleEmailPassword} className="space-y-3 mt-3">
              <div className="space-y-1">
                <Label htmlFor="email-pw">Email</Label>
                <Input
                  id="email-pw"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/reset-password"
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion…" : "Se connecter"}
              </Button>
            </form>
          </TabsContent>

          {/* Magic link */}
          <TabsContent value="magic">
            {magicSent ? (
              <div className="mt-4 rounded-lg bg-muted p-4 text-center text-sm">
                <p className="font-medium">Vérifiez votre boîte mail ✉️</p>
                <p className="text-muted-foreground mt-1">
                  Un lien de connexion vous a été envoyé.
                </p>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-3 mt-3">
                <div className="space-y-1">
                  <Label htmlFor="email-ml">Email</Label>
                  <Input
                    id="email-ml"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Envoi…" : "Recevoir un lien"}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Pas encore de compte ?{" "}
          <Link
            href="/sign-up"
            className="text-foreground hover:underline font-medium"
          >
            Créer un compte
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
