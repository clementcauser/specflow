import { getSpec } from "@/actions/specs";
import { SpecGenerator } from "@/components/specs/spec-generator";
import { SpecStatus } from "@/lib/enums";

export default async function GenerateSpecPage({
  params,
}: {
  params: Promise<{ specId: string }>;
}) {
  const { specId } = await params;
  const spec = await getSpec(specId);

  // Si déjà générée, redirect vers la page de visualisation
  if (spec.status === SpecStatus.DONE) {
    const { redirect } = await import("next/navigation");
    redirect(`/specs/${specId}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <SpecGenerator
        spec={{
          ...spec,
          content: spec.content as Record<string, unknown> | null,
        }}
      />
    </div>
  );
}
