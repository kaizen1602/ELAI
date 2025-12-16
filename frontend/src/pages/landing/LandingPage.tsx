import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { FeaturesSection } from './components/FeaturesSection';
import { BenefitsSection } from './components/BenefitsSection';
import { VisionSection } from './components/VisionSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <BenefitsSection />
      <VisionSection />
      <CTASection />
      <Footer />
    </div>
  );
}
