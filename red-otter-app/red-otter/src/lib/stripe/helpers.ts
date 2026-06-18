import { stripe } from "./client";

const PRICE_ID = process.env.STRIPE_PRICE_ID!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createCheckoutSession(
  userId: string,
  email: string,
  customerId?: string | null,
): Promise<string> {
  const params: import("stripe").Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: PRICE_ID,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        userId,
      },
    },
    metadata: {
      userId,
    },
    success_url: `${APP_URL}/dashboard?checkout=success`,
    cancel_url: `${APP_URL}/pricing?checkout=canceled`,
  };

  if (customerId) {
    params.customer = customerId;
  } else {
    params.customer_email = email;
  }

  const session = await stripe.checkout.sessions.create(params);
  return session.url!;
}

export async function createBillingPortalSession(
  customerId: string,
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/dashboard`,
  });
  return session.url;
}
