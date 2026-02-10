import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Star, Shield, X, ArrowRight, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

type SelectedOption = null | "skip" | "masterclass" | "workshop" | "bundle";

const PRICE_MAP: Record<Exclude<SelectedOption, null>, { total: number; plan: string }> = {
  skip: { total: 15, plan: "premium" },
  masterclass: { total: 52, plan: "masterclass" },
  workshop: { total: 512, plan: "workshop" },
  bundle: { total: 524, plan: "bundle" },
};

/* ───────── Confirmation Bar ───────── */
const ConfirmationBar = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="sticky top-0 z-50 bg-green-50 border-b-2 border-green-100"
  >
    <div className="container mx-auto max-w-[960px] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>
        <span className="font-semibold text-sm text-green-600">Premium Pass reservado</span>
      </div>
      <span className="text-[13px] text-ink-500">Falta 1 passo para confirmar</span>
    </div>
    <div className="w-full h-[3px] bg-border">
      <div className="h-full w-[60%] bg-green-600" />
    </div>
    <div className="hidden lg:block container mx-auto max-w-[960px] px-4 pb-1">
      <p className="text-[11px] text-ink-400 text-right">Passo 2 de 3 — Personalizar acesso</p>
    </div>
  </motion.div>
);

/* ───────── Hero ───────── */
const HeroShort = ({ userName }: { userName?: string }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15, duration: 0.4 }}
    className="bg-background py-10 md:py-12 px-4 text-center"
  >
    <div className="max-w-[600px] mx-auto">
      <p className="font-heading font-semibold text-[11px] uppercase tracking-[0.08em] text-blue-600 mb-3 flex items-center justify-center gap-2">
        <span className="w-6 h-[2px] bg-blue-600 inline-block" />
        ENQUANTO CONFIRMAS O ACESSO
      </p>
      <h1 className="font-heading font-extrabold text-[24px] sm:text-[32px] text-ink-900 mb-3">
        {userName ? <>Olá, <strong>{userName}</strong>! Queres ir mais fundo?</> : "Queres ir mais fundo?"}
      </h1>
      <p className="text-[16px] text-ink-500 max-w-[480px] mx-auto leading-relaxed">
        Tens 2 opções para complementar o teu Premium Pass.
        Sem obrigação — podes saltar e ir directo ao webinar.
      </p>
      <p className="text-[13px] text-ink-400 mt-2">
        Todos os preços incluem IVA. Podes adicionar agora ou depois do webinar.
      </p>
    </div>
  </motion.section>
);

/* ───────── "Já tens" block ───────── */
const CurrentPlanBlock = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25, duration: 0.4 }}
    className="bg-off-white border border-border rounded-xl p-5 max-w-[560px] mx-auto mb-8 md:mb-10"
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
        <Star className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-[11px] uppercase tracking-[0.08em] text-blue-600 mb-0.5">
          INCLUÍDO NO TEU PEDIDO
        </p>
        <p className="font-heading font-semibold text-[15px] text-ink-900">Premium Pass — Webinar 18 Fev</p>
        <p className="text-[13px] text-ink-500 mt-0.5">Gravação · Q&A em grupo · Guia · Early access</p>
      </div>
      <span className="font-heading font-bold text-[20px] text-ink-900 shrink-0">€15</span>
    </div>
  </motion.div>
);

