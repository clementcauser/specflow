import { requireSession } from "@/lib/session";
import { DangerSection } from "@/components/settings/danger-section";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/settings/logout-button";
import { ProfileSection } from "@/components/settings/profile-section";
import { SecuritySection } from "@/components/settings/security-section";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plug, ChevronRight } from "lucide-react";

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez votre compte et vos préférences.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <ProfileSection user={session.user} />
          <Separator />
          <SecuritySection />
          <Separator />
          <DangerSection />
          <Separator />
          <div className="pb-4 flex justify-end">
            <LogoutButton />
          </div>
        </CardContent>
      </Card>

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
  );
}
