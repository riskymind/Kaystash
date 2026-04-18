import { prisma } from '@/lib/prisma';

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
