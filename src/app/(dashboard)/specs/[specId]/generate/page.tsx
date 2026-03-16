import { getSpec } from "@/actions/specs";
import { SpecGenerator } from "@/components/specs/spec-generator";

export default async function GenerateSpecPage({
  params,
}: {
  params: Promise<{ specId: string }>;
}) {
  const { specId } = await params;
  const spec = await getSpec(specId);

  // Si déjà générée, redirect vers la page de visualisation
  if (spec.status === "done") {
    const { redirect } = await import("next/navigation");
    redirect(`/specs/${specId}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <SpecGenerator spec={spec} />
    </div>
  );
}
