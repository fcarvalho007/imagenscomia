import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Calendar } from "lucide-react";
import { PurchaseModal } from "@/components/webinar/PurchaseModal";
import GroupCheckoutForm from "@/components/webinar/GroupCheckoutForm";

type Plan = "masterclass" | "gravacao";

const PLANS: Record<Plan, {
  title: string;
  price: string;
  earlyBird?: string;
  benefits: string[];
  dateBox?: string;
  ctaLabel: string;
  ctaColor: string;
  planLabel: string;
}> = {
  masterclass: {
    title: "Masterclass Vídeo com IA",
    price: "€47 + IVA",
    earlyBird: "Preço early bird · sobe após o webinar",
    benefits: [
      "3 horas ao vivo com o Frederico",
      "Sistema completo de criação de vídeo com IA",
      "Prompts reutilizáveis para a tua empresa",
      "Gravação incluída para reverem depois",
    ],
    dateBox: "📅 12 de Março · 10h00–13h00",
    ctaLabel: "Garantir lugar na Masterclass →",
    ctaColor: "#7c3aed",
    planLabel: "Masterclass Vídeo com IA · €47 + IVA",
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
  },
};

function PlanCard({ plan, onSelect, hideButton }: { plan: Plan; onSelect: () => void; hideButton?: boolean }) {
  const cfg = PLANS[plan];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-4 flex-1 min-w-[220px]">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{cfg.title}</h2>
        <p className="text-2xl font-extrabold text-gray-900 mt-1">{cfg.price}</p>
      </div>

      {cfg.earlyBird && (
        <span className="inline-block self-start rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold px-2.5 py-0.5">
          {cfg.earlyBird}
        </span>
      )}

      <ul className="space-y-2">
        {cfg.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {cfg.dateBox && (
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{cfg.dateBox.replace("📅 ", "")}</span>
        </div>
      )}

      {!hideButton && (
        <button
          onClick={onSelect}
          className="mt-auto w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: cfg.ctaColor }}
        >
          {cfg.ctaLabel}
        </button>
      )}
    </div>
  );
}

export default function Comprar() {
  const [searchParams] = useSearchParams();
  const urlPlan = searchParams.get("plan") as Plan | null;
  const validPlan = urlPlan && urlPlan in PLANS ? urlPlan : null;

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(validPlan);
  const [modalOpen, setModalOpen] = useState(false);
  const [groupMode, setGroupMode] = useState(false);

  // Auto-open modal when plan is in URL (single mode only)
  useEffect(() => {
    if (validPlan && !groupMode) {
      setSelectedPlan(validPlan);
      setModalOpen(true);
    }
  }, [validPlan, groupMode]);

  const activePlan: Plan = selectedPlan || "masterclass";
  const showGroupToggle = activePlan === "masterclass" || validPlan === "masterclass";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: "#f9fafb" }}>
      <div className="w-full max-w-[480px] flex flex-col items-center gap-6">
        {/* Badge */}
        <p className="text-[11px] text-gray-500 tracking-wide">
          🎬 Webinar Vídeo com IA · 5 de Março
        </p>

        {/* Cards */}
        {validPlan ? (
          <PlanCard
            plan={validPlan}
            onSelect={() => {
              if (!groupMode) {
                setSelectedPlan(validPlan);
                setModalOpen(true);
              }
            }}
            hideButton={groupMode}
          />
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {(Object.keys(PLANS) as Plan[]).map((p) => (
              <PlanCard
                key={p}
                plan={p}
                onSelect={() => {
                  setSelectedPlan(p);
                  if (p === "masterclass" && groupMode) return;
                  setModalOpen(true);
                }}
                hideButton={p === "masterclass" && groupMode}
              />
            ))}
          </div>
        )}

        {/* Group mode toggle — masterclass only */}
        {showGroupToggle && (
          <div className="w-full">
            <button
              onClick={() => {
                setGroupMode((prev) => !prev);
                setModalOpen(false);
              }}
              className="flex items-center gap-2.5 w-full"
            >
              <div
                className="relative w-10 h-[22px] rounded-full transition-colors shrink-0"
                style={{ backgroundColor: groupMode ? "#7c3aed" : "#d1d5db" }}
              >
                <div
                  className="absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ left: groupMode ? "20px" : "3px" }}
                />
              </div>
              <span className="text-[13px] text-gray-700">Inscrever várias pessoas?</span>
            </button>
            {groupMode && (
              <p className="text-[12px] mt-1.5 ml-[50px]" style={{ color: "#7c3aed" }}>
                Modo grupo activo — adiciona os participantes abaixo
              </p>
            )}
          </div>
        )}

        {/* Group checkout form */}
        {groupMode && activePlan === "masterclass" && (
          <GroupCheckoutForm />
        )}

        {/* Reassurance */}
        {!groupMode && (
          <>
            <p className="text-[11px] text-gray-400 text-center leading-relaxed max-w-[360px]">
              A tua inscrição no Webinar Vídeo (gratuita) fica confirmada de qualquer forma após o pagamento.
            </p>
            <p className="text-[11px] text-gray-400 text-center">
              Pagamento seguro via EuPago · Cartão, MB WAY ou Multibanco
            </p>
          </>
        )}
      </div>

      {!groupMode && (
        <PurchaseModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          plan={activePlan}
          planLabel={PLANS[activePlan].planLabel}
          webinar="video"
        />
      )}
    </div>
  );
}
