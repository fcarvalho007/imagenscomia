import { useState, useMemo } from "react";
import { Send, Loader2, Mail, MessageSquare, Search, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Inscrito } from "@/pages/crm/mockData";

type Provider = "smseasy" | "egoi";

interface ComunicacaoViewProps {
  inscritos: Inscrito[];
}

/* ───────── Email Tab ───────── */
function EmailTab({ inscritos }: { inscritos: Inscrito[] }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return inscritos
      .filter((i) => i.status === "activo" && (i.email.toLowerCase().includes(q) || i.nome.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [search, inscritos]);

  const selectInscrito = (i: Inscrito) => {
    setTo(i.email);
    setSearch("");
    setShowDropdown(false);
  };

  const handleSend = async () => {
    if (!to || !subject || !html.trim() || sending) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { to, subject, html },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`Email enviado via ${data.provider} para ${to}`);
        setTo("");
        setSubject("");
        setHtml("");
      } else {
        toast.error(data?.error || "Erro ao enviar email");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Para */}
      <div className="relative">
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Para</label>
        <input
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => search && setShowDropdown(true)}
          placeholder="email@exemplo.com ou pesquisar inscrito…"
          className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
        />
        {showDropdown && filtered.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg overflow-hidden shadow-xl" style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.10)" }}>
            {filtered.map((i) => (
              <button
                key={i.id}
                onClick={() => selectInscrito(i)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex justify-between items-center"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                <span>{i.nome}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{i.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Assunto */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Assunto</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Assunto do email…"
          className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
        />
      </div>

      {/* Corpo HTML */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Corpo (HTML)</label>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder="<p>Olá…</p>"
          rows={10}
          className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-y font-mono placeholder:text-white/30"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={!to || !subject || !html.trim() || sending}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-40"
          style={{ background: "#2563eb" }}
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Enviar Email
        </button>
      </div>
    </div>
  );
}

/* ───────── SMS Tab ───────── */
function SmsTab({ inscritos }: { inscritos: Inscrito[] }) {
  const [provider, setProvider] = useState<Provider>("smseasy");
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const maxChars = 160;
  const charCount = text.length;

  const filtered = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return inscritos
      .filter((i) => i.status === "activo" && i.whatsapp && (i.whatsapp.includes(q) || i.nome.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [search, inscritos]);

  const selectInscrito = (i: Inscrito) => {
    setTo(i.whatsapp);
    setSearch("");
    setShowDropdown(false);
  };

  const handleSend = async () => {
    if (!to || !text.trim() || sending) return;
    setSending(true);
    try {
      const adminEmail = sessionStorage.getItem("crm_admin_email");
      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: { to, text: text.trim(), provider },
        headers: { "x-crm-admin-email": adminEmail || "" },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`SMS enviado via ${provider === "smseasy" ? "SMSEasy (IMAGENSIA)" : "E-goi (915015508)"}`);
        setText("");
      } else {
        toast.error(data?.error || "Erro ao enviar SMS");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar SMS");
    } finally {
      setSending(false);
    }
  };

  const cardStyle = (active: boolean) => ({
    background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
    border: `1.5px solid ${active ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
    color: active ? "#93c5fd" : "rgba(255,255,255,0.5)",
  });

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Provider cards */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Remetente</label>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setProvider("smseasy")} className="rounded-xl p-4 text-left transition-all" style={cardStyle(provider === "smseasy")}>
            <div className="text-sm font-bold">IMAGENSIA</div>
            <div className="text-[11px] mt-0.5 opacity-70">SMSEasy · remetente alfanumérico</div>
            <div className="text-[10px] mt-1 opacity-50">Não permite remetente numérico</div>
          </button>
          <button onClick={() => setProvider("egoi")} className="rounded-xl p-4 text-left transition-all" style={cardStyle(provider === "egoi")}>
            <div className="text-sm font-bold">915 015 508</div>
            <div className="text-[11px] mt-0.5 opacity-70">E-goi · remetente numérico</div>
            <div className="text-[10px] mt-1 opacity-50">Não permite remetente alfanumérico</div>
          </button>
        </div>
      </div>

      {/* Para */}
      <div className="relative">
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Para</label>
        <input
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => search && setShowDropdown(true)}
          placeholder="Número de telefone ou pesquisar inscrito…"
          className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
        />
        {showDropdown && filtered.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg overflow-hidden shadow-xl" style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.10)" }}>
            {filtered.map((i) => (
              <button
                key={i.id}
                onClick={() => selectInscrito(i)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex justify-between items-center"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                <span>{i.nome}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{i.whatsapp}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mensagem */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Mensagem</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxChars))}
          placeholder="Escreva a mensagem SMS…"
          rows={4}
          className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none placeholder:text-white/30"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px]" style={{ color: charCount > maxChars * 0.9 ? "#f87171" : "rgba(255,255,255,0.35)" }}>
            {charCount}/{maxChars} · {Math.ceil(charCount / 160) || 1} SMS
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={!to || !text.trim() || sending}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-40"
          style={{ background: "#2563eb" }}
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Enviar SMS
        </button>
      </div>
    </div>
  );
}

/* ───────── Main View ───────── */
export default function ComunicacaoView({ inscritos }: ComunicacaoViewProps) {
  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#0f172a" }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Comunicação</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Envio manual de email ou SMS
        </p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="email" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/50 gap-1.5">
            <Mail size={14} /> Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/50 gap-1.5">
            <MessageSquare size={14} /> SMS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <EmailTab inscritos={inscritos} />
        </TabsContent>
        <TabsContent value="sms">
          <SmsTab inscritos={inscritos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
