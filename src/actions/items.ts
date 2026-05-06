'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { createItemInDb, updateItemInDb, deleteItemInDb, toggleItemFavoriteInDb, ItemDetail } from '@/lib/db/items';
import { prisma } from '@/lib/prisma';

const CONTENT_TYPES = {
  snippet: 'TEXT',
  command: 'TEXT',
  prompt: 'TEXT',
  note: 'TEXT',
  link: 'URL',
} as const;

const createItemSchema = z
  .object({
    type: z.enum(['snippet', 'prompt', 'command', 'note', 'link']),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(500).optional(),
    content: z.string().optional(),
    url: z.string().optional(),
    language: z.string().optional(),
    tags: z.string().optional(), // comma-separated
  })
  .superRefine((data, ctx) => {
    if (data.type === 'link') {
      if (!data.url || data.url.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'URL is required', path: ['url'] });
      } else {
        try {
          new URL(data.url);
        } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be a valid URL', path: ['url'] });
        }
      }
    }
  });

type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createItemAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  const rawCollectionIds = formData.get('collectionIds');
  const collectionIds: string[] = rawCollectionIds
    ? (JSON.parse(rawCollectionIds as string) as string[])
    : [];

  const raw = {
    type: formData.get('type'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    content: formData.get('content') || undefined,
    url: formData.get('url') || undefined,
    language: formData.get('language') || undefined,
    tags: formData.get('tags') || undefined,
  };

  const parsed = createItemSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [field, errors] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[field] = errors ?? [];
    }
    return { success: false, error: 'Validation failed.', fieldErrors };
  }

  const { type, title, description, content, url, language, tags } = parsed.data;

  const itemType = await prisma.itemType.findFirst({
    where: { name: type, isSystem: true },
    select: { id: true },
  });

  if (!itemType) return { success: false, error: 'Invalid item type.' };

  const tagList = tags
    ? tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  await createItemInDb({
    title,
    description,
    content,
    url,
    language,
    tags: tagList,
    collectionIds,
    itemTypeId: itemType.id,
    contentType: CONTENT_TYPES[type],
    userId: session.user.id,
  });

  return { success: true };
}

const updateItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).nullable().optional(),
  content: z.string().nullable().optional(),
  url: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || (() => { try { new URL(val); return true; } catch { return false; } })(),
      { message: 'Must be a valid URL' },
    ),
  language: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
});

type UpdateActionResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateItemAction(
  itemId: string,
  data: {
    title: string;
    description: string | null;
    content: string | null;
    url: string | null;
    language: string | null;
    tags: string[];
    collectionIds: string[];
  },
): Promise<UpdateActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  const { collectionIds, ...rest } = data;

  const parsed = updateItemSchema.safeParse(rest);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '_');
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { success: false, error: 'Validation failed.', fieldErrors };
  }

  const updated = await updateItemInDb(itemId, session.user.id, { ...parsed.data, collectionIds });
  if (!updated) return { success: false, error: 'Item not found or access denied.' };

  return { success: true, data: updated };
}

type DeleteActionResult = { success: true } | { success: false; error: string };

export async function deleteItemAction(itemId: string): Promise<DeleteActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  const deleted = await deleteItemInDb(itemId, session.user.id);
  if (!deleted) return { success: false, error: 'Item not found or access denied.' };

  return { success: true };
}

type ToggleFavoriteResult =
  | { success: true; isFavorite: boolean }
  | { success: false; error: string };

export async function toggleItemFavoriteAction(itemId: string): Promise<ToggleFavoriteResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  const result = await toggleItemFavoriteInDb(itemId, session.user.id);
  if (result === null) return { success: false, error: 'Item not found or access denied.' };

  return { success: true, isFavorite: result };
}
