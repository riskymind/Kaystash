# Current Feature

## Status
Completed

## Goals

## Notes

<!-- Keep this updated. Earliest to latest -->

## History

### 2026-05-04 — Collection Management Actions

- Added `UpdateCollectionInput` type, `updateCollectionInDb`, and `deleteCollectionInDb` to `src/lib/db/collections.ts` — update uses `updateMany` with ownership check; delete uses `findFirst` + `delete` (cascade removes `ItemCollection` rows, items untouched)
- Added `updateCollectionAction` and `deleteCollectionAction` to `src/actions/collections.ts` — same Zod + auth pattern as create; delete checks ownership and returns `{ success, error }`
- Created `src/components/collections/EditCollectionDialog.tsx` — Dialog pre-populated with existing name/description; inline field errors; toast + `router.refresh()` on success
- Created `src/components/collections/DeleteCollectionDialog.tsx` — `AlertDialog` confirmation; accepts optional `onSuccess` callback for custom post-delete navigation; falls back to `router.refresh()`
- Created `src/components/collections/CollectionCardWithMenu.tsx` — client component; card body is a `<Link>` (block, `pr-10`); 3-dots `DropdownMenu` is an absolute-positioned sibling outside the Link so clicks don't navigate; Edit / Favorite (disabled) / Delete items in the menu
- Created `src/components/collections/CollectionDetailActions.tsx` — client component; renders Edit, Favorite (disabled/icon-only), Delete buttons in the detail page header; Delete redirects to `/collections` on success
- Updated `src/app/(dashboard)/collections/[id]/page.tsx` — added `CollectionDetailActions` to the header row alongside the collection name/meta
- Updated `src/app/(dashboard)/collections/page.tsx` — replaced inline `CollectionCard` with `CollectionCardWithMenu`; removed now-unused `ICON_MAP` and icon imports
- Updated `src/app/(dashboard)/dashboard/page.tsx` — replaced inline `CollectionCard` with `CollectionCardWithMenu`; removed unused `ICON_MAP`, `CollectionCard`, and related icon imports
- Build passes with no errors

### 2026-05-04 — Collections Pages & Navigation

- Added `CollectionDetail` type and `getCollectionDetail` function to `src/lib/db/collections.ts` — fetches a single collection by ID with ownership check, computes dominant color, returns metadata
- Added `getItemsInCollection` function to `src/lib/db/collections.ts` — fetches items in a collection (filtered to current user) ordered by `addedAt` desc, returns `ItemForDashboard`-shaped objects
- Created `src/app/(dashboard)/collections/page.tsx` — server component; lists all user collections as `Link`-wrapped cards pointing to `/collections/[id]`; shows item count, description, dominant-color left border, type icon chips, and favorite star; empty state when no collections
- Created `src/app/(dashboard)/collections/[id]/page.tsx` — server component; fetches collection detail + items in `Promise.all`; returns 404 for unknown/unauthorized IDs; renders collection name, description, item count, favorite star; uses `ItemCardsWithDrawer` for items with full drawer support
- Updated `src/app/(dashboard)/dashboard/page.tsx` — `CollectionCard` now renders as `<Link href="/collections/[id]">` instead of a plain `<div>`; "View all" button replaced with `<Link href="/collections">`; added `next/link` import
- Sidebar "View all collections" and per-collection links were already correctly pointing to `/collections` and `/collections/[id]` — no change needed
- Build passes with no errors

### 2026-05-01 — Item-Collection Assignment

- Added `SelectableCollection` type and `getSelectableCollections` function to `src/lib/db/collections.ts` — fetches all user collections ordered by name
- Updated `CreateItemInput` in `src/lib/db/items.ts` to include optional `collectionIds?: string[]`; `createItemInDb` connects them via `ItemCollection` create on item creation
- Updated `UpdateItemInput` in `src/lib/db/items.ts` to include `collectionIds: string[]`; `updateItemInDb` uses `deleteMany: {} + create` pattern to replace collection memberships (same pattern as tags)
- Updated `createItemAction` in `src/actions/items.ts` — parses `collectionIds` from JSON in formData and passes to `createItemInDb`
- Updated `updateItemAction` in `src/actions/items.ts` — accepts `collectionIds: string[]` and forwards to `updateItemInDb`
- Updated `src/components/items/NewItemDialog.tsx` — added `collections` prop, `selectedCollectionIds` state, scrollable checkbox list below tags field; resets on close; serializes selection as JSON into formData on submit
- Updated `src/components/layout/DashboardShell.tsx` — passes `sidebarCollections` as `collections` prop to `NewItemDialog`
- Updated `src/components/items/ItemDrawer.tsx` — added `collections` prop and `editCollectionIds` state; pre-populated from `item.collections` on edit start; replaced static collections display in edit mode with interactive checkbox picker; passes `collectionIds` to `updateItemAction` on save
- Updated `src/components/items/ItemCardsWithDrawer.tsx` and `ItemRowsWithDrawer.tsx` — added `collections` prop forwarded to `ItemDrawer`
- Updated `src/app/(dashboard)/dashboard/page.tsx` — fetches `selectableCollections` in `Promise.all`, passes to both `ItemRowsWithDrawer` usages
- Updated `src/app/(dashboard)/items/[type]/page.tsx` — fetches `selectableCollections` in `Promise.all`, passes to `ItemCardsWithDrawer`
- Build passes with no errors

