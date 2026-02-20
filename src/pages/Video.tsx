import { useEffect, useState, useRef, useCallback } from "react";
import {
  Check, Clock, ArrowLeftRight, XCircle, Layers,
  FileText, CheckSquare, Video,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { LegalModal } from "@/components/legal/LegalModal";
import { TermosContent } from "@/components/legal/TermosContent";
import { PrivacidadeContent } from "@/components/legal/PrivacidadeContent";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import fredericoPhoto from "@/assets/frederico-carvalho.jpg";

/* ── Reduced motion check ── */
const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ── Framer Motion variants (constants for perf) ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const wordReveal = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const staggerContainer = (stagger = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

const defaultTransition = { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const };
const vpOnce = { once: true, margin: "-80px" as const };

/* ── Smooth scroll helper ── */
const scrollTo = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

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

/* ── CountUp number ── */
const CountUpNumber = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || prefersReduced()) { setCount(value); return; }
    const dur = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(eased * value));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value]);

  return <span ref={ref}>{count}</span>;
};

/* ── Shared CTA ── */
const GreenCTA = ({ label = "Garantir inscrição gratuita", large = false }: { label?: string; large?: boolean }) => (
  <button
    onClick={scrollTo("inscricao")}
    className={`inline-block font-heading font-bold text-white rounded-xl transition-all cursor-pointer ${large ? "text-[17px] px-10 py-4" : "text-[15px] px-7 py-3"}`}
    style={{ background: "hsl(142 76% 36%)", boxShadow: "0 4px 20px rgba(22,163,74,0.30)" }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsl(142 72% 29%)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "hsl(142 76% 36%)"; }}
  >
    {label}
  </button>
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
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="font-heading font-semibold text-[13px] uppercase tracking-[0.14em] mb-3" style={{ color: "hsl(142 76% 36%)" }}>
    {children}
  </p>
);

/* ── Section title ── */
const SectionTitle = ({ children, light = true }: { children: React.ReactNode; light?: boolean }) => (
  <h2 className={`font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] mb-6 text-center ${light ? "text-white" : ""}`} style={!light ? { color: "hsl(222 47% 11%)" } : {}}>
    {children}
  </h2>
);

/* ── Data ── */
const painPoints = [
  { Icon: Clock, text: "Cada vídeo vira um mini-projecto (e nunca há tempo)." },
  { Icon: ArrowLeftRight, text: "Aprovações viram pingue-pongue (e perde-se o timing)." },
  { Icon: XCircle, text: "Sai «qualquer coisa», mas não parece a marca (falta consistência)." },
  { Icon: Layers, text: "Há ferramentas a mais e clareza a menos (confusão e desperdício)." },
];

const beforeItems = ["Decisões por impulso", "Produção intermitente", "Stress e retrabalho constante"];
const afterItems = ["Um sistema simples e repetível", "Delegação com critérios claros", "Produção previsível, melhoria contínua"];

const concreteResults = [
  "Saber que tipo de vídeo faz sentido para cada objectivo (leads, confiança, remarketing).",
  "Criar um briefing que uma IA ou freelancer executa sem 20 mensagens.",
  "Validar «serve marketing?» antes de publicar — critérios claros, não opiniões.",
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
  { time: "5 min", title: "Boas-vindas + o que mudou no vídeo" },
  { time: "15 min", title: "O sistema mínimo de delegação (briefing + checklist)" },
  { time: "20 min", title: "Demonstração: do briefing ao clip" },
  { time: "10 min", title: "7 erros que destroem consistência" },
  { time: "10 min", title: "Q&A + próximos passos" },
];

const deliverables = [
  { Icon: FileText, title: "Template de Briefing de Vídeo", desc: "1 página. Pronto a usar com IA ou freelancer." },
  { Icon: CheckSquare, title: "Checklist «publicável vs rascunho»", desc: "Critérios objectivos de qualidade, sem opiniões." },
  { Icon: Video, title: "Mini-guia: 5 formatos por objectivo", desc: "Leads, confiança, remarketing, demos e remarketing visual." },
];

const tools = [
  { name: "Riverside", desc: "Corta automaticamente e depois ajusta (poupa horas)." },
  { name: "Flow (Google) / Veo", desc: "Gerar clips e cenas por partes (pode exigir planos elegíveis)." },
  { name: "Dreamina (CapCut)", desc: "Montar sequência e variações rápidas a partir de imagens." },
  { name: "Higgsfield", desc: "Variações rápidas de movimento/estilo para social e anúncios." },
];

