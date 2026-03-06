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
    <div className="inline-flex items-center gap-2">
      <Button
        onClick={handleBulk}
        disabled={running}
        size="sm"
        variant="outline"
        className="h-8 text-[12px] gap-1.5"
      >
        {running ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
        {running ? "A criar..." : "Faturas em lote"}
      </Button>

      {result && (
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <CheckCircle size={12} className="text-green-600" />
          {result.created} criados
          {result.errors.length > 0 && (
            <span className="text-destructive flex items-center gap-0.5 ml-1">
              <AlertCircle size={12} /> {result.errors.length} erros
            </span>
          )}
        </span>
      )}
    </div>
  );
}
