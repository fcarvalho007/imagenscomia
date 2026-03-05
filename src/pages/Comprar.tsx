import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Lock, Video, Sparkles, Play, FileText, MessageCircle, CalendarDays } from "lucide-react";
import { PurchaseModal } from "@/components/webinar/PurchaseModal";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { useIsMobile } from "@/hooks/use-mobile";

type Plan = "masterclass" | "bundle" | "gravacao";

function getBenefitIcon(text: string, color: string) {
  const lower = text.toLowerCase();
  if (lower.includes("horas ao vivo") || lower.includes("masterclass")) return <Video className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("sistema completo") || lower.includes("prompts")) return <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("gravação") || lower.includes("gravacao")) return <Play className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("pack de apoio") || lower.includes("checklists")) return <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("sessão q&a") || lower.includes("sessao q&a")) return <MessageCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  return <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
}

const PLANS: Record<Plan, {
  title: string;
  price: string;
  priceStrike?: string;
  savingsBadge?: string;
  ivaNote?: string;
  earlyBird?: string;
  subPriceNote?: string;
  urgencyBadge?: string;
  subBenefitsNote?: string;
  benefits: string[];
  dateBox?: string;
  ctaLabel: string;
  planLabel: string;
  featured?: boolean;
  stripeClass: string;
  iconColor: string;
  ctaClassName: string;
  shadow: string;
}> = {
  masterclass: {
    title: "Masterclass Vídeo com IA",
    price: "€47",
    ivaNote: "+ IVA",
    earlyBird: "Preço early bird · sobe após o webinar",
    subPriceNote: "Sem isto, o webinar termina e não voltas a ter acesso ao Frederico ao vivo.",
    benefits: [
      "3 horas ao vivo com o Frederico",
      "Sistema completo de criação de vídeo com IA",
      "Prompts reutilizáveis para a tua empresa",
      "Gravação incluída para reverem depois",
    ],
    dateBox: "12 de Março · 10h00–13h00",
    ctaLabel: "Quero o meu lugar na Masterclass →",
    planLabel: "Masterclass Vídeo com IA · €47 + IVA",
    stripeClass: "bg-violet-400",
    iconColor: "#8b5cf6",
    ctaClassName: "bg-violet-600 hover:bg-violet-700 rounded-xl py-4 font-semibold",
    shadow: "0 8px 40px rgba(0,0,0,0.25)",
  },
  bundle: {
    title: "Masterclass + Gravação",
    price: "€57",
    priceStrike: "€62",
    savingsBadge: "Poupa €5",
    urgencyBadge: "Últimos lugares disponíveis",
    ivaNote: "+ IVA",
    subBenefitsNote: "A Masterclass tem vagas limitadas. O Bundle garante tudo de uma vez.",
    benefits: [
      "3 horas ao vivo — Masterclass 12 de Março",
      "Sistema completo + prompts reutilizáveis",
      "Gravação da Masterclass incluída",
      "Gravação HD do Webinar Vídeo com IA",
      "Pack de apoio completo (checklists + templates)",
      "Sessão Q&A ao vivo em grupo · 10 de Março · 14h30–15h30",
    ],
    dateBox: "12 de Março · 10h00–13h00",
    ctaLabel: "Quero o Bundle completo →",
    planLabel: "Masterclass + Gravação · €57 + IVA",
    featured: true,
    stripeClass: "bg-gradient-to-r from-violet-600 to-purple-500",
    iconColor: "#8b5cf6",
    ctaClassName: "bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 rounded-xl py-4 font-bold text-lg",
    shadow: "0 16px 60px rgba(124,58,237,0.4)",
  },
  gravacao: {
    title: "Gravação HD + Pack de Apoio",
    price: "€15",
    subPriceNote: "Revê quando quiseres. Para sempre.",
    benefits: [
      "Gravação HD do Webinar Vídeo com IA",
      "Pack de apoio completo (checklists + templates)",
      "Sessão Q&A ao vivo em grupo · 10 de Março · 14h30–15h30",
    ],
    ctaLabel: "Quero a gravação →",
    planLabel: "Gravação HD + Pack de Apoio · €15",
    stripeClass: "bg-slate-700",
    iconColor: "#475569",
    ctaClassName: "bg-slate-800 hover:bg-slate-900 rounded-xl py-4 font-semibold",
    shadow: "0 8px 40px rgba(0,0,0,0.25)",
  },
};

const DESKTOP_ORDER: Plan[] = ["masterclass", "bundle", "gravacao"];
const MOBILE_ORDER: Plan[] = ["bundle", "masterclass", "gravacao"];

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
      {/* Top stripe or MAIS POPULAR banner */}
      {isFeatured ? (
        <div className="bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs font-bold tracking-widest py-2 text-center rounded-t-[20px]">
          MAIS POPULAR
        </div>
      ) : (
        <div className={`h-2 rounded-t-[20px] ${cfg.stripeClass}`} />
      )}

      {/* Card body */}
      <div className="flex flex-col flex-1 justify-between p-6 md:p-5 lg:p-8 gap-5">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900">{cfg.title}</h2>

          {/* Price row */}
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

          {cfg.urgencyBadge && (
            <span className="inline-block self-start text-xs font-semibold text-white bg-rose-500 rounded-full px-2 py-1 whitespace-nowrap">
              {cfg.urgencyBadge}
            </span>
          )}

          {cfg.subPriceNote && (
            <p className="text-xs text-gray-400 italic">{cfg.subPriceNote}</p>
          )}

          {cfg.earlyBird && (
            <span className="inline-block self-start text-xs font-semibold text-amber-800 bg-amber-100 rounded-full px-3 py-1">
              {cfg.earlyBird}
            </span>
          )}

          {/* Benefits */}
          <ul className="space-y-2.5">
            {cfg.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                {getBenefitIcon(b, cfg.iconColor)}
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {cfg.subBenefitsNote && (
            <p className="text-xs text-gray-400 italic">{cfg.subBenefitsNote}</p>
          )}

          {cfg.dateBox && (
            <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-lg px-4 py-2.5 text-sm text-violet-700 font-medium">
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>{cfg.dateBox}</span>
            </div>
          )}
        </div>

        {/* CTA */}
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
        {/* Radial glow behind bundle card */}
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

        {/* Header */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="bg-white/10 backdrop-blur text-white border border-white/20 rounded-full px-4 py-1.5 text-xs">
            🎬 Webinar Vídeo com IA · 5 de Março · 10h00
          </div>

          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-4 py-1 text-xs font-semibold">
            <span className="sm:hidden">🔥 Early bird — sobe a 5 de Março</span>
            <span className="hidden sm:inline">🔥 Preço early bird — sobe depois do webinar de 5 de Março</span>
          </span>

        </div>

        {/* Cards */}
        <div className="relative z-10 w-full mt-12">
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

          {/* Mobile scroll hint */}
          <div className="flex sm:hidden flex-col items-center mt-6">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="w-2 h-2 rounded-full bg-white/20" />
            </div>
            <p className="text-white/40 text-xs text-center mt-2">Desliza para ver todos os planos</p>
          </div>
        </div>

        {/* Footer trust row */}
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
