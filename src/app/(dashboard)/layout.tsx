import { redirect } from "next/navigation";
import { getSessionWithOrg } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, user } = await getSessionWithOrg();

  // Pas d'équipe → onboarding
  if (user.memberships.length === 0) {
    redirect("/onboarding");
  }

  // Détermine l'org active (fallback sur la première)
  const activeOrgId =
    user.activeOrganizationId ?? user.memberships[0].organization.id;

  const activeOrg =
    user.memberships.find((m) => m.organization.id === activeOrgId)
      ?.organization ?? user.memberships[0].organization;

  const teams = user.memberships.map((m) => m.organization);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar desktop */}
      <Sidebar user={session.user} activeOrg={activeOrg} teams={teams} />

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar user={session.user} activeOrg={activeOrg} teams={teams} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <BottomNav />
    </div>
  );
}
