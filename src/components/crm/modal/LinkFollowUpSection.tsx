import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import type { Inscrito } from "@/pages/crm/mockData";

function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

interface LinkFollowUpSectionProps {
  inscrito: Inscrito;
  onToggleDoNotContact?: (id: string) => void;
}

export default function LinkFollowUpSection({ inscrito, onToggleDoNotContact }: LinkFollowUpSectionProps) {
  if (inscrito.payment_status === "free" || inscrito.paid_at) return null;
  if (!inscrito.last_payment_link && !inscrito.next_followup_at) return null;

  // Link age proxy
  const linkAgeMs = inscrito.payment_link_created_at
    ? Date.now() - new Date(inscrito.payment_link_created_at).getTime()
    : Infinity;
  const linkAgeH = Math.round(linkAgeMs / (60 * 60 * 1000));
  const remainingH = Math.max(0, 24 - linkAgeH);

  let linkStatus: { label: string; icon: React.ReactNode; className: string };
  if (linkAgeH < 12) {
    linkStatus = {
      label: `Link válido (~${remainingH}h restantes)`,
      icon: <CheckCircle2 size={13} />,
      className: "text-green-700 bg-green-50 border-green-200",
    };
  } else if (linkAgeH < 24) {
    linkStatus = {
      label: `Link a expirar (~${remainingH}h)`,
      icon: <AlertTriangle size={13} />,
      className: "text-amber-700 bg-amber-50 border-amber-200",
    };
  } else {
    linkStatus = {
      label: "Link expirado",
      icon: <XCircle size={13} />,
      className: "text-red-700 bg-red-50 border-red-200",
    };
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3 mb-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Link / Follow-up</h4>

      {/* Link validity badge */}
      {inscrito.last_payment_link && (
        <div className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full border mb-3 ${linkStatus.className}`}>
          {linkStatus.icon}
          {linkStatus.label}
        </div>
      )}

      {/* Grid info */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
        {inscrito.payment_link_created_at && (
          <div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Criado em</span>
            <p className="text-foreground font-medium">{fmtDate(inscrito.payment_link_created_at)}</p>
          </div>
        )}
        {inscrito.last_payment_link_sent_at && (
          <div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Último envio</span>
            <p className="text-foreground font-medium">{fmtDate(inscrito.last_payment_link_sent_at)}</p>
          </div>
        )}
        <div>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Próximo envio</span>
          <p className="text-foreground font-medium">
            {inscrito.followup_stage >= 3
              ? "Concluído"
              : inscrito.next_followup_at
                ? fmtDate(inscrito.next_followup_at)
                : "N/A"}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Follow-up automático</span>
          <p className="text-foreground font-medium">Etapa {Math.min(inscrito.followup_stage, 3)}/3</p>
        </div>
      </div>

      {/* Do not contact toggle */}
      {onToggleDoNotContact && (
        <div className="mt-3 pt-2 border-t border-border">
          <label className="flex items-center gap-1.5 cursor-pointer text-[12px]">
            <input
              type="checkbox"
              checked={inscrito.do_not_contact}
              onChange={() => onToggleDoNotContact(inscrito.id)}
              className="w-3.5 h-3.5 rounded accent-destructive"
            />
            <span className={inscrito.do_not_contact ? "text-destructive font-semibold" : "text-muted-foreground"}>
              Não contactar
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
