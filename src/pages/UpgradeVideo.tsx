import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { StepRole } from "@/components/upgrade/StepRole";
import { StepTeamSize } from "@/components/upgrade/StepTeamSize";
import { StepVideoPremium } from "@/components/upgrade/StepVideoPremium";
import { StepMasterclass } from "@/components/upgrade/StepMasterclass";
import { StepDuvida } from "@/components/upgrade/StepDuvida";
import { VideoConfirmation, type VideoOrderState } from "@/components/upgrade/VideoConfirmation";
import { toast } from "sonner";
import ConfirmacaoExtras from "@/components/landing/ConfirmacaoExtras";
import { Mail, Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import {
  resolveToken,
  clearToken,
  legacyRegLookup,
  legacyRegSaveStep,
  requestAccessLink,
  ACCESS_LINK_GENERIC_MESSAGE,
  type LegacyRegistration,
} from "@/lib/legacyAccess";
import { planGrossPrice, trackInitiateCheckout } from "@/lib/legacyPricing";

/* ── CSS for step transitions + confirmation animation ── */
const transitionStyles = `
@keyframes stepEnterRight {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes stepEnterLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes confirmFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes confirmScaleIn {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
.step-enter-right { animation: stepEnterRight 250ms ease both; }
.step-enter-left  { animation: stepEnterLeft 250ms ease both; }
.confirm-fade-in  { animation: confirmFadeIn 400ms ease both; }
.confirm-scale-in { animation: confirmScaleIn 300ms ease-out 200ms both; }
`;

const PROGRESS_LABELS: Record<number, string> = {
  3: "Masterclass Vídeo",
  4: "Gravação",
  5: "Checkout",
};

const UpgradeVideo = () => {
  usePageMeta({ title: "Upgrade — Webinar Vídeo com IA", description: "Adicione a gravação e a Masterclass ao seu pack." });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [orderState, setOrderState] = useState<VideoOrderState>({ videoPremium: false, masterclass: false });
  const [userData, setUserData] = useState({
    nome: searchParams.get("name") || "",
    email: (searchParams.get("email") || "").toLowerCase().trim(),
    whatsapp: searchParams.get("whatsapp") || "",
    referralCode: searchParams.get("ref_code") || "",
  });
  // Access requires the existing token (URL ?t= or the one kept for this area).
  const initialToken = resolveToken("upgrade-video", searchParams.get("t"));
  const [needsRecovery, setNeedsRecovery] = useState(!initialToken);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySent, setRecoverySent] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<string | null>(null);
  const [duvida, setDuvida] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [editToken, setEditToken] = useState<string | null>(searchParams.get("t") || null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  // ── Returning user state ──
  const [initialLoading, setInitialLoading] = useState(!!searchParams.get("email"));
  const [isReturning, setIsReturning] = useState(false);
  const [returningData, setReturningData] = useState<{
    step_reached: number | null;
    paid_at: string | null;
    plan_selected: string | null;
  } | null>(null);

  const firstName = userData.nome?.trim().split(" ")[0] || "";

  // ── Helper: restore state from DB record ──
  const restoreFromRecord = useCallback((data: any) => {
    setRegistrationId(data.id);
    setEditToken(data.edit_token || null);
    setUserData(prev => ({
      ...prev,
      nome: data.name || `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      email: prev.email || data.email,
    }));
    if (data.role) setRole(data.role);
    if (data.team_size) setTeamSize(data.team_size);
    const plan = data.plan_selected;
    if (plan?.includes("premium") || plan?.includes("bundle")) {
      setOrderState(s => ({ ...s, videoPremium: true }));
    }
    if (plan?.includes("masterclass") || plan?.includes("bundle")) {
      setOrderState(s => ({ ...s, masterclass: true }));
    }
  }, []);

  // ── Auto-check on mount (email in URL) ──
  useEffect(() => {
    if (!userData.email || needsRecovery) {
      setInitialLoading(false);
      return;
    }
    const check = async () => {
      try {
        const { data } = await supabase
          .from("registrations")
          .select("id, name, first_name, last_name, edit_token, role, team_size, step_reached, plan_selected, paid_at")
          .eq("email", userData.email)
          .eq("webinar", "video")
          .maybeSingle();

        if (data && (data.step_reached ?? 0) >= 2) {
          restoreFromRecord(data);
          setReturningData({
            step_reached: data.step_reached,
            paid_at: data.paid_at,
            plan_selected: data.plan_selected,
          });
          setIsReturning(true);
          setStep(0);
        }
      } catch (err) {
        console.error("Auto-check error:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Recovery ──
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
        .select("id, name, first_name, last_name, edit_token, role, team_size, step_reached, plan_selected, paid_at")
        .eq("email", trimmed)
        .eq("webinar", "video")
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setRecoveryError("Email não encontrado. Inscreva-se primeiro na página do vídeo.");
        setRecoveryLoading(false);
        return;
      }

      setUserData(prev => ({ ...prev, email: trimmed }));
      restoreFromRecord(data);

      if ((data.step_reached ?? 0) >= 2) {
        setReturningData({
          step_reached: data.step_reached,
          paid_at: data.paid_at,
          plan_selected: data.plan_selected,
        });
        setIsReturning(true);
        setStep(0);
      } else {
        setStep(1);
      }

      setNeedsRecovery(false);
    } catch (err) {
      console.error("Recovery error:", err);
      setRecoveryError("Erro ao recuperar dados. Tente novamente.");
    } finally {
      setRecoveryLoading(false);
    }
  }, [recoveryEmail, restoreFromRecord]);

  // ── Save step data ──
  const saveStepData = useCallback(async (stepNum: number, extraData: Record<string, unknown> = {}) => {
    if (!userData.email) return;
    try {
      await supabase
        .from("registrations")
        .update({ step_reached: stepNum, ...extraData } as any)
        .eq("email", userData.email)
        .eq("webinar", "video");
    } catch (err) {
      console.error("Error saving step data:", err);
    }
  }, [userData.email]);

  // ── Navigation helpers ──
  const goForward = useCallback((next: number) => {
    setDirection(1);
    setStep(next);
  }, []);

  const goBack = useCallback((prev: number) => {
    setDirection(-1);
    setStep(prev);
  }, []);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  // ── Payment ──
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
  }, [userData]);

  // ── Free confirmation (in-card, step 7) ──
  const goToFreeConfirmation = useCallback(() => {
    goForward(7);
  }, [goForward]);

  const totalSteps = 5;
  const isConfirmation = step === 7;
  const isReturningScreen = step === 0;
  const hideProgressBar = isConfirmation || isReturningScreen;
  const visualStep = Math.min(step, 5);
  const progress = (visualStep / totalSteps) * 100;
  const progressLabel = PROGRESS_LABELS[visualStep] ? ` — ${PROGRESS_LABELS[visualStep]}` : "";

  // ── Loading screen (auto-check in progress) ──
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f3f4f6" }}>
        <div className="w-full max-w-[600px] sm:rounded-3xl sm:shadow-lg bg-white p-12 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1e40af" }} />
          <p className="text-[15px]" style={{ color: "#6b7280" }}>A verificar a tua inscrição…</p>
        </div>
      </div>
    );
  }

  // ── Recovery screen ──
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
              style={{ fontSize: 16 }}
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

  // ── In-card confirmation (step 7) ──
  const renderConfirmation = () => (
    <div className="confirm-fade-in text-center py-4">
      {/* Green check circle */}
      <div
        className="confirm-scale-in mx-auto flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#dcfce7",
        }}
      >
        <Check style={{ width: 32, height: 32, color: "#16a34a" }} />
      </div>

      <div style={{ height: 20 }} />

      <h2 className="max-sm:text-[24px]" style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
        {orderState.videoPremium || orderState.masterclass
          ? `Compra confirmada${firstName ? `, ${firstName}` : ""}! 🎉`
          : `Estás inscrito${firstName ? `, ${firstName}` : ""}.`}
      </h2>

      <p style={{ fontSize: 15, color: "#6b7280", marginTop: 8 }}>
        {orderState.videoPremium || orderState.masterclass
          ? (orderState.videoPremium && orderState.masterclass
              ? "Gravação + Pack de Apoio e Masterclass"
              : orderState.masterclass
                ? "Masterclass Online"
                : "Gravação + Pack de Apoio")
          : "Webinar Vídeo com IA · 5 de Março · 10h00"}
      </p>

      <div className="max-sm:h-[18px]" style={{ height: 24 }} />

      {/* Info box */}
      <div
        className="text-center"
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 12,
          padding: "16px 20px",
        }}
      >
        <p style={{ fontSize: 14, color: "#166534", lineHeight: 1.6 }}>
          {orderState.videoPremium || orderState.masterclass
            ? "Receberás os acessos por email em breve."
            : "Vais receber um email de confirmação em breve com o link de acesso."}
        </p>
      </div>

      <div className="max-sm:h-[20px]" style={{ height: 24 }} />

      {/* Próximos Passos — Instagram, Calendar, Social Share */}
      <div className="text-left">
        <ConfirmacaoExtras webinar="video" />
      </div>

      <div className="max-sm:h-[20px]" style={{ height: 24 }} />

      {/* Purchase summary if any */}
      {(orderState.masterclass || orderState.videoPremium) && (
        <div className="text-left mb-6">
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>
            A TUA COMPRA
          </p>
          <div className="space-y-2">
            {orderState.masterclass && (
              <div className="flex items-center justify-between" style={{ fontSize: 14, color: "#374151" }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 9, fontWeight: 700, color: "white", background: "#7c3aed", borderRadius: 6, padding: "3px 8px" }}>MASTERCLASS</span>
                  <span>Masterclass Vídeo</span>
                </div>
                <span>€47 + IVA</span>
              </div>
            )}
            {orderState.videoPremium && (
              <div className="flex items-center justify-between" style={{ fontSize: 14, color: "#374151" }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 9, fontWeight: 700, color: "white", background: "#1e40af", borderRadius: 6, padding: "3px 8px" }}>GRAVAÇÃO</span>
                  <span>Gravação + Pack</span>
                </div>
                <span>€15 + IVA</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => navigate("/video")}
        className="w-full transition-colors"
        style={{
          height: 48,
          borderRadius: 28,
          border: "1.5px solid #e5e7eb",
          background: "white",
          color: "#374151",
          fontSize: 15,
          fontWeight: 500,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
      >
        Voltar ao início
      </button>
    </div>
  );

  // ── Main layout ──
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f3f4f6", overflowX: "hidden" }}>
      <style>{transitionStyles}</style>

      {/* ── Fixed header bar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 shrink-0 h-[44px] sm:h-[56px]"
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Desktop header */}
        <span className="text-[13px] font-semibold hidden sm:block" style={{ color: "#111827" }}>🎬 Webinar Vídeo com IA</span>
        <span className="text-[13px] hidden sm:block" style={{ color: "#6b7280" }}>5 de Março · 10h00</span>
        <span className="text-[12px] font-semibold hidden sm:block" style={{ color: "#16a34a" }}>Inscrição gratuita confirmada ✓</span>
        {/* Mobile header — single line */}
        <span className="text-[12px] font-semibold sm:hidden mx-auto" style={{ color: "#111827" }}>
          🎬 Webinar Vídeo · 5 Mar <span style={{ color: "#16a34a" }}>✓</span>
        </span>
      </header>

      {/* ── Progress bar (hidden on confirmation) ── */}
      {!hideProgressBar && (
        <div className="shrink-0 px-4 sm:px-6 pt-2" style={{ background: "#f3f4f6" }}>
          <div className="flex items-center justify-end mb-1">
            <span className="text-[11px]" style={{ color: "#9ca3af" }}>
              <span className="sm:hidden">Passo {visualStep}/{totalSteps}</span>
              <span className="hidden sm:inline">Passo {visualStep}/{totalSteps}{progressLabel}</span>
            </span>
          </div>
          <div className="w-full overflow-hidden" style={{ height: 3, background: "#e5e7eb", borderRadius: 2 }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "#1e40af", borderRadius: 2, transition: "width 300ms ease" }} />
          </div>
        </div>
      )}

      {/* ── Centered content area ── */}
      <div ref={contentRef} className={`flex-1 flex justify-center px-4 ${[3, 4].includes(step) ? "items-start pt-2 sm:pt-4 pb-6" : "items-start sm:items-center py-6 sm:py-10"}`}>
        <div
          className={`w-full sm:rounded-3xl sm:shadow-lg upgrade-card-inner ${[3, 4].includes(step) ? "upgrade-card-compact" : ""}`}
          style={{
            maxWidth: 600,
            background: "white",
            padding: [3, 4].includes(step) ? "24px 40px" : "48px 40px",
            overscrollBehavior: "none",
          }}
        >
          {/* Mobile overrides */}
          <style>{`
            @media (max-width: 639px) {
              .upgrade-card-inner {
                padding: 32px 20px !important;
                border-radius: 16px 16px 0 0 !important;
                box-shadow: none !important;
                min-height: calc(100vh - 56px - 30px);
                padding-bottom: calc(32px + env(safe-area-inset-bottom)) !important;
              }
              .upgrade-card-inner.upgrade-card-compact {
                padding: 20px 20px !important;
              }
            }
          `}</style>

          {/* Back arrow for step 2+ (not on confirmation) */}
          {step >= 2 && !isConfirmation && (
            <button
              onClick={() => goBack(step - 1)}
              className="mb-4 flex items-center justify-center transition-colors"
              style={{ width: 44, height: 44, color: "#6b7280", cursor: "pointer", background: "transparent", border: "none" }}
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {/* Step content with CSS transition */}
          <div key={step} className={direction === 1 ? "step-enter-right" : "step-enter-left"}>
            {/* ── Step 0: Returning user ── */}
            {step === 0 && returningData && (() => {
              const sr = returningData.step_reached ?? 1;
              const hasPaid = !!returningData.paid_at;
              return (
                <div className="text-center py-4">
                  <div
                    className="mx-auto flex items-center justify-center"
                    style={{ width: 64, height: 64, borderRadius: "50%", background: hasPaid ? "#dcfce7" : "#dbeafe", fontSize: 32 }}
                  >
                    {hasPaid ? <Check style={{ width: 32, height: 32, color: "#16a34a" }} /> : "👋"}
                  </div>

                  <div style={{ height: 20 }} />

                  <h2 className="max-sm:text-[24px]" style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
                    Olá de novo{firstName ? `, ${firstName}` : ""}!
                  </h2>

                  <p style={{ fontSize: 15, color: "#6b7280", marginTop: 8 }}>
                    A tua inscrição no Webinar Vídeo está confirmada.
                  </p>

                  {hasPaid && (
                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5" style={{ background: "#dcfce7", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "#166534" }}>
                      <Check style={{ width: 14, height: 14 }} /> Compra confirmada
                    </div>
                  )}

                  {!hasPaid && sr >= 2 && (
                    <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 12 }}>
                      Ficaste no passo {sr} da última vez.
                    </p>
                  )}

                  <div style={{ height: 28 }} />

                  {hasPaid ? (
                    <button
                      onClick={() => goForward(7)}
                      className="w-full transition-colors"
                      style={{ height: 52, borderRadius: 28, background: "#1e40af", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", border: "none" }}
                    >
                      Ver a minha confirmação →
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setIsReturning(false);
                          goForward(sr >= 5 ? 3 : Math.min(sr + 1, 5));
                        }}
                        className="w-full transition-colors"
                        style={{ height: 52, borderRadius: 28, background: "#1e40af", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", border: "none" }}
                      >
                        {sr >= 5 ? "Ver ofertas disponíveis →" : "Continuar de onde parei →"}
                      </button>
                      <button
                        onClick={() => { setIsReturning(false); goForward(1); }}
                        className="w-full transition-colors"
                        style={{ height: 48, borderRadius: 28, border: "1.5px solid #e5e7eb", background: "white", color: "#374151", fontSize: 15, fontWeight: 500, cursor: "pointer" }}
                      >
                        Recomeçar do início
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
            {step === 1 && (
              <StepRole
                role={role}
                setRole={setRole}
                firstName={firstName}
                onNext={() => {
                  saveStepData(1, { role: role || null });
                  goForward(2);
                }}
              />
            )}
            {step === 2 && (
              <StepTeamSize
                teamSize={teamSize}
                setTeamSize={setTeamSize}
                onBack={() => goBack(1)}
                onNext={() => {
                  saveStepData(2, { role: role || null, team_size: teamSize || null });
                  goForward(3);
                }}
              />
            )}
            {step === 3 && (
              <StepMasterclass
                onAddMasterclass={() => {
                  setOrderState((s) => ({ ...s, masterclass: true }));
                  saveStepData(3, { plan_selected: "video-masterclass" });
                  goForward(4);
                }}
                onSkip={() => goForward(4)}
              />
            )}
            {step === 4 && (
              <StepVideoPremium
                onAddPremium={() => {
                  setOrderState((s) => ({ ...s, videoPremium: true }));
                  const newPlan = orderState.masterclass ? "video-bundle" : "video-premium";
                  saveStepData(4, { plan_selected: newPlan });
                  goForward(5);
                }}
                onSkip={() => {
                  if (!orderState.masterclass) {
                    saveStepData(4, { plan_selected: "video-free" });
                  }
                  goForward(5);
                }}
                userName={userData.nome}
                masterclassSelected={orderState.masterclass}
              />
            )}
            {step === 5 && (
              <StepDuvida
                duvida={duvida}
                setDuvida={setDuvida}
                onNext={() => {
                  const hasOrder = orderState.videoPremium || orderState.masterclass;
                  saveStepData(5, { duvida: duvida || null });
                  if (hasOrder) goForward(6);
                  else goToFreeConfirmation();
                }}
                onSkip={() => {
                  const hasOrder = orderState.videoPremium || orderState.masterclass;
                  saveStepData(5, { duvida: null });
                  if (hasOrder) goForward(6);
                  else goToFreeConfirmation();
                }}
                userName={userData.nome}
              />
            )}
            {step === 6 && (
              <VideoConfirmation
                orderState={orderState}
                loading={loading}
                error={error}
                onPay={handlePayment}
                onBack={() => goBack(5)}
                userName={userData.nome}
                userEmail={userData.email}
                registrationId={registrationId || undefined}
                editToken={editToken || undefined}
              />
            )}
            {step === 7 && renderConfirmation()}
          </div>
        </div>
      </div>

      <WhatsAppSupportButton />
    </div>
  );
};

export default UpgradeVideo;
