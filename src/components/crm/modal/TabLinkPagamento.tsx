import { Gift, Copy } from "lucide-react";
import { useState } from "react";
import type { Inscrito } from "@/pages/crm/mockData";
import LinkFollowUpSection from "./LinkFollowUpSection";
import InvoiceSection from "./InvoiceSection";
import ActionsSection from "./ActionsSection";
import googleIcon from "@/assets/google_g_icon.svg";

interface TabLinkPagamentoProps {
  inscrito: Inscrito;
  messageLogs: any[];
  onToggleDoNotContact?: (id: string) => void;
  onToggleInvoiceSent?: (id: string) => void;
  onGrantPremium?: (id: string) => void;
  regenerateLink?: (id: string) => Promise<any>;
  resendPaymentEmail?: (id: string) => Promise<any>;
  sendBacklogCheckin?: (id: string, templateKey: string, extra?: Record<string, string>) => Promise<any>;
  onRefresh?: () => void;
  onOpenResendModal: () => void;
  onOpenSendPayment: () => void;
  onGenerateReminder: () => void;
  reminderLoading: boolean;
  reminderData: any;
  copiedEmail: boolean;
  copyEmailBody: () => void;
  buildGmailLink: () => string;
  setReminderData: (d: any) => void;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default function TabLinkPagamento({
  inscrito, messageLogs, onToggleDoNotContact, onToggleInvoiceSent, onGrantPremium,
  regenerateLink, resendPaymentEmail, sendBacklogCheckin, onRefresh,
  onOpenResendModal, onOpenSendPayment, onGenerateReminder,
  reminderLoading, reminderData, copiedEmail, copyEmailBody, buildGmailLink, setReminderData,
}: TabLinkPagamentoProps) {
  return (
    <div className="space-y-4">
      {/* Link / Follow-up */}
      <LinkFollowUpSection inscrito={inscrito} onToggleDoNotContact={onToggleDoNotContact} />

      {/* Invoice */}
      <InvoiceSection
        registrationId={inscrito.id}
        invoiceSent={inscrito.invoice_sent}
        onToggleInvoiceSent={() => onToggleInvoiceSent?.(inscrito.id)}
      />

      {/* Premium Grant */}
      {onGrantPremium && (
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift size={14} className="text-purple-600" />
              <span className="text-[13px] font-semibold text-foreground">Acesso Premium (Oferta)</span>
              {inscrito.premium_granted_at && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Activo</span>
              )}
            </div>
            <button
              onClick={() => onGrantPremium(inscrito.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inscrito.premium_granted_at ? "bg-purple-600" : "bg-input"}`}
              aria-label="Toggle acesso premium"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${inscrito.premium_granted_at ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          {inscrito.premium_granted_at && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Concedido por {inscrito.premium_granted_by || "—"} · {fmtDate(inscrito.premium_granted_at)}
            </p>
          )}
        </div>
      )}

      {/* Gmail reminder card */}
      {reminderData && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-amber-100/60 border-b border-amber-200">
            <h4 className="font-bold text-[14px] text-amber-900">📧 Email pronto a enviar</h4>
            <button onClick={() => setReminderData(null)} className="text-[11px] text-amber-600 hover:text-amber-800 transition-colors">Gerar novo</button>
          </div>
          <div className="px-4 py-2.5 bg-white/50 border-b border-amber-200/60">
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Assunto</span>
            <p className="text-[13px] text-amber-900 font-semibold mt-0.5">{reminderData.emailSubject}</p>
          </div>
          <div className="px-4 py-3">
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Corpo</span>
            <pre className="text-[13px] text-amber-900 whitespace-pre-wrap leading-relaxed mt-1">{reminderData.emailBody}</pre>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-100/40 border-t border-amber-200">
            <a href={buildGmailLink()} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-[13px] text-white transition-colors" style={{ background: "#1a73e8" }}>
              <img src={googleIcon} alt="" className="w-4 h-4" style={{ filter: "brightness(0) invert(1)" }} /> Enviar via Gmail
            </a>
            <button onClick={copyEmailBody} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-medium border border-amber-300 text-amber-800 hover:bg-amber-200 transition-colors">
              <Copy size={12} /> {copiedEmail ? "Copiado!" : "Copiar tudo"}
            </button>
          </div>
          <div className="px-4 py-2 border-t border-amber-200/60">
            <a href={reminderData.paymentLink} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline">
              Link: {reminderData.paymentLink} ↗
            </a>
          </div>
        </div>
      )}

      {/* Payment actions */}
      <ActionsSection
        inscrito={inscrito}
        messageLogs={messageLogs}
        regenerateLink={regenerateLink}
        resendPaymentEmail={resendPaymentEmail}
        sendBacklogCheckin={sendBacklogCheckin}
        onRefresh={onRefresh}
        onOpenResendModal={onOpenResendModal}
        onGenerateReminder={onGenerateReminder}
        reminderLoading={reminderLoading}
        reminderData={reminderData}
        onOpenSendPayment={!inscrito.paid_at ? () => onOpenSendPayment() : undefined}
      />
    </div>
  );
}
