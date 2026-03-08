import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Lock, Video, Sparkles, Play, FileText, BookOpen, Image, CalendarDays } from "lucide-react";
import { PurchaseModal } from "@/components/webinar/PurchaseModal";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

type Plan = "masterclass" | "bundle" | "gravacao";

// ── Pós-Masterclass ──────────────────────────────────────────
// Alterar para true após 13 de Março de 2026
const POST_MASTERCLASS_MODE = false;
// ─────────────────────────────────────────────────────────────

const MASTERCLASS_CUTOFF = new Date("2026-03-12T13:30:00Z");

function getBenefitIcon(text: string, color: string) {
  const lower = text.toLowerCase();
  if (lower.includes("sessão completa") || lower.includes("70 min") || lower.includes("60 min")) return <Play className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("masterclass") || lower.includes("3 horas")) return <Video className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("prompts") || lower.includes("sistema") || lower.includes("biblioteca")) return <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("workbook") || lower.includes("pdf")) return <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("guia") || lower.includes("gems") || lower.includes("sop") || lower.includes("passo-a-passo")) return <BookOpen className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("q&a")) return <Video className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  if (lower.includes("gravação")) return <Play className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
  return <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />;
}

interface BenefitItem {
  text: string;
  isSectionHeader?: boolean;
}

const PLANS: Record<Plan, {
  title: string;
  price: string;
  priceStrike?: string;
  savingsBadge?: string;
  ivaNote?: string;
  subPriceNote?: string;
  benefits: BenefitItem[];
  ctaLabel: string;
  planLabel: string;
  featured?: boolean;
  stripeClass: string;
  iconColor: string;
  ctaClassName: string;
  shadow: string;
  topTag?: string;
  immediateAccess?: boolean;
  showMasterclassDate?: boolean;
  highlightBenefitIndex?: number;
  exclusiveSection?: boolean;
}> = {
  gravacao: {
    title: "Sessão Prática",
    price: "€27",
    ivaNote: "+ IVA",
    subPriceNote: "Acesso imediato após a compra.",
    immediateAccess: true,
    benefits: [
      { text: "Sessão Vídeo com IA HD ~70 min, sem cortes" },
      { text: "Workbook PDF resumo da sessão" },
      { text: "Guia técnico dos 3 GEMs para vídeo" },
      ...(!POST_MASTERCLASS_MODE ? [{ text: "Sessão Q&A ao vivo — 10 de Março, 14h30" }] : []),
    ],
    ctaLabel: "Quero a Sessão Prática →",
    planLabel: "Sessão Prática · €27 + IVA",
    stripeClass: "bg-slate-700",
    iconColor: "#475569",
    ctaClassName: "bg-slate-800 hover:bg-slate-900 rounded-xl py-4 font-semibold",
    shadow: "0 8px 40px rgba(0,0,0,0.25)",
  },
  masterclass: {
    title: "Masterclass Vídeo",
    price: "€67",
    ivaNote: "+ IVA",
    subPriceNote: POST_MASTERCLASS_MODE
      ? "Gravação completa da Masterclass ao vivo — 3 horas."
      : "3 horas intensivas com o Frederico.",
    showMasterclassDate: !POST_MASTERCLASS_MODE,
    benefits: [
      { text: POST_MASTERCLASS_MODE ? "Gravação completa 3h — acesso imediato" : "3 horas ao vivo com o Frederico" },
      { text: "Sistema completo de criação de vídeo com IA" },
      { text: "Prompts reutilizáveis para a tua empresa" },
      { text: "Gravação da Masterclass incluída" },
    ],
    ctaLabel: "Quero a Masterclass →",
    planLabel: "Masterclass Vídeo · €67 + IVA",
    stripeClass: "bg-violet-400",
    iconColor: "#8b5cf6",
    ctaClassName: "bg-violet-600 hover:bg-violet-700 rounded-xl py-4 font-semibold",
    shadow: "0 8px 40px rgba(0,0,0,0.25)",
  },
  bundle: {
    title: "Pack IA Completo",
    price: "€107",
    priceStrike: "€121",
    savingsBadge: "Poupas €14",
    ivaNote: "+ IVA",
    subPriceNote: "Tudo incluído num só pacote.",
    showMasterclassDate: !POST_MASTERCLASS_MODE,
    highlightBenefitIndex: POST_MASTERCLASS_MODE ? undefined : 3,
    exclusiveSection: POST_MASTERCLASS_MODE,
    benefits: [
      { text: "📹 Vídeo com IA", isSectionHeader: true },
      { text: "Sessão completa HD ~70 min, sem cortes" },
      { text: "Workbook + Guia GEMs para vídeo" },
      { text: POST_MASTERCLASS_MODE ? "Masterclass Vídeo com IA (gravação 3h)" : "3 horas ao vivo — Masterclass completa" },
      { text: "Gravação da Masterclass incluída" },
      { text: "🖼️ Imagens com IA (incluído)", isSectionHeader: true },
      { text: "Sessão HD 60 min — Imagens com IA" },
      { text: "PDF resumo Imagens com IA" },
      { text: "SOP Nano Banana Pro" },
      { text: "Biblioteca de prompts de imagem editáveis" },
      { text: "Guia passo-a-passo Nano Banana Pro" },
    ],
    ctaLabel: "Quero o Pack Completo →",
    planLabel: "Pack IA Completo · €107 + IVA",
    featured: true,
    stripeClass: "bg-gradient-to-r from-violet-600 to-purple-500",
    iconColor: "#8b5cf6",
    ctaClassName: "bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 rounded-xl py-4 font-bold text-lg",
    shadow: "0 16px 60px rgba(124,58,237,0.4)",
  },
};

