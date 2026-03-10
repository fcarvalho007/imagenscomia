import { useState } from "react";
import { Send, Loader2, BookOpen, Check, Mail, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Inscrito } from "@/pages/crm/mockData";

interface TabComunicacaoProps {
  inscrito: Inscrito;
  onLogsRefresh?: () => void;
}

type SmsProvider = "smseasy" | "egoi";

export default function TabComunicacao({ inscrito, onLogsRefresh }: TabComunicacaoProps) {
  // SMS state
  const [smsProvider, setSmsProvider] = useState<SmsProvider>("smseasy");
  const [smsText, setSmsText] = useState("");
  const [smsSending, setSmsSending] = useState(false);

  // Email state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  // Recursos state
  const [recursosSending, setRecursosSending] = useState(false);
  const [recursosSent, setRecursosSent] = useState(false);

  const hasPhone = !!inscrito.whatsapp;
  const isPaid = !!(inscrito.paid_at || inscrito.premium_granted_at);
  const hasPaidPlan = isPaid && inscrito.plan_selected && inscrito.plan_selected !== "free";

  const charCount = smsText.length;
  const hasUnicode = /[^\x00-\x7F]/.test(smsText);
  const maxChars = hasUnicode ? 70 : 160;

  const getAdminEmail = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.email || "";
  };

  // ── SMS ──
  const handleSendSms = async () => {
    if (!smsText.trim() || smsSending) return;
    setSmsSending(true);
    try {
      const adminEmail = await getAdminEmail();
      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: { to: inscrito.whatsapp, text: smsText.trim(), provider: smsProvider, registrationId: inscrito.id },
        headers: { "x-crm-admin-email": adminEmail },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`SMS enviado via ${smsProvider === "smseasy" ? "SMSEasy (IMAGENSIA)" : "E-goi (915015508)"}`);
        setSmsText("");
        onLogsRefresh?.();
      } else {
        toast.error(data?.error || "Erro ao enviar SMS");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar SMS");
    } finally {
      setSmsSending(false);
    }
  };

  // ── Email ──
  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim() || emailSending) return;
    setEmailSending(true);
    try {
      const adminEmail = await getAdminEmail();
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: inscrito.email,
          subject: emailSubject.trim(),
          html: emailBody.trim(),
          fname: inscrito.primeiro_nome || inscrito.nome,
          registrationId: inscrito.id,
          templateKey: "manual_crm_email",
        },
        headers: { "x-crm-admin-email": adminEmail },
      });
      if (error) throw error;
      toast.success(`Email enviado para ${inscrito.email}`);
      setEmailSubject("");
      setEmailBody("");
      onLogsRefresh?.();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar email");
    } finally {
      setEmailSending(false);
    }
  };

  // ── Recursos ──
  const handleSendRecursos = async () => {
    if (!confirm(`Enviar email de acesso aos recursos para ${inscrito.nome}?`)) return;
    setRecursosSending(true);
    try {
      const adminEmail = await getAdminEmail();
      const { data, error } = await supabase.functions.invoke("send-video-recursos-single", {
        body: { registration_id: inscrito.id },
        headers: { "x-crm-admin-email": adminEmail },
      });
      if (error) throw error;
      if (data?.success) {
        setRecursosSent(true);
        toast.success(`Email de recursos enviado para ${inscrito.email}`);
        onLogsRefresh?.();
      } else {
        toast.error(data?.error || "Falha ao enviar email");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao enviar email de recursos");
    } finally {
      setRecursosSending(false);
    }
  };

  const radioStyle = (active: boolean) => ({
    background: active ? "rgba(59,130,246,0.12)" : "rgba(0,0,0,0.03)",
    border: `1px solid ${active ? "rgba(59,130,246,0.4)" : "rgba(0,0,0,0.08)"}`,
    color: active ? "#2563eb" : "#64748b",
  });

  return (
    <div className="space-y-6">
      {/* ── Atalho Recursos ── */}
      {hasPaidPlan && (
        <div className="rounded-xl p-4" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-500" />
                Email de acesso aos recursos
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Envia o email com links de acesso ao plano {inscrito.plan_selected}
              </p>
            </div>
            <button
              onClick={handleSendRecursos}
              disabled={recursosSending || recursosSent}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: recursosSent ? "#22c55e" : "#6366f1" }}
            >
              {recursosSending ? <Loader2 size={12} className="animate-spin" /> : recursosSent ? <Check size={12} /> : <Send size={12} />}
              {recursosSent ? "Enviado ✓" : "Enviar"}
            </button>
          </div>
        </div>
      )}

      {/* ── SMS ── */}
      {hasPhone && (
        <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-1.5 mb-3">
            <MessageSquare size={14} className="text-blue-500" />
            SMS para {inscrito.whatsapp}
          </h4>

          {/* Provider */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => setSmsProvider("smseasy")} className="flex-1 rounded-lg px-3 py-2 text-[12px] font-medium transition-all" style={radioStyle(smsProvider === "smseasy")}>
              IMAGENSIA
              <span className="block text-[10px] opacity-60">SMSEasy · alfanumérico</span>
            </button>
            <button onClick={() => setSmsProvider("egoi")} className="flex-1 rounded-lg px-3 py-2 text-[12px] font-medium transition-all" style={radioStyle(smsProvider === "egoi")}>
              915 015 508
              <span className="block text-[10px] opacity-60">E-goi · numérico</span>
            </button>
          </div>

          <textarea
            value={smsText}
            onChange={(e) => setSmsText(e.target.value.slice(0, 320))}
            placeholder="Escreva a mensagem SMS…"
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-[12px] text-foreground outline-none resize-none bg-background"
            style={{ border: "1px solid rgba(0,0,0,0.10)" }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px]" style={{ color: charCount > maxChars ? "#ef4444" : "#94a3b8" }}>
              {charCount}/{maxChars} {hasUnicode && "⚠ Unicode"}
            </span>
            <button
              onClick={handleSendSms}
              disabled={!smsText.trim() || smsSending}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-colors disabled:opacity-40"
              style={{ background: "#2563eb" }}
            >
              {smsSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Enviar SMS
            </button>
          </div>
        </div>
      )}

      {/* ── Email ── */}
      <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
        <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-1.5 mb-3">
          <Mail size={14} className="text-emerald-500" />
          Email para {inscrito.email}
        </h4>

        <input
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          placeholder="Assunto do email"
          className="w-full rounded-lg px-3 py-2 text-[12px] text-foreground outline-none bg-background mb-2"
          style={{ border: "1px solid rgba(0,0,0,0.10)" }}
        />
        <textarea
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          placeholder="Corpo do email (HTML suportado)…"
          rows={6}
          className="w-full rounded-lg px-3 py-2 text-[12px] text-foreground outline-none resize-none bg-background font-mono"
          style={{ border: "1px solid rgba(0,0,0,0.10)" }}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSendEmail}
            disabled={!emailSubject.trim() || !emailBody.trim() || emailSending}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-colors disabled:opacity-40"
            style={{ background: "#16a34a" }}
          >
            {emailSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Enviar Email
          </button>
        </div>
      </div>
    </div>
  );
}
