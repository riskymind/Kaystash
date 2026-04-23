'use server';

import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

type ActionResult = { success: true } | { success: false; error: string };

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return { success: false, error: 'No password set on this account.' };
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: true };
}

export async function deleteAccountAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  await prisma.user.delete({ where: { id: session.user.id } });

  await signOut({ redirectTo: '/sign-in' });
  return { success: true };
}
