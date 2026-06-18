import React from "react";
import Link from "next/link";

interface SavedPropertyCardProps {
  reportId: string;
  address: string;
  price: number | null;
  otisScore: number | null;
  savedAt: Date;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-[var(--success)]";
  if (score >= 50) return "text-[var(--warning)]";
  return "text-[var(--danger)]";
}

export function SavedPropertyCard({
  reportId,
  address,
  price,
  otisScore,
  savedAt,
}: SavedPropertyCardProps) {
  return (
    <Link href={`/report/${reportId}`} className="block group">
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)]">
        {/* Address */}
        <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug line-clamp-2 mb-3">
          {address}
        </h3>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-0.5">Price</p>
            <p className="text-base font-bold text-[var(--text-primary)]">
              {price !== null ? formatPrice(price) : "—"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)] mb-0.5">Otis Score</p>
            <p
              className={`text-base font-bold ${
                otisScore !== null ? scoreColor(otisScore) : "text-[var(--text-muted)]"
              }`}
            >
              {otisScore !== null ? `${otisScore}/100` : "—"}
            </p>
          </div>
        </div>

        {/* Saved date */}
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Saved {formatDate(savedAt)}
        </p>
      </div>
    </Link>
  );
}
