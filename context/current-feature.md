# Current Feature

## Status
Completed

## Goals

## Notes

<!-- Keep this updated. Earliest to latest -->

## History

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

### 2026-04-23 — Forgot Password

- Added `generatePasswordResetToken` to `src/lib/tokens.ts` — uses `reset:<email>` identifier (avoids collision with email-verification tokens), 1-hour expiry
- Added `sendPasswordResetEmail` to `src/lib/resend.ts` — branded reset email with link to `/reset-password?token=...`
- Created `POST /api/auth/forgot-password` — generates token and sends email; email-enumeration safe (always returns 200); only works for credential accounts (has password)
- Created `POST /api/auth/reset-password` — validates token prefix and expiry, hashes new password, updates user, deletes token
- Created `/forgot-password` page — email form; shows "check your email" state after submit
- Created `/reset-password` page — new password + confirm form; reads token from query param; shows actionable error with link to re-request on invalid/expired token
- Updated sign-in page — "Forgot password?" link above password field; `?reset=sent` success banner after successful reset
- Build passes with no errors

### 2026-04-23 — Email Verification Toggle
- Added `EMAIL_VERIFICATION_ENABLED` env variable to toggle email verification on/off
- When `false`: register route skips token generation/email sending and sets `emailVerified: new Date()` so the user can sign in immediately; Credentials `authorize` skips the `emailVerified` check
- When `true` (default): full existing flow is active — send verification email → verify token → sign in
- Register page reads `emailVerificationRequired` from the API response and redirects to `/verify-email-sent` or `/sign-in` accordingly
- `.env` set to `false` for local dev; `.env.example` documents `true` as the production default
- Build passes with no errors

### 2026-04-22 — Auth Email Verification
- Installed `resend` package
- Created `src/lib/resend.ts` — Resend client + `sendVerificationEmail` (sends from `onboarding@resend.dev`)
- Created `src/lib/tokens.ts` — `generateVerificationToken`: 32-byte hex token stored in `VerificationToken` table with 24hr expiry; replaces existing token on resend
- Created `GET /api/auth/verify-email` — validates token, sets `emailVerified`, deletes token, redirects to `/sign-in?verified=true`; redirects with error param on invalid/expired token
- Created `POST /api/auth/resend-verification` — resends verification email; email-enumeration safe (returns 200 for unknown emails)
- Created `src/app/(auth)/verify-email-sent/page.tsx` — "Check your email" page with resend button; reads email from query param
- Updated `src/auth.ts` — Credentials `authorize` throws `"email_not_verified"` error if `emailVerified` is null
- Updated `src/app/(auth)/register/page.tsx` — sends `confirmPassword` in request body (was missing); redirects to `/verify-email-sent?email=<email>` on success
- Updated `src/app/(auth)/sign-in/page.tsx` — handles `email_not_verified` error code with "Resend verification email" link; shows success banner on `?verified=true`; shows error on `?error=token_expired` / `?error=invalid_token`
- Email sending wrapped in try/catch in register route — failure is silent so user still reaches `/verify-email-sent` and can resend
- Added `scripts/purge-other-users.ts` — deletes all users except a specified email, including their items, collections, accounts and sessions
- Build passes with no errors

### 2026-04-23 — Profile Page

- Created `src/lib/db/profile.ts` with `getProfileUser` (returns user info + `hasPassword` flag) and `getProfileStats` (total items, total collections, per-type breakdown)
- Created `src/actions/profile.ts` — `changePasswordAction` (validates current password with bcrypt, hashes new password) and `deleteAccountAction` (deletes user row, triggers NextAuth sign-out)
- Installed ShadCN `Dialog` component (`src/components/ui/dialog.tsx`) — uses `@base-ui/react/dialog`
- Created `src/components/profile/ChangePasswordForm.tsx` — client form with current/new/confirm fields; validates length and match before calling server action
- Created `src/components/profile/DeleteAccountDialog.tsx` — requires user to type `delete my account` before destructive action is allowed
- Created `src/app/(dashboard)/profile/page.tsx` — server component; fetches user + stats via `Promise.all`; renders account info, usage stats grid, type breakdown, change password (credential users only), and danger zone
- Change password section is conditionally rendered based on `user.hasPassword` — hidden for GitHub OAuth users
- Route lives inside `(dashboard)` layout — inherits sidebar and authentication guard
- Build passes with no errors

### 2026-04-23 — Rate Limiting for Auth

- Installed `@upstash/ratelimit` and `@upstash/redis`
- Created `src/lib/rate-limit.ts` — Upstash Redis client, sliding window limiters for all 5 endpoints, `getIp()` (extracts from `x-forwarded-for`), `checkRateLimit()` (fails open on Redis errors), `makeRateLimitResponse()` (429 + `Retry-After` header)
- Added rate limiting to `POST /api/auth/register` (3/hr, by IP), `POST /api/auth/forgot-password` (3/hr, by IP), `POST /api/auth/reset-password` (5/15min, by IP), `POST /api/auth/resend-verification` (3/15min, by IP+email)
- Added login rate limiting inside NextAuth `authorize` (5/15min, by IP+email) — throws `RateLimitedError extends CredentialsSignin` so the `rate_limited` code propagates to the client (plain `Error` is wrapped as `CallbackRouteError` in NextAuth v5 and the code is lost)
- Also fixed `email_not_verified` with the same `EmailNotVerifiedError extends CredentialsSignin` pattern
- Updated sign-in page to handle `rate_limited` error code; updated forgot-password and reset-password pages to show the rate limit message from the response body
- Build passes with no errors
