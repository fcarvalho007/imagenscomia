import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Mail, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

/* ── CSS for step transitions ── */
const transitionStyles = `
@keyframes stepEnterRight {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes stepEnterLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}
.step-enter-right { animation: stepEnterRight 250ms ease both; }
.step-enter-left  { animation: stepEnterLeft 250ms ease both; }
`;

const PROGRESS_LABELS: Record<number, string> = {
  3: "Masterclass Vídeo",
  4: "Gravação",
  5: "Checkout",
};

const UpgradeVideo = () => {
  usePageMeta({ title: "Upgrade — Webinar Vídeo com IA", description: "Adicione a gravação e a Masterclass ao seu pack." });
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
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
  const [role, setRole] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<string | null>(null);
  const [duvida, setDuvida] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [editToken, setEditToken] = useState<string | null>(searchParams.get("t") || null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const firstName = userData.nome?.trim().split(" ")[0] || "";

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
        .select("id, name, first_name, last_name, edit_token, role, team_size, step_reached, plan_selected")
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
      if ((data as any).role) setRole((data as any).role);
      if ((data as any).team_size) setTeamSize((data as any).team_size);

      const sr = (data as any).step_reached;
      if (sr && sr >= 2 && (data as any).role && (data as any).team_size) {
        // Map old step numbers: old step 1 = role+team (now steps 1-2), old step 2+ shift by 1
        const targetStep = Math.min(sr + 1, 5);
        setStep(targetStep);
        const plan = (data as any).plan_selected;
        if (plan?.includes("premium") || plan?.includes("bundle")) {
          setOrderState(s => ({ ...s, videoPremium: true }));
        }
        if (plan?.includes("masterclass") || plan?.includes("bundle")) {
          setOrderState(s => ({ ...s, masterclass: true }));
        }
      } else if ((data as any).role && (data as any).team_size) {
        setStep(3);
      }

      setNeedsRecovery(false);
    } catch (err) {
      console.error("Recovery error:", err);
      setRecoveryError("Erro ao recuperar dados. Tente novamente.");
    } finally {
      setRecoveryLoading(false);
    }
  }, [recoveryEmail]);

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

  const goToFreeConfirmation = useCallback(() => {
    window.location.href = `/confirmacao?webinar=video&name=${encodeURIComponent(userData.nome)}&email=${encodeURIComponent(userData.email)}&plan=video-free`;
  }, [userData]);

  const totalSteps = 5;
  const visualStep = Math.min(step, 5);
  const progress = (visualStep / totalSteps) * 100;
  const progressLabel = PROGRESS_LABELS[visualStep] ? ` — ${PROGRESS_LABELS[visualStep]}` : "";

  // ── Recovery screen (unchanged) ──
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

  // ── Main layout ──
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f3f4f6" }}>
      <style>{transitionStyles}</style>

      {/* ── Fixed header bar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 shrink-0"
        style={{
          height: 56,
          background: "white",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "#111827" }}>🎬 Webinar Vídeo com IA</span>
        <span className="text-[13px] hidden sm:block" style={{ color: "#6b7280" }}>5 de Março · 10h00</span>
        <span className="text-[12px] font-semibold" style={{ color: "#16a34a" }}>Inscrição gratuita confirmada ✓</span>
      </header>

      {/* ── Progress bar ── */}
      <div className="shrink-0 px-4 sm:px-6 pt-2" style={{ background: "#f3f4f6" }}>
        <div className="flex items-center justify-end mb-1">
          <span className="text-[11px]" style={{ color: "#9ca3af" }}>Passo {visualStep}/{totalSteps}{progressLabel}</span>
        </div>
        <div className="w-full overflow-hidden" style={{ height: 3, background: "#e5e7eb", borderRadius: 2 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#1e40af", borderRadius: 2, transition: "width 300ms ease" }} />
        </div>
      </div>

      {/* ── Centered content area ── */}
      <div ref={contentRef} className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:py-10">
        <div
          className="w-full sm:rounded-3xl sm:shadow-lg upgrade-card-inner"
          style={{
            maxWidth: 600,
            background: "white",
            padding: "48px 40px",
          }}
        >
          {/* Mobile overrides */}
          <style>{`
            @media (max-width: 639px) {
              .upgrade-card-inner {
                padding: 32px 20px !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                min-height: calc(100vh - 56px - 30px);
              }
            }
          `}</style>

          {/* Back arrow for step 2+ */}
          {step >= 2 && (
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
          </div>
        </div>
      </div>

      <WhatsAppSupportButton />
    </div>
  );
};

export default UpgradeVideo;