/* ───────── Skip Card ───────── */
const SkipCard = ({
  selected,
  onSelect,
  onShowReferralInfo,
}: {
  selected: boolean;
  onSelect: () => void;
  onShowReferralInfo: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.55, duration: 0.4 }}
    className={`bg-background rounded-xl p-6 flex flex-col border transition-all ${
      selected ? "border-2 border-blue-600 shadow-blue" : "border-border shadow-card"
    }`}
  >
    {selected && (
      <span className="self-start text-[11px] font-heading font-semibold text-blue-600 uppercase tracking-wider mb-2">✓ SELECCIONADO</span>
    )}
    <p className="font-heading font-semibold text-[11px] uppercase tracking-[0.08em] text-ink-400 mb-1">OPÇÃO A</p>
    <h3 className="font-heading font-semibold text-[18px] text-ink-700 mb-2">Só o webinar</h3>
    <span className="font-heading font-bold text-[28px] text-ink-400">+€0</span>
    <p className="text-[13px] text-ink-400 mb-5">Total: €15</p>

    <div className="w-full h-px bg-border my-4" />

    <ul className="space-y-2.5 mb-6 flex-1">
      {["Webinar ao vivo 18 Fev 10h", "Gravação HD vitalícia", "Sessão Q&A em grupo", "Guia completo de prompts", "Apps early access"].map((f) => (
        <li key={f} className="flex items-start gap-2 text-[14px] text-ink-500">
          <span className="mt-1 shrink-0">→</span> {f}
        </li>
      ))}
    </ul>

    {/* Referral block */}
    <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3">
      <div className="flex items-start gap-2">
        <Gift className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-[13px] text-green-700 font-medium">Ou convida 2 amigos e ganha o Premium grátis</p>
          <button
            onClick={onShowReferralInfo}
            className="text-[12px] text-blue-600 hover:underline mt-1 bg-transparent border-none cursor-pointer p-0"
          >
            Ver como funciona →
          </button>
        </div>
      </div>
    </div>

    <button
      onClick={onSelect}
      className="w-full border border-border bg-background text-ink-700 font-heading font-semibold text-[14px] py-3 rounded-lg hover:bg-off-white transition-colors"
    >
      Confirmar só Premium
    </button>
    <p className="text-center text-[12px] text-ink-400 mt-2">Podes sempre adicionar depois</p>
  </motion.div>
);

/* ───────── Masterclass Card ───────── */
const MasterclassCard = ({
  selected,
  onSelect,
}: {
  selected: boolean;
  onSelect: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35, duration: 0.4 }}
    className={`bg-background rounded-[14px] p-7 flex flex-col relative lg:scale-[1.02] transition-all ${
      selected ? "border-2 border-blue-600 shadow-blue" : "border-2 border-blue-600 shadow-blue"
    }`}
  >
    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-heading font-bold uppercase tracking-[0.08em] px-4 py-1.5 rounded-full">
      MAIS POPULAR
    </span>
    {selected && (
      <span className="self-start text-[11px] font-heading font-semibold text-blue-600 uppercase tracking-wider mb-1 mt-1">✓ SELECCIONADO</span>
    )}
    <p className="font-heading font-semibold text-[11px] uppercase tracking-[0.08em] text-blue-600 mb-1 mt-2">OPÇÃO B</p>
    <h3 className="font-heading font-bold text-[18px] text-ink-900 mb-3">Masterclass Online</h3>

    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3.5 mb-4">
      <span className="font-heading font-extrabold text-[32px] text-blue-600">+€37</span>
      <p className="text-[14px] text-ink-700 font-medium">Total com Premium: €52</p>
      <p className="text-[12px] text-ink-400 mt-0.5">
        Normal depois do webinar: <span className="line-through">€64</span>
      </p>
    </div>

    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-500 mb-3">
      <span>📅 Data a anunciar</span>
      <span>💻 Online</span>
      <span>⏱ 3 horas</span>
      <span>👥 Máx. 30</span>
    </div>

    <div className="w-full h-px bg-border my-3" />

    <ul className="space-y-2.5 mb-6 flex-1">
      {[
        "Implementação dos 3 sistemas em profundidade",
        "50 prompts testados por tipo de imagem",
        "Casos uso com empresas portuguesas reais",
        "App avançada Gerador de Prompts",
        "Gravação vitalícia",
        "Certificado de participação",
      ].map((f) => (
        <li key={f} className="flex items-start gap-2 text-[14px] text-ink-900">
          <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <span className="font-medium">{f}</span>
        </li>
      ))}
    </ul>

    <button
      onClick={onSelect}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[15px] py-4 rounded-xl shadow-blue transition-colors"
    >
      Adicionar Masterclass — Total €52
    </button>
  </motion.div>
);

