"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface SaveButtonProps {
  reportId: string;
  initialSavedId: string | null;
}

export function SaveButton({ reportId, initialSavedId }: SaveButtonProps) {
  const [savedId, setSavedId] = useState<string | null>(initialSavedId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    setError(null);

    try {
      if (savedId) {
        // Unsave
        const res = await fetch(`/api/saved/${savedId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? "Failed to unsave.");
          return;
        }
        setSavedId(null);
      } else {
        // Save
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? "Failed to save.");
          return;
        }
        const data = (await res.json()) as { id: string };
        setSavedId(data.id);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={savedId ? "secondary" : "primary"}
        size="sm"
        onClick={handleToggle}
        disabled={loading}
        className={
          savedId
            ? "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-light)]"
            : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white"
        }
      >
        {loading ? "..." : savedId ? "Saved" : "Save Property"}
      </Button>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
