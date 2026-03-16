import { getUserTeams } from "@/actions/teams";
import { getActiveOrganization } from "@/actions/tenant";
import { TeamCard } from "@/components/teams/team-card";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";

export default async function TeamsPage() {
  const [teams, activeOrg] = await Promise.all([
    getUserTeams(),
    getActiveOrganization(),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes équipes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez vos équipes et basculez d&apos;un espace de travail à
            l&apos;autre.
          </p>
        </div>
        <CreateTeamDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            isActive={team.id === activeOrg?.id}
          />
        ))}
      </div>
    </div>
  );
}
