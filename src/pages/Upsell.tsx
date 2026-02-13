import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SummaryPanel, MobileSummaryBar } from "@/components/upgrade/SummaryPanel";
import { StepQualification } from "@/components/upgrade/StepQualification";
import { StepPersonalization } from "@/components/upgrade/StepPersonalization";
import { StepPremium } from "@/components/upgrade/StepPremium";
import { StepMasterclass } from "@/components/upgrade/StepMasterclass";
import { StepConfirmation } from "@/components/upgrade/StepConfirmation";

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
  const [userData] = useState({
    nome: searchParams.get("name") || "",
    email: (searchParams.get("email") || "").toLowerCase().trim(),
    whatsapp: searchParams.get("whatsapp") || "",
    referralCode: searchParams.get("ref_code") || "",
  });
  const [sources, setSources] = useState<string[]>([]);
  const [otherSource, setOtherSource] = useState("");
  const [duvida, setDuvida] = useState("");
  const [duvidas, setDuvidas] = useState<string[]>([]);
  const [outraDuvida, setOutraDuvida] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const saveStepData = useCallback(async (stepNum: number, extraData: Record<string, unknown> = {}) => {
    try {
      await supabase
        .from("registrations")
        .update({ step_reached: stepNum, ...extraData } as any)
        .eq("email", userData.email);
    } catch (err) {
      console.error("Error saving step data:", err);
    }
  }, [userData.email]);

  const advanceStep = useCallback((next: number) => {
    setStep(next);
    if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePayment = useCallback(async (plan: string) => {
    setLoading(true);
    setError(null);
    try {
      const planLabel = plan === "premium-masterclass" ? "bundle" : plan;
      // Save upgrade data to registrations
      await supabase
        .from("registrations")
        .update({
          plan_selected: planLabel,
          sources: sources.join(", "),
          duvida,
          upgrade_clicked_at: new Date().toISOString(),
        } as any)
        .eq("email", userData.email);

      // Create dynamic payment link via edge function
      const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
        body: { plan: planLabel, email: userData.email, nome: userData.nome },
      });

      if (fnError) throw fnError;
      if (!data?.paymentLink) throw new Error("Link de pagamento não recebido");

      const prices: Record<string, number> = { premium: 18.45, masterclass: 57.81, bundle: 76.26 };
      fbq('track', 'Purchase', { value: prices[planLabel] || 0, currency: 'EUR' });

      window.location.href = data.paymentLink;
    } catch (err) {
      console.error("Payment error:", err);
      setError("Erro ao processar pagamento. Tenta novamente.");
      setLoading(false);
    }
  }, [userData, sources, duvida]);

  const progress = (step / 5) * 100;
  const total = getTotal(orderState);

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
            {/* Progress bar */}
            <div className="max-w-[560px] mb-5 lg:mb-8">
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${progress}%`, transition: "width 400ms ease" }}
                />
              </div>
              <p className="text-right text-[14px] text-ink-400 font-medium mt-1.5">
                Passo {step} de 5
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
                    onSkip={() => {
                      saveStepData(2, { sources: "SKIPPED" });
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
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upsell;
