import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X, Lock, Zap, Mail, Users } from "lucide-react";
import GroupCheckoutForm from "@/components/webinar/GroupCheckoutForm";
import { InvoiceForm } from "@/components/upgrade/InvoiceForm";
import {
  storeToken,
  readToken,
  requestAccessLink,
  ACCESS_LINK_GENERIC_MESSAGE,
  type LegacyScope,
  type LegacyDestination,
} from "@/lib/legacyAccess";
import { planGrossPrice, trackInitiateCheckout } from "@/lib/legacyPricing";

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: "premium" | "masterclass" | "gravacao" | "bundle";
  planLabel: string;
  webinar?: "imagens" | "video";
}

const PLAN_PRICES_DISPLAY: Record<string, string> = {
  premium: "€27 + IVA",
  masterclass: "€67 + IVA",
  gravacao: "€27 + IVA",
  bundle: "€107 + IVA",
};

const PLAN_NAMES: Record<string, string> = {
  premium: "Sessão Prática + Materiais",
  masterclass: "Masterclass Vídeo com IA",
  gravacao: "Sessão Prática + Materiais",
  bundle: "Pack IA Completo",
};

function ctaBg(plan: string) {
  if (plan === "bundle") return "linear-gradient(135deg, #7c3aed, #4f46e5)";
  if (plan === "gravacao") return "#1e40af";
  return "#7c3aed";
}

