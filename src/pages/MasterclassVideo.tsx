import { useEffect, useState } from "react";
import {
  Check, XCircle, Calendar, Clock, Timer,
  Play, FileText, MessageCircle, Cpu, Layers, Wand2,
  Video, Package, ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import ElectricBorder from "@/components/landing/ElectricBorder";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FooterSection } from "@/components/landing/FooterSection";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import fredericoPhoto from "@/assets/frederico-carvalho.jpg";

/* ── Evergreen flag ── */
const MASTERCLASS_LIVE = true; // mudar para false após 12 de Março

/* ── Reduced motion ── */
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
const staggerContainer = (stagger = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});
const defaultTransition = { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const };
const vpOnce = { once: true, margin: "-60px" as const };

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

/* ── Section title ── */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-heading font-extrabold text-[28px] sm:text-[34px] leading-[1.15] mb-6 text-center text-white" style={{ letterSpacing: "-0.5px" }}>
    {children}
  </h2>
);

/* ── Data ── */
const problems = [
  { icon: Layers, title: "Ferramentas sem método", desc: "Sabes usar o Kling e o Flow, mas cada vídeo começa do zero. Não há processo, há tentativa-erro." },
  { icon: Video, title: "Consistência visual impossível", desc: "As personagens mudam de cara entre clips. Os rácios estão errados. O resultado não é publicável." },
  { icon: Timer, title: "Velocidade que não escala", desc: "Demoras horas no que deveria demorar minutos. A IA não poupa tempo — sem método, multiplica o caos." },
];

const agenda = [
  {
    num: "01", title: "Agentes de IA em Pipeline", borderColor: "border-l-green-600",
    desc: "Como configurar agentes especializados no Gemini que trabalham em sequência — do briefing ao prompt técnico, sem intervenção manual.",
    bullets: ["Os 3 GEMs para vídeo profissional", "Como encadear instruções entre agentes", "Ficheiro GEM pronto a importar (incluído)"],
  },
  {
    num: "02", title: "Fluxos de Montagem Automáticos", borderColor: "border-l-emerald-500",
    desc: "Storyboard automático no Kling Canvas. First/last frame para consistência visual garantida. Pipeline de 7 passos do briefing ao clip publicável.",
    bullets: ["Casos reais com marcas portuguesas", "Erros mais comuns — corrigidos ao vivo"],
  },
  {
    num: "03", title: "Edição com Linguagem Natural", borderColor: "border-l-teal-500",
    desc: "Edição no Filmora com comandos em linguagem natural. Ajuste de rácios, transições e áudio sem conhecimentos técnicos. Do clip gerado ao vídeo publicável em menos de 10 minutos.",
    bullets: ["Demonstração completa ao vivo", "Checklist de publicação por plataforma"],
  },
];

const forWhom = [
  "Gestor de marketing que precisa de mais vídeo sem aumentar equipa",
  "Empresário ou PME que faz o próprio marketing e quer resultados profissionais",
  "Criador de conteúdo que quer consistência visual sem depender de editor",
  "Quem já fez a sessão de 70 min e quer ir para o nível seguinte",
  "Quem quer construir um sistema autónomo de produção visual com IA",
];
const notFor = [
  "Quem procura edição avançada ou pós-produção de cinema",
  "Quem quer vídeos longos e complexos (aqui é clip curto, objectivo claro)",
  "Quem espera resultado sem processo",
];

const packItems = [
  { Icon: Play, title: MASTERCLASS_LIVE ? "Masterclass ao vivo — 3 horas com o Frederico (12 de Março)" : "Gravação completa da Masterclass — 3 horas", desc: "" },
  { Icon: Video, title: "Gravação HD completa da Masterclass (acesso permanente)", desc: "" },
  { Icon: Play, title: "Sessão Prática gravada — ~70 min, sem cortes (bónus incluído)", desc: "" },
  { Icon: Cpu, title: "Sistema completo de criação de vídeo com IA", desc: "" },
  { Icon: MessageCircle, title: "Prompts reutilizáveis para a tua empresa", desc: "" },
  { Icon: FileText, title: "Ficheiro GEM pronto a importar no Gemini", desc: "" },
  { Icon: Wand2, title: "Acesso imediato após confirmação de pagamento", desc: "" },
];

