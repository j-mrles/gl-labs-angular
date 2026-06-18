# Roadmap — v1.0: Admin & User Portals

## Phase 1: Database Schema + Admin Role Infrastructure
- Add `role` column to users table (user/admin)
- Create admin guard utility function
- Create DB migration
- Seed an admin user
- **Status:** pending

## Phase 2: User Settings & Profile Page
- User settings page at /settings (name, email display, password change)
- Subscription status display with link to Stripe billing portal
- Account deletion option
- **Status:** pending

## Phase 3: Admin Layout & Dashboard
- Admin route group /admin with layout + role guard
- Admin nav (Dashboard, Users, Reports, Subscriptions)
- Dashboard with stats cards: total users, total reports, active subscriptions, revenue
- Recent activity feed (latest reports, signups)
- **Status:** pending

## Phase 4: Admin User Management
- User list page with search and pagination
- User detail view (reports, subscription status, activity)
- Ability to toggle admin role
- Suspend/activate users
- **Status:** pending

## Phase 5: Admin Report & Content Management
- Reports list with search/filter (by user, date, score range)
- Report detail view (same as user view but with admin actions)
- Flag/unflag reports
- Report statistics (avg score, total analyzed, popular areas)
- **Status:** pending

## Phase 6: Admin Subscription & Revenue Management
- Subscription list with status filters
- Revenue summary (MRR, churn, trial conversions)
- Individual subscription detail with Stripe link
- **Status:** pending

## Phase 7: User Notifications & Activity
- Notification preferences on settings page
- Recent activity log on dashboard (reports generated, properties saved)
- Email notification stubs (placeholder implementation)
- **Status:** pending
