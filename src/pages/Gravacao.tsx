import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useAnimationFrame, useTransform } from "framer-motion";
import {
  Check, X, User, Mail, Phone, Loader2,
  Play, FileText, BookOpen, Sparkles, ListChecks, Lightbulb,
  ChevronRight, ShieldCheck, Clock, Zap,
  MessageCircle, MailIcon,
} from "lucide-react";
import ColorBends from "@/components/landing/ColorBends";
import ElectricBorder from "@/components/landing/ElectricBorder";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { GallerySection } from "@/components/landing/GallerySection";
import { PresenterSection } from "@/components/landing/PresenterSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { LegalModal } from "@/components/legal/LegalModal";
import { TermosContent } from "@/components/legal/TermosContent";
import { PrivacidadeContent } from "@/components/legal/PrivacidadeContent";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import {
  storeToken,
  readToken,
  requestAccessLink,
  ACCESS_LINK_GENERIC_MESSAGE,
} from "@/lib/legacyAccess";
import googleLogo from "@/assets/logos/google.png";
import chatgptLogo from "@/assets/logos/chatgpt.webp";
import claudeLogo from "@/assets/logos/claude.png";
import freepikLogo from "@/assets/logos/freepik.png";
import bytedanceLogo from "@/assets/logos/bytedance.svg";
import geminiLogo from "@/assets/logos/gemini.png";
import llamaLogo from "@/assets/logos/llama-meta.png";
import runcomfyLogo from "@/assets/logos/runcomfy.webp";

const marqueeLogos = [
  { src: googleLogo, alt: "Google" },
  { src: chatgptLogo, alt: "ChatGPT" },
  { src: claudeLogo, alt: "Claude" },
  { src: freepikLogo, alt: "Freepik" },
  { src: bytedanceLogo, alt: "ByteDance" },
  { src: geminiLogo, alt: "Gemini" },
  { src: llamaLogo, alt: "LLaMA by Meta" },
  { src: runcomfyLogo, alt: "RunComfy" },
];

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

/* ── Data ── */

const packItems = [
  { icon: Play, text: "Sessão completa em vídeo (60 min, HD)" },
  { icon: FileText, text: "PDF resumo da sessão (consulta rápida)" },
  { icon: BookOpen, text: "SOP — Método profissional (Nano Banana Pro) para criar imagens consistentes" },
  { icon: Sparkles, text: "Exercício prático com 1 prompt profissional (replicável)" },
  { icon: ListChecks, text: "Guia passo-a-passo Nano Banana Pro (do briefing ao output final)" },
  { icon: Lightbulb, text: "Biblioteca de melhores prompts (editáveis, por objectivo)" },
];

/* ── GradientText (animated) ── */
function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const progress = useMotionValue(0);
  const elapsed = useRef(0);
  const lastTime = useRef<number | null>(null);
  const duration = 8000;
  useAnimationFrame((time) => {
    if (lastTime.current === null) { lastTime.current = time; return; }
    elapsed.current += time - lastTime.current;
    lastTime.current = time;
    const cycle = elapsed.current % (duration * 2);
    progress.set(cycle < duration ? (cycle / duration) * 100 : 100 - ((cycle - duration) / duration) * 100);
  });
  const bgPos = useTransform(progress, (p) => `${p}% 50%`);
  return (
    <motion.span className={className} style={{
      backgroundImage: "linear-gradient(to right, #60A5FA, #A78BFA, #34D399, #60A5FA)",
      backgroundSize: "300% 100%", backgroundPosition: bgPos,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "inline",
    }}>{children}</motion.span>
  );
}

const challenges = [
  { num: "01", title: "Criativos com aspeto genérico (tipo stock)" },
  { num: "02", title: "Falta de consistência visual entre publicações" },
  { num: "03", title: "Perda de tempo a testar ferramentas sem critério" },
  { num: "04", title: "Precisa de mais volume sem aumentar equipa/custos" },
  { num: "05", title: "Urgência: criar rápido, sem depender de terceiros" },
  { num: "06", title: "Autonomia para criar quando é preciso" },
];

