import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // process.env allows this to be absent during `prisma generate` (no DB needed).
    // `prisma migrate dev` and `prisma migrate deploy` will fail clearly if unset.
    // DIRECT_URL must be the non-pooled Neon URL (no -pooler in hostname) — required for migrations.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
