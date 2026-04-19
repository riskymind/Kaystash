import { prisma } from '@/lib/prisma';

export type SidebarItemType = {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
};

export type ItemForDashboard = {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  tags: string[];
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
};

export async function getItemTypesWithCounts(userId: string): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { items: { where: { userId } } },
      },
    },
  });

  return types.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    color: t.color,
    count: t._count.items,
  }));
}

export async function getPinnedItems(userId: string): Promise<ItemForDashboard[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: 'desc' },
    include: {
      itemType: true,
      tags: true,
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    tags: item.tags.map((t) => t.name),
    itemType: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
  }));
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemForDashboard[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      itemType: true,
      tags: true,
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    tags: item.tags.map((t) => t.name),
    itemType: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
  }));
}
