import { Copy, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import type { Inscrito } from "@/pages/crm/mockData";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const PLAN_INFO: Record<string, { label: string; price: string }> = {
  free: { label: "Gratuito", price: "" },
  premium: { label: "Premium", price: "€15" },
  masterclass: { label: "Masterclass", price: "€57,81" },
  bundle: { label: "Bundle", price: "€76,26" },
};

const STATUS_CHIP: Record<string, { label: string; className: string }> = {
  paid: { label: "Pago", className: "bg-green-100 text-green-700 border-green-200" },
  awaiting_payment: { label: "Aguarda pagamento", className: "bg-red-100 text-red-700 border-red-200" },
  selected: { label: "Seleccionou e saiu", className: "bg-orange-100 text-orange-700 border-orange-200" },
  free: { label: "Gratuito", className: "bg-muted text-muted-foreground border-border" },
};

function fmtDateShort(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

interface ClientHeaderProps {
  inscrito: Inscrito;
}

export default function ClientHeader({ inscrito }: ClientHeaderProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const status = STATUS_CHIP[inscrito.payment_status] || STATUS_CHIP.free;
  const plan = PLAN_INFO[inscrito.plan] || PLAN_INFO.free;

  const copyRef = () => {
    if (!inscrito.eupago_ref) return;
    navigator.clipboard.writeText(inscrito.eupago_ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 1500);
  };

  // Next action
  let nextAction = "";
  let nextIcon: React.ReactNode = null;
  if (inscrito.paid_at) {
    nextAction = `Pago em ${fmtDateShort(inscrito.paid_at)}`;
    nextIcon = <CheckCircle2 size={12} className="text-green-600" />;
  } else if (inscrito.followup_stage >= 3) {
    nextAction = "Follow-up concluído";
    nextIcon = <CheckCircle2 size={12} className="text-muted-foreground" />;
  } else if (inscrito.next_followup_at) {
    const isOverdue = new Date(inscrito.next_followup_at).getTime() <= Date.now();
    if (isOverdue) {
      nextAction = "Em atraso";
      nextIcon = <AlertTriangle size={12} className="text-red-600" />;
    } else {
      const d = new Date(inscrito.next_followup_at);
      nextAction = `${d.getDate()}/${d.getMonth()+1} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
      nextIcon = <Clock size={12} className="text-muted-foreground" />;
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-white flex flex-wrap items-center gap-2 py-2.5 px-1 border-b border-border mb-4">
      {/* Status chip */}
      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${status.className}`}>
        {status.label}
      </span>

      {/* Plan + price */}
      {inscrito.plan !== "free" && (
        <span className="text-[13px] font-semibold text-foreground">
          {plan.label} — {plan.price}
        </span>
      )}

      {/* Step */}
      <span className="text-[12px] font-medium text-muted-foreground">
        Passo {inscrito.step_reached}/5
      </span>

      {/* EuPago ref */}
      {inscrito.eupago_ref && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={copyRef}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Copiar referência EuPago"
              >
                <span className="font-mono truncate max-w-[100px]">{inscrito.eupago_ref}</span>
                <Copy size={10} />
                {copiedRef && <span className="text-green-600 text-[10px]">✓</span>}
              </button>
            </TooltipTrigger>
            <TooltipContent>{inscrito.eupago_ref}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Next action */}
      {nextAction && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {nextIcon}
            {nextAction}
          </span>
        </>
      )}
    </div>
  );
}
