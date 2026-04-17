import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, ContentType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// ─── System item types ────────────────────────────────────────────────────────

const systemItemTypes = [
  { name: "snippet", icon: "Code",       color: "#3b82f6", isSystem: true },
  { name: "prompt",  icon: "Sparkles",   color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal",   color: "#f97316", isSystem: true },
  { name: "note",    icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file",    icon: "File",       color: "#6b7280", isSystem: true },
  { name: "image",   icon: "Image",      color: "#ec4899", isSystem: true },
  { name: "link",    icon: "Link",       color: "#10b981", isSystem: true },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding database...\n");

  // ── 1. System item types ──────────────────────────────────────────────────
  console.log("Seeding system item types...");
  const typeMap: Record<string, string> = {};

  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, userId: null },
    });
    const record = existing ?? (await prisma.itemType.create({ data: type }));
    typeMap[type.name] = record.id;
  }
  console.log("✓ System item types seeded");

  // ── 2. Demo user ──────────────────────────────────────────────────────────
  console.log("Seeding demo user...");
  const passwordHash = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "kele@kaystash.io" },
    update: {},
    create: {
      email: "kele@kaystash.io",
      name: "Demo User",
      password: passwordHash,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log("✓ Demo user seeded:", user.email);

  // ── 3. Collections & items ────────────────────────────────────────────────
  console.log("Seeding collections and items...");

  // Helper: create a collection + its items in one go
  async function seedCollection(params: {
    name: string;
    description: string;
    defaultTypeName: string;
    items: {
      title: string;
      contentType: ContentType;
      typeName: string;
      content?: string;
      url?: string;
      description?: string;
      language?: string;
      tags?: string[];
    }[];
  }) {
    const collection = await prisma.collection.create({
      data: {
        name: params.name,
        description: params.description,
        userId: user.id,
        defaultTypeId: typeMap[params.defaultTypeName],
      },
    });

    for (const item of params.items) {
      const created = await prisma.item.create({
        data: {
          title: item.title,
          contentType: item.contentType,
          content: item.content,
          url: item.url,
          description: item.description,
          language: item.language,
          userId: user.id,
          itemTypeId: typeMap[item.typeName],
        },
      });

      await prisma.itemCollection.create({
        data: { itemId: created.id, collectionId: collection.id },
      });

      // Upsert tags and link them
      if (item.tags?.length) {
        for (const tagName of item.tags) {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
          await prisma.item.update({
            where: { id: created.id },
            data: { tags: { connect: { id: tag.id } } },
          });
        }
      }
    }

    return collection;
  }

  // ── React Patterns ────────────────────────────────────────────────────────
  await seedCollection({
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    defaultTypeName: "snippet",
    items: [
      {
        title: "Custom Hooks Collection",
        typeName: "snippet",
        contentType: ContentType.TEXT,
        language: "typescript",
        description: "useDebounce, useLocalStorage, and useMediaQuery hooks",
        tags: ["react", "hooks", "typescript"],
        content: `import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })
  const setValue = (value: T) => {
    setStoredValue(value)
    window.localStorage.setItem(key, JSON.stringify(value))
  }
  return [storedValue, setValue] as const
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])
  return matches
}`,
      },
      {
        title: "Context Provider Pattern",
        typeName: "snippet",
        contentType: ContentType.TEXT,
        language: "typescript",
        description: "Type-safe context with compound component pattern",
        tags: ["react", "context", "typescript", "patterns"],
        content: `import { createContext, useContext, useState, ReactNode } from 'react'

interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}`,
      },
      {
        title: "React Utility Functions",
        typeName: "snippet",
        contentType: ContentType.TEXT,
        language: "typescript",
        description: "Common utility functions for React apps",
        tags: ["react", "utils", "typescript"],
        content: `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date for display */
export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(date))
}

/** Truncate a string to a max length */
export function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 3) + '...' : str
}

/** Sleep for N milliseconds */
export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))`,
      },
    ],
  });

  // ── AI Workflows ──────────────────────────────────────────────────────────
  await seedCollection({
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    defaultTypeName: "prompt",
    items: [
      {
        title: "Code Review Prompt",
        typeName: "prompt",
        contentType: ContentType.TEXT,
        description: "Thorough code review with security and performance focus",
        tags: ["ai", "code-review", "prompt"],
        content: `You are a senior software engineer conducting a thorough code review. Review the following code and provide feedback on:

1. **Correctness** – Are there any bugs or logic errors?
2. **Security** – Any vulnerabilities (XSS, injection, auth issues)?
3. **Performance** – Unnecessary re-renders, N+1 queries, inefficient algorithms?
4. **Readability** – Is the code clear and self-documenting?
5. **Patterns** – Does it follow established patterns in the codebase?

Format your response as:
- ✅ What's good
- ⚠️ Suggestions (non-blocking)
- ❌ Issues (must fix before merging)

Code to review:
\`\`\`
{CODE}
\`\`\``,
      },
      {
        title: "Documentation Generator",
        typeName: "prompt",
        contentType: ContentType.TEXT,
        description: "Generate JSDoc and README documentation from code",
        tags: ["ai", "docs", "prompt"],
        content: `Generate comprehensive documentation for the following code. Include:

1. A brief description of what this module/function does
2. JSDoc comments for every exported function/class with:
   - @param descriptions with types
   - @returns description
   - @throws for any errors
   - @example with realistic usage
3. A README section (markdown) covering:
   - Purpose
   - Usage examples
   - Edge cases and gotchas

Be concise but complete. Use TypeScript types where relevant.

Code:
\`\`\`
{CODE}
\`\`\``,
      },
      {
        title: "Refactoring Assistant",
        typeName: "prompt",
        contentType: ContentType.TEXT,
        description: "Refactor code for clarity, performance, and maintainability",
        tags: ["ai", "refactoring", "prompt"],
        content: `Refactor the following code to improve its quality. Goals:

1. **Simplify** – Remove unnecessary complexity without losing functionality
2. **Modernise** – Use current language features (async/await, optional chaining, etc.)
3. **Type safety** – Add or improve TypeScript types
4. **Separation of concerns** – Break large functions into focused helpers
5. **Naming** – Use clear, descriptive names

Constraints:
- Keep the same public API (don't break callers)
- Don't add new dependencies
- Explain each significant change with a comment or brief note

Original code:
\`\`\`
{CODE}
\`\`\``,
      },
    ],
  });

  // ── DevOps ────────────────────────────────────────────────────────────────
  await seedCollection({
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    defaultTypeName: "snippet",
    items: [
      {
        title: "Next.js Dockerfile",
        typeName: "snippet",
        contentType: ContentType.TEXT,
        language: "dockerfile",
        description: "Multi-stage Dockerfile for a Next.js production build",
        tags: ["docker", "nextjs", "devops"],
        content: `FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
      },
      {
        title: "Deploy to Production",
        typeName: "command",
        contentType: ContentType.TEXT,
        language: "bash",
        description: "Run database migrations then restart the app service",
        tags: ["deploy", "devops", "prisma"],
        content: `npx prisma migrate deploy && pm2 restart app`,
      },
      {
        title: "Neon PostgreSQL Docs",
        typeName: "link",
        contentType: ContentType.URL,
        description: "Official Neon serverless PostgreSQL documentation",
        tags: ["neon", "postgres", "docs"],
        url: "https://neon.tech/docs/introduction",
      },
      {
        title: "Docker Compose Reference",
        typeName: "link",
        contentType: ContentType.URL,
        description: "Official Docker Compose file reference",
        tags: ["docker", "docs", "devops"],
        url: "https://docs.docker.com/compose/compose-file/",
      },
    ],
  });

  // ── Terminal Commands ─────────────────────────────────────────────────────
  await seedCollection({
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    defaultTypeName: "command",
    items: [
      {
        title: "Git: Undo Last Commit (Keep Changes)",
        typeName: "command",
        contentType: ContentType.TEXT,
        language: "bash",
        description: "Soft reset — moves HEAD back one commit, keeps files staged",
        tags: ["git", "undo"],
        content: `git reset --soft HEAD~1`,
      },
      {
        title: "Docker: Remove All Stopped Containers",
        typeName: "command",
        contentType: ContentType.TEXT,
        language: "bash",
        description: "Prune stopped containers, dangling images, and unused networks",
        tags: ["docker", "cleanup"],
        content: `docker system prune -f`,
      },
      {
        title: "Find and Kill Process on Port",
        typeName: "command",
        contentType: ContentType.TEXT,
        language: "bash",
        description: "Kill whatever is listening on a given port (macOS/Linux)",
        tags: ["process", "port", "kill"],
        content: `lsof -ti tcp:3000 | xargs kill -9`,
      },
      {
        title: "npm: Clean Install",
        typeName: "command",
        contentType: ContentType.TEXT,
        language: "bash",
        description: "Delete node_modules and lock file, then reinstall from scratch",
        tags: ["npm", "clean"],
        content: `rm -rf node_modules package-lock.json && npm install`,
      },
    ],
  });

  // ── Design Resources ──────────────────────────────────────────────────────
  await seedCollection({
    name: "Design Resources",
    description: "UI/UX resources and references",
    defaultTypeName: "link",
    items: [
      {
        title: "Tailwind CSS Docs",
        typeName: "link",
        contentType: ContentType.URL,
        description: "Official Tailwind CSS v4 documentation",
        tags: ["tailwind", "css", "docs"],
        url: "https://tailwindcss.com/docs",
      },
      {
        title: "shadcn/ui Components",
        typeName: "link",
        contentType: ContentType.URL,
        description: "Beautifully designed components built with Radix UI and Tailwind",
        tags: ["shadcn", "components", "ui"],
        url: "https://ui.shadcn.com",
      },
      {
        title: "Radix UI Primitives",
        typeName: "link",
        contentType: ContentType.URL,
        description: "Unstyled, accessible component primitives for React",
        tags: ["radix", "accessibility", "components"],
        url: "https://www.radix-ui.com/primitives",
      },
      {
        title: "Lucide Icons",
        typeName: "link",
        contentType: ContentType.URL,
        description: "Beautiful and consistent open-source icon library",
        tags: ["icons", "lucide", "ui"],
        url: "https://lucide.dev/icons",
      },
    ],
  });

  console.log("✓ Collections and items seeded");
  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
