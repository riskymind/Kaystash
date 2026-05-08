import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChaosAnimation from './ChaosAnimation';
import ScrollReveal from './ScrollReveal';

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center pt-16 bg-[#080810]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-6">
              Developer Knowledge Hub
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Stop Losing Your<br />
              <span className="bg-linear-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                Developer Knowledge
              </span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-lg">
              Your snippets live in VS Code. Your best prompts are buried in chat histories.
              Your links are scattered across bookmarks. KayStash brings it all into one
              fast, searchable hub.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className={buttonVariants({ size: 'lg' })}>
                Get Started Free
              </Link>
              <Link
                href="#features"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'lg' }),
                  'text-zinc-300 hover:text-white border border-white/10'
                )}
              >
                See Features
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal className="w-full">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">

              <div className="flex-1 w-full">
                <div className="text-xs text-zinc-500 mb-2 text-center">Your knowledge today...</div>
                <ChaosAnimation />
              </div>

              <div className="shrink-0 rotate-90 sm:rotate-0 text-zinc-500 text-2xl opacity-60 animate-pulse">
                →
              </div>

              <div className="flex-1 w-full">
                <div className="text-xs text-zinc-500 mb-2 text-center">...with KayStash</div>
                <div className="h-52 rounded-lg border border-white/5 bg-zinc-900/50 overflow-hidden flex">
                  <div className="w-28 border-r border-white/5 p-3 flex flex-col gap-2">
                    {[
                      { label: 'Snippets', color: '#3b82f6' },
                      { label: 'Prompts', color: '#8b5cf6' },
                      { label: 'Commands', color: '#f97316' },
                      { label: 'Notes', color: '#fde047' },
                      { label: 'Links', color: '#10b981' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                        <span className="text-xs text-zinc-400 truncate">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-3 grid grid-cols-2 gap-2 content-start">
                    {['#3b82f6', '#8b5cf6', '#f97316', '#10b981'].map((color, i) => (
                      <div key={i} className="rounded border-t-2 bg-zinc-800/60 p-2" style={{ borderTopColor: color }}>
                        <div className="h-1.5 bg-zinc-600 rounded mb-1.5" />
                        <div className="h-1.5 bg-zinc-700 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