const testimonials = [
  { initials: "JV", gradient: "linear-gradient(135deg, #064e3b, #10b981)", name: "Joana Veigas", role: "Guia local · 46 críticas · 14 fotos", quote: "Gostei muito do Webinar IA Imagens. Interessante, bem explicada e cativante. Curiosa para saber cada vez mais. Vou continuar a acompanhar as muitas dicas que o Frederico vai partilhando. Obrigada Frederico!" },
  { initials: "CM", gradient: "linear-gradient(135deg, #7c2d12, #f97316)", name: "Cátia Martins", role: "1 crítica", quote: "Foi um webinar excelente. Para o tema que é parece sempre curto mas agrega sempre muito valor. É muito útil para o trabalho do dia a dia, para quem trabalha com criativos. O Frederico nunca desilude." },
  { initials: "PF", gradient: "linear-gradient(135deg, #1e3a5f, #3b82f6)", name: "Paulo Ferrão", role: "6 críticas", quote: "Webinar esclarecedor. Interessante e recheado como sempre! Obrigado" },
  { initials: "IM", gradient: "linear-gradient(135deg, #134e4a, #0d9488)", name: "Isabel Martins", role: "2 críticas", quote: "As formações do Frederico são sempre excepcionais. Partilha de conhecimento e ensinamento prático." },
  { initials: "DR", gradient: "linear-gradient(135deg, #1e1b4b, #7c3aed)", name: "Dário Ramos", role: "Guia local · 18 críticas · 2 fotos", quote: "Profissional Top, sempre disponível para ajudar" },
  { initials: "MR", gradient: "linear-gradient(135deg, #0c4a6e, #0284c7)", name: "Maria Rocha", role: "2 críticas", quote: "As aulas do prof Frederico Carvalho foram extremamente produtivas e a sua excelente pedagogia torna conteúdos complexos em algo simples, prático e aplicável. Recomendo vivamente." },
];

const speakerCredentials = [
  { emoji: "🎓", title: "Professor Universitário", sub: "FEUC · Univ. Europeia · Univ. Autónoma · Univ. Aveiro" },
  { emoji: "📚", title: "Autor", sub: "\"Guia Essencial SEO\" e Co-Autor \"Marketing Digital para Empresas\"" },
  { emoji: "🎙️", title: "Host Semanal · RFM", sub: "Podcast Marketing por Idiotas" },
  { emoji: "🏢", title: "Fundador e CEO", sub: "DIGITALFC · mais de 700 empresas · L'Oréal · BMW · 3M" },
];

const faqs = [
  { q: "Preciso de ter feito a sessão de vídeo antes?", a: "Não é obrigatório, mas é recomendado. A Masterclass é o nível seguinte — quem já fez a sessão de 70 min vai tirar mais partido." },
  { q: "Posso ver a gravação se não conseguir estar ao vivo?", a: "Sim. A gravação fica disponível na tua área de recursos após o evento." },
  { q: "O que é o ficheiro GEM?", a: "É um ficheiro de configuração que importas directamente no Gemini. Os 3 agentes ficam prontos a usar sem configuração manual." },
  { q: "Funciona para vídeos B2B e B2C?", a: "Sim. As técnicas e ferramentas são agnósticas ao sector." },
  { q: "Emite fatura/recibo?", a: "Sim, automaticamente após confirmação de pagamento." },
  { q: "Preciso de subscrição paga nas ferramentas?", a: "A maioria das ferramentas tem plano gratuito suficiente para a Masterclass. Indicamos o que é necessário após inscrição." },
];

const DARK_950 = "#020617";
const DARK_BORDER = "rgba(255,255,255,0.08)";

const ctaLabel = MASTERCLASS_LIVE ? "Garantir o meu lugar — €67 + IVA" : "Garantir acesso imediato — €67 + IVA";
const ctaNav = "/comprar?plan=masterclass";
const ctaBundleNav = "/comprar?plan=bundle";

/* ══════════════════════════════════════════════════════ */

