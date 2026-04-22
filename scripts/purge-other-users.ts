import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const KEEP_EMAIL = "kele@kaystash.io";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const keepUser = await prisma.user.findUnique({ where: { email: KEEP_EMAIL } });
  if (!keepUser) {
    console.log(`User ${KEEP_EMAIL} not found — aborting to avoid wiping everything.`);
    process.exit(1);
  }

  const usersToDelete = await prisma.user.findMany({
    where: { email: { not: KEEP_EMAIL } },
    select: { id: true, email: true },
  });

  if (usersToDelete.length === 0) {
    console.log("No other users found. Nothing to delete.");
    return;
  }

  console.log(`Found ${usersToDelete.length} user(s) to delete:`);
  for (const u of usersToDelete) {
    console.log(`  - ${u.email} (${u.id})`);
  }

  const userIds = usersToDelete.map((u) => u.id);

  // Delete in dependency order to satisfy foreign key constraints.
  // Cascades handle items → itemCollections and collections → itemCollections,
  // but we delete explicitly for clarity and to handle tags (many-to-many).

  // 1. Disconnect tags from items belonging to these users
  const userItems = await prisma.item.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const userItemIds = userItems.map((i) => i.id);

  if (userItemIds.length > 0) {
    await prisma.item.updateMany({
      where: { id: { in: userItemIds } },
      data: {}, // trigger for relation disconnect via deleteMany below
    });

    // Disconnect tag relations (implicit many-to-many) by deleting items directly —
    // Prisma cascades handle ItemCollection rows; tags themselves are shared and stay.
    await prisma.item.deleteMany({ where: { id: { in: userItemIds } } });
    console.log(`Deleted ${userItemIds.length} item(s).`);
  }

  // 2. Delete collections (ItemCollection rows cascaded)
  const { count: colCount } = await prisma.collection.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`Deleted ${colCount} collection(s).`);

  // 3. Delete NextAuth accounts and sessions
  await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });

  // 4. Delete the users themselves
  const { count: userCount } = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });
  console.log(`Deleted ${userCount} user(s).`);

  console.log(`Done. Kept: ${KEEP_EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
