# Current Feature
Seed Data

## Status
In Progress

## Goals
- Overwrite `prisma/seed.ts` with full seed script
- Create demo user (kele@kaystash.io, hashed password via bcryptjs 12 rounds)
- Seed 7 system item types
- Seed 5 collections with items linked via ItemCollection:
  - React Patterns — 3 snippets
  - AI Workflows — 3 prompts
  - DevOps — 1 snippet, 1 command, 2 links
  - Terminal Commands — 4 commands
  - Design Resources — 4 links

## Notes
- See spec: @context/features/seed-spec.md
- Overwrite existing prisma/seed.ts (currently only seeds system types)
- Use bcryptjs (check if installed, install if not)
- Links must use real URLs

## History

<!-- Keep this updated. Earliest to latest -->

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
