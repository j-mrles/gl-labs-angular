import React from "react";
import { Card } from "@/components/ui/Card";

type ValueVerdict = "underpriced" | "fair" | "overpriced";

interface ValueAnalysisProps {
  valueSummary: string;
  valueVerdict: ValueVerdict;
  neighborhoodGrade: string;
  neighborhoodSummary: string;
}

const verdictConfig: Record<
  ValueVerdict,
  { label: string; bg: string; text: string; border: string }
> = {
  underpriced: {
    label: "Underpriced",
    bg: "bg-[var(--success-bg)]",
    text: "text-[var(--success)]",
    border: "border-[var(--success)]/30",
  },
  fair: {
    label: "Fair Value",
    bg: "bg-[var(--info-bg)]",
    text: "text-[var(--info)]",
    border: "border-[var(--info)]/30",
  },
  overpriced: {
    label: "Overpriced",
    bg: "bg-[var(--danger-bg)]",
    text: "text-[var(--danger)]",
    border: "border-[var(--danger)]/30",
  },
};

export function ValueAnalysis({
  valueSummary,
  valueVerdict,
  neighborhoodGrade,
  neighborhoodSummary,
}: ValueAnalysisProps) {
  const verdict = verdictConfig[valueVerdict];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Value Analysis
      </h2>

      <div className="space-y-4">
        {/* Verdict badge */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold border ${verdict.bg} ${verdict.text} ${verdict.border}`}
          >
            {verdict.label}
          </span>
        </div>

        {/* Value summary */}
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{valueSummary}</p>

        {/* Divider */}
        <hr className="border-[var(--border)]" />

        {/* Neighborhood */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Neighborhood Grade
            </span>
            <span className="text-xl font-bold text-[var(--text-primary)]">
              {neighborhoodGrade}
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {neighborhoodSummary}
          </p>
        </div>
      </div>
    </Card>
  );
}
