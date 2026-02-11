import { Sparkles, Video, FileText, Headphones, CalendarDays, Instagram } from "lucide-react";
import { WEBINAR_CONFIG } from "./webinarConfig";

const OfferCard = ({
  title,
  price,
  benefits,
  dateLine,
  ctaLabel,
  ctaUrl,
  priceNote,
  accent = false,
}: {
  title: string;
  price: string;
  benefits: { icon: React.ReactNode; text: string }[];
  dateLine?: string;
  ctaLabel: string;
  ctaUrl: string;
  priceNote: string;
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

    <a
      href={ctaUrl}
      className={`block w-full text-center font-heading font-semibold text-[15px] rounded-lg py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:ring-offset-2 ${
        accent
          ? "bg-ink-900 text-white hover:bg-ink-700"
          : "bg-ink-900 text-white hover:bg-ink-700"
      }`}
      aria-label={ctaLabel}
    >
      {ctaLabel}
    </a>

    <p className="text-[12px] text-ink-400 text-center mt-2">{priceNote}</p>
  </div>
);

export const WebinarSidebar = () => (
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
        { icon: <Headphones className="w-4 h-4" />, text: "Q&A exclusivo (60 min)" },
        { icon: <FileText className="w-4 h-4" />, text: "Guia completo de prompts (30+ páginas)" },
      ]}
      ctaLabel="Garantir Premium Pass"
      ctaUrl={WEBINAR_CONFIG.PREMIUM_URL}
      priceNote="Early bird: €15 + IVA · Depois do webinar: €27 + IVA"
    />

    <OfferCard
      title="Masterclass Imagem → Vídeo"
      price="€47 + IVA"
      benefits={[
        { icon: <Sparkles className="w-4 h-4" />, text: "Fluxo para transformar imagem em vídeo utilizável" },
        { icon: <Video className="w-4 h-4" />, text: "Ferramentas certas (gratuitas e pagas) por objetivo" },
        { icon: <FileText className="w-4 h-4" />, text: "Guia de prompts para vídeo + gravação incluída" },
      ]}
      dateLine="5 de Março (quinta-feira) · Online · 3 horas"
      ctaLabel="Garantir lugar na Masterclass"
      ctaUrl={WEBINAR_CONFIG.MASTERCLASS_URL}
      priceNote="Early bird: €47 + IVA · Depois: €97 + IVA"
    />

    {/* Instagram */}
    <a
      href={WEBINAR_CONFIG.INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 text-[14px] font-medium text-ink-500 hover:text-ink-900 transition-colors py-2"
    >
      <Instagram className="w-4 h-4" />
      Instagram do Frederico
    </a>
  </div>
);
