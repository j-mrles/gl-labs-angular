# Otis (formerly Red Otter)

AI-powered real estate analysis platform. Users paste listing URLs, Otis analyzes them (scraping, financial modeling, AI analysis) and provides scores, cost breakdowns, red flags, negotiation tips.

## Tech Stack
- Next.js 16 (App Router)
- SQLite + Drizzle ORM
- NextAuth v5 (credentials + Google)
- Anthropic Claude API (analysis + chat)
- Stripe (subscriptions)
- Tailwind CSS v4

## Current State
- Landing page, auth, dashboard, analyze, report, compare pages
- API routes for analyze, chat, reports, saved properties
- Stripe checkout/portal/webhook
- Web scrapers for Zillow, Redfin, Realtor.com
