# Stripe Subscription Integration Plan

**Pricing:** ₦1,000/month · ₦10,000/year (Pro tier)

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Schema fields | ✅ Ready | `isPro`, `stripeCustomerId`, `stripeSubscriptionId` already in User model |
| Auth callbacks | ⚠️ Needs update | `isPro` not in JWT token or session |
| Type extensions | ⚠️ Needs update | Session interface only has `id` |
| API route pattern | ✅ Ready | Standard auth + JSON error shape established |
| Server action pattern | ✅ Ready | Zod + `{ success, error, fieldErrors }` established |
| DB limits | ⚠️ Missing | No free-tier item/collection count enforcement |
| Settings UI | ⚠️ Missing | No billing section exists |
| Stripe package | ❌ Missing | Not installed |

---

## Implementation Order

1. [Stripe Dashboard setup](#1-stripe-dashboard-setup)
2. [Install package + environment variables](#2-install--environment)
3. [Stripe client singleton](#3-srclibstripets)
4. [Extend auth session with `isPro`](#4-extend-auth-session)
5. [Checkout session API route](#5-srcappistripe-checkout-sessionroutets)
6. [Customer portal API route](#6-srcapistripecreate-portal-sessionroutets)
7. [Webhook handler](#7-srcapiwebhoodsstripe-routets)
8. [Subscription DB helpers](#8-srclibdbsubscriptionts)
9. [Free-tier enforcement](#9-free-tier-enforcement)
10. [Billing settings UI](#10-billing-ui)
11. [Pass `isPro` through layout → shell](#11-pass-ispro-through-layout--shell)
12. [Pro badge in sidebar](#12-pro-badge-in-sidebar)

---

## 1. Stripe Dashboard Setup

### Products & Prices
Create one product with two prices:

```
Product: "KayStash Pro"
  Price 1: ₦1,000.00 NGN / month  (recurring)  → copy price ID → STRIPE_PRICE_MONTHLY
  Price 2: ₦10,000.00 NGN / year  (recurring)  → copy price ID → STRIPE_PRICE_YEARLY
```

### Webhook Endpoint
Register: `https://yourdomain.com/api/webhooks/stripe`

**Events to listen for:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

### Customer Portal
Enable in Stripe Dashboard → Billing → Customer Portal:
- Allow subscription cancellation
- Allow plan switching (monthly ↔ yearly)
- Allow payment method update

---

## 2. Install + Environment

```bash
npm install stripe
```

Add to `.env` (and `.env.example`):
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

**`.env.example` additions:**
```env
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 3. `src/lib/stripe.ts`

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});
```

---

## 4. Extend Auth Session

### `src/types/next-auth.d.ts` — add `isPro`

```typescript
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isPro?: boolean;
  }
}
```

### `src/auth.ts` — update callbacks

Replace the existing `session` callback and add a `jwt` callback:

```typescript
// In NextAuth config callbacks:

async jwt({ token, user }) {
  if (user) {
    token.sub = user.id;
  }

  // Always sync isPro from DB so webhook updates are reflected on next session check
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
  if (token.sub) {
    session.user.id = token.sub;
  }
  session.user.isPro = token.isPro ?? false;
  return session;
},
```

> **Why always sync:** Stripe webhook updates `isPro` in the DB. Since there's no reliable push mechanism to invalidate the JWT, syncing on every token validation ensures a simple page reload after checkout is enough to pick up pro status.

---

## 5. `src/app/api/stripe/checkout-session/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await req.json();
  if (!priceId) {
    return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Reuse existing customer or create a new one
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/settings?billing=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings?billing=cancelled`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

---

## 6. `src/app/api/stripe/create-portal-session/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

---

## 7. `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import {
  handleSubscriptionActivated,
  handleSubscriptionCancelled,
} from '@/lib/db/subscription';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.mode === 'subscription' && checkoutSession.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          checkoutSession.subscription as string
        );
        await handleSubscriptionActivated(
          checkoutSession.customer as string,
          subscription.id
        );
      }
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.status === 'active') {
        await handleSubscriptionActivated(
          subscription.customer as string,
          subscription.id
        );
      } else {
        await handleSubscriptionCancelled(subscription.customer as string);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(subscription.customer as string);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleSubscriptionCancelled(invoice.customer as string);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// Required: disable body parsing so stripe.webhooks.constructEvent gets raw body
export const config = { api: { bodyParser: false } };
```

---

## 8. `src/lib/db/subscription.ts`

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

---

## 9. Free-Tier Enforcement

### `src/actions/items.ts` — enforce 50-item limit

Add this check inside `createItemAction`, after the auth check and before `createItemInDb`:

```typescript
// Free-tier limit: 50 items
if (!session.user.isPro) {
  const itemCount = await prisma.item.count({ where: { userId: session.user.id } });
  if (itemCount >= 50) {
    return {
      success: false,
      error: 'You have reached the 50-item limit on the free plan. Upgrade to Pro for unlimited items.',
    };
  }
}
```

### `src/actions/collections.ts` — enforce 3-collection limit

Add inside `createCollectionAction`, after auth check:

```typescript
// Free-tier limit: 3 collections
if (!session.user.isPro) {
  const collectionCount = await prisma.collection.count({ where: { userId: session.user.id } });
  if (collectionCount >= 3) {
    return {
      success: false,
      error: 'You have reached the 3-collection limit on the free plan. Upgrade to Pro for unlimited collections.',
    };
  }
}
```

### `src/actions/items.ts` — block file/image types for free users

Inside `createItemAction`, after the type resolution step:

```typescript
const PRO_ONLY_TYPES = ['file', 'image'];
if (!session.user.isPro && PRO_ONLY_TYPES.includes(typeName)) {
  return {
    success: false,
    error: 'File and Image uploads are a Pro feature. Upgrade to unlock.',
  };
}
```

---

## 10. Billing UI

### `src/components/settings/BillingSection.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BillingSectionProps {
  isPro: boolean;
  hasStripeCustomer: boolean;
}

export function BillingSection({ isPro, hasStripeCustomer }: BillingSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function startCheckout(priceId: string) {
    setLoading(priceId);
    const res = await fetch('/api/stripe/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error('Could not start checkout. Please try again.');
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading('portal');
    const res = await fetch('/api/stripe/create-portal-session', { method: 'POST' });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error('Could not open billing portal. Please try again.');
      setLoading(null);
    }
  }

  if (isPro) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Current plan:</span>
          <Badge>Pro</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          You have access to all Pro features — unlimited items, collections, file uploads, and AI tools.
        </p>
        {hasStripeCustomer && (
          <Button variant="outline" onClick={openPortal} disabled={loading === 'portal'}>
            {loading === 'portal' ? 'Opening...' : 'Manage Subscription'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Current plan:</span>
        <Badge variant="outline">Free</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Free plan includes 50 items and 3 collections. Upgrade to Pro for unlimited access.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-3">
          <div>
            <p className="font-medium">Monthly</p>
            <p className="text-2xl font-bold">₦1,000<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          </div>
          <Button
            className="w-full"
            onClick={() => startCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!)}
            disabled={!!loading}
          >
            {loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ? 'Redirecting...' : 'Upgrade Monthly'}
          </Button>
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <div>
            <p className="font-medium">Annual</p>
            <p className="text-2xl font-bold">₦10,000<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
            <p className="text-xs text-muted-foreground">Save ₦2,000/year</p>
          </div>
          <Button
            className="w-full"
            onClick={() => startCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY!)}
            disabled={!!loading}
          >
            {loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY ? 'Redirecting...' : 'Upgrade Annually'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

> **Note:** Move the price IDs to server-side if you don't want to expose them. Pass them as props from the server component instead of reading `process.env.NEXT_PUBLIC_*`.

### `src/app/(dashboard)/settings/page.tsx` — add billing section

Add these imports and section:

```typescript
// new import
import { BillingSection } from '@/components/settings/BillingSection';

// In the page component, extend what's fetched:
const [user, stats] = await Promise.all([
  getProfileUser(session.user.id),
  getProfileStats(session.user.id),
]);

// Then add a new section before Editor Preferences:
<section className="space-y-4">
  <div>
    <h2 className="text-lg font-semibold">Billing</h2>
    <p className="text-sm text-muted-foreground">Manage your subscription.</p>
  </div>
  <BillingSection
    isPro={session.user.isPro}
    hasStripeCustomer={!!user.stripeCustomerId}
  />
</section>

<Separator />
```

You'll also need to add `stripeCustomerId` to `getProfileUser` in `src/lib/db/profile.ts`:

```typescript
// In getProfileUser, extend the select:
select: {
  id: true,
  name: true,
  email: true,
  image: true,
  isPro: true,
  stripeCustomerId: true,   // add this
  password: true,
  createdAt: true,
},
```

And update the return type in `src/lib/db/profile.ts`:

```typescript
export type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isPro: boolean;
  stripeCustomerId: string | null;  // add this
  hasPassword: boolean;
  createdAt: Date;
};
```

---

## 11. Pass `isPro` Through Layout → Shell

### `src/app/(dashboard)/layout.tsx`

```typescript
// Extend the user object:
const user = {
  name: session.user.name,
  email: session.user.email,
  image: session.user.image,
  isPro: session.user.isPro,   // add this
};
```

### `src/components/layout/DashboardShell.tsx`

```typescript
// Extend DashboardShellProps:
interface DashboardShellProps {
  // ... existing props
  user: {
    name: string | null | undefined;
    email: string | null | undefined;
    image: string | null | undefined;
    isPro: boolean;             // add this
  };
}
```

Pass `isPro` down to `SidebarContent` and `UserAvatar` as needed for gating UI.

---

## 12. Pro Badge in Sidebar

In `src/components/layout/SidebarContent.tsx`, show a "Pro" badge or upgrade prompt based on `isPro`. The file/image item types already have a static "PRO" badge — you can make those clickable links to `/settings` for free users.

---

## 13. Webhook Testing (Local)

Use the Stripe CLI to forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This prints a local webhook secret — put it in `.env` as `STRIPE_WEBHOOK_SECRET` during development.

To trigger test events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

---

## Testing Checklist

### Setup
- [ ] Stripe products and prices created in test mode
- [ ] Price IDs copied into `.env`
- [ ] Webhook endpoint registered (or CLI forwarding active)
- [ ] `stripe` npm package installed

### Auth
- [ ] `isPro` appears in `session.user` (check via `console.log(session)` in a server component)
- [ ] After toggling `isPro` directly in DB, a page reload updates the session

### Checkout
- [ ] Clicking "Upgrade Monthly" redirects to Stripe checkout
- [ ] Clicking "Upgrade Annually" redirects to Stripe checkout
- [ ] Completing checkout updates `isPro = true` in DB via webhook
- [ ] After checkout, reloading `/settings` shows Pro plan
- [ ] `stripeCustomerId` and `stripeSubscriptionId` are saved on the user

### Portal
- [ ] "Manage Subscription" redirects to Stripe Customer Portal
- [ ] Cancelling subscription updates `isPro = false` via webhook
- [ ] Switching plans updates subscription ID in DB

### Free-Tier Limits
- [ ] Creating the 51st item returns a clear upgrade error toast
- [ ] Creating the 4th collection returns a clear upgrade error toast
- [ ] Creating a file or image item as a free user returns an upgrade error
- [ ] Pro users are not blocked by any of the above

### Edge Cases
- [ ] Webhook with unknown customer ID doesn't crash (updateMany finds no rows, silently succeeds)
- [ ] Invalid webhook signature returns 400, not 500
- [ ] Checkout with missing `priceId` returns 400

---

## Files Summary

### Create
| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe singleton |
| `src/lib/db/subscription.ts` | DB helpers for webhook events |
| `src/app/api/stripe/checkout-session/route.ts` | Start Stripe Checkout |
| `src/app/api/stripe/create-portal-session/route.ts` | Open Customer Portal |
| `src/app/api/webhooks/stripe/route.ts` | Handle Stripe events |
| `src/components/settings/BillingSection.tsx` | Billing UI for settings page |

### Modify
| File | Change |
|------|--------|
| `src/types/next-auth.d.ts` | Add `isPro` to `Session` and `JWT` interfaces |
| `src/auth.ts` | Add `jwt` callback that syncs `isPro` from DB; update `session` callback |
| `src/app/(dashboard)/settings/page.tsx` | Add Billing section |
| `src/lib/db/profile.ts` | Add `stripeCustomerId`, `isPro` to `getProfileUser` select + return type |
| `src/actions/items.ts` | Add free-tier item count and type (file/image) guards |
| `src/actions/collections.ts` | Add free-tier collection count guard |
| `src/app/(dashboard)/layout.tsx` | Include `isPro` in user object passed to shell |
| `src/components/layout/DashboardShell.tsx` | Accept `isPro` in props |
| `.env.example` | Add all Stripe env vars |
