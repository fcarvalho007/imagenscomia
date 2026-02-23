import { useState, useEffect, useCallback } from "react";
import { X, Eye, Pencil, Loader2 } from "lucide-react";
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

interface Props {
  template: EmailTemplate | null;
  onClose: () => void;
  onSaved: (updated: EmailTemplate) => void;
}

export default function EmailEditorPanel({ template, onClose, onSaved }: Props) {
  const [localSubject, setLocalSubject] = useState("");
  const [localBody, setLocalBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (template) {
      setLocalSubject(template.subject);
      setLocalBody(template.html_body || "");
      setPreviewing(false);
    }
  }, [template]);

  const hasChanges = template && (localSubject !== template.subject || localBody !== (template.html_body || ""));

  const handleSave = useCallback(async () => {
    if (!template) return;
    setSaving(true);
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
  }, [template, localSubject, localBody, onSaved]);

  const handleCancel = () => {
    if (template) {
      setLocalSubject(template.subject);
      setLocalBody(template.html_body || "");
    }
  };

  if (!template) return null;

  const badge = getWebinarBadge(template.template_key);
  const emailLabel = getEmailLabel(template.template_key);

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
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 flex-shrink-0">
            <X size={18} style={{ color: "#64748B" }} />
          </button>
        </div>

        {/* Subject */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "16px 20px" }}>
          <label style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>
            Corpo do email (HTML)
          </label>

          {previewing ? (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, maxHeight: 400, overflow: "auto" }}>
              <iframe
                srcDoc={localBody.replace(/\{\{fname\}\}/g, "João").replace(/\{\{email\}\}/g, "joao@exemplo.com")}
                title="Email preview"
                style={{ width: "100%", minHeight: 360, border: "none" }}
                sandbox=""
              />
            </div>
          ) : (
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
          )}

          <p style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>
            💡 Variáveis disponíveis: {"{{fname}}"}, {"{{email}}"}
          </p>
        </div>

        {/* Preview toggle */}
        <div style={{ padding: "8px 20px" }}>
          <button
            onClick={() => setPreviewing(!previewing)}
            className="flex items-center gap-1.5 text-[13px] font-medium hover:underline"
            style={{ color: "#3b82f6" }}
          >
            {previewing ? <><Pencil size={14} /> Editar HTML</> : <><Eye size={14} /> Pré-visualizar email</>}
          </button>
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
