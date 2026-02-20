import { useEffect, useState, useRef, useCallback } from "react";
import {
  Check, Clock, XCircle, Layers,
  Calendar, Timer, Sparkles,
  Zap, BarChart3, Repeat, BookOpen,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useCountdown } from "@/hooks/useCountdown";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import ElectricBorder from "@/components/landing/ElectricBorder";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { RegistrationModalProvider, useRegistrationModal } from "@/hooks/useRegistrationModal";
import { RegistrationModal } from "@/components/landing/RegistrationModal";
import { FooterSection } from "@/components/landing/FooterSection";
import fredericoPhoto from "@/assets/frederico-carvalho.jpg";
import { LogoMarquee } from "@/components/landing/LogoMarquee";

/* ── Reduced motion check ── */
const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ── Framer Motion variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const wordReveal = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer = (stagger = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

const defaultTransition = { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const };
const vpOnce = { once: true, margin: "-60px" as const };

/* ── Word splitter for staggered reveal ── */
const StaggeredWords = ({ text, startDelay = 0.3 }: { text: string; startDelay?: number }) => {
  const words = text.split(" ");
  return (
    <motion.span
      initial="hidden"
      animate={prefersReduced() ? "visible" : "hidden"}
      whileInView="visible"
      viewport={vpOnce}
      variants={staggerContainer(0.07)}
      transition={{ delayChildren: startDelay }}
    >
      {words.map((w, i) => (
        <motion.span key={i} variants={wordReveal} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="inline-block mr-[0.3em]">
          {w}
        </motion.span>
      ))}
    </motion.span>
  );
};

/* ── Countdown Block ── */
const CountdownBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="bg-white/20 rounded px-2 py-1 font-heading font-bold text-[16px] max-sm:text-[14px] text-white min-w-[34px] max-sm:min-w-[28px] text-center">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[10px] text-white/70 mt-0.5">{label}</span>
  </div>
);

/* ── Google badge ── */
const GoogleBadge = () => (
  <div className="inline-flex items-center gap-[10px] rounded-[10px] px-[14px] py-[8px]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
    <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    <div className="w-px h-[18px] mx-[2px]" style={{ background: "rgba(255,255,255,0.10)" }} />
    <div className="flex flex-col gap-px">
      <div className="flex items-center gap-1">
        <span className="font-heading font-bold text-[14px]" style={{ color: "#F8FAFC" }}>5,0</span>
        <span style={{ fontSize: 13, lineHeight: 1, color: "#FBBC05" }}>★★★★★</span>
      </div>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.50)" }}>1 194 avaliações no Google</span>
    </div>
  </div>
);

/* ── Eyebrow label ── */
const Eyebrow = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <p className="font-heading font-semibold text-[13px] uppercase tracking-[0.14em] mb-3" style={{ color: light ? "#2563EB" : "#60A5FA" }}>
    {children}
  </p>
);

/* ── Section title ── */
const SectionTitle = ({ children, light = true }: { children: React.ReactNode; light?: boolean }) => (
  <h2 className={`font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] mb-6 text-center ${light ? "text-white" : ""}`} style={!light ? { color: "#0a0a0f" } : {}}>
    {children}
  </h2>
);

/* ── Data ── */

const whenItMakesSense = [
  { Icon: BarChart3, label: "Precisas de volume", desc: "O mercado pede vídeos com frequência e a tua equipa não acompanha." },
  { Icon: Repeat, label: "Precisas de consistência", desc: "Cada vídeo parece de uma marca diferente." },
  { Icon: Zap, label: "Precisas de velocidade", desc: "Quando o clip tem de sair hoje, não daqui a duas semanas." },
  { Icon: BookOpen, label: "Precisas de um método simples", desc: "Menos improviso, mais processo repetível." },
];

