import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";

interface EmailPreviewProps {
  subject: string;
  html: string;
  sender?: string;
}

export default function EmailPreview({ subject, html, sender = "Imagens com IA <no-reply@imagenscomia.com>" }: EmailPreviewProps) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");

  const isDesktop = view === "desktop";
  const width = isDesktop ? "100%" : "320px";

  return (
    <div className="flex flex-col items-center">
      {/* View toggle */}
      <div className="flex items-center gap-1 mb-3 p-0.5 rounded-lg" style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
        <button
          onClick={() => setView("desktop")}
          className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all"
          style={{
            background: isDesktop ? "#FFFFFF" : "transparent",
            color: isDesktop ? "#2563eb" : "#94A3B8",
            boxShadow: isDesktop ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}
        >
          <Monitor size={11} /> Desktop
        </button>
        <button
          onClick={() => setView("mobile")}
          className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all"
          style={{
            background: !isDesktop ? "#FFFFFF" : "transparent",
            color: !isDesktop ? "#2563eb" : "#94A3B8",
            boxShadow: !isDesktop ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}
        >
          <Smartphone size={11} /> Mobile
        </button>
      </div>

      {/* Email client mockup */}
      <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={{
          width,
          maxWidth: "100%",
          border: "1.5px solid #E2E8F0",
          boxShadow: "0 4px 20px -5px rgba(0,0,0,0.08)",
          background: "#FFFFFF",
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "#EF4444" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: "#F59E0B" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />
          <span className="ml-2 text-[9px] text-slate-400 font-medium">Mail</span>
        </div>

        {/* Header fields */}
        <div className="px-4 py-2.5 space-y-1" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-slate-400 w-8">De:</span>
            <span className="text-[11px] text-slate-600">{sender}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-slate-400 w-8">Para:</span>
            <span className="text-[11px] text-slate-400 italic">destinatário@email.com</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-slate-400 w-8">Assunto:</span>
            <span className="text-[11px] font-semibold text-slate-800 truncate">
              {subject || "Sem assunto"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-4 min-h-[180px] max-h-[400px] overflow-y-auto">
          {html.trim() ? (
            <div
              className="text-[12px] text-slate-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_a]:text-blue-600 [&_a]:underline"
              style={{ lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-[11px] text-slate-300 italic text-center mt-8">
              O conteúdo do email aparecerá aqui…
            </p>
          )}
        </div>
      </div>

      <p className="text-[10px] text-slate-400 mt-3 text-center">Pré-visualização em tempo real</p>
    </div>
  );
}
