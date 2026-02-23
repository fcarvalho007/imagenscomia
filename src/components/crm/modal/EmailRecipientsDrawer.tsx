import { useEffect, useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Download } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import type { WebinarKey } from "@/config/webinarConfig";

interface Recipient {
  fname: string | null;
  recipient_email: string;
  status: string;
  error_message: string | null;
  sent_at: string | null;
  webinar: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  emailKey: string;
  webinar: WebinarKey | "consolidado";
  emailTitle: string;
}

function getInitials(fname: string | null, email: string): string {
  if (fname && fname.trim()) return fname.trim()[0].toUpperCase();
  return email[0].toUpperCase();
}

function formatTime(sentAt: string | null): string {
  if (!sentAt) return "—";
  const d = new Date(sentAt);
  const diff = Date.now() - d.getTime();
  if (diff < 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(d, { addSuffix: true, locale: pt });
  }
  return format(d, "d MMM · HH:mm", { locale: pt });
}

export default function EmailRecipientsDrawer({ open, onClose, emailKey, webinar, emailTitle }: Props) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [failOpen, setFailOpen] = useState(false);

  useEffect(() => {
    if (!open || !emailKey) return;
    setLoading(true);
    const fetchData = async () => {
      let query = supabase
        .from("email_send_logs")
        .select("fname, recipient_email, status, error_message, sent_at, webinar")
        .eq("email_key", emailKey)
        .order("sent_at", { ascending: false });

      if (webinar !== "consolidado") {
        query = query.eq("webinar", webinar);
      }

      const { data } = await query;
      setRecipients(data || []);
      setLoading(false);
    };
    fetchData();
  }, [open, emailKey, webinar]);

  const sent = useMemo(() => recipients.filter((r) => r.status === "sent"), [recipients]);
  const failed = useMemo(() => recipients.filter((r) => r.status === "failed"), [recipients]);
  const total = sent.length + failed.length;
  const rate = total > 0 ? Math.round((sent.length / total) * 100) : 0;

  const handleExportCSV = () => {
    const header = "Nome,Email,Status,Enviado em,Erro\n";
    const rows = recipients.map((r) =>
      `"${r.fname || ""}","${r.recipient_email}","${r.status}","${r.sent_at || ""}","${r.error_message || ""}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${emailKey}_recipients.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px] flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <SheetTitle className="text-[15px]">{emailTitle} · Enviados</SheetTitle>
          <SheetDescription className="text-[12px]">
            Lista de inscritos que receberam este email
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">A carregar…</p>
          ) : sent.length === 0 && failed.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Nenhum registo encontrado.</p>
          ) : (
            <>
              {/* Sent recipients */}
              {sent.map((r, i) => (
                <RecipientRow key={i} r={r} showBadge={webinar === "consolidado"} />
              ))}

              {/* Failed section */}
              {failed.length > 0 && (
                <Collapsible open={failOpen} onOpenChange={setFailOpen} className="mt-4">
                  <CollapsibleTrigger className="flex items-center gap-1 text-[12px] font-semibold w-full py-2" style={{ color: "#ef4444" }}>
                    <ChevronDown size={14} className={`transition-transform ${failOpen ? "rotate-0" : "-rotate-90"}`} />
                    Falhas ({failed.length})
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {failed.map((r, i) => (
                      <RecipientRow key={i} r={r} showBadge={webinar === "consolidado"} showError />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3 flex items-center justify-between" style={{ fontSize: 12 }}>
          <span className="text-muted-foreground">
            {sent.length} enviados · {failed.length} falharam · Taxa: {rate}%
          </span>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 font-medium hover:underline"
            style={{ color: "#2563EB", fontSize: 12 }}
          >
            <Download size={12} /> Exportar CSV
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RecipientRow({ r, showBadge, showError }: { r: Recipient; showBadge: boolean; showError?: boolean }) {
  const initials = getInitials(r.fname, r.recipient_email);
  const isFailed = r.status === "failed";

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-b-0">
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
        style={{ background: isFailed ? "#fee2e2" : "#f0f4ff", color: isFailed ? "#ef4444" : "#1e40af" }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold truncate" style={{ color: "#0F172A" }}>
          {r.fname || r.recipient_email.split("@")[0]}
        </p>
        <p className="text-[11px] truncate" style={{ color: "#94A3B8" }}>{r.recipient_email}</p>
        {showError && r.error_message && (
          <p className="text-[10px] mt-0.5" style={{ color: "#ef4444" }}>{r.error_message}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span className="text-[11px]" style={{ color: "#94A3B8" }}>{formatTime(r.sent_at)}</span>
        <div className="flex items-center gap-1.5">
          {showBadge && (
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded"
              style={{
                background: r.webinar === "video" ? "#16a34a" : "#1e40af",
                color: "#fff",
              }}
            >
              {r.webinar === "video" ? "VID" : "IMG"}
            </span>
          )}
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: isFailed ? "#ef4444" : "#16a34a" }}
          />
        </div>
      </div>
    </div>
  );
}
