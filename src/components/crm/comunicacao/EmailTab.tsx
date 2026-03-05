import { useState, useMemo, useRef, useCallback } from "react";
import { Send, Loader2, Mail, X, Bold, Italic, Underline, List, Link2, Code, CheckCircle2, XCircle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Inscrito } from "@/pages/crm/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type WebinarFilter = "imagens" | "video" | "todos";
type PlanoFilter = "todos" | "pagos" | "premium" | "masterclass" | "free";

interface EmailTabProps {
  inscritos: Inscrito[];
}

/* ── Shared filtering logic ── */
function filterInscritos(list: Inscrito[], webinar: WebinarFilter, plano: PlanoFilter): Inscrito[] {
  return list.filter((i) => {
    if (i.status !== "activo") return false;
    // webinar
    if (webinar === "imagens" && i.webinar !== "imagens") return false;
    if (webinar === "video" && i.webinar !== "video") return false;
    // plano
    if (plano === "pagos" && !i.paid_at) return false;
    if (plano === "premium" && i.plan !== "premium") return false;
    if (plano === "masterclass" && i.plan !== "masterclass" && i.plan !== "bundle") return false;
    if (plano === "free" && i.paid_at) return false;
    return true;
  });
}

export { filterInscritos, type WebinarFilter, type PlanoFilter };

