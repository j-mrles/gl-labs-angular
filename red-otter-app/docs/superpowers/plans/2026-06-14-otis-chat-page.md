# Otis Chat Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen, ChatGPT-style `/chat` page where users can have a persistent conversation with Otis, who has full portfolio context.

**Architecture:** New `otis_chat_messages` DB table stores a single flat conversation thread per user. Two new API routes handle reading/deleting history and persisting message pairs. The page is a server component that hydrates a client `OtisChat` component with initial messages; streaming uses the existing `/api/otis` endpoint unchanged.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM + SQLite (better-sqlite3), TypeScript, Tailwind CSS v4

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/db/schema.ts` | Modify | Add `otisChatMessages` table |
| `drizzle/migrations/0001_otis_chat_messages.sql` | Create (generated) | Migration SQL |
| `drizzle/migrations/meta/_journal.json` | Modify (generated) | Migration journal |
| `src/app/api/otis/history/route.ts` | Create | `GET` + `DELETE` history |
| `src/app/api/otis/messages/route.ts` | Create | `POST` persist message pair |
| `src/app/(dashboard)/chat/page.tsx` | Create | Server page, loads history |
| `src/components/chat/OtisChat.tsx` | Create | Full-page client chat UI |
| `src/components/dashboard/SidebarNav.tsx` | Modify | Add Chat nav item |
| `src/components/dashboard/OtisSidebar.tsx` | Modify | Hide on `/chat` |

---

## Task 1: Add otisChatMessages to DB schema and migrate

**Files:**
- Modify: `src/lib/db/schema.ts`
- Create (auto-generated): `drizzle/migrations/0001_otis_chat_messages.sql`

- [ ] **Step 1: Add table to schema**

Open `src/lib/db/schema.ts` and append this export at the end of the file (after the `notificationPrefs` table):

```ts
export const otisChatMessages = sqliteTable("otis_chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
```

- [ ] **Step 2: Generate migration**

```bash
cd red-otter && npx drizzle-kit generate
```

Expected output: something like `Generated 1 migration file` and a new file `drizzle/migrations/0001_*.sql`.

- [ ] **Step 3: Apply migration**

```bash
npx tsx src/lib/db/migrate.ts
```

Expected output: `Migrations complete.`

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts drizzle/
git commit -m "feat: add otis_chat_messages table"
```

---

## Task 2: GET and DELETE /api/otis/history

**Files:**
- Create: `src/app/api/otis/history/route.ts`

- [ ] **Step 1: Create the route file**

Create `src/app/api/otis/history/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, otisChatMessages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

async function getUser(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUser(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const messages = await db.query.otisChatMessages.findMany({
    where: eq(otisChatMessages.userId, user.id),
    orderBy: [asc(otisChatMessages.createdAt)],
  });

  return NextResponse.json({
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
}

export async function DELETE(_req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUser(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await db.delete(otisChatMessages).where(eq(otisChatMessages.userId, user.id));

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Verify the route compiles**

```bash
cd red-otter && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/otis/history/route.ts
git commit -m "feat: add GET/DELETE /api/otis/history"
```

---

## Task 3: POST /api/otis/messages

**Files:**
- Create: `src/app/api/otis/messages/route.ts`

- [ ] **Step 1: Create the route file**

Create `src/app/api/otis/messages/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, otisChatMessages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userMessage, assistantMessage } = body as {
    userMessage?: string;
    assistantMessage?: string;
  };

  if (!userMessage || !assistantMessage) {
    return NextResponse.json(
      { error: "userMessage and assistantMessage are required" },
      { status: 400 }
    );
  }

  await db.insert(otisChatMessages).values([
    { userId: user.id, role: "user", content: userMessage },
    { userId: user.id, role: "assistant", content: assistantMessage },
  ]);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/otis/messages/route.ts
