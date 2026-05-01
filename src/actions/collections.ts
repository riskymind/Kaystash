'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { createCollectionInDb } from '@/lib/db/collections';

const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

type CreateCollectionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createCollectionAction(formData: FormData): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  const raw = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  };

  const parsed = createCollectionSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [field, errors] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[field] = errors ?? [];
    }
    return { success: false, error: 'Validation failed.', fieldErrors };
  }

  await createCollectionInDb({
    name: parsed.data.name,
    description: parsed.data.description,
    userId: session.user.id,
  });

  return { success: true };
}