### 2026-05-01 — Collection Create

- Added `CreateCollectionInput` type and `createCollectionInDb` function to `src/lib/db/collections.ts` — creates collection with name, description, and userId
- Created `src/actions/collections.ts` — `createCollectionAction` server action with Zod schema; validates name (required, max 100) and description (optional, max 500); returns `{ success, error, fieldErrors }` pattern
- Created `src/components/collections/NewCollectionDialog.tsx` — Dialog with name (required) and description (optional textarea) fields; inline field error display; toast on success/failure; `router.refresh()` on success to update sidebar and dashboard
- Updated `src/components/layout/DashboardShell.tsx` — added "New Collection" outline button to top bar next to "New Item"; both dialogs rendered at header level
- Build passes with no errors

### 2026-05-01 — Markdown Editor

- Installed `react-markdown` and `remark-gfm`
- Created `src/components/items/MarkdownEditor.tsx` — macOS-style dark chrome matching `CodeEditor` (`bg-[#1e1e1e]` / `bg-[#2d2d2d]`); Write/Preview tabs in header; copy button; edit mode defaults to Write tab; readonly mode shows Preview only; fluid height with min 120px and max 400px via `style` on the preview container; textarea is resizable in write mode
- Added `.markdown-preview` CSS class to `src/app/globals.css` — explicit dark-theme prose styles for h1–h6, p, ul/ol, code (inline + block), pre, blockquote, a, hr, table, and img
- Updated `src/components/items/NewItemDialog.tsx` — added `markdownContent` state; `note`/`prompt` types render `<MarkdownEditor>` instead of `<textarea>`; content injected into `formData` on submit; reset on type change and dialog close
- Updated `src/components/items/ItemDrawer.tsx` — view mode `<pre>` replaced with `<MarkdownEditor readOnly>` for `note`/`prompt`; edit mode `<textarea>` replaced with `<MarkdownEditor>` for `note`/`prompt`; `MARKDOWN_TYPES` constant and `useMarkdownEditor` boolean added alongside existing `CODE_TYPES`/`useCodeEditor`
- `snippet` and `command` types keep `CodeEditor` unchanged
- Build passes with no errors

### 2026-05-01 — Code Editor

- Installed `@monaco-editor/react`
- Created `src/components/items/CodeEditor.tsx` — Monaco Editor (VS Dark theme) wrapped in macOS-style chrome; header has red/yellow/green dots, language label, and copy button; fluid height auto-sized to content (min 120px, max 400px) driven via React state to avoid feedback loop; thin 6px themed scrollbars; supports `readOnly` and editable modes
- Updated `src/components/items/ItemDrawer.tsx` — view mode `<pre>` and edit mode `<textarea>` replaced with `<CodeEditor>` for `snippet` and `command` types; all other types keep existing markup
- Updated `src/components/items/NewItemDialog.tsx` — language `<select>` is now controlled (bound to state) and placed above the editor; `snippet`/`command` types render `<CodeEditor>` with content injected into `formData` on submit; `prompt`/`note` keep the plain `<textarea>`
- Build passes with no errors

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

### 2026-04-24 — Items List View

- Added `typeSlugToName` helper and `getItemsByType` function to `src/lib/db/items.ts` — maps plural URL slug to DB type name (e.g. `snippets` → `snippet`), fetches user's items filtered by type
- Created `src/components/items/ItemCard.tsx` — card with colored left border, type icon, title, description (2-line clamp), tags (up to 3), favorite/pin indicators, and date
- Created `src/app/(dashboard)/items/[type]/page.tsx` — server component; auth-guards via `auth()`; returns 404 for unknown type slugs; renders 1-col (mobile) / 2-col (md+) grid of `ItemCard`s with empty state
- Build passes with no errors

### 2026-04-24 — Item Create

