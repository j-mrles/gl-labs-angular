import Link from "next/link";
import { Button } from "@/components/ui/Button";

const includedFeatures = [
  "Otis Score on every listing",
  "True Cost Calculator",
  "Red Flag Detection",
  "Unlimited chat with Otis",
  "Save & Compare up to 50 listings",
  "Negotiation Tips",
  "Email summaries",
  "Cancel anytime",
];

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-28 bg-[var(--bg-warm)]">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] font-[var(--font-instrument-serif)] animate-fade-in-up">
          Simple pricing
        </h2>
        <p className="mt-4 text-lg text-[var(--text-secondary)] animate-fade-in-up delay-1">
          Smarter than Zillow. Less than a pizza.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-[var(--shadow-lg)] animate-fade-in-up delay-2">
        <div className="p-8">
          <div className="flex items-baseline gap-x-2">
            <span className="text-5xl font-bold tracking-tight text-[var(--text-primary)]">
              $24
            </span>
            <span className="text-base text-[var(--text-secondary)]">/mo</span>
          </div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            After your 14-day free trial
          </p>

          <ul className="mt-8 space-y-3">
            {includedFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
              >
                <span className="flex-shrink-0 text-[var(--accent)] font-bold">
                  &#10003;
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Link href="/signup" className="block">
              <Button size="lg" variant="primary" className="w-full">
                Start 14-Day Free Trial
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            Credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
