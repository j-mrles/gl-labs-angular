export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-warm)] px-6 py-8">
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <span className="text-sm font-semibold text-[var(--text-primary)] font-[var(--font-instrument-serif)]">
          Red Otter
        </span>
        <p className="text-sm text-[var(--text-muted)]">
          &copy; {year} Red Otter. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
