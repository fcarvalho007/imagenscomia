import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { OrderState } from "@/pages/Upsell";
import { formatPrice } from "@/pages/Upsell";

interface Props {
  orderState: OrderState;
  total: number;
  onRemove?: (item: "premium" | "masterclass") => void;
}

const lineVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/* ═══ Desktop Panel ═══ */
export const SummaryPanel = ({ orderState, total, onRemove }: Props) => {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 400);
    return () => clearTimeout(t);
  }, [total]);

  return (
    <aside className="hidden lg:flex flex-col sticky top-0 h-screen bg-background border-r border-border overflow-hidden"
      style={{ padding: "40px 24px" }}>
      {/* Header */}
      <div>
        <p className="font-heading font-bold text-[16px] text-ink-900">Frederico Carvalho</p>
        <p className="text-[14px] text-ink-400">Formação em IA</p>
      </div>

      <div className="w-full h-px bg-border mt-5 mb-6" />

      {/* Section title */}
      <p className="font-heading font-semibold text-[14px] text-ink-400 uppercase tracking-[0.08em] mb-4">
        A TUA INSCRIÇÃO
      </p>

      {/* Order lines */}
      <div className="flex-1">
        {/* Line 1 — always visible */}
        <div className="flex justify-between items-start py-3 border-b border-border">
          <div>
            <p className="font-semibold text-[14px] text-ink-900">Webinar Gratuito</p>
            <p className="text-[14px] text-ink-400 mt-0.5">18 Fev · 10h00</p>
          </div>
          <div className="text-right">
            <p className="font-heading font-bold text-[16px] text-ink-900">€0</p>
            <p className="text-[14px] text-green-600 mt-0.5">Gratuito</p>
          </div>
        </div>

        {/* Line 2 — Premium */}
        <AnimatePresence>
          {orderState.premium && (
            <motion.div variants={lineVariants} initial="initial" animate="animate"
              className="flex justify-between items-start py-3 border-b border-border">
              <div>
                <p className="font-semibold text-[14px] text-ink-900">Premium Pass</p>
                <p className="text-[14px] text-ink-400 mt-0.5">Gravação + Q&A + Guia</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-heading font-bold text-[14px] text-ink-900">€15 <span className="text-[14px] font-normal text-ink-400">+ IVA</span></p>
                <Trash2 className="w-4 h-4 text-ink-400 hover:text-red-500 cursor-pointer transition-colors duration-150" onClick={() => onRemove?.("premium")} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Line 3 — Masterclass */}
        <AnimatePresence>
          {orderState.masterclass && (
            <motion.div variants={lineVariants} initial="initial" animate="animate">
              <div className="flex justify-between items-start py-3 border-b border-border">
                <div>
                  <p className="font-semibold text-[14px] text-ink-900">Masterclass Online</p>
                  <p className="text-[14px] text-ink-400 mt-0.5">3h · Online · Máx. 30</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-heading font-bold text-[14px] text-ink-900">€47 <span className="text-[14px] font-normal text-ink-400">+ IVA</span></p>
                  <Trash2 className="w-4 h-4 text-ink-400 hover:text-red-500 cursor-pointer transition-colors duration-150" onClick={() => onRemove?.("masterclass")} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Total */}
      <div className="mt-4 pt-4" style={{ borderTop: "2px solid hsl(var(--ink-900))" }}>
        <div className="flex justify-between items-center">
          <p className="font-heading font-bold text-[14px] text-ink-700 uppercase">TOTAL</p>
          <p
            className="font-heading font-extrabold text-[22px] text-ink-900 rounded px-2 py-0.5 transition-colors duration-400"
            style={{ backgroundColor: flash ? "hsl(var(--blue-50))" : "transparent" }}
          >
            {formatPrice(total)}
          </p>
        </div>
      </div>

      {/* Security block */}
      <div className="mt-auto pt-5 border-t border-border">
        <p className="text-[14px] text-ink-400 leading-[1.8]">🔒 Pagamento seguro EuPago</p>
        <p className="text-[14px] text-ink-400 leading-[1.8]">📋 RGPD</p>
      </div>
    </aside>
  );
};

/* ═══ Mobile Bar ═══ */
export const MobileSummaryBar = ({ orderState, total }: Props) => {
  const showIVA = orderState.masterclass || orderState.premium;
  const isFree = !orderState.premium && !orderState.masterclass;

  return (
    <div className="lg:hidden sticky top-0 z-50 h-12 bg-background border-b border-border px-4 flex items-center justify-between">
      <p className="font-medium text-[14px] text-ink-700">A tua inscrição</p>
      <div className="text-right">
        {isFree ? (
          <span className="font-heading font-bold text-[14px] text-green-600">Inscrição gratuita confirmada</span>
        ) : (
          <>
            <span className="font-heading font-bold text-[16px] text-ink-900">{formatPrice(total)}</span>
            {showIVA && <span className="text-[14px] text-ink-400 ml-1">c/IVA</span>}
          </>
        )}
      </div>
    </div>
  );
};
