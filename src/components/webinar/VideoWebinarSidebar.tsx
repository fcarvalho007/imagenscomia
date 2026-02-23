import { Sparkles, Video, FileText, Headphones, CalendarDays, Instagram } from "lucide-react";
import { VIDEO_WEBINAR_CONFIG } from "./videoWebinarConfig";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";
import { useCountdown } from "@/hooks/useCountdown";

const OfferCard = ({
  title,
  price,
  benefits,
  dateLine,
  ctaLabel,
  onCtaClick,
  priceNote,
  accent = false,
  countdownSlot,
}: {
  title: string;
  price: string;
  benefits: { icon: React.ReactNode; text: string }[];
  dateLine?: string;
  ctaLabel: string;
  onCtaClick: () => void;
  priceNote: React.ReactNode;
  accent?: boolean;
  countdownSlot?: React.ReactNode;
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

    {countdownSlot && <div className="mb-3">{countdownSlot}</div>}

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

const MasterclassCountdown = () => {
  const countdown = useCountdown(VIDEO_WEBINAR_CONFIG.masterclassDate);

  if (countdown.isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 text-[12px] font-semibold px-2.5 py-1 rounded-full">
        A decorrer agora
      </span>
    );
  }

  return (
    <span className="text-[13px] font-medium text-blue-600">
      Começa em: {countdown.days}d {String(countdown.hours).padStart(2, "0")}h {String(countdown.minutes).padStart(2, "0")}m
    </span>
  );
};

export const VideoWebinarSidebar = () => {
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
          { icon: <Headphones className="w-4 h-4" />, text: "Sessão extra de Q&A em grupo (30 min) — 10 Mar, 14:30h" },
          { icon: <FileText className="w-4 h-4" />, text: "Lista das melhores ferramentas por objetivo (curadoria prática)" },
          { icon: <FileText className="w-4 h-4" />, text: "Manual de apoio ao conhecimento em vídeo (passo a passo)" },
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
        dateLine="12 de Março (quinta-feira) · 10h–13h · Online"
        ctaLabel="Garantir lugar na Masterclass"
        onCtaClick={() => open("premium")}
        countdownSlot={<MasterclassCountdown />}
        priceNote={
          <>
            <span className="block">Early bird: €47 + IVA</span>
            <span className="block">Depois: €97 + IVA</span>
          </>
        }
      />

      <div className="flex items-center justify-center gap-5 pt-1">
        <a
          href={VIDEO_WEBINAR_CONFIG.INSTAGRAM_URL}
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
