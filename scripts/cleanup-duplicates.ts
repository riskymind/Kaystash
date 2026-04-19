import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const demoUser = await prisma.user.findUnique({ where: { email: "kele@kaystash.io" } });
  if (!demoUser) {
    console.log("Demo user not found, nothing to clean up.");
    return;
  }

  const collections = await prisma.collection.findMany({
    where: { userId: demoUser.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, createdAt: true },
  });

  // Group by name — keep the first (oldest), delete the rest
  const seen = new Map<string, string>();
  const toDelete: string[] = [];

  for (const col of collections) {
    if (seen.has(col.name)) {
      toDelete.push(col.id);
    } else {
      seen.set(col.name, col.id);
    }
  }

  if (toDelete.length === 0) {
    console.log("No duplicate collections found.");
    return;
  }

  console.log(`Found ${toDelete.length} duplicate collection(s) to remove...`);

  // Delete orphaned items (items that only belong to the duplicate collections)
  for (const colId of toDelete) {
    const itemCollections = await prisma.itemCollection.findMany({
      where: { collectionId: colId },
      select: { itemId: true },
    });

    for (const { itemId } of itemCollections) {
      // Only delete the item if it belongs to no other collection
      const otherMemberships = await prisma.itemCollection.count({
        where: { itemId, collectionId: { not: colId } },
      });
      if (otherMemberships === 0) {
        await prisma.item.delete({ where: { id: itemId } });
      }
    }

    await prisma.collection.delete({ where: { id: colId } });
    console.log(`  Deleted duplicate collection: ${colId}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
