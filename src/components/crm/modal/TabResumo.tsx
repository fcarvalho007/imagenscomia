import { MapPin, Camera, Video, User, Check, Circle, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Inscrito } from "@/pages/crm/mockData";
import { WEBINAR_CONFIG } from "@/config/webinarConfig";

const PLAN_VALUES: Record<string, string> = { premium: "15", masterclass: "47", bundle: "62" };

function abbreviateSource(s: string) {
  if (s.startsWith("Instagram")) return "Instagram";
  if (s.startsWith("Podcast")) return "Podcast RFM";
  if (s.includes("Email")) return "Email/Newsletter";
  if (s.includes("WhatsApp")) return "WhatsApp";
  return s;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

const STEP_NAMES: Record<number, string> = { 1: "Inscrição", 2: "Origem", 3: "Dúvida", 4: "Premium", 5: "Masterclass" };

interface TabResumoProps {
  inscrito: Inscrito;
  crossHistory: any[];
  historyLoading: boolean;
  hasMasterclassImagens: boolean;
  masterclassImagensRecord: any;
}

export default function TabResumo({ inscrito, crossHistory, historyLoading, hasMasterclassImagens, masterclassImagensRecord }: TabResumoProps) {
  const [historyOpen, setHistoryOpen] = useState(crossHistory.length > 0);
  const step = inscrito.step_reached || 1;
  const pct = Math.round((step / 5) * 100);
  const wCfg = WEBINAR_CONFIG[inscrito.webinar as keyof typeof WEBINAR_CONFIG];

  return (
    <div className="space-y-5">
      {/* Smart alert: Masterclass cross-sell */}
      {hasMasterclassImagens && inscrito.webinar === "video" && masterclassImagensRecord && (
        <div className="rounded-lg p-3 flex items-start gap-2.5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <span className="text-[16px] mt-0.5">⚠️</span>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#d97706" }}>
              Já comprou Masterclass no Webinar Imagens IA{masterclassImagensRecord.paid_at ? ` (${fmtDate(masterclassImagensRecord.paid_at)})` : ""}.
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#d97706" }}>Não enviar pitch de Masterclass.</p>
          </div>
        </div>
      )}

      {/* ROW 1 — Origem + Webinar (2 cols) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#888" }}>Origem</span>
          </div>
          <p className="text-[16px] font-bold" style={{ color: "#111" }}>
            {inscrito.source.length > 0 ? abbreviateSource(inscrito.source[0]) : "—"}
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "#aaa" }}>Como chegou</p>
        </div>
        <div className="rounded-xl p-3.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            {inscrito.webinar === "video" ? <Video size={14} className="text-muted-foreground" /> : <Camera size={14} className="text-muted-foreground" />}
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#888" }}>Webinar</span>
          </div>
          <p className="text-[16px] font-bold" style={{ color: "#111" }}>
            {inscrito.webinar === "video" ? "Vídeo IA" : "Imagens IA"}
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "#aaa" }}>{wCfg?.date || "—"}</p>
        </div>
      </div>

      {/* ROW 2 — Qualificação full width */}
      <div className="rounded-xl p-3.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div className="flex items-center gap-1.5 mb-2.5">
          <User size={14} className="text-muted-foreground" />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#888" }}>Qualificação</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: "#aaa" }}>Função</p>
            <p className="text-[15px] font-semibold" style={{ color: "#111" }}>{inscrito.role || "Não preenchido"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: "#aaa" }}>Equipa</p>
            <p className="text-[15px] font-semibold" style={{ color: "#111" }}>{inscrito.team_size || "—"}</p>
          </div>
        </div>
      </div>

      {/* ROW 3 — Dúvida */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[1.5px] block mb-2" style={{ color: "#888" }}>
          Dúvida / Objectivo
        </span>
        {inscrito.duvida ? (
          <div className="rounded-xl p-3.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <p className="text-[15px] italic leading-relaxed" style={{ color: "#333" }}>{inscrito.duvida}</p>
          </div>
        ) : (
          <p className="text-[13px] italic" style={{ color: "#999" }}>Saltou esta pergunta</p>
        )}
      </div>

      {/* ROW 4 — Funnel with progress bar */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[1.5px] block mb-2.5" style={{ color: "#888" }}>
          Progresso no Funil
        </span>
        {/* Progress bar */}
        <div className="flex gap-0.5 mb-2.5 rounded-full overflow-hidden h-[6px]" style={{ background: "#e2e8f0" }}>
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex-1" style={{ background: s <= step ? "#16a34a" : "transparent" }} />
          ))}
        </div>
        {/* Step pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[1, 2, 3, 4, 5].map((s) => {
            const completed = s <= step;
            const isExit = s === step && step < 5;
            return (
              <div key={s} className="flex items-center gap-1">
                <span
                  className="text-[12px] font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: completed ? "rgba(22,163,74,0.1)" : "#f1f5f9",
                    border: completed ? "1px solid rgba(22,163,74,0.25)" : "1px solid #e2e8f0",
                    color: completed ? "#16a34a" : "#94a3b8",
                  }}
                >
                  {completed ? <Check size={11} className="inline -mt-0.5 mr-0.5" /> : <Circle size={9} className="inline -mt-0.5 mr-0.5" />}
                  {STEP_NAMES[s]}
                </span>
                {isExit && <span className="text-[10px] font-bold" style={{ color: "#ef4444" }}>SAIU</span>}
              </div>
            );
          })}
          <span className="ml-auto text-[13px] font-bold" style={{ color: "#333" }}>{pct}%</span>
        </div>
      </div>

      {/* ROW 5 — Cross-webinar history */}
      <div>
        <button onClick={() => setHistoryOpen(!historyOpen)} className="flex items-center gap-2 w-full text-left">
          <ChevronRight size={14} className={`transition-transform text-muted-foreground ${historyOpen ? "rotate-90" : ""}`} />
          <span className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: "#888" }}>
            Histórico de Webinars
          </span>
          {crossHistory.length > 0 && (
            <span className="text-[12px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
              {crossHistory.length}
            </span>
          )}
        </button>
        {historyOpen && (
          <div className="mt-2.5 space-y-2.5">
            {historyLoading ? (
              <p className="text-[13px] text-muted-foreground">A carregar...</p>
            ) : crossHistory.length === 0 ? (
              <p className="text-[12px] italic" style={{ color: "#666" }}>Primeira vez neste ecossistema</p>
            ) : (
              crossHistory.map(h => {
                const isVideo = h.webinar === "video";
                const isPaid = !!h.paid_at;
                const hCfg = WEBINAR_CONFIG[h.webinar as keyof typeof WEBINAR_CONFIG];
                let planLabel = "Inscrito gratuito";
                let planBg = "rgba(0,0,0,0.06)";
                let planColor = "#666";
                let statusLabel = (h.step_reached ?? 0) >= 3 ? "Completou o flow" : "Não completou o flow";
                let statusColor = (h.step_reached ?? 0) >= 3 ? "#16a34a" : "#d97706";
                if (h.plan_selected && h.plan_selected !== "free" && isPaid) {
                  statusLabel = "✓ Pago";
                  statusColor = "#16a34a";
                  if (h.plan_selected === "premium") { planLabel = "Premium Pass €15+IVA"; planBg = "rgba(30,64,175,0.15)"; planColor = "#1e40af"; }
                  else if (h.plan_selected === "masterclass") { planLabel = "Masterclass €47+IVA"; planBg = "rgba(124,58,237,0.15)"; planColor = "#7c3aed"; }
                  else if (h.plan_selected === "bundle") { planLabel = "Bundle €62+IVA"; planBg = "rgba(15,23,42,0.12)"; planColor = "#0f172a"; }
                }
                return (
                  <div key={h.id} className="rounded-xl p-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div className="flex items-center justify-between">
                      <span style={{ background: isVideo ? "rgba(22,163,74,0.15)" : "rgba(30,64,175,0.15)", color: isVideo ? "#16a34a" : "#1e40af", fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 12 }}>
                        {isVideo ? "🎬 Vídeo IA" : "📷 Imagens IA"} · {hCfg?.date || "—"}
                      </span>
                      <span className="text-[12px]" style={{ color: "#aaa" }}>{fmtDate(h.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: planBg, color: planColor }}>{planLabel}</span>
                      <span className="text-[11px] font-medium" style={{ color: statusColor }}>{statusLabel}</span>
                    </div>
                    {isPaid && (
                      <p className="mt-1.5 text-[12px]" style={{ color: "#aaa" }}>
                        Valor: €{PLAN_VALUES[h.plan_selected] || "—"}+IVA · Pago em {fmtDate(h.paid_at)}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
