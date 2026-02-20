import { useEffect, useState, useRef, useCallback } from "react";
import {
  Check, Clock, ArrowLeftRight, XCircle, Layers,
  FileText, CheckSquare, Video, Calendar, Timer, GraduationCap,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useCountdown } from "@/hooks/useCountdown";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import ElectricBorder from "@/components/landing/ElectricBorder";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { LegalModal } from "@/components/legal/LegalModal";
import { TermosContent } from "@/components/legal/TermosContent";
import { PrivacidadeContent } from "@/components/legal/PrivacidadeContent";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import fredericoPhoto from "@/assets/frederico-carvalho.jpg";

/* Logo imports */
import googleLogo from "@/assets/logos/google.png";
import chatgptLogo from "@/assets/logos/chatgpt.webp";
import claudeLogo from "@/assets/logos/claude.png";
import freepikLogo from "@/assets/logos/freepik.png";
import bytedanceLogo from "@/assets/logos/bytedance.svg";
import geminiLogo from "@/assets/logos/gemini.png";
import llamaLogo from "@/assets/logos/llama-meta.png";
import runcomfyLogo from "@/assets/logos/runcomfy.webp";

const logos = [
  { src: googleLogo, alt: "Google" },
  { src: chatgptLogo, alt: "ChatGPT" },
  { src: claudeLogo, alt: "Claude" },
  { src: freepikLogo, alt: "Freepik" },
  { src: bytedanceLogo, alt: "ByteDance" },
  { src: geminiLogo, alt: "Gemini" },
  { src: llamaLogo, alt: "LLaMA by Meta" },
  { src: runcomfyLogo, alt: "RunComfy" },
];

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
const vpOnce = { once: true, margin: "-60px" as const };

/* ── Smooth scroll helper ── */
const scrollTo = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

