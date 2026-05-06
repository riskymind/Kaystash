import { prisma } from '@/lib/prisma';
import { EditorPreferences, DEFAULT_EDITOR_PREFERENCES } from '@/types/editor-preferences';

export type ProfileUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
};

export type ProfileTypeStat = {
  name: string;
  icon: string;
  color: string;
  count: number;
};

export type ProfileStats = {
  totalItems: number;
  totalCollections: number;
  byType: ProfileTypeStat[];
};

export async function getProfileUser(userId: string): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      password: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: !!user.password,
  };
}

export async function getEditorPreferences(userId: string): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  });

  if (!user?.editorPreferences) return DEFAULT_EDITOR_PREFERENCES;

  return { ...DEFAULT_EDITOR_PREFERENCES, ...(user.editorPreferences as Partial<EditorPreferences>) };
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, itemTypes] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { items: { where: { userId } } },
        },
      },
    }),
  ]);

  return {
    totalItems,
    totalCollections,
    byType: itemTypes.map((t) => ({
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: t._count.items,
    })),
  };
}
