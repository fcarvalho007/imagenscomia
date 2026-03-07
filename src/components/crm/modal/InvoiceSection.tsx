import { useState, useEffect } from "react";
import { Copy, Check, FileText, Send, Loader2, FilePlus, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface InvoiceSectionProps {
  registrationId: string;
  invoiceSent: boolean;
  invoiceDocumentId: string | null;
  onToggleInvoiceSent: () => void;
  onInvoiceCreated?: (documentId: string, sent: boolean) => void;
}

export default function InvoiceSection({
  registrationId,
  invoiceSent,
  invoiceDocumentId,
  onToggleInvoiceSent,
  onInvoiceCreated,
}: InvoiceSectionProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState<"draft" | "final" | null>(null);
  const [localDocId, setLocalDocId] = useState<string | null>(invoiceDocumentId);
  const [localSent, setLocalSent] = useState(invoiceSent);

  useEffect(() => {
    setLocalDocId(invoiceDocumentId);
    setLocalSent(invoiceSent);
  }, [invoiceDocumentId, invoiceSent]);

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
        const docId = String(result.document_id);
        setLocalDocId(docId);
        if (!draftOnly) setLocalSent(true);

        toast({
          title: draftOnly ? "Rascunho criado" : "Fatura emitida e enviada ✅",
          description: draftOnly
            ? `Documento #${docId} criado como rascunho.`
            : `Documento #${docId} finalizado e enviado por email.`,
        });

        if (!draftOnly && !invoiceSent) onToggleInvoiceSent();
        onInvoiceCreated?.(docId, !draftOnly);
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

  const handleCopyTemplate = (name: string, email: string) => {
    const msg = `Olá ${name.split(" ")[0]},\n\nPara podermos emitir a sua fatura, precisamos dos seguintes dados:\n\n• Nome completo ou empresa\n• NIF\n• Morada\n• Código postal e localidade\n• Email para envio da fatura\n\nObrigado!`;
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="border-t border-border/40 my-5" />

      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-muted-foreground" />
          <h3 className="font-medium text-[13px] text-foreground">Faturação</h3>
        </div>
        <button
          onClick={onToggleInvoiceSent}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
            localSent
              ? "text-green-600 hover:text-green-700"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Assinalar fatura enviada"
        >
          {localSent ? <Check size={11} /> : <FileText size={11} />}
          {localSent ? "Enviada ✓" : "Marcar enviada"}
        </button>
      </div>

      {/* Missing NIF alert */}
      {!hasData && (
        <div className="flex items-start gap-2 mb-3 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="text-[12px] font-semibold">Sem dados de faturação</p>
            <p className="text-[11px] mt-0.5 text-amber-700">Contactar cliente para solicitar NIF e morada.</p>
          </div>
          <button
            onClick={() => handleCopyTemplate("Cliente", "")}
            className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors whitespace-nowrap"
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? "Copiado" : "Copiar template"}
          </button>
        </div>
      )}

      {/* Invoice status badge */}
      {localDocId && (
        <div className={`flex items-center gap-1.5 mb-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
          localSent
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}>
          {localSent ? <Check size={11} /> : <FilePlus size={11} />}
          {localSent
            ? `Fatura #${localDocId} emitida e enviada`
            : `Rascunho #${localDocId} criado`
          }
        </div>
      )}

      {/* Invoice details (if available) */}
      {hasData && (
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
      )}

      {/* Action buttons — always visible */}
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
          disabled={creatingInvoice !== null || localSent}
          className="h-7 text-[11px] gap-1"
        >
          {creatingInvoice === "final" ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Send size={11} />
          )}
          Emitir e enviar
        </Button>
        {hasData && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-auto"
            aria-label="Copiar dados de faturação"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        )}
      </div>
    </>
  );
}
