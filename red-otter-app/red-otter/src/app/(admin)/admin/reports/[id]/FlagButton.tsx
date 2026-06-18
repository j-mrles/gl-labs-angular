"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FlagButton({
  reportId,
  initialFlagged,
}: {
  reportId: string;
  initialFlagged: boolean;
}) {
  const [flagged, setFlagged] = useState(initialFlagged);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagged: !flagged }),
      });

      if (res.ok) {
        setFlagged(!flagged);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`shrink-0 px-4 py-2 rounded-[var(--radius-lg)] text-sm font-medium transition-colors disabled:opacity-50 ${
        flagged
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-warm)]"
      }`}
    >
      {loading ? "Updating..." : flagged ? "Unflag Report" : "Flag Report"}
    </button>
  );
}