const forWhom = [
  "Gestores de marketing/comunicação e brand managers.",
  "Quem faz paid media e precisa de criativos com variações rápidas.",
  "Fundadores/gestores que querem consistência sem aumentar equipa.",
  "Profissionais que querem delegar sem perder controlo.",
];
const notFor = [
  "Quem procura cinema, edição avançada ou pós-produção pesada.",
  "Quem quer vídeos longos e complexos (aqui é clip curto, objectivo claro).",
  "Quem procura «milagre» sem processo.",
];


const agenda = [
  { num: "001", title: "Boas-vindas + o que mudou no vídeo" },
  { num: "002", title: "O processo mínimo (briefing + checklist) para produzir vídeo com consistência", tag: "CORE" },
  { num: "003", title: "Demonstração: do briefing ao primeiro clip (passo a passo)", tag: "AO VIVO" },
  { num: "004", title: "Erros mais comuns que destroem consistência (e como evitar)" },
];

const speakerCredentials = [
  { emoji: "🎓", title: "Professor Universitário", sub: "Universidade de Coimbra (FEUC) · Univ. Europeia (IPAM) · Univ. Autónoma · Univ. Aveiro" },
  { emoji: "📚", title: "Autor", sub: "\"Guia Essencial SEO\" e Co-Autor \"Marketing Digital para Empresas\"" },
  { emoji: "🎙️", title: "Host Semanal · RFM", sub: "Podcast Marketing por Idiotas" },
  { emoji: "🏢", title: "Fundador e CEO", sub: "DIGITALFC consultoria com auditoria digital a mais de 700+ empresas. L'Oréal. BMW. 3M" },
];

const faqs = [
  { q: "Precisa de experiência com IA?", a: "Não. O foco é processo e decisão, com demonstração simples." },
  { q: "Serve B2B e B2C?", a: "Serve ambos: anúncios, demos, prova social e conteúdo de confiança." },
  { q: "Se não conseguir assistir ao vivo, o que acontece?", a: "Pode inscrever-se na mesma para receber instruções e os próximos passos por email. A gravação integral não está incluída na participação gratuita." },
  { q: "O que preparar?", a: "Um exemplo de produto/serviço e 2–3 imagens (podem ser do site)." },
  { q: "Quanto tempo demora a aplicar?", a: "O sistema é desenhado para começar pequeno e repetir semanalmente." },
];

const DARK_950 = "#020617"; // slate-950
const DARK_900 = "#0f172a"; // slate-900
const DARK_CARD = "#1e293b"; // slate-800
const DARK_BORDER = "rgba(255,255,255,0.08)";

/* ══════════════════════════════════════════════════════ */

