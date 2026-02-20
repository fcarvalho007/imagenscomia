import { useState, useEffect, useRef } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { VideoWebinarVideoArea } from "@/components/webinar/VideoWebinarVideoArea";
import { VideoWebinarSidebar } from "@/components/webinar/VideoWebinarSidebar";
import { VideoWebinarContent } from "@/components/webinar/VideoWebinarContent";
import { WebinarFooter } from "@/components/webinar/WebinarFooter";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { VIDEO_WEBINAR_CONFIG } from "@/components/webinar/videoWebinarConfig";
import { RegistrationModalProvider } from "@/hooks/useRegistrationModal";
import { RegistrationModal } from "@/components/landing/RegistrationModal";
import { LogoMarquee } from "@/components/landing/LogoMarquee";
import ElectricBorder from "@/components/landing/ElectricBorder";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

const HeroSection = () => {
  const { open } = useRegistrationModal();

  return (
    <section className="relative bg-slate-950 overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-24 text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[14px] font-heading font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest mb-8">
          Webinar Gratuito
        </span>

        {/* H1 — forced 2 lines on desktop */}
        <h1 className="font-heading font-black text-3xl lg:text-[60px] tracking-tight text-white leading-[1.1] mb-6 max-w-[980px] mx-auto">
          Aprende a criar vídeos com
          <br className="hidden lg:inline" />
          {" "}
          <span className="bg-gradient-to-r from-green-500 to-cyan-400 bg-clip-text text-transparent">
            Inteligência Artificial
          </span>{" "}
          para marketing
        </h1>

        {/* Subheadline */}
        <p className="text-base lg:text-xl text-slate-200/80 max-w-[860px] mx-auto leading-relaxed mb-10">
          Sais com um sistema, ferramentas e templates prontos (briefing → gerar → rever → publicar)
        </p>

        {/* CTA */}
        <ElectricBorder color="#16a34a" borderRadius={14} chaos={0.08}>
          <button
            onClick={() => open()}
            className="bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-[16px] px-8 py-3.5 rounded-[14px] transition-colors"
          >
            Garantir inscrição gratuita
          </button>
        </ElectricBorder>

        {/* Anchor link */}
        <a
          href="#o-que-inclui"
          className="block mt-6 text-[14px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          Ver o que está incluído ↓
        </a>
      </div>
    </section>
  );
};

const StickyMobileCTA = ({ show }: { show: boolean }) => {
  const { open } = useRegistrationModal();
  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-slate-950/95 backdrop-blur-sm border-t border-white/10 px-4 py-3">
      <button
        onClick={() => open()}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-[15px] py-3 rounded-lg transition-colors"
      >
        Garantir inscrição gratuita
      </button>
    </div>
  );
};

const WebinarLiveVideoInner = () => {
  const [showSticky, setShowSticky] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { open } = useRegistrationModal();

  usePageMeta({
    title: `${VIDEO_WEBINAR_CONFIG.title} — DIGITALFC`,
    description: VIDEO_WEBINAR_CONFIG.summary,
  });

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans scroll-smooth">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <span className="font-heading font-medium text-[15px] tracking-normal text-white">
            Frederico Carvalho
          </span>
          <span className="text-[13px] text-slate-400 hidden sm:block">
            {VIDEO_WEBINAR_CONFIG.metaLine}
          </span>
          <button
            onClick={() => open()}
            className="hidden lg:inline-flex bg-green-600 hover:bg-green-700 text-white font-heading font-semibold text-[13px] px-4 py-1.5 rounded-lg transition-colors"
          >
            Garantir inscrição gratuita
          </button>
        </div>
      </header>

      {/* Hero */}
      <div ref={heroRef}>
        <HeroSection />
      </div>

      {/* Logos strip */}
      <LogoMarquee />

      {/* Video area + Countdown — slate-900 */}
      <section className="bg-slate-900 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <VideoWebinarVideoArea />
        </div>
      </section>

      {/* "O que vai aprender" — Light island */}
      <section id="o-que-inclui" className="bg-slate-950 py-12 md:py-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 max-w-4xl mx-auto">
          <VideoWebinarContent />
        </div>
      </section>

      {/* Sidebar / Upsells — slate-900 */}
      <section className="bg-slate-900 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <VideoWebinarSidebar />
        </div>
      </section>

      <WebinarFooter />
      <WhatsAppSupportButton />
      <RegistrationModal />
      <StickyMobileCTA show={showSticky} />
    </div>
  );
};

const WebinarLiveVideo = () => {
  return (
    <RegistrationModalProvider subtitle="Terça-feira, 3 de Março, 21h">
      <WebinarLiveVideoInner />
    </RegistrationModalProvider>
  );
};

export default WebinarLiveVideo;
