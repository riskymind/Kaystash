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

export type ItemDetail = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  contentType: string;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  collections: { id: string; name: string }[];
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
};

export async function getItemDetail(itemId: string, userId: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: { collection: { select: { id: true, name: true } } },
      },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    language: item.language,
    contentType: item.contentType,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    tags: item.tags.map((t) => t.name),
    collections: item.collections.map((ic) => ({
      id: ic.collection.id,
      name: ic.collection.name,
    })),
    itemType: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
  };
}

export type CreateItemInput = {
  title: string;
  description?: string;
  content?: string;
  url?: string;
  language?: string;
  tags: string[];
  collectionIds?: string[];
  itemTypeId: string;
  contentType: 'TEXT' | 'FILE' | 'URL';
  userId: string;
};

export type UpdateItemInput = {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags: string[];
  collectionIds: string[];
};

export async function updateItemInDb(
  itemId: string,
  userId: string,
  input: UpdateItemInput,
): Promise<ItemDetail | null> {
  const { tags, collectionIds, ...rest } = input;

  const existing = await prisma.item.findFirst({ where: { id: itemId, userId } });
  if (!existing) return null;

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: {
      ...rest,
      tags: {
        set: [],
        connectOrCreate: tags
          .filter((t) => t.trim().length > 0)
          .map((name) => ({
            where: { name: name.trim().toLowerCase() },
            create: { name: name.trim().toLowerCase() },
          })),
      },
      collections: {
        deleteMany: {},
        create: collectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: { collection: { select: { id: true, name: true } } },
      },
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    description: updated.description,
    content: updated.content,
    url: updated.url,
    language: updated.language,
    contentType: updated.contentType,
    isFavorite: updated.isFavorite,
    isPinned: updated.isPinned,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    tags: updated.tags.map((t) => t.name),
    collections: updated.collections.map((ic) => ({
      id: ic.collection.id,
      name: ic.collection.name,
    })),
    itemType: {
      name: updated.itemType.name,
      icon: updated.itemType.icon,
      color: updated.itemType.color,
    },
  };
}

export async function deleteItemInDb(itemId: string, userId: string): Promise<boolean> {
  const existing = await prisma.item.findFirst({ where: { id: itemId, userId } });
  if (!existing) return false;
  await prisma.item.delete({ where: { id: itemId } });
  return true;
}

export async function createItemInDb(input: CreateItemInput) {
  const { tags, collectionIds, userId, ...rest } = input;

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
      ...(collectionIds?.length
        ? { collections: { create: collectionIds.map((collectionId) => ({ collectionId })) } }
        : {}),
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
