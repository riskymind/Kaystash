import Navbar from '@/components/marketing/Navbar';
import HeroSection from '@/components/marketing/HeroSection';
import FeaturesSection from '@/components/marketing/FeaturesSection';
import AISection from '@/components/marketing/AISection';
import PricingSection from '@/components/marketing/PricingSection';
import CTASection from '@/components/marketing/CTASection';
import Footer from '@/components/marketing/Footer';

export default function Home() {
  return (
    <main className="bg-[#080810] min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AISection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
