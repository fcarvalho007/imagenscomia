import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowLeft, MessageCircle, Gift, Copy, Send, ExternalLink } from "lucide-react";

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

const Confirmacao = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "premium";
  const userName = searchParams.get("name") || "";
  const conf = CONFIRMATIONS[plan] || CONFIRMATIONS.premium;
  const showReferralWidget = plan === "referral";

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-[520px] bg-background rounded-2xl p-8 md:p-10 shadow-card-lg text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
          className="text-5xl mb-4"
        >
          {conf.emoji}
        </motion.div>

        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-ink-900 mb-6">
          {userName ? `${conf.title.replace("!", "")}, ${userName}!` : conf.title}
        </h1>

        <div className="bg-surface rounded-xl p-5 mb-6 text-left">
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
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
          <p className="text-[14px] text-ink-700">
            📧 <span className="font-semibold">Próximo passo:</span> {conf.next}
          </p>
        </div>

        {showReferralWidget && <ReferralWidget />}

        <div className="space-y-3">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 bg-ink-900 hover:bg-ink-700 text-white font-heading font-bold text-base py-4 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>

          <a
            href="https://wa.me/351000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 text-sm text-ink-500 hover:text-green-600 font-medium py-3 border border-border rounded-xl hover:border-green-200 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Grupo WhatsApp do evento
          </a>
        </div>

        <p className="text-[12px] text-ink-400 mt-6">
          Questões? frederico@digitalfc.pt
        </p>
      </motion.div>
    </div>
  );
};

/* ── Referral Widget for plan=referral ── */
const ReferralWidget = () => {
  const [copied, setCopied] = useState(false);
  // In a real implementation this would come from the registration response
  // For now, show a placeholder that gets populated via query params or state
  const referralLink = window.location.origin + "/convites";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMsg = encodeURIComponent(
    `Vou participar num webinar gratuito sobre IA para criar imagens profissionais. Inscreve-te aqui: ${referralLink}`
  );

  const mailtoLink = `mailto:?subject=${encodeURIComponent("Webinar gratuito: Imagens IA para empresas")}&body=${encodeURIComponent(`Olá!\n\nVou participar neste webinar gratuito sobre criar imagens profissionais com IA.\n\nInscreve-te aqui: ${referralLink}\n\nAté lá!`)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5 text-left"
    >
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-5 h-5 text-amber-600" />
        <h4 className="font-heading font-bold text-[15px] text-ink-900">Partilha e ganha Premium!</h4>
      </div>
      <p className="text-[13px] text-ink-600 mb-4">
        Convida 2 amigos com o teu link. Quando ambos se inscreverem, recebes o Premium Pass (€15) grátis.
      </p>

      <div className="flex items-center gap-2 mb-3">
        <input
          readOnly
          value={referralLink}
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
        href="/convites"
        className="mt-3 text-[12px] text-blue-600 hover:underline flex items-center justify-center gap-1"
      >
        Ver estado dos convites
        <ExternalLink className="w-3 h-3" />
      </a>
    </motion.div>
  );
};

export default Confirmacao;
