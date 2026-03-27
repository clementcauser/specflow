import { requireSession } from "@/lib/session";
import { DangerSection } from "@/components/settings/danger-section";
import { Separator } from "@/components/ui/separator";
import { ProfileSection } from "@/components/settings/profile-section";
import { SecuritySection } from "@/components/settings/security-section";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfileSettingsPage() {
  const session = await requireSession();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Profil</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <ProfileSection user={session.user} />
          <Separator />
          <SecuritySection />
          <Separator />
          <DangerSection />
        </CardContent>
      </Card>
    </div>
  );
}
