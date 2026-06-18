import React from "react";
import { Card } from "@/components/ui/Card";

interface RedFlagsProps {
  redFlags: string[];
}

export function RedFlags({ redFlags }: RedFlagsProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--danger-bg)] text-[var(--danger)]"
          aria-hidden="true"
        >
          !
        </span>
        Red Flags
      </h2>

      {redFlags.length === 0 ? (
        <div className="flex items-center gap-2 py-3 px-4 bg-[var(--success-bg)] rounded-lg">
          <svg
            className="w-5 h-5 text-[var(--success)] flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-sm text-[var(--success)] font-medium">
            No significant red flags detected.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {redFlags.map((flag, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-[var(--danger-bg)] border border-[var(--danger)]/20"
            >
              <svg
                className="w-5 h-5 text-[var(--danger)] flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
              <span className="text-sm text-[var(--danger)] leading-snug">{flag}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
