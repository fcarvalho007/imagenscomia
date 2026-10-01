import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Send, AlertTriangle, Mail, MessageSquare, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

interface SendConfirmDialogProps {
  queued?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  channel: "email" | "sms";
  recipientCount: number;
  subject?: string;
  messagePreview?: string;
  scheduledAt?: Date | null;
}

export default function SendConfirmDialog({
  open, onOpenChange, onConfirm, channel, recipientCount, subject, messagePreview, scheduledAt, queued,
}: SendConfirmDialogProps) {
  const isEmail = channel === "email";
  const Icon = isEmail ? Mail : MessageSquare;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            {queued ? "Confirmar agendamento na fila" : "Confirmar envio"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Revise os detalhes antes de enviar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Channel */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#F8FAFC" }}>
            <Icon size={14} className="text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-600">{isEmail ? "Email" : "SMS"}</span>
          </div>

          {/* Subject / preview */}
          {subject && (
            <div className="px-3 py-2 rounded-lg" style={{ background: "#F8FAFC" }}>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Assunto</span>
              <p className="text-[12px] font-medium text-slate-800 mt-0.5 truncate">{subject}</p>
            </div>
          )}
          {messagePreview && !subject && (
            <div className="px-3 py-2 rounded-lg" style={{ background: "#F8FAFC" }}>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Mensagem</span>
              <p className="text-[12px] text-slate-700 mt-0.5 line-clamp-2">{messagePreview}</p>
            </div>
          )}

          {/* Recipients */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#F8FAFC" }}>
            <Users size={14} className="text-slate-400" />
            <span className="text-[12px] font-semibold text-slate-800">{recipientCount} destinatário{recipientCount !== 1 ? "s" : ""}</span>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: scheduledAt ? "#FFFBEB" : "#F8FAFC" }}>
            <Clock size={14} className={scheduledAt ? "text-amber-500" : "text-slate-400"} />
            <span className="text-[12px] font-medium" style={{ color: scheduledAt ? "#92400e" : "#64748B" }}>
              {scheduledAt
                ? `Agendado: ${scheduledAt.toLocaleDateString("pt-PT")} às ${scheduledAt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`
                : queued ? "Próxima execução elegível do serviço" : "Envio imediato"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => onOpenChange(false)} className="flex-1 text-[12px] font-semibold py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors border border-slate-200">
            Cancelar
          </button>
          <motion.button
            onClick={() => { onOpenChange(false); onConfirm(); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 text-[12px] font-bold py-2.5 rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 4px 15px -3px rgba(37,99,235,0.3)" }}
          >
            <Send size={13} /> {queued ? "Confirmar agendamento na fila" : "Confirmar envio"}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
