import { useState } from "react";
import {
  ExternalLink, Copy, Send, RefreshCw, Loader2, MoreHorizontal, Bell, Check, CheckCircle, GraduationCap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Inscrito } from "@/pages/crm/mockData";
import { fmtTimeAgo } from "../templateLabels";
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
  sendBacklogCheckin?: (id: string, templateKey: string, extra?: Record<string, string>) => Promise<any>;
  onRefresh?: () => void;
  onOpenResendModal: () => void;
  onGenerateReminder: () => void;
  reminderLoading: boolean;
  reminderData: any;
}

export default function ActionsSection({
  inscrito, messageLogs, regenerateLink, resendPaymentEmail, sendBacklogCheckin,
  onRefresh, onOpenResendModal, onGenerateReminder, reminderLoading, reminderData,
}: ActionsSectionProps) {
  const [copiedPayLink, setCopiedPayLink] = useState(false);
  const [copiedEupagoRef, setCopiedEupagoRef] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenDialogOpen, setRegenDialogOpen] = useState(false);
  const [regenSuccess, setRegenSuccess] = useState(false);
  const [masterclassLoading, setMasterclassLoading] = useState(false);
  const [masterclassSent, setMasterclassSent] = useState(false);

  const isPaidPremium = !!(inscrito.paid_at && inscrito.plan === "premium");
  const showPaymentActions = !inscrito.paid_at && inscrito.payment_status !== "free";
  const showMasterclassSection = isPaidPremium;

  if (!showPaymentActions && !showMasterclassSection) return null;

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

  const lastManualLog = messageLogs.find((l: any) => l.template_key === "reminder_manual");
  const manualCooldownMs = lastManualLog ? Date.now() - new Date(lastManualLog.created_at).getTime() : Infinity;
  const isManualCoolingDown = manualCooldownMs < 6 * 60 * 60 * 1000;
  const cooldownLabel = lastManualLog ? fmtTimeAgo(lastManualLog.created_at) : "";

  const lastMasterclassLog = messageLogs.find((l: any) => l.template_key === "masterclass_upsell_premium");
  const masterclassCooldownMs = lastMasterclassLog ? Date.now() - new Date(lastMasterclassLog.created_at).getTime() : Infinity;
  const isMasterclassCoolingDown = masterclassCooldownMs < 24 * 60 * 60 * 1000;
  const masterclassCooldownLabel = lastMasterclassLog ? fmtTimeAgo(lastMasterclassLog.created_at) : "";

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

  const handleMasterclassInvite = async () => {
    if (!sendBacklogCheckin) return;
    setMasterclassLoading(true);
    try {
      await sendBacklogCheckin(inscrito.id, "masterclass_upsell_premium");
      setMasterclassSent(true);
      setTimeout(() => setMasterclassSent(false), 5000);
      toast({ title: "Convite enviado", description: "Email de Masterclass enviado com sucesso." });
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e?.message || "Tenta novamente.", variant: "destructive" });
    } finally {
      setMasterclassLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 mb-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Acções</h4>

      {showPaymentActions && (
        <div className="flex flex-wrap gap-2">
          {inscrito.last_payment_link && (
            <button
              onClick={() => window.open(inscrito.last_payment_link!, "_blank")}
              className="h-9 flex items-center gap-1.5 px-4 rounded-lg text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              aria-label="Abrir link de pagamento"
            >
              <ExternalLink size={14} /> Abrir link
            </button>
          )}

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

          {regenerateLink && (
            <AlertDialog open={regenDialogOpen} onOpenChange={setRegenDialogOpen}>
              <AlertDialogTrigger asChild>
                <button
                  disabled={regenLoading || regenSuccess}
                  className={`h-8 flex items-center gap-1 px-3 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-70 ${
                    regenSuccess
                      ? "border border-border text-primary bg-primary/10"
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
      )}

      {regenSuccess && (
        <p className="text-[11px] text-primary mt-1.5">Link actualizado. O reenvio usará o novo link.</p>
      )}

      {/* Masterclass invite — only for paid Premium */}
      {showMasterclassSection && (
        <div className={showPaymentActions ? "mt-3 pt-3 border-t border-border" : ""}>
          <p className="text-[11px] text-muted-foreground mb-2">
            <span className="font-medium text-foreground">Premium pago</span> — pode convidar para a Masterclass
          </p>
          <button
            onClick={handleMasterclassInvite}
            disabled={masterclassLoading || isMasterclassCoolingDown || masterclassSent || !sendBacklogCheckin}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50 ${
              masterclassSent
                ? "border border-border text-primary bg-primary/10"
                : "border border-border bg-background text-foreground hover:bg-accent"
            }`}
            title={isMasterclassCoolingDown ? `Convite enviado ${masterclassCooldownLabel}` : "Enviar convite para a Masterclass de Imagem para Vídeo"}
          >
            {masterclassLoading
              ? <Loader2 size={12} className="animate-spin" />
              : masterclassSent
              ? <CheckCircle size={12} />
              : <GraduationCap size={12} />
            }
            {masterclassSent
              ? "Convite enviado!"
              : isMasterclassCoolingDown
              ? `Convidar para Masterclass (${masterclassCooldownLabel})`
              : "Convidar para Masterclass"
            }
          </button>
          {lastMasterclassLog && !masterclassSent && (
            <p className="text-[11px] text-muted-foreground mt-1">Último envio: {masterclassCooldownLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
