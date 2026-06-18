import React from "react";
import { Card } from "@/components/ui/Card";

interface NegotiationTipsProps {
  tips: string[];
}

export function NegotiationTips({ tips }: NegotiationTipsProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs"
          aria-hidden="true"
        >
          $
        </span>
        Negotiation Tips
      </h2>

      {tips.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] py-2">
          No specific negotiation tips available for this property.
        </p>
      ) : (
        <ol className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent)] text-white text-xs font-bold mt-0.5">
                {index + 1}
              </span>
              <span className="text-sm text-[var(--text-secondary)] leading-snug">{tip}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
