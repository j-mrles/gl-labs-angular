"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    }
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen flex bg-[var(--bg-page)]">
      {/* Left side — image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80&fit=crop"
          alt="Beautiful home with green lawn"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/60" />
        <div className="absolute inset-0 bg-black/20" />
        {/* Overlay text */}
        <div className="absolute bottom-12 left-12 right-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-md">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-[var(--font-instrument-serif)] leading-tight">
              Find your next home
              <br />
              <span className="text-[var(--accent)]">with confidence.</span>
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-sm">
              AI-powered analysis on every listing. Know the true cost, spot red flags, and negotiate better.
            </p>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
        <div className="relative w-full max-w-md bg-white border border-[var(--border)] rounded-2xl shadow-[var(--shadow-lg)] p-8">
          <h1 className="font-[var(--font-instrument-serif)] text-3xl text-[var(--text-primary)] text-center mb-2">
            Welcome back
          </h1>
          <p className="text-[var(--text-secondary)] text-center mb-8 text-sm">
            Log in to your Red Otter account
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-2 bg-white border border-[var(--border)] rounded-lg py-3 px-4 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-warm)] transition-colors mb-4"
          >
            Continue with Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-[var(--text-muted)]">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white border border-[var(--border)] rounded-lg py-3 px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-colors" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white border border-[var(--border)] rounded-lg py-3 px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-colors" />
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                <span>✓</span> Login successful! Redirecting...
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                <span>✕</span> {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-[var(--accent)] text-white rounded-lg py-3 px-4 text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Don&apos;t have an account? <Link href="/signup" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">Start free trial</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
