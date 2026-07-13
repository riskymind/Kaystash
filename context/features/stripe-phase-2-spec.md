# Stripe Integration — Phase 2: Webhooks, Gating & Billing UI

## Overview

Wire up the Stripe checkout flow end-to-end: API routes for checkout and the
customer portal, a webhook handler that calls the Phase 1 DB helpers, free-tier
enforcement inside server actions, and the Billing section on the settings page.
Requires the Stripe CLI for local webhook testing.

## Prerequisites

- Phase 1 complete (`stripe` installed, `isPro` in session, DB helpers ready)
- Stripe Dashboard: product + two prices created, webhook endpoint registered
- Stripe CLI installed locally (`brew install stripe/stripe-tools/stripe`)

## Requirements

- Checkout session API route — creates or reuses a Stripe Customer, starts a
  subscription checkout, returns the hosted URL
- Customer portal API route — opens the Stripe-hosted billing portal
- Webhook handler — verifies signature, dispatches `checkout.session.completed`,
  `customer.subscription.updated`, `customer.subscription.deleted`,
  `invoice.payment_failed` to the Phase 1 helpers
- Free-tier enforcement — 50-item limit, 3-collection limit, block file/image
  types for non-pro users
- Billing UI — `BillingSection` component + integration into settings page
- Pass `isPro` through dashboard layout → `DashboardShell`

## Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/stripe/checkout-session/route.ts` | Start Stripe Checkout |
| `src/app/api/stripe/create-portal-session/route.ts` | Open Customer Portal |
| `src/app/api/webhooks/stripe/route.ts` | Handle Stripe events |
| `src/components/settings/BillingSection.tsx` | Billing UI (client component) |

## Files to Modify

| File | Change |
|------|--------|
| `src/actions/items.ts` | Add 50-item count guard + file/image type guard for free users |
| `src/actions/collections.ts` | Add 3-collection count guard for free users |
| `src/lib/db/profile.ts` | Add `stripeCustomerId` to `getProfileUser` select and `ProfileUser` type |
| `src/app/(dashboard)/settings/page.tsx` | Add Billing section above Editor Preferences |
| `src/app/(dashboard)/layout.tsx` | Include `isPro` in user object passed to shell |
| `src/components/layout/DashboardShell.tsx` | Accept `isPro` in props interface |

## Implementation Notes

### Checkout session route

- Auth-guard: return 401 if no session
- Accept `{ priceId }` from request body; return 400 if missing
- Look up user by `session.user.id`; select `email` and `stripeCustomerId`
- If no `stripeCustomerId`: create Stripe Customer, save ID to DB
- Create checkout session with `mode: 'subscription'`, redirect URLs pointing to
  `/settings?billing=success` and `/settings?billing=cancelled`
- Return `{ url: checkoutSession.url }`

### Customer portal route

- Auth-guard: return 401 if no session
- Look up `stripeCustomerId`; return 400 if missing (no subscription yet)
- Create billing portal session with `return_url` pointing to `/settings`
- Return `{ url: portalSession.url }`

### Webhook handler

```
POST /api/webhooks/stripe
```

- Read raw body with `req.text()` — do NOT let Next.js parse it
- Verify signature with `stripe.webhooks.constructEvent`; return 400 on failure
- Event dispatch:

| Event | Action |
|-------|--------|
| `checkout.session.completed` (mode=subscription) | Retrieve subscription, call `handleSubscriptionActivated` |
| `customer.subscription.updated` (status=active) | Call `handleSubscriptionActivated` |
| `customer.subscription.updated` (other status) | Call `handleSubscriptionCancelled` |
| `customer.subscription.deleted` | Call `handleSubscriptionCancelled` |
| `invoice.payment_failed` | Call `handleSubscriptionCancelled` |

- Export `export const config = { api: { bodyParser: false } }` at module level

### Free-tier enforcement in `src/actions/items.ts`

Add after the auth check and before `createItemInDb`:

