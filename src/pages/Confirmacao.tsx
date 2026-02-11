import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import ConfirmacaoExtras from "@/components/landing/ConfirmacaoExtras";
import { Separator } from "@/components/ui/separator";

const CONFIRMATIONS: Record<string, { title: string; emoji: string; items: string[]; next: string }> = {
  free: {
    title: "Inscrição gratuita confirmada!",
    emoji: "✅",
    items: [
      "Webinar ao vivo — 18 Fev 10h",
      "Demos ao vivo com 5 tipos de imagem",
      "Acesso a aplicações especializadas",
      "Resumo PDF da sessão",
    ],
    next: "Verifica o teu email — enviámos o link Zoom para o webinar.",
  },
  referral: {
    title: "Inscrição confirmada — ganha Premium!",
    emoji: "🎁",
    items: [
      "Webinar ao vivo — 18 Fev 10h",
      "Demos ao vivo com 5 tipos de imagem",
      "Acesso a aplicações especializadas",
      "Resumo PDF da sessão",
    ],
    next: "Partilha o teu link com 2 amigos. Quando ambos se inscreverem, recebes o Premium Pass grátis!",
  },
  premium: {
    title: "Premium Pass confirmado!",
    emoji: "🎉",
    items: [
      "Webinar ao vivo — 18 Fev 10h",
      "Gravação HD vitalícia",
      "Sessão Q&A em grupo (60 min)",
      "Guia completo de prompts (30+ páginas)",
      "Apps em early access",
    ],
    next: "Verifica o teu email — enviámos o link Zoom e acesso ao grupo WhatsApp.",
  },
  masterclass: {
    title: "Premium + Masterclass confirmados!",
    emoji: "🚀",
    items: [
      "Webinar ao vivo — 18 Fev 10h",
      "Masterclass Online — 3h (data a comunicar)",
      "50 prompts testados",
      "Gravação vitalícia de tudo",
    ],
    next: "Verifica o teu email. Receberás a data da Masterclass com 7 dias de antecedência.",
  },
  workshop: {
    title: "Workshop reservado — Founder Pricing!",
    emoji: "⭐",
    items: [
      "Webinar ao vivo — 18 Fev 10h",
      "Workshop Presencial Lisboa — 8h (Abril)",
      "Certificado Professor FEUC",
      "Tudo do Premium Pass incluído",
    ],
    next: "Verifica o teu email. Receberás a morada e preparação pré-workshop em breve.",
  },
  bundle: {
    title: "Bundle completo confirmado!",
    emoji: "💎",
    items: [
      "Webinar ao vivo — 18 Fev 10h",
      "Masterclass Online — 3h",
      "Workshop Presencial Lisboa — 8h",
      "Tudo incluído — acesso total",
    ],
    next: "Verifica o teu email para todos os acessos e datas.",
  },
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" as const },
});

const Confirmacao = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "premium";
  const userName = searchParams.get("name") || "";
  const conf = CONFIRMATIONS[plan] || CONFIRMATIONS.premium;

  const referralLink = searchParams.get("ref")
    ? `${window.location.origin}/?ref=${searchParams.get("ref")}`
    : `${window.location.origin}/`;

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
          className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2"
        >
          <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
        </motion.div>

        <motion.span {...fadeUp(0.15)} className="text-2xl mb-3">
          {conf.emoji}
        </motion.span>

        <motion.h1
          {...fadeUp(0.2)}
          className="font-heading font-extrabold text-2xl md:text-3xl text-ink-900 mb-6"
        >
          {userName ? `${conf.title.replace("!", "")}, ${userName}!` : conf.title}
        </motion.h1>

        <motion.div {...fadeUp(0.3)} className="w-full bg-surface rounded-xl p-5 mb-6 text-left">
          <p className="font-heading font-semibold text-sm text-ink-500 uppercase tracking-wider mb-3">
            O teu acesso inclui:
          </p>
          <ul className="space-y-2.5">
            {conf.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span className="text-[15px] text-ink-700">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          {...fadeUp(0.4)}
          className="w-full bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left"
        >
          <p className="text-[14px] text-ink-700">
            📧 <span className="font-semibold">Próximo passo:</span> {conf.next}
          </p>
        </motion.div>

        {/* Extras section */}
        <motion.div {...fadeUp(0.5)} className="w-full mt-2">
          <Separator className="mb-6" />
          <ConfirmacaoExtras referralLink={referralLink} />
        </motion.div>

        {/* Footer */}
        <motion.div {...fadeUp(0.6)} className="w-full mt-8 space-y-3">
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
