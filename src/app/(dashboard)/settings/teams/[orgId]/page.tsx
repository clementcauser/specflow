import { getTeamWithMembers } from "@/actions/teams";

import { DeleteTeamDialog } from "@/components/teams/delete-team-dialog";
import { InviteMemberDialog } from "@/components/teams/invite-member-dialog";
import { MembersTable } from "@/components/teams/members-table";
import { TeamSettingsForm } from "@/components/teams/team-settings-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireSession } from "@/lib/session";
import { Role } from "@/types/teams";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const [team, session] = await Promise.all([
    getTeamWithMembers(orgId),
    requireSession(),
  ]);

  const currentMember = team.members.find((m) => m.userId === session.user.id)!;
  const isOwner = currentMember.role === "owner";
  const canManage = ["owner", "admin"].includes(currentMember.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{team.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{team.slug}</p>
        </div>
        {isOwner && <DeleteTeamDialog orgId={team.id} teamName={team.name} />}
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="members">
            Membres ({team.members.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <TeamSettingsForm team={team} canEdit={canManage} />
        </TabsContent>

        <TabsContent value="members" className="mt-6 space-y-4">
          {canManage && (
            <div className="flex justify-end">
              <InviteMemberDialog orgId={team.id} />
            </div>
          )}
          <MembersTable
            members={team.members}
            invitations={team.invitations}
            currentUserId={session.user.id}
            currentRole={currentMember.role as Role}
            orgId={team.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
