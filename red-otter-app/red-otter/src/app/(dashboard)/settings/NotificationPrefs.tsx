"use client";

import { useEffect, useState } from "react";

interface Prefs {
  emailReportReady: boolean;
  emailWeeklyDigest: boolean;
  emailPriceAlerts: boolean;
}

const toggles: { key: keyof Prefs; label: string; description: string }[] = [
  {
    key: "emailReportReady",
    label: "Report ready",
    description: "Get notified when a property report finishes generating",
  },
  {
    key: "emailWeeklyDigest",
    label: "Weekly digest",
    description: "Receive a weekly summary of your saved properties",
  },
  {
    key: "emailPriceAlerts",
    label: "Price alerts",
    description: "Get notified when a saved property's price changes",
  },
];

export function NotificationPrefs() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings/notifications")
      .then((res) => res.json())
      .then((data) => {
        setPrefs(data);
        setStatus("idle");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Failed to load notification preferences");
      });
  }, []);

  async function handleToggle(key: keyof Prefs) {
    if (!prefs) return;

    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setStatus("saving");
    setMessage("");

    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: updated[key] }),
      });

      if (!res.ok) {
        // Revert on failure
        setPrefs(prefs);
        setStatus("error");
        setMessage("Failed to save preference");
        return;
      }

      const data = await res.json();
      setPrefs(data);
      setStatus("success");
      setMessage("Saved");

      // Clear success message after a moment
      setTimeout(() => {
        setStatus((s) => (s === "success" ? "idle" : s));
        setMessage((m) => (m === "Saved" ? "" : m));
      }, 2000);
    } catch {
      setPrefs(prefs);
      setStatus("error");
      setMessage("Something went wrong");
    }
  }

  if (status === "loading") {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 rounded-[var(--radius-lg)] bg-[var(--bg-warm)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!prefs && status === "error") {
    return (
      <p className="text-sm text-red-600">{message}</p>
    );
  }

  return (
    <div className="space-y-1">
      {toggles.map(({ key, label, description }) => (
        <label
          key={key}
          className="flex items-center justify-between gap-4 py-3 cursor-pointer group"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {label}
            </p>
            <p className="text-xs text-[var(--text-muted)]">{description}</p>
          </div>

          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={prefs?.[key] ?? false}
            onClick={() => handleToggle(key)}
            className={`
              relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2
              focus:ring-[var(--accent)] focus:ring-offset-2
              ${prefs?.[key] ? "bg-[var(--accent)]" : "bg-[var(--border-dark)]"}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-[var(--shadow-sm)]
                transform transition-transform duration-200 ease-in-out
                ${prefs?.[key] ? "translate-x-5" : "translate-x-0"}
              `}
            />
          </button>
        </label>
      ))}

      {message && (
        <p
          className={`text-xs pt-2 ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
