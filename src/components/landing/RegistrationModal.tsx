import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";
import { X, Loader2, Shield, MinusCircle, Sparkles, Gift, Copy, MessageCircle, Send, ExternalLink, User, Mail, Check, CalendarPlus, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Step = "capture" | "upsell" | "confirmation";
type ConfirmationMode = "referral" | "simple";

export const RegistrationModal = () => {
  const navigate = useNavigate();
  const { isOpen, close, referredBy } = useRegistrationModal();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("capture");
  const [confirmationMode, setConfirmationMode] = useState<ConfirmationMode>("simple");
  const [referralData, setReferralData] = useState<{ referralCode: string; referralLink: string } | null>(null);

  const registerFree = async (): Promise<{ referralCode: string; referralLink: string } | null> => {
    const { data, error: fnError } = await supabase.functions.invoke("register-free", {
      body: { name, email, referredBy: referredBy || undefined },
    });
    if (fnError) throw fnError;
    return { referralCode: data.referralCode, referralLink: data.referralLink };
  };

  const handleCapture = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Preenche o nome e email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await registerFree();
      setReferralData(data);
      setStep("upsell");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Erro ao processar. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPremium = () => {
    close();
    navigate(`/upgrade?name=${encodeURIComponent(name.trim())}&email=${encodeURIComponent(email.trim())}`);
  };

  const handleReferralPath = () => {
    setConfirmationMode("referral");
    setStep("confirmation");
  };

  const handleContinueFree = () => {
    setConfirmationMode("simple");
    setStep("confirmation");
  };

  const handleClose = () => {
    close();
    setTimeout(() => {
      setStep("capture");
      setConfirmationMode("simple");
      setName("");
      setEmail("");
      setError(null);
      setReferralData(null);
    }, 300);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -8 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-ink-900/75 backdrop-blur-sm" />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[460px] bg-background rounded-2xl p-8 overflow-y-auto max-h-[90vh] shadow-card-lg"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {step === "capture" && (
              <CaptureView
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                loading={loading}
                error={error}
                onSubmit={handleCapture}
              />
            )}

            {step === "upsell" && (
              <UpsellView
                name={name}
                onGoToPremium={handleGoToPremium}
                onReferralPath={handleReferralPath}
                onContinueFree={handleContinueFree}
              />
            )}

            {step === "confirmation" && (
              <ConfirmationView
                email={email}
                name={name}
                referralData={referralData}
                mode={confirmationMode}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Step 1: Capture ── */

const CaptureView = ({
  name,
  setName,
  email,
  setEmail,
  loading,
  error,
  onSubmit,
}: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
}) => (
  <>
    <h3 className="font-heading font-bold text-xl text-ink-900 mb-2">
      Reserva o teu lugar
    </h3>
    <p className="text-[15px] text-ink-500 mb-5">
      Preenche os teus dados para reservar o lugar:
    </p>

    <div className="space-y-3 mb-5">
      <div className="relative">
        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          placeholder="O teu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm"
        />
      </div>
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="email"
          placeholder="O teu melhor email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm"
        />
      </div>
    </div>

    {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}

    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      onClick={onSubmit}
      className="w-full bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-base py-4 rounded-xl shadow-neon-purple transition-all flex items-center justify-center gap-2 disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Check className="w-5 h-5" />
      )}
      {loading ? "A registar..." : "Reservar o meu lugar"}
    </motion.button>

    <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-ink-400">
      <Shield className="w-3 h-3" />
      Sem spam · Dados protegidos RGPD
    </div>
  </>
);

/* ── Step 2: Upsell ── */

const UpsellView = ({
  name,
  onGoToPremium,
  onReferralPath,
  onContinueFree,
}: {
  name: string;
  onGoToPremium: () => void;
  onReferralPath: () => void;
  onContinueFree: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-2 mb-4">
      <CheckCircle2 className="w-6 h-6 text-green-600" />
      <h3 className="font-heading font-bold text-lg text-ink-900">
        Lugar reservado, {name.trim().split(" ")[0]}!
      </h3>
    </div>

    <p className="text-[15px] text-ink-500 mb-4">
      Como preferes participar?
    </p>

    <p className="text-[14px] text-ink-500 mb-3">
      Com a versão gratuita, vais perder acesso a:
    </p>

    <div className="space-y-2 mb-5">
      {[
        { title: "Gravação da sessão", sub: "sem Premium, perdes acesso logo após o webinar" },
        { title: "Sessão Q&A exclusiva em grupo — 60 minutos", sub: "o único momento para tirar dúvidas com Frederico após o evento" },
        { title: "Guia completo de prompts — 30+ páginas", sub: "testado em contexto empresarial português, não disponível gratuitamente" },
      ].map((item) => (
        <div key={item.title} className="flex items-start gap-3 bg-red-50/50 border-l-2 border-red-400 rounded-r-lg px-3 py-2.5">
          <MinusCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-[14px] font-medium text-ink-900">{item.title}</span>
            <p className="text-[12px] text-ink-500 mt-0.5">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="space-y-2.5">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGoToPremium}
        className="w-full bg-gradient-to-r from-neon-purple to-blue-600 hover:from-neon-purple-light hover:to-blue-500 text-white font-heading font-bold text-base py-4 rounded-xl shadow-neon-purple transition-all flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        Sim, quero o Premium por €15+IVA
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReferralPath}
        className="w-full bg-green-50 border border-green-600 text-green-700 font-heading font-semibold text-[14px] py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-green-100"
      >
        <Gift className="w-4 h-4" />
        Prefiro convidar 2 amigos e ganhar grátis
      </motion.button>

      <button
        onClick={onContinueFree}
        className="w-full text-sm text-ink-400 hover:text-ink-600 transition-colors py-2 hover:underline underline-offset-4"
      >
        Não, continuar com versão gratuita
      </button>
    </div>
  </motion.div>
);

/* ── Step 3: Confirmation ── */

const ConfirmationView = ({
  email,
  name,
  referralData,
  mode,
}: {
  email: string;
  name: string;
  referralData: { referralCode: string; referralLink: string } | null;
  mode: ConfirmationMode;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (referralData) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappMsg = referralData
    ? encodeURIComponent(`Vou participar num webinar gratuito sobre IA para criar imagens profissionais. Inscreve-te aqui: ${referralData.referralLink}`)
    : "";

  const mailtoLink = referralData
    ? `mailto:?subject=${encodeURIComponent("Webinar gratuito: Imagens IA para empresas")}&body=${encodeURIComponent(`Olá!\n\nVou participar neste webinar gratuito sobre criar imagens profissionais com IA. Acho que te vai interessar.\n\nInscreve-te aqui: ${referralData.referralLink}\n\nAté lá!`)}`
    : "";

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="text-center py-2"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
      >
        <Check className="w-8 h-8 text-green-600" />
      </motion.div>
      <h3 className="font-heading text-2xl font-bold mb-2 text-ink-900">
        {name ? `Inscrição Confirmada, ${name.trim().split(" ")[0]}!` : "Inscrição Confirmada!"}
      </h3>
      <p className="text-ink-500 text-sm mb-1">Verifique o email</p>
      <span className="inline-block bg-blue-50 text-blue-600 font-medium text-sm px-3 py-1 rounded-full mb-4">
        {email}
      </span>

      {mode === "referral" && referralData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-5 text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-amber-600" />
            <h4 className="font-heading font-bold text-[15px] text-ink-900">Ganha Premium Grátis!</h4>
          </div>
          <p className="text-[13px] text-ink-600 mb-4">
            Convida 2 amigos. Se ambos se registarem, ganhas o Premium Pass (€15) sem pagar.
          </p>

          <div className="flex items-center gap-2 mb-3">
            <input
              readOnly
              value={referralData.referralLink}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-ink-700 truncate"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 bg-ink-900 text-white text-xs font-medium px-3 py-2.5 rounded-lg hover:bg-ink-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          <div className="flex gap-2">
            <a
              href={`https://wa.me/?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <a
              href={mailtoLink}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Email
            </a>
          </div>

          <a
            href={`/convites?email=${encodeURIComponent(email)}`}
            className="mt-3 text-[12px] text-blue-600 hover:underline flex items-center justify-center gap-1"
          >
            Ver estado dos convites
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      )}

      <button className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-ink-500 hover:text-blue-600 font-medium py-3 border border-border rounded-xl hover:border-blue-200 transition-all">
        <CalendarPlus className="w-4 h-4" />
        Adicionar ao calendário
      </button>
    </motion.div>
  );
};
