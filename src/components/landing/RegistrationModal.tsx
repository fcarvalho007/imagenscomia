import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";
import { Input } from "@/components/ui/input";
import { X, Loader2, Shield } from "lucide-react";

export const RegistrationModal = () => {
  const { isOpen, close } = useRegistrationModal();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showUpsell, setShowUpsell] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleClose = () => {
    close();
    if (submitted) {
      setTimeout(() => {
        setSubmitted(false);
        setShowUpsell(true);
        setName("");
        setEmail("");
      }, 300);
    }
  };

  const handleContinueFree = () => {
    setShowUpsell(false);
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[460px] bg-background rounded-xl p-8 overflow-y-auto max-h-[90vh] shadow-card-lg"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-ink-400 hover:text-ink-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-4"
              >
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-heading text-2xl font-bold mb-2 text-ink-900">Inscrição Confirmada!</h3>
                <p className="text-ink-500 text-sm">
                  Verifique o email <span className="text-blue-600 font-medium">{email}</span> para confirmar o lugar.
                </p>
              </motion.div>
            ) : showUpsell ? (
              <>
                <h3 className="font-heading font-bold text-xl text-ink-900 mb-3">
                  Tem a certeza que não quer o Premium?
                </h3>
                <p className="text-[15px] text-ink-500 mb-4">
                  Escolheu a versão gratuita. Isso significa que vai ficar sem:
                </p>

                <div className="space-y-2.5 mb-5">
                  {[
                    "Gravação da sessão (perde acesso após o webinar)",
                    "Sessão Q&A exclusiva em grupo (60 min de aprofundamento)",
                    "Guia completo de prompts (30+ páginas, não disponível gratuitamente)",
                    "Early access às apps (os outros esperam, você acede primeiro)",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0 font-bold" />
                      <span className="text-[15px] text-ink-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-red-50 border border-red-500/20 rounded-md p-3.5 mb-6">
                  <p className="text-[13px] text-ink-700 font-medium">
                    Se mudar de ideias depois do webinar, o Premium custará €27. Poupa €12 ao decidir agora.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-base py-4 rounded-xl shadow-blue transition-all"
                  >
                    Sim, quero o Premium por €15
                  </motion.button>

                  <button
                    onClick={handleContinueFree}
                    className="w-full text-sm text-ink-400 hover:text-ink-700 transition-colors py-2"
                  >
                    Não, continuar com versão gratuita
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h3 className="font-heading text-xl font-bold text-ink-900 mb-2">Inscrição Gratuita</h3>
                  <p className="text-xs text-ink-500">
                    Quarta, 18 de Fevereiro · 10h00 (Lisboa)
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    type="text"
                    placeholder="O teu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-surface border-border h-12 text-ink-900 placeholder:text-ink-400 focus:border-blue-600"
                  />
                  <Input
                    type="email"
                    placeholder="O teu melhor email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-surface border-border h-12 text-ink-900 placeholder:text-ink-400 focus:border-blue-600"
                  />
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
                      "Inscrever grátis"
                    )}
                  </motion.button>
                </form>

                <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-ink-400">
                  <Shield className="w-3 h-3" />
                  Sem spam · Dados protegidos RGPD
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
