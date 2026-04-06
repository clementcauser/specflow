import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { workspaceId } = body as { workspaceId: string };

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
    include: { workspace: true },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { stripeCustomerId } = member.workspace;
  if (!stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found for this workspace" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/settings/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
