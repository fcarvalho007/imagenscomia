import { useState, useMemo } from "react";
import { Send, Loader2, Phone, X, Signal, Radio, MessageSquare, Smartphone, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Inscrito } from "@/pages/crm/mockData";
import PhonePreview from "./PhonePreview";
import { FilterBar, filterInscritos, type WebinarFilter, type PlanoFilter } from "./EmailTab";

type Provider = "smseasy" | "egoi";

interface SmsTabProps {
  inscritos: Inscrito[];
}

export default function SmsTab({ inscritos }: SmsTabProps) {
  const [provider, setProvider] = useState<Provider>("smseasy");
  const [recipients, setRecipients] = useState<Inscrito[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [webinar, setWebinar] = useState<WebinarFilter>("todos");
  const [plano, setPlano] = useState<PlanoFilter>("todos");

  const filteredPool = useMemo(() => filterInscritos(inscritos, webinar, plano).filter(i => !!i.whatsapp), [inscritos, webinar, plano]);

  const maxChars = 160;
  const charCount = text.length;
  const smsCount = Math.ceil(charCount / 160) || 1;
  const charPct = Math.min((charCount / maxChars) * 100, 100);

  const progressColor =
    charPct < 70 ? "#22c55e" : charPct < 90 ? "#eab308" : "#ef4444";

  const senderLabel = provider === "smseasy" ? "IMAGENSIA" : "915 015 508";

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
    setSending(true);
    let ok = 0, fail = 0;
    for (const r of recipients) {
      try {
        const adminEmail = sessionStorage.getItem("crm_admin_email");
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

  const firstRecipientName = recipients[0]?.nome || "";

  return (
    <div>
      {/* Tab header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 15px -3px rgba(59,130,246,0.4)" }}>
          <Smartphone size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Enviar SMS</h2>
          <p className="text-[11px] text-white/40">Escolha o remetente, destinatários e escreva a mensagem</p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar webinar={webinar} setWebinar={setWebinar} plano={plano} setPlano={setPlano} inscritos={inscritos} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8">
        {/* LEFT — Form */}
        <div className="space-y-5">
          {/* Provider cards */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>Remetente</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: "smseasy" as Provider, name: "IMAGENSIA", sub: "SMSEasy", type: "Alfanumérico", desc: "Remetente com nome da marca" },
                { id: "egoi" as Provider, name: "915 015 508", sub: "E-goi", type: "Numérico", desc: "Remetente com número PT" },
              ] as const).map((p) => {
                const active = provider === p.id;
                return (
                  <motion.button key={p.id} onClick={() => setProvider(p.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-xl p-4 text-left transition-all overflow-hidden" style={{ background: active ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.10))" : "rgba(255,255,255,0.03)", border: `1.5px solid ${active ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"}`, boxShadow: active ? "0 0 25px -5px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.05)" : "none" }}>
                    {active && <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(59,130,246,0.15)" }} />}
                    <div className="relative flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: active ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "rgba(255,255,255,0.06)" }}>
                          {p.id === "smseasy" ? <Radio size={14} className={active ? "text-white" : "text-white/30"} /> : <Signal size={14} className={active ? "text-white" : "text-white/30"} />}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-white/90">{p.name}</div>
                          <div className="text-[10px] text-white/40">{p.sub}</div>
                        </div>
                      </div>
                      <AnimatePresence>
                        {active && (
                          <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.25)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }}>Activo</motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="relative mt-3 flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)", color: active ? "#93c5fd" : "rgba(255,255,255,0.3)", border: `1px solid ${active ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)"}` }}>{p.type}</span>
                      <span className="text-[9px] text-white/25">{p.desc}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Recipients — multi-select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Destinatários ({recipients.length})</label>
              <div className="flex items-center gap-2">
                {recipients.length > 0 && (
                  <button onClick={() => setRecipients([])} className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full transition-all hover:bg-white/5" style={{ color: "#f87171" }}>
                    <X size={10} /> Limpar todos
                  </button>
                )}
                {filteredPool.length > 0 && (
                  <button onClick={selectAllFiltered} className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full transition-all hover:bg-white/5" style={{ color: "#93c5fd" }}>
                    <Users size={10} /> Seleccionar todos ({filteredPool.length})
                  </button>
                )}
              </div>
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

            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => search && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Pesquisar inscrito por nome ou número…"
                className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
                style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }}
              />
              <AnimatePresence>
                {showDropdown && searchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute z-20 top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(180deg, #1e293b, #172033)", border: "1px solid rgba(255,255,255,0.10)" }}>
                    {searchResults.map((i) => (
                      <button key={i.id} onMouseDown={() => addRecipient(i)} className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-white/5 transition-colors">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: getAvatarColor(i.nome) }}>{getInitials(i.nome)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-white/85 truncate">{i.nome}</div>
                          <div className="text-[10px] text-white/35">{i.whatsapp}</div>
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
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Mensagem</label>
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
              <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, maxChars * 3))} placeholder="Escreva a mensagem SMS…" rows={5} className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none resize-none placeholder:text-white/20" />
              <div className="px-4 pb-3 space-y-2">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: progressColor }} animate={{ width: `${Math.min(charPct, 100)}%` }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono" style={{ color: progressColor }}>{charCount}/{maxChars}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: smsCount > 1 ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)", color: smsCount > 1 ? "#fbbf24" : "rgba(255,255,255,0.3)", border: `1px solid ${smsCount > 1 ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                      <MessageSquare size={8} />{smsCount} SMS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Send button */}
          <div className="flex justify-end">
            <motion.button onClick={handleSend} disabled={recipients.length === 0 || !text.trim() || sending} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="relative flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all disabled:opacity-30 disabled:pointer-events-none overflow-hidden" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: recipients.length === 0 || !text.trim() ? "none" : "0 8px 25px -5px rgba(37,99,235,0.4)" }}>
              {sending && <div className="absolute inset-0 animate-pulse" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)" }} />}
              <span className="relative flex items-center gap-2">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Enviar SMS {recipients.length > 1 ? `(${recipients.length})` : ""}
              </span>
            </motion.button>
          </div>
        </div>

        {/* RIGHT — Phone Preview */}
        <div className="hidden lg:flex flex-col items-center justify-start pt-8">
          <PhonePreview sender={senderLabel} message={text} />
          <p className="text-[10px] text-white/20 mt-4 text-center">Pré-visualização em tempo real</p>
        </div>
      </div>
    </div>
  );
}
