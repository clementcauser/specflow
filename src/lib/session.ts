import "server-only";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

export async function getSessionWithOrg() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      activeOrganizationId: true,
      memberships: {
        include: {
          organization: {
            select: { id: true, name: true, slug: true, plan: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return { session, user };
}
