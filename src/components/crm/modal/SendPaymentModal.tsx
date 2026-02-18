import { useState } from "react";
import { X, Send, CheckCircle, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Inscrito } from "@/pages/crm/mockData";

interface SendPaymentModalProps {
  inscrito: Inscrito;
  onClose: () => void;
  onSuccess?: () => void;
}

type Plan = "premium" | "masterclass" | "bundle";
type PriceVariant = "earlybird" | "normal";

const PLAN_OPTIONS: { id: Plan; label: string; description: string }[] = [
  { id: "premium", label: "Premium Pass", description: "Acesso premium ao webinar" },
  { id: "masterclass", label: "Masterclass", description: "Imagem para Vídeo com IA" },
  { id: "bundle", label: "Bundle", description: "Premium Pass + Masterclass" },
];

const PRICE_OPTIONS: Record<Plan, { variant: PriceVariant; label: string; value: string }[]> = {
  premium: [
    { variant: "earlybird", label: "Early Bird", value: "€15 + IVA (total €18,45)" },
    { variant: "normal", label: "Preço normal", value: "€27 + IVA (total €33,21)" },
  ],
  masterclass: [
    { variant: "earlybird", label: "Early Bird", value: "€47 + IVA (total €57,81)" },
    { variant: "normal", label: "Preço normal", value: "€67 + IVA (total €82,41)" },
  ],
  bundle: [
    { variant: "earlybird", label: "Early Bird", value: "€15+€47 + IVA (total €76,26)" },
    { variant: "normal", label: "Preço normal", value: "€27+€67 + IVA (total €115,62)" },
  ],
};

export default function SendPaymentModal({ inscrito, onClose, onSuccess }: SendPaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("premium");
  const [selectedVariant, setSelectedVariant] = useState<PriceVariant>("earlybird");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ paymentLink: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-payment-link", {
        body: {
          registrationId: inscrito.id,
          plan: selectedPlan,
          priceVariant: selectedVariant,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult({ paymentLink: data.paymentLink, email: data.email });
      toast({ title: "Email enviado!", description: `Link de pagamento enviado para ${data.email}` });
      onSuccess?.();
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e?.message || "Tenta novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!result?.paymentLink) return;
    navigator.clipboard.writeText(result.paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const priceOptions = PRICE_OPTIONS[selectedPlan];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed z-[201] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-heading font-bold text-[15px] text-foreground">Enviar link de pagamento</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Para: {inscrito.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {result ? (
          /* Success state */
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h4 className="font-heading font-bold text-[16px] text-foreground mb-1">Email enviado!</h4>
            <p className="text-[13px] text-muted-foreground mb-4">
              Link de pagamento enviado para <strong>{result.email}</strong>
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border mb-4">
              <span className="text-[12px] text-foreground flex-1 truncate">{result.paymentLink}</span>
              <button onClick={copyLink} className="shrink-0 p-1.5 rounded hover:bg-background transition-colors text-muted-foreground">
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
            <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-[14px] hover:bg-primary/90 transition-colors">
              Fechar
            </button>
          </div>
        ) : (
          /* Form state */
          <div className="p-5 space-y-5">
            {/* Step 1: Plan */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">1. Produto</p>
              <div className="flex gap-2">
                {PLAN_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPlan(opt.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-left transition-all ${
                      selectedPlan === opt.id
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-white text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <p className={`text-[13px] font-semibold leading-tight ${selectedPlan === opt.id ? "text-primary" : ""}`}>{opt.label}</p>
                    <p className="text-[10px] mt-0.5 leading-tight">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Price variant */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">2. Preço</p>
              <div className="space-y-2">
                {priceOptions.map((opt) => (
                  <button
                    key={opt.variant}
                    onClick={() => setSelectedVariant(opt.variant)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedVariant === opt.variant
                        ? "border-primary bg-primary/5"
                        : "border-border bg-white hover:bg-muted"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedVariant === opt.variant ? "border-primary" : "border-muted-foreground/40"
                    }`}>
                      {selectedVariant === opt.variant && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-[13px] font-semibold text-foreground">{opt.label}</span>
                      <span className="text-[12px] text-muted-foreground ml-2">{opt.value}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[12px] text-muted-foreground">
              Um link EuPago será gerado e o email enviado directamente para o cliente.
            </p>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-border text-[14px] font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> A enviar...</>
                ) : (
                  <><Send size={15} /> Gerar e enviar</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
