import { getUserTeams } from "@/actions/teams";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { TeamCard } from "@/components/teams/team-card";

export default async function TeamsSettingsPage() {
  const teams = await getUserTeams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes équipes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos équipes et les membres associés.
          </p>
        </div>
        <CreateTeamDialog />
      </div>

      {teams.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            Vous n&apos;appartenez à aucune équipe.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Créez votre première équipe pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
