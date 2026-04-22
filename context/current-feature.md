# Current Feature: Email Verification on Register

## Status
In Progress

## Goals

- After a user registers, send a verification email via Resend with a unique link
- User clicks the link to verify their email address
- Unverified users cannot access the dashboard — redirect them to a "check your email" page
- Verified users proceed normally after sign-in
- Store `emailVerified` timestamp on the User model (already exists in schema)
- Verification tokens stored in the `VerificationToken` model (already exists in schema)

## Notes

- Use Resend for email delivery; `RESEND_API_KEY` is already in `.env`
- The `VerificationToken` model (`identifier`, `token`, `expires`) is already in the Prisma schema
- `emailVerified` field already exists on the `User` model
- Token should expire after 24 hours
- Verification link format: `/api/auth/verify-email?token=<token>`
- After successful verification, set `emailVerified` and redirect to `/sign-in` with a success message
- GitHub OAuth users skip email verification (already trusted)
- Create a `/verify-email` pending page shown right after registration

## History

<!-- Keep this updated. Earliest to latest -->

### 2026-04-13 — Initial Next.js Setup
- Bootstrapped project with `create-next-app` (Next.js 16, React 19, TypeScript, Tailwind CSS v4)
- Removed default Next.js boilerplate (page, styles, public assets)
- Added `CLAUDE.md` with project instructions and commands
- Added `context/` directory (project overview, coding standards, AI interaction guidelines, current feature tracker)
- Updated `README.md` to reflect KayStash project
- Pushed to GitHub: https://github.com/riskymind/Kaystash.git

### 2026-04-13 — Dashboard UI Phase 1
- Initialized ShadCN UI (components.json, design tokens, globals.css updated)
- Installed ShadCN `Button` and `Input` components
- Added `lucide-react` for icons
- Set dark mode as default (`dark` class on `<html>`)
- Added item type color CSS variables to globals.css
- Created dashboard route group `(dashboard)` with layout and `/dashboard` page
- Layout includes: top bar with logo, search input, and "New Item" button (display only)
- Sidebar and Main area placeholders with `<h2>` headings
- Build passes with no errors

### 2026-04-13 — Dashboard UI Phase 2
- Installed ShadCN `Sheet` and `Avatar` components
- Created `SidebarContent` component with types list (colored icons + counts, links to `/items/[type]s`), favorite collections (starred), all other collections, and user avatar/email at the bottom
- Created `DashboardShell` client component managing sidebar collapse state and mobile drawer state
- Desktop sidebar collapses to icon-only width via `PanelLeft` toggle button; uses inline style for smooth width transition
- Mobile view: hamburger button opens a fixed overlay drawer; closes on backdrop click, X button, or navigation
- Updated `(dashboard)/layout.tsx` to render `DashboardShell`
- Build passes with no errors

### 2026-04-13 — Dashboard UI Phase 3
- Built dashboard main page (`/dashboard`) with four sections
- Stats cards: total items, collections, favorite items, favorite collections
- Collections grid: sorted by most recently updated, colored left accent border per default type, favorite star
- Pinned items section: conditionally rendered, item rows with type icon, title, tags, and date
- Recent items section: 10 most recent items sorted by `createdAt` descending, same row layout
- All data sourced from `src/lib/mock-data.ts`
- Build passes with no errors

### 2026-04-18 — Seed Data
- Overwrote `prisma/seed.ts` with full seed script
- Created demo user (kele@kaystash.io, bcryptjs 12 rounds)
- Seeded 7 system item types
- Seeded 5 collections with items linked via ItemCollection:
  - React Patterns — 3 snippets
  - AI Workflows — 3 prompts
  - DevOps — 1 snippet, 1 command, 2 links
  - Terminal Commands — 4 commands
  - Design Resources — 4 links

### 2026-04-18 — Dashboard Collections — Real Data
- Created `src/lib/db/collections.ts` with `getDashboardCollections` and `getDashboardStats` server-side functions
- Collections fetched directly in server component (async page)
- Border color derived from most-used item type in each collection
- Small type icon chips shown for all unique types in each collection
- Stats cards (total items, collections, favorites) now pull from real DB counts
- Demo user looked up by email (`kele@kaystash.io`) — placeholder until auth session is wired up
- Build passes with no errors

