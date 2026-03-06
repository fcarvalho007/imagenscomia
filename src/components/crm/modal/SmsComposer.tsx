import { useState } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SmsComposerProps {
  phone: string;
  registrationId: string;
  nome: string;
  onClose: () => void;
}

type Provider = "smseasy" | "egoi";

export default function SmsComposer({ phone, registrationId, nome, onClose }: SmsComposerProps) {
  const [provider, setProvider] = useState<Provider>("smseasy");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const charCount = text.length;
  const maxChars = 160;

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = session?.user?.email || "";
      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: { to: phone, text: text.trim(), provider, registrationId },
        headers: { "x-crm-admin-email": adminEmail || "" },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`SMS enviado via ${provider === "smseasy" ? "SMSEasy (IMAGENSIA)" : "E-goi (915015508)"}`);
        onClose();
      } else {
        toast.error(data?.error || "Erro ao enviar SMS");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar SMS");
    } finally {
      setSending(false);
    }
  };

  const radioStyle = (active: boolean) => ({
    background: active ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.10)"}`,
    color: active ? "#93c5fd" : "rgba(255,255,255,0.5)",
  });

  return (
    <div className="rounded-lg p-3 space-y-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
          Enviar SMS para {nome}
        </span>
        <button onClick={onClose} className="text-[11px] hover:underline" style={{ color: "rgba(255,255,255,0.4)" }}>✕</button>
      </div>

      {/* Provider selector */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setProvider("smseasy")}
          className="flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-all"
          style={radioStyle(provider === "smseasy")}
        >
          IMAGENSIA
          <span className="block text-[9px] opacity-60">SMSEasy · alfanumérico</span>
        </button>
        <button
          onClick={() => setProvider("egoi")}
          className="flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-all"
          style={radioStyle(provider === "egoi")}
        >
          915 015 508
          <span className="block text-[9px] opacity-60">E-goi · numérico</span>
        </button>
      </div>

      {/* Message */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxChars))}
        placeholder="Escreva a mensagem SMS…"
        rows={3}
        className="w-full rounded-md px-2.5 py-2 text-[12px] text-white outline-none resize-none"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: charCount > maxChars * 0.9 ? "#f87171" : "rgba(255,255,255,0.35)" }}>
          {charCount}/{maxChars}
        </span>
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold text-white transition-colors disabled:opacity-40"
          style={{ background: "#2563eb" }}
        >
          {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Enviar SMS
        </button>
      </div>
    </div>
  );
}
