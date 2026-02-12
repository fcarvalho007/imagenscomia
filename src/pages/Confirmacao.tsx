import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import ConfirmacaoExtras from "@/components/landing/ConfirmacaoExtras";
import { Separator } from "@/components/ui/separator";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" as const },
});

const Confirmacao = () => {
  const [searchParams] = useSearchParams();
  const userName = searchParams.get("name") || "";

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-full max-w-[520px] bg-background rounded-2xl p-6 sm:p-8 md:p-10 shadow-card-lg text-center flex flex-col items-center"
      >
        {/* Animated check circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
        >
          <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
        </motion.div>

        <motion.h1
          {...fadeUp(0.15)}
          className="font-heading font-extrabold text-2xl md:text-3xl text-ink-900 mb-2"
        >
          {userName ? `Upgrade Realizado, ${userName}!` : "Upgrade Realizado!"}
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="text-[15px] text-ink-500 mb-1">
          Obrigado pela confiança.
        </motion.p>

        <motion.p {...fadeUp(0.25)} className="text-[14px] text-ink-400 mb-8">
          Vamos aguardar a confirmação do seu pagamento.
        </motion.p>

        {/* Próximos Passos */}
        <motion.div {...fadeUp(0.35)} className="w-full">
          <Separator className="mb-6" />
          <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-ink-700 mb-5">
            Próximos Passos
          </h2>
          <ConfirmacaoExtras />
        </motion.div>

        {/* Footer */}
        <motion.div {...fadeUp(0.5)} className="w-full mt-8 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao site
          </Link>
          <p className="text-[12px] text-ink-400">
            Questões? frederico@digitalfc.pt
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Confirmacao;
