import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

/**
 * @deprecated Use getStripe() instead to avoid module-level initialization errors during build.
 * Kept for backward compatibility — accessing this will throw if STRIPE_SECRET_KEY is not set.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});
