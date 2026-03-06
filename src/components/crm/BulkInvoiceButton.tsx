import { useState } from "react";
import { FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useWebinarContext } from "@/contexts/WebinarContext";

interface BulkResult {
  created: number;
  skipped: number;
  errors: { id: string; email: string; error: string }[];
  total: number;
}

export default function BulkInvoiceButton() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const { webinarContext } = useWebinarContext();

  const handleBulk = async () => {
    if (!confirm(`Criar rascunhos InvoiceExpress para todos os pagantes do webinar "${webinarContext}"?`)) return;

    setRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("bulk-create-invoices", {
        body: { webinar: webinarContext === "consolidado" ? "all" : webinarContext },
      });

      if (error) throw error;

      setResult(data as BulkResult);
      toast({
        title: `Rascunhos criados: ${data.created}`,
        description: `${data.errors?.length || 0} erros · ${data.total} total elegíveis`,
      });
    } catch (err: any) {
      console.error("Bulk invoice error:", err);
      toast({
        title: "Erro ao criar rascunhos",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5 mb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileText size={20} className="text-amber-600" />
          <div>
            <h3 className="font-heading font-bold text-[14px] text-ink-900">Faturação em lote</h3>
            <p className="text-[12px] text-ink-400">Criar rascunhos InvoiceExpress para pagantes sem fatura</p>
          </div>
        </div>
        <Button
          onClick={handleBulk}
          disabled={running}
          size="sm"
          className="gap-1.5"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
          {running ? "A criar..." : "Emitir rascunhos"}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-3 bg-muted rounded-lg text-[13px] space-y-1">
          <p className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-green-600" />
            <span><strong>{result.created}</strong> rascunhos criados</span>
          </p>
          {result.errors.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-red-600">
                <AlertCircle size={14} />
                <span><strong>{result.errors.length}</strong> erros</span>
              </p>
              <ul className="ml-5 mt-1 space-y-0.5 text-[12px] text-ink-500 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i}>{e.email}: {e.error.slice(0, 80)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
