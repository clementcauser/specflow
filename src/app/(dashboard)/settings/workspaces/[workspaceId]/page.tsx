import { getWorkspaceWithMembers } from "@/actions/workspaces";

import { DeleteWorkspaceDialog } from "@/components/workspaces/delete-workspace-dialog";
import { InviteMemberDialog } from "@/components/workspaces/invite-member-dialog";
import { MembersTable } from "@/components/workspaces/members-table";
import { WorkspaceSettingsForm } from "@/components/workspaces/workspace-settings-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireSession } from "@/lib/session";
import { Role } from "@/types/workspaces";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const [workspace, session] = await Promise.all([
    getWorkspaceWithMembers(workspaceId),
    requireSession(),
  ]);

  const currentMember = workspace.members.find((m) => m.userId === session.user.id)!;
  const isOwner = currentMember.role === "owner";
  const canManage = ["owner", "admin"].includes(currentMember.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{workspace.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{workspace.slug}</p>
        </div>
        {isOwner && <DeleteWorkspaceDialog workspaceId={workspace.id} workspaceName={workspace.name} />}
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="members">
            Membres ({workspace.members.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <WorkspaceSettingsForm workspace={workspace} canEdit={canManage} />
        </TabsContent>

        <TabsContent value="members" className="mt-6 space-y-4">
          {canManage && (
            <div className="flex justify-end">
              <InviteMemberDialog workspaceId={workspace.id} />
            </div>
          )}
          <MembersTable
            members={workspace.members}
            invitations={workspace.invitations}
            currentUserId={session.user.id}
            currentRole={currentMember.role as Role}
            workspaceId={workspace.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
