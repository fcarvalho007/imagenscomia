import { RegistrationModalProvider } from "@/hooks/useRegistrationModal";
import { RegistrationModal } from "@/components/landing/RegistrationModal";
import { StickyTopBar } from "@/components/landing/StickyTopBar";
import { MirrorCopySection } from "@/components/landing/MirrorCopySection";
import { motion } from "framer-motion";
import logoImagens from "@/assets/logo-imagens-com-ia.png";
import { HeroSection } from "@/components/landing/HeroSection";
import { PricingCardsSection } from "@/components/landing/PricingCardsSection";
import { PresenterSection } from "@/components/landing/PresenterSection";
import { ChallengesSection } from "@/components/landing/ChallengesSection";
import { ProgramSection } from "@/components/landing/ProgramSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
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

        {/* Logo 3D separator */}
        <div className="py-6 md:py-10 bg-background flex justify-center">
          <motion.img
            src={logoImagens}
            alt="Imagens com IA"
            className="w-[120px] md:w-[140px] drop-shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        <MirrorCopySection />
        <PresenterSection />
        <ChallengesSection />
        <ProgramSection />
        <GallerySection />
        <TestimonialsSection />
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
