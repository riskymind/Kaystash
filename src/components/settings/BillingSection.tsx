'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BillingSectionProps {
  isPro: boolean;
  hasStripeCustomer: boolean;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export function BillingSection({ isPro, hasStripeCustomer, monthlyPriceId, yearlyPriceId }: BillingSectionProps) {
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function handleUpgrade(priceId: string) {
    setLoadingPrice(priceId);
    try {
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Failed to start checkout.');
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingPrice(null);
    }
  }

  async function handleManage() {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/stripe/create-portal-session', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Failed to open billing portal.');
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingPortal(false);
    }
  }

  if (isPro) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-violet-600 hover:bg-violet-600 text-white">Pro</Badge>
          <span className="text-sm text-muted-foreground">You have access to all Pro features.</span>
        </div>
        {hasStripeCustomer && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManage}
            disabled={loadingPortal}
          >
            {loadingPortal ? 'Loading...' : 'Manage Subscription'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">Free</Badge>
        <span className="text-sm text-muted-foreground">50 items · 3 collections · no file uploads</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
          <div>
            <p className="text-sm font-medium">Monthly</p>
            <p className="text-2xl font-bold mt-0.5">₦1,000<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={() => handleUpgrade(monthlyPriceId)}
            disabled={loadingPrice !== null}
          >
            {loadingPrice === monthlyPriceId ? 'Loading...' : 'Upgrade Monthly'}
          </Button>
        </div>

        <div className="rounded-md border border-violet-500/40 bg-violet-500/5 p-4 space-y-3">
          <div>
            <p className="text-sm font-medium">Annual</p>
            <p className="text-2xl font-bold mt-0.5">₦10,000<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
            <p className="text-xs text-emerald-400 mt-0.5">Save ₦2,000/year</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full border-violet-500/40"
            onClick={() => handleUpgrade(yearlyPriceId)}
            disabled={loadingPrice !== null}
          >
            {loadingPrice === yearlyPriceId ? 'Loading...' : 'Upgrade Annually'}
          </Button>
        </div>
      </div>
    </div>
  );
}
