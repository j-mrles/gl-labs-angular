"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

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
    <div className="w-6 h-6 rounded-full bg-[#15803D] flex items-center justify-center shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function OtisSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, streaming]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setStreamingContent("");

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
        setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Try again." }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamingContent(full);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      setStreamingContent("");
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const hasMessages = messages.length > 0 || streaming;

  if (pathname === "/chat") return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-sm font-semibold transition-all duration-200 ${
          open
            ? "bg-[#1B1B18] text-white"
            : "bg-[#15803D] text-white hover:bg-[#166534]"
        }`}
      >
        {open ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Close Otis
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Ask Otis
          </>
        )}
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-0 right-0 z-40 flex flex-col bg-white border-l border-t border-[var(--border)] shadow-2xl transition-all duration-300 ease-in-out ${
          open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{ width: 380, height: "calc(100vh - 64px)", top: 64 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] bg-[#1B1B18]">
          <OtisAvatar />
          <div>
            <p className="text-white text-[13px] font-semibold leading-none">Otis</p>
            <p className="text-white/40 text-[10px] mt-0.5">Portfolio Intelligence · Always on</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-white/40 text-[10px]">live</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {!hasMessages ? (
            <div className="space-y-4">
              <div className="flex gap-2.5">
                <OtisAvatar />
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Otis</p>
                  <div className="bg-[var(--bg-warm)] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-primary)] leading-relaxed">
                    Hey — I&apos;m Otis, your property intelligence assistant. I have full context on your portfolio and every property you&apos;ve analyzed. What do you want to dig into?
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-2 ml-8">
                  Suggested
                </p>
                <div className="ml-8 space-y-1.5">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left text-xs text-[var(--text-secondary)] bg-[var(--bg-warm)] hover:bg-[var(--bg-muted)] border border-[var(--border)] rounded-lg px-3 py-2 transition-colors"
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
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" && <OtisAvatar />}
                  <div className={`max-w-[82%] ${msg.role === "user" ? "items-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Otis</p>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
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
                <div className="flex gap-2.5">
                  <OtisAvatar />
                  <div className="max-w-[82%]">
                    <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Otis</p>
                    <div className="bg-[var(--bg-warm)] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-primary)] leading-relaxed">
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

        {/* Input */}
        <div className="border-t border-[var(--border)] p-3 bg-white">
          <div className="flex items-end gap-2 bg-[var(--bg-warm)] border border-[var(--border)] rounded-xl px-3 py-2 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your portfolio…"
              rows={1}
              disabled={streaming}
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none outline-none min-h-[20px] max-h-[120px] overflow-y-auto disabled:opacity-50"
              style={{ lineHeight: "1.4" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="shrink-0 w-7 h-7 rounded-lg bg-[#15803D] hover:bg-[#166534] disabled:opacity-40 flex items-center justify-center transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