/* ───────── Workshop Card ───────── */
const WorkshopCard = ({
  selected,
  onSelect,
  onBundleClick,
}: {
  selected: boolean;
  onSelect: () => void;
  onBundleClick: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.45, duration: 0.4 }}
    className={`bg-background rounded-xl p-6 flex flex-col relative border-t-4 border-t-amber-500 transition-all ${
      selected ? "border-2 border-blue-600 shadow-blue" : "border border-border shadow-card"
    }`}
  >
    <span className="absolute -top-3.5 right-4 bg-amber-50 border border-amber-500/40 text-amber-600 text-[11px] font-heading font-semibold uppercase tracking-[0.08em] px-3 py-1 rounded-full">
      PRESENCIAL
    </span>
    {selected && (
      <span className="self-start text-[11px] font-heading font-semibold text-blue-600 uppercase tracking-wider mb-1 mt-1">✓ SELECCIONADO</span>
    )}
    <p className="font-heading font-semibold text-[11px] uppercase tracking-[0.08em] text-amber-600 mb-1 mt-2">OPÇÃO C</p>
    <h3 className="font-heading font-semibold text-[18px] text-ink-900 mb-3">Workshop 1 Dia</h3>

    <div className="bg-amber-50 border border-amber-500/20 rounded-lg p-3.5 mb-4">
      <span className="font-heading font-extrabold text-[32px] text-ink-900">+€497</span>
      <p className="text-[14px] text-ink-700 font-medium">Total com Premium: €512</p>
      <p className="text-[12px] text-amber-600 mt-0.5">
        Founder pricing — sobe para €697 na 2ª edição
      </p>
    </div>

    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-500 mb-3">
      <span>📅 Sábado · Abril 2025</span>
      <span>🏢 Presencial Lisboa</span>
      <span>⏱ 9h-18h</span>
      <span>👥 Máx. 15</span>
    </div>

    <div className="w-full h-px bg-border my-3" />

    <ul className="space-y-2.5 mb-4 flex-1">
      {[
        "8 horas de implementação hands-on",
        "Trabalho real com a tua empresa",
        "n8n workflows do zero (sem código)",
        "Sistema completo configurado no dia",
        "Certificado Professor FEUC",
        "Acesso plataforma 12 meses",
      ].map((f) => (
        <li key={f} className="flex items-start gap-2 text-[14px] text-ink-700">
          <Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <span>{f}</span>
        </li>
      ))}
    </ul>

    <div className="bg-amber-50 rounded-md p-3 mb-4">
      <p className="text-[13px] text-amber-600 font-medium">
        🤝 Só 15 vagas. 4 já com pré-reserva nesta sessão.
      </p>
    </div>

    <button
      onClick={onSelect}
      className="w-full bg-ink-900 hover:bg-ink-700 text-white font-heading font-bold text-[15px] py-4 rounded-xl transition-colors"
    >
      Reservar Workshop — Total €512
    </button>

    <button
      onClick={onBundleClick}
      className="text-center text-[13px] text-blue-600 font-medium mt-3 hover:underline cursor-pointer bg-transparent border-none"
    >
      Quer os dois? Masterclass + Workshop por €524 (poupa €25) →
    </button>
  </motion.div>
);

