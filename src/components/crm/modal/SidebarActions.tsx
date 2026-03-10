import { Mail, Star, Archive, Trash2, Bell, Send, Loader2, Check, XCircle, CreditCard, MessageSquare, BookOpen } from "lucide-react";
import { useState } from "react";
import type { Inscrito } from "@/pages/crm/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SmsComposer from "./SmsComposer";

interface SidebarActionsProps {
  inscrito: Inscrito;
  onToggleFollowUp: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpenResendModal: () => void;
  onOpenSendPayment: () => void;
  onToggleInvoiceSent?: () => void;
  sendBacklogCheckin?: (id: string, templateKey: string) => Promise<any>;
  regenerateLink?: (id: string) => Promise<any>;
  onUpdatePlan?: (id: string, plan: string, markAsPaid?: boolean) => Promise<void>;
  onMarkAsPaid?: (id: string) => Promise<void>;
  onMarkAsLost?: (id: string, reason?: string) => Promise<void>;
}

export default function SidebarActions({
  inscrito, onToggleFollowUp, onArchive, onDelete,
  onOpenResendModal, onOpenSendPayment, onToggleInvoiceSent,
  sendBacklogCheckin, regenerateLink, onUpdatePlan, onMarkAsPaid, onMarkAsLost,
}: SidebarActionsProps) {
  const [backlogSending, setBacklogSending] = useState(false);
  const [backlogSent, setBacklogSent] = useState(false);
  const [showSms, setShowSms] = useState(false);

  const linkAgeMs = inscrito.payment_link_created_at
    ? Date.now() - new Date(inscrito.payment_link_created_at).getTime()
    : Infinity;
  const linkExpired = Math.round(linkAgeMs / (60 * 60 * 1000)) >= 24;

  const isAwaiting = inscrito.payment_status === "awaiting_payment" || inscrito.payment_status === "selected";
  const isPaid = !!inscrito.paid_at;
  const isFreeComplete = !isPaid && !isAwaiting && (inscrito.step_reached || 0) >= 5;
  const isFreeIncomplete = !isPaid && !isAwaiting && (inscrito.step_reached || 0) < 5;

  // TIER 1 — Primary action
  let primaryLabel = "";
  let primaryColor = "";
  let primaryBg = "";
  let primaryAction = () => {};

  if (isAwaiting && !linkExpired) {
    primaryLabel = "Reenviar link de pagamento";
    primaryColor = "#fff";
    primaryBg = "#16a34a";
    primaryAction = onOpenResendModal;
  } else if (isAwaiting && linkExpired) {
    primaryLabel = "Regenerar link";
    primaryColor = "#fff";
    primaryBg = "#d97706";
    primaryAction = () => regenerateLink?.(inscrito.id);
  } else if (isPaid && !inscrito.invoice_sent) {
    primaryLabel = "Assinalar fatura enviada";
    primaryColor = "#fff";
    primaryBg = "#16a34a";
    primaryAction = () => onToggleInvoiceSent?.();
  } else if (isFreeComplete) {
    primaryLabel = "Enviar link de pagamento";
    primaryColor = "#fff";
    primaryBg = "#16a34a";
    primaryAction = onOpenSendPayment;
  } else if (isFreeIncomplete) {
    primaryLabel = "Enviar Email";
    primaryColor = "#fff";
    primaryBg = "#2563eb";
    primaryAction = () => window.open(`mailto:${inscrito.email}`, "_blank");
  }

  const showBacklog = sendBacklogCheckin && !isPaid && inscrito.plan_selected && inscrito.plan_selected !== "free" && !inscrito.do_not_contact;

  const handleBacklog = async () => {
    if (!sendBacklogCheckin) return;
    if (!confirm(`Enviar email de reactivação para ${inscrito.nome}?`)) return;
    setBacklogSending(true);
    try {
      await sendBacklogCheckin(inscrito.id, "followup_backlog_checkin");
      setBacklogSent(true);
    } catch {
      // error handled by parent
    } finally {
      setBacklogSending(false);
    }
  };

  const btnBase = "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors";

  return (
    <div className="space-y-1">
      {/* TIER 1 */}
      {primaryLabel && (
        <button
          onClick={primaryAction}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors"
          style={{ background: primaryBg, color: primaryColor }}
        >
          <Send size={13} /> {primaryLabel}
        </button>
      )}

      {/* TIER 2 */}
      <div className="mt-1 space-y-1">
        <button
          onClick={() => window.open(`mailto:${inscrito.email}`, "_blank")}
          className={btnBase}
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.70)" }}
        >
          <Mail size={13} /> Enviar Email
        </button>
        {inscrito.whatsapp && (
          <button
            onClick={() => setShowSms(!showSms)}
            className={btnBase}
            style={{
              background: showSms ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.06)",
              color: showSms ? "#93c5fd" : "rgba(255,255,255,0.70)",
            }}
          >
            <MessageSquare size={13} /> Enviar SMS
          </button>
        )}
        {showSms && inscrito.whatsapp && (
          <SmsComposer
            phone={inscrito.whatsapp}
            registrationId={inscrito.id}
            nome={inscrito.primeiro_nome || inscrito.nome}
            onClose={() => setShowSms(false)}
          />
        )}
        <button
          onClick={() => onToggleFollowUp(inscrito.id)}
          className={btnBase}
          style={{
            background: inscrito.follow_up ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)",
            color: inscrito.follow_up ? "#fbbf24" : "rgba(255,255,255,0.70)",
          }}
        >
          <Star size={13} /> {inscrito.follow_up ? "Remover Follow-up" : "Marcar Follow-up"}
        </button>
        {showBacklog && (
          <button
            onClick={handleBacklog}
            disabled={backlogSending || backlogSent}
            className={btnBase}
            title="Envia um email para inscritos que estão há mais de 36h sem interagir com o link de pagamento"
            style={{ background: backlogSent ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.12)", color: backlogSent ? "#22c55e" : "rgba(255,255,255,0.70)" }}
          >
            {backlogSending ? <Loader2 size={13} className="animate-spin" /> : backlogSent ? <Check size={13} /> : <Bell size={13} />}
            {backlogSent ? "Email de reactivação enviado ✓" : "Enviar email de reactivação"}
          </button>
        )}
      </div>

      {/* PLAN SELECTOR */}
      {onUpdatePlan && (
        <div className="mt-2 space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Alterar plano</label>
          <Select
            value={inscrito.plan_selected || "free"}
            onValueChange={(val) => {
              if (val === (inscrito.plan_selected || "free")) return;
              const planLabel = val === "free" ? "Gratuito" : val === "premium" ? "Premium" : val === "masterclass" ? "Masterclass" : "Bundle";
              if (confirm(`Alterar plano de ${inscrito.nome} para "${planLabel}"?`)) {
                onUpdatePlan(inscrito.id, val);
              }
            }}
          >
            <SelectTrigger className="h-8 text-[12px] bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Gratuito</SelectItem>
              <SelectItem value="premium">Premium — €15</SelectItem>
              <SelectItem value="masterclass">Masterclass — €57,81</SelectItem>
              <SelectItem value="bundle">Bundle — €76,26</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* SEND RESOURCE EMAIL */}
      {(inscrito.paid_at || inscrito.premium_granted_at) && inscrito.plan_selected && inscrito.plan_selected !== "free" && (
        <SendRecursosButton inscrito={inscrito} btnBase={btnBase} />
      )}

      {/* MARK AS PAID */}
      {onMarkAsPaid && !inscrito.paid_at && inscrito.plan_selected && inscrito.plan_selected !== "free" && (
        <button
          onClick={() => {
            if (confirm(`Marcar ${inscrito.nome} como PAGO manualmente? Esta acção é irreversível.`)) {
              onMarkAsPaid(inscrito.id);
            }
          }}
          className={btnBase + " mt-1"}
          style={{ background: "rgba(22,163,74,0.12)", color: "#4ade80" }}
        >
          <CreditCard size={13} /> Marcar como pago
        </button>
      )}

      {/* MARK AS LOST */}
      {onMarkAsLost && !inscrito.lost_at && (
        <button
          onClick={() => {
            const reason = prompt(`Motivo para marcar ${inscrito.nome} como "sem interesse" (opcional):`);
            if (reason !== null) {
              onMarkAsLost(inscrito.id, reason || undefined);
            }
          }}
          className={btnBase + " mt-1"}
          style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}
        >
          <XCircle size={13} /> Sem interesse
        </button>
      )}

      {/* TIER 3 */}
      <div className="mt-2 space-y-1">
        <button
          onClick={() => onArchive(inscrito.id)}
          className={btnBase}
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", fontSize: 11 }}
        >
          <Archive size={12} /> Arquivar inscrito
        </button>
        {onDelete && (
          <button
            onClick={() => {
              if (confirm(`Eliminar definitivamente "${inscrito.nome}"? Irreversível.`)) onDelete(inscrito.id);
            }}
            className="w-full text-left px-3 py-1 text-[11px] font-medium transition-colors hover:underline"
            style={{ color: "#f87171" }}
          >
            <Trash2 size={11} className="inline mr-1.5" /> Eliminar definitivamente
          </button>
        )}
      </div>
    </div>
  );
}