const VideoPageInner = () => {
  const { open } = useRegistrationModal();
  usePageMeta({
    title: "Webinar Gratuito · Vídeo com IA para Marketing · 3 Março 2026",
    description: "Sessão prática ao vivo para gestores e profissionais de marketing. Sistema mínimo de delegação: briefing + checklist + critérios de qualidade. Gratuito.",
  });

  const { days, hours, minutes, seconds } = useCountdown(new Date("2026-03-03T10:00:00"));
  const openModal = () => open("free");

  /* Sticky mobile CTA visibility */
  const [showMobileCta, setShowMobileCta] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowMobileCta(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen pt-[52px]" style={{ background: DARK_950, color: "#e2e8f0" }}>

      {/* ═══ STICKY TOP BAR WITH COUNTDOWN ═══ */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "linear-gradient(90deg, #020617 0%, rgba(37,99,235,0.15) 50%, #1e3a8a 100%)" }}
      >
        <div className="container mx-auto px-4 py-2.5 max-sm:py-2 flex items-center justify-between gap-3 max-sm:gap-2">
          <p className="hidden sm:block text-[13px] text-white/90 font-medium tracking-wide">
            AO VIVO · 3 MAR · 10H00
          </p>

          <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
            <CountdownBlock value={days} label="dias" />
            <span className="text-white/60 font-bold text-sm">:</span>
            <CountdownBlock value={hours} label="horas" />
            <span className="text-white/60 font-bold text-sm">:</span>
            <CountdownBlock value={minutes} label="min" />
            <span className="text-white/60 font-bold text-sm">:</span>
            <CountdownBlock value={seconds} label="seg" />
          </div>

          <button
            onClick={openModal}
            className="shrink-0 text-[13px] font-heading font-semibold text-white bg-green-600 hover:bg-green-700 px-5 max-sm:px-3 py-2.5 rounded-full transition-all shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] cursor-pointer hidden sm:block"
          >
            Garantir inscrição gratuita
          </button>
        </div>
      </motion.div>

      {/* ═══ STICKY MOBILE CTA ═══ */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: showMobileCta ? 0 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden px-4 pb-4 pt-2"
        style={{ background: "linear-gradient(to top, rgba(2,6,23,0.95) 60%, transparent)" }}
      >
        <button
          onClick={openModal}
          className="w-full font-heading font-bold text-white text-[15px] py-3.5 rounded-xl cursor-pointer"
          style={{ background: "#16A34A", boxShadow: "0 4px 20px rgba(22,163,74,0.4)" }}
        >
          Garantir inscrição gratuita
        </button>
      </motion.div>

      {/* ═══ HERO (slate-950) ═══ */}
      <section className="relative overflow-hidden flex items-center justify-center" style={{ minHeight: "100vh", background: DARK_950, paddingTop: 80, paddingBottom: 80 }}>
        {/* Background video */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 0, opacity: 0.35 }}>
          <source src="/videos/hero-vidro.mp4" type="video/mp4" />
        </video>
        {/* Animated orbs background */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <div className="absolute rounded-full hero-orb-1" style={{ width: 500, height: 500, background: "#16a34a", opacity: 0.12, top: "-5%", left: "-8%", filter: "blur(80px)" }} />
          <div className="absolute rounded-full hero-orb-2" style={{ width: 400, height: 400, background: "#1d4ed8", opacity: 0.09, top: "10%", right: "-5%", filter: "blur(80px)" }} />
          <div className="absolute rounded-full hero-orb-3" style={{ width: 350, height: 350, background: "#7c3aed", opacity: 0.07, bottom: "5%", left: "50%", transform: "translateX(-50%)", filter: "blur(80px)" }} />
        </div>
        {/* Noise grain overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, opacity: 0.035, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px 256px" }} />

        <div className="relative px-5 text-center w-full mx-auto" style={{ zIndex: 2, maxWidth: 1200 }}>
          {/* Live badge pill */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ ...defaultTransition, delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full mb-6" style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.04)" }}>
              <span className="relative flex h-[6px] w-[6px]">
                <span className="absolute inset-0 rounded-full hero-live-dot" style={{ background: "#16a34a" }} />
                <span className="absolute inset-0 rounded-full hero-live-dot-ping" style={{ background: "#16a34a" }} />
              </span>
              WEBINAR GRATUITO · AO VIVO
            </span>
          </motion.div>

          {/* Headline — wider container to fit 2 lines on desktop */}
          <h1
            className="font-heading leading-[1.05] text-white mb-4 max-w-[1100px] mx-auto text-[38px] md:text-[52px] lg:text-[72px]"
            style={{ fontWeight: 900, textShadow: "0 0 80px rgba(22,163,74,0.15)" }}
          >
            <span className="tracking-[-0.5px] md:tracking-[-1px] lg:tracking-[-2px]">
              <StaggeredWords startDelay={0.2} text="Aprende a criar vídeos com" />
            </span>
            <br className="hidden lg:block" />
            <motion.span
              initial="hidden" whileInView="visible" viewport={vpOnce}
              variants={wordReveal}
              transition={{ duration: 0.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block mr-[0.3em]"
              style={{
                background: "linear-gradient(135deg, #16a34a 0%, #4ade80 40%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Inteligência Artificial
            </motion.span>
            <motion.span
              initial="hidden" whileInView="visible" viewport={vpOnce}
              variants={wordReveal}
              transition={{ duration: 0.5, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              para marketing
            </motion.span>
          </h1>

          {/* Supporting line */}
          <motion.p
            initial="hidden" animate="visible"
            variants={fadeUp} transition={{ ...defaultTransition, delay: 0.9 }}
            className="font-medium mb-2 max-w-[960px] mx-auto text-[15px] lg:text-[18px]"
            style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "-0.3px", lineHeight: 1.35 }}
          >
            Sais com um sistema, ferramentas e templates prontos (briefing → gerar → rever → publicar)
          </motion.p>

          {/* Sub-subtitle */}
          <motion.p
            initial="hidden" animate="visible"
            variants={fadeUp} transition={{ ...defaultTransition, delay: 1.05 }}
            className="text-[14px] leading-[1.6] mb-9"
            style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", fontWeight: 400 }}
          >
            Sessão prática para gestores e profissionais de marketing
          </motion.p>

          {/* 4 Info boxes */}
          <motion.div
            initial="hidden" animate="visible"
            variants={staggerContainer(0.1)}
            transition={{ delayChildren: 1.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 max-w-[700px] mx-auto"
          >
            {([
              { Icon: Calendar, label: "DATA", value: "3 de Março" },
              { Icon: Clock, label: "HORÁRIO", value: "10h00" },
              { Icon: Timer, label: "DURAÇÃO", value: "45 min" },
              { Icon: Sparkles, label: "INVESTIMENTO", value: "Gratuito" },
            ] as const).map((box) => (
              <motion.div
                key={box.label}
                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-[10px] py-3 px-[18px] text-center transition-all duration-200 hero-info-box cursor-default backdrop-blur-sm"
                style={{ background: "rgba(6,9,26,0.75)", border: "1px solid rgba(37,99,235,0.20)" }}
              >
                <box.Icon className="w-[18px] h-[18px] mx-auto mb-1" style={{ color: "#60A5FA" }} />
                <span className="block text-[9px] font-bold uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "2px" }}>{box.label}</span>
                <span className="block text-[16px] font-bold text-white">{box.value}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ ...defaultTransition, delay: 1.5 }} className="flex justify-center">
            <ElectricBorder color="#22C55E" speed={0.8} chaos={0.08} borderRadius={10}>
              <button
                onClick={openModal}
                className="font-heading text-white text-[20px] transition-all duration-200 cursor-pointer hover:scale-[1.02] w-full"
                style={{ background: "#16A34A", fontWeight: 700, padding: "22px 56px", borderRadius: 10, maxWidth: 500, minWidth: 300 }}
              >
                Sim, quero inscrever-me grátis
              </button>
            </ElectricBorder>
          </motion.div>

          {/* Google reviews badge */}
          <div className="mt-4 flex justify-center">
            <GoogleBadge />
          </div>
        </div>

        {/* Hero CSS */}
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .hero-orb-1 { animation: heroFloat1 20s ease-in-out infinite; }
            .hero-orb-2 { animation: heroFloat2 25s ease-in-out infinite reverse; }
            .hero-orb-3 { animation: heroFloat3 30s ease-in-out infinite; }
            .hero-live-dot-ping { animation: heroPing 1.5s ease-in-out infinite; }
          }
          @keyframes heroFloat1 {
            0%,100% { transform: translate(0,0) scale(1); }
            33% { transform: translate(25px,-15px) scale(1.04); }
            66% { transform: translate(-15px,18px) scale(0.97); }
          }
          @keyframes heroFloat2 {
            0%,100% { transform: translate(0,0) scale(1); }
            33% { transform: translate(-20px,20px) scale(1.04); }
            66% { transform: translate(18px,-12px) scale(0.97); }
          }
          @keyframes heroFloat3 {
            0%,100% { transform: translateX(-50%) translate(0,0) scale(1); }
            33% { transform: translateX(-50%) translate(25px,-15px) scale(1.04); }
            66% { transform: translateX(-50%) translate(-15px,18px) scale(0.97); }
          }
          @keyframes heroPing {
            0%,100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0; transform: scale(2.2); }
          }
          .hero-info-box:hover {
            border-color: rgba(37,99,235,0.40) !important;
            background: rgba(37,99,235,0.08) !important;
          }
        `}</style>
      </section>

      {/* ═══ LOGO MARQUEE ═══ */}
      <LogoMarquee />

      {/* ═══ SECTION 1 — "Vídeo é o formato que o mercado exige" ═══ */}
      <section className="relative overflow-hidden py-24 md:py-32" style={{ background: "#0a0a0f" }}>
        {/* Background video — rosa */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 0, opacity: 0.7 }}>
          <source src="/videos/rosa-video.mp4" type="video/mp4" />
        </video>
        {/* Radial overlay — transparent centre so the pink ball shows */}
        <div className="absolute inset-0" style={{ zIndex: 1, background: "radial-gradient(ellipse 50% 60% at 50% 50%, transparent 0%, rgba(10,10,15,0.65) 55%, rgba(10,10,15,0.88) 100%)" }} />
        <div className="relative mx-auto max-w-6xl px-5" style={{ zIndex: 2 }}>
          <ScrollReveal>
            <div className="text-center mb-14 md:mb-20">
              <h2 className="font-heading font-extrabold text-[30px] sm:text-[36px] lg:text-[48px] leading-[1.1] text-white" style={{ letterSpacing: "-1px" }}>
                Vídeo é o formato que o{" "}
                <span className="glitch" data-text="mercado exige">
                  mercado exige
                </span>
              </h2>
            </div>
          </ScrollReveal>

          {/* 2 | centre (video shows through) | 2 */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={vpOnce}
            variants={staggerContainer(0.12)}
            className="grid grid-cols-2 lg:grid-cols-[1fr_1.2fr_1fr] gap-5 lg:gap-6"
          >
            {/* Left column — cards 1 & 2 */}
            <div className="flex flex-col gap-5 lg:gap-6">
              {whenItMakesSense.slice(0, 2).map(({ Icon, label, desc }, i) => (
                <motion.div key={i} variants={fadeUp} transition={defaultTransition}>
                  <SpotlightCard className="relative overflow-hidden rounded-xl p-6 lg:p-7 h-full transition-all duration-200 hover:-translate-y-[2px] pain-card">
                    <span className="absolute bottom-[-10px] right-[10px] font-heading text-[80px] font-black leading-none pointer-events-none select-none" style={{ color: "rgba(168,85,247,0.08)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Icon className="w-6 h-6 mb-3 relative z-10 pain-card-icon transition-all duration-200" style={{ color: "#a855f7" }} />
                    <p className="font-heading font-bold text-[15px] lg:text-[16px] mb-1.5 relative z-10 text-white">{label}</p>
                    <p className="text-[13px] lg:text-[14px] leading-[1.6] relative z-10" style={{ color: "rgba(255,255,255,0.55)" }}>{desc}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>

            {/* Centre spacer — desktop only, lets the video ball show */}
            <div className="hidden lg:block" />

            {/* Right column — cards 3 & 4 */}
            <div className="flex flex-col gap-5 lg:gap-6">
              {whenItMakesSense.slice(2, 4).map(({ Icon, label, desc }, i) => (
                <motion.div key={i + 2} variants={fadeUp} transition={defaultTransition}>
                  <SpotlightCard className="relative overflow-hidden rounded-xl p-6 lg:p-7 h-full transition-all duration-200 hover:-translate-y-[2px] pain-card">
                    <span className="absolute bottom-[-10px] right-[10px] font-heading text-[80px] font-black leading-none pointer-events-none select-none" style={{ color: "rgba(168,85,247,0.08)" }}>
                      {String(i + 3).padStart(2, "0")}
                    </span>
                    <Icon className="w-6 h-6 mb-3 relative z-10 pain-card-icon transition-all duration-200" style={{ color: "#a855f7" }} />
                    <p className="font-heading font-bold text-[15px] lg:text-[16px] mb-1.5 relative z-10 text-white">{label}</p>
                    <p className="text-[13px] lg:text-[14px] leading-[1.6] relative z-10" style={{ color: "rgba(255,255,255,0.55)" }}>{desc}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <style>{`
          .pain-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(16px);
          }
          .pain-card:hover {
            border-color: #4ade80 !important;
            box-shadow: 0 0 20px rgba(74, 222, 128, 0.1) !important;
            background: rgba(255,255,255,0.06) !important;
          }
          .pain-card:hover .pain-card-icon {
            filter: drop-shadow(0 0 8px rgba(168,85,247,0.5));
          }

          /* Glitch effect */
          .glitch {
            position: relative;
            display: inline-block;
            background: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: glitch-idle 4s ease-in-out infinite;
          }
          .glitch::before,
          .glitch::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            -webkit-text-fill-color: initial;
            background: none;
            -webkit-background-clip: initial;
            background-clip: initial;
          }
          .glitch::before {
            animation: glitch-2 3s infinite linear alternate-reverse;
            color: #a855f7;
            z-index: -1;
            opacity: 0.7;
          }
          .glitch::after {
            animation: glitch-3 2s infinite linear alternate-reverse;
            color: #22d3ee;
            z-index: -2;
            opacity: 0.7;
          }
          .glitch:hover::before,
          .glitch:hover::after {
            opacity: 1;
          }
          @keyframes glitch-idle {
            0%, 90%, 100% { transform: none; }
            92% { transform: skew(-0.3deg); }
            94% { transform: none; }
            96% { transform: skew(0.3deg); }
            98% { transform: none; }
          }
          @keyframes glitch-2 {
            0% { transform: none; }
            7% { transform: translate(-2px, -3px); }
            10% { transform: none; }
            27% { transform: none; }
            30% { transform: translate(-5px, -2px); }
            35% { transform: none; }
            52% { transform: none; }
            55% { transform: translate(-1px, -1px); }
            50% { transform: none; }
            72% { transform: none; }
            75% { transform: translate(-2px, -6px); }
            80% { transform: none; }
            100% { transform: none; }
          }
          @keyframes glitch-3 {
            0% { transform: none; }
            7% { transform: translate(2px, 3px); }
            10% { transform: none; }
            27% { transform: none; }
            30% { transform: translate(5px, 2px); }
            35% { transform: none; }
            52% { transform: none; }
            55% { transform: translate(1px, 1px); }
            50% { transform: none; }
            72% { transform: none; }
            75% { transform: translate(2px, 6px); }
            80% { transform: none; }
            100% { transform: none; }
          }
        `}</style>
      </section>

      {/* ═══ SECTION 2 — "Para quem é" (slate-950) ═══ */}
      <section className="py-20 md:py-28" style={{ background: DARK_950 }}>
        <div className="mx-auto max-w-5xl px-5">
          <ScrollReveal>
            <p className="font-heading font-semibold text-[13px] uppercase tracking-[0.14em] mb-3 text-center" style={{ color: "#a855f7" }}>
              PÚBLICO-ALVO
            </p>
            <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] mb-6 text-center text-white">
              Para quem é —{" "}
              <span style={{ background: "linear-gradient(135deg, #a855f7 0%, #60A5FA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                e para quem não é
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-xl p-7 transition-all duration-200 audience-card-yes" style={{ background: "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,0.8) 100%)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <p className="font-heading font-bold text-[14px] mb-5 flex items-center gap-2" style={{ color: "#4ade80" }}>
                  <Check className="w-5 h-5" style={{ color: "#4ade80" }} />
                  Certo para
                </p>
                <ul className="space-y-4">
                  {forWhom.map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-heading font-bold text-[11px] mt-0.5 shrink-0 w-[22px]" style={{ color: "rgba(168,85,247,0.4)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#4ade80" }} />
                      <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.75)" }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-7 transition-all duration-200 audience-card-no" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(10,10,15,1) 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="font-heading font-bold text-[14px] mb-5 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                  <XCircle className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
                  Não é para
                </p>
                <ul className="space-y-4">
                  {notFor.map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }} />
                      <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.50)" }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <style>{`
          .audience-card-yes:hover, .audience-card-no:hover {
            border-color: rgba(168,85,247,0.3) !important;
            box-shadow: 0 0 30px rgba(168,85,247,0.08);
          }
        `}</style>
      </section>


      {/* ═══ SECTION 4 — AGENDA (Dark cinematic) ═══ */}
      <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: "#0a0a0f" }}>
        {/* Depth gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(168,85,247,0.04) 0%, rgba(29,78,216,0.02) 40%, transparent 80%)" }} />
        {/* Noise grain overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px 256px" }} />

        <div className="relative mx-auto max-w-4xl px-5" style={{ zIndex: 1 }}>
          <ScrollReveal>
            <p className="font-heading font-semibold text-[13px] uppercase tracking-[0.14em] mb-3 text-center" style={{ color: "#4ade80" }}>
              Agenda · 45 min
            </p>
            <SectionTitle>O que acontece durante a sessão</SectionTitle>
          </ScrollReveal>

          {/* Decorative line */}
          <div className="h-px mb-10" style={{ background: "linear-gradient(90deg, transparent 0%, #a855f7 30%, #4ade80 70%, transparent 100%)", opacity: 0.4 }} />

          <motion.div
            initial="hidden" whileInView="visible" viewport={vpOnce}
            variants={staggerContainer(0.12)}
            className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          >
            {agenda.map((item, i) => (
              <motion.div
                key={i}
                variants={slideFromLeft}
                transition={defaultTransition}
                className="relative rounded-xl p-5 md:p-6 transition-all duration-200 cursor-default agenda-card overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {/* Large decorative number */}
                <span
                  className="absolute top-3 right-4 font-heading font-black select-none pointer-events-none"
                  style={{
                    fontSize: 52,
                    lineHeight: 1,
                    background: "linear-gradient(135deg, rgba(168,85,247,0.10), rgba(74,222,128,0.06))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {item.num}
                </span>

                {/* Purple sidebar bar */}
                <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-all duration-200 agenda-bar" style={{ background: "rgba(168,85,247,0.25)" }} />

                <div className="relative pl-3">
                  {item.tag && (
                    <span
                      className="inline-block text-[9px] font-bold uppercase rounded px-[8px] py-[3px] mb-3"
                      style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}
                    >
                      {item.tag}
                    </span>
                  )}
                  <p className="text-[16px] font-semibold leading-snug pr-12" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {item.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <style>{`
          .agenda-card:hover {
            border-color: rgba(168,85,247,0.30) !important;
            background: rgba(255,255,255,0.05) !important;
          }
          .agenda-card:hover .agenda-bar {
            background: #a855f7 !important;
            box-shadow: 0 0 12px rgba(168,85,247,0.5);
          }
        `}</style>
      </section>

      {/* ═══ SECTION 5 — SPEAKER (White bg) ═══ */}
      <section className="py-14 md:py-20 px-4" style={{ background: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="mx-auto max-w-[1060px]">
          <div className="flex flex-col md:flex-row items-center gap-9 md:gap-16">
            {/* Photo column */}
            <ScrollReveal className="w-full md:w-[380px] shrink-0">
              <div className="relative rounded-[20px] overflow-hidden">
                <img
                  src={fredericoPhoto}
                  alt="Frederico Carvalho"
                  loading="lazy"
                  className="w-full h-[320px] md:h-[460px] object-cover object-top rounded-[20px]"
                />
                {/* Badge */}
                <div
                  className="absolute bottom-5 left-5 rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  <p className="font-heading font-bold text-[14px]" style={{ color: "#0a0a0f" }}>
                    ⭐ 5,0 · 1 194 avaliações no Google
                  </p>
                  <p className="text-[14px] mt-[2px]" style={{ color: "#64748b" }}>
                    Frederico Carvalho · DIGITALFC
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Text column */}
            <ScrollReveal delay={0.1} className="flex-grow w-full">
              <div className="text-center md:text-left">
                <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.1em] mb-2" style={{ color: "#2563EB" }}>
                  QUEM APRESENTA
                </p>
                <h2 className="font-heading font-extrabold text-[24px] sm:text-[30px] md:text-[34px] mb-1" style={{ color: "#0a0a0f" }}>
                  Frederico Carvalho
                </h2>
                <p className="font-medium text-[17px] leading-[1.5] mb-7" style={{ color: "#64748b" }}>
                  20 anos de experiência em marketing digital para empresas
                </p>

                <div className="mb-7" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }} />

                {/* Credentials grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  {speakerCredentials.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-[10px] p-3.5"
                      style={{ background: "#f8f9fa", border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      <span className="text-[20px] leading-none shrink-0">{c.emoji}</span>
                      <div>
                        <p className="font-heading font-semibold text-[14px]" style={{ color: "#0a0a0f" }}>{c.title}</p>
                        <p className="text-[14px]" style={{ color: "#64748b" }}>{c.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6 — FAQ (Light bg) ═══ */}
      <section className="py-20 md:py-28" style={{ background: "#f8f9fa" }}>
        <div className="mx-auto max-w-2xl px-5">
          <ScrollReveal>
            <SectionTitle light={false}>Perguntas frequentes</SectionTitle>
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl overflow-hidden transition-all duration-300 [&[data-state=open]]:border-l-2 [&[data-state=open]]:border-l-blue-600"
                  style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <AccordionTrigger className="px-5 py-4 text-left text-[15px] font-semibold hover:no-underline [&[data-state=open]>svg]:rotate-180" style={{ color: "#0a0a0f" }}>
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 text-[14px] leading-[1.65]" style={{ color: "#555" }}>
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ background: "#050709" }}>
        {/* Animated gradient orb */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[800px] h-[800px] rounded-full final-cta-orb"
            style={{
              background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .final-cta-orb { animation: orb-drift 15s ease-in-out infinite; }
            }
            @keyframes orb-drift {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              33% { transform: translate(-45%, -55%) scale(1.05); }
              66% { transform: translate(-55%, -45%) scale(0.95); }
            }
          `}</style>
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
          <h2 className="font-heading font-extrabold text-[26px] sm:text-[34px] text-white leading-[1.15] mb-4">
            Garantir inscrição gratuita
          </h2>
          <p className="text-[15px] mb-8 max-w-[500px] mx-auto" style={{ color: "rgba(255,255,255,0.50)" }}>
            Sem compromisso. Evento ao vivo em 3 de Março de 2026, às 10h.
          </p>
          <div className="flex justify-center">
            <ElectricBorder color="#22C55E" speed={0.8} chaos={0.08} borderRadius={10}>
              <button
                onClick={openModal}
                className="font-heading text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] w-full text-[17px]"
                style={{ background: "#16A34A", fontWeight: 700, padding: "16px 36px", borderRadius: 10, maxWidth: 420, minWidth: 280 }}
              >
                Garantir inscrição gratuita
              </button>
            </ElectricBorder>
          </div>
          <p className="text-[13px] mt-4" style={{ color: "rgba(255,255,255,0.30)" }}>
            Lugares limitados para o directo.
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <FooterSection />
      <RegistrationModal />
    </div>
  );
};

const VideoPage = () => (
  <RegistrationModalProvider redirectPath="/upgrade-video" subtitle="Terça-feira, 3 de Março, 10h">
    <VideoPageInner />
  </RegistrationModalProvider>
);

export default VideoPage;
