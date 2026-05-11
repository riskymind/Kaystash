'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const FREE_FEATURES = [
  { included: true, text: '50 items total' },
  { included: true, text: '3 collections' },
  { included: true, text: 'Snippets, Prompts, Commands, Notes, Links' },
  { included: true, text: 'Basic search' },
  { included: false, text: 'File & image uploads' },
  { included: false, text: 'AI features' },
  { included: false, text: 'Data export' },
];

const PRO_FEATURES = [
  { included: true, text: 'Unlimited items' },
  { included: true, text: 'Unlimited collections' },
  { included: true, text: 'All item types incl. files & images' },
  { included: true, text: 'Instant search' },
  { included: true, text: 'AI auto-tagging' },
  { included: true, text: 'AI code explanation' },
  { included: true, text: 'AI prompt optimizer' },
  { included: true, text: 'Data export (JSON / ZIP)' },
  { included: true, text: 'Priority support' },
];

export default function PricingToggle() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={() => setYearly(false)}
          className={`text-sm cursor-pointer ${!yearly ? 'text-white font-medium' : 'text-zinc-500'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setYearly((v) => !v)}
          className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          style={{ backgroundColor: yearly ? '#7c3aed' : '#3f3f46' }}
          aria-label="Toggle yearly billing"
        >
          <span
            className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200"
            style={{ transform: yearly ? 'translateX(1.75rem)' : 'translateX(0.25rem)' }}
          />
        </button>
        <button
          onClick={() => setYearly(true)}
          className={`text-sm flex items-center gap-2 cursor-pointer ${yearly ? 'text-white font-medium' : 'text-zinc-500'}`}
        >
          Yearly
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
            Save 17%
          </span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="rounded-xl border border-white/5 bg-white/2 p-8">
          <div className="text-zinc-400 text-sm font-medium mb-4">Free</div>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-4xl font-bold text-white">₦0</span>
            <span className="text-zinc-500 mb-1">/ month</span>
          </div>
          <p className="text-zinc-500 text-sm mb-6">Perfect for getting started</p>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center mb-8')}
          >
            Get Started Free
          </Link>
          <ul className="flex flex-col gap-3">
            {FREE_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm">
                {f.included ? (
                  <Check size={14} className="text-green-400 shrink-0" />
                ) : (
                  <X size={14} className="text-zinc-600 shrink-0" />
                )}
                <span className={f.included ? 'text-zinc-300' : 'text-zinc-600'}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-8 relative">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white border-0">
            Most Popular
          </Badge>
          <div className="text-white text-sm font-medium mb-4">Pro</div>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-4xl font-bold text-white">{yearly ? '₦833' : '₦1,000'}</span>
            <span className="text-zinc-500 mb-1">/ month</span>
          </div>
          <p className="text-zinc-500 text-sm mb-6">
            {yearly ? 'Billed ₦10,000 / year' : 'Billed monthly'}
          </p>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: 'default' }), 'w-full justify-center mb-8 bg-violet-600 hover:bg-violet-500')}
          >
            Get Started
          </Link>
          <ul className="flex flex-col gap-3">
            {PRO_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm">
                <Check size={14} className="text-violet-400 shrink-0" />
                <span className="text-zinc-300">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
