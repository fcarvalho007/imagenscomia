import { useState } from "react";
import {
  ExternalLink, Copy, Send, RefreshCw, Loader2, MoreHorizontal, Bell, Check, CheckCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Inscrito } from "@/pages/crm/mockData";
import { fmtTimeAgo } from "../templateLabels";
import googleIcon from "@/assets/google_g_icon.svg";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ActionsSectionProps {
  inscrito: Inscrito;
  messageLogs: any[];
  regenerateLink?: (id: string) => Promise<any>;
  resendPaymentEmail?: (id: string) => Promise<any>;
  onRefresh?: () => void;
  onOpenResendModal: () => void;
  onGenerateReminder: () => void;
  reminderLoading: boolean;
  reminderData: any;
}

export default function ActionsSection({
  inscrito, messageLogs, regenerateLink, resendPaymentEmail,
  onRefresh, onOpenResendModal, onGenerateReminder, reminderLoading, reminderData,
}: ActionsSectionProps) {
  const [copiedPayLink, setCopiedPayLink] = useState(false);
  const [copiedEupagoRef, setCopiedEupagoRef] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenDialogOpen, setRegenDialogOpen] = useState(false);
  const [regenSuccess, setRegenSuccess] = useState(false);

  // Don't show for free or already paid
  if (inscrito.payment_status === "free" || inscrito.paid_at) return null;

  const copyPaymentLink = () => {
    if (!inscrito.last_payment_link) return;
    navigator.clipboard.writeText(inscrito.last_payment_link);
    setCopiedPayLink(true);
    setTimeout(() => setCopiedPayLink(false), 1500);
  };

  const copyEupagoRef = () => {
    if (!inscrito.eupago_ref) return;
    navigator.clipboard.writeText(inscrito.eupago_ref);
    setCopiedEupagoRef(true);
    setTimeout(() => setCopiedEupagoRef(false), 1500);
  };

  // Cooldown check for resend
  const lastManualLog = messageLogs.find((l: any) => l.template_key === "reminder_manual");
  const manualCooldownMs = lastManualLog ? Date.now() - new Date(lastManualLog.created_at).getTime() : Infinity;
  const isManualCoolingDown = manualCooldownMs < 6 * 60 * 60 * 1000;
  const cooldownLabel = lastManualLog ? fmtTimeAgo(lastManualLog.created_at) : "";

  const handleRegen = async () => {
    if (!regenerateLink) return;
    setRegenDialogOpen(false);
    setRegenLoading(true);
    try {
      const result = await regenerateLink(inscrito.id);
      setRegenSuccess(true);
      setTimeout(() => setRegenSuccess(false), 4000);
      toast({ title: "Link regenerado", description: result?.paymentLink ? `Novo link criado.` : "Link actualizado." });
      onRefresh?.();
    } catch (e: any) {
      toast({ title: "Erro ao regenerar", description: e?.message || "Tenta novamente.", variant: "destructive" });
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 mb-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Acções</h4>
      <div className="flex flex-wrap gap-2">
        {/* Primary: Open link */}
        {inscrito.last_payment_link && (
          <button
            onClick={() => window.open(inscrito.last_payment_link!, "_blank")}
            className="h-9 flex items-center gap-1.5 px-4 rounded-lg text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Abrir link de pagamento"
          >
            <ExternalLink size={14} /> Abrir link
          </button>
        )}

        {/* Secondary: Copy link */}
        {inscrito.last_payment_link && (
          <button
            onClick={copyPaymentLink}
            className="h-8 flex items-center gap-1 px-3 rounded-lg text-[12px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Copiar link de pagamento"
          >
            {copiedPayLink ? <Check size={12} /> : <Copy size={12} />}
            {copiedPayLink ? "Copiado!" : "Copiar link"}
          </button>
        )}

        {/* Secondary: Resend email */}
        {resendPaymentEmail && (
          <button
            onClick={onOpenResendModal}
            disabled={isManualCoolingDown}
            className="h-8 flex items-center gap-1 px-3 rounded-lg text-[12px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            title={isManualCoolingDown ? `Último reenvio ${cooldownLabel}` : "Usa sempre o link de pagamento mais recente"}
          >
            <Send size={12} />
            {isManualCoolingDown ? `Reenviar (${cooldownLabel})` : "Reenviar email"}
          </button>
        )}

        {/* Secondary: Copy EuPago ref */}
        {inscrito.eupago_ref && (
          <button
            onClick={copyEupagoRef}
            className="h-8 flex items-center gap-1 px-3 rounded-lg text-[12px] font-medium border border-border bg-background text-foreground hover:bg-accent transition-colors"
            aria-label="Copiar referência EuPago"
          >
            {copiedEupagoRef ? <Check size={12} /> : <Copy size={12} />}
            {copiedEupagoRef ? "Copiado!" : "Ref EuPago"}
          </button>
        )}

        {/* Dangerous: Regenerate */}
        {regenerateLink && (
          <AlertDialog open={regenDialogOpen} onOpenChange={setRegenDialogOpen}>
            <AlertDialogTrigger asChild>
              <button
                disabled={regenLoading || regenSuccess}
                className={`h-8 flex items-center gap-1 px-3 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-70 ${
                  regenSuccess
                    ? "border border-green-500/40 text-green-600 bg-green-50 dark:bg-green-950/20"
                    : "border border-destructive/40 text-destructive hover:bg-destructive/10"
                }`}
              >
                {regenLoading ? <Loader2 size={12} className="animate-spin" /> : regenSuccess ? <CheckCircle size={12} /> : <RefreshCw size={12} />}
                {regenSuccess ? "Link regenerado" : "Regenerar link"}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerar link EuPago?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isto cria uma nova referência de pagamento. O link anterior deixará de funcionar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegen}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* More options: Generate NEW link (Gmail) */}
        {!reminderData && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onGenerateReminder} disabled={reminderLoading}>
                <Bell size={13} className="mr-2" />
                {inscrito.eupago_ref ? "Gerar NOVO link (Gmail)" : "Gerar link de pagamento (Gmail)"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {regenSuccess && (
        <p className="text-[11px] text-green-600 mt-1.5">Link actualizado. O reenvio usará o novo link.</p>
      )}
    </div>
  );
}
