import { useState, useEffect } from "react";
import { Copy, Check, FileText, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface InvoiceSectionProps {
  registrationId: string;
  invoiceSent: boolean;
  onToggleInvoiceSent: () => void;
}

export default function InvoiceSection({ registrationId, invoiceSent, onToggleInvoiceSent }: InvoiceSectionProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: inv } = await supabase
        .from("invoice_details" as any)
        .select("*")
        .eq("registration_id", registrationId)
        .maybeSingle();
      setData(inv);
      setLoading(false);
    })();
  }, [registrationId]);

  const handleCopy = () => {
    if (!data) return;
    const text = `Nome/Empresa: ${data.invoice_name}\nNIF: ${data.invoice_vat}\nMorada: ${data.invoice_address}\nCP: ${data.invoice_zip} ${data.invoice_city}\nEmail fatura: ${data.invoice_email}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateInvoice = async () => {
    setCreatingInvoice(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("create-invoice", {
        body: { registration_id: registrationId, send_email: true },
      });

      if (error) throw error;

      if (result?.success) {
        toast({
          title: "Fatura criada ✅",
          description: `Documento #${result.document_id} criado${result.email_sent ? " e enviado por email" : ""}.`,
        });
        // Auto-mark as sent
        if (!invoiceSent) onToggleInvoiceSent();
      } else {
        throw new Error(result?.error || "Erro desconhecido");
      }
    } catch (err: any) {
      console.error("Create invoice error:", err);
      toast({
        title: "Erro ao criar fatura",
        description: err.message || "Tenta novamente.",
        variant: "destructive",
      });
    } finally {
      setCreatingInvoice(false);
    }
  };

  if (loading) return null;

  const hasData = !!data;

  return (
    <>
      <hr className="border-border my-6" />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-bold text-[14px] text-foreground">Faturação</h3>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              hasData ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}
          >
            {hasData ? "Completo" : "Em falta"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasData && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateInvoice}
              disabled={creatingInvoice}
              className="h-7 text-[12px] gap-1.5"
            >
              {creatingInvoice ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              {creatingInvoice ? "A criar..." : "Emitir fatura"}
            </Button>
          )}
          <button
            onClick={onToggleInvoiceSent}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
              invoiceSent
                ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                : "bg-muted text-muted-foreground border-border hover:bg-accent"
            }`}
            aria-label="Assinalar fatura enviada"
          >
            {invoiceSent ? <Check size={12} /> : <FileText size={12} />}
            {invoiceSent ? "Fatura enviada ✓" : "Assinalar fatura enviada"}
          </button>
        </div>
      </div>
      {!hasData ? (
        <p className="text-[13px] text-muted-foreground">Sem dados de faturação</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: "Nome/Empresa", value: data.invoice_name },
              { label: "NIF", value: data.invoice_vat },
              { label: "Morada", value: data.invoice_address },
              { label: "Código Postal", value: data.invoice_zip },
              { label: "Localidade", value: data.invoice_city },
              { label: "Email fatura", value: data.invoice_email },
            ].map((f) => (
              <div key={f.label}>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{f.label}</span>
                <p className="text-[13px] text-foreground font-medium">{f.value}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copiar dados de faturação"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copiado!" : "Copiar dados faturação"}
          </button>
        </>
      )}
    </>
  );
}
