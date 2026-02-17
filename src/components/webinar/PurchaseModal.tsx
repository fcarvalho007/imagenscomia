import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: "premium" | "masterclass" | "gravacao";
  planLabel: string;
}

export const PurchaseModal = ({
  open,
  onOpenChange,
  plan,
  planLabel,
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
      // 1. Register user in DB (so they appear in CRM)
      await supabase.functions.invoke("register-free", {
        body: {
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email: trimmedEmail,
        },
      });

      // 2. Create payment link
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
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{planLabel}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Preencha os seus dados para prosseguir para o pagamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="purchase-first-name">Primeiro nome</Label>
              <Input
                id="purchase-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="João"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchase-last-name">Último nome</Label>
              <Input
                id="purchase-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Silva"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="purchase-email">Email</Label>
            <Input
              id="purchase-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@email.com"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                A processar…
              </>
            ) : (
              "Ir para pagamento"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
