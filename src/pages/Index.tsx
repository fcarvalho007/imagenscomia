import { RegistrationModalProvider } from "@/hooks/useRegistrationModal";
import { RegistrationModal } from "@/components/landing/RegistrationModal";
import { HeroSection } from "@/components/landing/HeroSection";
import { CredibilitySection } from "@/components/landing/CredibilitySection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ModulesSection } from "@/components/landing/ModulesSection";
import { BonusSection } from "@/components/landing/BonusSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { UrgencySection } from "@/components/landing/UrgencySection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTAFinalSection } from "@/components/landing/CTAFinalSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";

const Index = () => {
  return (
    <RegistrationModalProvider>
      <main className="overflow-x-hidden">
        <HeroSection />
        <CredibilitySection />
        <ProblemSection />
        <ModulesSection />
        <BonusSection />
        <AudienceSection />
        <TestimonialsSection />
        <PricingSection />
        <UrgencySection />
        <FAQSection />
        <CTAFinalSection />
        <FooterSection />
        <StickyMobileCTA />
        <RegistrationModal />
      </main>
    </RegistrationModalProvider>
  );
};

export default Index;
