import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Calendar, Lock } from "lucide-react";
import { PurchaseModal } from "@/components/webinar/PurchaseModal";
import { useIsMobile } from "@/hooks/use-mobile";

type Plan = "masterclass" | "bundle" | "gravacao";

const PLANS: Record<Plan, {
  title: string;
  price: string;
  priceStrike?: string;
  savingsBadge?: string;
  ivaNote?: string;
  earlyBird?: string;
  benefits: string[];
  dateBox?: string;
  ctaLabel: string;
  ctaColor: string;
  planLabel: string;
  featured?: boolean;
  checkColor: string;
}> = {
  masterclass: {
    title: "Masterclass Vídeo com IA",
    price: "€47",
    ivaNote: "+ IVA",
    earlyBird: "Preço early bird · sobe após o webinar",
    benefits: [
      "3 horas ao vivo com o Frederico",
      "Sistema completo de criação de vídeo com IA",
      "Prompts reutilizáveis para a tua empresa",
      "Gravação incluída para reverem depois",
    ],
    dateBox: "12 de Março · 10h00–13h00",
    ctaLabel: "Garantir lugar na Masterclass →",
    ctaColor: "#7c3aed",
    planLabel: "Masterclass Vídeo com IA · €47 + IVA",
    checkColor: "#7c3aed",
  },
  bundle: {
    title: "Masterclass + Gravação",
    price: "€57",
    priceStrike: "€62",
    savingsBadge: "Poupa €5",
    ivaNote: "+ IVA",
    benefits: [
      "3 horas ao vivo — Masterclass 12 de Março",
      "Sistema completo + prompts reutilizáveis",
      "Gravação da Masterclass incluída",
      "Gravação HD do Webinar Vídeo com IA",
      "Pack de apoio completo (checklists + templates)",
      "Sessão Q&A em grupo · 10 de Março · 14h30",
    ],
    dateBox: "12 de Março · 10h00–13h00",
    ctaLabel: "Garantir Bundle completo →",
    ctaColor: "#7c3aed",
    planLabel: "Masterclass + Gravação · €57 + IVA",
    featured: true,
    checkColor: "#7c3aed",
  },
  gravacao: {
    title: "Gravação + Pack de Apoio",
    price: "€15",
    benefits: [
      "Gravação HD do Webinar Vídeo com IA",
      "Pack de apoio completo (checklists + templates)",
      "Sessão Q&A em grupo · 10 de Março · 14h30",
    ],
    ctaLabel: "Garantir gravação →",
    ctaColor: "#1e40af",
    planLabel: "Gravação + Pack de Apoio · €15",
    checkColor: "#1e40af",
  },
};

const DESKTOP_ORDER: Plan[] = ["masterclass", "bundle", "gravacao"];
const MOBILE_ORDER: Plan[] = ["bundle", "masterclass", "gravacao"];

function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: () => void }) {
  const cfg = PLANS[plan];
  const isFeatured = cfg.featured;

  return (
    <div
      className="relative flex flex-col gap-4 flex-1 min-w-[220px] bg-white transition-shadow duration-200"
      style={{
        borderRadius: 16,
        padding: "28px 24px",
        border: isFeatured ? "2px solid #7c3aed" : "1px solid #e5e7eb",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transform: isFeatured ? "scale(1.03)" : undefined,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
    >
      {isFeatured && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0"
          style={{
            background: "#7c3aed",
            color: "white",
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            borderRadius: "0 0 8px 8px",
            padding: "4px 14px",
          }}
        >
          MAIS POPULAR
        </div>
      )}

      <div className={isFeatured ? "mt-4" : ""}>
        <h2 className="text-lg font-bold" style={{ color: "#111827" }}>{cfg.title}</h2>
        <div className="flex items-baseline gap-2 mt-1">
          <span style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>{cfg.price}</span>
          {cfg.ivaNote && <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 400 }}>{cfg.ivaNote}</span>}
          {cfg.priceStrike && (
            <span style={{ fontSize: 14, color: "#9ca3af", textDecoration: "line-through" }}>{cfg.priceStrike}</span>
          )}
          {cfg.savingsBadge && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#16a34a",
                background: "#dcfce7",
                borderRadius: 99,
                padding: "2px 8px",
              }}
            >
              {cfg.savingsBadge}
            </span>
          )}
        </div>
      </div>

      {cfg.earlyBird && (
        <span
          className="inline-block self-start"
          style={{
            borderRadius: 99,
            background: "#fef3c7",
            color: "#92400e",
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 10px",
          }}
        >
          {cfg.earlyBird}
        </span>
      )}

      <ul className="space-y-2.5">
        {cfg.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2" style={{ fontSize: 13, color: "#374151" }}>
            <span
              className="mt-1 shrink-0 rounded-full flex items-center justify-center"
              style={{ width: 16, height: 16, background: cfg.checkColor }}
            >
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {cfg.dateBox && (
        <div
          className="flex items-center gap-2"
          style={{
            background: "#f5f3ff",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            color: "#7c3aed",
          }}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{cfg.dateBox}</span>
        </div>
      )}

      <button
        onClick={onSelect}
        className="mt-auto w-full font-semibold text-white transition-opacity hover:opacity-90"
        style={{
          backgroundColor: cfg.ctaColor,
          borderRadius: 10,
          height: 48,
          fontSize: 14,
        }}
      >
        {cfg.ctaLabel}
      </button>
    </div>
  );
}

export default function Comprar() {
  const [searchParams] = useSearchParams();
  const urlPlan = searchParams.get("plan") as Plan | null;
  const validPlan = urlPlan && urlPlan in PLANS ? urlPlan : null;
  const isMobile = useIsMobile();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(validPlan);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (validPlan) {
      setSelectedPlan(validPlan);
      setModalOpen(true);
    }
  }, [validPlan]);

  const activePlan: Plan = selectedPlan || "bundle";
  const cardOrder = isMobile ? MOBILE_ORDER : DESKTOP_ORDER;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: "#f9fafb" }}>
      <div className="w-full max-w-[900px] flex flex-col items-center gap-6">
        {/* Header badge */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "6px 16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            fontSize: 12,
            color: "#374151",
          }}
        >
          🎬 Webinar Vídeo com IA · 5 de Março · 10h00
        </div>

        <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginBottom: 8 }}>
          Acesso garantido em segundos após confirmação de pagamento
        </p>

        {validPlan ? (
          <PlanCard
            plan={validPlan}
            onSelect={() => {
              setSelectedPlan(validPlan);
              setModalOpen(true);
            }}
          />
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 w-full items-stretch">
            {cardOrder.map((p) => (
              <PlanCard
                key={p}
                plan={p}
                onSelect={() => {
                  setSelectedPlan(p);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="w-full flex flex-col items-center gap-3 mt-2">
          <div style={{ width: "100%", maxWidth: 360, height: 1, background: "#e5e7eb" }} />
          <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: "#9ca3af" }}>
            <Lock className="w-3.5 h-3.5" />
            <span>Pagamento seguro via EuPago</span>
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af" }}>
            Cartão de crédito · MB WAY · Multibanco
          </p>
        </div>
      </div>

      <PurchaseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        plan={activePlan}
        planLabel={PLANS[activePlan].planLabel}
        webinar="video"
      />
    </div>
  );
}