const MasterclassVideo = () => {
  usePageMeta({
    title: "Masterclass Vídeo com IA — Sistema Completo de Produção",
    description: "3 horas ao vivo com Frederico Carvalho. Agentes de IA, fluxos de montagem e edição em linguagem natural. €67 + IVA.",
    ogUrl: "https://imagenscomia.com/masterclass-video",
  });

  const [showMobileCta, setShowMobileCta] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowMobileCta(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigateCta = () => { window.location.href = ctaNav; };
  const navigateBundle = () => { window.location.href = ctaBundleNav; };

  return (
    <div className="min-h-screen pt-[52px] overflow-x-hidden" style={{ background: DARK_950, color: "#e2e8f0" }}>

      {/* ═══ STICKY TOP BAR ═══ */}
      <motion.div
        initial={{ y: -50 }} animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "linear-gradient(90deg, #020617 0%, rgba(22,163,74,0.15) 50%, #14532d 100%)" }}
      >
        <div className="container mx-auto px-4 py-2.5 max-sm:py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-heading text-[11px] sm:text-[13px] font-semibold uppercase tracking-[1.5px] text-white/90">
              <Play className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
              {MASTERCLASS_LIVE ? "MASTERCLASS · 12 MAR" : "MASTERCLASS · GRAVAÇÃO"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-[14px] font-heading font-bold text-white">
              67 € <span className="text-white/50 font-normal text-[12px]">+ IVA</span>
            </span>
            <button
              onClick={navigateCta}
              className="shrink-0 text-[13px] font-heading font-semibold text-white px-5 max-sm:px-3 py-2.5 rounded-full transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2"
              style={{ background: "#16A34A", boxShadow: "0 4px 14px rgba(22,163,74,0.35)" }}
            >
              {MASTERCLASS_LIVE ? "Garantir o meu lugar" : "Garantir acesso"}
            </button>
          </div>
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
          onClick={navigateCta}
          className="w-full font-heading font-bold text-white text-[15px] py-3.5 rounded-xl cursor-pointer"
          style={{ background: "#16A34A", boxShadow: "0 4px 20px rgba(22,163,74,0.4)" }}
        >
          {ctaLabel}
        </button>
      </motion.div>

      {/* ═══ SECÇÃO 1 — HERO ═══ */}
      <section className="relative overflow-hidden flex items-center justify-center" style={{ minHeight: "90vh", background: DARK_950, paddingTop: 80, paddingBottom: 80 }}>
        {/* Background video */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full" style={{ zIndex: 0, opacity: 0.3, objectFit: "cover" }}>
          <source src="/videos/hero-vidro.mp4" type="video/mp4" />
        </video>
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <div className="absolute rounded-full" style={{ width: 500, height: 500, background: "#16a34a", opacity: 0.14, top: "-5%", left: "-8%", filter: "blur(80px)", animation: "pulse 8s ease-in-out infinite" }} />
          <div className="absolute rounded-full" style={{ width: 400, height: 400, background: "#059669", opacity: 0.09, top: "10%", right: "-5%", filter: "blur(80px)", animation: "pulse 10s ease-in-out infinite reverse" }} />
        </div>
        {/* Noise */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, opacity: 0.035, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px 256px" }} />

        <div className="relative px-5 text-center w-full mx-auto" style={{ zIndex: 2, maxWidth: 860 }}>
          {/* Badge */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ ...defaultTransition, delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 font-heading text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1.5px] sm:tracking-[2px] px-3 sm:px-4 py-1.5 rounded-full mb-4" style={{ border: "1px solid rgba(74,222,128,0.25)", color: "#4ade80", background: "rgba(74,222,128,0.08)" }}>
              📽 {MASTERCLASS_LIVE ? "MASTERCLASS AO VIVO · 12 DE MARÇO · 10H–13H" : "MASTERCLASS · GRAVAÇÃO DISPONÍVEL"}
            </span>
          </motion.div>

          {/* H1 */}
          <h1 className="font-heading leading-[1.05] text-white mb-4 mx-auto text-[32px] md:text-[44px] lg:text-[56px]" style={{ fontWeight: 900, maxWidth: 860, textShadow: "0 0 80px rgba(22,163,74,0.15)" }}>
            <span className="tracking-[-0.5px] md:tracking-[-1px]">
              <StaggeredWords startDelay={0.2} text="O sistema completo de produção de" />
            </span>
            <br className="hidden md:block" />
            <motion.span
              initial="hidden" whileInView="visible" viewport={vpOnce}
              variants={wordReveal}
              transition={{ duration: 0.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, #16a34a 0%, #4ade80 40%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              vídeo com IA
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ ...defaultTransition, delay: 0.5 }}>
            <p className="text-[16px] sm:text-[18px] leading-relaxed max-w-[620px] mx-auto mb-6" style={{ color: "#94a3b8" }}>
              {MASTERCLASS_LIVE
                ? "Três horas ao vivo para construir um processo autónomo — agentes de IA, fluxos de montagem e edição em linguagem natural. Sem depender de equipa. Sem começar do zero cada vez."
                : "Três horas para construir um processo autónomo — agentes de IA, fluxos de montagem e edição em linguagem natural. Sem depender de equipa. Sem começar do zero cada vez."}
            </p>
          </motion.div>

          {/* Date indicator (live only) */}
          {MASTERCLASS_LIVE && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ ...defaultTransition, delay: 0.55 }}>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(6,9,26,0.75)", border: "1px solid rgba(22,163,74,0.2)" }}>
                  <Calendar className="w-4 h-4" style={{ color: "#4ade80" }} />
                  <span className="text-[13px] text-white/80">Quinta-feira, 12 de Março</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(6,9,26,0.75)", border: "1px solid rgba(22,163,74,0.2)" }}>
                  <Clock className="w-4 h-4" style={{ color: "#4ade80" }} />
                  <span className="text-[13px] text-white/80">10h00 — 13h00 (Portugal)</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ ...defaultTransition, delay: 0.6 }}>
            <ElectricBorder color="#22C55E" speed={0.8} chaos={0.08} borderRadius={12} style={{ display: "inline-block", width: "100%", maxWidth: 400 }}>
              <button
                onClick={navigateCta}
                className="w-full font-heading font-bold text-white text-[16px] py-4 px-8 rounded-xl cursor-pointer border-none"
                style={{ background: "#16A34A" }}
              >
                {ctaLabel} <ArrowRight className="inline w-4 h-4 ml-1" />
              </button>
            </ElectricBorder>
          </motion.div>

          {/* Google badge */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ ...defaultTransition, delay: 0.7 }}>
            <div className="mt-6">
              <GoogleBadge />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECÇÃO 2 — PROBLEMA ═══ */}
      <section className="py-20 md:py-28" style={{ background: "#0f172a" }}>
        <div className="container mx-auto px-5 max-w-[960px]">
          <ScrollReveal>
            <SectionTitle>Quem produz vídeo com IA sem sistema perde tempo e dinheiro</SectionTitle>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            {problems.map((p, i) => {
              const Icon = p.icon;
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <SpotlightCard className="rounded-xl border p-6 h-full" style={{ background: "rgba(255,255,255,0.03)", borderColor: DARK_BORDER }}>
                    <Icon className="w-7 h-7 mb-3" style={{ color: "#4ade80" }} />
                    <h3 className="font-heading font-bold text-[18px] text-white mb-2">{p.title}</h3>
                    <p className="text-[14px] leading-relaxed" style={{ color: "#94a3b8" }}>{p.desc}</p>
                  </SpotlightCard>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SECÇÃO 3 — O QUE É ═══ */}
      <section className="py-20 md:py-28" style={{ background: DARK_950 }}>
        <div className="container mx-auto px-5 max-w-[860px]">
          <ScrollReveal>
            <SectionTitle>3 horas. Um sistema. Resultado no dia seguinte.</SectionTitle>
            <p className="text-center text-[16px] mb-12" style={{ color: "#94a3b8" }}>
              Demonstrações reais. Casos práticos. Sem teoria desnecessária.
            </p>
          </ScrollReveal>
          <div className="space-y-6">
            {agenda.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className={`rounded-xl p-6`} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${DARK_BORDER}`, borderLeft: `4px solid`, borderLeftColor: item.borderColor }}>
                  <span className="font-heading font-bold text-[13px] uppercase tracking-[0.1em]" style={{ color: "rgba(74,222,128,0.5)" }}>{item.num}</span>
                  <h3 className="font-heading font-bold text-[20px] text-white mt-1 mb-2">{item.title}</h3>
                  <p className="text-[14px] leading-relaxed mb-3" style={{ color: "#94a3b8" }}>{item.desc}</p>
                  <ul className="space-y-1.5">
                    {item.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-[14px]" style={{ color: "#cbd5e1" }}>
                        <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#4ade80" }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECÇÃO 4 — PARA QUEM É ═══ */}
      <section className="py-20 md:py-28" style={{ background: "#0f172a" }}>
        <div className="container mx-auto px-5 max-w-[960px]">
          <ScrollReveal>
            <SectionTitle>Para quem é</SectionTitle>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <ScrollReveal delay={0.1}>
              <div className="rounded-xl p-6" style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)" }}>
                <h3 className="font-heading font-bold text-[16px] text-white mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" style={{ color: "#4ade80" }} /> Certo se...
                </h3>
                <ul className="space-y-3">
                  {forWhom.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed" style={{ color: "#cbd5e1" }}>
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#4ade80" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="rounded-xl p-6" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
                <h3 className="font-heading font-bold text-[16px] text-white mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5" style={{ color: "#f87171" }} /> Não é para quem...
                </h3>
                <ul className="space-y-3">
                  {notFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed" style={{ color: "#94a3b8" }}>
                      <XCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f87171" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ SECÇÃO 5 — O QUE RECEBES ═══ */}
      <section className="py-20 md:py-28" style={{ background: DARK_950 }}>
        <div className="container mx-auto px-5 max-w-[700px]">
          <ScrollReveal>
            <SectionTitle>O que está incluído — €67 + IVA</SectionTitle>
          </ScrollReveal>
          <div className="space-y-3 mt-8">
            {packItems.map((item, i) => {
              const Icon = item.Icon;
              return (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className="flex items-start gap-3 rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${DARK_BORDER}` }}>
                    <Icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#4ade80" }} />
                    <span className="text-[15px] text-white/90">{item.title}</span>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
          <ScrollReveal delay={0.4}>
            <div className="mt-10 text-center">
              <ElectricBorder color="#22C55E" speed={0.8} chaos={0.08} borderRadius={12} style={{ display: "inline-block", width: "100%", maxWidth: 400 }}>
                <button onClick={navigateCta} className="w-full font-heading font-bold text-white text-[16px] py-4 px-8 rounded-xl cursor-pointer border-none" style={{ background: "#16A34A" }}>
                  {ctaLabel} <ArrowRight className="inline w-4 h-4 ml-1" />
                </button>
              </ElectricBorder>
              <p className="text-[13px] mt-3" style={{ color: "#64748b" }}>
                Pagamento seguro via EuPago · MB WAY · Multibanco · Cartão
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ SECÇÃO 6 — UPGRADE PACK ═══ */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #0f172a 0%, #1a2e1a 50%, #0f172a 100%)" }}>
        <div className="container mx-auto px-5 max-w-[700px] text-center">
          <ScrollReveal>
            <p className="font-heading font-semibold text-[13px] uppercase tracking-[0.14em] mb-3" style={{ color: "#4ade80" }}>PACK IA COMPLETO</p>
            <SectionTitle>Quer o sistema completo — Imagens e Vídeo?</SectionTitle>
            <p className="text-[16px] leading-relaxed mb-6" style={{ color: "#94a3b8" }}>
              O Pack IA Completo inclui esta Masterclass + a Sessão Prática de Vídeo + o Pack completo de Imagens com IA.
              <br />Tudo num único acesso.
            </p>
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-[14px] line-through" style={{ color: "#64748b" }}>€121</span>
              <span className="font-heading font-bold text-[28px] text-white">€107 <span className="text-[14px] font-normal" style={{ color: "#64748b" }}>+ IVA</span></span>
              <span className="text-[13px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>Poupas €14</span>
            </div>
            <button
              onClick={navigateBundle}
              className="font-heading font-bold text-white text-[15px] py-3.5 px-8 rounded-xl cursor-pointer border transition-all"
              style={{ background: "rgba(22,163,74,0.15)", borderColor: "rgba(22,163,74,0.3)", boxShadow: "0 4px 20px rgba(22,163,74,0.1)" }}
            >
              <Package className="inline w-4 h-4 mr-2" />
              Quero o Pack IA Completo — €107 + IVA
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ SECÇÃO 7 — APRESENTADOR ═══ */}
      <section className="py-20 md:py-28" style={{ background: DARK_950 }}>
        <div className="container mx-auto px-5 max-w-[860px]">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="shrink-0">
                <img
                  src={fredericoPhoto}
                  alt="Frederico Carvalho"
                  className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full object-cover"
                  style={{ border: "3px solid rgba(22,163,74,0.3)", boxShadow: "0 0 40px rgba(22,163,74,0.15)" }}
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-[24px] sm:text-[28px] text-white mb-1">Frederico Carvalho</h3>
                <p className="text-[14px] mb-4" style={{ color: "#64748b" }}>20 anos de experiência em marketing digital para empresas</p>
                <div className="space-y-3">
                  {speakerCredentials.map((c, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[18px] shrink-0">{c.emoji}</span>
                      <div>
                        <span className="font-heading font-semibold text-[14px] text-white">{c.title}</span>
                        <span className="text-[13px] ml-1" style={{ color: "#94a3b8" }}>— {c.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5"><GoogleBadge /></div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ SECÇÃO 8 — TESTEMUNHOS ═══ */}
      <section className="py-20 md:py-28" style={{ background: "#0f172a" }}>
        <div className="container mx-auto px-5 max-w-[960px]">
          <ScrollReveal>
            <SectionTitle>O que dizem os participantes</SectionTitle>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="rounded-xl p-5 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${DARK_BORDER}` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-heading font-bold text-[13px]" style={{ background: t.gradient }}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-[14px] text-white">{t.name}</p>
                      <p className="text-[11px]" style={{ color: "#64748b" }}>{t.role}</p>
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed flex-1" style={{ color: "#94a3b8" }}>"{t.quote}"</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECÇÃO 9 — FAQ ═══ */}
      <section className="py-20 md:py-28" style={{ background: DARK_950 }}>
        <div className="container mx-auto px-5 max-w-[700px]">
          <ScrollReveal>
            <SectionTitle>Perguntas frequentes</SectionTitle>
          </ScrollReveal>
          <Accordion type="single" collapsible className="mt-8 space-y-2">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <AccordionItem value={`faq-${i}`} className="rounded-xl border-none px-5" style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${DARK_BORDER}` }}>
                  <AccordionTrigger className="text-[15px] font-heading font-semibold text-white hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[14px] leading-relaxed" style={{ color: "#94a3b8" }}>
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </ScrollReveal>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══ SECÇÃO 10 — CTA FINAL ═══ */}
      <section className="py-20 md:py-28 text-center" style={{ background: "linear-gradient(180deg, #0f172a 0%, #071a0e 50%, #020617 100%)" }}>
        <div className="container mx-auto px-5 max-w-[600px]">
          <ScrollReveal>
            <h2 className="font-heading font-extrabold text-[28px] sm:text-[36px] leading-[1.15] text-white mb-4" style={{ letterSpacing: "-0.5px" }}>
              Três horas que mudam a forma como produces vídeo.
            </h2>
            <p className="text-[16px] mb-8" style={{ color: "#94a3b8" }}>
              Acesso imediato. Gravação incluída. Sistema pronto a usar.
            </p>
            <ElectricBorder color="#22C55E" speed={0.8} chaos={0.08} borderRadius={12} style={{ display: "inline-block", width: "100%", maxWidth: 400 }}>
              <button onClick={navigateCta} className="w-full font-heading font-bold text-white text-[16px] py-4 px-8 rounded-xl cursor-pointer border-none" style={{ background: "#16A34A" }}>
                {ctaLabel} <ArrowRight className="inline w-4 h-4 ml-1" />
              </button>
            </ElectricBorder>
            <p className="text-[13px] mt-4" style={{ color: "#64748b" }}>
              Pagamento seguro via EuPago · Satisfação garantida
            </p>
            <p className="text-[13px] mt-1" style={{ color: "#64748b" }}>
              Dúvidas? fredericodigital@gmail.com · WhatsApp
            </p>
          </ScrollReveal>
        </div>
      </section>

      <FooterSection />
      <WhatsAppSupportButton />
    </div>
  );
};

export default MasterclassVideo;
