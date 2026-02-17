import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LegalModal } from "@/components/legal/LegalModal";
import { TermosContent } from "@/components/legal/TermosContent";
import { PrivacidadeContent } from "@/components/legal/PrivacidadeContent";
import { motion, AnimatePresence } from "framer-motion";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";
import { X, Loader2, Shield, MinusCircle, Sparkles, Gift, Copy, MessageCircle, Send, ExternalLink, User, Mail, Check, CalendarPlus, CheckCircle2, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Step = "capture" | "upsell" | "confirmation";
type ConfirmationMode = "referral" | "simple";

export const RegistrationModal = () => {
  const navigate = useNavigate();
  const { isOpen, close, referredBy } = useRegistrationModal();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("capture");
  const [confirmationMode, setConfirmationMode] = useState<ConfirmationMode>("simple");
  const [referralData, setReferralData] = useState<{ referralCode: string; referralLink: string } | null>(null);

  const firstName = fullName.trim().split(" ")[0] || "";
  const lastName = fullName.trim().split(" ").slice(1).join(" ");

  const registerFree = async (): Promise<{ referralCode: string; referralLink: string; alreadyRegistered?: boolean } | null> => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = whatsapp ? whatsapp.replace(/[\s\-\(\)\.]/g, "") : undefined;
    const { data, error: fnError } = await supabase.functions.invoke("register-free", {
      body: { firstName, lastName, email: normalizedEmail, whatsapp: normalizedPhone || undefined, referredBy: referredBy || undefined },
    });
    if (fnError) throw fnError;
    return { referralCode: data.referralCode, referralLink: data.referralLink, alreadyRegistered: data.alreadyRegistered };
  };

  const handleCapture = async () => {
    if (!fullName.trim()) {
      setError("O nome é obrigatório.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Indique um email válido.");
      return;
    }
    if (!whatsapp.trim()) {
      setError("Indique o seu WhatsApp ou telemóvel para melhorar a experiência.");
      return;
    }
    if (!acceptedTerms) {
      setError("É necessário aceitar os termos para continuar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await registerFree();
      if (data?.alreadyRegistered) {
        close();
        const existingName = (data as any).name || `${firstName.trim()} ${lastName.trim()}`;
        navigate(`/upgrade?name=${encodeURIComponent(existingName)}&email=${encodeURIComponent(email.trim())}${data?.referralCode ? `&ref=${data.referralCode}` : ""}`);
        setLoading(false);
        return;
      }
      close();
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      navigate(`/upgrade?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email.trim())}${data?.referralCode ? `&ref=${data.referralCode}` : ""}`);
      // Fire tracking after navigation — never block the flow
      if (typeof fbq !== "undefined") {
        try { fbq('track', 'Lead'); } catch (_) {}
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const message = err instanceof Error ? err.message : "";
      if (message.includes("already") || message.includes("duplicate")) {
        setError("Este email já está inscrito.");
      } else if (message.includes("obrigatório") || message.includes("required")) {
        setError("Preencha todos os campos obrigatórios.");
      } else {
        setError("Não foi possível concluir. Verifique os dados e tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPremium = () => {
    close();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    navigate(`/upgrade?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email.trim())}`);
  };

  const handleReferralPath = () => {
    setConfirmationMode("referral");
    setStep("confirmation");
  };

  const handleContinueFree = () => {
    close();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    navigate(`/upgrade?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email.trim())}`);
  };

  const handleClose = () => {
    close();
    setTimeout(() => {
      setStep("capture");
      setConfirmationMode("simple");
      setFullName("");
      setWhatsapp("");
      setAcceptedTerms(false);
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
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
            }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {step === "capture" && (
              <CaptureView
                fullName={fullName}
                setFullName={setFullName}
                email={email}
                setEmail={setEmail}
                whatsapp={whatsapp}
                setWhatsapp={setWhatsapp}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                loading={loading}
                error={error}
                onSubmit={handleCapture}
              />
            )}

            {step === "upsell" && (
              <UpsellView
                name={`${firstName} ${lastName}`}
                onGoToPremium={handleGoToPremium}
                onReferralPath={handleReferralPath}
                onContinueFree={handleContinueFree}
              />
            )}

            {step === "confirmation" && (
              <ConfirmationView
                email={email}
                name={`${firstName} ${lastName}`}
                referralData={referralData}
                mode={confirmationMode}
                onGoToPremium={handleGoToPremium}
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
  fullName,
  setFullName,
  email,
  setEmail,
  whatsapp,
  setWhatsapp,
  acceptedTerms,
  setAcceptedTerms,
  loading,
  error,
  onSubmit,
}: {
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (v: boolean) => void;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
}) => {
  const [legalModal, setLegalModal] = useState<"termos" | "privacidade" | null>(null);

  return (
  <>
    <h3 className="font-heading font-bold text-xl text-ink-900 mb-1">
      Quero confirmar o meu lugar para o Webinar <span className="text-[#22C55E] font-extrabold">Gratuito</span> — Ao Vivo
    </h3>
    <p className="text-[15px] text-ink-500 mb-3">Quarta-feira, 18 de Fevereiro, 10h</p>

    <div className="space-y-3 mb-4">
      <div className="relative">
        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          placeholder="Primeiro e Último nome"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm"
        />
      </div>
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm"
        />
      </div>
      <div className="relative">
        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="tel"
          placeholder="Whatsapp/Telemóvel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm"
        />
        
      </div>
    </div>

    <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
      <input
        type="checkbox"
        checked={acceptedTerms}
        onChange={(e) => setAcceptedTerms(e.target.checked)}
        className="mt-1 w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-600/20 shrink-0"
      />
      <span className="text-[14px] text-ink-400 leading-relaxed">
        Autorizo o envio de comunicações relacionadas com este evento e conteúdos de marketing do Frederico Carvalho. Os dados pessoais serão tratados pela sua empresa Fomentar Sonhos.{" "}
        <button type="button" onClick={() => setLegalModal("privacidade")} className="underline hover:text-ink-600">Política de Privacidade</button> e{" "}
        <button type="button" onClick={() => setLegalModal("termos")} className="underline hover:text-ink-600">Termos e Condições</button>.
      </span>
    </label>

    {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}

    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading || !acceptedTerms}
      onClick={onSubmit}
      className="w-full bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-base py-4 rounded-xl shadow-neon-purple transition-all flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Check className="w-5 h-5" />
      )}
      {loading ? "A registar..." : "Reservar o meu lugar"}
    </motion.button>


    <LegalModal open={legalModal === "privacidade"} onOpenChange={(v) => !v && setLegalModal(null)} title="Política de Privacidade">
      <PrivacidadeContent />
    </LegalModal>
    <LegalModal open={legalModal === "termos"} onOpenChange={(v) => !v && setLegalModal(null)} title="Termos e Condições">
      <TermosContent />
    </LegalModal>
  </>
  );
};

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
    <div className="flex items-center gap-2 mb-2">
      <CheckCircle2 className="w-6 h-6 text-green-600" />
      <h3 className="font-heading font-bold text-lg text-ink-900">
        Lugar reservado.
      </h3>
    </div>

    <p className="text-[15px] text-ink-500 mb-4">
      Antes de concluir, escolhe o formato de participação.
    </p>

    <p className="text-[14px] text-ink-500 mb-3">
      Na participação gratuita, estes extras não estão incluídos:
    </p>

    <div className="space-y-2 mb-5">
      {[
        { title: "Gravação da sessão (acesso durante 30 dias)" },
        { title: "Sessão Q&A exclusiva em grupo — 60 minutos" },
        { title: "Guia completo de prompts (30+ páginas, contexto empresarial em PT)" },
      ].map((item) => (
        <div key={item.title} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
          <MinusCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <span className="text-[14px] font-medium text-ink-700">{item.title}</span>
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
        Sim, quero o Premium (€15 + IVA)
      </motion.button>
      <p className="text-[14px] text-ink-400 text-center">Pagamento seguro. Acesso imediato após o evento.</p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReferralPath}
        className="w-full bg-green-50 border border-green-600 text-green-700 font-heading font-semibold text-[14px] py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-green-100"
      >
        <Gift className="w-4 h-4" />
        Prefiro convidar 2 pessoas e obter o Premium
      </motion.button>
      <p className="text-[14px] text-ink-400 text-center">
        Vais receber um link pessoal. Assim que 2 amigos se inscreverem, o Premium fica ativo.
      </p>

      <button
        onClick={onContinueFree}
        className="w-full text-sm text-ink-500 hover:text-ink-600 transition-colors py-2 hover:underline underline-offset-4"
      >
        Continuar com participação gratuita
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
  onGoToPremium,
}: {
  email: string;
  name: string;
  referralData: { referralCode: string; referralLink: string } | null;
  mode: ConfirmationMode;
  onGoToPremium: () => void;
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
      <p className="text-ink-500 text-sm mb-1">Verifica o teu email</p>
      <span className="inline-block bg-blue-50 text-blue-600 font-medium text-sm px-3 py-1 rounded-full mb-4">
        {email}
      </span>

      {mode === "referral" && referralData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-left space-y-4"
        >
          {/* Upgrade CTA */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-[14px] text-ink-600 mb-3">
              Enviámos as instruções para o teu email. Entretanto, podes fazer upgrade para Premium.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoToPremium}
              className="w-full bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-[14px] py-3 rounded-xl shadow-neon-purple transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Fazer upgrade agora por €15+IVA
            </motion.button>
          </div>

          {/* Referral sharing */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-amber-600" />
              <h4 className="font-heading font-bold text-[15px] text-ink-900">Ou ganha Premium grátis!</h4>
            </div>
            <p className="text-[14px] text-ink-600 mb-4">
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
              className="mt-3 text-[14px] text-blue-600 hover:underline flex items-center justify-center gap-1"
            >
              Ver estado dos convites
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      )}

      <button className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-ink-500 hover:text-blue-600 font-medium py-3 border border-border rounded-xl hover:border-blue-200 transition-all">
        <CalendarPlus className="w-4 h-4" />
        Adicionar ao calendário
      </button>
    </motion.div>
  );
};
