import { useState, useMemo } from "react";
import { Send, Loader2, Mail, MessageSquare, Search, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Inscrito } from "@/pages/crm/mockData";
import SmsTab from "./comunicacao/SmsTab";

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

/* SmsTab extracted to ./comunicacao/SmsTab.tsx */

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
