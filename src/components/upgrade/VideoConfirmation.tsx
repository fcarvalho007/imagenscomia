import { useState, useCallback } from "react";
import { Check, Loader2, Shield, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { InvoiceForm } from "./InvoiceForm";
import { supabase } from "@/integrations/supabase/client";

export interface VideoOrderState {
  videoPremium: boolean;
  masterclass: boolean;
}

export const getVideoTotal = (o: VideoOrderState) =>
  (o.videoPremium ? 18.45 : 0) + (o.masterclass ? 57.81 : 0);

export const formatVideoPrice = (n: number) =>
  n === 0 ? "€0" : `€${n.toFixed(2).replace(".", ",")}`;

interface Props {
  orderState: VideoOrderState;
  loading: boolean;
  error: string | null;
  onPay: (plan: string) => void;
  onBack: () => void;
  userName: string;
  userEmail?: string;
  registrationId?: string;
  editToken?: string;
}

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
      <h3 className="font-heading font-semibold text-[17px] text-ink-900 mb-1.5">Pagamento seguro</h3>
      <p className="text-[14px] text-ink-400 leading-relaxed">A redirecionar... Receberá confirmação por email.</p>
    </motion.div>
  </div>
);

export const VideoConfirmation = ({
  orderState, loading, error, onPay, onBack, userName, userEmail, registrationId, editToken,
}: Props) => {
  const [showRedirect, setShowRedirect] = useState(false);
  const [invoiceValid, setInvoiceValid] = useState(false);
  const [invoiceSaveError, setInvoiceSaveError] = useState(false);

  // Voucher state
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const total = getVideoTotal(orderState);
  const subtotalBase = (orderState.videoPremium ? 15 : 0) + (orderState.masterclass ? 47 : 0);
  const iva = total - subtotalBase;

  const plan = orderState.videoPremium && orderState.masterclass
    ? "video-bundle"
    : orderState.masterclass
      ? "video-masterclass"
      : "video-premium";

  const title = orderState.masterclass
    ? "Excelente combinação! Confirme o pagamento."
    : "Gravação + Pack — Confirme o pagamento.";

  const handleClick = () => {
    setShowRedirect(true);
    onPay(plan);
  };

  const handleRedeemVoucher = async () => {
    if (!userEmail || !voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("redeem-voucher", {
        body: { code: voucherCode.trim(), email: userEmail },
      });
      if (fnErr || !data?.success) {
        setVoucherError(data?.error || "Código inválido. Tenta novamente.");
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch {
      setVoucherError("Erro de ligação. Tenta novamente.");
    } finally {
      setVoucherLoading(false);
    }
  };

  const onValidChange = useCallback((valid: boolean) => setInvoiceValid(valid), []);
  const onSaveError = useCallback((hasErr: boolean) => setInvoiceSaveError(hasErr), []);

  return (
    <div className="max-w-[480px]">
      {showRedirect && <RedirectOverlay />}

      <h2 className="font-heading font-bold text-[24px] max-sm:text-[20px] text-ink-900">{title}</h2>

      {userEmail && (
        <div className="mt-5">
          <InvoiceForm
            userEmail={userEmail}
            registrationId={registrationId}
            editToken={editToken}
            onValidChange={onValidChange}
            onSaveError={onSaveError}
          />
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-5">
        <div className="space-y-2">
          {orderState.videoPremium && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-medium text-[15px] text-ink-700">
                <Check className="w-4 h-4 text-green-600" /> Gravação + Pack de Apoio
              </span>
              <span className="text-[15px] text-ink-700">€15 <span className="text-[14px] text-ink-400">+ IVA</span></span>
            </div>
          )}

          {orderState.masterclass && (
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
            <span className="font-medium text-[14px] text-ink-700">{formatVideoPrice(subtotalBase)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[14px] text-amber-600">IVA (23%)</span>
            <span className="font-semibold text-[14px] text-amber-600">{formatVideoPrice(iva)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between items-center">
            <span className="font-heading font-bold text-[16px] text-ink-900">TOTAL <span className="text-[14px] font-normal text-ink-400">(c/ IVA)</span></span>
            <span className="font-heading font-bold text-[16px] text-ink-900">{formatVideoPrice(total)}</span>
          </div>
        </div>
      </div>

      <button
        disabled={loading || !invoiceValid || invoiceSaveError}
        onClick={handleClick}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-heading font-bold text-[16px] py-4 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> A preparar pagamento...</>
        ) : (
          <>Confirmar e pagar {formatVideoPrice(total)} →</>
        )}
      </button>

      {!invoiceValid && (
        <p className="text-center text-[13px] text-amber-600 mt-2">Preencha os dados de faturação para continuar</p>
      )}

      {/* Voucher */}
      {!showVoucher ? (
        <p
          onClick={() => setShowVoucher(true)}
          className="text-center text-[12px] text-ink-300 mt-3 cursor-pointer hover:text-ink-500 transition-colors select-none"
        >
          <Tag size={11} className="inline mr-1 mb-0.5" />
          Tenho um voucher
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Código de voucher"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRedeemVoucher()}
            className="flex-1 border border-border rounded-lg px-3 py-2 text-[13px] bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleRedeemVoucher}
            disabled={voucherLoading || !voucherCode.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {voucherLoading ? <Loader2 size={13} className="animate-spin" /> : "Aplicar"}
          </button>
        </div>
      )}
      {voucherError && <p className="text-center text-[12px] text-red-500 mt-1.5">{voucherError}</p>}

      <p className="text-center text-[14px] text-ink-400 mt-3">🔒 Pagamento seguro EuPago</p>

      {error && <p className="text-center text-[14px] text-red-500 mt-3">{error}</p>}

      <p onClick={onBack} className="text-[14px] text-ink-400 cursor-pointer text-center mt-4 hover:underline">
        Voltar e alterar escolha
      </p>
    </div>
  );
};
