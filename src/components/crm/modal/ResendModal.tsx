import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Send } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { Inscrito } from "@/pages/crm/mockData";

interface ResendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inscrito: Inscrito;
  resendPaymentEmail: (id: string) => Promise<any>;
  regenerateLink?: (id: string) => Promise<any>;
  onRefresh?: () => void;
  onLogsRefresh?: () => void;
}

export default function ResendModal({
  open, onOpenChange, inscrito, resendPaymentEmail, regenerateLink, onRefresh, onLogsRefresh,
}: ResendModalProps) {
  const [sending, setSending] = useState(false);
  const [regenAndSend, setRegenAndSend] = useState(false);

  // Link age proxy
  const linkAgeMs = inscrito.payment_link_created_at
    ? Date.now() - new Date(inscrito.payment_link_created_at).getTime()
    : Infinity;
  const linkAgeH = Math.round(linkAgeMs / (60 * 60 * 1000));
  const isExpired = linkAgeH >= 24;
  const isExpiring = linkAgeH >= 12 && linkAgeH < 24;

  const handleSend = async () => {
    setSending(true);
    try {
      const result = await resendPaymentEmail(inscrito.id);
      toast({
        title: "Email enviado",
        description: result?.messageId ? `ID: ${result.messageId}` : "Enviado com sucesso.",
      });
      onLogsRefresh?.();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e?.message || "Tenta novamente.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleRegenAndSend = async () => {
    if (!regenerateLink) return;
    setRegenAndSend(true);
    try {
      await regenerateLink(inscrito.id);
      onRefresh?.();
      const result = await resendPaymentEmail(inscrito.id);
      toast({
        title: "Link regenerado e email enviado",
        description: result?.messageId ? `ID: ${result.messageId}` : "Sucesso.",
      });
      onLogsRefresh?.();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Tenta novamente.", variant: "destructive" });
    } finally {
      setRegenAndSend(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reenviar email de pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Link validation */}
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Estado do link</p>
            {isExpired ? (
              <div className="flex items-center gap-2 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <XCircle size={15} />
                <span className="font-medium">Link expirado ({linkAgeH}h)</span>
              </div>
            ) : isExpiring ? (
              <div className="flex items-center gap-2 text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <CheckCircle2 size={15} />
                <span className="font-medium">Link a expirar (~{24 - linkAgeH}h restantes)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle2 size={15} />
                <span className="font-medium">Link válido (~{24 - linkAgeH}h restantes)</span>
              </div>
            )}
          </div>

          {/* Recipient */}
          <div>
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Destinatário</p>
            <p className="text-[13px] font-medium text-foreground bg-muted rounded-lg px-3 py-2">{inscrito.email}</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isExpired && regenerateLink ? (
            <Button
              onClick={handleRegenAndSend}
              disabled={regenAndSend}
              className="w-full sm:w-auto"
            >
              {regenAndSend ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <RefreshCw size={14} className="mr-1.5" />}
              Regenerar e reenviar
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={sending}
              className="w-full sm:w-auto"
            >
              {sending ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Send size={14} className="mr-1.5" />}
              Confirmar envio
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