/* ───────── Bundle Modal ───────── */
const BundleModal = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/70 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background max-w-[420px] w-full rounded-xl p-7 shadow-card-lg relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-ink-400 hover:text-ink-700">
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-heading font-bold text-[20px] text-ink-900 mb-4">Masterclass + Workshop</h3>

          <div className="bg-off-white rounded-lg p-4 mb-4 space-y-2 text-[14px]">
            <div className="flex justify-between"><span className="text-ink-700">Premium Pass</span><span className="text-ink-900 font-medium">€15</span></div>
            <div className="flex justify-between"><span className="text-ink-700">Masterclass Online</span><span className="text-ink-900 font-medium">€37</span></div>
            <div className="flex justify-between"><span className="text-ink-700">Workshop Presencial</span><span className="text-ink-900 font-medium">€497</span></div>
            <div className="w-full h-px bg-border" />
            <div className="flex justify-between text-ink-400"><span>Subtotal</span><span>€549</span></div>
            <div className="flex justify-between text-green-600 font-medium"><span>✓ Desconto bundle</span><span>−€25</span></div>
            <div className="w-full h-px bg-border" />
            <div className="flex justify-between font-heading font-bold text-[18px] text-ink-900"><span>TOTAL</span><span>€524</span></div>
          </div>

          <ul className="space-y-1.5 text-[13px] text-ink-500 mb-5">
            <li>• Webinar ao vivo 18 Fev + Premium Pass completo</li>
            <li>• Masterclass 3h online (data a anunciar)</li>
            <li>• Workshop 8h presencial Lisboa (Abril)</li>
          </ul>

          <button
            onClick={onConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[16px] py-4 rounded-xl shadow-blue transition-colors"
          >
            Confirmar bundle — €524
          </button>
          <button onClick={onClose} className="w-full text-center text-[13px] text-ink-400 mt-3 hover:text-ink-700 bg-transparent border-none cursor-pointer">
            Voltar e escolher separado
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ───────── Desktop Sticky Summary ───────── */
const DesktopSummary = ({
  selectedOption,
  loading,
  onConfirm,
}: {
  selectedOption: SelectedOption;
  loading: boolean;
  onConfirm: () => void;
}) => {
  if (!selectedOption) return null;
  const { total, plan } = PRICE_MAP[selectedOption];
  const isSkip = plan === "premium";

  const labels: Record<string, string> = {
    skip: "Premium Pass",
    masterclass: "Premium Pass + Masterclass",
    workshop: "Premium Pass + Workshop",
    bundle: "Premium Pass + Masterclass + Workshop",
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="hidden lg:flex sticky bottom-0 z-40 bg-background border-t-2 border-border px-6 py-4 items-center justify-between"
    >
      <div>
        <p className="text-[14px] text-ink-700 font-medium">O teu pedido:</p>
        <p className="text-[14px] text-ink-500">{labels[selectedOption]}</p>
      </div>
      <div className="text-center">
        <span className="font-heading font-extrabold text-[24px] text-ink-900">€{total}</span>
        <p className="text-[11px] text-ink-400">(preço sobe após 18 Fev)</p>
      </div>
      <button
        disabled={loading}
        onClick={onConfirm}
        className={`font-heading font-bold text-[14px] px-6 py-3 rounded-xl text-white transition-colors flex items-center gap-2 disabled:opacity-70 ${
          isSkip ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Confirmar e pagar <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

/* ───────── Mobile Fixed CTA ───────── */
const MobileCTA = ({
  selectedOption,
  loading,
  onConfirm,
}: {
  selectedOption: SelectedOption;
  loading: boolean;
  onConfirm: () => void;
}) => {
  if (!selectedOption) return null;
  const { total } = PRICE_MAP[selectedOption];

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <button
        disabled={loading}
        onClick={onConfirm}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[15px] py-4 rounded-xl shadow-blue transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        Confirmar — €{total} <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

/* ───────── Referral Info Modal ───────── */
const ReferralInfoModal = ({
  open,
  onClose,
  onSignupFree,
}: {
  open: boolean;
  onClose: () => void;
  onSignupFree: () => void;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/70 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background max-w-[400px] w-full rounded-2xl p-7 shadow-card-lg relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-ink-400 hover:text-ink-700">
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-3">
            <span className="text-[40px]">🎁</span>
          </div>

          <h3 className="font-heading font-bold text-[20px] text-ink-900 text-center mb-2">
            Ganha o Premium Pass grátis
          </h3>
          <p className="text-[15px] text-ink-500 text-center mt-2">
            Partilha o teu link com 2 amigos. Quando ambos se inscrevem, recebes o Premium Pass no valor de €15 — sem pagar nada.
          </p>

          <ol className="mt-4 space-y-2.5 text-[14px] text-ink-700">
            <li className="flex items-start gap-2"><span className="font-heading font-bold text-blue-600">1.</span> Inscreve-te grátis no webinar</li>
            <li className="flex items-start gap-2"><span className="font-heading font-bold text-blue-600">2.</span> Copia o teu link de convite pessoal</li>
            <li className="flex items-start gap-2"><span className="font-heading font-bold text-blue-600">3.</span> Envia para 2 amigos</li>
            <li className="flex items-start gap-2"><span className="font-heading font-bold text-blue-600">4.</span> Ambos inscrevem-se → recebes o Premium</li>
          </ol>

          <p className="text-[13px] text-ink-400 text-center mt-3">
            Os teus amigos têm de se inscrever antes do webinar começar.
          </p>

          <button
            onClick={onSignupFree}
            className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-[15px] py-4 rounded-xl transition-colors"
          >
            Inscrever-me grátis e partilhar link
          </button>
          <button
            onClick={onClose}
            className="w-full text-center text-[13px] text-ink-400 mt-3 hover:text-ink-700 bg-transparent border-none cursor-pointer"
          >
            Prefiro pagar €15 directamente
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ───────── Footer ───────── */
const MicroFooter = () => (
  <footer className="bg-off-white border-t border-border py-5 px-4 text-center">
    <div className="flex flex-wrap items-center justify-center gap-5 text-[13px] text-ink-400 mb-2">
      <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Pagamento seguro EuPago</span>
      <span>📋 RGPD protegido</span>
      <span>↩ Reembolso 14 dias sem perguntas</span>
    </div>
    <p className="text-[12px] text-ink-400">Questões? frederico@digitalfc.pt</p>
  </footer>
);

/* ═════════ Main Page ═════════ */
const Upsell = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userName = searchParams.get("name") || "";
  const userEmail = searchParams.get("email") || "";
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);
  const [isBundleOpen, setIsBundleOpen] = useState(false);
  const [isReferralInfoOpen, setIsReferralInfoOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleConfirm = async () => {
    if (!selectedOption) return;
    setLoading(true);
    setError(null);

    const { plan } = PRICE_MAP[selectedOption];

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
        body: { plan, email: userEmail, nome: userName },
      });
      if (fnError) throw fnError;
      if (data?.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error("Link de pagamento não recebido");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Erro ao processar pagamento. Tenta novamente.");
      setLoading(false);
    }
  };

  const selectBundle = () => {
    setSelectedOption("bundle");
    setIsBundleOpen(false);
  };

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <ConfirmationBar />
      <HeroShort userName={userName || undefined} />

      <div className="px-4 flex-1">
        <CurrentPlanBlock />

        {/* Section title */}
        <div className="text-center mb-6 md:mb-8 max-w-[960px] mx-auto">
          <h2 className="font-heading font-bold text-[20px] sm:text-[26px] text-ink-900 mb-2">
            Escolhe o que se adequa a ti:
          </h2>
          <p className="text-[15px] text-ink-500">
            Podes adicionar uma opção, as duas, ou saltar — a decisão é tua.
          </p>
        </div>

        {/* Cards grid */}
        <div className="max-w-[960px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 mb-10 lg:mb-16">
          {/* Mobile order: Masterclass, Workshop, Skip | Desktop order: Skip, Masterclass, Workshop */}
          <div className={isMobile ? "order-2 lg:order-1" : ""}>
            <SkipCard selected={selectedOption === "skip"} onSelect={() => setSelectedOption("skip")} onShowReferralInfo={() => setIsReferralInfoOpen(true)} />
          </div>
          <div className={isMobile ? "order-1 lg:order-2" : ""}>
            <MasterclassCard selected={selectedOption === "masterclass"} onSelect={() => setSelectedOption("masterclass")} />
          </div>
          <div className={isMobile ? "order-3" : ""}>
            <WorkshopCard
              selected={selectedOption === "workshop"}
              onSelect={() => setSelectedOption("workshop")}
              onBundleClick={() => setIsBundleOpen(true)}
            />
          </div>
        </div>

        {error && <p className="text-center text-sm text-red-500 mb-4">{error}</p>}
      </div>

      <DesktopSummary selectedOption={selectedOption} loading={loading} onConfirm={handleConfirm} />
      <MobileCTA selectedOption={selectedOption} loading={loading} onConfirm={handleConfirm} />
      <MicroFooter />
      <BundleModal open={isBundleOpen} onClose={() => setIsBundleOpen(false)} onConfirm={selectBundle} />
      <ReferralInfoModal open={isReferralInfoOpen} onClose={() => setIsReferralInfoOpen(false)} onSignupFree={() => { setIsReferralInfoOpen(false); navigate("/?referral=true"); }} />

      {/* Spacer for mobile fixed CTA */}
      {selectedOption && <div className="lg:hidden h-20" />}
    </div>
  );
};

export default Upsell;
