"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
});

export async function createOrganization(
  data: z.infer<typeof createOrgSchema>,
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Non authentifié");

  const parsed = createOrgSchema.safeParse(data);
  if (!parsed.success) throw new Error("Données invalides");

  const org = await prisma.organization.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      members: {
        create: {
          userId: session.user.id,
          role: "owner",
        },
      },
    },
  });

  return org;
}
