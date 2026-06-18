# Otis Chat Page — Design Spec

**Date:** 2026-06-14
**Status:** Approved

## Overview

Add a dedicated `/chat` page that gives users a full-screen, ChatGPT-style interface to talk with Otis. Otis has full portfolio context (all analyzed properties, saved properties, scores, verdicts) and the conversation persists across sessions. This replaces the OtisSidebar as the primary way to chat with Otis; the sidebar overlay remains on all other pages for quick access.

## Data

### New DB table: `otisChatMessages`

```ts
otisChatMessages = sqliteTable("otis_chat_messages", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:    text("user_id").notNull().references(() => users.id),
  role:      text("role", { enum: ["user", "assistant"] }).notNull(),
  content:   text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})
```

One flat thread per user. No `reportId` — Otis has full portfolio context in every message.

A new Drizzle migration is generated to create this table.

## API

### `GET /api/otis/history`
- Auth required
- Returns the user's `otisChatMessages` ordered by `createdAt` asc
- Response: `{ messages: { role, content }[] }`

### `POST /api/otis/messages`
- Auth required
- Body: `{ userMessage: string, assistantMessage: string }`
- Inserts both messages into `otisChatMessages` atomically
- Called client-side after the stream from `/api/otis` completes
- Response: `{ ok: true }`

### `DELETE /api/otis/history`
- Auth required
- Deletes all `otisChatMessages` rows for the user
- Response: `{ ok: true }`

### `POST /api/otis` (unchanged)
- Streaming endpoint already handles portfolio context
- No changes needed

## UI

### `/chat` page (`src/app/(dashboard)/chat/page.tsx`)
Server component. Fetches history from DB, passes it as `initialMessages` to `OtisChat`.

### `OtisChat` (`src/components/chat/OtisChat.tsx`)
Client component. Full-page layout within the dashboard shell.

**Layout:**
```
┌─────────────────────────────────────┐
│ Otis  • live               [Clear]  │  ← top bar
├─────────────────────────────────────┤
│                                     │
│  [avatar] Hey, I'm Otis...          │
│           [suggested prompt]        │  ← messages area (scrollable, flex-1)
│           [suggested prompt]        │
│                                     │
│                    [user message]   │
│  [avatar] Response text...          │
│                                     │
├─────────────────────────────────────┤
│  [ Ask Otis anything...      ] [→]  │  ← input bar (pinned bottom)
│    Enter to send · Shift+Enter newline
└─────────────────────────────────────┘
```

**Message rendering:**
- Otis messages: left-aligned, green avatar, `bg-[var(--bg-warm)]` bubble
- User messages: right-aligned, `bg-[#15803D] text-white` bubble
- Streaming: renders text as it arrives; ThinkingDots while awaiting first token
- `whitespace-pre-wrap` on all message content

**Empty state:**
- Otis greeting: "Hey — I'm Otis, your property intelligence assistant. I have full context on your portfolio and every property you've analyzed. What do you want to dig into?"
- 4 suggested prompts (same as OtisSidebar):
  - "Which of my saved properties is the best deal?"
  - "What red flags keep showing up across my portfolio?"
  - "Compare my top two properties"
  - "Which property should I walk away from?"

**Send flow:**
1. User submits message
2. Optimistically add user message to local state
3. POST to `/api/otis` with `{ message, history: last 10 messages }`
4. Stream response, rendering tokens as they arrive
5. On stream complete, fire-and-forget POST to `/api/otis/messages` to persist both messages
6. Add final assistant message to local state

**Clear history:**
- "Clear history" button in top bar
- Calls `DELETE /api/otis/history` (new endpoint)
- Clears local state and DB messages for this user

### `SidebarNav` changes
Add "Chat" nav item between Analyze and Reports:
```ts
{
  href: "/chat",
  label: "Chat",
  icon: <MessageSquare icon />
}
```

### `OtisSidebar` changes
Hide the floating button and panel when `pathname === "/chat"` (use `usePathname()`).

## Error handling
- If `/api/otis` returns non-ok or stream fails: show inline error message in chat ("Something went wrong. Try again.")
- Persistence failure (POST to `/api/otis/messages`) is silent — user already saw the response
- History load failure: show empty state, Otis still works for the session

## Out of scope (for now)
- Multiple conversation threads
- Property pinning / focused report context
- Chat export
- Message search