git commit -m "feat: add POST /api/otis/messages"
```

---

## Task 4: OtisChat client component

**Files:**
- Create: `src/components/chat/OtisChat.tsx`

This is the full-page ChatGPT-style UI. It receives `initialMessages` from the server, streams from `/api/otis`, and persists via `/api/otis/messages` after each stream.

- [ ] **Step 1: Create the component**

Create `src/components/chat/OtisChat.tsx`:

```tsx
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

      const assistantMsg: Message = { role: "assistant", content: full };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");

      // Persist both messages (fire-and-forget)
      fetch("/api/otis/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: text.trim(), assistantMessage: full }),
      }).catch(() => {
        // Persistence failure is silent — user already has the response
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
              {/* Greeting */}
              <div className="flex gap-3">
                <OtisAvatar />
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">Otis</p>
                  <div className="bg-[var(--bg-warm)] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[var(--text-primary)] leading-relaxed max-w-xl">
                    Hey — I&apos;m Otis, your property intelligence assistant. I have full context on your portfolio and every property you&apos;ve analyzed. What do you want to dig into?
                  </div>
                </div>
              </div>

              {/* Suggested prompts */}
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
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/OtisChat.tsx
git commit -m "feat: add OtisChat full-page component"
```

---

## Task 5: /chat server page

**Files:**
- Create: `src/app/(dashboard)/chat/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/(dashboard)/chat/page.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, otisChatMessages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { OtisChat } from "@/components/chat/OtisChat";

export default async function ChatPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user?.email ?? ""),
  });

  if (!user) redirect("/login");

  const dbMessages = await db.query.otisChatMessages.findMany({
    where: eq(otisChatMessages.userId, user.id),
    orderBy: [asc(otisChatMessages.createdAt)],
  });

  const initialMessages = dbMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <OtisChat initialMessages={initialMessages} />
    </div>
  );
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Smoke test in browser**

Start dev server (`npm run dev`) and visit `http://localhost:3000/chat`. You should see:
- Otis greeting message
- 4 suggested prompts in a 2-column grid
- Input bar pinned to bottom

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/chat/page.tsx
git commit -m "feat: add /chat page"
```

---

## Task 6: SidebarNav — add Chat link

**Files:**
- Modify: `src/components/dashboard/SidebarNav.tsx`

- [ ] **Step 1: Add Chat to navItems**

In `src/components/dashboard/SidebarNav.tsx`, find the `navItems` array. Add a Chat entry between Analyze and Reports:

```ts
{
  href: "/chat",
  label: "Chat",
  icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
},
```

The full updated `navItems` array (replace the existing one):

```ts
const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/analyze",
    label: "Analyze",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Reports",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: "/compare",
    label: "Compare",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/SidebarNav.tsx
git commit -m "feat: add Chat link to sidebar nav"
```

---

## Task 7: OtisSidebar — hide on /chat

**Files:**
- Modify: `src/components/dashboard/OtisSidebar.tsx`

- [ ] **Step 1: Add pathname check**

`OtisSidebar` is already a client component (`"use client"`). Add `usePathname` to hide the entire component on `/chat`.

At the top of the component body (inside `export function OtisSidebar()`), add:

```ts
const pathname = usePathname();
if (pathname === "/chat") return null;
```

The import is already available since the file is a client component — add it to the existing next/navigation import if not present. The full updated imports at the top of `OtisSidebar.tsx`:

```ts
"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
```

And at the very start of the `OtisSidebar` function body (before any state declarations):

```ts
export function OtisSidebar() {
  const pathname = usePathname();
  if (pathname === "/chat") return null;

  const [open, setOpen] = useState(false);
  // ... rest of the component unchanged
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: End-to-end smoke test**

With dev server running:
1. Visit `/chat` — confirm the "Ask Otis" floating button is gone
2. Navigate to `/dashboard` — confirm the floating button reappears
3. On `/chat`, send a message — confirm streaming works and Otis responds
4. Refresh the page — confirm the message history is still there
5. Click "Clear history" — confirm messages disappear and the greeting returns

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/OtisSidebar.tsx
git commit -m "feat: hide OtisSidebar on /chat page"
```
