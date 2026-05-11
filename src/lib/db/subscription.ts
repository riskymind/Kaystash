import { prisma } from '@/lib/prisma';

export async function handleSubscriptionActivated(
  stripeCustomerId: string,
  stripeSubscriptionId: string
) {
  await prisma.user.updateMany({
    where: { stripeCustomerId },
    data: { isPro: true, stripeSubscriptionId },
  });
}

export async function handleSubscriptionCancelled(stripeCustomerId: string) {
  await prisma.user.updateMany({
    where: { stripeCustomerId },
    data: { isPro: false, stripeSubscriptionId: null },
  });
}
