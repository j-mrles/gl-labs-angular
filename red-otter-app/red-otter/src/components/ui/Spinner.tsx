import React from "react";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
};

export function Spinner({ size = "md", className = "", label }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={["flex items-center justify-center", className].join(" ")}
    >
      <div
        className={[
          "rounded-full border-[var(--border)] border-t-[var(--accent)] animate-spin",
          sizeClasses[size],
        ].join(" ")}
      />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
