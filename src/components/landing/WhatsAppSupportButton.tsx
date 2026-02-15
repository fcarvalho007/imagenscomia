import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, MessageCircle, Clock } from "lucide-react";

const WA_BASE = "https://wa.me/351915015508?text=";

const MESSAGES = {
  general: encodeURIComponent("Olá! Preciso de apoio sobre a página. Podem ajudar-me?"),
  inscricao: encodeURIComponent("Olá! Tenho uma dúvida sobre a inscrição. Podem ajudar-me?"),
  tecnico: encodeURIComponent("Olá! Estou com um problema técnico no acesso. Podem ajudar-me?"),
};

const openWA = (key: keyof typeof MESSAGES) => {
  console.log(`whatsapp_${key}`);
  window.open(`${WA_BASE}${MESSAGES[key]}`, "_blank", "noopener,noreferrer");
};

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const WhatsAppSupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, close]);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {/* Popup */}
      <div
        className={`absolute bottom-16 right-0 w-80 max-w-[calc(100vw-3rem)] origin-bottom-right transition-all duration-200 ${
          isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <Card className="overflow-hidden shadow-xl border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#25D366" }}>
            <div className="flex items-center gap-2 text-white">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold text-sm">Suporte no WhatsApp</span>
            </div>
            <button onClick={close} className="text-white/80 hover:text-white transition-colors" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 bg-card">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Normalmente responde em poucos minutos.</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Horário: 09:00–18:00 (dias úteis)
              </p>
            </div>

            {/* Primary CTA */}
            <Button
              onClick={() => openWA("general")}
              className="w-full font-semibold"
              style={{ backgroundColor: "#25D366", color: "white" }}
            >
              Iniciar conversa
            </Button>

            {/* Secondary CTAs */}
            <div className="space-y-1">
              <button
                onClick={() => openWA("inscricao")}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              >
                Dúvida sobre inscrição
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => openWA("tecnico")}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              >
                Problema técnico no acesso
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Suporte WhatsApp"
        aria-expanded={isOpen}
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
        style={{ backgroundColor: "#25D366" }}
      >
        <span className={`transition-transform duration-200 ${isOpen ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}>
          <WhatsAppIcon />
        </span>
        <X className={`absolute h-6 w-6 text-white transition-transform duration-200 ${isOpen ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`} />
      </button>
    </div>
  );
};
