import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Eye, Loader2, History, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  text_body: string | null;
  html_body: string | null;
  is_active: boolean;
  version: number;
  variables: string[];
  updated_at: string;
  updated_by: string | null;
}

const ALLOWED_VARS = ["name", "payment_link", "plan_selected", "support_whatsapp", "webinar_date"];

const SAMPLE_VARS: Record<string, string> = {
  name: "Maria",
  payment_link: "https://exemplo.pt/pagamento",
  plan_selected: "Premium Pass (15+IVA)",
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

function findUnknownPlaceholders(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.slice(2, -2)).filter(v => !ALLOWED_VARS.includes(v)))];
}

function findMissingRequiredVars(text: string, required: string[]): string[] {
  return required.filter(v => !text.includes(`{{${v}}}`));
}

export default function TemplatesView() {
  const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState<string | null>(null);

  // Edit form state
  const [editSubject, setEditSubject] = useState("");
  const [editTextBody, setEditTextBody] = useState("");
  const [editHtmlBody, setEditHtmlBody] = useState("");
  const [editVars, setEditVars] = useState<string[]>([]);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("email_templates")
      .select("*")
      .order("template_key")
      .order("version", { ascending: false });
    if (data) setAllTemplates(data as unknown as EmailTemplate[]);
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  // Group: active templates (one per key)
  const activeTemplates = useMemo(() => {
    const seen = new Set<string>();
    return allTemplates.filter(t => {
      if (t.is_active && !seen.has(t.template_key)) {
        seen.add(t.template_key);
        return true;
      }
      return false;
    });
  }, [allTemplates]);

  // Version history for a given key
  const historyFor = (key: string) =>
    allTemplates.filter(t => t.template_key === key).sort((a, b) => b.version - a.version);

  const versionCount = (key: string) =>
    allTemplates.filter(t => t.template_key === key).length;

  const openEdit = (tpl: EmailTemplate) => {
    setEditing(tpl);
    setEditSubject(tpl.subject);
    setEditTextBody(tpl.text_body || "");
    setEditHtmlBody(tpl.html_body || "");
    setEditVars(Array.isArray(tpl.variables) ? tpl.variables : []);
    setShowPreview(true);
    setShowHistory(null);
  };

  // Validation
  const fullBody = editHtmlBody || editTextBody;
  const fullText = editSubject + " " + fullBody;
  const unknownVars = findUnknownPlaceholders(fullText);
  const missingRequired = findMissingRequiredVars(fullText, editVars);
  const missingPaymentLink = !fullText.includes("{{payment_link}}");
  const hasErrors = unknownVars.length > 0 || missingRequired.length > 0 || missingPaymentLink;

  const handleSave = async () => {
    if (!editing || hasErrors) return;
    setSaving(true);

    // Versioned save: create new version, deactivate old
    const newVersion = editing.version + 1;

    // Deactivate old
    await supabase
      .from("email_templates")
      .update({ is_active: false, updated_at: new Date().toISOString(), updated_by: "crm" })
      .eq("id", editing.id);

    // Insert new version
    await supabase
      .from("email_templates")
      .insert({
        template_key: editing.template_key,
        name: editing.name,
        subject: editSubject,
        text_body: editTextBody || null,
        html_body: editHtmlBody || null,
        is_active: true,
        version: newVersion,
        variables: editVars as unknown as any,
        updated_at: new Date().toISOString(),
        updated_by: "crm",
      });

    setSaving(false);
    setEditing(null);
    fetchTemplates();
  };

  const handleRestore = async (tpl: EmailTemplate) => {
    // Deactivate current active for this key
    await supabase
      .from("email_templates")
      .update({ is_active: false, updated_at: new Date().toISOString(), updated_by: "crm" })
      .eq("template_key", tpl.template_key)
      .eq("is_active", true);

    // Activate the selected version
    await supabase
      .from("email_templates")
      .update({ is_active: true, updated_at: new Date().toISOString(), updated_by: "crm" })
      .eq("id", tpl.id);

    setShowHistory(null);
    fetchTemplates();
  };

  const toggleActive = async (tpl: EmailTemplate) => {
    if (!tpl.is_active) {
      // Deactivate current active for this key first
      await supabase
        .from("email_templates")
        .update({ is_active: false, updated_at: new Date().toISOString(), updated_by: "crm" })
        .eq("template_key", tpl.template_key)
        .eq("is_active", true);
    }
    await supabase
      .from("email_templates")
      .update({ is_active: !tpl.is_active, updated_at: new Date().toISOString(), updated_by: "crm" })
      .eq("id", tpl.id);
    fetchTemplates();
  };

  return (
    <div className="p-7 max-sm:p-4 bg-off-white min-h-screen">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-[22px] text-ink-900">Templates de Email</h1>
        <p className="text-sm text-ink-500">Edita os templates usados pelo follow-up automático. Cada edição cria uma nova versão.</p>
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
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">Nome</th>
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 max-sm:hidden">Template Key</th>
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">Assunto</th>
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 text-center">v.</th>
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 text-center">Activo</th>
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 max-sm:hidden">Actualizado</th>
                <th className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 text-center">Hist.</th>
              </tr>
            </thead>
            <tbody>
              {activeTemplates.map((tpl) => (
                <tr
                  key={tpl.id}
                  className="border-b border-border last:border-0 hover:bg-blue-50/40 cursor-pointer transition-colors"
                  onClick={() => openEdit(tpl)}
                >
                  <td className="px-4 py-3 text-[13px] font-medium text-ink-800">{tpl.name || tpl.template_key}</td>
                  <td className="px-4 py-3 text-[12px] text-ink-500 font-mono max-sm:hidden">{tpl.template_key}</td>
                  <td className="px-4 py-3 text-[13px] text-ink-600 max-w-[200px] truncate">{tpl.subject}</td>
                  <td className="px-4 py-3 text-[12px] text-ink-500 text-center font-mono">v{tpl.version}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(tpl); }}
                      className={`w-9 h-5 rounded-full relative transition-colors ${tpl.is_active ? "bg-green-500" : "bg-ink-200"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${tpl.is_active ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink-400 max-sm:hidden">{fmtDate(tpl.updated_at)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowHistory(showHistory === tpl.template_key ? null : tpl.template_key); }}
                      className="text-ink-400 hover:text-blue-600 transition-colors"
                      title="Ver histórico de versões"
                    >
                      <History size={14} />
                      <span className="text-[10px] ml-0.5">{versionCount(tpl.template_key)}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Version History Inline */}
      {showHistory && (
        <div className="mt-4 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-[15px] text-ink-900">
              Histórico: <span className="font-mono text-[13px] text-ink-500">{showHistory}</span>
            </h3>
            <button onClick={() => setShowHistory(null)} className="text-ink-400 hover:text-ink-700"><X size={16} /></button>
          </div>
          <div className="space-y-2">
            {historyFor(showHistory).map((v) => (
              <div key={v.id} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${v.is_active ? "border-green-300 bg-green-50/50" : "border-border bg-off-white"}`}>
                <div>
                  <span className="font-mono text-[13px] font-semibold text-ink-700">v{v.version}</span>
                  {v.is_active && <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-500 text-white">ACTIVO</span>}
                  <p className="text-[12px] text-ink-500 mt-0.5 truncate max-w-[400px]">{v.subject}</p>
                  <p className="text-[11px] text-ink-400">{fmtDate(v.updated_at)}</p>
                </div>
                {!v.is_active && (
                  <button
                    onClick={() => handleRestore(v)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <RotateCcw size={12} /> Restaurar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setEditing(null)} />
          <div
            className="fixed z-[101] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(760px, 95vw)", maxHeight: "92vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="font-heading font-bold text-[16px] text-ink-900">Editar Template</h2>
                <p className="text-[12px] text-ink-400">
                  <span className="font-mono">{editing.template_key}</span> · v{editing.version} → <span className="text-blue-600 font-semibold">v{editing.version + 1}</span>
                </p>
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

              {/* Required variables checkboxes */}
              <div>
                <label className="text-[12px] font-semibold text-ink-600 uppercase tracking-wider mb-2 block">Variáveis obrigatórias</label>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_VARS.map((v) => (
                    <label key={v} className="flex items-center gap-1.5 text-[13px] text-ink-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editVars.includes(v)}
                        onChange={() => setEditVars(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
                        className="rounded border-border"
                      />
                      <span className="font-mono text-[12px]">{`{{${v}}}`}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Validation warnings */}
              {hasErrors && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 space-y-1">
                  {missingPaymentLink && (
                    <p className="text-[12px] text-red-700 flex items-center gap-1"><AlertTriangle size={12} /> Falta <span className="font-mono">{`{{payment_link}}`}</span> no assunto ou corpo.</p>
                  )}
                  {missingRequired.length > 0 && (
                    <p className="text-[12px] text-red-700 flex items-center gap-1"><AlertTriangle size={12} /> Variáveis obrigatórias em falta: {missingRequired.map(v => `{{${v}}}`).join(", ")}</p>
                  )}
                  {unknownVars.length > 0 && (
                    <p className="text-[12px] text-red-700 flex items-center gap-1"><AlertTriangle size={12} /> Placeholders desconhecidos: {unknownVars.map(v => `{{${v}}}`).join(", ")}</p>
                  )}
                </div>
              )}

              {!hasErrors && (
                <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                  <p className="text-[12px] text-green-700 flex items-center gap-1"><CheckCircle2 size={12} /> Template válido. Pronto para guardar.</p>
                </div>
              )}

              {/* Preview */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Eye size={14} /> {showPreview ? "Esconder preview" : "Ver preview"}
              </button>

              {showPreview && fullBody && (
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
                disabled={saving || hasErrors}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                title={hasErrors ? "Corrige os erros antes de guardar" : ""}
              >
                <Save size={14} /> {saving ? "A guardar..." : `Guardar como v${editing.version + 1}`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
