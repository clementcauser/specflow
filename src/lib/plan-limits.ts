import { prisma } from "@/lib/prisma";
import { WorkspacePlan } from "@/generated/prisma/client";

const PLAN_SPEC_LIMITS: Record<WorkspacePlan, number> = {
  FREE: 3,
  PRO: Infinity,
  MAX: Infinity,
};

export async function canCreateSpec(
  workspaceId: string,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: { plan: true },
  });

  const limit = PLAN_SPEC_LIMITS[workspace.plan];

  if (limit === Infinity) {
    return { allowed: true, current: 0, limit };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const current = await prisma.spec.count({
    where: {
      workspaceId,
      createdAt: { gte: startOfMonth },
    },
  });

  return { allowed: current < limit, current, limit };
}
