# KayStash — Project Overview

> **One fast, searchable, AI-enhanced hub for all your dev knowledge & resources.**

---

## Table of Contents

- [The Problem](#the-problem)
- [Target Users](#target-users)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Data Models (Prisma)](#data-models-prisma)
- [Item Types](#item-types)
- [Features](#features)
- [UI/UX Guidelines](#uiux-guidelines)
- [Monetization](#monetization)
- [Routes & URL Structure](#routes--url-structure)
- [AI Features](#ai-features)

---

## The Problem

Developers keep their essentials scattered across many tools:

| What | Where |
|---|---|
| Code snippets | VS Code, Notion |
| AI prompts | Chat histories |
| Context files | Buried in projects |
| Useful links | Browser bookmarks |
| Docs | Random folders |
| Commands | `.txt` files, bash history |
| Project templates | GitHub Gists |

This causes constant context switching, lost knowledge, and inconsistent workflows. **KayStash is the single hub that fixes this.**

---

## Target Users

| User | Need |
|---|---|
| **Everyday Developer** | Quickly grab snippets, prompts, commands, links |
| **AI-first Developer** | Save prompts, contexts, workflows, system messages |
| **Content Creator / Educator** | Store code blocks, explanations, course notes |
| **Full-stack Builder** | Collect patterns, boilerplates, API examples |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) / React 19 |
| **Language** | TypeScript |
| **Database** | [Neon](https://neon.tech/) — PostgreSQL (cloud-hosted) |
| **ORM** | [Prisma 7](https://www.prisma.io/docs) |
| **Caching** | Redis *(optional, TBD)* |
| **File Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/) |
| **Auth** | [NextAuth v5](https://authjs.dev/) — Email/password + GitHub OAuth |
| **AI** | OpenAI `gpt-4o-mini` |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Payments** | Stripe |

> ⚠️ **DB Rule:** Never use `prisma db push` in development or production. Always create and run migrations explicitly.

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│                  Next.js 16                  │
│                                             │
│  ┌─────────────┐      ┌───────────────────┐ │
│  │  SSR Pages  │      │   API Routes      │ │
│  │  (React 19) │      │  /api/items       │ │
│  └─────────────┘      │  /api/collections │ │
│                        │  /api/upload      │ │
│                        │  /api/ai          │ │
│                        └───────────────────┘ │
└────────────────────┬────────────────────────┘
                     │
        ┌────────────┼──────────────┐
        ▼            ▼              ▼
  ┌──────────┐  ┌─────────┐  ┌──────────┐
  │  Neon PG │  │  Neon   │  │Cloudflare│
  │ (Prisma) │  │  Redis  │  │    R2    │
  └──────────┘  └─────────┘  └──────────┘
```

---

## Data Models (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String       @id @default(cuid())
  name                 String?
  email                String?      @unique
  emailVerified        DateTime?
  image                String?
  isPro                Boolean      @default(false)
  stripeCustomerId     String?      @unique
  stripeSubscriptionId String?      @unique
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt

  accounts    Account[]
  sessions    Session[]
  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]
}

model Item {
  id          String   @id @default(cuid())
  title       String
  contentType String   // "text" | "file" | "url"
  content     String?  // text content (null if file)
  fileUrl     String?  // Cloudflare R2 URL (null if text)
  fileName    String?  // original filename (null if text)
  fileSize    Int?     // bytes (null if text)
  url         String?  // for link types
  description String?
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  language    String?  // optional, for code snippets
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  itemTypeId String
  itemType   ItemType @relation(fields: [itemTypeId], references: [id])

  tags        Tag[]             @relation("ItemTags")
  collections ItemCollection[]

  @@index([userId])
  @@index([itemTypeId])
}

model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String
  color    String
  isSystem Boolean @default(false)

  userId String?
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items Item[]

  @@unique([name, userId]) // system types: userId null; custom types: scoped to user
}

model Collection {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isFavorite    Boolean  @default(false)
  defaultTypeId String?  // ItemType id used as hint when collection has no items
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items ItemCollection[]

  @@index([userId])
}

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique

  items Item[] @relation("ItemTags")
}

// --- NextAuth models ---

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## Item Types

System types are pre-seeded and cannot be modified by users. All types follow a consistent color + icon pattern throughout the UI.

| Type | Icon (lucide) | Color | Hex | Content Kind | URL Pattern |
|---|---|---|---|---|---|
| `snippet` | `Code` | Blue | `#3b82f6` | text | `/items/snippets` |
| `prompt` | `Sparkles` | Purple | `#8b5cf6` | text | `/items/prompts` |
| `command` | `Terminal` | Orange | `#f97316` | text | `/items/commands` |
| `note` | `StickyNote` | Yellow | `#fde047` | text | `/items/notes` |
| `link` | `Link` | Emerald | `#10b981` | url | `/items/links` |
| `file` | `File` | Gray | `#6b7280` | file | `/items/files` *(Pro)* |
| `image` | `Image` | Pink | `#ec4899` | file | `/items/images` *(Pro)* |

---

## Features

### Core

- **Items** — Create, read, update, delete items of any type via a quick-access drawer
- **Collections** — Group items into named collections; items can belong to multiple collections
- **Search** — Full-text search across title, content, tags, and type
- **Authentication** — Email/password or GitHub OAuth via NextAuth v5
- **Markdown editor** — For all text-based item types
- **Syntax highlighting** — For code blocks (snippets, commands)
- **File upload** — For `file` and `image` types (Cloudflare R2) *(Pro)*
- **Import** — Import code directly from a file
- **Export** — Export your data as JSON or ZIP *(Pro)*
- **Dark mode** — Default; light mode optional

### Item Management

- **Favorites** — Star items and collections
- **Pin to top** — Pin items within a list
- **Recently used** — Tracks `lastUsedAt` for quick re-access
- **Multi-collection** — Add/remove items to/from multiple collections at once
- **Collection membership view** — See which collections an item belongs to

### AI Features *(Pro only)*

- **Auto-tag suggestions** — AI suggests relevant tags on save
- **AI Summaries** — Summarize long notes or code files
- **Explain This Code** — Explain what a snippet or command does
- **Prompt Optimizer** — Improve and rewrite AI prompts

> 🛠️ During development, all users have access to all features regardless of plan.

---

## UI/UX Guidelines

### Layout

```
┌──────────────────────────────────────────────────────┐
│  Sidebar (collapsible)    │  Main Content Area        │
│                           │                           │
│  ▸ Snippets               │  [ Collection Cards ]     │
│  ▸ Prompts                │                           │
│  ▸ Commands               │  [ Item Cards ]           │
│  ▸ Notes                  │                           │
│  ▸ Links                  │  [ Item Drawer (overlay)] │
│  ─────────────────        │                           │
│  Collections              │                           │
│  ▸ React Patterns         │                           │
│  ▸ Interview Prep         │                           │
└──────────────────────────────────────────────────────┘
```

- **Desktop-first**, mobile-usable (sidebar becomes a drawer on mobile)
- Sidebar contains item type links + latest collections
- Main area: color-coded collection cards → color-coded item cards
- Items open in a **quick-access drawer overlay**
- Collection card background = color of most common item type
- Item card border = color of its item type

### Design Language

| Property | Value |
|---|---|
| Style | Modern, minimal, developer-focused |
| Default theme | Dark |
| Typography | Clean, generous whitespace |
| Reference UIs | Notion, Linear, Raycast |
| Borders | Subtle |
| Shadows | Subtle |

### Micro-interactions

- Smooth card transitions
- Hover states on all cards
- Toast notifications for all actions (create, update, delete, copy)
- Loading skeletons while fetching

---

## Monetization

### Free Plan

- 50 items total
- 3 collections
- All system types except `file` and `image`
- Basic search
- No file/image uploads
- No AI features

### Pro — $8/month or $72/year

- Unlimited items
- Unlimited collections
- `file` and `image` type support with R2 uploads
- Custom item types *(coming later)*
- AI auto-tagging
- AI code explanation
- AI prompt optimizer
- Export (JSON / ZIP)
- Priority support

---

## Routes & URL Structure

| Route | Description |
|---|---|
| `/` | Dashboard / home |
| `/items` | All items |
| `/items/snippets` | Snippets list |
| `/items/prompts` | Prompts list |
| `/items/commands` | Commands list |
| `/items/notes` | Notes list |
| `/items/links` | Links list |
| `/items/files` | Files list *(Pro)* |
| `/items/images` | Images list *(Pro)* |
| `/collections` | All collections |
| `/collections/[id]` | Single collection view |
| `/settings` | User settings, plan, exports |
| `/api/items` | Item CRUD |
| `/api/collections` | Collection CRUD |
| `/api/upload` | File upload to R2 |
| `/api/ai/tag` | AI tag suggestions |
| `/api/ai/explain` | AI code explanation |
| `/api/ai/summarize` | AI summarization |
| `/api/ai/optimize` | Prompt optimizer |

---

## Seed Data (System Item Types)

On first migration run, seed the system item types:

```ts
// prisma/seed.ts
const systemTypes = [
  { name: "snippet", icon: "Code",       color: "#3b82f6", isSystem: true },
  { name: "prompt",  icon: "Sparkles",   color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal",   color: "#f97316", isSystem: true },
  { name: "note",    icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "link",    icon: "Link",       color: "#10b981", isSystem: true },
  { name: "file",    icon: "File",       color: "#6b7280", isSystem: true },
  { name: "image",   icon: "Image",      color: "#ec4899", isSystem: true },
];
```

---

## Key Decisions & Notes

- **One repo** — Next.js full-stack keeps overhead low
- **Prisma migrations only** — Never `db push`; always generate and run migrations
- **R2 for files** — Cheap egress, S3-compatible API
- **NextAuth v5** — Supports both credentials and OAuth in one config
- **All users = Pro during dev** — Gate features with `isPro` flag but bypass in dev env
- **Items can belong to multiple collections** — Many-to-many via `ItemCollection` join table
- **System types are global** — `userId` is `null` for system types; custom types are user-scoped