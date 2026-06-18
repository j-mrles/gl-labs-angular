"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "Which of my saved properties is the best deal?",
  "What red flags keep showing up across my portfolio?",
  "Compare my top two properties",
  "Which property should I walk away from?",
];

function OtisAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#15803D] flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

interface OtisChatProps {
  initialMessages: Message[];
}

export function OtisChat({ initialMessages }: OtisChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, streaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function send(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setStreamingContent("");

    let full = "";

    try {
      const res = await fetch("/api/otis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: newMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong. Try again." },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamingContent(full);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      setStreamingContent("");

      // Persist both messages (fire-and-forget)
      fetch("/api/otis/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: text.trim(), assistantMessage: full }),
      }).catch(() => {
        // Persistence failure is silent
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  async function clearHistory() {
    await fetch("/api/otis/history", { method: "DELETE" });
    setMessages([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const hasMessages = messages.length > 0 || streaming;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-card)] shrink-0">
        <OtisAvatar />
        <div>
          <p className="text-[var(--text-primary)] text-sm font-semibold leading-none">Otis</p>
          <p className="text-[var(--text-muted)] text-[11px] mt-0.5">Portfolio Intelligence</p>
        </div>
        <div className="flex items-center gap-1.5 ml-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[var(--text-muted)] text-[11px]">live</span>
        </div>
        {hasMessages && (
          <button
            onClick={clearHistory}
            className="ml-auto text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Clear history
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {!hasMessages ? (
            <div className="space-y-6">
              <div className="flex gap-3">
                <OtisAvatar />
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">Otis</p>
                  <div className="bg-[var(--bg-warm)] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[var(--text-primary)] leading-relaxed max-w-xl">
                    Hey — I&apos;m Otis, your property intelligence assistant. I have full context on your portfolio and every property you&apos;ve analyzed. What do you want to dig into?
                  </div>
                </div>
              </div>
              <div className="ml-11">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-3">
                  Suggested
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-sm text-[var(--text-secondary)] bg-[var(--bg-warm)] hover:bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl px-4 py-3 transition-colors leading-snug"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "assistant" && <OtisAvatar />}
                  <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">Otis</p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-[#15803D] text-white rounded-tr-sm"
                          : "bg-[var(--bg-warm)] text-[var(--text-primary)] rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {streaming && (
                <div className="flex gap-3">
                  <OtisAvatar />
                  <div className="max-w-[75%]">
                    <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">Otis</p>
                    <div className="bg-[var(--bg-warm)] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[var(--text-primary)] leading-relaxed">
                      {streamingContent ? (
                        <span className="whitespace-pre-wrap">{streamingContent}</span>
                      ) : (
                        <ThinkingDots />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-card)] px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-[var(--bg-warm)] border border-[var(--border)] rounded-2xl px-4 py-3 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Otis anything about your portfolio…"
              rows={1}
              disabled={streaming}
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none outline-none min-h-[22px] max-h-[160px] overflow-y-auto disabled:opacity-50"
              style={{ lineHeight: "1.5" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="shrink-0 w-8 h-8 rounded-xl bg-[#15803D] hover:bg-[#166534] disabled:opacity-40 flex items-center justify-center transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
