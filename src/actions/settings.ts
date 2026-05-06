'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { EditorPreferences } from '@/types/editor-preferences';

type ActionResult = { success: true } | { success: false; error: string };

export async function updateEditorPreferencesAction(
  preferences: Partial<EditorPreferences>
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { editorPreferences: preferences },
  });

  return { success: true };
}
