import { requireSession } from "@/lib/session";
import { DangerSection } from "@/components/settings/danger-section";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/settings/logout-button";
import { ProfileSection } from "@/components/settings/profile-section";
import { SecuritySection } from "@/components/settings/security-section";
import { Card, CardContent } from "@/components/ui/card";

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
    </div>
  );
}
