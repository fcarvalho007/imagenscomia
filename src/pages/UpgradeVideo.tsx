import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { StepQualification } from "@/components/upgrade/StepQualification";
import { StepVideoPremium } from "@/components/upgrade/StepVideoPremium";
import { StepMasterclass } from "@/components/upgrade/StepMasterclass";
import { VideoConfirmation, type VideoOrderState, getVideoTotal, formatVideoPrice } from "@/components/upgrade/VideoConfirmation";
import { toast } from "sonner";
import { Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

const stepVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const UpgradeVideo = () => {
  usePageMeta({ title: "Upgrade — Webinar Vídeo com IA", description: "Adicione a gravação e a Masterclass ao seu pack." });
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [orderState, setOrderState] = useState<VideoOrderState>({ videoPremium: false, masterclass: false });
  const [userData, setUserData] = useState({
    nome: searchParams.get("name") || "",
    email: (searchParams.get("email") || "").toLowerCase().trim(),
    whatsapp: searchParams.get("whatsapp") || "",
    referralCode: searchParams.get("ref_code") || "",
  });
  const [needsRecovery, setNeedsRecovery] = useState(!searchParams.get("email"));
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [otherSource, setOtherSource] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [editToken, setEditToken] = useState<string | null>(searchParams.get("t") || null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const handleRecovery = useCallback(async () => {
    const trimmed = recoveryEmail.toLowerCase().trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setRecoveryError("Indique um email válido.");
      return;
    }
    setRecoveryLoading(true);
    setRecoveryError(null);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("id, name, first_name, last_name, edit_token, sources, role, team_size, step_reached, plan_selected")
        .eq("email", trimmed)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setRecoveryError("Email não encontrado. Inscreva-se primeiro na página do vídeo.");
        setRecoveryLoading(false);
        return;
      }

      setRegistrationId(data.id);
      setEditToken((data as any).edit_token || null);
      setUserData({
        nome: data.name || `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: trimmed,
        whatsapp: "",
        referralCode: "",
      });
      // Restore qualification data if available
      if ((data as any).role) setRole((data as any).role);
      if ((data as any).team_size) setTeamSize((data as any).team_size);
      if ((data as any).sources && (data as any).sources !== "SKIPPED") {
        setSources((data as any).sources.split(", "));
      }

      // If step 1 already completed with required data, restore step
      const sr = (data as any).step_reached;
      if (sr && sr >= 2 && (data as any).role && (data as any).team_size) {
        const targetStep = sr > 4 ? 4 : sr;
        setStep(targetStep);
        const plan = (data as any).plan_selected;
        if (plan?.includes("premium") || plan?.includes("bundle")) {
          setOrderState(s => ({ ...s, videoPremium: true }));
        }
        if (plan?.includes("masterclass") || plan?.includes("bundle")) {
          setOrderState(s => ({ ...s, masterclass: true }));
        }
      }

      setNeedsRecovery(false);
    } catch (err) {
      console.error("Recovery error:", err);
      setRecoveryError("Erro ao recuperar dados. Tente novamente.");
    } finally {
      setRecoveryLoading(false);
    }
  }, [recoveryEmail]);

  const saveStepData = useCallback(async (stepNum: number, extraData: Record<string, unknown> = {}) => {
    if (!userData.email) return;
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
    if (!userData.email) {
      toast.error("Erro: email não definido. Recarregue a página.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await supabase
        .from("registrations")
        .update({
          plan_selected: plan,
          sources: sources.join(", "),
          upgrade_clicked_at: new Date().toISOString(),
        } as any)
        .eq("email", userData.email);

      const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
        body: { plan, email: userData.email, nome: userData.nome },
      });

      if (fnError) throw fnError;
      if (!data?.paymentLink) throw new Error("Link de pagamento não recebido");

      window.location.href = data.paymentLink;
    } catch (err) {
      console.error("Payment error:", err);
      setError("Erro ao processar pagamento. Tente novamente.");
      setLoading(false);
    }
  }, [userData, sources]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

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
          {formatVideoPrice(getVideoTotal(orderState))} <span className="text-[14px] text-ink-400">c/IVA</span>
        </span>
      </div>

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:min-h-screen">
        {/* Desktop left panel */}
        <aside className="hidden lg:flex flex-col sticky top-0 h-screen bg-background border-r border-border overflow-hidden" style={{ padding: "40px 24px" }}>
          <div>
            <p className="font-heading font-bold text-[16px] text-ink-900">Frederico Carvalho</p>
            <div className="inline-flex items-center gap-1.5 mt-1 rounded-full px-2.5 py-0.5" style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.25)' }}>
              <span className="text-[11px] font-bold" style={{ color: '#16a34a' }}>🎬 Vídeo com IA</span>
            </div>
          </div>
          <div className="w-full h-px bg-border mt-5 mb-6" />
          <p className="font-heading font-semibold text-[14px] text-ink-400 uppercase tracking-[0.08em] mb-4">A SUA COMPRA</p>
          <div className="flex-1">
            {orderState.videoPremium && (
              <div className="flex justify-between items-start py-3 border-b border-border">
                <div>
                  <p className="font-semibold text-[14px] text-ink-900">Gravação + Pack de Apoio</p>
                  <p className="text-[14px] text-ink-400 mt-0.5">Acesso contínuo</p>
                  <p className="text-[13px] text-blue-600 mt-0.5">Q&A: 10 Mar, 14:30h</p>
                </div>
                <p className="font-heading font-bold text-[16px] text-ink-900">€15 <span className="text-[14px] font-normal text-ink-400">+ IVA</span></p>
              </div>
            )}
            {orderState.masterclass && (
              <div className="flex justify-between items-start py-3 border-b border-border">
                <div>
                  <p className="font-semibold text-[14px] text-ink-900">Masterclass Online</p>
                  <p className="text-[14px] text-ink-400 mt-0.5">12 Mar · 10h-13h · Online</p>
                </div>
                <p className="font-heading font-bold text-[14px] text-ink-900">€47 <span className="text-[14px] font-normal text-ink-400">+ IVA</span></p>
              </div>
            )}
            {!orderState.videoPremium && !orderState.masterclass && (
              <div className="flex justify-between items-start py-3 border-b border-border">
                <div>
                  <p className="font-semibold text-[14px] text-ink-900">Webinar Vídeo com IA</p>
                  <p className="text-[14px] text-ink-400 mt-0.5">5 Mar · 10h00</p>
                  <p className="text-[12px] mt-1" style={{ color: '#888' }}>📅 5 de Março · 10h00</p>
                </div>
                <p className="font-heading font-bold text-[16px] text-green-600">€0</p>
              </div>
            )}
            {/* Context note */}
            <div className="my-3" style={{ borderTop: '1px solid #e5e7eb' }} />
            <p className="text-[11px] leading-[1.5]" style={{ color: '#888' }}>
              Este é um webinar diferente — focado em <strong style={{ color: '#333' }}>vídeo curto para marketing</strong>, não em imagens estáticas.
            </p>
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: "2px solid hsl(var(--ink-900))" }}>
            <div className="flex justify-between items-center">
              <p className="font-heading font-bold text-[14px] text-ink-700 uppercase">TOTAL</p>
              <p className="font-heading font-extrabold text-[22px] text-ink-900">{formatVideoPrice(getVideoTotal(orderState))}</p>
            </div>
          </div>
          <div className="mt-auto pt-5 border-t border-border">
            <p className="text-[14px] text-ink-400 leading-[1.8]">🔒 Pagamento seguro EuPago</p>
            <p className="text-[14px] text-ink-400 leading-[1.8]">📋 RGPD</p>
          </div>
        </aside>

        {/* Right content */}
        <div ref={contentRef} className="lg:overflow-y-auto lg:h-screen overflow-x-hidden">
          <div className="px-4 pt-4 pb-24 sm:pt-6 lg:px-12 lg:pt-10 lg:pb-10">

            {/* Confirmation banner — after step 2 (video premium added) */}
            {step >= 3 && orderState.videoPremium && (
              <div className="max-w-[560px] mb-5 lg:mb-6 rounded-xl border border-green-200 bg-green-50 p-4 flex gap-3 items-start lg:relative max-lg:sticky max-lg:top-12 max-lg:z-40">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-bold text-[15px] text-green-800">Gravação + Pack garantidos</p>
                  <p className="text-[13px] text-green-700 mt-0.5">Acesso contínuo · 15 € + IVA</p>
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
                Passo {step}/{totalSteps}
                {step === 2 && (
                  <>
                    <span className="hidden min-[480px]:inline"> — Gravação Vídeo (opcional)</span>
                    <span className="min-[480px]:hidden"> — Gravação</span>
                  </>
                )}
                {step === 3 && (
                  <>
                    <span className="hidden min-[480px]:inline"> — Masterclass Vídeo (opcional)</span>
                    <span className="min-[480px]:hidden"> — Masterclass</span>
                  </>
                )}
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
                    role={role}
                    setRole={setRole}
                    teamSize={teamSize}
                    setTeamSize={setTeamSize}
                    onNext={() => {
                      const srcText = sources.length > 0 ? sources.join(", ") : "SKIPPED";
                      saveStepData(2, { sources: srcText, role: role || null, team_size: teamSize || null });
                      advanceStep(2);
                    }}
                    userName={userData.nome}
                  />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <StepVideoPremium
                    onAddPremium={() => {
                      setOrderState((s) => ({ ...s, videoPremium: true }));
                      saveStepData(3, { plan_selected: "video-premium" });
                      advanceStep(3);
                    }}
                    onSkip={() => {
                      saveStepData(3, { plan_selected: "video-free" });
                      advanceStep(3);
                    }}
                    userName={userData.nome}
                  />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="s3" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <StepMasterclass
                    onAddMasterclass={() => {
                      setOrderState((s) => ({ ...s, masterclass: true }));
                      saveStepData(4, { plan_selected: orderState.videoPremium ? "video-bundle" : "video-masterclass" });
                      advanceStep(4);
                    }}
                    onSkip={() => {
                      if (orderState.videoPremium) {
                        saveStepData(4, { plan_selected: "video-premium" });
                        advanceStep(4);
                      } else {
                        // Nothing selected — redirect to confirmation page or just close
                        window.location.href = "/confirmacao?webinar=video";
                      }
                    }}
                  />
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="s4" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <VideoConfirmation
                    orderState={orderState}
                    loading={loading}
                    error={error}
                    onPay={handlePayment}
                    onBack={() => setStep(3)}
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

      <WhatsAppSupportButton />
    </div>
  );
};

export default UpgradeVideo;
