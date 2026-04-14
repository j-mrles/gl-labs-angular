# Staff Dashboard Sub-routes — Design Spec

**Date:** 2026-04-13
**Status:** Approved

## Problem

Five broken navigation items in the app:

1. Staff Dashboard — Contact Inquiries card routes to `/staff-dashboard` (no-op)
2. Staff Dashboard — Site Content card routes to `/staff-dashboard` (no-op)
3. Staff Dashboard — Analytics card routes to `/staff-dashboard` (no-op)
4. Staff Dashboard — Settings card routes to `/staff-dashboard` (no-op)
5. Discover page — "Little Bee's Creations" case study URL has a literal apostrophe in the path, breaking the link in most browsers

## Solution

### 1. Staff Dashboard Sub-routes

Add 4 flat sibling routes under the `staff-dashboard` path, each protected by `staffAuthGuard`. Use flat routes (not Angular child routes with `<router-outlet>`) to avoid restructuring the existing `StaffDashboardComponent`.

**New routes:**

| Route | Component | Purpose |
|---|---|---|
| `/staff-dashboard/inquiries` | `StaffInquiriesComponent` | Contact form submissions (links to Formspree) |
| `/staff-dashboard/content` | `StaffContentComponent` | Site content management (coming soon placeholder) |
| `/staff-dashboard/analytics` | `StaffAnalyticsComponent` | Analytics (links to Firebase console, coming soon) |
| `/staff-dashboard/settings` | `StaffSettingsComponent` | Account info + settings (coming soon placeholder) |

**Tool card routes updated in `StaffDashboardComponent`:**

```ts
{ label: 'Contact Inquiries', route: '/staff-dashboard/inquiries', icon: 'mail' }
{ label: 'Site Content',      route: '/staff-dashboard/content',   icon: 'edit' }
{ label: 'Analytics',         route: '/staff-dashboard/analytics', icon: 'chart' }
{ label: 'Settings',          route: '/staff-dashboard/settings',  icon: 'settings' }
```

**Each sub-page layout:**
- Page title + subtitle
- Main content area (functional for Inquiries/Settings, placeholder for Content/Analytics)
- "Back to Dashboard" button linking to `/staff-dashboard`

**Page content:**

- **Inquiries:** Note about where form submissions are delivered, link to Formspree dashboard (`https://formspree.io/forms`), Formspree endpoint displayed for reference
- **Content:** "Coming soon" message with description of what will be manageable here
- **Analytics:** "Coming soon" message, link to Firebase console for current data
- **Settings:** Shows staff username from `sessionStorage.getItem('staff_username')`, "Coming soon" for advanced settings

### 2. URL Fix — Little Bee's Creations

In `discover.component.ts`, encode the apostrophe in the case study URL:

```
Before: https://j-mrles.github.io/LinkTree/littlebee's-creations/home/index.html
After:  https://j-mrles.github.io/LinkTree/littlebee%27s-creations/home/index.html
```

## Architecture

- 4 new standalone Angular components, one file each (`.ts` only, inline template + minimal styles)
- Each imports: `CommonModule`, `RouterLink`, `TranslatePipe`
- Routes added to `app.routes.ts` using lazy `loadComponent` pattern (matches existing style)
- All 4 routes use `canActivate: [staffAuthGuard]`
- No changes to `StaffDashboardComponent` template — only the `tools` getter route values change

## Out of Scope

- Real data fetching for any sub-page
- Formspree API integration
- Firebase Analytics embedding
- Any CMS functionality for Site Content
