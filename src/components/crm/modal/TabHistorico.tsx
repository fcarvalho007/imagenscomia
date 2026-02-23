import { useState } from "react";
import { WEBINAR_CONFIG } from "@/config/webinarConfig";
import type { Inscrito } from "@/pages/crm/mockData";

const PLAN_VALUES: Record<string, string> = { premium: "15", masterclass: "47", bundle: "62" };

function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

interface TabHistoricoProps {
  inscrito: Inscrito;
  crossHistory: any[];
  historyLoading: boolean;
  notaText: string;
  setNotaText: (v: string) => void;
  onAddNota: (id: string, text: string) => void;
  onRemoveNota: (id: string, notaId: string) => void;
}

export default function TabHistorico({ inscrito, crossHistory, historyLoading, notaText, setNotaText, onAddNota, onRemoveNota }: TabHistoricoProps) {
  const handleAdd = () => {
    if (!notaText.trim()) return;
    onAddNota(inscrito.id, notaText.trim());
    setNotaText("");
  };

  return (
    <div className="space-y-6">
      {/* Cross-webinar history */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] block mb-2" style={{ color: "#888" }}>
          Histórico de Webinars
        </span>
        {historyLoading ? (
          <p className="text-[12px] text-muted-foreground">A carregar...</p>
        ) : crossHistory.length === 0 ? (
          <p className="text-[11px] italic" style={{ color: "#666" }}>Primeira vez neste ecossistema</p>
        ) : (
          <div className="space-y-2">
            {crossHistory.map(h => {
              const isVideo = h.webinar === "video";
              const isPaid = !!h.paid_at;
              const hCfg = WEBINAR_CONFIG[h.webinar as keyof typeof WEBINAR_CONFIG];
              let planLabel = "Inscrito gratuito";
              let planBg = "rgba(0,0,0,0.06)";
              let planColor = "#666";
              let statusLabel = (h.step_reached ?? 0) >= 3 ? "Completou o flow" : "Não completou o flow";
              let statusColor = (h.step_reached ?? 0) >= 3 ? "#16a34a" : "#d97706";
              if (h.plan_selected && h.plan_selected !== "free" && isPaid) {
                statusLabel = "✓ Pago"; statusColor = "#16a34a";
                if (h.plan_selected === "premium") { planLabel = "Premium Pass €15+IVA"; planBg = "rgba(30,64,175,0.15)"; planColor = "#1e40af"; }
                else if (h.plan_selected === "masterclass") { planLabel = "Masterclass €47+IVA"; planBg = "rgba(124,58,237,0.15)"; planColor = "#7c3aed"; }
                else if (h.plan_selected === "bundle") { planLabel = "Bundle €62+IVA"; planBg = "rgba(15,23,42,0.12)"; planColor = "#0f172a"; }
              }
              return (
                <div key={h.id} className="rounded-lg p-2.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div className="flex items-center justify-between">
                    <span style={{ background: isVideo ? "rgba(22,163,74,0.15)" : "rgba(30,64,175,0.15)", color: isVideo ? "#16a34a" : "#1e40af", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12 }}>
                      {isVideo ? "🎬 Vídeo IA" : "📷 Imagens IA"} · {hCfg?.date || "—"}
                    </span>
                    <span className="text-[11px]" style={{ color: "#aaa" }}>{fmtDate(h.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: planBg, color: planColor }}>{planLabel}</span>
                    <span className="text-[10px] font-medium" style={{ color: statusColor }}>{statusLabel}</span>
                  </div>
                  {isPaid && (
                    <p className="mt-1 text-[11px]" style={{ color: "#aaa" }}>
                      Valor: €{PLAN_VALUES[h.plan_selected] || "—"}+IVA · Pago em {fmtDate(h.paid_at)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[1.5px]" style={{ color: "#888" }}>Notas</span>
          {inscrito.notas.length > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{inscrito.notas.length}</span>
          )}
        </div>
        {inscrito.notas.map(n => (
          <div key={n.id} className="bg-muted border-l-[3px] border-blue-300 rounded-r-[10px] px-3.5 py-3 mb-2 group relative">
            <p className="text-[14px] text-foreground leading-relaxed pr-6">{n.texto}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-muted-foreground">{fmtDate(n.timestamp)}</span>
              <button onClick={() => onRemoveNota(inscrito.id, n.id)} className="text-[12px] text-muted-foreground hover:text-destructive hover:underline transition-colors opacity-0 group-hover:opacity-100">Apagar</button>
            </div>
          </div>
        ))}
        <textarea
          value={notaText}
          onChange={e => setNotaText(e.target.value.slice(0, 500))}
          placeholder="Escreve uma nota sobre este inscrito..."
          className="w-full bg-muted border border-border rounded-[10px] p-3 text-[14px] resize-none outline-none focus:border-ring mt-2"
          style={{ minHeight: 80 }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[12px] text-muted-foreground">{notaText.length} / 500</span>
          <button onClick={handleAdd} disabled={!notaText.trim()} className="bg-primary text-primary-foreground font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors">
            Guardar nota
          </button>
        </div>
      </div>
    </div>
  );
}
