"use client";

import { useState } from "react";

export function BillingSection({ hasStripeCustomer }: { hasStripeCustomer: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/billing", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Could not open billing portal");
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!hasStripeCustomer) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        No billing information on file. Subscribe to a plan to manage billing.
      </p>
    );
  }

  return (
    <button
      onClick={handleManageBilling}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium rounded-[var(--radius-lg)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors disabled:opacity-50"
    >
      {loading ? "Opening..." : "Manage Billing"}
    </button>
  );
}
