"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";

interface Message {
  role: "user" | "otis";
  content: string;
}

interface ChatPanelProps {
  reportId: string;
  initialMessages: Message[];
}

export function ChatPanel({ reportId, initialMessages }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text: string) {
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, message: text }),
      });

      const data = await res.json() as { reply?: string; error?: string };
      const reply = data.reply ?? "Sorry, I couldn't process that.";
      setMessages((prev) => [...prev, { role: "otis", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "otis", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card padding="none" className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !loading ? (
          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Ask Otis anything about this property.
          </p>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[75%]">
              <p className="mb-1 text-xs font-semibold text-[var(--text-muted)]">Otis</p>
              <div className="rounded-2xl bg-[var(--bg-warm)] px-4 py-2">
                <p className="text-sm text-[var(--text-muted)] italic">Otis is thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-[var(--border)] p-4">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </Card>
  );
}
