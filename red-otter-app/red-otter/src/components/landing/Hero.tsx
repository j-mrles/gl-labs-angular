import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Full-bleed background image */}
      <Image
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80&fit=crop"
        alt="Modern home exterior at dusk"
        fill
        className="object-cover"
        priority
      />
      {/* Warm dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent-light)] mb-6 animate-fade-in-up">
          Smart Home Buying
        </p>

        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl font-[var(--font-instrument-serif)] animate-fade-in-up delay-1">
          Stop guessing.{" "}
          <span className="text-white">Start knowing.</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl leading-8 text-white/80 animate-fade-in-up delay-2">
          Otis analyzes any real estate listing in seconds — uncovering true
          costs, red flags, and negotiation leverage that Zillow never shows you.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up delay-3">
          <Link href="/signup">
            <Button size="lg" variant="primary">
              Start Free Trial
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="secondary">
              See How It Works
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/50 animate-fade-in-up delay-4">
          14-day free trial &middot; $24/mo after &middot; Cancel anytime
        </p>
      </div>

      {/* Floating score badges */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3 animate-fade-in-up delay-5">
        {[
          { score: 87, label: "Strong Buy", color: "bg-[var(--success)]" },
          { score: 52, label: "Caution", color: "bg-[var(--warning)]" },
          { score: 23, label: "High Risk", color: "bg-[var(--danger)]" },
        ].map((item) => (
          <div
            key={item.score}
            className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-[var(--border)] rounded-full px-4 py-2 shadow-[var(--shadow-md)]"
          >
            <span className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center text-xs font-bold text-white`}>
              {item.score}
            </span>
            <span className="text-xs font-medium text-[var(--text-secondary)]">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