```typescript
// 50-item limit
if (!session.user.isPro) {
  const itemCount = await prisma.item.count({ where: { userId: session.user.id } });
  if (itemCount >= 50) {
    return {
      success: false,
      error: 'You have reached the 50-item limit on the free plan. Upgrade to Pro for unlimited items.',
    };
  }
}

// Block file/image for free users (after type resolution)
const PRO_ONLY_TYPES = ['file', 'image'];
if (!session.user.isPro && PRO_ONLY_TYPES.includes(typeName)) {
  return {
    success: false,
    error: 'File and Image uploads are a Pro feature. Upgrade to unlock.',
  };
}
```

### Free-tier enforcement in `src/actions/collections.ts`

Add after the auth check and before `createCollectionInDb`:

```typescript
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

### `BillingSection` component

Client component (`'use client'`). Props: `isPro: boolean`, `hasStripeCustomer: boolean`.

- **Free user:** Shows "Free" badge, free-tier limits copy, and two upgrade cards
  (Monthly ₦1,000/mo · Annual ₦10,000/yr with "Save ₦2,000/year" note). Each
  card button calls `POST /api/stripe/checkout-session` with the relevant price
  ID and redirects to the returned URL.
- **Pro user:** Shows "Pro" badge, features copy, and (if `hasStripeCustomer`)
  a "Manage Subscription" button that calls `POST /api/stripe/create-portal-session`.
- Pass price IDs as server-rendered props from the settings page (read from
  `process.env` server-side) rather than exposing `NEXT_PUBLIC_*` vars.
- Loading state per button; `toast.error` on failed fetch.

### Settings page integration

Extend `getProfileUser` select:

```typescript
select: {
  // ...existing fields
  stripeCustomerId: true,
}
```

Add `stripeCustomerId: string | null` to `ProfileUser` type.

Add the Billing section above Editor Preferences:

```tsx
<section className="space-y-4">
  <div>
    <h2 className="text-lg font-semibold">Billing</h2>
    <p className="text-sm text-muted-foreground">Manage your subscription.</p>
  </div>
  <BillingSection
    isPro={session.user.isPro}
    hasStripeCustomer={!!user.stripeCustomerId}
    monthlyPriceId={process.env.STRIPE_PRICE_MONTHLY!}
    yearlyPriceId={process.env.STRIPE_PRICE_YEARLY!}
  />
</section>
<Separator />
```

## Local Webhook Testing

Use the Stripe CLI to forward events to the local dev server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a webhook signing secret — use it as `STRIPE_WEBHOOK_SECRET` in
`.env` during development (different from the Dashboard secret).

Trigger test events manually:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

## Testing Checklist

### Setup
- [ ] Stripe products and two prices created in test mode
- [ ] Price IDs saved in `.env`
- [ ] Stripe CLI forwarding active (`stripe listen ...`)

### Checkout
- [ ] "Upgrade Monthly" redirects to Stripe-hosted checkout
- [ ] "Upgrade Annually" redirects to Stripe-hosted checkout
- [ ] Missing `priceId` in request body returns 400
- [ ] Completing test checkout triggers webhook → `isPro = true` in DB
- [ ] Reloading `/settings` after checkout shows "Pro" plan
- [ ] `stripeCustomerId` and `stripeSubscriptionId` are saved on the user row

### Customer Portal
- [ ] "Manage Subscription" opens the Stripe Customer Portal
- [ ] Cancelling via portal triggers webhook → `isPro = false` in DB
- [ ] Switching monthly ↔ yearly updates `stripeSubscriptionId` in DB

### Webhook Security
- [ ] Valid signature returns `{ received: true }` with 200
- [ ] Tampered/missing signature returns 400
- [ ] Unknown `stripeCustomerId` does not crash (updateMany finds 0 rows, no error)

### Free-Tier Limits
- [ ] 51st item creation returns upgrade error toast
- [ ] 4th collection creation returns upgrade error toast
- [ ] Creating a file or image item as a free user returns upgrade error toast
- [ ] Pro users are not blocked by any of the above limits

### Build
- [ ] `npm run build` passes with no TypeScript errors
