# Current Feature
Stats & Sidebar — Real Data

## Status
Completed

## Goals
- Display stats in the main area from real database data (not mock data)
- Display system item types in the sidebar with their icons, linking to `/items/[typename]`
- Add "View all collections" link under the collections list that goes to `/collections`
- Keep star icons for favorite collections in the sidebar; for recents, show a colored circle based on the most-used item type in that collection
- Create `src/lib/db/items.ts` with database functions (use `src/lib/db/collections.ts` as reference)

## Notes
- See spec: @context/features/stats-sidebar-spec.md
- Keep the current design/layout — do not change it
- Data comes from the seeded Neon database (demo user: kele@kaystash.io)

## History

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

<!-- Keep this updated. Earliest to latest -->

### 2026-04-18 — Dashboard Items — Real Data
- Created `src/lib/db/items.ts` with `getPinnedItems` and `getRecentItems` server-side functions
- Items fetched directly in server component alongside collections in a single `Promise.all`
- Item row icon and border color derived from `item.itemType` (name, icon, color)
- Tags displayed from real DB tag relations
- Pinned section conditionally renders — hidden when no pinned items exist
- Removed all mock data usage from dashboard page (`mockItems`, `mockItemTypes`)
- Build passes with no errors

### 2026-04-18 — Dashboard Collections — Real Data
- Created `src/lib/db/collections.ts` with `getDashboardCollections` and `getDashboardStats` server-side functions
- Collections fetched directly in server component (async page)
- Border color derived from most-used item type in each collection
- Small type icon chips shown for all unique types in each collection
- Stats cards (total items, collections, favorites) now pull from real DB counts
- Demo user looked up by email (`kele@kaystash.io`) — placeholder until auth session is wired up
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

### 2026-04-13 — Dashboard UI Phase 3
- Built dashboard main page (`/dashboard`) with four sections
- Stats cards: total items, collections, favorite items, favorite collections
- Collections grid: sorted by most recently updated, colored left accent border per default type, favorite star
- Pinned items section: conditionally rendered, item rows with type icon, title, tags, and date
- Recent items section: 10 most recent items sorted by `createdAt` descending, same row layout
- All data sourced from `src/lib/mock-data.ts`
- Build passes with no errors

### 2026-04-13 — Dashboard UI Phase 2
- Installed ShadCN `Sheet` and `Avatar` components
- Created `SidebarContent` component with types list (colored icons + counts, links to `/items/[type]s`), favorite collections (starred), all other collections, and user avatar/email at the bottom
- Created `DashboardShell` client component managing sidebar collapse state and mobile drawer state
- Desktop sidebar collapses to icon-only width via `PanelLeft` toggle button; uses inline style for smooth width transition
- Mobile view: hamburger button opens a fixed overlay drawer; closes on backdrop click, X button, or navigation
- Updated `(dashboard)/layout.tsx` to render `DashboardShell`
- Build passes with no errors

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

### 2026-04-13 — Initial Next.js Setup
- Bootstrapped project with `create-next-app` (Next.js 16, React 19, TypeScript, Tailwind CSS v4)
- Removed default Next.js boilerplate (page, styles, public assets)
- Added `CLAUDE.md` with project instructions and commands
- Added `context/` directory (project overview, coding standards, AI interaction guidelines, current feature tracker)
- Updated `README.md` to reflect KayStash project
- Pushed to GitHub: https://github.com/riskymind/Kaystash.git
