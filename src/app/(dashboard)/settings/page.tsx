import Link from "next/link";
import { Plug, ChevronRight, User } from "lucide-react";
import { LogoutButton } from "@/components/settings/logout-button";

export default async function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez votre compte et vos préférences.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href="/settings/profile"
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors group"
        >
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Profil</p>
              <p className="text-xs text-muted-foreground">
                Votre nom, avatar et sécurité du compte.
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <Link
          href="/settings/integrations"
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Plug className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Intégrations</p>
              <p className="text-xs text-muted-foreground">
                Connectez Notion et d&apos;autres outils pour enrichir vos exports.
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>

      <div className="flex justify-end">
        <LogoutButton />
      </div>
    </div>
  );
}
