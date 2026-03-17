import { redirect } from "next/navigation";
import { getSessionWithWorkspace } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, user } = await getSessionWithWorkspace();

  // Pas d'espace de travail → onboarding
  if (user.memberships.length === 0) {
    redirect("/onboarding");
  }

  // Détermine le workspace actif (fallback sur le premier)
  const activeWorkspaceId =
    user.activeWorkspaceId ?? user.memberships[0].workspace.id;

  const activeWorkspace =
    user.memberships.find((m) => m.workspace.id === activeWorkspaceId)
      ?.workspace ?? user.memberships[0].workspace;

  const workspaces = user.memberships.map((m) => m.workspace);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar desktop */}
      <Sidebar user={session.user} activeWorkspace={activeWorkspace} workspaces={workspaces} />

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar user={session.user} activeWorkspace={activeWorkspace} workspaces={workspaces} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <BottomNav />
    </div>
  );
}
