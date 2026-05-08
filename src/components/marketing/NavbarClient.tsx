'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function NavbarClient({ showNavLinks = true }: { showNavLinks?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-zinc-950/80 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-white font-semibold text-lg"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-xl">⌨</span>
          <span>kaystash</span>
        </Link>

        {showNavLinks && (
          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollTo('pricing')} className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer">
              Pricing
            </button>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: 'ghost' }), 'text-zinc-300 hover:text-white')}
          >
            Sign In
          </Link>
          <Link href="/register" className={buttonVariants({ variant: 'default' })}>
            Get Started
          </Link>
        </div>

        <button
          className="lg:hidden p-2 text-zinc-400 hover:text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-zinc-950/95 backdrop-blur-md border-b border-white/5 px-4 pb-4 flex flex-col gap-3">
          {showNavLinks && (
            <>
              <button
                className="text-sm text-zinc-400 hover:text-white py-2 transition-colors text-left cursor-pointer"
                onClick={() => { scrollTo('features'); setMobileOpen(false); }}
              >
                Features
              </button>
              <button
                className="text-sm text-zinc-400 hover:text-white py-2 transition-colors text-left cursor-pointer"
                onClick={() => { scrollTo('pricing'); setMobileOpen(false); }}
              >
                Pricing
              </button>
            </>
          )}
          <Link
            href="/sign-in"
            className="text-sm text-zinc-400 hover:text-white py-2 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: 'default' }), 'w-full justify-center')}
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