const methods = [
  {
    num: "01",
    title: "Estado da Arte",
    color: "border-l-[#2563EB]",
    desc: "Modelos e versões disponíveis. Ferramentas gratuitas e pagas — o que escolher e quando.",
    outcome: "Mapa claro do ecossistema actual de IA para imagens.",
  },
  {
    num: "02",
    title: "Instruções Profissionais",
    color: "border-l-[#0891B2]",
    desc: "Passo a passo do briefing à produção. Adaptação de formatos e edição do resultado.",
    outcome: "Método replicável para qualquer brief.",
  },
  {
    num: "03",
    title: "Do Objetivo ao Criativo",
    color: "border-l-[#16A34A]",
    desc: "Fluxo de trabalho completo. Peças prontas a publicar — com consistência visual.",
    outcome: "Processo para produzir criativos com qualidade e velocidade.",
  },
];

const transformationBullets = [
  "Criar imagens prontas a publicar (IG, LinkedIn, Ads)",
  "Manter consistência visual entre peças",
  "Escolher a ferramenta certa para cada caso",
  "Produzir mais criativos sem depender de terceiros",
];

const forWhom = [
  "Responsável de marketing que precisa de mais imagens sem aumentar orçamento",
  "Empresário ou PME que faz o próprio marketing e quer resultados profissionais",
  "Gestor de e-commerce com necessidade de imagens de produto escaláveis",
  "Criador de conteúdo que quer consistência visual sem depender de designer",
  "Quem já tentou IA para imagens mas ficou frustrado e quer perceber onde falhou",
];

const notFor = [
  { main: "Quem procura ferramenta mágica sem método", sub: "há método. É isso que se ensina." },
  { main: "Designer profissional à procura de IA técnica avançada", sub: "este pack é prático, não técnico." },
];

const testimonials = [
  { name: "Dario Ramos", initials: "DR", gradient: "linear-gradient(135deg, #2563EB, #7C3AED)", quote: "Profissional Top, sempre disponível para ajudar." },
  { name: "Marcelo Caruana", initials: "MC", gradient: "linear-gradient(135deg, #16A34A, #15803D)", quote: "Conteúdos sempre muito detalhados e claros :)" },
  { name: "Isabel Martins", initials: "IM", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", quote: "As formações do Frederico são sempre excepcionais. Partilha de conhecimento e ensinamento prático." },
  { name: "Silvana Curado", initials: "SC", gradient: "linear-gradient(135deg, #06B6D4, #2563EB)", quote: "Muito bom. A sessão introdutória sobre geração de imagem a que assisti teve uma velocidade ótima, para o meu nível de conhecimento médio-baixo e cumpriu escrupulosamente a proposta de valor. Boa energia!" },
  { name: "Paulo Ferrão", initials: "PF", gradient: "linear-gradient(135deg, #F59E0B, #D97706)", quote: "Webinar esclarecedor. Interessante e recheado como sempre! Obrigado" },
  { name: "Joana Veigas", initials: "JV", gradient: "linear-gradient(135deg, #16A34A, #06B6D4)", quote: "Gostei muito do Webinar IA Imagens. Interessante, bem explicada e cativante. Curiosa para saber cada vez mais. Vou continuar a acompanhar as muitas dicas que o Frederico vai partilhando. Obrigada Frederico!" },
];

const faqs = [
  { q: "Como recebo o acesso?", a: "Recebes um email com o link de acesso imediato ao vídeo e aos documentos de apoio, logo após a confirmação do pagamento." },
  { q: "Quanto tempo fica disponível?", a: "O acesso ao vídeo e aos documentos é permanente — podes rever quantas vezes quiseres, ao teu ritmo." },
  { q: "Inclui todos os documentos do pack?", a: "Sim. Inclui PDF resumo da sessão, SOP Nano Banana Pro, guia passo-a-passo e biblioteca de prompts editáveis." },
  { q: "Funciona com ferramentas gratuitas?", a: "Sim. O método é demonstrado com ferramentas gratuitas e pagas, e aplica-se a qualquer uma delas." },
  { q: "Preciso de conhecimentos técnicos?", a: "Não. O conteúdo foi pensado para profissionais de marketing e empresários — não é necessário saber programar ou ter experiência com IA." },
  { q: "Emite fatura/recibo?", a: "Sim. A fatura é emitida automaticamente após confirmação do pagamento." },
  { q: "E se tiver dificuldades?", a: "Podes contactar-nos a qualquer momento por email ou pelo WhatsApp disponível nesta página." },
];

/* ── Reusable CTA button ── */
const CTAButton = ({ onClick, className = "" }: { onClick: () => void; className?: string }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`w-full sm:w-auto font-heading font-bold text-base px-10 py-4 rounded-xl transition-all text-white ${className}`}
    style={{ background: "#2563EB", boxShadow: "0 4px 14px 0 rgba(37,99,235,0.30)" }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1D4ED8"; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2563EB"; }}
  >
    Garantir acesso imediato (27 €)
  </motion.button>
);

