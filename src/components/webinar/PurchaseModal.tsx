import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X, Lock, Zap, Mail } from "lucide-react";

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: "premium" | "masterclass" | "gravacao" | "bundle";
  planLabel: string;
  webinar?: "imagens" | "video";
}

const PLAN_PRICES_DISPLAY: Record<string, string> = {
  premium: "€15 + IVA",
  masterclass: "€47 + IVA",
  gravacao: "€15",
  bundle: "€57 + IVA",
};

const PLAN_NAMES: Record<string, string> = {
  premium: "Acesso Premium",
  masterclass: "Masterclass Vídeo com IA",
  gravacao: "Gravação + Pack de Apoio",
  bundle: "Masterclass + Gravação",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();

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
      await supabase.functions.invoke("register-free", {
        body: {
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail,
          webinar,
        },
      });

      const { data, error: fnError } = await supabase.functions.invoke(
        "create-payment",
        {
          body: {
            plan,
            email: trimmedEmail,
            nome: `${trimmedFirst} ${trimmedLast}`,
          },
        }
      );

      if (fnError || !data?.paymentLink) {
        throw new Error(data?.error || fnError?.message || "Erro ao criar pagamento");
      }

      const prices: Record<string, number> = { premium: 18.45, masterclass: 57.81, bundle: 76.26, gravacao: 33.21 };
      const capturedPlan = plan;
      setTimeout(() => {
        try {
          const fbqSafe = (window as any)?.fbq;
          if (typeof fbqSafe === "function") fbqSafe("track", "Purchase", { value: prices[capturedPlan] || 0, currency: "EUR" });
        } catch {}
      }, 0);

      window.location.href = data.paymentLink;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden gap-0 border-0">
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              disabled={loading}
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
                "Ir para pagamento →"
              )}
            </button>

            <p className="text-center" style={{ fontSize: 10, color: "#9ca3af" }}>
              Ao prosseguir, aceitas os nossos termos e política de privacidade
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
