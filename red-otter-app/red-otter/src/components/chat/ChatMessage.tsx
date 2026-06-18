import React from "react";

interface ChatMessageProps {
  role: "user" | "otis";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl bg-[var(--accent)] px-4 py-2 text-white">
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[75%]">
        <p className="mb-1 text-xs font-semibold text-[var(--text-muted)]">Otis</p>
        <div className="rounded-2xl bg-[var(--bg-warm)] px-4 py-2">
          <p className="whitespace-pre-wrap text-sm text-[var(--text-primary)]">{content}</p>
        </div>
      </div>
    </div>
  );
}
