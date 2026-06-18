import React from "react";
import { Card } from "@/components/ui/Card";

interface OtisScoreProps {
  score: number;
}

function getScoreColor(score: number): {
  ring: string;
  text: string;
  label: string;
  bg: string;
} {
  if (score >= 70) {
    return {
      ring: "stroke-[var(--success)]",
      text: "text-[var(--success)]",
      label: "Strong Buy",
      bg: "bg-[var(--success-bg)]",
    };
  }
  if (score >= 40) {
    return {
      ring: "stroke-[var(--warning)]",
      text: "text-[var(--warning)]",
      label: "Proceed With Caution",
      bg: "bg-[var(--warning-bg)]",
    };
  }
  return {
    ring: "stroke-[var(--danger)]",
    text: "text-[var(--danger)]",
    label: "High Risk",
    bg: "bg-[var(--danger-bg)]",
  };
}

export function OtisScore({ score }: OtisScoreProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const colors = getScoreColor(clamped);

  // SVG circle math
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Otis Score</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            {/* Background track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#E5E5E2"
              strokeWidth="12"
            />
            {/* Score arc */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={colors.ring}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          {/* Score number in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${colors.text}`}>
              {clamped}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">/ 100</span>
          </div>
        </div>

        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
          {colors.label}
        </div>

        <div className="w-full flex justify-between text-xs text-[var(--text-muted)] px-1">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--danger)]" />
            0-39 High Risk
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--warning)]" />
            40-69 Caution
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--success)]" />
            70-100 Strong
          </span>
        </div>
      </div>
    </Card>
  );
}
