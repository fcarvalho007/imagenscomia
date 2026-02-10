import { RegistrationModalProvider } from "@/hooks/useRegistrationModal";
import { RegistrationModal } from "@/components/landing/RegistrationModal";
import { StickyTopBar } from "@/components/landing/StickyTopBar";
import { MirrorCopySection } from "@/components/landing/MirrorCopySection";
import { HeroSection } from "@/components/landing/HeroSection";
import { PricingCardsSection } from "@/components/landing/PricingCardsSection";
import { PresenterSection } from "@/components/landing/PresenterSection";
import { ChallengesSection } from "@/components/landing/ChallengesSection";
import { ProgramSection } from "@/components/landing/ProgramSection";
import { AudienceSection } from "@/components/landing/AudienceSection";

import { FAQSection } from "@/components/landing/FAQSection";
import { CTAFinalSection } from "@/components/landing/CTAFinalSection";
import { FooterSection } from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <RegistrationModalProvider>
      <main className="overflow-x-hidden pt-[52px]">
        <StickyTopBar />
        <HeroSection />
        <MirrorCopySection />
        <PresenterSection />
        <ChallengesSection />
        <ProgramSection />
        <AudienceSection />
        <PricingCardsSection />
        <FAQSection />
        <CTAFinalSection />
        <FooterSection />
        <RegistrationModal />
      </main>
    </RegistrationModalProvider>
  );
};

export default Index;
