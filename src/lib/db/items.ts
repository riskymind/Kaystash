import { prisma } from '@/lib/prisma';

// Slug → DB name map (URL uses plural, DB stores singular)
const TYPE_SLUG_MAP: Record<string, string> = {
  snippets: 'snippet',
  prompts: 'prompt',
  commands: 'command',
  notes: 'note',
  files: 'file',
  images: 'image',
  links: 'link',
};

export function typeSlugToName(slug: string): string | null {
  return TYPE_SLUG_MAP[slug] ?? null;
}

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

export async function getItemsByType(userId: string, typeName: string): Promise<ItemForDashboard[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      itemType: { name: typeName },
    },
    orderBy: { createdAt: 'desc' },
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

export type CreateItemInput = {
  title: string;
  description?: string;
  content?: string;
  url?: string;
  language?: string;
  tags: string[];
  itemTypeId: string;
  contentType: 'TEXT' | 'FILE' | 'URL';
  userId: string;
};

export async function createItemInDb(input: CreateItemInput) {
  const { tags, userId, ...rest } = input;

  return prisma.item.create({
    data: {
      ...rest,
      userId,
      tags: {
        connectOrCreate: tags
          .filter((t) => t.trim().length > 0)
          .map((name) => ({
            where: { name: name.trim().toLowerCase() },
            create: { name: name.trim().toLowerCase() },
          })),
      },
    },
    include: { itemType: true, tags: true },
  });
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
