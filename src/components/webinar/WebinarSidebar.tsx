import { Sparkles, Video, FileText, Headphones, CalendarDays, Instagram } from "lucide-react";
import { WEBINAR_CONFIG } from "./webinarConfig";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

const OfferCard = ({
  title,
  price,
  benefits,
  dateLine,
  ctaLabel,
  onCtaClick,
  priceNote,
  accent = false,
}: {
  title: string;
  price: string;
  benefits: { icon: React.ReactNode; text: string }[];
  dateLine?: string;
  ctaLabel: string;
  onCtaClick: () => void;
  priceNote: React.ReactNode;
  accent?: boolean;
}) => (
  <div
    className={`rounded-xl border p-5 ${
      accent
        ? "border-blue-600/30 bg-gradient-to-b from-blue-50/80 to-white shadow-sm"
        : "border-border bg-white"
    }`}
  >
    <div className="flex items-baseline justify-between mb-3">
      <h3 className="font-heading font-bold text-[16px] text-ink-900">{title}</h3>
      <span className="font-heading font-bold text-[17px] text-ink-900 whitespace-nowrap">{price}</span>
    </div>

    <ul className="space-y-2 mb-4">
      {benefits.map((b, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="flex-shrink-0 mt-0.5 text-blue-600">{b.icon}</span>
          <span className="text-[14px] text-ink-700 leading-snug">{b.text}</span>
        </li>
      ))}
    </ul>

    {dateLine && (
      <p className="text-[13px] text-ink-400 mb-3 flex items-center gap-1.5">
        <CalendarDays className="w-3.5 h-3.5" />
        {dateLine}
      </p>
    )}

    <button
      onClick={onCtaClick}
      className="block w-full text-center font-heading font-semibold text-[15px] rounded-lg py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:ring-offset-2 bg-ink-900 text-white hover:bg-ink-700"
      aria-label={ctaLabel}
    >
      {ctaLabel}
    </button>

    <div className="text-[12px] text-ink-400 text-center mt-2">{priceNote}</div>
  </div>
);

export const WebinarSidebar = () => {
  const { open } = useRegistrationModal();

  return (
    <div className="lg:sticky lg:top-[72px] space-y-4">
      <p className="font-heading font-bold text-[14px] uppercase tracking-wider text-ink-400 mb-1">
        Upgrade ao conhecimento
      </p>

      <OfferCard
        title="Premium Pass"
        price="€15 + IVA"
        accent
        benefits={[
          { icon: <Video className="w-4 h-4" />, text: "Gravação HD (acesso contínuo)" },
          { icon: <Headphones className="w-4 h-4" />, text: "Sessão extra com Q&A exclusivo em grupo (30 min)" },
          { icon: <FileText className="w-4 h-4" />, text: "Guia completo de prompts (30+ páginas)" },
        ]}
        ctaLabel="Garantir Premium Pass"
        onCtaClick={() => open("premium")}
        priceNote={
          <>
            <span className="block">Early bird: €15 + IVA</span>
            <span className="block">Depois do webinar: €27 + IVA</span>
          </>
        }
      />

      <OfferCard
        title="Masterclass Imagem → Vídeo"
        price="€47 + IVA"
        benefits={[
          { icon: <Sparkles className="w-4 h-4" />, text: "Fluxo imagem → vídeo (clip utilizável)" },
          { icon: <Video className="w-4 h-4" />, text: "Ferramentas por objetivo (gratuitas e pagas)" },
          { icon: <FileText className="w-4 h-4" />, text: "Prompts para vídeo + gravação incluída" },
        ]}
        dateLine="5 de Março (quinta-feira) · Online · 3 horas"
        ctaLabel="Garantir lugar na Masterclass"
        onCtaClick={() => open("premium")}
        priceNote={
          <>
            <span className="block">Early bird: €47 + IVA</span>
            <span className="block">Depois: €97 + IVA</span>
          </>
        }
      />

      {/* Social row */}
      <div className="flex items-center justify-center gap-5 pt-1">
        <a
          href={WEBINAR_CONFIG.INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-400 hover:text-purple-600 transition-colors"
          aria-label="Instagram do Frederico"
        >
          <Instagram className="w-4 h-4 text-purple-500" />
          Instagram (bastidores e exemplos)
        </a>
      </div>

    </div>
  );
};
