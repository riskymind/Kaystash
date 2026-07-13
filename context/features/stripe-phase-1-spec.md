# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Install the Stripe package, wire `isPro` into the auth session, and create the
DB helpers that webhooks will call in Phase 2. No API routes or UI yet — just
the foundation that everything else depends on.

## Requirements

- Install `stripe` npm package
- Add all Stripe env vars to `.env` and `.env.example`
- Create a Stripe client singleton at `src/lib/stripe.ts`
- Extend the NextAuth session so `isPro` is available in `session.user`
- Create `src/lib/db/subscription.ts` with activate/cancel helpers
- Write Vitest unit tests for the subscription DB helpers

## Files to Create

1. `src/lib/stripe.ts` — Stripe singleton
2. `src/lib/db/subscription.ts` — DB helpers for subscription state changes
3. `src/lib/db/subscription.test.ts` — Unit tests (mock Prisma)

## Files to Modify

| File | Change |
|------|--------|
| `.env.example` | Add all five Stripe env vars |
| `src/types/next-auth.d.ts` | Add `isPro: boolean` to `Session` and `JWT` interfaces |
| `src/auth.ts` | Add `jwt` callback (syncs `isPro` from DB on every token refresh); update `session` callback to forward `isPro` |

## Environment Variables

```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## Implementation Notes

### `src/lib/stripe.ts`

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});
```

### Auth callbacks — why always sync `isPro` from DB

The webhook updates `isPro` in the DB after checkout. There is no push
mechanism to invalidate the JWT, so the `jwt` callback queries the DB on every
token refresh. A simple page reload after checkout is enough for the session to
reflect pro status.

```typescript
async jwt({ token, user }) {
  if (user) token.sub = user.id;
  if (token.sub) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { isPro: true },
    });
    token.isPro = dbUser?.isPro ?? false;
  }
  return token;
},

async session({ session, token }) {
  if (token.sub) session.user.id = token.sub;
  session.user.isPro = token.isPro ?? false;
  return session;
},
```

### `src/lib/db/subscription.ts`

```typescript
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
```

## Unit Tests

File: `src/lib/db/subscription.test.ts`

Mock `@/lib/prisma` with `vi.mock`. Tests cover:

| Test | Assertion |
|------|-----------|
| `handleSubscriptionActivated` sets `isPro: true` and saves `stripeSubscriptionId` | `prisma.user.updateMany` called with correct `where` and `data` |
| `handleSubscriptionCancelled` sets `isPro: false` and clears `stripeSubscriptionId` | `prisma.user.updateMany` called with `stripeSubscriptionId: null` |
| Unknown `stripeCustomerId` does not throw | `updateMany` finds no rows silently (no error thrown) |

```typescript
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
```

## Testing Checklist

- [ ] `npm install stripe` succeeds
- [ ] `.env.example` contains all five Stripe vars
- [ ] `src/lib/stripe.ts` exports `stripe` singleton without TypeScript errors
- [ ] `isPro` appears in `session.user` (verify via `console.log(session)` in any server component)
- [ ] After manually toggling `isPro` in the DB, a page reload updates the session value
- [ ] `npm run test` passes for `subscription.test.ts`
- [ ] `npm run build` passes with no TypeScript errors