/* ── Word splitter for staggered reveal ── */
const StaggeredWords = ({ text, children, startDelay = 0.3 }: { text?: string; children?: React.ReactNode; startDelay?: number }) => {
  if (children) {
    return (
      <motion.span
        initial="hidden"
        animate={prefersReduced() ? "visible" : "hidden"}
        whileInView="visible"
        viewport={vpOnce}
        variants={staggerContainer(0.07)}
        transition={{ delayChildren: startDelay }}
      >
        {children}
      </motion.span>
    );
  }
  const words = (text || "").split(" ");
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
  <p className="font-heading font-semibold text-[13px] uppercase tracking-[0.14em] mb-3" style={{ color: light ? "#16a34a" : "hsl(142 76% 36%)" }}>
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
  { time: "15 min", title: "O sistema mínimo de delegação (briefing + checklist)", tag: "CORE" },
  { time: "20 min", title: "Demonstração: do briefing ao clip", tag: "AO VIVO" },
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

const speakerCredentials = [
  { emoji: "🎓", title: "Professor Universitário", sub: "Universidade de Coimbra (FEUC) · Univ. Europeia (IPAM) · Univ. Autónoma · Univ. Aveiro" },
  { emoji: "📚", title: "Autor", sub: "\"Guia Essencial SEO\" e Co-Autor \"Marketing Digital para Empresas\"" },
  { emoji: "🎙️", title: "Host Semanal · RFM", sub: "Podcast Marketing por Idiotas" },
  { emoji: "🏢", title: "Fundador e CEO", sub: "DIGITALFC consultoria com auditoria digital a mais de 700+ empresas. L'Oréal. BMW. 3M" },
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
    title: "Webinar Gratuito · Vídeo com IA para Marketing · 3 Março 2026",
    description: "Sessão prática ao vivo para gestores e profissionais de marketing. Sistema mínimo de delegação: briefing + checklist + critérios de qualidade. Gratuito.",
  });

  const [legalModal, setLegalModal] = useState<"termos" | "privacidade" | null>(null);
  const { days, hours, minutes, seconds } = useCountdown(new Date("2026-03-03T21:00:00"));

  return (
    <div className="min-h-screen pt-[52px]" style={{ background: DARK, color: "#e2e8f0" }}>

      {/* ═══ 1 — STICKY TOP BAR WITH COUNTDOWN ═══ */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-ink-900 via-[hsl(262,83%,58%)]/20 to-blue-700"
      >
        <div className="container mx-auto px-4 py-2.5 max-sm:py-2 flex items-center justify-between gap-3 max-sm:gap-2">
          <p className="hidden sm:block text-[13px] text-white/90 font-medium tracking-wide">
            AO VIVO · 3 MAR · 21H00
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
            onClick={scrollTo("inscricao")}
            className="shrink-0 text-[13px] font-heading font-semibold text-white bg-green-600 hover:bg-green-700 px-5 max-sm:px-3 py-2.5 rounded-full transition-all shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] cursor-pointer"
          >
            Quero inscrever-me!
          </button>
        </div>
      </motion.div>

      {/* ═══ 2 — HERO ═══ */}
      <section className="relative overflow-hidden flex items-center justify-center" style={{ minHeight: "100vh", background: "#050709", paddingTop: 80, paddingBottom: 80 }}>
        {/* Animated orbs background */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <div className="absolute rounded-full hero-orb-1" style={{ width: 500, height: 500, background: "#16a34a", opacity: 0.12, top: "-5%", left: "-8%", filter: "blur(80px)" }} />
          <div className="absolute rounded-full hero-orb-2" style={{ width: 400, height: 400, background: "#1d4ed8", opacity: 0.09, top: "10%", right: "-5%", filter: "blur(80px)" }} />
          <div className="absolute rounded-full hero-orb-3" style={{ width: 350, height: 350, background: "#7c3aed", opacity: 0.07, bottom: "5%", left: "50%", transform: "translateX(-50%)", filter: "blur(80px)" }} />
        </div>
        {/* Noise grain overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, opacity: 0.035, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px 256px" }} />

        <div className="relative px-5 text-center w-full" style={{ zIndex: 2, maxWidth: 960, margin: "0 auto" }}>
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

          {/* Headline — 72px desktop, gradient on "Inteligência Artificial" */}
          <h1
            className="font-heading leading-[1.05] text-white mb-4"
            style={{ fontWeight: 900, letterSpacing: "-2px", textShadow: "0 0 80px rgba(22,163,74,0.15)", fontSize: "clamp(36px, 5.5vw, 62px)" }}
          >
            <StaggeredWords startDelay={0.2}>
              {["Aprende", "a", "criar", "vídeos", "com"].map((w, i) => (
                <motion.span key={i} variants={wordReveal} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="inline-block mr-[0.3em]">
                  {w}
                </motion.span>
              ))}
              <br />
              {["Inteligência", "Artificial"].map((w, i) => (
                <motion.span
                  key={`ia-${i}`}
                  variants={wordReveal}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block mr-[0.3em]"
                  style={{
                    background: "linear-gradient(135deg, #16a34a 0%, #4ade80 40%, #22d3ee 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {w}
                </motion.span>
              ))}
              {["para", "marketing"].map((w, i) => (
                <motion.span key={`end-${i}`} variants={wordReveal} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="inline-block mr-[0.3em]">
                  {w}
                </motion.span>
              ))}
            </StaggeredWords>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial="hidden" animate="visible"
            variants={fadeUp} transition={{ ...defaultTransition, delay: 0.9 }}
            className="font-medium mb-2"
            style={{ fontSize: "clamp(18px, 2.5vw, 22px)", color: "rgba(255,255,255,0.75)", letterSpacing: "-0.3px" }}
          >
            Com um sistema simples de delegação, sem caos.
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

          {/* 4 Info boxes with Lucide icons */}
          <motion.div
            initial="hidden" animate="visible"
            variants={staggerContainer(0.1)}
            transition={{ delayChildren: 1.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 max-w-[640px] mx-auto"
          >
            {([
              { Icon: Calendar, label: "DATA", value: "3 de Março" },
              { Icon: Clock, label: "HORÁRIO", value: "21h00" },
              { Icon: Timer, label: "DURAÇÃO", value: "45–60 min" },
              { Icon: GraduationCap, label: "INVESTIMENTO", value: "Gratuito" },
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

          {/* CTA with ElectricBorder */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ ...defaultTransition, delay: 1.5 }} className="flex justify-center">
            <ElectricBorder color="#22C55E" speed={0.8} chaos={0.08} borderRadius={10}>
              <button
                onClick={scrollTo("inscricao")}
                className="font-heading text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] w-full"
                style={{ background: "#16A34A", fontWeight: 700, padding: "16px 32px", borderRadius: 10, maxWidth: 400, minWidth: 280 }}
              >
                Garantir inscrição gratuita
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

      {/* ═══ 2b — LOGO MARQUEE ═══ */}
      <section
        className="py-8"
        style={{ background: "#060D1A", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-center text-sm uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          Plataformas a considerar
        </p>
        <div
          className="relative overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="flex w-max video-logo-marquee">
            {[...logos, ...logos].map((logo, i) => (
              <img
                key={i}
                src={logo.src}
                alt={logo.alt}
                className="h-7 mx-10 object-contain transition-opacity duration-300 hover:opacity-80"
                style={{ filter: "brightness(0) invert(1)", opacity: 0.5 }}
                loading="lazy"
              />
            ))}
          </div>
        </div>
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .video-logo-marquee { animation: videoMarquee 30s linear infinite; }
          }
          @keyframes videoMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ═══ 3 — PROBLEM (Pain Points) ═══ */}
      <section id="problema" className="py-16 md:py-24" style={{ background: "#0d0d14" }}>
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

          <motion.div
            initial="hidden" whileInView="visible" viewport={vpOnce}
            variants={staggerContainer(0.12)}
            className="grid sm:grid-cols-2 gap-4"
          >
            {painPoints.map(({ Icon, text }, i) => (
              <motion.div key={i} variants={fadeUp} transition={defaultTransition}>
                <SpotlightCard
                  className="rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-[2px]"
                  style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Ghost number */}
                  <span
                    className="absolute pointer-events-none select-none"
                    style={{ fontSize: 80, fontWeight: 900, color: "rgba(255,255,255,0.04)", bottom: -10, right: 10, lineHeight: 1 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon className="w-5 h-5 mb-3 relative z-10" style={{ color: "rgba(255,255,255,0.35)" }} />
                  <p className="text-[15px] leading-[1.55] relative z-10" style={{ color: "#ddd", fontWeight: 600 }}>{text}</p>
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
      <section className="py-16 md:py-24" style={{ background: "#050709" }}>
        <div className="mx-auto max-w-4xl px-5">
          <ScrollReveal>
            <div className="text-center mb-10">
              <Eyebrow>Transformação</Eyebrow>
              <SectionTitle>O que muda depois de se inscrever</SectionTitle>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {/* Before */}
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

            {/* After */}
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

          {/* Result cards */}
          <div className="space-y-3">
            {concreteResults.map((r, i) => (
              <ScrollReveal key={i} delay={i * 0.2}>
                <div
                  className="flex items-start gap-4 rounded-xl p-4 transition-all duration-300 hover:border-l-2"
                  style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}`, borderLeftColor: "transparent" }}
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

      {/* ═══ 8 — AGENDA (Editorial / Light bg) ═══ */}
      <section className="py-16 md:py-24" style={{ background: "#f8f9fa" }}>
        <div className="mx-auto max-w-3xl px-5">
          <ScrollReveal>
            <Eyebrow light>Agenda · 45–60 min</Eyebrow>
            <SectionTitle light={false}>O que acontece durante a sessão</SectionTitle>
          </ScrollReveal>
          <motion.div
            initial="hidden" whileInView="visible" viewport={vpOnce}
            variants={staggerContainer(0.1)}
          >
            {agenda.map((item, i) => (
              <motion.div
                key={i}
                variants={slideFromLeft}
                transition={defaultTransition}
                className="flex items-center py-[14px] transition-all duration-200 group cursor-default"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
              >
                <span
                  className="font-heading font-bold text-[11px] w-[40px] shrink-0 transition-colors duration-200 group-hover:text-green-600"
                  style={{ color: "#ddd" }}
                >
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span
                  className="flex-1 text-[13px] transition-colors duration-200 group-hover:text-black flex items-center gap-2"
                  style={{ color: "#888" }}
                >
                  {item.title}
                  {item.tag && (
                    <span
                      className="inline-block text-[8px] font-bold uppercase rounded px-[7px] py-[2px]"
                      style={{ background: "rgba(22,163,74,0.12)", color: "#16a34a", marginLeft: 4 }}
                    >
                      {item.tag}
                    </span>
                  )}
                </span>
                <span className="text-[11px] shrink-0" style={{ color: "#555" }}>{item.time}</span>
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

      {/* ═══ 11 — SPEAKER (White bg, like /inicial) ═══ */}
      <section className="py-14 md:py-20 px-4" style={{ background: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="mx-auto max-w-[960px]">
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

      {/* ═══ 12 — MID-PAGE CTA ═══ */}
      <section id="inscricao" className="relative overflow-hidden py-16 md:py-24" style={{ background: DARK_CARD }}>
        <AuroraBackground intensity={0.5} />
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] mb-6 text-white">
            <StaggeredWords text="Quer o sistema mínimo para produzir vídeo com consistência?" />
          </h2>
          <div className="flex justify-center">
            <ElectricBorder color="#22C55E" speed={0.8} chaos={0.08} borderRadius={10}>
              <button
                onClick={scrollTo("inscricao")}
                className="font-heading text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] w-full text-[17px]"
                style={{ background: "#16A34A", fontWeight: 700, padding: "16px 32px", borderRadius: 10, maxWidth: 400, minWidth: 280 }}
              >
                Garantir inscrição gratuita
              </button>
            </ElectricBorder>
          </div>
          <p className="text-[13px] mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Lugares limitados para o directo. Materiais enviados após a sessão.
          </p>
        </div>
      </section>

      {/* ═══ 13 — FAQ (Light bg) ═══ */}
      <section className="py-16 md:py-24" style={{ background: "#f8f9fa" }}>
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
                  className="rounded-xl overflow-hidden transition-all duration-300 [&[data-state=open]]:border-l-2 [&[data-state=open]]:border-l-green-600"
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
      <section className="relative overflow-hidden py-16 md:py-24" style={{ background: "#050709" }}>
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
              .final-cta-orb { animation: orb-drift 15s ease-in-out infinite; }
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
          <div className="flex justify-center">
            <ElectricBorder color="#22C55E" speed={0.8} chaos={0.08} borderRadius={10}>
              <button
                onClick={scrollTo("inscricao")}
                className="font-heading text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] w-full text-[17px]"
                style={{ background: "#16A34A", fontWeight: 700, padding: "16px 32px", borderRadius: 10, maxWidth: 400, minWidth: 280 }}
              >
                Garantir inscrição gratuita
              </button>
            </ElectricBorder>
          </div>
          <p className="text-[13px] mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Sem compromisso. Evento ao vivo em 3 de Março de 2026.
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