export const PurchaseModal = ({
  open,
  onOpenChange,
  plan,
  planLabel,
  webinar = "imagens",
}: PurchaseModalProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [groupMode, setGroupMode] = useState(false);
  const [invoiceValid, setInvoiceValid] = useState(false);
  const [invoiceSaveError, setInvoiceSaveError] = useState(false);
  const [registrationReady, setRegistrationReady] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | undefined>();
  const [editToken, setEditToken] = useState<string | undefined>();
  const [needsVerification, setNeedsVerification] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const showGroupToggle = plan === "masterclass" || plan === "bundle" || plan === "gravacao";

  const scope: LegacyScope = webinar === "video" ? "upgrade-video" : "upgrade";
  const destination: LegacyDestination = webinar === "video" ? "upgrade-video" : "upgrade";

  const paymentPlan = webinar === "video"
    ? { gravacao: "video-premium", masterclass: "video-masterclass", bundle: "video-bundle" }[plan] || plan
    : plan;

  /**
   * Registration only happens on an explicit user action, never while typing.
   * An existing registration is not disclosed here: the server answers
   * generically and the participant recovers access by email link.
   */
  const handleStartCheckout = async () => {
    setError("");
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedFirst || !trimmedLast) {
      setError("Por favor, preencha o nome completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Por favor, introduza um email válido.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("register-free", {
        body: {
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail,
          webinar,
          editToken: readToken(scope) ?? undefined,
        },
      });
      if (fnError) throw fnError;

      if (data?.needsVerification) {
        setNeedsVerification(true);
        return;
      }
      if (!data?.editToken) {
        throw new Error("Não foi possível iniciar o pagamento. Tenta novamente.");
      }

      storeToken(scope, data.editToken);
      setEditToken(data.editToken);
      setRegistrationId(data.id || undefined);
      setRegistrationReady(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLink = async () => {
    setLoading(true);
    try {
      await requestAccessLink(email, destination);
      setLinkSent(true);
    } catch {
      setError("Erro de ligação. Tenta novamente daqui a pouco.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!registrationReady || !editToken) {
      setError("Confirma primeiro os teus dados.");
      return;
    }
    if (!invoiceValid) {
      setError("Por favor, preencha os dados de faturação.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-payment",
        {
          body: {
            plan: paymentPlan,
            editToken,
            nome: `${firstName.trim()} ${lastName.trim()}`,
          },
        }
      );

      if (fnError || !data?.paymentLink) {
        throw new Error(data?.error || fnError?.message || "Erro ao criar pagamento");
      }

      // Creating a link is not a sale: only the server-confirmed payment is.
      trackInitiateCheckout(paymentPlan, planGrossPrice(paymentPlan));

      window.location.href = data.paymentLink;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      setError(msg);
      setLoading(false);
    }
  };

  // Check if buyer fields are valid (for showing invoice form)
  const buyerFieldsValid = firstName.trim().length > 0 && lastName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setGroupMode(false); }}>
      <DialogContent className="w-[95vw] mx-auto sm:max-w-2xl p-0 gap-0 border-0 max-h-[90vh] overflow-y-auto">
        {/* Dark header */}
        <div
          className="relative"
          style={{
            background: "#1e1b4b",
            padding: "20px 24px",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <p className="font-semibold text-white" style={{ fontSize: 16 }}>
            {PLAN_NAMES[plan] || planLabel}
          </p>
          <p style={{ fontSize: 14, color: "#a5b4fc", marginTop: 2 }}>
            {PLAN_PRICES_DISPLAY[plan] || ""}
          </p>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, background: "white" }}>
          {/* Buyer fields — always visible */}
          <div className="flex flex-col gap-4">
            {groupMode && (
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: -4 }}>
                Os teus dados de contacto
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="purchase-first-name" style={{ fontSize: 13 }}>Primeiro nome</Label>
              <Input
                id="purchase-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="João"
                disabled={loading}
                className="focus-visible:ring-purple-500/20 focus-visible:border-purple-600"
                style={{ height: 44, borderRadius: 8, fontSize: 14 }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchase-last-name" style={{ fontSize: 13 }}>Apelido</Label>
              <Input
                id="purchase-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Silva"
                disabled={loading}
                className="focus-visible:ring-purple-500/20 focus-visible:border-purple-600"
                style={{ height: 44, borderRadius: 8, fontSize: 14 }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchase-email" style={{ fontSize: 13 }}>Email</Label>
              <Input
                id="purchase-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@email.com"
                disabled={loading}
                className="focus-visible:ring-purple-500/20 focus-visible:border-purple-600"
                style={{ height: 44, borderRadius: 8, fontSize: 14 }}
              />
            </div>
          </div>

          {/* Explicit confirmation step — creates the registration once */}
          {buyerFieldsValid && !registrationReady && !needsVerification && !groupMode && (
            <button
              type="button"
              onClick={handleStartCheckout}
              disabled={loading}
              className="w-full font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 mt-4"
              style={{ background: ctaBg(plan), borderRadius: 10, height: 48, fontSize: 15 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A confirmar…
                </span>
              ) : (
                "Continuar"
              )}
            </button>
          )}

          {/* Existing registration: nothing is revealed, only an emailed link */}
          {needsVerification && !groupMode && (
            <div className="mt-4 rounded-xl border p-4" style={{ borderColor: "#e5e7eb", background: "#fafafa" }}>
              {linkSent ? (
                <p style={{ fontSize: 13, color: "#374151" }}>{ACCESS_LINK_GENERIC_MESSAGE}</p>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "#374151" }}>
                    Já existe uma inscrição com este email. Enviamos-te a ligação de acesso para continuares em segurança.
                  </p>
                  <button
                    type="button"
                    onClick={handleRequestLink}
                    disabled={loading}
                    className="mt-3 w-full font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: ctaBg(plan), borderRadius: 10, height: 44, fontSize: 14 }}
                  >
                    {loading ? "A enviar…" : "Receber ligação de acesso"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Invoice form — only after the registration is confirmed */}
          {registrationReady && (
            <div className="mt-4">
              <InvoiceForm
                userEmail={email.trim()}
                registrationId={registrationId}
                editToken={editToken}
                webinar={webinar}
                defaultName={`${firstName.trim()} ${lastName.trim()}`.trim()}
                onValidChange={setInvoiceValid}
                onSaveError={setInvoiceSaveError}
              />
            </div>
          )}

          {/* Group toggle */}
          {showGroupToggle && (
            <button
              type="button"
              onClick={() => setGroupMode((prev) => !prev)}
              className="flex flex-wrap items-center gap-2.5 w-full mt-4"
              style={{
                background: "#fafafa",
                border: "1px solid #f3f4f6",
                borderRadius: 10,
                padding: "10px 14px",
              }}
            >
              <div
                className="relative shrink-0 transition-colors"
                style={{ width: 36, height: 20, borderRadius: 10, backgroundColor: groupMode ? "#7c3aed" : "#d1d5db" }}
              >
                <div
                  className="absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ left: groupMode ? 18 : 2 }}
                />
              </div>
              <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: "#374151" }}>
                <Users className="w-3.5 h-3.5" /> Inscrever mais do que uma pessoa?
              </span>
            </button>
          )}

          {/* Group form (inline) */}
          {groupMode && showGroupToggle ? (
            <div className="mt-4">
              <GroupCheckoutForm
                buyerFirstName={firstName}
                buyerLastName={lastName}
                buyerEmail={email}
                plan={plan}
              />
            </div>
          ) : (
            /* Single-person checkout */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Trust row */}
              <div className="flex items-center justify-center gap-4 py-1" style={{ fontSize: 10, color: "#9ca3af" }}>
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" />Pagamento seguro</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Acesso imediato</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />Confirmação por email</span>
              </div>

              <button
                type="submit"
                disabled={loading || !registrationReady || !invoiceValid || invoiceSaveError}
                className="w-full font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  background: ctaBg(plan),
                  borderRadius: 10,
                  height: 52,
                  fontSize: 15,
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A processar…
                  </span>
                ) : (
                  "Confirmar e pagar →"
                )}
              </button>

              <p className="text-center" style={{ fontSize: 10, color: "#9ca3af" }}>
                Ao prosseguir, aceitas os nossos termos e política de privacidade
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
