// ─── Webinar Configuration ───────────────────────────────────────────
// Change these constants to reuse this template for future webinars.

export const WEBINAR_CONFIG = {
  title: "Cria Imagens Profissionais com IA",
  metaLine: "Quarta-feira, 18 de Fevereiro · 10h00 (Portugal)",
  summary: "De briefing a imagem publicável em minutos — com método e exemplos reais.",
  startDate: new Date("2026-02-18T10:00:00+00:00"), // Europe/Lisbon = UTC in Feb
  durationMinutes: 75,

  /** Set to true to force the live/embed state regardless of time */
  isLive: false,

  /**
   * Paste the full iframe embed code here when you have it.
   * Example: '<iframe src="https://youtube.com/embed/..." ...></iframe>'
   */
  EMBED_IFRAME_HTML: "",

  // ─── URLs (replace with real values) ───
  CALENDAR_URL: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Cria+Imagens+Profissionais+com+IA&dates=20260218T100000Z/20260218T111500Z&details=Webinar+gratuito+com+Frederico+Carvalho&location=Online",
  PREMIUM_URL: "/upgrade",
  MASTERCLASS_URL: "#",
  INSTAGRAM_URL: "https://instagram.com/fredericocarvalho",
} as const;
