import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Shield, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

/* ───────── [1] Progress Bar ───────── */
const ProgressBar = () => (
  <div className="sticky top-0 z-50" style={{ backgroundColor: "hsl(var(--green-50))" }}>
    <div className="flex items-center justify-between px-3 py-2 md:px-5 md:py-2.5" style={{ borderBottom: "1px solid hsl(var(--green-100) / 0.6)" }}>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(var(--green-600))" }}>
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="font-heading font-semibold text-[13px]" style={{ color: "hsl(var(--green-700))" }}>
          Premium Pass confirmado
        </span>
      </div>
      <span className="text-[12px] hidden sm:inline" style={{ color: "hsl(var(--ink-400))" }}>
        Passo 2 de 3 — personalizar acesso
      </span>
    </div>
    <div className="w-full h-[2px]" style={{ backgroundColor: "hsl(var(--border))" }}>
      <div className="h-full" style={{ width: "66%", backgroundColor: "hsl(var(--green-600))" }} />
    </div>
  </div>
);

/* ───────── [2] Anchor Block ───────── */
const AnchorBlock = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.4 }}
    className="max-w-[560px] mx-auto px-4 pt-5 md:pt-9"
  >
    <div
      className="bg-background rounded-[10px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      style={{
        border: "1px solid hsl(var(--green-100) / 0.8)",
        borderLeft: "4px solid hsl(var(--green-600))",
        boxShadow: "0 1px 4px rgba(22,163,74,0.08)",
      }}
    >
      <div className="min-w-0">
        <p className="font-heading font-semibold text-[10px] uppercase tracking-[0.1em]" style={{ color: "hsl(var(--green-600))" }}>
          JÁ NO TEU PEDIDO
        </p>
        <p className="font-heading font-semibold text-[14px]" style={{ color: "hsl(var(--ink-900))" }}>
          Premium Pass · Webinar 18 Fev
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: "hsl(var(--ink-400))" }}>
          Gravação · Q&A · Guia · Early access
        </p>
      </div>
      <span className="font-heading font-bold text-[18px] shrink-0" style={{ color: "hsl(var(--ink-900))" }}>
        €15
      </span>
    </div>
  </motion.div>
);

