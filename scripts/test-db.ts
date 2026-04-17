import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("─".repeat(60));
  console.log("  Database Test");
  console.log("─".repeat(60));

  // ── Connection check ──────────────────────────────────────────
  const [{ now }] = await prisma.$queryRaw<[{ now: Date }]>`SELECT NOW()`;
  console.log(`\n✓ Connected at ${now.toISOString()}\n`);

  // ── Demo user ─────────────────────────────────────────────────
  console.log("USER");
  console.log("─".repeat(40));
  const user = await prisma.user.findUnique({
    where: { email: "kele@kaystash.io" },
    select: {
      id: true,
      name: true,
      email: true,
      isPro: true,
      emailVerified: true,
      _count: { select: { items: true, collections: true } },
    },
  });

  if (!user) {
    console.log("✗ Demo user not found — has the seed been run?\n");
  } else {
    console.log(`  Name:      ${user.name}`);
    console.log(`  Email:     ${user.email}`);
    console.log(`  Pro:       ${user.isPro}`);
    console.log(`  Verified:  ${user.emailVerified?.toDateString()}`);
    console.log(`  Items:     ${user._count.items}`);
    console.log(`  Collections: ${user._count.collections}`);
  }

  // ── System item types ─────────────────────────────────────────
  console.log("\nSYSTEM ITEM TYPES");
  console.log("─".repeat(40));
  const types = await prisma.itemType.findMany({
    where: { isSystem: true, userId: null },
    orderBy: { name: "asc" },
  });
  for (const t of types) {
    console.log(`  ${t.icon.padEnd(12)} ${t.name.padEnd(10)} ${t.color}`);
  }

  // ── Collections ───────────────────────────────────────────────
  if (!user) return;

  console.log("\nCOLLECTIONS");
  console.log("─".repeat(40));
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      defaultType: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });

  for (const col of collections) {
    console.log(
      `  ${col.name.padEnd(22)} ${String(col._count.items).padStart(2)} items  [${col.defaultType?.name ?? "none"}]`
    );
  }

  // ── Items per collection ──────────────────────────────────────
  console.log("\nITEMS BY COLLECTION");
  console.log("─".repeat(40));
  for (const col of collections) {
    const items = await prisma.item.findMany({
      where: { collections: { some: { collectionId: col.id } } },
      orderBy: { createdAt: "asc" },
      include: {
        itemType: { select: { name: true } },
        tags: { select: { name: true } },
      },
    });

    console.log(`\n  ${col.name}`);
    for (const item of items) {
      const tags = item.tags.map((t) => t.name).join(", ");
      console.log(`    • [${item.itemType.name.padEnd(8)}] ${item.title}`);
      if (tags) console.log(`               tags: ${tags}`);
      if (item.url) console.log(`               url:  ${item.url}`);
    }
  }

  console.log("\n" + "─".repeat(60));
  console.log("✓ All checks passed");
  console.log("─".repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error("✗ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
