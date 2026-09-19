import { useState, useMemo } from "react";
import { Send, Loader2, Phone, X, Signal, Radio, MessageSquare, Smartphone, Users, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Inscrito } from "@/pages/crm/mockData";
import PhonePreview from "./PhonePreview";
import { FilterBar, filterInscritos, type WebinarFilter, type PlanoFilter } from "./EmailTab";
import SendConfirmDialog from "./SendConfirmDialog";
import SchedulePicker from "./SchedulePicker";

type Provider = "smseasy" | "egoi";

interface SmsTabProps {
  inscritos: Inscrito[];
  courseQueue?: (ids:string[],subject:string,body:string,date:Date|null)=>Promise<void>;
}

/* GSM 7-bit basic character set (plus extension) */
const GSM_REGEX = /[^\x20-\x7E\n\r@£$¥èéùìòÇØøÅåΔΦΓΛΩΠΨΣΘΞÆæßÉ ÄÖÑÜäöñüà§¿¡\u000C\u000E\u001B\u005B\u005C\u005D\u005E\u007B\u007C\u007D\u007E€]/;

function detectUnicode(text: string): boolean {
  return GSM_REGEX.test(text);
}

export default function SmsTab({ inscritos, courseQueue }: SmsTabProps) {
  const [provider, setProvider] = useState<Provider>("smseasy");
  const [recipients, setRecipients] = useState<Inscrito[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [webinar, setWebinar] = useState<WebinarFilter | null>("todos");
  const [plano, setPlano] = useState<PlanoFilter | null>("todos");
  const [showConfirm, setShowConfirm] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  const filteredPool = useMemo(() => filterInscritos(inscritos, webinar, plano).filter(i => !!i.whatsapp), [inscritos, webinar, plano]);

  const isUnicode = useMemo(() => detectUnicode(text), [text]);
  const maxChars = isUnicode ? 70 : 160;
  const charCount = text.length;
  const smsCount = charCount === 0 ? 1 : Math.ceil(charCount / maxChars);
  const charPct = Math.min((charCount / maxChars) * 100, 100);

  const progressColor =
    charPct < 70 ? "#22c55e" : charPct < 90 ? "#eab308" : "#ef4444";

  const senderLabel = courseQueue ? "Remetente configurado" : provider === "smseasy" ? "IMAGENSIA" : "915 015 508";

  const searchResults = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    const selectedIds = new Set(recipients.map(r => r.id));
    return filteredPool
      .filter(i => !selectedIds.has(i.id) && (i.whatsapp?.includes(q) || i.nome.toLowerCase().includes(q)))
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

  const handleSend = async () => {
    if (recipients.length === 0 || !text.trim() || sending) return;

    if (courseQueue) {
      if (text.length>160 || /[^\x20-\x7e]|[\[\]{}^~|\\]/.test(text)) {toast.error("Use até 160 caracteres básicos, sem acentos, emojis ou caracteres de extensão GSM.");return;}
      setSending(true);
      try {await courseQueue(recipients.map(r=>r.id),"",text,scheduledAt);setText("");setRecipients([]);setScheduledAt(null);}
      catch(error){toast.error(error instanceof Error?error.message:"Não foi possível agendar.");}
      finally {setSending(false);} return;
    }
    // If scheduled, save to DB and return
    if (scheduledAt) {
      try {
        const { error } = await supabase.from("scheduled_sends" as any).insert({
          channel: "sms",
          text_body: text.trim(),
          recipients: recipients.map(r => ({ id: r.id, whatsapp: r.whatsapp, nome: r.nome })),
          scheduled_at: scheduledAt.toISOString(),
          status: "pending",
          metadata: { provider },
        } as any);
        if (error) throw error;
        toast.success(`SMS agendado para ${scheduledAt.toLocaleDateString("pt-PT")} às ${scheduledAt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`);
        setText("");
        setRecipients([]);
        setScheduledAt(null);
        return;
      } catch (err: any) {
        toast.error(err.message || "Erro ao agendar");
        return;
      }
    }

    setSending(true);
    let ok = 0, fail = 0;
    for (const r of recipients) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminEmail = session?.user?.email || "";
        const { data, error } = await supabase.functions.invoke("send-sms", {
          body: { to: r.whatsapp, text: text.trim(), provider },
          headers: { "x-crm-admin-email": adminEmail || "" },
        });
        if (error) throw error;
        if (data?.success) ok++; else fail++;
      } catch {
        fail++;
      }
    }
    setSending(false);
    if (fail === 0) {
      toast.success(`${ok} SMS enviados via ${provider === "smseasy" ? "SMSEasy" : "E-goi"}`);
      setText("");
      setRecipients([]);
    } else {
      toast.warning(`${ok} enviados, ${fail} falharam`);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const avatarColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
  const getAvatarColor = (name: string) => avatarColors[name.length % avatarColors.length];

  return (
    <div>
      {/* Tab header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 15px -3px rgba(59,130,246,0.4)" }}>
          <Smartphone size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Enviar SMS</h2>
          <p className="text-[11px] text-slate-500">Escolha o remetente, destinatários e escreva a mensagem</p>
        </div>
      </div>

      {/* Filters */}
      {!courseQueue && <FilterBar webinar={webinar} setWebinar={setWebinar} plano={plano} setPlano={setPlano} inscritos={inscritos} />}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8">
        {/* LEFT — Form */}
        <div className="space-y-5">
          {/* Provider cards */}
          {courseQueue ? <p className="text-sm text-slate-500">SMSOnline · remetente configurado no serviço. Máximo de 160 caracteres básicos, um SMS por destinatário. Envios entre as 08h e as 20h de Lisboa.</p> : <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2.5 text-slate-400">Remetente</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: "smseasy" as Provider, name: "IMAGENSIA", sub: "SMSEasy", type: "Alfanumérico", desc: "Remetente com nome da marca" },
                { id: "egoi" as Provider, name: "915 015 508", sub: "E-goi", type: "Numérico", desc: "Remetente com número PT" },
              ] as const).map((p) => {
                const active = provider === p.id;
                return (
                  <motion.button key={p.id} onClick={() => setProvider(p.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-xl p-4 text-left transition-all overflow-hidden" style={{ background: active ? "#EFF6FF" : "#FFFFFF", border: `1.5px solid ${active ? "#93C5FD" : "#E2E8F0"}`, boxShadow: active ? "0 0 20px -5px rgba(59,130,246,0.15)" : "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div className="relative flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: active ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "#F1F5F9" }}>
                          {p.id === "smseasy" ? <Radio size={14} className={active ? "text-white" : "text-slate-400"} /> : <Signal size={14} className={active ? "text-white" : "text-slate-400"} />}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-slate-800">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.sub}</div>
                        </div>
                      </div>
                      <AnimatePresence>
                        {active && (
                          <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "#DBEAFE", color: "#2563eb", border: "1px solid #93C5FD" }}>Activo</motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="relative mt-3 flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: active ? "#DBEAFE" : "#F1F5F9", color: active ? "#2563eb" : "#94A3B8", border: `1px solid ${active ? "#BFDBFE" : "#E2E8F0"}` }}>{p.type}</span>
                      <span className="text-[9px] text-slate-400">{p.desc}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>}

          {/* Recipients — multi-select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Destinatários ({recipients.length})</label>
              <div className="flex items-center gap-2">
                {recipients.length > 0 && (
                  <button onClick={() => setRecipients([])} className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full transition-all hover:bg-red-50" style={{ color: "#ef4444" }}>
                    <X size={10} /> Limpar todos
                  </button>
                )}
                {filteredPool.length > 0 && (
                  <button onClick={selectAllFiltered} className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full transition-all hover:bg-blue-50" style={{ color: "#2563eb" }}>
                    <Users size={10} /> Seleccionar todos ({filteredPool.length})
                  </button>
                )}
              </div>
            </div>

            {/* Chips */}
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {recipients.map(r => (
                  <span key={r.id} className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-0.5 text-[11px] font-medium" style={{ background: "#EFF6FF", color: "#2563eb", border: "1px solid #BFDBFE" }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: getAvatarColor(r.nome) }}>{getInitials(r.nome)}</span>
                    {r.primeiro_nome || r.nome.split(" ")[0]}
                    <button onClick={() => removeRecipient(r.id)} className="hover:bg-blue-100 rounded-full p-0.5"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => search && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Pesquisar inscrito por nome ou número…"
                className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 bg-white"
                style={{ border: "1.5px solid #E2E8F0" }}
              />
              <AnimatePresence>
                {showDropdown && searchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute z-20 top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden shadow-xl bg-white" style={{ border: "1px solid #E2E8F0" }}>
                    {searchResults.map((i) => (
                      <button key={i.id} onMouseDown={() => addRecipient(i)} className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition-colors">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: getAvatarColor(i.nome) }}>{getInitials(i.nome)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-slate-800 truncate">{i.nome}</div>
                          <div className="text-[10px] text-slate-400">{i.whatsapp}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Message composer */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Mensagem</label>
            <div className="rounded-xl overflow-hidden bg-white" style={{ border: "1.5px solid #E2E8F0" }}>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva a mensagem SMS…" rows={5} className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 outline-none resize-none placeholder:text-slate-400" />
              <div className="px-4 pb-3 space-y-2">
                <div className="h-1.5 rounded-full overflow-hidden bg-slate-200">
                  <motion.div className="h-full rounded-full" style={{ background: progressColor }} animate={{ width: `${Math.min(charPct, 100)}%` }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono" style={{ color: progressColor }}>{charCount}/{maxChars}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: smsCount > 1 ? "rgba(245,158,11,0.1)" : "#F1F5F9", color: smsCount > 1 ? "#d97706" : "#94A3B8", border: `1px solid ${smsCount > 1 ? "rgba(245,158,11,0.2)" : "#E2E8F0"}` }}>
                      <MessageSquare size={8} />{smsCount} SMS
                    </span>
                    {/* Unicode warning */}
                    {isUnicode && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <AlertTriangle size={8} /> Unicode — limite 70 chars/SMS
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule picker */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Quando enviar</label>
            <SchedulePicker scheduledAt={scheduledAt} onChange={setScheduledAt} />
          </div>

          {/* Send button */}
          <div className="flex justify-end">
            <motion.button onClick={() => setShowConfirm(true)} disabled={recipients.length === 0 || !text.trim() || sending} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="relative flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all disabled:opacity-30 disabled:pointer-events-none overflow-hidden" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: recipients.length === 0 || !text.trim() ? "none" : "0 8px 25px -5px rgba(37,99,235,0.4)" }}>
              {sending && <div className="absolute inset-0 animate-pulse" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)" }} />}
              <span className="relative flex items-center gap-2">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {courseQueue ? "Colocar em fila" : scheduledAt ? "Agendar" : "Enviar"} SMS {recipients.length > 1 ? `(${recipients.length})` : ""}
              </span>
            </motion.button>
          </div>
        </div>

        {/* RIGHT — Phone Preview */}
        <div className={courseQueue ? "flex min-w-0 flex-col items-center justify-start pt-8" : "hidden lg:flex flex-col items-center justify-start pt-8"}>
          <PhonePreview sender={senderLabel} message={text} />
          <p className="text-[10px] text-slate-400 mt-4 text-center">Pré-visualização em tempo real</p>
        </div>
      </div>

      {/* Confirm dialog */}
      <SendConfirmDialog
        queued={!!courseQueue}
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleSend}
        channel="sms"
        recipientCount={recipients.length}
        messagePreview={text.slice(0, 100)}
        scheduledAt={scheduledAt}
      />
    </div>
  );
}
