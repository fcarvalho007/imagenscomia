import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Lock, Video, Sparkles, Play, FileText, BookOpen } from "lucide-react";
import { PurchaseModal } from "@/components/webinar/PurchaseModal";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { useIsMobile } from "@/hooks/use-mobile";

type Plan = "masterclass" | "bundle" | "gravacao";

function getBenefitIcon(text: string, color: string) {
  const lower = text.toLowerCase();
  if (lower.includes("sessão prática") || lower.includes("70 min")) return <Play className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("masterclass") || lower.includes("3 horas")) return <Video className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("prompts") || lower.includes("sistema")) return <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("ficheiro gem")) return <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("materiais") || lower.includes("checklists") || lower.includes("pack")) return <BookOpen className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  return <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
}

const PLANS: Record<Plan, {
  title: string;
  price: string;
  priceStrike?: string;
  savingsBadge?: string;
  ivaNote?: string;
  subPriceNote?: string;
  benefits: string[];
  ctaLabel: string;
  planLabel: string;
  featured?: boolean;
  stripeClass: string;
  iconColor: string;
  ctaClassName: string;
  shadow: string;
}> = {
  gravacao: {
    title: "Sessão Prática + Materiais",
    price: "€27",
    ivaNote: "+ IVA",
    subPriceNote: "Acesso imediato e permanente.",
    benefits: [
      "Sessão prática de 70 min sem cortes",
      "Ficheiro GEM pronto a importar",
      "Pack de materiais de apoio (checklists + templates)",
      "Prompts reutilizáveis para a tua empresa",
      "Acesso permanente a todos os conteúdos",
    ],
    ctaLabel: "Quero a Sessão Prática →",
    planLabel: "Sessão Prática + Materiais · €27 + IVA",
    stripeClass: "bg-slate-700",
    iconColor: "#475569",
    ctaClassName: "bg-slate-800 hover:bg-slate-900 rounded-xl py-4 font-semibold",
    shadow: "0 8px 40px rgba(0,0,0,0.25)",
  },
  masterclass: {
    title: "Masterclass Vídeo com IA",
    price: "€67",
    ivaNote: "+ IVA",
    subPriceNote: "3 horas intensivas com o Frederico.",
    benefits: [
      "3 horas ao vivo com o Frederico",
      "Sistema completo de criação de vídeo com IA",
      "Prompts reutilizáveis para a tua empresa",
      "Gravação da Masterclass incluída",
    ],
    ctaLabel: "Quero a Masterclass →",
    planLabel: "Masterclass Vídeo com IA · €67 + IVA",
    stripeClass: "bg-violet-400",
    iconColor: "#8b5cf6",
    ctaClassName: "bg-violet-600 hover:bg-violet-700 rounded-xl py-4 font-semibold",
    shadow: "0 8px 40px rgba(0,0,0,0.25)",
  },
  bundle: {
    title: "Masterclass + Sessão Prática",
    price: "€94",
    ivaNote: "+ IVA",
    subPriceNote: "Tudo incluído num só pacote.",
    benefits: [
      "3 horas ao vivo — Masterclass completa",
      "Sistema completo + prompts reutilizáveis",
      "Gravação da Masterclass incluída",
      "Sessão prática de 70 min sem cortes",
      "Ficheiro GEM pronto a importar",
      "Pack de materiais de apoio (checklists + templates)",
    ],
    ctaLabel: "Quero o pacote completo →",
    planLabel: "Masterclass + Sessão Prática · €94 + IVA",
    featured: true,
    stripeClass: "bg-gradient-to-r from-violet-600 to-purple-500",
    iconColor: "#8b5cf6",
    ctaClassName: "bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 rounded-xl py-4 font-bold text-lg",
    shadow: "0 16px 60px rgba(124,58,237,0.4)",
  },
};

const DESKTOP_ORDER: Plan[] = ["gravacao", "bundle", "masterclass"];
const MOBILE_ORDER: Plan[] = ["bundle", "gravacao", "masterclass"];

function PlanCard({ plan, onSelect, isMobile }: { plan: Plan; onSelect: () => void; isMobile: boolean }) {
  const cfg = PLANS[plan];
  const isFeatured = cfg.featured;

  return (
    <div
      className="relative flex flex-col flex-1 min-w-[220px] bg-white overflow-hidden"
      style={{
        borderRadius: 20,
        boxShadow: cfg.shadow,
        transform: isFeatured && !isMobile ? "scale(1.04)" : undefined,
      }}
    >
      {isFeatured ? (
        <div className="bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs font-bold tracking-widest py-2 text-center rounded-t-[20px]">
          MAIS POPULAR
        </div>
      ) : (
        <div className={`h-2 rounded-t-[20px] ${cfg.stripeClass}`} />
      )}

      <div className="flex flex-col flex-1 justify-between p-6 md:p-5 lg:p-8 gap-5">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900">{cfg.title}</h2>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-5xl font-black text-gray-900">{cfg.price}</span>
            {cfg.ivaNote && <span className="text-sm text-gray-400">{cfg.ivaNote}</span>}
            {cfg.priceStrike && (
              <span className="text-sm text-gray-400 line-through">{cfg.priceStrike}</span>
            )}
            {cfg.savingsBadge && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 rounded-full px-2 py-0.5">
                {cfg.savingsBadge}
              </span>
            )}
          </div>

          {cfg.subPriceNote && (
            <p className="text-xs text-gray-400 italic">{cfg.subPriceNote}</p>
          )}

          <ul className="space-y-2.5">
            {cfg.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                {getBenefitIcon(b, cfg.iconColor)}
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onSelect}
          className={`mt-auto w-full text-white transition-all ${cfg.ctaClassName}`}
        >
          {cfg.ctaLabel}
        </button>
      </div>
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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-12"
      style={{ background: "linear-gradient(160deg, #0f0c29 0%, #1a1040 40%, #24243e 100%)" }}
    >
      <div className="w-full max-w-6xl flex flex-col items-center gap-6 relative">
        <div
          className="absolute pointer-events-none z-0 blur-3xl"
          style={{
            width: 600,
            height: 600,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -40%)",
            background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="bg-white/10 backdrop-blur text-white border border-white/20 rounded-full px-4 py-1.5 text-xs">
            🎬 Sessão Prática · Vídeo Profissional com IA
          </div>
          <h1 className="text-white text-2xl md:text-3xl font-bold text-center mt-2">
            Escolhe o teu plano
          </h1>
        </div>

        <div className="relative z-10 w-full mt-8">
          {validPlan ? (
            <div className="max-w-md mx-auto">
              <PlanCard
                plan={validPlan}
                isMobile={isMobile}
                onSelect={() => {
                  setSelectedPlan(validPlan);
                  setModalOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 md:gap-4 lg:gap-8 w-full items-stretch">
              {cardOrder.map((p) => (
                <PlanCard
                  key={p}
                  plan={p}
                  isMobile={isMobile}
                  onSelect={() => {
                    setSelectedPlan(p);
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 w-full flex flex-col items-center gap-3 mt-6">
          <div className="w-full max-w-[360px] h-px bg-white/20" />
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Lock className="w-3.5 h-3.5 text-white/40" />
            <span>Pagamento seguro via EuPago</span>
          </div>
          <p className="text-xs text-white/50 text-center">
            ✓ Acesso imediato após pagamento &nbsp;·&nbsp; ✓ Suporte via WhatsApp &nbsp;·&nbsp; ✓ Satisfação garantida
          </p>
          <p className="text-xs text-white/50">
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
      <WhatsAppSupportButton />
    </div>
  );
}