/* ── Google badge (reused) ── */
const GoogleBadge = ({ dark = false }: { dark?: boolean }) => (
  <div
    className="inline-flex items-center gap-[10px] rounded-[10px] px-[14px] py-[8px]"
    style={{
      background: dark ? "rgba(255,255,255,0.06)" : "#F8FAFC",
      border: dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid #E2E8F0",
    }}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    <div className="w-px h-[18px] mx-[2px]" style={{ background: dark ? "rgba(255,255,255,0.10)" : "#E2E8F0" }} />
    <div className="flex flex-col gap-px">
      <div className="flex items-center gap-1">
        <span className="font-heading font-bold" style={{ fontSize: 14, color: dark ? "#F8FAFC" : "#0F172A" }}>5,0</span>
        <span style={{ fontSize: 13, lineHeight: 1, color: "#FBBC05" }}>★★★★★</span>
      </div>
      <span style={{ fontSize: 13, color: dark ? "rgba(255,255,255,0.50)" : "#64748B" }}>1 194 avaliações no Google</span>
    </div>
  </div>
);

/* ── Page ── */

const Gravacao = () => {
  usePageMeta({
    title: "Imagens Profissionais com IA — Acesso Imediato ao Pack Completo (27 €)",
    description: "Sessão completa em vídeo + documentos de apoio. Método testado para criar imagens profissionais com Inteligência Artificial. 27 €, acesso imediato.",
  });

  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [legalModal, setLegalModal] = useState<"termos" | "privacidade" | null>(null);

  const openModal = () => setModalOpen(true);

  const handleRegistration = async () => {
    if (!fullName.trim()) { setError("O nome é obrigatório."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Indique um email válido."); return; }
    if (!whatsapp.trim()) { setError("Indique o seu WhatsApp ou telemóvel."); return; }
    if (!acceptedTerms) { setError("É necessário aceitar os termos para continuar."); return; }
    setLoading(true);
    setError(null);
    try {
      const firstName = fullName.trim().split(" ")[0] || "";
      const lastName = fullName.trim().split(" ").slice(1).join(" ");
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPhone = whatsapp.replace(/[^\d]/g, "");
      const existingToken = readToken("upgrade-gravacao");
      const { data, error: fnError } = await supabase.functions.invoke("register-free", {
        body: {
          firstName,
          lastName,
          email: normalizedEmail,
          whatsapp: normalizedPhone || undefined,
          registrationSource: "gravacao",
          ...(existingToken ? { editToken: existingToken } : {}),
        },
      });
      if (fnError) throw fnError;

      // Already registered and no proof of ownership: email the access link
      // instead of revealing anything about the registration.
      if (data?.needsVerification) {
        await requestAccessLink(normalizedEmail, "upgrade-gravacao");
        setError(ACCESS_LINK_GENERIC_MESSAGE);
        return;
      }

      const token = data?.editToken || existingToken || null;
      storeToken("upgrade-gravacao", token);
      setModalOpen(false);
      navigate(
        `/upgrade-gravacao?name=${encodeURIComponent(fullName.trim())}` +
        `${token ? `&t=${encodeURIComponent(token)}` : ""}` +
        `${data?.referralCode ? `&ref_code=${data.referralCode}` : ""}`,
      );
      setTimeout(() => { try { const fbqSafe = (window as any)?.fbq; if (typeof fbqSafe === "function") fbqSafe("track", "Lead"); } catch {} }, 0);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setError("Não foi possível concluir. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF" }}>

      {/* ═══ 1. HERO (dark/neon, 2 columns) ═══ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #06091A 0%, #0B1230 50%, #080E22 100%)" }}
      >
        {/* ColorBends background */}
        <div className="absolute inset-0 z-0" style={{ opacity: 0.85 }}>
          <ColorBends
            colors={["#1E40AF", "#7C3AED", "#0EA5E9", "#10B981"]}
            rotation={0} speed={0.25} scale={1.2} frequency={0.8}
            warpStrength={1.2} mouseInfluence={0.3} parallax={0.3} noise={0.05}
            transparent autoRotate={2}
          />
        </div>

        <div
          className="relative z-10 mx-auto pt-10 pb-12 md:pt-[60px] md:pb-[72px] px-6 md:px-10"
          style={{ maxWidth: 860, textAlign: "center" }}
        >
          {/* Badge */}
          <motion.div {...fade(0.05)}>
            <div className="mb-3">
              <span
                className="inline-block backdrop-blur-sm font-heading uppercase tracking-[0.12em] px-5 py-2 rounded-full"
                style={{
                  background: "rgba(37,99,235,0.15)",
                  border: "1px solid rgba(37,99,235,0.30)",
                  color: "#93C5FD",
                  fontSize: 14, fontWeight: 600,
                  boxShadow: "0 0 12px rgba(59,130,246,0.35), 0 0 32px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                ACESSO IMEDIATO
              </span>
            </div>
          </motion.div>

          {/* H1 */}
          <motion.div {...fade(0.1)}>
            <h1 style={{ maxWidth: 860, margin: "0 auto" }}>
              <span className="block font-heading" style={{
                color: "#F8FAFC", fontWeight: 800,
                fontSize: "clamp(28px, 4.5vw, 40px)", lineHeight: 1.12,
                letterSpacing: "-0.025em", textShadow: "0 2px 40px rgba(0,0,0,0.5)",
              }}>
                Aprende a Criar Imagens Profissionais{"\n"}com Inteligência Artificial
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.div {...fade(0.15)}>
            <p style={{ fontSize: 18, fontWeight: 400, marginTop: 16, marginBottom: 24, color: "#CBD5E1" }}>
              Do briefing à imagem pronta a publicar,{" "}
              <GradientText className="font-heading font-semibold">
                com um processo replicável e templates prontos.
              </GradientText>
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div {...fade(0.25)}>
            <div>
              <ElectricBorder
                color="#22C55E" speed={0.8} chaos={0.08} borderRadius={10}
                style={{ display: "inline-block", width: "100%", maxWidth: 400 }}
              >
                <button
                  onClick={openModal}
                  style={{
                    background: "#16A34A", color: "#fff",
                    fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16,
                    padding: "16px 32px", borderRadius: 10, border: "none", cursor: "pointer", width: "100%",
                  }}
                >
                  Garantir acesso imediato (27 €)
                </button>
              </ElectricBorder>
            </div>
          </motion.div>

          {/* Google badge dark */}
          <motion.div {...fade(0.3)}>
            <div className="mt-4">
              <GoogleBadge dark />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. LOGO MARQUEE ═══ */}
      <section
        className="py-8"
        style={{
          background: "#060D1A",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
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
          <div className="flex w-max animate-marquee-gravacao">
            {[...marqueeLogos, ...marqueeLogos].map((logo, i) => (
              <img
                key={i}
                src={logo.src}
                alt={logo.alt}
                className="h-7 mx-10 object-contain"
                style={{ filter: "brightness(0) invert(1)", opacity: 0.5 }}
                loading="lazy"
              />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marqueeGravacao {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-gravacao {
            animation: marqueeGravacao 30s linear infinite;
          }
        `}</style>
      </section>

      {/* ═══ 3. BLOQUEIOS ═══ */}
      <section id="bloqueios" style={{ background: "#F8FAFC" }} className="py-14 md:py-20">
        <div className="mx-auto px-5 sm:px-6" style={{ maxWidth: 960 }}>
          <ScrollReveal>
            <h2 className="font-heading font-bold text-center mb-12" style={{ fontSize: "clamp(22px, 3vw, 30px)", color: "#0F172A" }}>
              Isto resolve estes 6 bloqueios
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {challenges.map((c, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="rounded-2xl p-6 h-full" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <span className="font-heading font-bold text-[13px] tracking-[0.1em]" style={{ color: "#94A3B8" }}>{c.num}</span>
                  <h3 className="font-heading font-semibold text-[16px] mt-2" style={{ color: "#0F172A" }}>{c.title}</h3>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.35}>
            <p className="text-center text-[16px] mt-10" style={{ color: "#64748B" }}>
              Se houver identificação com 2+ pontos, este pack encurta meses de tentativa-erro. Menos bloqueios, mais autonomia: cria quando precisa, sem depender de designer ou agência.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 4. TRANSFORMAÇÃO (NEW) ═══ */}
      <section style={{ background: "#FFFFFF" }} className="py-14 md:py-20">
        <div className="mx-auto px-5 sm:px-6" style={{ maxWidth: 700 }}>
          <ScrollReveal>
            <h2 className="font-heading font-bold text-center mb-10" style={{ fontSize: "clamp(22px, 3vw, 30px)", color: "#0F172A" }}>
              No final, vais ser capaz de…
            </h2>
          </ScrollReveal>

          <div className="space-y-4">
            {transformationBullets.map((b, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#F0FDF4" }}>
                    <Check className="w-4 h-4" style={{ color: "#16A34A" }} />
                  </div>
                  <p className="text-[16px]" style={{ color: "#0F172A" }}>{b}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-center text-[15px] mt-8 font-medium" style={{ color: "#64748B" }}>
              Processo replicável — não uma lista de truques soltos.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 5. MÉTODO ═══ */}
      <section style={{ background: "#F8FAFC" }} className="py-14 md:py-20">
        <div className="mx-auto px-5 sm:px-6" style={{ maxWidth: 960 }}>
          <ScrollReveal>
            <p className="font-heading font-semibold text-[13px] uppercase tracking-[0.08em] text-center mb-2" style={{ color: "#2563EB" }}>
              MÉTODO
            </p>
            <h2 className="font-heading font-bold text-center mb-2" style={{ fontSize: "clamp(22px, 3vw, 30px)", color: "#0F172A" }}>
              O que se aprende no pack (3 blocos práticos)
            </h2>
            <p className="text-[16px] text-center mb-12 max-w-lg mx-auto" style={{ color: "#64748B" }}>
              Demos reais. Resultados no dia seguinte.
            </p>
          </ScrollReveal>

          <div className="space-y-5">
            {methods.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className={`${s.color} border-l-4 rounded-r-2xl p-7`} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderLeftWidth: 4 }}>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <span className="font-heading font-extrabold text-[40px] leading-none md:min-w-[56px] md:text-right" style={{ color: "#E2E8F0" }}>{s.num}</span>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-lg mb-2" style={{ color: "#0F172A" }}>{s.title}</h3>
                      <p className="text-[16px] leading-relaxed mb-3" style={{ color: "#334155" }}>{s.desc}</p>
                      <p className="text-[14px] font-medium inline-block rounded-md px-3 py-1.5" style={{ color: "#16A34A", background: "#F0FDF4", border: "1px solid #DCFCE7" }}>
                        {s.outcome}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* 3 outcome bullets */}
          <ScrollReveal delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4 mt-10 mb-8">
              {["Processo replicável", "Checklist prática", "Templates reutilizáveis"].map((b, i) => (
                <span key={i} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium" style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}>
                  <Check className="w-3.5 h-3.5" /> {b}
                </span>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="text-center">
              <CTAButton onClick={openModal} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 6. O QUE RECEBES ═══ */}
      <section id="pack-section" style={{ background: "#FFFFFF" }} className="py-14 md:py-20">
        <div className="mx-auto px-5 sm:px-6" style={{ maxWidth: 700 }}>
          <ScrollReveal>
            <h2 className="font-heading font-bold text-center mb-10" style={{ fontSize: "clamp(22px, 3vw, 30px)", color: "#0F172A" }}>
              O que recebes (Pack 27 €)
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="rounded-2xl p-8" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="space-y-4">
                {packItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EFF6FF" }}>
                        <Icon className="w-4 h-4" style={{ color: "#2563EB" }} />
                      </div>
                      <p className="text-[16px] pt-1" style={{ color: "#0F172A" }}>{item.text}</p>
                    </div>
                  );
                })}
              </div>

              <p className="text-[15px] text-center mt-6 mb-2" style={{ color: "#64748B" }}>
                Organiza o processo e reduz tentativa-erro. Templates reutilizáveis desde o primeiro dia.
              </p>
              <p className="font-heading font-semibold text-center mt-2 mb-6" style={{ color: "#16A34A", fontSize: 16 }}>
                Tudo pronto para aplicar no dia seguinte.
              </p>

              <div className="text-center">
                <CTAButton onClick={openModal} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 7. GALERIA ═══ */}
      <div style={{ background: "#F8FAFC" }}>
        <GallerySection />
        <p className="text-center text-[15px] pb-10 -mt-4" style={{ color: "#64748B" }}>
          Feito com IA e método — sem designer/agência, em minutos.
        </p>
      </div>

      {/* ═══ 8. AUDIÊNCIA ═══ */}
      <section style={{ background: "#FFFFFF" }} className="py-14 md:py-20">
        <div className="mx-auto px-5 sm:px-6" style={{ maxWidth: 800 }}>
          <ScrollReveal>
            <h2 className="font-heading font-bold text-center mb-10 md:mb-14" style={{ fontSize: "clamp(22px, 3vw, 30px)", color: "#0F172A" }}>
              Para quem é este pack
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="pt-4 mb-4" style={{ borderTop: "3px solid #16A34A" }}>
                <p className="font-heading font-semibold text-[13px] uppercase tracking-[0.08em]" style={{ color: "#16A34A" }}>CERTO PARA SI SE:</p>
              </div>
              <div className="space-y-3.5">
                {forWhom.map((item, i) => (
                  <ScrollReveal key={i} delay={i * 0.05}>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#16A34A" }} />
                      <p className="text-[16px]" style={{ color: "#334155" }}>{item}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
            <div>
              <div className="pt-4 mb-4" style={{ borderTop: "3px solid #CBD5E1" }}>
                <p className="font-heading font-semibold text-[13px] uppercase tracking-[0.08em]" style={{ color: "#94A3B8" }}>NÃO É PARA SI SE:</p>
              </div>
              <div className="space-y-3.5">
                {notFor.map((item, i) => (
                  <ScrollReveal key={i} delay={i * 0.05}>
                    <div className="flex items-start gap-2.5">
                      <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#94A3B8" }} />
                      <p className="text-[16px]" style={{ color: "#64748B" }}>
                        {item.main}<br />
                        <span className="text-[14px]">({item.sub})</span>
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 9. FORMADOR ═══ */}
      <div id="formador">
        <PresenterSection />
      </div>

      {/* ═══ 10. TESTEMUNHOS ═══ */}
      <section id="testemunhos" style={{ background: "#FFFFFF" }} className="py-14 md:py-20">
        <div className="mx-auto px-5 sm:px-6" style={{ maxWidth: 960 }}>
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 mb-4" style={{ border: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                <svg viewBox="0 0 24 24" width="22" height="22" className="shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-heading font-bold text-[15px]" style={{ color: "#0F172A" }}>5,0 <span style={{ color: "#FBBC05" }}>★★★★★</span></span>
                <span className="text-[14px]" style={{ color: "#64748B" }}>· Avaliações públicas no Google (DIGITALFC)</span>
              </div>
              <h2 className="font-heading font-bold" style={{ fontSize: "clamp(22px, 3vw, 30px)", color: "#0F172A" }}>
                O que dizem quem já participou
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="rounded-2xl p-6 h-full flex flex-col" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: t.gradient }}>
                      <span className="font-heading font-bold text-xs text-white">{t.initials}</span>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-[15px]" style={{ color: "#0F172A" }}>{t.name}</p>
                      <span style={{ fontSize: 13, color: "#FBBC05" }}>★★★★★</span>
                    </div>
                  </div>
                  <p className="text-[15px] leading-relaxed flex-grow" style={{ color: "#334155" }}>{t.quote}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 11. FAQ ═══ */}
      <section id="faq" style={{ background: "#F8FAFC" }} className="py-14 md:py-20">
        <div className="mx-auto px-5 sm:px-6" style={{ maxWidth: 760 }}>
          <ScrollReveal>
            <h2 className="font-heading font-bold text-center mb-10" style={{ fontSize: "clamp(22px, 3vw, 30px)", color: "#0F172A" }}>
              Perguntas frequentes
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl px-5" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                  <AccordionTrigger className="text-[16px] font-heading font-semibold hover:no-underline text-left py-5" style={{ color: "#0F172A" }}>
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed pb-5" style={{ color: "#334155" }}>
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>

          {/* Suporte */}
          <ScrollReveal delay={0.2}>
            <div className="mt-10 rounded-2xl p-6 text-center" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
              <p className="font-heading font-semibold text-[16px] mb-3" style={{ color: "#0F172A" }}>Precisa de ajuda?</p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-[14px]" style={{ color: "#334155" }}>
                <a href="https://wa.me/351932825157" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline underline-offset-2" style={{ color: "#2563EB" }}>
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a href="mailto:fredericodigital@gmail.com" className="inline-flex items-center gap-1.5 underline underline-offset-2" style={{ color: "#2563EB" }}>
                  <MailIcon className="w-4 h-4" /> fredericodigital@gmail.com
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 12. CTA FINAL ═══ */}
      <section style={{ background: "#0F172A" }} className="py-16 md:py-24">
        <div className="mx-auto px-5 sm:px-6 text-center" style={{ maxWidth: 800 }}>
          <ScrollReveal>
            <h2 className="font-heading font-extrabold text-white mb-4" style={{ fontSize: "clamp(22px, 3.5vw, 32px)", lineHeight: 1.2 }}>
              Acesso imediato ao vídeo + pack completo de apoio.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-[17px] mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
              Método pronto a aplicar no dia seguinte.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <CTAButton onClick={openModal} />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <FooterSection />
      <WhatsAppSupportButton />

      {/* ═══ MODAL DE INSCRIÇÃO ═══ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.75)", backdropFilter: "blur(4px)" }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[460px] rounded-2xl p-8 overflow-y-auto max-h-[90vh]"
              style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 25px 60px rgba(0,0,0,0.20)" }}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ background: "#F1F5F9", color: "#64748B" }}
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-heading font-bold text-xl mb-1" style={{ color: "#0F172A" }}>
                Quero acesso ao vídeo + pack de apoio
              </h3>
              <p className="text-[15px] mb-4" style={{ color: "#64748B" }}>Acesso imediato após pagamento · 27 €</p>

              <div className="space-y-3 mb-4">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
                  <input type="text" placeholder="Primeiro e Último nome" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
                  <input type="tel" placeholder="Whatsapp/Telemóvel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }}
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-[13px] leading-snug" style={{ color: "#64748B" }}>
                  Li e aceito os{" "}
                  <button type="button" onClick={() => setLegalModal("termos")} className="underline" style={{ color: "#2563EB" }}>Termos e Condições</button>{" "}
                  e a{" "}
                  <button type="button" onClick={() => setLegalModal("privacidade")} className="underline" style={{ color: "#2563EB" }}>Política de Privacidade</button>.
                </span>
              </label>

              {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                onClick={handleRegistration}
                className="w-full font-heading font-bold text-base py-4 rounded-xl text-white transition-all disabled:opacity-60"
                style={{ background: "#16A34A", boxShadow: "0 4px 14px 0 rgba(22,163,74,0.35)" }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Continuar para pagamento →"}
              </motion.button>

              <p className="text-center text-[13px] mt-3" style={{ color: "#94A3B8" }}>
                🔒 Pagamento seguro · Acesso imediato
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal modals */}
      <LegalModal open={legalModal === "termos"} onOpenChange={() => setLegalModal(null)} title="Termos e Condições">
        <TermosContent />
      </LegalModal>
      <LegalModal open={legalModal === "privacidade"} onOpenChange={() => setLegalModal(null)} title="Política de Privacidade">
        <PrivacidadeContent />
      </LegalModal>
    </div>
  );
};

export default Gravacao;
