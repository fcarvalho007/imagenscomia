import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Mail, MessageSquare, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface LogGroup {
  date: string;
  key: string;
  channel: "email" | "sms";
  total: number;
  sent: number;
  failed: number;
}

export default function HistoricoTab() {
  const [logs, setLogs] = useState<LogGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);

      // Fetch email logs
      const { data: emailRows, count: emailCount } = await supabase
        .from("email_send_logs")
        .select("email_key, status, sent_at", { count: "exact" })
        .order("sent_at", { ascending: false })
        .limit(2000);

      // Fetch SMS logs
      const { data: smsRows, count: smsCount } = await supabase
        .from("message_logs")
        .select("template_key, status, created_at, channel", { count: "exact" })
        .eq("channel", "sms")
        .order("created_at", { ascending: false })
        .limit(1000);

      const truncated = (emailCount && emailCount > 2000) || (smsCount && smsCount > 1000);

      const groups = new Map<string, LogGroup>();

      // Group emails by date + key
      for (const row of emailRows || []) {
        const date = row.sent_at ? row.sent_at.slice(0, 10) : "unknown";
        const gKey = `email_${date}_${row.email_key}`;
        if (!groups.has(gKey)) {
          groups.set(gKey, { date, key: row.email_key, channel: "email", total: 0, sent: 0, failed: 0 });
        }
        const g = groups.get(gKey)!;
        g.total++;
        if (row.status === "sent") g.sent++;
        else g.failed++;
      }

      // Group SMS by date + key
      for (const row of smsRows || []) {
        const date = row.created_at ? row.created_at.slice(0, 10) : "unknown";
        const gKey = `sms_${date}_${row.template_key}`;
        if (!groups.has(gKey)) {
          groups.set(gKey, { date, key: row.template_key, channel: "sms", total: 0, sent: 0, failed: 0 });
        }
        const g = groups.get(gKey)!;
        g.total++;
        if (row.status === "sent" || row.status === "delivered") g.sent++;
        else if (row.status === "failed" || row.status === "error") g.failed++;
        else g.sent++; // queued counts as sent for display
      }

      const sorted = Array.from(groups.values()).sort((a, b) => b.date.localeCompare(a.date));
      setLogs(sorted);
      setIsTruncated(!!truncated);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-20">
        <Clock size={32} className="mx-auto text-slate-300 mb-3" />
        <p className="text-sm text-slate-400">Ainda não há registos de envios</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #a855f7)", boxShadow: "0 4px 15px -3px rgba(139,92,246,0.4)" }}>
          <Clock size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Histórico de Envios</h2>
          <p className="text-[11px] text-slate-500">Registo de emails e SMS enviados</p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden bg-white" style={{ border: "1.5px solid #E2E8F0" }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 py-2.5">Data</th>
              <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 py-2.5">Canal</th>
              <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 py-2.5">Chave / Assunto</th>
              <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 py-2.5 text-right">Total</th>
              <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 py-2.5 text-right">Sucesso</th>
              <th className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 py-2.5 text-right">Falhas</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((g, idx) => {
              const rate = g.total > 0 ? Math.round((g.sent / g.total) * 100) : 0;
              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td className="px-4 py-2.5 text-[12px] text-slate-600 font-mono">{g.date}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                      background: g.channel === "email" ? "#EFF6FF" : "#F0FDF4",
                      color: g.channel === "email" ? "#2563eb" : "#16a34a",
                      border: `1px solid ${g.channel === "email" ? "#BFDBFE" : "#BBF7D0"}`,
                    }}>
                      {g.channel === "email" ? <Mail size={9} /> : <MessageSquare size={9} />}
                      {g.channel === "email" ? "Email" : "SMS"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-700 font-medium truncate max-w-[200px]">{g.key.replace(/_/g, " ")}</td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-600 text-right font-semibold">{g.total}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: "#16a34a" }}>
                      <CheckCircle2 size={10} /> {g.sent}
                      <span className="text-[9px] text-slate-400 ml-0.5">({rate}%)</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {g.failed > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: "#ef4444" }}>
                        <XCircle size={10} /> {g.failed}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isTruncated && (
        <p className="text-[10px] text-slate-400 text-center mt-3 italic">
          ⚠️ Dados truncados — apenas os registos mais recentes são exibidos
        </p>
      )}
    </div>
  );
}