### 2026-04-18 — Dashboard Items — Real Data
- Created `src/lib/db/items.ts` with `getPinnedItems` and `getRecentItems` server-side functions
- Items fetched directly in server component alongside collections in a single `Promise.all`
- Item row icon and border color derived from `item.itemType` (name, icon, color)
- Tags displayed from real DB tag relations
- Pinned section conditionally renders — hidden when no pinned items exist
- Removed all mock data usage from dashboard page (`mockItems`, `mockItemTypes`)
- Build passes with no errors

### 2026-04-19 — Stats & Sidebar — Real Data
- Added `SidebarItemType` type and `getItemTypesWithCounts` function to `src/lib/db/items.ts` — queries system item types with per-user item counts
- Added `SidebarCollection` type and `getSidebarCollections` function to `src/lib/db/collections.ts` — computes dominant color per collection from most-used item type
- Updated `(dashboard)/layout.tsx` to be async; fetches sidebar data and passes it as props to `DashboardShell`
- Updated `DashboardShell` to accept and forward `itemTypes` and `sidebarCollections` props to `SidebarContent`
- Rewrote `SidebarContent` to use real DB data; removed all `mock-data` imports
- Non-favorite (Recent) collections now show a small colored circle based on their dominant item type color
- Favorite collections retain the star icon
- Added "View all collections" link below the collections list linking to `/collections`
- Build passes with no errors

### 2026-04-20 — Add Pro Badge to Sidebar
- Installed ShadCN UI `Badge` component (`src/components/ui/badge.tsx`)
- Added `PRO` badge next to the **file** and **image** item types in `SidebarContent`
- Badge uses `outline` variant with muted styling — clean and subtle
- Badge is hidden when sidebar is collapsed (consistent with existing behavior)
- Build passes with no errors

### 2026-04-21 — Auth Setup — NextAuth v5 + GitHub OAuth
- Installed `next-auth@beta` (v5.0.0-beta.31) and `@auth/prisma-adapter`
- Created `src/auth.config.ts` — edge-compatible config with GitHub provider only (no adapter)
- Created `src/auth.ts` — full config with Prisma adapter, JWT session strategy, and session callback to expose `user.id`
- Created `src/app/api/auth/[...nextauth]/route.ts` — exports GET/POST handlers
- Created `src/proxy.ts` — Next.js 16 proxy protecting `/dashboard/*`; redirects unauthenticated users to `/api/auth/signin`
- Created `src/types/next-auth.d.ts` — extends `Session` type with `user.id`
- Build passes with no errors

### 2026-04-21 — Auth Credentials — Email/Password Provider
- Added Credentials provider to `src/auth.ts` with `credentials` field definitions (email, password) and bcrypt `authorize` logic
- Password field (`String?`) already existed in User model — no migration needed
- Created `POST /api/auth/register` at `src/app/api/auth/register/route.ts` — validates fields, checks for existing user, hashes password with bcryptjs (12 rounds), creates user
- Fixed `proxy.ts` to include `callbackUrl` query param so post-login redirect lands on `/dashboard`
- Build passes with no errors

### 2026-04-21 — Auth UI — Sign In, Register & Sign Out
- Installed ShadCN `DropdownMenu` component
- Created `src/app/(auth)/layout.tsx` — centered auth layout wrapper
- Created `src/app/(auth)/sign-in/page.tsx` — custom sign-in page with email/password form and GitHub OAuth button; `useSearchParams` wrapped in Suspense boundary
- Created `src/app/(auth)/register/page.tsx` — custom register page with name, email, password, confirm password fields; validates match and length; posts to `/api/auth/register`; redirects to `/sign-in` on success
- Created `src/components/shared/UserAvatar.tsx` — reusable avatar component; shows GitHub image or generated initials fallback; dropdown with Profile link and Sign out button
- Created `src/actions/auth.ts` — `signOutAction` server action calling NextAuth `signOut` with redirect to `/sign-in`
- Updated `src/auth.config.ts` to add `pages: { signIn: "/sign-in" }` — NextAuth now uses custom page
- Updated `src/proxy.ts` — unauthenticated redirect now goes to `/sign-in` instead of `/api/auth/signin`
- Updated `(dashboard)/layout.tsx` — uses `auth()` session to get the real user; removed demo user hardcode
- Updated `DashboardShell` and `SidebarContent` to accept and render the session user in the avatar area
- Build passes with no errors
