import { getSpec } from "@/actions/specs";
import { EditSpecForm } from "@/components/specs/edit-spec-form";

import { getSessionWithOrg } from "@/lib/session";
import { notFound } from "next/navigation";

export default async function EditSpecPage({
  params,
}: {
  params: Promise<{ specId: string }>;
}) {
  const { specId } = await params;
  await getSessionWithOrg();
  const spec = await getSpec(specId);

  // Security check: ensure user is the creator or has access via org (handled by getSpec)
  if (!spec) return notFound();

  // If the spec isn't generated yet or encountered an error, we shouldn't edit content normally,
  // but let's allow editing metadata and what's available.

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Modifier la spec</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ajustez les titres, sections et autres paramètres du projet généré.
        </p>
      </div>

      <EditSpecForm
        spec={{
          ...spec,
          content: spec.content as Record<string, unknown> | null,
        }}
      />
    </div>
  );
}
