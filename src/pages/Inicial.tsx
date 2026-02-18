import { RegistrationModalProvider } from "@/hooks/useRegistrationModal";
import { usePageMeta } from "@/hooks/usePageMeta";
import { RegistrationModal } from "@/components/landing/RegistrationModal";
import { StickyTopBar } from "@/components/landing/StickyTopBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ChallengesSection } from "@/components/landing/ChallengesSection";
import { ProgramSection } from "@/components/landing/ProgramSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { TransformationSection } from "@/components/landing/TransformationSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { PresenterSection } from "@/components/landing/PresenterSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingCardsSection } from "@/components/landing/PricingCardsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTAFinalSection } from "@/components/landing/CTAFinalSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { LogoMarquee } from "@/components/landing/LogoMarquee";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";

const Inicial = () => {
  usePageMeta({
    title: "Criar Imagens com IA para Empresas — Webinar Gratuito 18 Fev 10h",
    description: "Aprende a criar imagens profissionais com IA para a tua empresa. Sem designer. Webinar gratuito, 18 Fevereiro, 10h. Método testado. Demo ao vivo.",
  });

  return (
    <RegistrationModalProvider>
      <main className="overflow-x-hidden pt-[52px]">
        <StickyTopBar />
        <HeroSection />
        <LogoMarquee />
        <ChallengesSection />
        <ProgramSection />
        <GallerySection />
        <TransformationSection />
        <AudienceSection />
        <PresenterSection />
        <TestimonialsSection />
        <PricingCardsSection />
        <FAQSection />
        <CTAFinalSection />
        <FooterSection />
        <WhatsAppSupportButton />
        <RegistrationModal />
      </main>
    </RegistrationModalProvider>
  );
};

export default Inicial;
