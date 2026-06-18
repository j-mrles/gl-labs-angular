# Red Otter (redotter.ai) — AI Buyer's Advisor

## Overview

Red Otter is a subscription-based web application that helps home buyers make smarter purchasing decisions. Users paste a property listing URL and receive an AI-generated Property Report Card with a comprehensive analysis. A conversational AI assistant named **Otis** powers the analysis and answers follow-up questions.

**Domain:** redotter.ai
**AI Assistant:** Otis
**Target:** All home buyers (first-time, move-up, relocating)
**Price:** $24/mo after 14-day free trial (credit card required)

## Core User Flow

1. **Landing & Sign Up** — User hits redotter.ai, sees value prop, signs up (email/password or Google OAuth). 14-day free trial starts, credit card required upfront. Cancel anytime before trial ends, no charge.

2. **Analyze a Listing** — User pastes a Zillow/Redfin/Realtor.com URL. Otis scrapes the listing and generates a Property Report Card:
   - **Otis Score** (1-100) — overall buy recommendation
   - **Value Analysis** — priced fairly vs. comps?
   - **Neighborhood Grade** — schools, safety, walkability, growth trends
   - **True Cost Breakdown** — mortgage, taxes, insurance, HOA, maintenance, utilities
   - **Red Flags** — days on market, price drops, flood zone, foundation issues, etc.
   - **Negotiation Tips** — based on market conditions and listing signals
   - **Otis's Take** — plain-English summary and recommendation

3. **Chat with Otis** — Below the report, a chat panel for follow-up questions. Otis has full context of the report and can answer intelligently about payments, comparisons, investment potential, etc.

4. **Save & Compare** — Save properties to a dashboard. Side-by-side comparison (up to 3 properties). Price change alerts on saved listings (v2).

5. **Subscription Gate** — Free trial: 14 days, up to 10 reports. Paid ($24/mo): unlimited reports, saved properties, full chat history, priority analysis speed.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Next.js    │────▶│   API Layer  │────▶│  Claude API     │
│  Frontend    │     │  (Next.js    │     │  (Analysis +    │
│  (React)     │◀────│   Routes)    │◀────│   Chat)         │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                    ┌──────┴───────┐
                    │              │
              ┌─────▼─────┐ ┌─────▼──────┐
              │  SQLite    │ │  Scraping   │
              │ (Users,    │ │  Service    │
              │  Reports,  │ │  (Listing   │
              │  Saved     │ │   URLs)     │
              │  Props)    │ └────────────┘
              └───────────┘
```

- **Next.js (App Router)** — frontend + API routes. Server components for fast loads, client components for chat/interactivity.
- **SQLite** — local database via Drizzle ORM. Clean migration path to Postgres when needed.
- **Scraping Service** — extracts structured property data from listing URLs. Cheerio or Puppeteer depending on the site.
- **Claude API** — powers report generation (structured analysis) and chat (conversational follow-ups with report context).
- **Stripe** — subscription billing, trial management, webhooks.
- **Auth** — NextAuth.js with email/password + Google OAuth.

## Data Model

### users
- id, email, password_hash, name, google_id, subscription_status, trial_ends_at, stripe_customer_id, created_at

### reports
- id, user_id, listing_url, property_address, raw_scraped_data (JSON), otis_score, analysis (JSON — value, neighborhood, costs, red_flags, negotiation, otis_take), created_at

### saved_properties
- id, user_id, report_id, notes, price_at_save, current_price, alert_enabled, created_at

### chat_messages
- id, user_id, report_id, role (user/otis), content, created_at

### subscriptions
- id, user_id, stripe_subscription_id, plan, status, current_period_start, current_period_end

## Scraping Strategy

**Supported sites:** Zillow, Redfin, Realtor.com. Scrape meta tags + structured data (JSON-LD) from the page. Fallback: extract what we can from meta tags + use Claude to parse raw page content into structured data.

**Extracted fields:** Address, price, beds, baths, sqft, lot size, year built, property type, HOA fees, tax history, description, listing agent, days on market, price change history, photo URLs.

**Caching:** Cache scraped data per URL for 24 hours. Store raw scraped data in the report so re-analysis and chat follow-ups don't require re-scraping.

**Enrichment (post-MVP):** Census data, school ratings, Walk Score, crime stats, nearby permit activity.

## Otis — AI Personality & Prompting

**Character:** Knowledgeable but approachable. Direct and honest — will say "this is overpriced" or "I'd walk away." Never salesy — works for the buyer. Explains jargon in plain English.

**Report generation:** System prompt defines personality + analysis framework. Scraped data injected as structured context. Claude returns structured JSON matching the report card format. Deterministic sections (mortgage math, tax estimates) calculated in code, not AI.

**Chat:** System prompt with Otis personality + full report as context. Conversation history maintained per report.

**Guardrails:**
- **Topic fencing** — Otis only responds to real estate, home buying, property analysis, mortgages, neighborhoods, and related financial questions.
- **Off-topic deflection** — politely redirects: "I'm built to help you find the right home — want to analyze a listing?"
- **Prompt injection protection** — ignores attempts to override system prompt, role-play, or extract instructions.
- **No personal opinions on non-real-estate topics** — politics, religion, etc. get a firm but friendly decline.
- **Abuse detection** — repeated off-topic or malicious attempts get flagged, not engaged with.
- **Legal disclaimer** — "Otis is an AI assistant. Always consult with a licensed real estate professional." on every report.
- **No legal or financial advice** — frames everything as "analysis" and "things to consider."

## Subscription & Billing

**Trial:** 14 days, credit card required. Up to 10 reports. Full feature access. Cancel anytime before trial ends, no charge.

**Paid ($24/mo):** Unlimited reports, saved properties, full chat history, priority analysis speed.

**Billing flow:** Stripe Checkout for payment. Webhooks update subscription status in real-time. 3-day grace period past due before access restricted. Cancelled users keep read access to existing reports, no new reports.

**Future:** Annual plan ($199/yr), Pro tier with MLS data and deeper comps.

## MVP Scope

### v1 (MVP)
- Landing page with value prop + sign up
- Auth (email/password + Google OAuth)
- Paste listing URL → Property Report Card
- Otis Score, value analysis, cost breakdown, red flags, negotiation tips, Otis's Take
- Chat with Otis (context-aware follow-ups)
- Save properties to dashboard
- Side-by-side comparison (up to 3)
- Stripe billing: 14-day trial (card required), $24/mo
- Topic fencing + prompt injection guardrails
- Responsive design (works on mobile browsers)

### v2 (post-launch)
- Price change alerts on saved properties
- Neighborhood enrichment (schools, crime, walkability, permits)
- Share report via link
- Annual plan ($199/yr)

### v3 (future)
- Mobile PWA with push notifications
- "Scan a For Sale sign" camera feature
- MLS data integration
- Market trend reports per zip code
- Pro tier with deeper comps and investment analysis
