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
  const { workspaceId, priceId } = body as { workspaceId: string; priceId: string };

  if (!workspaceId || !priceId) {
    return NextResponse.json({ error: "Missing workspaceId or priceId" }, { status: 400 });
  }

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
    include: { workspace: true },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const workspace = member.workspace;
  let stripeCustomerId = workspace.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: workspace.name,
      metadata: { workspaceId },
    });
    stripeCustomerId = customer.id;

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { stripeCustomerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?success=true`,
    cancel_url: `${appUrl}/settings/billing?canceled=true`,
    metadata: { workspaceId },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
