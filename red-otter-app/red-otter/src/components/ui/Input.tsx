import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          "w-full rounded-lg border px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]",
          error
            ? "border-[var(--danger)] bg-[var(--danger-bg)] focus:ring-[var(--danger)]/30 focus:border-[var(--danger)]"
            : "border-[var(--border)] bg-white hover:border-[var(--border-dark)]",
          props.disabled ? "opacity-50 cursor-not-allowed" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
      )}
    </div>
  );
}
