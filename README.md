# KayStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links, and custom types.

## Tech Stack

- **Framework** — Next.js 16 / React 19
- **Language** — TypeScript
- **Database** — Neon (PostgreSQL) via Prisma 7
- **Auth** — NextAuth v5 (Email/password + GitHub OAuth)
- **File Storage** — Cloudflare R2
- **AI** — OpenAI `gpt-4o-mini`
- **Styling** — Tailwind CSS v4 + shadcn/ui
- **Payments** — Stripe

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Lint
npm run test       # Run tests (single run)
npm run test:watch # Run tests in watch mode
```

## Database

This project uses Prisma with Neon PostgreSQL.

> **Never use `prisma db push`.** Always generate and run migrations explicitly.

```bash
npx prisma migrate dev    # Create and apply a new migration
npx prisma migrate status # Check migration status
npx prisma db seed        # Seed system item types
```
