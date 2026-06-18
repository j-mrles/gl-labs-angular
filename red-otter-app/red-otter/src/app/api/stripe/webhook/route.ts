import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;

      if (userId && customerId) {
        await db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, userId));
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      const user = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId),
      });

      if (!user) break;

      const status = sub.status as
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid";

      // Map subscription status to user subscription status
      const userStatus =
        status === "trialing"
          ? "trialing"
          : status === "active"
            ? "active"
            : status === "past_due"
              ? "past_due"
              : status === "canceled"
                ? "canceled"
                : "none";

      await db
        .update(users)
        .set({ subscriptionStatus: userStatus as typeof users.$inferInsert.subscriptionStatus })
        .where(eq(users.id, user.id));

      const firstItem = sub.items.data[0];
      const periodStart =
        firstItem?.current_period_start != null
          ? new Date(firstItem.current_period_start * 1000)
          : null;
      const periodEnd =
        firstItem?.current_period_end != null
          ? new Date(firstItem.current_period_end * 1000)
          : null;

      const existing = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, sub.id),
      });

      if (existing) {
        await db
          .update(subscriptions)
          .set({
            status,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      } else {
        await db.insert(subscriptions).values({
          userId: user.id,
          stripeSubscriptionId: sub.id,
          plan: "monthly",
          status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      const user = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId),
      });

      if (!user) break;

      await db
        .update(users)
        .set({ subscriptionStatus: "canceled" })
        .where(eq(users.id, user.id));

      await db
        .update(subscriptions)
        .set({ status: "canceled" })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));

      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }

  return NextResponse.json({ received: true });
}
