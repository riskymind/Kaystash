import { prisma } from '@/lib/prisma';

export type CollectionForDashboard = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  updatedAt: Date;
  itemCount: number;
  dominantColor: string;
  typeIcons: Array<{ name: string; icon: string; color: string }>;
};

export type DashboardStats = {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
};

export async function getDashboardCollections(userId: string): Promise<CollectionForDashboard[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const itemCount = col.items.length;

    // Count items per type to find dominant color and collect unique types
    const typeCounts = new Map<string, { count: number; type: { name: string; icon: string; color: string } }>();
    for (const ic of col.items) {
      const t = ic.item.itemType;
      const existing = typeCounts.get(t.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(t.id, { count: 1, type: { name: t.name, icon: t.icon, color: t.color } });
      }
    }

    // Border color from most-used type; default to gray if no items
    let dominantColor = '#6b7280';
    let maxCount = 0;
    for (const { count, type } of typeCounts.values()) {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = type.color;
      }
    }

    const typeIcons = Array.from(typeCounts.values()).map((v) => v.type);

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      updatedAt: col.updatedAt,
      itemCount,
      dominantColor,
      typeIcons,
    };
  });
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
