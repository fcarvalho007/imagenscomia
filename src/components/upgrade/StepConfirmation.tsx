import { useState } from "react";
import { Check, Loader2, Copy } from "lucide-react";
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

const generateICS = () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Webinar IA//PT",
    "BEGIN:VEVENT",
    "DTSTART:20250218T100000Z",
    "DTEND:20250218T111500Z",
    "SUMMARY:Webinar IA — Frederico Carvalho",
    "DESCRIPTION:Como Criar Imagens Profissionais com IA para a Tua Empresa",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "webinar-ia.ics";
  a.click();
  URL.revokeObjectURL(url);
};

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
      <h2 className="font-heading font-bold text-[22px]" style={{ color: "hsl(var(--green-700))" }}>
        Estás inscrito! Até dia 18 🎉
      </h2>

      {/* Confirmation block */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-5 mt-5 mb-5 space-y-2">
        {[
          "Webinar ao vivo — 18 Fev · 10h00",
          "Link Zoom enviado para o teu email",
          "Grupo WhatsApp do evento (link enviado por email)",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-700 shrink-0" />
            <span className="font-medium text-[14px] text-green-700">{item}</span>
          </div>
        ))}
      </div>

      {/* Referral block */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5">
        <p className="font-heading font-bold text-[15px] text-amber-800 mb-2">
          🎁 Convida 2 amigos — ganhas acesso ao Q&A Bónus de 25 Fev
        </p>
        <p className="text-[14px] text-amber-700 mb-3.5">
          Partilha o teu link. Quando 2 amigos se inscreverem,
          entras gratuitamente na sessão extra de Q&A.
        </p>
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 font-heading font-semibold text-[14px] py-3 rounded-xl transition-colors bg-amber-50 text-amber-700"
          style={{ border: "1px solid hsl(var(--amber-500))" }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Link copiado!" : "Copiar o meu link de convite"}
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        <button
          onClick={generateICS}
          className="w-full flex items-center justify-center gap-2 font-heading font-semibold text-[14px] text-ink-900 bg-background border border-ink-700 py-3 rounded-xl hover:bg-surface transition-colors"
        >
          📅 Guardar no calendário
        </button>
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
    </div>
  );
};

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
  const { premium, masterclass } = orderState;
  const total = getTotal(orderState);

  let title = "Premium Pass adicionado! Confirma o pagamento.";
  let plan = "premium";
  if (premium && masterclass) {
    title = "Excelente combinação! Confirma o pagamento.";
    plan = "premium-masterclass";
  } else if (masterclass) {
    title = "Masterclass adicionada! Confirma o pagamento.";
    plan = "masterclass";
  }

  return (
    <div className="max-w-[480px]">
      <h2 className="font-heading font-bold text-[22px] text-ink-900">{title}</h2>

      {/* Order summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-5 mb-5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 font-medium text-[14px] text-ink-700">
              <Check className="w-4 h-4 text-blue-600" /> Webinar ao vivo — 18 Fev · 10h00
            </span>
            <span className="text-[14px] text-ink-700">€0</span>
          </div>

          {premium && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-medium text-[14px] text-ink-700">
                <Check className="w-4 h-4 text-blue-600" /> Premium Pass
              </span>
              <span className="text-[14px] text-ink-700">€15</span>
            </div>
          )}

          {masterclass && (
            <>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 font-medium text-[14px] text-ink-700">
                  <Check className="w-4 h-4 text-blue-600" /> Masterclass Online
                </span>
                <span className="text-[14px] text-ink-700">€47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-ink-400 ml-6">+ IVA (Masterclass)</span>
                <span className="text-[13px] text-ink-400">€10,81</span>
              </div>
            </>
          )}

          <div className="h-px bg-border my-2" />

          <div className="flex justify-between items-center">
            <span className="font-heading font-bold text-[16px] text-ink-900">TOTAL</span>
            <span className="font-heading font-bold text-[16px] text-ink-900">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Pay button */}
      <button
        disabled={loading}
        onClick={() => onPay(plan)}
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

      <p className="text-center text-[12px] text-ink-400 mt-2">
        🔒 Pagamento seguro EuPago · Reembolso 14 dias
      </p>

      {error && <p className="text-center text-[14px] text-red-500 mt-3">{error}</p>}

      <p
        onClick={onBack}
        className="text-[13px] text-ink-400 cursor-pointer text-center mt-4 hover:underline"
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
