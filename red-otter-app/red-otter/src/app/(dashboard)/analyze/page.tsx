"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Card } from "@/components/ui/Card";

export default function AnalyzePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a listing URL.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = (await res.json()) as { reportId?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (!data.reportId) {
        setError("No report ID returned. Please try again.");
        return;
      }

      router.push(`/report/${data.reportId}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-[var(--font-instrument-serif)] font-bold text-[var(--text-primary)]">Analyze a Property</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Paste a Zillow, Redfin, or Realtor.com listing URL and Otis will
          evaluate it for you.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url-input"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            >
              Listing URL
            </label>
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.zillow.com/homedetails/..."
              disabled={loading}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent disabled:bg-[var(--bg-muted)] disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--danger)] bg-[var(--danger-bg)] border border-[var(--danger)]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Otis is analyzing...
              </span>
            ) : (
              "Analyze Property"
            )}
          </Button>
        </form>
      </Card>

      <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
        Analysis typically takes 20–40 seconds.
      </p>
    </div>
  );
}
