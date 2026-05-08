import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ScrollReveal from './ScrollReveal';

export default function CTASection() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="rounded-2xl border border-white/5 bg-linear-to-br from-blue-500/5 to-violet-500/5 p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to organize your knowledge?
            </h2>
            <p className="text-zinc-400 text-lg mb-8">
              Join developers who&apos;ve stopped losing their best work.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className={buttonVariants({ size: 'lg' })}>
                Start for Free
              </Link>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'lg' }),
                  'text-zinc-300 hover:text-white border border-white/10'
                )}
              >
                View Demo
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
