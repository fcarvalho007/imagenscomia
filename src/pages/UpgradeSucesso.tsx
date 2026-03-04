import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, XCircle, ArrowLeft, Mail, Calendar, MessageCircle } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";


const WHATSAPP_URL = "https://wa.me/351915015508?text=Preciso%20de%20ajuda%20com%20a%20minha%20inscri%C3%A7%C3%A3o";

type PageState = "loading" | "confirmed" | "pending" | "invalid";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" as const },
});

const UpgradeSucesso = () => {
  usePageMeta({ title: "Pagamento Confirmado — Webinar Imagens com IA", description: "O pagamento foi confirmado e a inscrição está garantida." });

  const [searchParams] = useSearchParams();
  const rid = searchParams.get("rid");
  const token = searchParams.get("t");

  const [state, setState] = useState<PageState>("loading");
  const [email, setEmail] = useState("");
  const [pollCount, setPollCount] = useState(0);

  const fetchRegistration = useCallback(async () => {
    if (!rid || !token) {
      setState("invalid");
      return;
    }

    const { data, error } = await supabase
      .from("registrations")
      .select("paid_at, email")
      .eq("id", rid)
      .eq("edit_token", token)
      .maybeSingle();

    if (error || !data) {
      setState("invalid");
      return;
    }

    setEmail(data.email);

    if (data.paid_at) {
      setState("confirmed");
    } else {
      setState("pending");
    }
  }, [rid, token]);

  useEffect(() => {
    fetchRegistration();
  }, [fetchRegistration]);

  // Polling when pending (every 5s, max 12 attempts)
  useEffect(() => {
    if (state !== "pending" || pollCount >= 12) return;

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("registrations")
        .select("paid_at")
        .eq("id", rid!)
        .eq("edit_token", token!)
        .maybeSingle();

      if (data?.paid_at) {
        setState("confirmed");
      } else {
        setPollCount((c) => c + 1);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [state, pollCount, rid, token]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-full max-w-[520px] bg-background rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg text-center flex flex-col items-center"
      >
        {/* ─── CONFIRMED ─── */}
        {state === "confirmed" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
            >
              <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
            </motion.div>

            <motion.h1 {...fadeUp(0.15)} className="font-heading font-extrabold text-2xl md:text-3xl text-foreground mb-2">
              Pagamento confirmado
            </motion.h1>
            <motion.p {...fadeUp(0.2)} className="text-[15px] text-muted-foreground mb-8">
              Inscrição garantida.
            </motion.p>

            <motion.div {...fadeUp(0.3)} className="w-full text-left space-y-4 mb-8">
              <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">
                O que acontece agora
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <p className="text-sm text-foreground">
                    Foi enviado um email de confirmação para: <strong>{email}</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <p className="text-sm text-foreground">
                    Recomenda-se adicionar ao calendário.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <p className="text-sm text-foreground">
                    Suporte directo via WhatsApp:{" "}
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                      +351 915 015 508
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.4)} className="w-full flex justify-center mb-6">
              <a
                href="https://calendar.app.google/kyhFPoficXByZf5S8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-heading font-semibold text-[14px] text-white py-3 px-6 rounded-xl transition-colors bg-[#4285F4] hover:bg-[#3367D6]"
              >
                <img src="/google-cal-icon.svg" alt="" className="w-5 h-5" />
                Adicionar ao Google Calendar
              </a>
            </motion.div>

            <motion.div {...fadeUp(0.45)} className="w-full">
              <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3 mb-4">
                A fatura será emitida e enviada posteriormente para o email indicado nos dados de faturação.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Se não receber o email nos próximos minutos, verificar Spam/Promoções.
              </p>
            </motion.div>
          </>
        )}

        {/* ─── PENDING ─── */}
        {state === "pending" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h1 className="font-heading font-extrabold text-2xl text-foreground mb-2">
              A confirmar pagamento…
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              O pagamento está a ser processado. Esta página actualiza-se automaticamente.
            </p>
            <Button variant="outline" size="sm" onClick={() => { setPollCount(0); fetchRegistration(); }}>
              Recarregar
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Se necessário,{" "}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                contactar suporte via WhatsApp
              </a>.
            </p>
          </>
        )}

        {/* ─── INVALID ─── */}
        {state === "invalid" && (
          <>
            <XCircle className="w-12 h-12 text-destructive mb-4" />
            <h1 className="font-heading font-extrabold text-xl text-foreground mb-2">
              Não foi possível validar a inscrição.
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                Contactar suporte via WhatsApp
              </a>
            </p>
          </>
        )}

        {/* ─── FOOTER ─── */}
        <div className="w-full mt-6 space-y-3">
          <Link to="/" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao site
          </Link>
          <p className="text-[12px] text-muted-foreground">
            Questões? frederico@digitalfc.pt
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UpgradeSucesso;
