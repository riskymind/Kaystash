import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  handleSubscriptionActivated,
  handleSubscriptionCancelled,
} from './subscription';

vi.mock('@/lib/prisma', () => ({
  prisma: { user: { updateMany: vi.fn() } },
}));

const mockUpdateMany = vi.mocked(prisma.user.updateMany);

beforeEach(() => mockUpdateMany.mockResolvedValue({ count: 1 }));

describe('handleSubscriptionActivated', () => {
  it('sets isPro true and saves subscriptionId', async () => {
    await handleSubscriptionActivated('cus_123', 'sub_456');
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_123' },
      data: { isPro: true, stripeSubscriptionId: 'sub_456' },
    });
  });

  it('does not throw when no user matches', async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });
    await expect(
      handleSubscriptionActivated('cus_unknown', 'sub_456')
    ).resolves.not.toThrow();
  });
});

describe('handleSubscriptionCancelled', () => {
  it('sets isPro false and clears subscriptionId', async () => {
    await handleSubscriptionCancelled('cus_123');
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_123' },
      data: { isPro: false, stripeSubscriptionId: null },
    });
  });

  it('does not throw when no user matches', async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });
    await expect(
      handleSubscriptionCancelled('cus_unknown')
    ).resolves.not.toThrow();
  });
});
