import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Eye, Loader2 } from "lucide-react";

interface EmailTemplate {
  id: string;
  template_key: string;
  subject: string;
  text_body: string | null;
  html_body: string | null;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

const SAMPLE_VARS: Record<string, string> = {
  name: "Maria",
  payment_link: "https://exemplo.pt/pagamento",
  plan_selected: "Premium",
  support_whatsapp: "915 015 508",
  webinar_date: "18 Fev 2026 · 10h00",
};

function replacePlaceholders(text: string): string {
  let result = text;
  for (const [key, value] of Object.entries(SAMPLE_VARS)) {
    result = result.split(`{{${key}}}`).join(value);
  }
  return result;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default function TemplatesView() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Edit form state
  const [editSubject, setEditSubject] = useState("");
  const [editTextBody, setEditTextBody] = useState("");
  const [editHtmlBody, setEditHtmlBody] = useState("");

  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("email_templates")
      .select("*")
      .order("template_key");
    if (data) setTemplates(data);
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const openEdit = (tpl: EmailTemplate) => {
    setEditing(tpl);
    setEditSubject(tpl.subject);
    setEditTextBody(tpl.text_body || "");
    setEditHtmlBody(tpl.html_body || "");
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await supabase
      .from("email_templates")
      .update({
        subject: editSubject,
        text_body: editTextBody || null,
        html_body: editHtmlBody || null,
        updated_at: new Date().toISOString(),
        updated_by: "crm",
      })
      .eq("id", editing.id);
    setSaving(false);
    setEditing(null);
    fetchTemplates();
  };

  const toggleActive = async (tpl: EmailTemplate) => {
    await supabase
      .from("email_templates")
      .update({ is_active: !tpl.is_active, updated_at: new Date().toISOString(), updated_by: "crm" })
      .eq("id", tpl.id);
    fetchTemplates();
  };

  const previewBody = editHtmlBody || editTextBody;

  return (
    <div className="p-7 max-sm:p-4 bg-off-white min-h-screen">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-[22px] text-ink-900">Templates de Email</h1>
        <p className="text-sm text-ink-500">Edita os templates usados pelo follow-up automático</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-ink-400 py-8">
          <Loader2 size={16} className="animate-spin" /> A carregar...
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-off-white">
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">Template Key</th>
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">Assunto</th>
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 text-center">Activo</th>
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr
                  key={tpl.id}
                  className="border-b border-border last:border-0 hover:bg-blue-50/40 cursor-pointer transition-colors"
                  onClick={() => openEdit(tpl)}
                >
                  <td className="px-4 py-3 text-[13px] font-medium text-ink-800 font-mono">{tpl.template_key}</td>
                  <td className="px-4 py-3 text-[13px] text-ink-600 max-w-[300px] truncate">{tpl.subject}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(tpl); }}
                      className={`w-9 h-5 rounded-full relative transition-colors ${tpl.is_active ? "bg-green-500" : "bg-ink-200"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${tpl.is_active ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink-400">{fmtDate(tpl.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setEditing(null)} />
          <div
            className="fixed z-[101] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(720px, 95vw)", maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="font-heading font-bold text-[16px] text-ink-900">Editar Template</h2>
                <p className="text-[12px] text-ink-400 font-mono">{editing.template_key}</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-1 text-ink-400 hover:text-ink-700 transition-colors"><X size={20} /></button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-ink-600 uppercase tracking-wider mb-1 block">Assunto</label>
                <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="text-[14px]" />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-ink-600 uppercase tracking-wider mb-1 block">Corpo (texto)</label>
                <Textarea value={editTextBody} onChange={(e) => setEditTextBody(e.target.value)} rows={6} className="text-[13px] font-mono" />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-ink-600 uppercase tracking-wider mb-1 block">Corpo (HTML) <span className="text-ink-400 normal-case font-normal">— opcional</span></label>
                <Textarea value={editHtmlBody} onChange={(e) => setEditHtmlBody(e.target.value)} rows={6} className="text-[13px] font-mono" />
              </div>

              {/* Placeholders hint */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                <p className="text-[11px] text-blue-700 font-medium mb-1">Variáveis disponíveis:</p>
                <p className="text-[11px] text-blue-600 font-mono">
                  {"{{name}}"} · {"{{payment_link}}"} · {"{{plan_selected}}"} · {"{{support_whatsapp}}"} · {"{{webinar_date}}"}
                </p>
              </div>

              {/* Preview toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Eye size={14} /> {showPreview ? "Esconder preview" : "Ver preview"}
              </button>

              {showPreview && previewBody && (
                <div className="rounded-xl border border-border bg-off-white p-4">
                  <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-2">Preview com dados de exemplo</p>
                  <div className="bg-white rounded-lg border border-border p-4">
                    <p className="text-[13px] font-semibold text-ink-800 mb-2">Assunto: {replacePlaceholders(editSubject)}</p>
                    <hr className="border-border mb-3" />
                    {editHtmlBody ? (
                      <div className="text-[13px] text-ink-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: replacePlaceholders(editHtmlBody) }} />
                    ) : (
                      <pre className="text-[13px] text-ink-700 whitespace-pre-wrap leading-relaxed">{replacePlaceholders(editTextBody)}</pre>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border shrink-0">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-ink-600 hover:bg-off-white transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save size={14} /> {saving ? "A guardar..." : "Guardar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
