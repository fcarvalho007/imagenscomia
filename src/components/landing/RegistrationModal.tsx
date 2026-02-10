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
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-text-secondary hover:text-foreground transition-colors"
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
                <h3 className="font-heading text-2xl font-bold mb-2 text-gradient">Inscrição Confirmada!</h3>
                <p className="text-text-secondary text-sm">
                  Verifique o email <span className="text-primary">{email}</span> para confirmar o lugar.
                </p>
              </motion.div>
            ) : showUpsell ? (
              /* Upsell modal - reverse psychology */
              <>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground mb-3">
                  ⚠️ Tem a certeza que não quer o Premium?
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  Escolheu a versão gratuita. Isso significa que vai ficar sem:
                </p>

                <div className="space-y-2.5 mb-5">
                  {[
                    "Gravação da sessão (sem Premium, perde acesso após o webinar)",
                    "Sessão Q&A exclusiva em grupo (60 minutos de aprofundamento)",
                    "Guia completo de ferramentas (30+ páginas, não disponível gratuitamente)",
                    "Apps em early access (os outros esperam, acedes primeiro)",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-sm">
                      <X className="w-4 h-4 text-urgency mt-0.5 shrink-0" />
                      <span className="text-text-muted">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-urgency/10 border border-urgency/20 rounded-xl p-4 mb-5">
                  <p className="text-sm text-foreground">
                    Se mudar de ideias depois do webinar: Premium custará <strong>€27</strong>, não €15. Perde €12 por esperar.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-cta-premium hover:bg-cta-premium-hover text-white font-heading font-bold text-sm py-4 rounded-xl glow-amber transition-all mb-3"
                >
                  SIM, QUERO PREMIUM €15
                </motion.button>

                <button
                  onClick={handleContinueFree}
                  className="w-full text-sm text-text-secondary hover:text-text-muted transition-colors py-2"
                >
                  Não, continuar com versão gratuita →
                </button>
              </>
            ) : (
              /* Registration form */
              <>
                <div className="text-center mb-6">
                  <h3 className="font-heading text-xl font-bold text-gradient mb-2">Inscrição Gratuita</h3>
                  <p className="text-xs text-text-secondary">
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
                    className="bg-muted/50 border-border h-12 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                  <Input
                    type="email"
                    placeholder="O teu melhor email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted/50 border-border h-12 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-cta-free hover:bg-cta-free-hover text-white font-heading font-bold text-sm py-4 rounded-xl glow-green transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        A processar...
                      </>
                    ) : (
                      "INSCREVER GRÁTIS"
                    )}
                  </motion.button>
                </form>

                <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-text-secondary">
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
