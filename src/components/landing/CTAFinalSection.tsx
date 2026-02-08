import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Shield, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export const CTAFinalSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <section id="cta-final" className="py-20 gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <ScrollReveal>
          <p className="text-xl md:text-2xl leading-relaxed mb-4 text-white/90">
            A diferença entre empresas que crescem e as que estagnam em 2025 será determinada pela velocidade de adaptação à Inteligência Artificial.
          </p>
          <p className="text-lg text-white/70 mb-4">
            90 minutos podem definir como a organização trabalha nos próximos anos.
          </p>
          <p className="text-lg font-semibold mb-10 text-white">
            O investimento é zero. O risco é zero.<br />O potencial de transformação é real.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Inscrição Confirmada!</h3>
              <p className="text-white/80">Verifique o email {email} para confirmar o lugar e receber o Kit IA Empresarial 2025.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4">
              <Input
                type="text"
                placeholder="O seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/20 border-white/20 text-white placeholder:text-white/50 h-12"
              />
              <Input
                type="email"
                placeholder="O seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/20 border-white/20 text-white placeholder:text-white/50 h-12"
              />
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-white text-primary font-bold text-lg py-4 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
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
          )}
        </ScrollReveal>

        <ScrollReveal>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-white/60">
            <Shield className="w-4 h-4" />
            Sem spam • Dados protegidos RGPD • Pode cancelar até ao início do webinar
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