/* ───────── [3A] Masterclass Card ───────── */
const MasterclassCard = ({
  loading,
  payingPlan,
  onPay,
}: {
  loading: boolean;
  payingPlan: string | null;
  onPay: () => void;
}) => (
  <div
    className="bg-background rounded-2xl p-4 md:p-8 flex flex-col relative h-full"
    style={{
      border: "2px solid hsl(var(--blue-600))",
      boxShadow: "0 8px 32px rgba(37,99,235,0.12)",
    }}
  >
    {/* Badge */}
    <span
      className="absolute -top-3 left-7 font-heading font-bold text-[10px] uppercase tracking-[0.1em] text-white px-3.5 py-1 rounded-full"
      style={{ backgroundColor: "hsl(var(--blue-600))" }}
    >
      RECOMENDADO
    </span>

    {/* Header */}
    <p className="font-heading font-semibold text-[11px] uppercase tracking-[0.08em] mt-2 mb-1" style={{ color: "hsl(var(--blue-600))" }}>
      MASTERCLASS ONLINE
    </p>
    <h3 className="font-heading font-extrabold text-[20px] md:text-[22px]" style={{ color: "hsl(var(--ink-900))" }}>
      Implementação Completa
    </h3>
    <p className="text-[13px] mt-1 mb-5" style={{ color: "hsl(var(--ink-400))" }}>
      25 Fevereiro, 10:30–11:30 · Online · Máx. 30 participantes
    </p>

    {/* Price block */}
    <div
      className="rounded-xl p-4 mb-5"
      style={{
        backgroundColor: "hsl(var(--blue-50))",
        border: "1px solid hsl(var(--blue-100))",
      }}
    >
      <div>
          <p className="text-[11px] uppercase mb-1" style={{ color: "hsl(var(--ink-400))" }}>
            A ACRESCENTAR AO TEU PEDIDO
          </p>
          <span className="font-heading font-black text-[28px] md:text-[40px] leading-none" style={{ color: "hsl(var(--blue-600))" }}>
            +€37
          </span>
          <p className="text-[14px] font-medium mt-1" style={{ color: "hsl(var(--ink-700))" }}>
            Total: €52 · inclui IVA
          </p>
        </div>
    </div>

    <div className="w-full h-px my-3 md:my-5" style={{ backgroundColor: "hsl(var(--border))" }} />

    {/* Bullets */}
    <div className="space-y-3 mb-3 md:mb-5 flex-1">
      {[
        { title: "50 prompts testados — por tipo de imagem, prontos a usar", sub: "" },
        { title: "Gravação vitalícia + certificado Professor FEUC", sub: "Rever quando precisares. Válido para curriculum." },
      ].map((b) => (
        <div key={b.title} className="flex gap-2.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "hsl(var(--blue-600))" }}>
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
          <div>
            <p className="text-[14px] font-semibold" style={{ color: "hsl(var(--ink-900))" }}>{b.title}</p>
            <p className="text-[13px]" style={{ color: "hsl(var(--ink-500))" }}>{b.sub}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="w-full h-px my-3 md:my-5" style={{ backgroundColor: "hsl(var(--border))" }} />

    {/* Urgency */}
    <div className="rounded-lg p-3 mb-3 md:mb-5 text-center" style={{ backgroundColor: "rgba(239,246,255,0.6)" }}>
      <p className="text-[13px] font-medium" style={{ color: "hsl(var(--blue-700))" }}>
        ⏰ Preço sobe para €47 depois do webinar (18 Fev)
      </p>
    </div>

    {/* CTA */}
    <button
      disabled={loading}
      onClick={onPay}
      className="w-full text-white font-heading font-bold text-[15px] md:text-[16px] py-3.5 md:py-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{
        backgroundColor: "hsl(var(--blue-600))",
        boxShadow: "0 4px 16px rgba(37,99,235,0.30)",
      }}
    >
      {payingPlan === "masterclass" ? (
        <><Loader2 className="w-5 h-5 animate-spin" /> A preparar pagamento...</>
      ) : (
        <>Adicionar Masterclass — pagar €52 →</>
      )}
    </button>
    <p className="text-center text-[12px] mt-2" style={{ color: "hsl(var(--ink-400))" }}>
      🔒 Reembolso completo até 14 dias. Sem perguntas.
    </p>
  </div>
);

/* ───────── [3B] Workshop Card ───────── */
const WorkshopCard = ({
  loading,
  payingPlan,
  onPay,
  onBundleClick,
}: {
  loading: boolean;
  payingPlan: string | null;
  onPay: () => void;
  onBundleClick: () => void;
}) => (
  <div
    className="bg-background rounded-2xl p-4 md:p-6 flex flex-col relative h-full"
    style={{
      border: "1px solid hsl(var(--border))",
      borderTop: "3px solid #D97706",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    }}
  >
    {/* Badge */}
    <span
      className="absolute -top-3 right-5 font-heading font-semibold text-[10px] uppercase px-3 py-1 rounded-full"
      style={{
        backgroundColor: "#FFFBEB",
        border: "1px solid #D97706",
        color: "#92400E",
      }}
    >
      PRESENCIAL
    </span>

    {/* Header */}
    <p className="font-heading font-semibold text-[11px] uppercase tracking-[0.08em] mt-2 mb-1" style={{ color: "#92400E" }}>
      WORKSHOP 1 DIA
    </p>
    <h3 className="font-heading font-bold text-[18px]" style={{ color: "hsl(var(--ink-900))" }}>
      Implementação Hands-On
    </h3>
    <p className="text-[12px] mt-1 mb-4" style={{ color: "hsl(var(--ink-400))" }}>
      28 Março · Lisboa · Máx. 15
    </p>

    {/* Price block */}
    <div
      className="rounded-xl p-3.5 mb-4"
      style={{
        backgroundColor: "#FFFBEB",
        border: "1px solid rgba(217,119,6,0.20)",
      }}
    >
      <span className="font-heading font-extrabold text-[26px] md:text-[32px] leading-none" style={{ color: "hsl(var(--ink-900))" }}>
        +€497
      </span>
      <p className="text-[13px] font-medium mt-1" style={{ color: "hsl(var(--ink-700))" }}>
        Total: €512 · inclui IVA
      </p>
      <p className="text-[12px] mt-0.5" style={{ color: "#D97706" }}>
        Founder pricing · sobe €697 na 2ª edição
      </p>
    </div>

    <div className="w-full h-px my-3 md:my-4" style={{ backgroundColor: "hsl(var(--border))" }} />

    {/* Bullets */}
    <ul className="space-y-2.5 mb-3 md:mb-4 flex-1">
      {[
        "8h de formação e implementação real em sala",
        "Sistema completo configurado no próprio dia",
        "Ferramentas intermédias e avançadas de automação (Zapier, n8n, outras)",
      ].map((f) => (
        <li key={f} className="flex items-start gap-2 text-[14px]" style={{ color: "hsl(var(--ink-700))" }}>
          <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#D97706" }} />
          <span>{f}</span>
        </li>
      ))}
    </ul>

    {/* Vagas note */}
    <div className="rounded-lg p-2.5 mt-3 text-center" style={{ backgroundColor: "#FFFBEB" }}>
      <p className="text-[12px] font-medium" style={{ color: "#92400E" }}>
        🤝 Só 15 vagas
      </p>
    </div>

    {/* CTA */}
    <button
      disabled={loading}
      onClick={onPay}
      className="w-full text-white font-heading font-bold text-[15px] py-3 rounded-xl transition-all mt-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{ backgroundColor: "hsl(var(--ink-900))" }}
    >
      {payingPlan === "workshop" ? (
        <><Loader2 className="w-5 h-5 animate-spin" /> A preparar pagamento...</>
      ) : (
        <>Reservar Workshop — €512 →</>
      )}
    </button>

    {/* Bundle link */}
    <button
      onClick={onBundleClick}
      className="w-full text-center text-[12px] font-medium mt-2.5 bg-transparent border-none cursor-pointer hover:underline"
      style={{ color: "hsl(var(--blue-600))" }}
    >
      Quer os dois por €524? Poupa €25 →
    </button>
  </div>
);

/* ───────── [4] Skip Line ───────── */
const SkipLine = ({
  loading,
  payingPlan,
  onPay,
}: {
  loading: boolean;
  payingPlan: string | null;
  onPay: () => void;
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="max-w-[900px] mx-auto px-4 pt-5 pb-1 text-center">
      <div className="flex items-center justify-center gap-4">
        {!isMobile && <div className="flex-grow h-px" style={{ backgroundColor: "hsl(var(--border))" }} />}
        <button
          disabled={loading}
          onClick={onPay}
          className="text-[14px] bg-transparent border-none cursor-pointer hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: payingPlan === "premium" ? "hsl(var(--ink-700))" : "hsl(var(--ink-400))" }}
        >
          {payingPlan === "premium" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> A preparar pagamento...
            </span>
          ) : (
            "Não, obrigado — confirmar só o Premium"
          )}
        </button>
        {!isMobile && <div className="flex-grow h-px" style={{ backgroundColor: "hsl(var(--border))" }} />}
      </div>
      {!isMobile && (
        <p className="text-[12px] mt-1.5" style={{ color: "hsl(var(--ink-400))" }}>
          Podes sempre adicionar a Masterclass depois do webinar (mas custará €47)
        </p>
      )}
    </div>
  );
};

