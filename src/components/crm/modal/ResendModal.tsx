import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Send, X } from "lucide-react";
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

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

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
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[200] bg-black/60 animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
      />
      {/* Card */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md rounded-xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <h3 className="text-base font-semibold text-foreground">Reenviar email de pagamento</h3>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-3 space-y-4">
            {/* Link status */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado do link</p>
              {isExpired ? (
                <div className="flex items-center gap-2 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
                  <XCircle size={15} />
                  <span className="font-medium">Link expirado ({linkAgeH}h)</span>
                </div>
              ) : isExpiring ? (
                <div className="flex items-center gap-2 text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
                  <CheckCircle2 size={15} />
                  <span className="font-medium">Link a expirar (~{24 - linkAgeH}h restantes)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                  <CheckCircle2 size={15} />
                  <span className="font-medium">Link válido (~{24 - linkAgeH}h restantes)</span>
                </div>
              )}
            </div>

            {/* Recipient */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Destinatário</p>
              <p className="text-[13px] font-medium text-foreground bg-muted rounded-lg px-3 py-2">{inscrito.email}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-2 px-5 pb-5 pt-2">
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
          </div>
        </div>
      </div>
    </>
  );
}