const DESKTOP_ORDER: Plan[] = ["gravacao", "bundle", "masterclass"];
const MOBILE_ORDER: Plan[] = ["bundle", "gravacao", "masterclass"];

function ImmediateAccessBanner() {
  return (
    <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
      <Play className="w-4 h-4 text-emerald-600 shrink-0" />
      <span className="text-sm font-semibold text-emerald-700">Acesso imediato após a compra</span>
    </div>
  );
}

function MasterclassDateBox() {
  const isLive = new Date() >= MASTERCLASS_CUTOFF;

  if (isLive) return <ImmediateAccessBanner />;

  return (
    <div className="rounded-lg bg-violet-50 border border-violet-200 px-4 py-3">
      <p className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-violet-600" />
        Quinta-feira, 12 de Março
      </p>
      <p className="text-[13px] text-gray-500 ml-6">10h00 — 13h00 (Portugal)</p>
    </div>
  );
}

function PlanCard({ plan, onSelect, isMobile }: { plan: Plan; onSelect: () => void; isMobile: boolean }) {
  const cfg = PLANS[plan];
  const isFeatured = cfg.featured;

  return (
    <div
      className="relative flex flex-col flex-1 min-w-0 bg-white overflow-hidden"
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
            <span className="text-4xl md:text-5xl font-black text-gray-900">{cfg.price}</span>
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

          {cfg.immediateAccess && <ImmediateAccessBanner />}
          {cfg.showMasterclassDate && <MasterclassDateBox />}

          <ul className="space-y-2.5">
            {cfg.benefits.map((b, i) =>
              b.isSectionHeader ? (
                <li key={i} className="flex flex-col gap-1.5 pt-2">
                  {i > 0 && <Separator className="bg-gray-200 mb-1" />}
                  <span className="text-sm font-bold text-gray-800">{b.text}</span>
                </li>
              ) : cfg.highlightBenefitIndex === i ? (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-violet-50 border border-violet-100 rounded-lg px-3 py-1.5 -mx-1">
                  {getBenefitIcon(b.text, cfg.iconColor)}
                  <span className="font-semibold">{b.text}</span>
                </li>
              ) : (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  {getBenefitIcon(b.text, cfg.iconColor)}
                  <span>{b.text}</span>
                </li>
              )
            )}
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
      className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-12 pb-24"
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
          <div className="bg-white/10 backdrop-blur text-white border border-white/20 rounded-full px-3 md:px-4 py-1.5 text-[10px] md:text-xs text-center">
            <span className="hidden sm:inline">🎬 Sessão Prática · </span>
            <span className="sm:hidden">🎬 </span>Vídeo Profissional com IA
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
          <p className="text-[11px] text-white/30 mt-2 text-center">
            Já tens o pack de Imagens com IA?{" "}
            <a
              href="https://wa.me/351912345678?text=Ol%C3%A1%2C%20j%C3%A1%20tenho%20o%20pack%20de%20Imagens%20e%20gostaria%20de%20fazer%20upgrade%20com%20desconto."
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-white/50 hover:text-white/70 transition-colors"
            >
              Contacta-nos para upgrade com desconto
            </a>
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