- Installed `zod` and `sonner`; added `<Toaster richColors position="bottom-right" />` to root layout
- Added `CreateItemInput` type and `createItemInDb` function to `src/lib/db/items.ts` — creates item with tag `connectOrCreate`
- Created `src/actions/items.ts` — `createItemAction` server action with Zod schema; validates required fields per type (URL required for link), maps type name to `contentType`, resolves `itemTypeId` from DB
- Created `src/components/items/NewItemDialog.tsx` — Dialog with 5-type selector (snippet, prompt, command, note, link), dynamic fields per type (content/language for snippet+command, content for prompt+note, URL for link), comma-separated tags, toast on success, `router.refresh()` to update the page
- Updated `DashboardShell` — "New Item" button now opens the dialog
- Build passes with no errors

### 2026-04-24 — Item Drawer

- Added `ItemDetail` type and `getItemDetail` function to `src/lib/db/items.ts` — fetches full item with content, URL, language, tags, and collections
- Created `GET /api/items/[id]` — auth-checked route returning full item detail; 401 for unauthenticated, 404 for not found
- Created `src/components/items/ItemDrawer.tsx` — right-side Sheet with skeleton loading state, type badge + language badge in header, action bar (Favorite/Pin/Copy/Edit/Delete), and sections for description, content (monospace pre), URL, tags, collections, and created/updated dates
- Created `src/components/items/ItemCardsWithDrawer.tsx` — client wrapper managing drawer state for the items list grid; renders `ItemCard` grid + `ItemDrawer`
- Created `src/components/items/ItemRowsWithDrawer.tsx` — client wrapper for dashboard row lists (pinned + recent); includes inline `ItemRow` with click handler
- Updated `ItemCard` — added optional `onClick?: (id: string) => void` prop; card is `cursor-pointer`
- Updated `/items/[type]` page — replaced raw grid with `ItemCardsWithDrawer`
- Updated `/dashboard` page — removed inline `ItemRow` component, replaced pinned and recent sections with `ItemRowsWithDrawer`
- Build passes with no errors

### 2026-04-23 — Rate Limiting for Auth

- Installed `@upstash/ratelimit` and `@upstash/redis`
- Created `src/lib/rate-limit.ts` — Upstash Redis client, sliding window limiters for all 5 endpoints, `getIp()` (extracts from `x-forwarded-for`), `checkRateLimit()` (fails open on Redis errors), `makeRateLimitResponse()` (429 + `Retry-After` header)
- Added rate limiting to `POST /api/auth/register` (3/hr, by IP), `POST /api/auth/forgot-password` (3/hr, by IP), `POST /api/auth/reset-password` (5/15min, by IP), `POST /api/auth/resend-verification` (3/15min, by IP+email)
- Added login rate limiting inside NextAuth `authorize` (5/15min, by IP+email) — throws `RateLimitedError extends CredentialsSignin` so the `rate_limited` code propagates to the client (plain `Error` is wrapped as `CallbackRouteError` in NextAuth v5 and the code is lost)
- Also fixed `email_not_verified` with the same `EmailNotVerifiedError extends CredentialsSignin` pattern
- Updated sign-in page to handle `rate_limited` error code; updated forgot-password and reset-password pages to show the rate limit message from the response body
- Build passes with no errors

### 2026-04-24 — Item Delete

- Added `deleteItemInDb` to `src/lib/db/items.ts` — deletes item by ID with ownership check via `findFirst` before `delete`
- Added `deleteItemAction` to `src/actions/items.ts` — auth + ownership check, returns `{ success: true }` or `{ success: false, error }`
- Installed ShadCN `AlertDialog` component (`src/components/ui/alert-dialog.tsx`) — uses `@base-ui/react/alert-dialog`
- Updated `src/components/items/ItemDrawer.tsx` — delete button opens `AlertDialog` confirmation with item title; on confirm calls `deleteItemAction`, fires success toast, closes drawer, and calls `router.refresh()`
- Used `render` prop on `AlertDialogTrigger` (Base UI pattern) instead of `asChild` (Radix UI pattern)
- Build passes with no errors

### 2026-04-24 — Item Drawer Edit Mode

- Added `updateItemInDb` to `src/lib/db/items.ts` — disconnects all existing tags (`set: []`), connect-or-creates new tag list, returns updated `ItemDetail`
- Added `updateItemAction` to `src/actions/items.ts` — Zod schema with URL validation, auth + ownership check, returns `{ success: true, data: ItemDetail }` or `{ success: false, error, fieldErrors }`
- Updated `src/components/items/ItemDrawer.tsx` — pencil button toggles inline edit mode; action bar replaced with Save/Cancel; controlled inputs for title, description, tags (all types) and content, language, URL (type-specific); Save disabled when title is empty; on success updates local state from response, fires toast, and calls `router.refresh()`
- Collections and dates are display-only in edit mode; item type is never editable
- Build passes with no errors
