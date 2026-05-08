import ScrollReveal from './ScrollReveal';
import PricingToggle from './PricingToggle';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-[#080810]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, transparent{' '}
            <span className="bg-linear-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
              pricing
            </span>
          </h2>
          <p className="text-zinc-400 text-lg">Start free, upgrade when you need more.</p>
        </ScrollReveal>

        <ScrollReveal>
          <PricingToggle />
        </ScrollReveal>
      </div>
    </section>
  );
}
