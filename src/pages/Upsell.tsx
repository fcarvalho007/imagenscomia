import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SummaryPanel, MobileSummaryBar } from "@/components/upgrade/SummaryPanel";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { StepQualification } from "@/components/upgrade/StepQualification";
import { StepPersonalization } from "@/components/upgrade/StepPersonalization";
import { StepPremium } from "@/components/upgrade/StepPremium";
import { StepMasterclass } from "@/components/upgrade/StepMasterclass";
import { StepConfirmation } from "@/components/upgrade/StepConfirmation";
import { toast } from "sonner";
import { Mail, Loader2, ArrowRight, CheckCircle2, Check } from "lucide-react";
import {
  resolveToken,
  clearToken,
  legacyRegLookup,
  legacyRegSaveStep,
  requestAccessLink,
  ACCESS_LINK_GENERIC_MESSAGE,
} from "@/lib/legacyAccess";
import { planGrossPrice, trackInitiateCheckout } from "@/lib/legacyPricing";

export interface OrderState {
  premium: boolean;
  masterclass: boolean;
}

export const getTotal = (o: OrderState) =>
  (o.premium ? 18.45 : 0) + (o.masterclass ? 57.81 : 0);

export const formatPrice = (n: number) =>
  n === 0 ? "€0" : `€${n.toFixed(2).replace(".", ",")}`;

const stepVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const Upsell = () => {
  usePageMeta({ title: "Upgrade — Webinar Imagens com IA", description: "Escolhe o teu plano e garante acesso Premium ou Masterclass." });
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [orderState, setOrderState] = useState<OrderState>({ premium: false, masterclass: false });
  const [userData, setUserData] = useState({
    nome: searchParams.get("name") || "",
    email: (searchParams.get("email") || "").toLowerCase().trim(),
    whatsapp: searchParams.get("whatsapp") || "",
    referralCode: searchParams.get("ref_code") || "",
  });
  // Access requires the existing token (URL ?t= or the one kept for this area).
  const initialToken = resolveToken("upgrade", searchParams.get("t"));
  const [needsRecovery, setNeedsRecovery] = useState(!initialToken);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySent, setRecoverySent] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [otherSource, setOtherSource] = useState("");
  const [duvida, setDuvida] = useState("");
  const [duvidas, setDuvidas] = useState<string[]>([]);
  const [outraDuvida, setOutraDuvida] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [editToken, setEditToken] = useState<string | null>(initialToken);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  // Hydrate the funnel from the token. The lookup never returns the token
  // itself and an email alone can never open this page.
  useEffect(() => {
    if (!editToken) return;
    let active = true;
    (async () => {
      try {
        const reg = await legacyRegLookup(editToken);
        if (!active) return;
        if (!reg) {
          clearToken("upgrade");
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
        if (reg.step_reached && reg.step_reached > 1) setStep(reg.step_reached);
        if (reg.plan_selected === "premium") setOrderState({ premium: true, masterclass: false });
        else if (reg.plan_selected === "masterclass") setOrderState({ premium: false, masterclass: true });
        else if (reg.plan_selected === "bundle") setOrderState({ premium: true, masterclass: true });
        setNeedsRecovery(false);
      } catch {
        if (!active) return;
        clearToken("upgrade");
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
      await requestAccessLink(trimmed, "upgrade");
      setRecoverySent(true);
    } catch {
      setRecoveryError("Erro de ligação. Tenta novamente daqui a pouco.");
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
      toast.error("Sessão expirada. Pede uma nova ligação de acesso.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const planLabel = plan === "premium-masterclass" ? "bundle" : plan;
      // Only whitelisted qualification fields; the plan and entitlements are
      // decided server-side by the payment function.
      await legacyRegSaveStep(editToken, "imagens", null, {
        sources: sources.join(", "),
        duvida,
      });

      const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
        body: { plan: planLabel, editToken, nome: userData.nome },
      });

      if (fnError) throw fnError;
      if (!data?.paymentLink) throw new Error("Link de pagamento não recebido");

      trackInitiateCheckout(planLabel, planGrossPrice(planLabel));
      window.location.href = data.paymentLink;
    } catch (err) {
      console.error("Payment error:", err);
      setError("Erro ao processar pagamento. Tenta novamente.");
      setLoading(false);
    }
  }, [editToken, userData.nome, sources, duvida]);

  const progress = (step / 5) * 100;
  const total = getTotal(orderState);

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
            Retomar o teu upgrade
          </h2>
          <p className="text-[15px] text-ink-500 mb-6">
            Introduz o email que usaste para te inscreveres.
          </p>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="O teu email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRecovery()}
              className="w-full bg-surface border border-border h-12 px-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm"
            />
            {recoveryError && (
              <p className="text-sm text-red-500">{recoveryError}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={recoveryLoading}
              onClick={handleRecovery}
              className="w-full bg-gradient-to-r from-neon-purple to-blue-600 text-white font-heading font-bold text-base py-3.5 rounded-xl shadow-neon-purple transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {recoveryLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
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
      <MobileSummaryBar orderState={orderState} total={total} />

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:min-h-screen">
        {/* Desktop left panel */}
        <SummaryPanel orderState={orderState} total={total} onRemove={(item) => setOrderState(s => ({ ...s, [item]: false }))} />

        {/* Right content */}
        <div ref={contentRef} className="lg:overflow-y-auto lg:h-screen">
          <div className="px-4 pt-4 pb-24 sm:pt-6 lg:px-12 lg:pt-10 lg:pb-10">

            {/* Confirmation banner — steps 3-4 */}
            {step >= 3 && step <= 4 && (
              <div className="max-w-[560px] mb-5 lg:mb-6 rounded-xl border border-green-200 bg-green-50 p-4 flex gap-3 items-start lg:relative max-lg:sticky max-lg:top-12 max-lg:z-40">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-bold text-[15px] text-green-800">Vaga garantida no Webinar Gratuito</p>
                  <p className="text-[13px] text-green-700 mt-0.5">18 Fev · 10h00 · 60 min · Online ao vivo</p>
                  <p className="text-[13px] text-green-600 mt-1">Esta página é opcional: serve apenas para adicionar extras.</p>
                </div>
              </div>
            )}

            {/* Progress bar */}
            <div className="max-w-[560px] mb-5 lg:mb-8">
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${progress}%`, transition: "width 400ms ease" }}
                />
              </div>
              <p className="text-right text-[14px] text-ink-400 font-medium mt-1.5">
                Passo {step}/5{(step === 3 || step === 4) && " — Melhorias opcionais"}
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
                  <StepPersonalization
                    duvidas={duvidas}
                    setDuvidas={setDuvidas}
                    outraDuvida={outraDuvida}
                    setOutraDuvida={setOutraDuvida}
                    setDuvida={setDuvida}
                    onNext={() => {
                      const duvidaText = duvida || (duvidas.length > 0 ? duvidas.join(", ") : "SKIPPED");
                      saveStepData(3, { duvida: duvidaText });
                      advanceStep(3);
                    }}
                    onSkip={() => {
                      saveStepData(3, { duvida: "SKIPPED" });
                      advanceStep(3);
                    }}
                  />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="s3" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <StepPremium
                    userName={userData.nome}
                    onAddPremium={() => {
                      setOrderState((s) => ({ ...s, premium: true }));
                      saveStepData(4, { plan_selected: "premium" });
                      advanceStep(4);
                    }}
                    onSkip={() => {
                      saveStepData(4);
                      advanceStep(4);
                    }}
                  />
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="s4" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <StepMasterclass
                    onAddMasterclass={() => {
                      setOrderState((s) => ({ ...s, masterclass: true }));
                      const newPlan = orderState.premium ? "bundle" : "masterclass";
                      saveStepData(5, { plan_selected: newPlan });
                      advanceStep(5);
                    }}
                    onSkip={() => {
                      saveStepData(5);
                      advanceStep(5);
                    }}
                  />
                </motion.div>
              )}
              {step === 5 && (
                <motion.div key="s5" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <StepConfirmation
                    orderState={orderState}
                    loading={loading}
                    error={error}
                    onPay={handlePayment}
                    onBack={() => setStep(3)}
                    userName={userData.nome}
                    referralCode={userData.referralCode}
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

      {/* Sticky mobile footer — steps 3-4 */}
      {(step === 3 || step === 4) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4">
          {(orderState.premium || orderState.masterclass) ? (
            <>
              <button
                onClick={() => advanceStep(step + 1)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[15px] py-3.5 rounded-xl transition-colors"
              >
                Continuar com upgrade →
              </button>
              <button
                onClick={() => advanceStep(step + 1)}
                className="w-full text-center text-[13px] text-ink-400 mt-2 hover:text-ink-600 transition-colors"
              >
                Continuar com inscrição gratuita
              </button>
            </>
          ) : (
            <button
              onClick={step === 3
                ? () => { saveStepData(4); advanceStep(4); }
                : () => { saveStepData(5); advanceStep(5); }
              }
              className="w-full py-3.5 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 font-medium text-[14px] transition-colors"
            >
              Continuar com inscrição gratuita →
            </button>
          )}
        </div>
      )}

      <WhatsAppSupportButton />
    </div>
  );
};

export default Upsell;
