import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";
import { X, Loader2, Shield, MinusCircle, Clock, Sparkles, ArrowRight, Ticket, User, Mail, Check, CalendarPlus, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const RegistrationModal = () => {
  const { isOpen, variant, open, close } = useRegistrationModal();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showUpsell, setShowUpsell] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPremium = variant === "premium";

  const handleSubmitFree = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleSubmitPremium = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
        body: { plan: "premium", email, nome: name },
      });

      if (fnError) throw fnError;
      if (data?.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error("Link de pagamento não recebido");
      }
    } catch (err: unknown) {
      console.error("Payment error:", err);
      setError("Erro ao processar. Tenta novamente.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    close();
    if (submitted) {
      setTimeout(() => {
        setSubmitted(false);
        setShowUpsell(true);
        setName("");
        setEmail("");
        setError(null);
      }, 300);
    }
  };

  const handleContinueFree = () => {
    setShowUpsell(false);
  };

  const handleSwitchToPremium = () => {
    open("premium");
    setShowUpsell(false);
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

            {submitted ? (
              <ConfirmationView email={email} />
            ) : isPremium ? (
              <PremiumForm
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                loading={loading}
                error={error}
                onSubmit={handleSubmitPremium}
              />
            ) : showUpsell ? (
              <UpsellView
                onContinueFree={handleContinueFree}
                onSwitchToPremium={handleSwitchToPremium}
              />
            ) : (
              <FreeForm
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                loading={loading}
                onSubmit={handleSubmitFree}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Sub-components ── */

const ConfirmationView = ({ email }: { email: string }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="text-center py-4"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
      className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
    >
      <Check className="w-8 h-8 text-green-600" />
    </motion.div>
    <h3 className="font-heading text-2xl font-bold mb-2 text-ink-900">Inscrição Confirmada!</h3>
    <p className="text-ink-500 text-sm mb-1">Verifique o email</p>
    <span className="inline-block bg-blue-50 text-blue-600 font-medium text-sm px-3 py-1 rounded-full mb-6">
      {email}
    </span>
    <button className="w-full flex items-center justify-center gap-2 text-sm text-ink-500 hover:text-blue-600 font-medium py-3 border border-border rounded-xl hover:border-blue-200 transition-all">
      <CalendarPlus className="w-4 h-4" />
      Adicionar ao calendário
    </button>
  </motion.div>
);

const UpsellView = ({
  onContinueFree,
  onSwitchToPremium,
}: {
  onContinueFree: () => void;
  onSwitchToPremium: () => void;
}) => (
  <>
    <h3 className="font-heading font-bold text-xl text-ink-900 mb-2">
      Antes de continuar...
    </h3>
    <p className="text-[15px] text-ink-500 mb-5">
      Com a versão gratuita, vais perder acesso a:
    </p>

    <div className="space-y-2 mb-5">
      {[
        "Gravação da sessão (perde acesso após o webinar)",
        "Sessão Q&A exclusiva em grupo (60 min de aprofundamento)",
        "Guia completo de prompts (30+ páginas, não disponível gratuitamente)",
        "Early access às apps (os outros esperam, você acede primeiro)",
      ].map((item) => (
        <div key={item} className="flex items-start gap-3 bg-red-50/50 border-l-2 border-red-400 rounded-r-lg px-3 py-2.5">
          <MinusCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <span className="text-[14px] text-ink-700">{item}</span>
        </div>
      ))}
    </div>

    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 mb-6 flex items-start gap-2.5">
      <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
      <p className="text-[13px] text-ink-700 font-medium">
        Se mudar de ideias depois do webinar, o Premium custará €27. Poupa €12 ao decidir agora.
      </p>
    </div>

    <div className="space-y-2.5">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSwitchToPremium}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-heading font-bold text-base py-4 rounded-xl shadow-blue transition-all flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        Sim, quero o Premium por €15
      </motion.button>

      <button
        onClick={onContinueFree}
        className="w-full text-sm text-ink-400 hover:text-ink-600 transition-colors py-2 hover:underline underline-offset-4"
      >
        Não, continuar com versão gratuita
      </button>
    </div>

    <div className="flex items-center justify-center gap-1.5 mt-5">
      <div className="w-2 h-2 rounded-full bg-blue-600" />
      <div className="w-2 h-2 rounded-full bg-ink-200" />
    </div>
  </>
);

const PremiumForm = ({
  name, setName, email, setEmail, loading, error, onSubmit,
}: {
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  loading: boolean; error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <>
    <div className="text-center mb-6">
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
        <CreditCard className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="font-heading text-xl font-bold text-ink-900 mb-1">Premium Pass — €15 + IVA</h3>
      <p className="text-xs text-ink-500">
        Quarta, 18 de Fevereiro · 10h00 (Lisboa)
      </p>
    </div>

    <form onSubmit={onSubmit} className="space-y-3">
      <div className="relative">
        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          placeholder="O teu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
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
          required
          className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-base py-4 rounded-xl shadow-blue transition-all disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            A preparar pagamento...
          </>
        ) : (
          <>
            Confirmar e pagar €15
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </form>

    <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-ink-400">
      <Shield className="w-3 h-3" />
      Pagamento seguro via EuPago · Reembolso 14 dias
    </div>
  </>
);

const FreeForm = ({
  name, setName, email, setEmail, loading, onSubmit,
}: {
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <>
    <div className="text-center mb-6">
      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
        <Ticket className="w-6 h-6 text-green-600" />
      </div>
      <h3 className="font-heading text-xl font-bold text-ink-900 mb-1">Inscrição Gratuita</h3>
      <p className="text-xs text-ink-500">
        Quarta, 18 de Fevereiro · 10h00 (Lisboa)
      </p>
    </div>

    <form onSubmit={onSubmit} className="space-y-3">
      <div className="relative">
        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          placeholder="O teu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
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
          required
          className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm"
        />
      </div>
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-base py-4 rounded-xl shadow-green transition-all disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            A processar...
          </>
        ) : (
          <>
            Inscrever grátis
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </form>

    <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-ink-400">
      <Shield className="w-3 h-3" />
      Sem spam · Dados protegidos RGPD
    </div>

    <div className="flex items-center justify-center gap-1.5 mt-4">
      <div className="w-2 h-2 rounded-full bg-ink-200" />
      <div className="w-2 h-2 rounded-full bg-blue-600" />
    </div>
  </>
);
