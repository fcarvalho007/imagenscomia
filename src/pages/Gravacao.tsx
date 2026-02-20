import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Zap, FileText, CreditCard, Check, X, User, Mail, Phone, Loader2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import ColorBends from "@/components/landing/ColorBends";
import ElectricBorder from "@/components/landing/ElectricBorder";
import { GallerySection } from "@/components/landing/GallerySection";
import { PresenterSection } from "@/components/landing/PresenterSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { LegalModal } from "@/components/legal/LegalModal";
import { TermosContent } from "@/components/legal/TermosContent";
import { PrivacidadeContent } from "@/components/legal/PrivacidadeContent";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import particlesBg from "@/assets/particles-bg.jpg";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

/* ── Data ── */

const quickFacts = [
  { icon: Film, label: "FORMATO", value: "Gravação HD" },
  { icon: Zap, label: "ACESSO", value: "Imediato" },
  { icon: FileText, label: "DOCUMENTOS", value: "Incluídos" },
  { icon: CreditCard, label: "INVESTIMENTO", value: "27 € (único)" },
];

const packItems = [
  "Gravação completa (HD)",
  "Resumo PDF da sessão",
  "Guia de Apoio (32 páginas) sobre Imagens com IA e Nano Banana Pro",
  "Documento com biblioteca de prompts base (editáveis)",
];

const challenges = [
  { num: "01", title: "Imagens com ar de stock que qualquer empresa poderia usar" },
  { num: "02", title: "Sem consistência visual entre publicações" },
  { num: "03", title: "Dúvida sobre que ferramenta usar para cada situação" },
  { num: "04", title: "Precisa de volume sem aumentar equipa" },
  { num: "05", title: "Precisa de algo rápido e não quer esperar" },
  { num: "06", title: "Quer autonomia para criar quando precisa" },
];

const methods = [
  {
    num: "01",
    title: "Estado da Arte",
    borderColor: "border-l-blue-600",
    desc: "Modelos e versões disponíveis. Ferramentas gratuitas e pagas — o que escolher e quando.",
    deliverable: "Mapa claro do ecossistema actual de IA para imagens.",
  },
  {
    num: "02",
    title: "Instruções Profissionais",
    borderColor: "border-l-[#0891B2]",
    desc: "Passo a passo do briefing à produção. Adaptação de formatos e edição do resultado.",
    deliverable: "Método replicável para qualquer brief.",
  },
  {
    num: "03",
    title: "Do Objetivo ao Criativo",
    borderColor: "border-l-green-600",
    desc: "Fluxo de trabalho completo. Peças prontas a publicar — com consistência visual.",
    deliverable: "Processo para produzir criativos com qualidade e velocidade.",
  },
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
  { main: "Designer profissional à procura de IA técnica avançada", sub: "esta gravação é prática, não técnica." },
];

const faqs = [
  { q: "Como recebo o acesso?", a: "Recebes um email com o link de acesso imediato à gravação e aos documentos de apoio, logo após a confirmação do pagamento." },
  { q: "Quanto tempo fica disponível?", a: "O acesso à gravação e aos documentos é permanente — podes rever quantas vezes quiseres, ao teu ritmo." },
  { q: "Inclui documentos de apoio?", a: "Sim. Inclui resumo PDF da sessão, Guia de Apoio (32 páginas) e biblioteca de prompts base editáveis." },
  { q: "Funciona com ferramentas gratuitas?", a: "Sim. O método é demonstrado com ferramentas gratuitas e pagas, e aplica-se a qualquer uma delas." },
  { q: "Preciso de conhecimentos técnicos?", a: "Não. A gravação foi pensada para profissionais de marketing e empresários — não é necessário saber programar ou ter experiência com IA." },
  { q: "Emite fatura/recibo?", a: "Sim. A fatura é emitida automaticamente após confirmação do pagamento." },
  { q: "E se tiver dificuldades?", a: "Podes contactar-nos a qualquer momento por email ou pelo WhatsApp disponível nesta página." },
];

