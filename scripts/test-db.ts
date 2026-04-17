import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // Raw connection check
  const result = await prisma.$queryRaw<[{ now: Date }]>`SELECT NOW()`;
  console.log("✓ Connected to database at:", result[0].now);

  // Check each table exists and count rows
  const [
    userCount,
    itemTypeCount,
    itemCount,
    collectionCount,
    tagCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.itemType.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ]);

  console.log("\nTable row counts:");
  console.log(`  users:        ${userCount}`);
  console.log(`  item_types:   ${itemTypeCount}`);
  console.log(`  items:        ${itemCount}`);
  console.log(`  collections:  ${collectionCount}`);
  console.log(`  tags:         ${tagCount}`);

  console.log("\n✓ All tables accessible. Database is ready.");
}

main()
  .catch((e) => {
    console.error("✗ Database test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
