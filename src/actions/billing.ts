"use server";

import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(workspaceId: string, priceId: string): Promise<string> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
    include: { workspace: true },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Accès refusé");
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

  if (!checkoutSession.url) throw new Error("Stripe n'a pas retourné d'URL");
  return checkoutSession.url;
}

export async function createPortalSession(workspaceId: string): Promise<string> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
    include: { workspace: { select: { stripeCustomerId: true } } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    throw new Error("Accès refusé");
  }

  const { stripeCustomerId } = member.workspace;
  if (!stripeCustomerId) throw new Error("Aucun client Stripe associé à ce workspace");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/settings/billing`,
  });

  return portalSession.url;
}
