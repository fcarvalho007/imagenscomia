import { useState, useEffect, useCallback } from "react";
import { X, Eye, Pencil, Loader2, Copy, Check, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmailTemplate {
  template_key: string;
  name: string;
  subject: string;
  html_body: string | null;
  updated_at: string;
  updated_by: string | null;
}

interface SendLog {
  id: string;
  webinar: string;
  email_key: string;
  recipient_email: string;
  fname: string | null;
  status: string;
  resend_id: string | null;
  error_message: string | null;
  sent_at: string;
  metadata: string | null;
}

const EMAIL_KEY_LABELS: Record<string, string> = {
  confirmation: "Confirmação imediata",
  reminder_48h: "Lembrete 48h",
  reminder_24h: "Lembrete 24h",
  reminder_1h: "Começa em 1 hora",
  postwebinar: "Email pós-webinar",
};

function getEmailLabel(templateKey: string): string {
  for (const [key, label] of Object.entries(EMAIL_KEY_LABELS)) {
    if (templateKey.includes(key)) return label;
  }
  return templateKey;
}

function getWebinarBadge(templateKey: string): { label: string; bg: string; color: string } {
  if (templateKey.startsWith("video")) return { label: "🎬 Vídeo", bg: "#dcfce7", color: "#16a34a" };
  return { label: "📷 Imagens", bg: "#dbeafe", color: "#1e40af" };
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = d.getDate();
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const month = months[d.getMonth()];
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} · ${h}:${m}`;
  } catch {
    return "—";
  }
}

function parseTemplateKey(templateKey: string): { webinar: string; emailKey: string } {
  const parts = templateKey.split("_");
  const webinar = parts[0]; // "video" or "imagens"
  const emailKey = parts.slice(1).join("_"); // "confirmation", "reminder_48h", etc.
  return { webinar, emailKey };
}

type ViewMode = "edit" | "preview" | "history";

interface Props {
  course?: {label:string;save:(subject:string,body:string)=>Promise<string>;render:(subject:string,body:string)=>string};
  template: EmailTemplate | null;
  onClose: () => void;
  onSaved: (updated: EmailTemplate) => void;
}

/* ─── History Tab ─── */
function HistoryTab({ templateKey }: { templateKey: string }) {
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { webinar, emailKey } = parseTemplateKey(templateKey);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("email_send_logs")
      .select("*")
      .eq("webinar", webinar)
      .eq("email_key", emailKey)
      .order("sent_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setLogs((data as SendLog[]) || []);
        setLoading(false);
      });
  }, [webinar, emailKey]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const sentCount = logs.filter((l) => l.status === "sent").length;
  const failedCount = logs.filter((l) => l.status === "failed").length;
  const total = sentCount + failedCount;
  const successRate = total > 0 ? Math.round((sentCount / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin" style={{ color: "#94A3B8" }} />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ fontSize: 14, color: "#64748B" }}>Nenhum envio registado ainda para este email</p>
        <p style={{ fontSize: 11, color: "#aaa", marginTop: 12 }}>
          Nota: logs disponíveis apenas a partir de 23 Fev 2026. Envios anteriores não foram registados.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div
        className="flex flex-wrap gap-x-3 gap-y-1 mb-4"
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 12,
        }}
      >
        <span>Total: <strong>{sentCount}</strong> enviados</span>
        <span style={{ color: "#94A3B8" }}>·</span>
        <span style={{ color: failedCount > 0 ? "#ef4444" : undefined }}><strong>{failedCount}</strong> falharam</span>
        <span style={{ color: "#94A3B8" }}>·</span>
        <span>Taxa de sucesso: <strong>{successRate}%</strong></span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ textAlign: "left", padding: "8px 6px", color: "#64748B", fontWeight: 600, fontSize: 11 }}>Data/Hora</th>
              <th style={{ textAlign: "left", padding: "8px 6px", color: "#64748B", fontWeight: 600, fontSize: 11 }}>Email</th>
              <th style={{ textAlign: "left", padding: "8px 6px", color: "#64748B", fontWeight: 600, fontSize: 11 }}>Nome</th>
              <th style={{ textAlign: "left", padding: "8px 6px", color: "#64748B", fontWeight: 600, fontSize: 11 }}>Estado</th>
              <th style={{ textAlign: "left", padding: "8px 6px", color: "#64748B", fontWeight: 600, fontSize: 11 }}>Variante</th>
              <th style={{ textAlign: "left", padding: "8px 6px", color: "#64748B", fontWeight: 600, fontSize: 11 }}>ID Resend</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 6px", whiteSpace: "nowrap", color: "#333" }}>{formatDate(log.sent_at)}</td>
                <td style={{ padding: "8px 6px", color: "#333", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.recipient_email.length > 32 ? log.recipient_email.slice(0, 32) + "…" : log.recipient_email}
                </td>
                <td style={{ padding: "8px 6px", color: "#666" }}>{log.fname || "—"}</td>
                <td style={{ padding: "8px 6px" }}>
                  {log.status === "sent" ? (
                    <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 10, padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>Enviado</span>
                  ) : (
                    <span
                      title={log.error_message || "Erro desconhecido"}
                      style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, padding: "2px 8px", borderRadius: 12, fontWeight: 600, cursor: "help" }}
                    >
                      Falhou
                    </span>
                  )}
                </td>
                <td style={{ padding: "8px 6px" }}>
                  {(() => {
                    const meta = (() => {
                      try { return log.metadata ? JSON.parse(log.metadata) : null; }
                      catch { return null; }
                    })();
                    const v = meta?.variant || null;
                    if (!v) return <span style={{ color: "#ccc" }}>—</span>;
                    const cfg: Record<string, { bg: string; color: string; tip: string }> = {
                      A: { bg: "#f1f5f9", color: "#64748b", tip: "Novo inscrito — email standard" },
                      B: { bg: "#dbeafe", color: "#2563eb", tip: "Inscrito anterior (gratuito) — PS de reconhecimento" },
                      C: { bg: "#ede9fe", color: "#7c3aed", tip: "Cliente Premium anterior — PS orientado para Q&A Vídeo" },
                      D: { bg: "#fff7ed", color: "#d97706", tip: "Cliente Masterclass anterior — MC suprimida" },
                    };
                    const c = cfg[v] || cfg.A;
                    return (
                      <span title={c.tip} style={{ background: c.bg, color: c.color, fontSize: 10, padding: "2px 8px", borderRadius: 12, fontWeight: 600, cursor: "help" }}>
                        {v}
                      </span>
                    );
                  })()}
                </td>
                <td style={{ padding: "8px 6px" }}>
                  {log.resend_id ? (
                    <button
                      onClick={() => handleCopy(log.resend_id!)}
                      className="flex items-center gap-1 hover:underline"
                      style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#64748B" }}
                    >
                      {log.resend_id.length > 12 ? log.resend_id.slice(0, 12) + "…" : log.resend_id}
                      {copiedId === log.resend_id ? <Check size={10} style={{ color: "#16a34a" }} /> : <Copy size={10} />}
                    </button>
                  ) : (
                    <span style={{ color: "#ccc" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 11, color: "#aaa", marginTop: 16 }}>
        Nota: logs disponíveis apenas a partir de 23 Fev 2026. Envios anteriores não foram registados.
      </p>
    </div>
  );
}

/* ─── Main Panel ─── */
export default function EmailEditorPanel({ template, onClose, onSaved, course }: Props) {
  const [localSubject, setLocalSubject] = useState("");
  const [localBody, setLocalBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");

  useEffect(() => {
    if (template) {
      setLocalSubject(template.subject);
      setLocalBody(template.html_body || "");
      setViewMode("edit");
    }
  }, [template]);

  useEffect(()=>{
    if(!template)return;
    const previous=document.activeElement as HTMLElement|null;
    const close=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};
    document.addEventListener('keydown',close);
    return()=>{document.removeEventListener('keydown',close);previous?.focus();};
  },[template,onClose]);

  const hasChanges = template && (localSubject !== template.subject || localBody !== (template.html_body || ""));

  const handleSave = useCallback(async () => {
    if (!template) return;
    setSaving(true);
    if(course) {
      try {const updated=await course.save(localSubject,localBody);onSaved({...template,subject:localSubject,html_body:localBody,updated_at:updated});toast.success("Template guardado. Aplica-se às mensagens ainda não tentadas.");}
      catch {toast.error("Não foi possível guardar. Atualize se o template foi alterado por outro operador; assunto 2–160 caracteres e corpo 10–10000.");}
      finally {setSaving(false);}return;
    }
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("email_templates")
      .update({
        subject: localSubject,
        html_body: localBody,
        updated_at: now,
        updated_by: "crm_manual",
      })
      .eq("template_key", template.template_key);

    if (error) {
      toast.error("❌ Erro ao guardar — tenta novamente");
    } else {
      toast.success("✅ Template guardado com sucesso");
      onSaved({ ...template, subject: localSubject, html_body: localBody, updated_at: now, updated_by: "crm_manual" });
    }
    setSaving(false);
  }, [template, localSubject, localBody, onSaved, course]);

  const handleCancel = () => {
    if (template) {
      setLocalSubject(template.subject);
      setLocalBody(template.html_body || "");
    }
  };

  if (!template) return null;

  const badge = course ? {label:course.label,bg:"#dbeafe",color:"#2563eb"} : getWebinarBadge(template.template_key);
  const emailLabel = course ? template.name : getEmailLabel(template.template_key);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[49]"
        style={{ background: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full flex flex-col"
        style={{
          width: "min(560px, 100vw)",
          background: "white",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          animation: "slideInRight 250ms ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3" style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                style={{
                  background: badge.bg,
                  color: badge.color,
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 12,
                  fontWeight: 600,
                }}
              >
                {badge.label}
              </span>
              {hasChanges && (
                <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#d97706" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                  Alterações não guardadas
                </span>
              )}
            </div>
            <p className="font-heading font-bold text-[15px]" style={{ color: "#0F172A" }}>{emailLabel}</p>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#999", marginTop: 2 }}>{template.template_key}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar editor de email" className="p-1 rounded hover:bg-gray-100 flex-shrink-0">
            <X size={18} style={{ color: "#64748B" }} />
          </button>
        </div>

        {/* Subject (only in edit/preview modes) */}
        {viewMode !== "history" && (
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
            <label style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>
              Assunto
            </label>
            <input
              type="text"
              value={localSubject}
              onChange={(e) => setLocalSubject(e.target.value)}
              className="w-full"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Mode toggle tabs */}
        <div className="flex gap-1" style={{ padding: "8px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <button
            onClick={() => setViewMode("edit")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: viewMode === "edit" ? "#2563EB" : "transparent",
              color: viewMode === "edit" ? "#fff" : "#64748B",
            }}
          >
            <Pencil size={12} /> Editar
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: viewMode === "preview" ? "#2563EB" : "transparent",
              color: viewMode === "preview" ? "#fff" : "#64748B",
            }}
          >
            <Eye size={12} /> Pré-visualizar
          </button>
          <button
            onClick={() => setViewMode("history")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: viewMode === "history" ? "#2563EB" : "transparent",
              color: viewMode === "history" ? "#fff" : "#64748B",
            }}
          >
            <BarChart3 size={12} /> Histórico de envios
          </button>
        </div>

        {/* Body / Preview / History */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "16px 20px" }}>
          {viewMode === "edit" && (
            <>
              <label style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>
                {course ? "Corpo do email (texto)" : "Corpo do email (HTML)"}
              </label>
              <textarea
                value={localBody}
                onChange={(e) => setLocalBody(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 360,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 12,
                  lineHeight: 1.6,
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: 12,
                  resize: "vertical",
                  outline: "none",
                }}
              />
              <p style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>
                {course ? "A saudação, assinatura e botão são mantidos. Os links e as regras de envio continuam definidos pela edição." : "Variáveis disponíveis: {{fname}}, {{email}}"}
              </p>
            </>
          )}

          {viewMode === "preview" && (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, maxHeight: 400, overflow: "auto" }}>
              <iframe
                srcDoc={course ? course.render(localSubject,localBody) : localBody.replace(/\{\{fname\}\}/g, "João").replace(/\{\{email\}\}/g, "joao@exemplo.com")}
                title="Email preview"
                style={{ width: "100%", minHeight: 360, border: "none" }}
                sandbox=""
              />
            </div>
          )}

          {viewMode === "history" && (
            course ? <p className="text-sm">Consulte Pessoas nas automações para ver o estado das mensagens. Alterar este template não modifica mensagens já tentadas.</p> : <HistoryTab templateKey={template.template_key} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3" style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>
          <span style={{ fontSize: 11, color: "#999" }}>
            Última edição: {template.updated_at ? formatDate(template.updated_at) : "—"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors hover:bg-gray-100"
              style={{ color: "#64748B" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50"
              style={{ background: "#16a34a", color: "#fff" }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "A guardar..." : "Guardar alterações"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