/* ───────── [5] Bundle Block ───────── */
const BundleBlock = ({ onBundleClick }: { onBundleClick: () => void }) => (
  <div className="max-w-[600px] mx-auto px-4 pt-4 pb-6 md:pt-6 md:pb-8 text-center">
    <div
      className="rounded-[14px] p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      style={{
        backgroundColor: "hsl(var(--off-white))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <div className="text-left">
        <p className="font-heading font-bold text-[16px]" style={{ color: "hsl(var(--ink-900))" }}>
          Quer tudo junto?
        </p>
        <p className="text-[14px] mt-1" style={{ color: "hsl(var(--ink-500))" }}>
          Masterclass + Workshop por €524 — poupa €25
        </p>
      </div>
      <button
        onClick={onBundleClick}
        className="font-heading font-bold text-[14px] px-5 py-3 rounded-xl bg-background transition-colors hover:bg-blue-50 shrink-0 cursor-pointer sm:w-auto w-full"
        style={{
          border: "2px solid hsl(var(--blue-600))",
          color: "hsl(var(--blue-600))",
        }}
      >
        Bundle €524 →
      </button>
    </div>
  </div>
);

/* ───────── Bundle Modal (kept) ───────── */
const BundleModal = ({
  open,
  onClose,
  loading,
  payingPlan,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  payingPlan: string | null;
  onConfirm: () => void;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center px-4"
        style={{ backgroundColor: "hsl(var(--ink-900) / 0.7)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background max-w-[420px] w-full rounded-xl p-5 md:p-7 shadow-card-lg relative max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-4 right-4 hover:opacity-70" style={{ color: "hsl(var(--ink-400))" }}>
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-heading font-bold text-[20px] mb-4" style={{ color: "hsl(var(--ink-900))" }}>
            Masterclass + Workshop
          </h3>

          <div className="rounded-lg p-4 mb-4 space-y-2 text-[14px]" style={{ backgroundColor: "hsl(var(--off-white))" }}>
            <div className="flex justify-between"><span style={{ color: "hsl(var(--ink-700))" }}>Premium Pass</span><span className="font-medium" style={{ color: "hsl(var(--ink-900))" }}>€15</span></div>
            <div className="flex justify-between"><span style={{ color: "hsl(var(--ink-700))" }}>Masterclass Online</span><span className="font-medium" style={{ color: "hsl(var(--ink-900))" }}>€37</span></div>
            <div className="flex justify-between"><span style={{ color: "hsl(var(--ink-700))" }}>Workshop Presencial</span><span className="font-medium" style={{ color: "hsl(var(--ink-900))" }}>€497</span></div>
            <div className="w-full h-px" style={{ backgroundColor: "hsl(var(--border))" }} />
            <div className="flex justify-between" style={{ color: "hsl(var(--ink-400))" }}><span>Subtotal</span><span>€549</span></div>
            <div className="flex justify-between font-medium" style={{ color: "hsl(var(--green-600))" }}><span>✓ Desconto bundle</span><span>−€25</span></div>
            <div className="w-full h-px" style={{ backgroundColor: "hsl(var(--border))" }} />
            <div className="flex justify-between font-heading font-bold text-[18px]" style={{ color: "hsl(var(--ink-900))" }}><span>TOTAL</span><span>€524</span></div>
          </div>

          <ul className="space-y-1.5 text-[13px] mb-5" style={{ color: "hsl(var(--ink-500))" }}>
            <li>• Webinar ao vivo 18 Fev + Premium Pass completo</li>
            <li>• Masterclass online — 25 Fev, 10:30h</li>
            <li>• Workshop 8h presencial Lisboa — 28 Mar</li>
          </ul>

          <button
            disabled={loading}
            onClick={onConfirm}
            className="w-full text-white font-heading font-bold text-[16px] py-4 rounded-xl shadow-blue transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: "hsl(var(--blue-600))" }}
          >
            {payingPlan === "bundle" ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> A preparar pagamento...</>
            ) : (
              <>Confirmar bundle — €524</>
            )}
          </button>
          <button onClick={onClose} className="w-full text-center text-[13px] mt-3 bg-transparent border-none cursor-pointer hover:opacity-70" style={{ color: "hsl(var(--ink-400))" }}>
            Voltar e escolher separado
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ───────── [6] Micro Footer ───────── */
const MicroFooter = () => (
  <footer className="py-5 px-4 text-center" style={{ backgroundColor: "hsl(var(--off-white))", borderTop: "1px solid hsl(var(--border))" }}>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 text-[13px] mb-2" style={{ color: "hsl(var(--ink-400))" }}>
      <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Pagamento seguro EuPago</span>
      <span>📋 Dados protegidos RGPD</span>
      <span>↩ Reembolso 14 dias sem perguntas</span>
    </div>
    <p className="text-[12px]" style={{ color: "hsl(var(--ink-400))" }}>Questões? frederico@digitalfc.pt</p>
  </footer>
);

/* ───────── [7] Sticky Checkout Bar ───────── */
const StickyCheckoutBar = ({
  loading,
  payingPlan,
  onPay,
}: {
  loading: boolean;
  payingPlan: string | null;
  onPay: () => void;
}) => (
  <div
    className="fixed bottom-0 left-0 right-0 z-50"
    style={{
      backgroundColor: "hsl(var(--background))",
      borderTop: "1px solid hsl(var(--border))",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
    }}
  >
    <div className="max-w-[600px] mx-auto px-4 py-3 flex items-center justify-between gap-4" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
      <div className="min-w-0">
        <p className="font-heading font-semibold text-[13px] truncate" style={{ color: "hsl(var(--ink-900))" }}>
          Premium Pass · €15
        </p>
        <p className="text-[11px]" style={{ color: "hsl(var(--ink-400))" }}>
          Gravação · Q&A · Guia
        </p>
      </div>
      <button
        disabled={loading}
        onClick={onPay}
        className="shrink-0 text-white font-heading font-bold text-[14px] px-5 py-3 rounded-xl transition-all disabled:opacity-60 flex items-center gap-2"
        style={{
          backgroundColor: "hsl(var(--blue-600))",
          boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
        }}
      >
        {payingPlan === "premium" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> A pagar...</>
        ) : (
          <>Confirmar e Pagar</>
        )}
      </button>
    </div>
  </div>
);
/* ═════════ Main Page ═════════ */
const Upsell = () => {
  const [searchParams] = useSearchParams();
  const userName = searchParams.get("name") || "";
  const userEmail = searchParams.get("email") || "";
  const [isBundleOpen, setIsBundleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payingPlan, setPayingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (plan: string) => {
    setLoading(true);
    setPayingPlan(plan);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
        body: { plan, email: userEmail, nome: userName },
      });
      if (fnError) throw fnError;
      if (data?.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error("Link de pagamento não recebido");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Erro ao processar pagamento. Tenta novamente.");
      setLoading(false);
      setPayingPlan(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "hsl(var(--off-white))" }}>
      <ProgressBar />
      <AnchorBlock />

      {/* [3] Recommendation Section */}
      <section className="max-w-[900px] mx-auto px-4 pt-6 md:pt-10">
        <div className="text-center mb-5 md:mb-8">
          <h2 className="font-heading font-bold text-[20px] md:text-[28px]" style={{ color: "hsl(var(--ink-900))" }}>
            O webinar cobre o método.
          </h2>
          <p className="text-[16px] mt-1.5" style={{ color: "hsl(var(--ink-500))" }}>
            A Masterclass implementa-o na tua empresa.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 lg:gap-5 items-stretch">
          <MasterclassCard
            loading={loading}
            payingPlan={payingPlan}
            onPay={() => handlePayment("masterclass")}
          />
          <WorkshopCard
            loading={loading}
            payingPlan={payingPlan}
            onPay={() => handlePayment("workshop")}
            onBundleClick={() => setIsBundleOpen(true)}
          />
        </div>
      </section>

      {error && <p className="text-center text-sm mt-4" style={{ color: "hsl(var(--red-500))" }}>{error}</p>}

      <SkipLine
        loading={loading}
        payingPlan={payingPlan}
        onPay={() => handlePayment("premium")}
      />

      <BundleBlock onBundleClick={() => setIsBundleOpen(true)} />

      <MicroFooter />

      {/* Bottom padding for sticky bar */}
      <div className="h-24" />

      <StickyCheckoutBar
        loading={loading}
        payingPlan={payingPlan}
        onPay={() => handlePayment("premium")}
      />

      <BundleModal
        open={isBundleOpen}
        onClose={() => setIsBundleOpen(false)}
        loading={loading}
        payingPlan={payingPlan}
        onConfirm={() => handlePayment("bundle")}
      />
    </div>
  );
};

export default Upsell;
