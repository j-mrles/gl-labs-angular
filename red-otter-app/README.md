# Red Otter

AI-powered real estate analysis platform. Paste a property listing URL, and **Otis** (our AI assistant) generates a detailed report — including an Otis Score, value analysis, cost breakdown, red flags, and negotiation tips. Chat with Otis for follow-up questions about any property.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** SQLite via better-sqlite3 + Drizzle ORM
- **Auth:** NextAuth v5 (credentials + Google OAuth)
- **AI:** Anthropic Claude API
- **Payments:** Stripe (subscriptions + billing portal)
- **Testing:** Vitest

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
cd red-otter
npm install
```

Copy the example env file and fill in your keys:

```bash
cp .env.local.example .env.local
```

Required environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path (default: `file:./data/red-otter.db`) |
| `NEXTAUTH_SECRET` | Random secret for session signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` for local dev) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
| `ANTHROPIC_API_KEY` | Claude API key for Otis analysis |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Stripe subscription price ID |

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Run tests (Vitest)
npm run test:watch # Watch mode
```

## Project Structure

```
red-otter/src/
├── app/
│   ├── (auth)/           # Login & signup pages
│   ├── (dashboard)/      # Authenticated pages
│   │   ├── analyze/      # Submit a listing URL for analysis
│   │   ├── compare/      # Side-by-side property comparison
│   │   ├── dashboard/    # User home — saved properties & activity
│   │   ├── report/[id]/  # Full Otis report for a property
│   │   └── settings/     # Profile, password, billing, notifications
│   ├── (admin)/          # Admin panel (user/report/subscription mgmt)
│   └── api/              # API routes
│       ├── analyze/      # Property analysis endpoint
│       ├── chat/         # Otis chat endpoint
│       ├── reports/      # CRUD for reports
│       ├── saved/        # Saved properties
│       ├── settings/     # User settings
│       ├── admin/        # Admin endpoints
│       └── stripe/       # Checkout, portal, webhooks
├── components/
│   ├── chat/             # ChatPanel, ChatMessage, ChatInput
│   ├── dashboard/        # SavedPropertyCard, ComparisonTable
│   ├── landing/          # Hero, Features, Pricing, Footer
│   ├── report/           # OtisScore, ValueAnalysis, CostBreakdown, etc.
│   └── ui/               # Button, Card, Input, Spinner
└── lib/
    ├── auth/             # NextAuth config & helpers
    ├── db/               # Drizzle schema, migrations, seeds
    ├── email/            # Email sending
    ├── finance/          # Mortgage & cost calculations
    ├── otis/             # AI analysis & chat (prompts, guardrails)
    ├── scraper/          # Property data scraping (Zillow, Redfin, Realtor)
    └── stripe/           # Stripe client & helpers
```

## Key Features

- **Property Analysis** — Scrapes listing data and generates AI-powered reports
- **Otis Score** — 0–100 rating based on value, risk, and market context
- **Chat with Otis** — Ask follow-up questions about any analyzed property
- **Save & Compare** — Bookmark properties and compare them side by side
- **Price Alerts** — Get notified when saved property prices change
- **Subscription Billing** — Free trial, then Stripe-managed subscriptions
- **Admin Panel** — Manage users, reports, and subscriptions
