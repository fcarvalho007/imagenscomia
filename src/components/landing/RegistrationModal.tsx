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
        setName("");
        setEmail("");
      }, 300);
    }
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md neon-border rounded-2xl bg-card p-8 grid-tron"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
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
                <h3 className="text-2xl font-bold mb-2 text-gradient">Inscrição Confirmada!</h3>
                <p className="text-muted-foreground">
                  Verifique o email <span className="text-primary">{email}</span> para confirmar o lugar e receber o Kit IA Empresarial 2025.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gradient mb-2">Reservar Lugar Gratuito</h3>
                  <p className="text-sm text-muted-foreground">
                    Quinta-feira, 20 de Fevereiro • 19h00 (Lisboa)
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="O seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-muted/50 border-border h-12 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                  <Input
                    type="email"
                    placeholder="O seu melhor email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted/50 border-border h-12 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full gradient-cta text-primary-foreground font-bold text-lg py-4 rounded-xl neon-glow transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        A processar...
                      </>
                    ) : (
                      "GARANTIR LUGAR GRATUITO"
                    )}
                  </motion.button>
                </form>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  Sem spam • Dados protegidos RGPD
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
