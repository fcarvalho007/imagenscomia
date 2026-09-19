import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { StepQualification } from "@/components/upgrade/StepQualification";
import { StepMasterclass } from "@/components/upgrade/StepMasterclass";
import { GravacaoConfirmation } from "@/components/upgrade/GravacaoConfirmation";
import { toast } from "sonner";
import { Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  resolveToken,
  clearToken,
  legacyRegLookup,
  legacyRegSaveStep,
  requestAccessLink,
  ACCESS_LINK_GENERIC_MESSAGE,
} from "@/lib/legacyAccess";
import { planGrossPrice, trackInitiateCheckout } from "@/lib/legacyPricing";

/* ── OrderState for gravacao funnel ── */
export interface GravacaoOrderState {
  gravacao: boolean;
  masterclass: boolean;
}

export const getGravacaoTotal = (o: GravacaoOrderState) =>
  (o.gravacao ? 33.21 : 0) + (o.masterclass ? 57.81 : 0);

export const formatPrice = (n: number) =>
  n === 0 ? "€0" : `€${n.toFixed(2).replace(".", ",")}`;

const stepVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const UpgradeGravacao = () => {
  usePageMeta({ title: "Upgrade — Pack Imagens com IA", description: "Adicione a Masterclass ao seu pack completo." });
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [orderState, setOrderState] = useState<GravacaoOrderState>({ gravacao: true, masterclass: false });
  const [userData, setUserData] = useState({
    nome: searchParams.get("name") || "",
    email: (searchParams.get("email") || "").toLowerCase().trim(),
    whatsapp: searchParams.get("whatsapp") || "",
    referralCode: searchParams.get("ref_code") || "",
  });
  // Access requires the existing token (URL ?t= or the one kept for this area).
  const initialToken = resolveToken("upgrade-gravacao", searchParams.get("t"));
  const [needsRecovery, setNeedsRecovery] = useState(!initialToken);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySent, setRecoverySent] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [otherSource, setOtherSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [editToken, setEditToken] = useState<string | null>(initialToken);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  // Hydrate from the token only; the lookup never returns the token itself.
  useEffect(() => {
    if (!editToken) return;
    let active = true;
    (async () => {
      try {
        const reg = await legacyRegLookup(editToken);
        if (!active) return;
        if (!reg) {
          clearToken("upgrade-gravacao");
          setEditToken(null);
          setNeedsRecovery(true);
          return;
        }
        setRegistrationId(reg.id);
        setUserData({
          nome: reg.name || `${reg.first_name || ""} ${reg.last_name || ""}`.trim(),
          email: reg.email,
          whatsapp: reg.whatsapp || "",
          referralCode: reg.referral_code || "",
        });
        setNeedsRecovery(false);
      } catch {
        if (!active) return;
        clearToken("upgrade-gravacao");
        setEditToken(null);
        setNeedsRecovery(true);
      }
    })();
    return () => { active = false; };
  }, [editToken]);

  /** Recovery never reveals data: the link is emailed to the registration. */
  const handleRecovery = useCallback(async () => {
    const trimmed = recoveryEmail.toLowerCase().trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setRecoveryError("Indique um email válido.");
      return;
    }
    setRecoveryLoading(true);
    setRecoveryError(null);
    try {
      await requestAccessLink(trimmed, "upgrade-gravacao");
      setRecoverySent(true);
    } catch {
      setRecoveryError("Erro de ligação. Tente novamente daqui a pouco.");
    } finally {
      setRecoveryLoading(false);
    }
  }, [recoveryEmail]);

  const saveStepData = useCallback(async (stepNum: number, extraData: Record<string, unknown> = {}) => {
    if (!editToken) return;
    try {
      await legacyRegSaveStep(editToken, "imagens", stepNum, extraData);
    } catch (err) {
      console.error("Error saving step data:", err);
    }
  }, [editToken]);

  const advanceStep = useCallback((next: number) => {
    setStep(next);
    if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePayment = useCallback(async (plan: string) => {
    if (!editToken) {
      toast.error("Sessão expirada. Peça uma nova ligação de acesso.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const actualPlan = orderState.masterclass ? "gravacao-masterclass" : "gravacao";
      await legacyRegSaveStep(editToken, "imagens", null, {
        sources: sources.join(", "),
      });

      const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
        body: { plan: actualPlan, editToken, nome: userData.nome },
      });

      if (fnError) throw fnError;
      if (!data?.paymentLink) throw new Error("Link de pagamento não recebido");

      trackInitiateCheckout(actualPlan, planGrossPrice(actualPlan));
      window.location.href = data.paymentLink;
    } catch (err) {
      console.error("Payment error:", err);
      setError("Erro ao processar pagamento. Tente novamente.");
      setLoading(false);
    }
  }, [editToken, userData.nome, sources, orderState]);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // (unused confirmationOrderState removed)

  if (needsRecovery) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px] bg-background rounded-2xl p-8 shadow-card-lg text-center"
        >
          <Mail className="w-10 h-10 text-blue-600 mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl text-ink-900 mb-2">
            Retomar a sua compra
          </h2>
          <p className="text-[15px] text-ink-500 mb-6">
            Introduza o email que usou para se inscrever.
          </p>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="O seu email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRecovery()}
              className="w-full bg-surface border border-border h-12 px-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm"
            />
            {recoveryError && <p className="text-sm text-red-500">{recoveryError}</p>}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={recoveryLoading}
              onClick={handleRecovery}
              className="w-full bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-base py-3.5 rounded-xl shadow-neon-purple transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {recoveryLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {recoveryLoading ? "A verificar..." : "Continuar"}
            </motion.button>
          </div>
        </motion.div>
        <WhatsAppSupportButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Mobile summary bar */}
      <div className="lg:hidden sticky top-0 z-50 h-12 bg-background border-b border-border px-4 flex items-center justify-between">
        <p className="font-medium text-[14px] text-ink-700">A sua compra</p>
        <span className="font-heading font-bold text-[16px] text-ink-900">
          {formatPrice(getGravacaoTotal(orderState))} <span className="text-[14px] text-ink-400">c/IVA</span>
        </span>
      </div>

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:min-h-screen">
        {/* Desktop left panel */}
        <aside className="hidden lg:flex flex-col sticky top-0 h-screen bg-background border-r border-border overflow-hidden" style={{ padding: "40px 24px" }}>
          <div>
            <p className="font-heading font-bold text-[16px] text-ink-900">Frederico Carvalho</p>
            <p className="text-[14px] text-ink-400">Formação em IA</p>
          </div>
          <div className="w-full h-px bg-border mt-5 mb-6" />
          <p className="font-heading font-semibold text-[14px] text-ink-400 uppercase tracking-[0.08em] mb-4">A SUA COMPRA</p>
          <div className="flex-1">
            <div className="flex justify-between items-start py-3 border-b border-border">
              <div>
                <p className="font-semibold text-[14px] text-ink-900">Sessão completa + Pack de Apoio</p>
                <p className="text-[14px] text-ink-400 mt-0.5">Acesso imediato</p>
              </div>
              <p className="font-heading font-bold text-[16px] text-ink-900">€27 <span className="text-[14px] font-normal text-ink-400">+ IVA</span></p>
            </div>
            {orderState.masterclass && (
              <div className="flex justify-between items-start py-3 border-b border-border">
                <div>
                  <p className="font-semibold text-[14px] text-ink-900">Masterclass Online</p>
                  <p className="text-[14px] text-ink-400 mt-0.5">3h · Online</p>
                </div>
                <p className="font-heading font-bold text-[14px] text-ink-900">€47 <span className="text-[14px] font-normal text-ink-400">+ IVA</span></p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: "2px solid hsl(var(--ink-900))" }}>
            <div className="flex justify-between items-center">
              <p className="font-heading font-bold text-[14px] text-ink-700 uppercase">TOTAL</p>
              <p className="font-heading font-extrabold text-[22px] text-ink-900">{formatPrice(getGravacaoTotal(orderState))}</p>
            </div>
          </div>
          <div className="mt-auto pt-5 border-t border-border">
            <p className="text-[14px] text-ink-400 leading-[1.8]">🔒 Pagamento seguro EuPago</p>
            <p className="text-[14px] text-ink-400 leading-[1.8]">📋 RGPD</p>
          </div>
        </aside>

        {/* Right content */}
        <div ref={contentRef} className="lg:overflow-y-auto lg:h-screen">
          <div className="px-4 pt-4 pb-24 sm:pt-6 lg:px-12 lg:pt-10 lg:pb-10">

            {/* Confirmation banner — step 2 */}
            {step === 2 && (
              <div className="max-w-[560px] mb-5 lg:mb-6 rounded-xl border border-green-200 bg-green-50 p-4 flex gap-3 items-start lg:relative max-lg:sticky max-lg:top-12 max-lg:z-40">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-bold text-[15px] text-green-800">Sessão + Pack de apoio garantidos</p>
                  <p className="text-[13px] text-green-700 mt-0.5">Acesso imediato · 27 € (c/ IVA)</p>
                  <p className="text-[13px] text-green-600 mt-1">Esta página é opcional: serve apenas para adicionar extras.</p>
                </div>
              </div>
            )}

            {/* Progress bar */}
            <div className="max-w-[560px] mb-5 lg:mb-8">
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%`, transition: "width 400ms ease" }} />
              </div>
              <p className="text-right text-[14px] text-ink-400 font-medium mt-1.5">
                Passo {step}/{totalSteps}{step === 2 && " — Melhoria opcional"}
              </p>
            </div>

            {/* Steps */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <StepQualification
                    sources={sources}
                    setSources={setSources}
                    otherSource={otherSource}
                    setOtherSource={setOtherSource}
                    onNext={() => {
                      const srcText = sources.length > 0 ? sources.join(", ") : "SKIPPED";
                      saveStepData(2, { sources: srcText });
                      advanceStep(2);
                    }}
                    userName={userData.nome}
                  />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <StepMasterclass
                    onAddMasterclass={() => {
                      setOrderState((s) => ({ ...s, masterclass: true }));
                      saveStepData(3, { plan_selected: "gravacao-masterclass" });
                      advanceStep(3);
                    }}
                    onSkip={() => {
                      saveStepData(3, { plan_selected: "gravacao" });
                      advanceStep(3);
                    }}
                  />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="s3" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <GravacaoConfirmation
                    orderState={orderState}
                    loading={loading}
                    error={error}
                    onPay={handlePayment}
                    onBack={() => setStep(2)}
                    userName={userData.nome}
                    userEmail={userData.email}
                    registrationId={registrationId || undefined}
                    editToken={editToken || undefined}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sticky mobile footer — step 2 */}
      {step === 2 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4">
          {orderState.masterclass ? (
            <>
              <button
                onClick={() => advanceStep(3)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[15px] py-3.5 rounded-xl transition-colors"
              >
                Continuar com Masterclass →
              </button>
              <button
                onClick={() => { saveStepData(3, { plan_selected: "gravacao" }); advanceStep(3); }}
                className="w-full text-center text-[13px] text-ink-400 mt-2 hover:text-ink-600 transition-colors"
              >
                Continuar só com o pack
              </button>
            </>
          ) : (
            <button
              onClick={() => { saveStepData(3, { plan_selected: "gravacao" }); advanceStep(3); }}
              className="w-full py-3.5 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 font-medium text-[14px] transition-colors"
            >
              Continuar só com o pack (27 €) →
            </button>
          )}
        </div>
      )}

      <WhatsAppSupportButton />
    </div>
  );
};

export default UpgradeGravacao;