const operationalPromises = [
  "Escolher formato e mensagem com base no objectivo (não «porque fica bonito»).",
  "Criar 2–3 variações do mesmo conceito (para testes e ângulos).",
  "Aprovar mais rápido com uma checklist de qualidade.",
  "Montar um processo semanal simples (produção por lotes).",
];

const faqs = [
  { q: "Precisa de experiência com IA?", a: "Não. O foco é processo e decisão, com demonstração simples." },
  { q: "Serve B2B e B2C?", a: "Serve ambos: anúncios, demos, prova social e conteúdo de confiança." },
  { q: "Vai haver gravação?", a: "A política de gravação será comunicada na sessão." },
  { q: "O que preparar?", a: "Um exemplo de produto/serviço e 2–3 imagens (podem ser do site)." },
  { q: "Quanto tempo demora a aplicar?", a: "O sistema é desenhado para começar pequeno e repetir semanalmente." },
];

const DARK = "#0a0a0f";
const DARK_CARD = "#12121a";
const DARK_BORDER = "rgba(255,255,255,0.08)";

/* ══════════════════════════════════════════════════════ */

const VideoPage = () => {
  usePageMeta({
    title: "Webinar Gratuito · Vídeo com IA para Marketing · 2 Março 2026",
    description: "Sessão prática ao vivo para gestores e profissionais de marketing. Sistema mínimo de delegação: briefing + checklist + critérios de qualidade. Gratuito.",
  });

  const [legalModal, setLegalModal] = useState<"termos" | "privacidade" | null>(null);

  /* ── Sticky bar scroll opacity ── */
  const [barOpacity, setBarOpacity] = useState(0.92);
  useEffect(() => {
    const handler = () => setBarOpacity(window.scrollY > 500 ? 0.98 : 0.92);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: DARK, color: "#e2e8f0" }}>

      {/* ═══ 1 — STICKY TOP BAR ═══ */}
      <div
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: `rgba(10,10,15,${barOpacity})`,
          backdropFilter: "saturate(180%) blur(12px)",
          borderBottom: `1px solid ${DARK_BORDER}`,
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-2.5">
          <span className="hidden sm:inline-block text-[12px] font-heading font-semibold uppercase tracking-[0.1em] px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${DARK_BORDER}`, color: "rgba(255,255,255,0.6)" }}>
            Webinar gratuito · 2 Março 2026
          </span>
          <button
            onClick={scrollTo("inscricao")}
            className="text-[13px] font-heading font-bold text-white px-5 py-2 rounded-lg transition-colors cursor-pointer sm:ml-auto"
            style={{ background: "hsl(142 76% 36%)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsl(142 72% 29%)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "hsl(142 76% 36%)"; }}
          >
            Garantir inscrição →
          </button>
        </div>
      </div>

      {/* ═══ 2 — HERO ═══ */}
      <section className="relative overflow-hidden flex items-center justify-center" style={{ minHeight: "100vh", background: "#050709" }}>
        {/* Animated orbs background */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <div className="absolute rounded-full hero-orb-1" style={{ width: 500, height: 500, background: "#16a34a", opacity: 0.08, top: "-5%", left: "-8%", filter: "blur(80px)" }} />
          <div className="absolute rounded-full hero-orb-2" style={{ width: 400, height: 400, background: "#1d4ed8", opacity: 0.06, top: "10%", right: "-5%", filter: "blur(80px)" }} />
          <div className="absolute rounded-full hero-orb-3" style={{ width: 350, height: 350, background: "#7c3aed", opacity: 0.05, bottom: "5%", left: "50%", transform: "translateX(-50%)", filter: "blur(80px)" }} />
        </div>
        {/* Noise grain overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, opacity: 0.035, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px 256px" }} />

        <div className="relative px-5 text-center w-full" style={{ zIndex: 2, maxWidth: 700, margin: "0 auto" }}>
          {/* Live badge pill */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ ...defaultTransition, delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.16em] px-4 py-1.5 rounded-full mb-6" style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.04)" }}>
              <span className="relative flex h-[6px] w-[6px]">
                <span className="absolute inset-0 rounded-full hero-live-dot" style={{ background: "#16a34a" }} />
                <span className="absolute inset-0 rounded-full hero-live-dot-ping" style={{ background: "#16a34a" }} />
              </span>
              WEBINAR GRATUITO · AO VIVO
            </span>
          </motion.div>

          {/* Headline — staggered word reveal */}
          <h1 className="font-heading font-extrabold text-[26px] sm:text-[36px] md:text-[44px] leading-[1.1] text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
            <StaggeredWords text="Aprende a criar vídeos com Inteligência Artificial para marketing" startDelay={0.2} />
          </h1>

          {/* Subtitle */}
          <motion.p
            initial="hidden" animate="visible"
            variants={fadeUp} transition={{ ...defaultTransition, delay: 0.9 }}
            className="text-[17px] sm:text-[20px] leading-[1.5] font-medium text-white mb-2"
          >
            Com um sistema simples de delegação, sem caos.
          </motion.p>

          {/* Sub-subtitle */}
          <motion.p
            initial="hidden" animate="visible"
            variants={fadeUp} transition={{ ...defaultTransition, delay: 1.05 }}
            className="text-[14px] sm:text-[15px] leading-[1.6] mb-9"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Sessão prática para gestores e profissionais de marketing
          </motion.p>

          {/* 4 Info boxes */}
          <motion.div
            initial="hidden" animate="visible"
            variants={staggerContainer(0.1)}
            transition={{ delayChildren: 1.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 max-w-[600px] mx-auto"
          >
            {([
              { icon: "📅", label: "DATA", value: "2 de Março" },
              { icon: "🕐", label: "HORÁRIO", value: "A definir" },
              { icon: "⏱", label: "DURAÇÃO", value: "45–60 min" },
              { icon: "🎓", label: "INVESTIMENTO", value: "Gratuito" },
            ] as const).map((box) => (
              <motion.div
                key={box.label}
                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-[10px] py-3 px-[18px] text-center transition-all duration-200 hero-info-box cursor-default"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <span className="text-[20px] block mb-1">{box.icon}</span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.12em] mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{box.label}</span>
                <span className="block text-[14px] font-bold text-white">{box.value}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA with shimmer */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ ...defaultTransition, delay: 1.5 }}>
            <ShimmerButton>
              <button
                onClick={scrollTo("inscricao")}
                className="inline-block font-heading text-white rounded-xl transition-all duration-200 cursor-pointer text-[17px] px-10 py-4 hover:scale-[1.02]"
                style={{ background: "hsl(142 76% 36%)", fontWeight: 800, minWidth: 280, boxShadow: "0 0 25px rgba(22,163,74,0.4)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsl(142 72% 29%)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "hsl(142 76% 36%)"; }}
              >
                Garantir inscrição gratuita
              </button>
            </ShimmerButton>

            {/* Google reviews badge */}
            <div className="mt-4 flex justify-center">
              <GoogleBadge />
            </div>
          </motion.div>
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
            border-color: rgba(22,163,74,0.4) !important;
            background: rgba(22,163,74,0.06) !important;
          }
          @media (prefers-reduced-motion: no-preference) {
            .hero-cta-glow { animation: heroGlow 2.5s ease-in-out infinite; }
          }
          @keyframes heroGlow {
            0%,100% { box-shadow: 0 0 25px rgba(22,163,74,0.4); }
            50% { box-shadow: 0 0 45px rgba(22,163,74,0.65); }
          }
        `}</style>
      </section>

      {/* ═══ 2b — TOOLS MARQUEE STRIP ═══ */}
      <section style={{ background: "#080a0d", borderTop: "1px solid rgba(255,255,255,0.05)" }} className="py-5 overflow-hidden">
        <p className="text-center uppercase mb-3" style={{ fontSize: 9, letterSpacing: 2, color: "#444" }}>
          FERRAMENTAS ABORDADAS NA SESSÃO
        </p>
        <div
          className="relative overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="flex w-max hero-marquee">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center" style={{ gap: 48 }}>
                {["Riverside", "Google Flow", "Veo", "Dreamina (CapCut)", "Higgsfield"].map(t => (
                  <span key={`${dup}-${t}`} className="whitespace-nowrap" style={{ fontSize: 11, fontWeight: 700, color: "#333" }}>
                    {t}
                  </span>
                ))}
                <span style={{ width: 48 }} />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .hero-marquee { animation: heroMarquee 18s linear infinite; }
          }
          @keyframes heroMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ═══ 3 — PROBLEM ═══ */}
      <section id="problema" className="py-16 md:py-24" style={{ background: DARK_CARD }}>
        <div className="mx-auto max-w-4xl px-5">
          <ScrollReveal>
            <div className="text-center mb-10">
              <Eyebrow>O Problema</Eyebrow>
              <SectionTitle>O vídeo não é luxo — é o formato que o mercado está a empurrar</SectionTitle>
              <p className="text-[15px] leading-[1.7] max-w-[600px] mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
                O pedido costuma ser o mesmo: «precisa-se de mais vídeo». O bloqueio também: tempo, custo, aprovações e falta de consistência. A IA ajuda, mas só funciona bem quando existe um processo mínimo.
              </p>
            </div>
          </ScrollReveal>

          {/* Pain point cards with SpotlightCard */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={vpOnce}
            variants={staggerContainer(0.15)}
            className="grid sm:grid-cols-2 gap-4"
          >
            {painPoints.map(({ Icon, text }, i) => (
              <motion.div key={i} variants={fadeUp} transition={defaultTransition}>
                <SpotlightCard
                  className="rounded-xl p-5"
                  style={{ background: DARK, border: `1px solid ${DARK_BORDER}` }}
                >
                  <Icon className="w-5 h-5 mb-3" style={{ color: "rgba(255,255,255,0.35)" }} />
                  <p className="text-[15px] leading-[1.55]" style={{ color: "rgba(255,255,255,0.7)" }}>{text}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>

          <ScrollReveal delay={0.25}>
            <p className="text-center text-[16px] italic mt-8" style={{ color: "rgba(255,255,255,0.5)" }}>
              Se pelo menos 2 destes pontos são verdade, esta sessão foi desenhada para desbloquear.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 4 — TRANSFORMATION ═══ */}
      <section className="py-16 md:py-24" style={{ background: DARK }}>
        <div className="mx-auto max-w-4xl px-5">
          <ScrollReveal>
            <div className="text-center mb-10">
              <Eyebrow>Transformação</Eyebrow>
              <SectionTitle>O que muda depois de se inscrever</SectionTitle>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {/* Before — red ambient glow */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={vpOnce}
              variants={staggerContainer(0.1)}
              className="relative rounded-xl p-6"
              style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
            >
              <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: "radial-gradient(circle at center, rgba(239,68,68,0.06), transparent 70%)" }} />
              <div className="relative z-10">
                <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-md mb-4" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>Antes</span>
                <ul className="space-y-3">
                  {beforeItems.map((t, i) => (
                    <motion.li key={i} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} transition={defaultTransition} className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "rgba(248,113,113,0.6)" }} />
                      <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>{t}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* After — green ambient glow */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={vpOnce}
              variants={staggerContainer(0.1)}
              className="relative rounded-xl p-6"
              style={{ background: DARK_CARD, border: "1px solid rgba(34,197,94,0.15)" }}
            >
              <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: "radial-gradient(circle at center, rgba(22,163,74,0.08), transparent 70%)" }} />
              <div className="relative z-10">
                <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-md mb-4" style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80" }}>Depois</span>
                <ul className="space-y-3">
                  {afterItems.map((t, i) => (
                    <motion.li key={i} variants={slideFromRight} transition={defaultTransition} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(142 76% 46%)" }} />
                      <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.75)" }}>{t}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Result cards with hover border */}
          <div className="space-y-3">
            {concreteResults.map((r, i) => (
              <ScrollReveal key={i} delay={i * 0.2}>
                <div
                  className="flex items-start gap-4 rounded-xl p-4 transition-all duration-300 hover:border-l-2"
                  style={{
                    background: DARK_CARD,
                    border: `1px solid ${DARK_BORDER}`,
                    borderLeftColor: "transparent",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderLeftColor = "#16a34a"; e.currentTarget.style.borderLeftWidth = "2px"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.borderLeftWidth = "1px"; }}
                >
                  <span className="font-heading font-extrabold text-[20px] shrink-0" style={{ color: "hsl(142 76% 46%)" }}>{i + 1}</span>
                  <p className="text-[14px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.65)" }}>{r}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5 — QUALIFICATION ═══ */}
      <section className="py-16 md:py-24" style={{ background: DARK_CARD }}>
        <div className="mx-auto max-w-4xl px-5">
          <ScrollReveal>
            <SectionTitle>Para quem é — e para quem não é</SectionTitle>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-xl p-6" style={{ background: DARK, border: `1px solid ${DARK_BORDER}` }}>
                <p className="font-heading font-bold text-[14px] mb-4" style={{ color: "hsl(142 76% 46%)" }}>✓ Certo para</p>
                <ul className="space-y-3">
                  {forWhom.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(142 76% 46%)" }} />
                      <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.65)" }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-6" style={{ background: DARK, border: `1px solid ${DARK_BORDER}` }}>
                <p className="font-heading font-bold text-[14px] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>✗ Não é para</p>
                <ul className="space-y-3">
                  {notFor.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }} />
                      <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.45)" }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 6 — STORYTELLING ═══ */}
      <section className="py-16 md:py-24" style={{ background: DARK_CARD }}>
        <div className="mx-auto max-w-3xl px-5">
          <ScrollReveal>
            <div className="rounded-xl p-6 mb-8" style={{ borderLeft: "3px solid hsl(142 76% 36%)", background: DARK }}>
              <h3 className="font-heading font-bold text-[18px] text-white mb-3">A cena típica</h3>
              <p className="text-[15px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.6)" }}>
                É segunda-feira. O plano pede 5 peças. A equipa pede «mais vídeo». A marca pede consistência. O problema não é falta de ideias: é que cada vídeo vira um projecto, cada aprovação vira atraso e, quando sai, já passou o momento. Nesta sessão mostra-se o sistema mínimo: briefing → gerar → rever → publicar.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl p-5" style={{ background: DARK, borderLeft: "3px solid rgba(239,68,68,0.35)" }}>
                <p className="font-heading font-bold text-[15px] text-white mb-2">Caminho A: «faz-se quando houver tempo»</p>
                <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.45)" }}>Intermitência, stress, pouca aprendizagem acumulada.</p>
              </div>
              <div className="rounded-xl p-5" style={{ background: DARK, borderLeft: "3px solid hsl(142 76% 36%)" }}>
                <p className="font-heading font-bold text-[15px] text-white mb-2">Caminho B: «há um processo mínimo repetível»</p>
                <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.65)" }}>Produção previsível, melhoria contínua, delegação com critérios.</p>
              </div>
            </div>
            <p className="text-center text-[13px] mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>O webinar entrega o Caminho B — sem complicar.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 7 — OPERATIONAL PROMISE ═══ */}
      <section className="py-16 md:py-24" style={{ background: DARK }}>
        <div className="mx-auto max-w-3xl px-5">
          <ScrollReveal>
            <Eyebrow>Promessa operacional</Eyebrow>
            <SectionTitle>No final, fica capaz de…</SectionTitle>
          </ScrollReveal>
          <motion.div
            initial="hidden" whileInView="visible" viewport={vpOnce}
            variants={staggerContainer(0.15)}
            className="space-y-4"
          >
            {operationalPromises.map((p, i) => (
              <motion.div key={i} variants={fadeUp} transition={defaultTransition} className="flex items-start gap-4">
                <span className="font-heading font-extrabold text-[28px] leading-none shrink-0 w-9 text-right" style={{ color: "hsl(142 76% 36%)" }}>
                  <CountUpNumber value={i + 1} />
                </span>
                <p className="text-[15px] leading-[1.6] pt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{p}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 8 — AGENDA ═══ */}
      <section className="py-16 md:py-24" style={{ background: DARK_CARD }}>
        <div className="mx-auto max-w-3xl px-5">
          <ScrollReveal>
            <Eyebrow>Agenda · 45–60 min</Eyebrow>
            <SectionTitle>O que acontece durante a sessão</SectionTitle>
          </ScrollReveal>
          <motion.div
            initial="hidden" whileInView="visible" viewport={vpOnce}
            variants={staggerContainer(0.12)}
            className="space-y-3"
          >
            {agenda.map((item, i) => (
              <motion.div
                key={i}
                variants={slideFromLeft}
                transition={defaultTransition}
                className="flex items-center gap-4 rounded-xl p-4 transition-all duration-300 group"
                style={{ background: DARK, border: `1px solid ${DARK_BORDER}`, borderLeftColor: "transparent" }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderLeftColor = "#16a34a";
                  e.currentTarget.style.borderLeftWidth = "2px";
                  e.currentTarget.style.background = "#16161f";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderLeftColor = "transparent";
                  e.currentTarget.style.borderLeftWidth = "1px";
                  e.currentTarget.style.background = DARK;
                }}
              >
                <span className="font-heading font-extrabold text-[18px] w-8 text-center shrink-0" style={{ color: "hsl(142 76% 46%)" }}>{i + 1}</span>
                <div className="flex-1">
                  <p className="text-[15px] font-medium text-white">{item.title}</p>
                </div>
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                  className="text-[13px] font-medium shrink-0"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {item.time}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 9 — DELIVERABLES ═══ */}
      <section className="py-16 md:py-24" style={{ background: DARK }}>
        <div className="mx-auto max-w-4xl px-5">
          <ScrollReveal>
            <Eyebrow>Entregáveis gratuitos</Eyebrow>
            <SectionTitle>O que se recebe ao participar</SectionTitle>
          </ScrollReveal>
          <motion.div
            initial="hidden" whileInView="visible" viewport={vpOnce}
            variants={staggerContainer(0.15)}
            className="grid sm:grid-cols-3 gap-4"
          >
            {deliverables.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={defaultTransition}
                className="rounded-xl p-5 transition-all duration-300"
                style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(22,163,74,0.06) inset"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = DARK_BORDER; e.currentTarget.style.boxShadow = "none"; }}
              >
                <Icon className="w-6 h-6 mb-3" style={{ color: "hsl(142 76% 46%)" }} />
                <p className="font-heading font-bold text-[15px] text-white mb-1.5">{title}</p>
                <p className="text-[13px] leading-[1.55]" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 10 — TOOLS ═══ */}
      <section className="py-16 md:py-24" style={{ background: DARK_CARD }}>
        <div className="mx-auto max-w-4xl px-5">
          <ScrollReveal>
            <Eyebrow>Ferramentas</Eyebrow>
            <SectionTitle>O que vamos usar (sem jargão)</SectionTitle>
          </ScrollReveal>
          <motion.div
            initial="hidden" whileInView="visible" viewport={vpOnce}
            variants={staggerContainer(0.15)}
            className="grid sm:grid-cols-2 gap-4"
          >
            {tools.map(({ name, desc }, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={defaultTransition}
                className="rounded-xl p-5 transition-all duration-300"
                style={{ background: DARK, border: `1px solid ${DARK_BORDER}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(22,163,74,0.06) inset"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = DARK_BORDER; e.currentTarget.style.boxShadow = "none"; }}
              >
                <p className="font-heading font-bold text-[15px] text-white mb-1">{name}</p>
                <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 11 — SPEAKER ═══ */}
      <section className="py-16 md:py-24" style={{ background: DARK }}>
        <div className="mx-auto max-w-4xl px-5">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Photo with green ring glow */}
            <motion.img
              src={fredericoPhoto}
              alt="Frederico Carvalho"
              className="w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-2xl object-cover shrink-0"
              initial="hidden" whileInView="visible" viewport={vpOnce}
              variants={scaleIn}
              transition={{ ...defaultTransition, duration: 0.7 }}
              style={{
                border: `2px solid ${DARK_BORDER}`,
                boxShadow: "0 0 0 1px rgba(22,163,74,0.2), 0 0 30px rgba(22,163,74,0.1)",
              }}
            />
            {/* Text — staggered */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={vpOnce}
              variants={staggerContainer(0.12)}
            >
              <motion.p variants={fadeUp} transition={defaultTransition} className="font-heading font-extrabold text-[24px] text-white mb-2">Frederico Carvalho</motion.p>
              <motion.p variants={fadeUp} transition={defaultTransition} className="text-[15px] leading-[1.7] mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                Consultor e docente universitário, com experiência em marketing digital e sistemas de produção e automação aplicados ao contexto empresarial.
              </motion.p>
              <motion.p variants={fadeUp} transition={defaultTransition} className="text-[14px] italic mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Foco em método replicável e decisão — não truques.
              </motion.p>
              <motion.div variants={fadeUp} transition={defaultTransition}>
                <GoogleBadge />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ 12 — MID-PAGE CTA ═══ */}
      <section id="inscricao" className="relative overflow-hidden py-16 md:py-24" style={{ background: DARK_CARD }}>
        <AuroraBackground intensity={0.5} />
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] mb-6 text-white">
            <StaggeredWords text="Quer o sistema mínimo para produzir vídeo com consistência?" />
          </h2>
          <ShimmerButton>
            <GreenCTA large />
          </ShimmerButton>
          <p className="text-[13px] mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Lugares limitados para o directo. Materiais enviados após a sessão.
          </p>
        </div>
      </section>

      {/* ═══ 13 — FAQ ═══ */}
      <section className="py-16 md:py-24" style={{ background: DARK }}>
        <div className="mx-auto max-w-2xl px-5">
          <ScrollReveal>
            <SectionTitle>Perguntas frequentes</SectionTitle>
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl overflow-hidden transition-all duration-300 [&[data-state=open]]:border-l-2 [&[data-state=open]]:border-l-green-600"
                  style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
                >
                  <AccordionTrigger className="px-5 py-4 text-left text-[15px] font-semibold text-white hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 text-[14px] leading-[1.65]" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 14 — UPSELL SOFT ═══ */}
      <section className="py-12 md:py-16" style={{ background: DARK_CARD }}>
        <div className="mx-auto max-w-3xl px-5">
          <ScrollReveal>
            <div className="rounded-xl p-6" style={{ borderLeft: "3px solid hsl(142 76% 36%)", background: DARK }}>
              <h3 className="font-heading font-bold text-[18px] text-white mb-2">
                Quer implementar com outputs prontos em 3 horas?
              </h3>
              <p className="text-[14px] leading-[1.65] mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
                Se fizer sentido, existe uma Masterclass prática (lugares limitados) para sair com clips prontos e um workflow replicável.
              </p>
              <a href="#masterclass" className="font-heading font-semibold text-[14px] transition-colors" style={{ color: "hsl(142 76% 46%)" }}>
                Ver Masterclass →
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 15 — FINAL CTA ═══ */}
      <section className="relative overflow-hidden py-16 md:py-24" style={{ background: DARK }}>
        {/* Animated green gradient orb */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[800px] h-[800px] rounded-full final-cta-orb"
            style={{
              background: "radial-gradient(circle, rgba(22,163,74,0.06) 0%, transparent 70%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .final-cta-orb {
                animation: orb-drift 15s ease-in-out infinite;
              }
            }
            @keyframes orb-drift {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              33% { transform: translate(-45%, -55%) scale(1.05); }
              66% { transform: translate(-55%, -45%) scale(0.95); }
            }
          `}</style>
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-heading font-extrabold text-[26px] sm:text-[34px] text-white leading-[1.15] mb-6">
            <StaggeredWords text="Inscrição gratuita — e sai com um sistema que dá para repetir" />
          </h2>
          <ShimmerButton>
            <GreenCTA large />
          </ShimmerButton>
          <p className="text-[13px] mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Sem compromisso. Evento ao vivo em 2 de Março de 2026.
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8" style={{ background: DARK, borderTop: `1px solid ${DARK_BORDER}` }}>
        <div className="mx-auto max-w-4xl px-5 text-center">
          <p className="text-[13px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            © 2026 Frederico Carvalho · DIGITALFC
          </p>
          <div className="flex items-center justify-center gap-4 text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            <button onClick={() => setLegalModal("privacidade")} className="hover:underline cursor-pointer">Privacidade</button>
            <span>·</span>
            <button onClick={() => setLegalModal("termos")} className="hover:underline cursor-pointer">Termos</button>
            <span>·</span>
            <a href="mailto:frederico.carvalho@digitalfc.pt" className="hover:underline">frederico.carvalho@digitalfc.pt</a>
          </div>
        </div>
      </footer>

      {/* Legal modals */}
      <LegalModal open={legalModal === "termos"} title="Termos e Condições" onOpenChange={() => setLegalModal(null)}>
        <TermosContent />
      </LegalModal>
      <LegalModal open={legalModal === "privacidade"} title="Política de Privacidade" onOpenChange={() => setLegalModal(null)}>
        <PrivacidadeContent />
      </LegalModal>
    </div>
  );
};

export default VideoPage;
