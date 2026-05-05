import { prisma } from '@/lib/prisma';
import { ITEMS_PER_PAGE } from '@/lib/constants/pagination';

export type SidebarCollection = {
  id: string;
  name: string;
  isFavorite: boolean;
  dominantColor: string;
};

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

export async function getSidebarCollections(userId: string): Promise<SidebarCollection[]> {
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
    const typeCounts = new Map<string, { count: number; color: string }>();
    for (const ic of col.items) {
      const t = ic.item.itemType;
      const existing = typeCounts.get(t.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(t.id, { count: 1, color: t.color });
      }
    }

    let dominantColor = '#6b7280';
    let maxCount = 0;
    for (const { count, color } of typeCounts.values()) {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = color;
      }
    }

    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      dominantColor,
    };
  });
}

export type SelectableCollection = { id: string; name: string };

export async function getSelectableCollections(userId: string): Promise<SelectableCollection[]> {
  return prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export type CreateCollectionInput = {
  name: string;
  description?: string;
  userId: string;
};

export async function createCollectionInDb(input: CreateCollectionInput) {
  return prisma.collection.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      userId: input.userId,
    },
  });
}

export type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  updatedAt: Date;
  itemCount: number;
  dominantColor: string;
};

export async function getCollectionDetail(
  collectionId: string,
  userId: string,
): Promise<CollectionDetail | null> {
  const col = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    include: {
      items: {
        include: {
          item: { include: { itemType: true } },
        },
      },
    },
  });

  if (!col) return null;

  const typeCounts = new Map<string, { count: number; color: string }>();
  for (const ic of col.items) {
    const t = ic.item.itemType;
    const existing = typeCounts.get(t.id);
    if (existing) {
      existing.count++;
    } else {
      typeCounts.set(t.id, { count: 1, color: t.color });
    }
  }

  let dominantColor = '#6b7280';
  let maxCount = 0;
  for (const { count, color } of typeCounts.values()) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  }

  return {
    id: col.id,
    name: col.name,
    description: col.description,
    isFavorite: col.isFavorite,
    updatedAt: col.updatedAt,
    itemCount: col.items.length,
    dominantColor,
  };
}

export type PaginatedCollectionItems = {
  items: Array<{
    id: string;
    title: string;
    description: string | null;
    isFavorite: boolean;
    isPinned: boolean;
    createdAt: Date;
    tags: string[];
    itemType: { name: string; icon: string; color: string };
  }>;
  totalCount: number;
};

export async function getItemsInCollection(
  collectionId: string,
  userId: string,
  page = 1,
  pageSize = ITEMS_PER_PAGE,
): Promise<PaginatedCollectionItems> {
  const where = { collectionId, item: { userId } };
  const skip = (page - 1) * pageSize;

  const [itemCollections, totalCount] = await Promise.all([
    prisma.itemCollection.findMany({
      where,
      orderBy: { addedAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        item: { include: { itemType: true, tags: true } },
      },
    }),
    prisma.itemCollection.count({ where }),
  ]);

  return {
    items: itemCollections.map((ic) => ({
      id: ic.item.id,
      title: ic.item.title,
      description: ic.item.description,
      isFavorite: ic.item.isFavorite,
      isPinned: ic.item.isPinned,
      createdAt: ic.item.createdAt,
      tags: ic.item.tags.map((t) => t.name),
      itemType: {
        name: ic.item.itemType.name,
        icon: ic.item.itemType.icon,
        color: ic.item.itemType.color,
      },
    })),
    totalCount,
  };
}

export type UpdateCollectionInput = {
  id: string;
  name: string;
  description?: string;
  userId: string;
};

export async function updateCollectionInDb(input: UpdateCollectionInput) {
  return prisma.collection.updateMany({
    where: { id: input.id, userId: input.userId },
    data: {
      name: input.name,
      description: input.description ?? null,
    },
  });
}

export async function deleteCollectionInDb(collectionId: string, userId: string) {
  const col = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });
  if (!col) return null;
  return prisma.collection.delete({ where: { id: collectionId } });
}

export type SearchCollection = {
  id: string;
  name: string;
  itemCount: number;
};

export async function getSearchCollections(userId: string): Promise<SearchCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return collections.map((col) => ({
    id: col.id,
    name: col.name,
    itemCount: col._count.items,
  }));
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