/* ── Page ── */

const Gravacao = () => {
  usePageMeta({
    title: "Gravação: Aprende a Criar Imagens Profissionais com Inteligência Artificial",
    description: "Acesso imediato à gravação do webinar + documentos de apoio. Método testado para criar imagens profissionais com IA. 27 €, pagamento único.",
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
      const { data, error: fnError } = await supabase.functions.invoke("register-free", {
        body: { firstName, lastName, email: normalizedEmail, whatsapp: normalizedPhone || undefined, registrationSource: "gravacao" },
      });
      if (fnError) throw fnError;
      setModalOpen(false);
      navigate(`/upgrade-gravacao?name=${encodeURIComponent(fullName.trim())}&email=${encodeURIComponent(normalizedEmail)}${data?.referralCode ? `&ref_code=${data.referralCode}` : ""}`);
      setTimeout(() => { try { const fbqSafe = (window as any)?.fbq; if (typeof fbqSafe === "function") fbqSafe("track", "Lead"); } catch {} }, 0);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setError("Não foi possível concluir. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToPack = () => {
    document.getElementById("pack-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ HERO ═══ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #06091A 0%, #0B1230 50%, #080E22 100%)" }}
      >
        <div className="absolute inset-0 z-0" style={{ opacity: 0.85 }}>
          <ColorBends
            colors={["#1E40AF", "#7C3AED", "#0EA5E9", "#10B981"]}
            rotation={0} speed={0.25} scale={1.2} frequency={0.8}
            warpStrength={1.2} mouseInfluence={0.3} parallax={0.3}
            noise={0.05} transparent autoRotate={2}
          />
        </div>

        <div className="relative z-10 mx-auto pt-14 pb-14 md:pt-[72px] md:pb-[72px] px-6 md:px-10" style={{ maxWidth: 860, textAlign: "center" }}>
          {/* Badge */}
          <motion.div {...fade(0.05)}>
            <span
              className="inline-block backdrop-blur-sm font-heading uppercase tracking-[0.12em] px-5 py-2 rounded-full mb-4"
              style={{
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.30)",
                color: "#6EE7B7",
                fontSize: 14, fontWeight: 600,
                boxShadow: "0 0 12px rgba(16,185,129,0.35), 0 0 32px rgba(16,185,129,0.15)",
              }}
            >
              ACESSO IMEDIATO
            </span>
          </motion.div>

          {/* H1 */}
          <motion.div {...fade(0.1)}>
            <h1
              className="font-heading"
              style={{
                color: "#F8FAFC", fontWeight: 800,
                fontSize: "clamp(26px, 4.5vw, 40px)", lineHeight: 1.12,
                letterSpacing: "-0.025em",
                textShadow: "0 2px 40px rgba(0,0,0,0.5)",
              }}
            >
              Gravação: Aprende a Criar Imagens Profissionais<br />com Inteligência Artificial
            </h1>
          </motion.div>

          {/* Sub */}
          <motion.div {...fade(0.15)}>
            <p style={{ fontSize: 18, marginTop: 16, marginBottom: 6, color: "#CBD5E1" }}>
              Do briefing à imagem pronta a publicar — com método, exemplos e passos replicáveis.
            </p>
            <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 24 }}>
              Inclui documentos de apoio para aplicar no dia seguinte.
            </p>
          </motion.div>

          {/* Quick facts */}
          <motion.div {...fade(0.25)}>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {quickFacts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-xl px-3 py-3 flex flex-col items-center gap-1"
                    style={{
                      background: "rgba(6,9,26,0.75)", backdropFilter: "blur(8px)",
                      border: "1px solid rgba(37,99,235,0.20)", minWidth: 130,
                    }}
                  >
                    <Icon className="w-5 h-5 shrink-0" style={{ color: "#60A5FA" }} />
                    <span className="block uppercase tracking-wide" style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>{item.label}</span>
                    <span className="block" style={{ fontSize: 14, fontWeight: 600, color: "#F8FAFC" }}>{item.value}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div {...fade(0.3)}>
            <ElectricBorder color="#22C55E" speed={0.8} chaos={0.08} borderRadius={10} style={{ display: "inline-block", width: "100%", maxWidth: 400 }}>
              <button
                onClick={openModal}
                style={{
                  background: "#16A34A", color: "#fff", fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700, fontSize: 16, padding: "16px 32px",
                  borderRadius: 10, border: "none", cursor: "pointer", width: "100%",
                }}
              >
                Quero acesso imediato (27 €)
              </button>
            </ElectricBorder>

            <button onClick={scrollToPack} className="block mx-auto mt-3 text-[15px] text-white/50 hover:text-white/70 transition-colors underline underline-offset-2">
              Ver o que está incluído
            </button>
          </motion.div>

          {/* Google Reviews */}
          <motion.div {...fade(0.35)}>
            <div className="mt-5">
              <div
                className="inline-flex items-center gap-[10px] rounded-[10px] px-[14px] py-[8px]"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div className="w-px h-[18px] mx-[2px]" style={{ background: "rgba(255,255,255,0.10)" }} />
                <div className="flex flex-col gap-px">
                  <div className="flex items-center gap-1">
                    <span className="font-heading font-bold" style={{ fontSize: 14, color: "#F8FAFC" }}>5,0</span>
                    <span style={{ fontSize: 13, lineHeight: 1, color: "#FBBC05" }}>★★★★★</span>
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.50)" }}>1 194 avaliações no Google</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-white/35">Pagamento seguro. Acesso imediato após confirmação.</p>
          </motion.div>
        </div>
      </section>

      {/* ═══ PACK ═══ */}
      <section id="pack-section" className="py-16 md:py-24 bg-off-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-[700px]">
          <ScrollReveal>
            <h2 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.01em] text-center text-ink-900 mb-10">
              O que recebes (Pack 27 €)
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-background border border-border rounded-2xl p-8 shadow-card">
              <div className="space-y-3.5">
                {packItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <p className="text-[17px] text-ink-700">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <motion.button
                  onClick={openModal}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-base px-10 py-4 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all"
                >
                  Comprar acesso imediato (27 €)
                </motion.button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ BLOQUEIOS ═══ */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 max-w-[960px]">
          <ScrollReveal>
            <h2 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.01em] text-center text-ink-900 mb-12">
              Isto resolve estes 6 bloqueios
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {challenges.map((c, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="bg-background border border-border rounded-lg p-6 h-full shadow-card">
                  <span className="font-heading font-bold text-[14px] text-[hsl(262,83%,58%)]/40 tracking-[0.1em]">{c.num}</span>
                  <h3 className="font-heading font-semibold text-[17px] text-ink-900 mt-2">{c.title}</h3>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4}>
            <p className="text-center text-[17px] text-ink-500 mt-8">
              Se te identificares com 2 ou mais pontos, esta gravação encurta meses de tentativa e erro.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ MÉTODO ═══ */}
      <section className="py-16 md:py-24 bg-off-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-[960px]">
          <ScrollReveal>
            <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.08em] text-blue-600 text-center mb-2">
              MÉTODO
            </p>
            <h2 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.01em] text-center text-ink-900 mb-2">
              O que se aprende na gravação
            </h2>
            <p className="text-[17px] text-ink-500 text-center mb-12 max-w-lg mx-auto">
              3 blocos práticos. Demos reais. Resultados no dia seguinte.
            </p>
          </ScrollReveal>

          <div className="space-y-6">
            {methods.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className={`bg-background border border-border ${s.borderColor} border-l-4 rounded-r-lg p-7 shadow-card`}>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <span className="font-heading font-extrabold text-[42px] text-[hsl(262,83%,58%)]/15 leading-none md:min-w-[60px] md:text-right">{s.num}</span>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-lg text-ink-900 mb-2">{s.title}</h3>
                      <p className="text-[17px] text-ink-500 leading-relaxed mb-3">{s.desc}</p>
                      <p className="text-[14px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-1.5 inline-block">
                        {s.deliverable}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="text-center mt-10">
              <motion.button
                onClick={openModal}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-base px-10 py-4 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all"
              >
                Quero acesso imediato (27 €)
              </motion.button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ GALERIA ═══ */}
      <GallerySection />

      {/* ═══ AUDIÊNCIA ═══ */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 max-w-[800px]">
          <ScrollReveal>
            <h2 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.01em] text-center text-ink-900 mb-10 md:mb-14">
              Para quem é esta gravação
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="border-t-[3px] border-t-green-600 pt-4 mb-4">
                <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.08em] text-green-600">CERTO PARA SI SE:</p>
              </div>
              <div className="space-y-3.5">
                {forWhom.map((item, i) => (
                  <ScrollReveal key={i} delay={i * 0.06}>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0 font-bold" />
                      <p className="text-[17px] text-ink-700">{item}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
            <div>
              <div className="border-t-[3px] border-t-border-strong pt-4 mb-4">
                <p className="font-heading font-semibold text-[14px] uppercase tracking-[0.08em] text-ink-400">NÃO É PARA SI SE:</p>
              </div>
              <div className="space-y-3.5">
                {notFor.map((item, i) => (
                  <ScrollReveal key={i} delay={i * 0.06}>
                    <div className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-ink-400 mt-0.5 shrink-0" />
                      <p className="text-[17px] text-ink-500">
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

      {/* ═══ PRESENTER ═══ */}
      <PresenterSection />

      {/* ═══ TESTEMUNHOS GOOGLE ═══ */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 max-w-[960px]">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 mb-4 border border-border bg-off-white shadow-card">
                <svg viewBox="0 0 24 24" width="22" height="22" className="shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-heading font-bold text-[15px] text-ink-900">5,0 <span style={{ color: "#FBBC05" }}>★★★★★</span></span>
                <span className="text-[14px] text-ink-500">· Avaliações públicas no Google</span>
              </div>
              <h2 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.01em] text-ink-900">
                O que dizem quem já participou
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Dario Ramos", initials: "DR", gradient: "linear-gradient(135deg, hsl(217,91%,60%), hsl(262,83%,58%))", quote: "Profissional Top, sempre disponível para ajudar." },
              { name: "Marcelo Caruana", initials: "MC", gradient: "linear-gradient(135deg, hsl(142,76%,36%), hsl(142,72%,29%))", quote: "Conteúdos sempre muito detalhados e claros :)" },
              { name: "Isabel Martins", initials: "IM", gradient: "linear-gradient(135deg, hsl(262,83%,58%), hsl(262,83%,68%))", quote: "As formações do Frederico são sempre excepcionais. Partilha de conhecimento e ensinamento prático." },
              { name: "Silvana Curado", initials: "SC", gradient: "linear-gradient(135deg, hsl(187,100%,50%), hsl(217,91%,60%))", quote: "Muito bom. A sessão introdutória sobre geração de imagem a que assisti teve uma velocidade ótima, para o meu nível de conhecimento médio-baixo e cumpriu escrupulosamente a proposta de valor. Boa energia!" },
              { name: "Paulo Ferrão", initials: "PF", gradient: "linear-gradient(135deg, hsl(38,92%,50%), hsl(32,95%,44%))", quote: "Webinar esclarecedor. Interessante e recheado como sempre! Obrigado" },
              { name: "Joana Veigas", initials: "JV", gradient: "linear-gradient(135deg, hsl(142,76%,36%), hsl(187,100%,50%))", quote: "Gostei muito do Webinar IA Imagens. Interessante, bem explicada e cativante. Curiosa para saber cada vez mais. Vou continuar a acompanhar as muitas dicas que o Frederico vai partilhando. Obrigada Frederico!" },
              { name: "Cátia Martins", initials: "CM", gradient: "linear-gradient(135deg, hsl(0,84%,60%), hsl(38,92%,50%))", quote: "Foi um webinar excelente. Para o tema que é parece sempre curto mas agrega sempre muito valor. E é muito útil para o trabalho do dia a dia, para quem trabalha com criativos. O Frederico nunca desilude." },
            ].map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="bg-background border border-border rounded-2xl p-6 h-full flex flex-col shadow-card hover:shadow-card-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: t.gradient }}
                    >
                      <span className="font-heading font-bold text-xs text-white">{t.initials}</span>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-[15px] text-ink-900">{t.name}</p>
                      <span style={{ fontSize: 13, color: "#FBBC05" }}>★★★★★</span>
                    </div>
                  </div>
                  <p className="text-[16px] leading-relaxed text-ink-500 flex-grow">{t.quote}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-16 md:py-24 bg-off-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-[760px]">
          <ScrollReveal>
            <h2 className="font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.01em] text-center text-ink-900 mb-10">
              Perguntas frequentes
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5 shadow-card">
                  <AccordionTrigger className="text-[17px] font-heading font-semibold text-ink-900 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[16px] text-ink-500 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section
        className="py-20 md:py-28 relative bg-ink-900"
        style={{ backgroundImage: `url(${particlesBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-ink-900/85" />
        <div className="container mx-auto px-4 sm:px-6 max-w-[800px] text-center relative z-10">
          <ScrollReveal>
            <h2 className="font-heading font-extrabold text-[24px] sm:text-[30px] md:text-[34px] leading-[1.2] text-white mb-4">
              Acesso imediato à gravação + pack de apoio.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-[18px] text-white/65 mb-8">
              Método pronto a aplicar no dia seguinte.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <motion.button
              onClick={openModal}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-lg px-8 py-4 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all"
            >
              Garantir acesso (27 €)
            </motion.button>
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
            <div className="absolute inset-0 bg-ink-900/75 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[460px] bg-background rounded-2xl p-8 overflow-y-auto max-h-[90vh] shadow-card-lg"
              style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 60px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-heading font-bold text-xl text-ink-900 mb-1">
                Quero acesso à gravação + pack de apoio
              </h3>
              <p className="text-[15px] text-ink-500 mb-3">Acesso imediato após pagamento · 27 €</p>

              <div className="space-y-3 mb-4">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input type="text" placeholder="Primeiro e Último nome" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input type="tel" placeholder="Whatsapp/Telemóvel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm" />
                </div>
              </div>

              <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-600/20 shrink-0" />
                <span className="text-[14px] text-ink-400 leading-relaxed">
                  Autorizo o envio de comunicações relacionadas com este evento e conteúdos de marketing do Frederico Carvalho. Os dados pessoais serão tratados pela sua empresa Fomentar Sonhos.{" "}
                  <button type="button" onClick={() => setLegalModal("privacidade")} className="underline hover:text-ink-600">Política de Privacidade</button> e{" "}
                  <button type="button" onClick={() => setLegalModal("termos")} className="underline hover:text-ink-600">Termos e Condições</button>.
                </span>
              </label>

              {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                disabled={loading || !acceptedTerms}
                onClick={handleRegistration}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-base py-4 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {loading ? "A registar..." : "Quero acesso imediato (27 €)"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LegalModal open={legalModal === "privacidade"} onOpenChange={(v) => !v && setLegalModal(null)} title="Política de Privacidade">
        <PrivacidadeContent />
      </LegalModal>
      <LegalModal open={legalModal === "termos"} onOpenChange={(v) => !v && setLegalModal(null)} title="Termos e Condições">
        <TermosContent />
      </LegalModal>
    </div>
  );
};

export default Gravacao;
