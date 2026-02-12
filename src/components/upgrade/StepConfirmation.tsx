import { useState } from "react";
import { Check, Loader2, Copy, Shield } from "lucide-react";
import { motion } from "framer-motion";
import livroGuiaSeo from "@/assets/livro-guia-seo.png";
import WebinarCalendarButton from "@/components/webinar/AddToCalendarButton";
import type { OrderState } from "@/pages/Upsell";
import { formatPrice, getTotal } from "@/pages/Upsell";

interface Props {
  orderState: OrderState;
  loading: boolean;
  error: string | null;
  onPay: (plan: string) => void;
  onBack: () => void;
  userName: string;
  referralCode: string;
}

/* ── Variante A — Só Gratuito ── */
const VariantFree = ({ userName, referralCode }: { userName: string; referralCode: string }) => {
  const [copied, setCopied] = useState(false);
  const referralLink = referralCode
    ? `${window.location.origin}/?ref=${referralCode}`
    : `${window.location.origin}/`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[480px]">
      <h2 className="font-heading font-bold text-[24px] max-sm:text-[20px]" style={{ color: "hsl(var(--green-700))" }}>
        Estás inscrito! Até dia 18 🎉
      </h2>

      <div className="bg-green-50 border border-green-100 rounded-xl p-5 mt-5 mb-5 space-y-2">
        {[
          "Webinar ao vivo — 18 Fev · 10h00",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-700 shrink-0" />
            <span className="font-medium text-[15px] text-green-700">{item}</span>
          </div>
        ))}
      </div>

      <WebinarCalendarButton className="mb-5" />

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 mb-5 shadow-sm">
        <div className="flex gap-4 mb-3.5">
          <img
            src={livroGuiaSeo}
            alt="Guia Essencial SEO"
            className="w-auto h-[120px] rounded-lg shadow-sm shrink-0 object-contain"
          />
          <div>
            <p className="font-heading font-bold text-[17px] text-amber-800 mb-2">
              🎁 Convida 2 amigos — ganhas o livro Guia Essencial SEO
            </p>
            <p className="text-[15px] text-amber-700">
              O guia indispensável para qualquer pessoa que deseje dominar as estratégias de otimização para motores de pesquisa e maximizar a visibilidade online.
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 font-heading font-semibold text-[14px] py-3 rounded-xl transition-colors bg-amber-100 text-amber-700 border border-amber-400 hover:bg-amber-200"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Link copiado!" : "Copiar o meu link de convite"}
        </button>
      </div>

      <a
        href="https://www.instagram.com/frederico.m.carvalho/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 font-heading font-semibold text-[14px] text-white py-3 rounded-xl transition-colors"
        style={{ backgroundColor: "#E1306C" }}
      >
        📸 Seguir no Instagram
      </a>
    </div>
  );
};

/* ── Modal de transição pré-redirect ── */
const RedirectOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-white rounded-3xl p-10 max-w-[380px] mx-4 text-center"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)" }}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
        <Shield className="w-7 h-7 text-blue-600" />
      </div>
      <Loader2 className="w-5 h-5 animate-spin text-blue-400 mx-auto mb-4" />
      <h3 className="font-heading font-semibold text-[17px] text-ink-900 mb-1.5">
        Pagamento seguro
      </h3>
      <p className="text-[14px] text-ink-400 leading-relaxed">
        A redirecionar... Receberás confirmação por email.
      </p>
    </motion.div>
  </div>
);

/* ── Variantes B/C/D — Com pagamento ── */
const VariantPayment = ({
  orderState,
  loading,
  error,
  onPay,
  onBack,
}: {
  orderState: OrderState;
  loading: boolean;
  error: string | null;
  onPay: (plan: string) => void;
  onBack: () => void;
}) => {
  const [showRedirect, setShowRedirect] = useState(false);
  const { premium, masterclass } = orderState;
  const total = getTotal(orderState);
  const subtotal = (premium ? 15 : 0) + (masterclass ? 47 : 0);
  const iva = total - subtotal;

  let title = "Premium Pass adicionado! Confirma o pagamento.";
  let plan = "premium";
  if (premium && masterclass) {
    title = "Excelente combinação! Confirma o pagamento.";
    plan = "premium-masterclass";
  } else if (masterclass) {
    title = "Masterclass adicionada! Confirma o pagamento.";
    plan = "masterclass";
  }

  const handleClick = () => {
    setShowRedirect(true);
    onPay(plan);
  };

  return (
    <div className="max-w-[480px]">
      {showRedirect && <RedirectOverlay />}

      <h2 className="font-heading font-bold text-[24px] max-sm:text-[20px] text-ink-900">{title}</h2>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-5 mb-5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 font-medium text-[15px] text-ink-700">
              <Check className="w-4 h-4 text-blue-600" /> Webinar ao vivo — 18 Fev · 10h00
            </span>
            <span className="text-[15px] text-ink-700">€0</span>
          </div>

          {premium && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-medium text-[15px] text-ink-700">
                <Check className="w-4 h-4 text-blue-600" /> Premium Pass
              </span>
              <span className="text-[15px] text-ink-700">€15 <span className="text-[14px] text-ink-400">+ IVA</span></span>
            </div>
          )}

          {masterclass && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-medium text-[15px] text-ink-700">
                <Check className="w-4 h-4 text-blue-600" /> Masterclass Online
              </span>
              <span className="text-[15px] text-ink-700">€47 <span className="text-[14px] text-ink-400">+ IVA</span></span>
            </div>
          )}

          <div className="h-px bg-border my-2" />

          <div className="flex justify-between items-center">
            <span className="font-medium text-[14px] text-ink-700">Subtotal (sem IVA)</span>
            <span className="font-medium text-[14px] text-ink-700">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-[14px] text-amber-600">IVA (23%)</span>
            <span className="font-semibold text-[14px] text-amber-600">{formatPrice(iva)}</span>
          </div>

          <div className="h-px bg-border my-2" />

          <div className="flex justify-between items-center">
            <span className="font-heading font-bold text-[16px] text-ink-900">TOTAL <span className="text-[14px] font-normal text-ink-400">(c/ IVA)</span></span>
            <span className="font-heading font-bold text-[16px] text-ink-900">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <button
        disabled={loading}
        onClick={handleClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[16px] py-4 rounded-xl shadow-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> A preparar pagamento...
          </>
        ) : (
          <>Confirmar e pagar {formatPrice(total)} →</>
        )}
      </button>

      <p className="text-center text-[14px] text-ink-400 mt-2">
        🔒 Pagamento seguro EuPago
      </p>

      {error && <p className="text-center text-[14px] text-red-500 mt-3">{error}</p>}

      <p
        onClick={onBack}
        className="text-[14px] text-ink-400 cursor-pointer text-center mt-4 hover:underline"
      >
        Voltar e alterar escolha
      </p>
    </div>
  );
};

/* ── Main Step 5 ── */
export const StepConfirmation = (props: Props) => {
  const { orderState, userName, referralCode } = props;
  const isFreeOnly = !orderState.premium && !orderState.masterclass;

  if (isFreeOnly) {
    return <VariantFree userName={userName} referralCode={referralCode} />;
  }

  return <VariantPayment {...props} />;
};
