import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { WorkspacePlan } from "@/generated/prisma/client";
import type Stripe from "stripe";

export const runtime = "nodejs";

function priceIdToPlan(priceId: string): WorkspacePlan {
  if (priceId === process.env.STRIPE_PRICE_PRO) return WorkspacePlan.PRO;
  if (priceId === process.env.STRIPE_PRICE_MAX) return WorkspacePlan.MAX;
  return WorkspacePlan.FREE;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const workspaceId = session.metadata?.workspaceId;
        if (!workspaceId) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price.id ?? "";

        await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            stripePriceId: priceId,
            plan: priceIdToPlan(priceId),
            currentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id ?? "";

        await prisma.workspace.updateMany({
          where: { subscriptionId: subscription.id },
          data: {
            subscriptionStatus: subscription.status,
            stripePriceId: priceId,
            plan: priceIdToPlan(priceId),
            currentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.workspace.updateMany({
          where: { subscriptionId: subscription.id },
          data: {
            subscriptionStatus: subscription.status,
            stripePriceId: null,
            plan: WorkspacePlan.FREE,
            subscriptionId: null,
            currentPeriodEnd: null,
          },
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Stripe webhook handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
