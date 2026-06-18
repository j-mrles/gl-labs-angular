import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-[var(--bg-page)]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-bold text-[var(--text-primary)] font-[var(--font-instrument-serif)] tracking-wide"
          >
            Red Otter
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
            <Link
              href="#features"
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <main className="flex-1">
        <Hero />
        <Features />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}