/* ── Filter bar component (reusable) ── */
export function FilterBar({
  webinar, setWebinar, plano, setPlano
}: {
  webinar: WebinarFilter; setWebinar: (v: WebinarFilter) => void;
  plano: PlanoFilter; setPlano: (v: PlanoFilter) => void;
}) {
  const chip = (active: boolean) => ({
    background: active ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
    color: active ? "#93c5fd" : "rgba(255,255,255,0.4)",
    border: `1px solid ${active ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.08)"}`,
  });

  return (
    <div className="space-y-2 mb-5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 mr-1">Webinar</span>
        {([["todos", "Todos"], ["imagens", "Imagens IA"], ["video", "Vídeo IA"]] as [WebinarFilter, string][]).map(([v, l]) => (
          <button key={v} onClick={() => setWebinar(v)} className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all" style={chip(webinar === v)}>{l}</button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 mr-1">Plano</span>
        {([["todos", "Todos"], ["pagos", "Pagos"], ["premium", "Premium"], ["masterclass", "Masterclass"], ["free", "Free"]] as [PlanoFilter, string][]).map(([v, l]) => (
          <button key={v} onClick={() => setPlano(v)} className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all" style={chip(plano === v)}>{l}</button>
        ))}
      </div>
    </div>
  );
}

/* ── Rich text toolbar helpers ── */
function execCmd(cmd: string, val?: string) {
  document.execCommand(cmd, false, val);
}

/* ── Send result type ── */
type SendResult = { email: string; nome: string; ok: boolean; error?: string };

export default function EmailTab({ inscritos }: EmailTabProps) {
  const [webinar, setWebinar] = useState<WebinarFilter>("todos");
  const [plano, setPlano] = useState<PlanoFilter>("todos");
  const [recipients, setRecipients] = useState<Inscrito[]>([]);
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [rawMode, setRawMode] = useState(false);
  const [rawHtml, setRawHtml] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<SendResult[] | null>(null);

  const filteredPool = useMemo(() => filterInscritos(inscritos, webinar, plano), [inscritos, webinar, plano]);

  const searchResults = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    const selectedIds = new Set(recipients.map(r => r.id));
    return filteredPool
      .filter(i => !selectedIds.has(i.id) && (i.email.toLowerCase().includes(q) || i.nome.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [search, filteredPool, recipients]);

  const addRecipient = (i: Inscrito) => {
    setRecipients(prev => prev.some(r => r.id === i.id) ? prev : [...prev, i]);
    setSearch("");
    setShowDropdown(false);
  };

  const removeRecipient = (id: string) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const selectAllFiltered = () => {
    const selectedIds = new Set(recipients.map(r => r.id));
    const toAdd = filteredPool.filter(i => !selectedIds.has(i.id));
    setRecipients(prev => [...prev, ...toAdd]);
  };

  const getHtml = useCallback(() => {
    if (rawMode) return rawHtml;
    return editorRef.current?.innerHTML || "";
  }, [rawMode, rawHtml]);

  const handleSend = async () => {
    const html = getHtml();
    if (recipients.length === 0 || !subject || !html.trim() || sending) return;
    setSending(true);
    setProgress({ sent: 0, total: recipients.length });
    const sendResults: SendResult[] = [];

    for (const r of recipients) {
      try {
        const { data, error } = await supabase.functions.invoke("send-email", {
          body: { to: r.email, subject, html },
        });
        if (error) throw error;
        sendResults.push({ email: r.email, nome: r.nome, ok: !!data?.success, error: data?.error });
      } catch (err: any) {
        sendResults.push({ email: r.email, nome: r.nome, ok: false, error: err.message });
      }
      setProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
    }

    setResults(sendResults);
    setSending(false);
  };

  const resetForm = () => {
    setRecipients([]);
    setSubject("");
    if (editorRef.current) editorRef.current.innerHTML = "";
    setRawHtml("");
    setResults(null);
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const avatarColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
  const getAvatarColor = (name: string) => avatarColors[name.length % avatarColors.length];

  const successCount = results?.filter(r => r.ok).length ?? 0;
  const failCount = results?.filter(r => !r.ok).length ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 4px 15px -3px rgba(37,99,235,0.4)" }}>
          <Mail size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Enviar Email</h2>
          <p className="text-[11px] text-white/40">Editor de texto, filtros e envio em lote</p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar webinar={webinar} setWebinar={setWebinar} plano={plano} setPlano={setPlano} />

      <div className="space-y-5 max-w-3xl">
        {/* Recipients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              Destinatários ({recipients.length})
            </label>
            {filteredPool.length > 0 && (
              <button onClick={selectAllFiltered} className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full transition-all hover:bg-white/5" style={{ color: "#93c5fd" }}>
                <Users size={10} /> Seleccionar todos ({filteredPool.length})
              </button>
            )}
          </div>

          {/* Chips */}
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {recipients.map(r => (
                <span key={r.id} className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-0.5 text-[11px] font-medium" style={{ background: "rgba(59,130,246,0.12)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.25)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: getAvatarColor(r.nome) }}>{getInitials(r.nome)}</span>
                  {r.primeiro_nome || r.nome.split(" ")[0]}
                  <button onClick={() => removeRecipient(r.id)} className="hover:bg-white/10 rounded-full p-0.5"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}

          {/* Search input */}
          <div className="relative">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => search && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Pesquisar inscrito por nome ou email…"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
              style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }}
            />
            <AnimatePresence>
              {showDropdown && searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute z-20 top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(180deg, #1e293b, #172033)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  {searchResults.map(i => (
                    <button key={i.id} onMouseDown={() => addRecipient(i)} className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-white/5 transition-colors">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: getAvatarColor(i.nome) }}>{getInitials(i.nome)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-white/85 truncate">{i.nome}</div>
                        <div className="text-[10px] text-white/35">{i.email}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Assunto</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Assunto do email…" className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25" style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }} />
        </div>

        {/* Body — Rich editor or raw HTML */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Corpo</label>
            <button onClick={() => {
              if (!rawMode && editorRef.current) setRawHtml(editorRef.current.innerHTML);
              if (rawMode && editorRef.current) editorRef.current.innerHTML = rawHtml;
              setRawMode(!rawMode);
            }} className="text-[9px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full transition-all hover:bg-white/5" style={{ color: rawMode ? "#fbbf24" : "rgba(255,255,255,0.35)" }}>
              <Code size={10} /> {rawMode ? "Editor visual" : "HTML raw"}
            </button>
          </div>

          {rawMode ? (
            <textarea value={rawHtml} onChange={(e) => setRawHtml(e.target.value)} rows={12} placeholder="<p>Olá…</p>" className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-y font-mono placeholder:text-white/20" style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }} />
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)" }}>
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 px-2 py-1.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {[
                  { cmd: "bold", icon: <Bold size={14} />, label: "Negrito" },
                  { cmd: "italic", icon: <Italic size={14} />, label: "Itálico" },
                  { cmd: "underline", icon: <Underline size={14} />, label: "Sublinhado" },
                  { cmd: "insertUnorderedList", icon: <List size={14} />, label: "Lista" },
                ].map(b => (
                  <button key={b.cmd} onMouseDown={(e) => { e.preventDefault(); execCmd(b.cmd); }} title={b.label} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors">
                    {b.icon}
                  </button>
                ))}
                <button onMouseDown={(e) => {
                  e.preventDefault();
                  const url = prompt("URL do link:");
                  if (url) execCmd("createLink", url);
                }} title="Link" className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors">
                  <Link2 size={14} />
                </button>
              </div>
              {/* Editable area */}
              <div ref={editorRef} contentEditable suppressContentEditableWarning className="min-h-[200px] px-4 py-3 text-sm text-white outline-none prose prose-invert prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_a]:text-blue-400 [&_a]:underline" style={{ lineHeight: 1.7 }} />
            </div>
          )}
        </div>

        {/* Send button */}
        <div className="flex items-center justify-between">
          {sending && (
            <span className="text-[11px] text-white/50 font-mono">
              {progress.sent}/{progress.total} enviados…
            </span>
          )}
          <div className="flex-1" />
          <motion.button onClick={handleSend} disabled={recipients.length === 0 || !subject || sending} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="relative flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all disabled:opacity-30 disabled:pointer-events-none overflow-hidden" style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: recipients.length === 0 || !subject ? "none" : "0 8px 25px -5px rgba(37,99,235,0.4)" }}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Enviar Email {recipients.length > 1 ? `(${recipients.length})` : ""}
          </motion.button>
        </div>
      </div>

      {/* Results modal */}
      <Dialog open={!!results} onOpenChange={(open) => { if (!open) setResults(null); }}>
        <DialogContent className="sm:max-w-md" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {failCount === 0 ? <CheckCircle2 size={20} className="text-green-400" /> : <XCircle size={20} className="text-amber-400" />}
              Envio concluído
            </DialogTitle>
            <DialogDescription className="text-white/50">
              {successCount} enviados com sucesso{failCount > 0 ? `, ${failCount} falharam` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-1 mt-2">
            {results?.map((r, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[12px] py-1.5 px-2 rounded-lg" style={{ background: r.ok ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)" }}>
                {r.ok ? <CheckCircle2 size={12} className="text-green-400 shrink-0" /> : <XCircle size={12} className="text-red-400 shrink-0" />}
                <span className="text-white/80 truncate flex-1">{r.nome}</span>
                <span className="text-white/30 text-[10px] truncate">{r.email}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={resetForm} className="flex-1 text-[12px] font-semibold py-2 rounded-lg text-white/70 hover:bg-white/5 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Enviar outro</button>
            <button onClick={() => setResults(null)} className="flex-1 text-[12px] font-semibold py-2 rounded-lg text-white" style={{ background: "#2563eb" }}>Fechar</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
