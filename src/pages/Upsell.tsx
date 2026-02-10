import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, ArrowRight, Shield, User, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PLANS = [
  {
    key: "premium",
    name: "Premium Pass",
    price: "€15",
    priceNote: "+ IVA",
    highlight: true,
    features: [
      "Gravação HD vitalícia",
      "Sessão Q&A em grupo (60 min)",
      "Guia completo de prompts (30+ páginas)",
      "Apps em early access",
    ],
  },
  {
    key: "masterclass",
    name: "Premium + Masterclass",
    price: "€52",
    priceNote: "+ IVA",
    highlight: false,
    features: [
      "Tudo do Premium Pass",
      "Masterclass Online — 3h",
      "50 prompts testados em contexto real",
      "Gravação vitalícia de tudo",
    ],
  },
  {
    key: "workshop",
    name: "Premium + Workshop",
    price: "€512",
    priceNote: "+ IVA · Founder Pricing",
    highlight: false,
    features: [
      "Tudo do Premium Pass",
      "Workshop Presencial Lisboa — 8h",
      "Certificado Professor FEUC",
      "Máximo 12 participantes",
    ],
  },
];

const Upsell = () => {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [showCards, setShowCards] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReveal = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCards(true);
  };

  const handlePayment = async (planKey: string) => {
    setLoadingPlan(planKey);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
        body: { plan: planKey, email, nome },
      });

      if (fnError) throw fnError;
      if (data?.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error("Link de pagamento não recebido");
      }
    } catch (err: unknown) {
      console.error("Payment error:", err);
      setError("Erro ao processar pagamento. Tenta novamente.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-off-white py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-[960px]">
        <div className="text-center mb-10">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h1 className="font-heading font-extrabold text-[26px] sm:text-[32px] text-ink-900 mb-2">
            Faz upgrade ao teu acesso
          </h1>
          <p className="text-ink-500 text-[16px] max-w-[480px] mx-auto">
            A inscrição gratuita está confirmada. Desbloqueia mais com um upgrade.
          </p>
        </div>

        {!showCards ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleReveal}
            className="max-w-[400px] mx-auto bg-background rounded-2xl p-8 shadow-card-md"
          >
            <p className="text-sm text-ink-500 mb-4 text-center">
              Confirma o teu email para ver as opções
            </p>
            <div className="space-y-3 mb-4">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="O teu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
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
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-base py-4 rounded-xl shadow-blue transition-all flex items-center justify-center gap-2"
            >
              Ver opções
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {PLANS.map((plan) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-background rounded-xl p-6 flex flex-col ${
                  plan.highlight
                    ? "border-2 border-blue-600 shadow-blue"
                    : "border border-border shadow-card"
                }`}
              >
                {plan.highlight && (
                  <span className="self-start bg-blue-600 text-white text-[11px] font-heading font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                    Mais popular
                  </span>
                )}
                <h3 className="font-heading font-bold text-lg text-ink-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-heading font-extrabold text-3xl text-ink-900">{plan.price}</span>
                </div>
                <p className="text-xs text-ink-400 mb-5">{plan.priceNote}</p>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-[14px] text-ink-700">{f}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loadingPlan !== null}
                  onClick={() => handlePayment(plan.key)}
                  className={`w-full font-heading font-bold text-base py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${
                    plan.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue"
                      : "bg-ink-900 hover:bg-ink-700 text-white"
                  }`}
                >
                  {loadingPlan === plan.key ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      A preparar...
                    </>
                  ) : (
                    <>Escolher {plan.price}</>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {error && (
          <p className="text-center text-sm text-red-500 mt-4">{error}</p>
        )}

        <div className="flex items-center justify-center gap-2 mt-8 text-[12px] text-ink-400">
          <Shield className="w-3.5 h-3.5" />
          Pagamento seguro via EuPago · Reembolso 14 dias
        </div>
      </div>
    </div>
  );
};

export default Upsell;
