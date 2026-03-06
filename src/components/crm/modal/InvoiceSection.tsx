import { useState, useEffect } from "react";
import { Copy, Check, FileText, Send, Loader2, FilePlus } from "lucide-react";
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
  const [creatingInvoice, setCreatingInvoice] = useState<"draft" | "final" | null>(null);

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

  const handleCreateInvoice = async (draftOnly: boolean) => {
    const mode = draftOnly ? "draft" : "final";
    setCreatingInvoice(mode);
    try {
      const { data: result, error } = await supabase.functions.invoke("create-invoice", {
        body: {
          registration_id: registrationId,
          send_email: !draftOnly,
          draft_only: draftOnly,
        },
      });

      if (error) throw error;

      if (result?.success) {
        toast({
          title: draftOnly ? "Rascunho criado" : "Fatura emitida e enviada ✅",
          description: draftOnly
            ? `Documento #${result.document_id} criado como rascunho.`
            : `Documento #${result.document_id} finalizado e enviado por email.`,
        });
        if (!draftOnly && !invoiceSent) onToggleInvoiceSent();
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
      setCreatingInvoice(null);
    }
  };

  if (loading) return null;

  const hasData = !!data;

  return (
    <>
      <div className="border-t border-border/40 my-5" />

      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-muted-foreground" />
          <h3 className="font-medium text-[13px] text-foreground">Faturação</h3>
          <span className="text-[11px] text-muted-foreground">
            · {hasData ? "dados preenchidos" : "sem dados"}
          </span>
        </div>
        <button
          onClick={onToggleInvoiceSent}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
            invoiceSent
              ? "text-green-600 hover:text-green-700"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Assinalar fatura enviada"
        >
          {invoiceSent ? <Check size={11} /> : <FileText size={11} />}
          {invoiceSent ? "Enviada ✓" : "Marcar enviada"}
        </button>
      </div>

      {!hasData ? (
        <p className="text-[12px] text-muted-foreground">Sem dados de faturação submetidos.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
            {[
              { label: "Nome/Empresa", value: data.invoice_name },
              { label: "NIF", value: data.invoice_vat },
              { label: "Morada", value: data.invoice_address },
              { label: "Código Postal", value: data.invoice_zip },
              { label: "Localidade", value: data.invoice_city },
              { label: "Email fatura", value: data.invoice_email },
            ].map((f) => (
              <div key={f.label}>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{f.label}</span>
                <p className="text-[12px] text-foreground">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCreateInvoice(true)}
              disabled={creatingInvoice !== null}
              className="h-7 text-[11px] gap-1"
            >
              {creatingInvoice === "draft" ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <FilePlus size={11} />
              )}
              Rascunho
            </Button>
            <Button
              size="sm"
              onClick={() => handleCreateInvoice(false)}
              disabled={creatingInvoice !== null}
              className="h-7 text-[11px] gap-1"
            >
              {creatingInvoice === "final" ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Send size={11} />
              )}
              Emitir e enviar
            </Button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-auto"
              aria-label="Copiar dados de faturação"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </>
      )}
    </>
  );
}
